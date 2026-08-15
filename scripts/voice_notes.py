"""
Weekly teacher voice-note capture.

Workflow:
  1. Speak freely — mention students by name in any order.
  2. Press Ctrl+C when done.
  3. The full recording is transcribed, then an LLM pass splits it into
     per-student notes and fuzzy-matches names against the class roster.
  4. You review the parsed notes, then confirm to save.

Usage:
    python scripts/voice_notes.py [--threshold 0.02] [--silence 1.5]
"""

import argparse
import datetime
import io
import json
import os
import queue
import sys
import wave
from pathlib import Path

import numpy as np
import sounddevice as sd
from google import genai
from google.genai import types

ROOT = Path(__file__).parent.parent
ROSTER_PATH = ROOT / "data" / "roster.json"
NOTES_PATH  = ROOT / "data" / "teacher_notes.json"
KEY_PATH    = ROOT / "api_key.env"

SAMPLE_RATE = 16000
CHANNELS    = 1
BLOCK_SIZE  = 512          # ~32 ms per block
MODEL       = "gemini-3.5-flash"


# ── helpers ──────────────────────────────────────────────────────────────────

def load_api_key() -> str:
    if KEY_PATH.exists():
        key = KEY_PATH.read_text().strip()
        if key:
            return key
    return os.environ.get("GOOGLE_API_KEY", "")


def week_of(date: datetime.date) -> str:
    """ISO date of the Monday that starts the week containing `date`."""
    return (date - datetime.timedelta(days=date.weekday())).isoformat()


def frames_to_wav(frames: list[np.ndarray]) -> bytes:
    audio = np.concatenate(frames, axis=0)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes((audio * 32767).astype(np.int16).tobytes())
    return buf.getvalue()


# ── step 1: record ────────────────────────────────────────────────────────────

def record(silence_threshold: float, silence_duration: float) -> list[np.ndarray]:
    """
    Record until Ctrl+C. VAD strips silent blocks so only speech frames are
    kept, keeping the WAV small for the Gemini inline-data limit.
    """
    silence_limit = int(silence_duration * SAMPLE_RATE / BLOCK_SIZE)
    min_speech    = int(0.3 * SAMPLE_RATE / BLOCK_SIZE)

    audio_q: queue.Queue[np.ndarray] = queue.Queue()
    all_frames: list[np.ndarray] = []
    utterance:  list[np.ndarray] = []
    silence_n  = 0
    in_speech  = False

    def callback(indata, frames, _time, _status):
        audio_q.put(indata.copy())

    print("Recording — speak your notes. Press Ctrl+C when done.\n")
    try:
        with sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS,
                            dtype="float32", blocksize=BLOCK_SIZE,
                            callback=callback):
            while True:
                try:
                    block = audio_q.get(timeout=0.1)
                except queue.Empty:
                    continue

                rms = float(np.sqrt(np.mean(block ** 2)))
                if rms >= silence_threshold:
                    if not in_speech:
                        in_speech = True
                        print("\r[●] recording ", end="", flush=True)
                    silence_n = 0
                    utterance.append(block)
                elif in_speech:
                    utterance.append(block)
                    silence_n += 1
                    if silence_n >= silence_limit:
                        if len(utterance) >= min_speech:
                            all_frames.extend(utterance)
                        utterance.clear()
                        silence_n = 0
                        in_speech = False
                        print("\r[○] listening  ", end="", flush=True)

    except KeyboardInterrupt:
        if utterance:
            all_frames.extend(utterance)
        print("\n")

    return all_frames


# ── step 2: transcribe ────────────────────────────────────────────────────────

def transcribe(client: genai.Client, wav_bytes: bytes) -> str:
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=wav_bytes, mime_type="audio/wav"),
            "Transcribe the speech verbatim. Return only the transcribed text.",
        ],
    )
    return response.text.strip()


# ── step 3: parse into per-student notes ─────────────────────────────────────

PARSE_PROMPT = """\
You are helping a teacher organize their weekly notes about students.

Class roster:
{roster}

Full transcript of the teacher's voice dump:
\"\"\"{transcript}\"\"\"

Task:
- Read the entire transcript and identify every student mentioned (by first name, last name, nickname, or any recognizable reference).
- Match each mention to the closest student on the roster using fuzzy/common-sense matching (e.g. "Jay" → Jaylen Brooks, "Sofia" → Sofia Ramirez).
- For each matched student, write a single clean note capturing what the teacher said about them. Preserve the teacher's meaning; do not add details not present in the transcript.
- If a student on the roster is not mentioned at all, omit them.
- If a name cannot be confidently matched to any roster student, skip it.

Return a JSON array and nothing else:
[
  {{"student_id": "S01", "note": "..."}},
  ...
]"""


def parse_notes(client: genai.Client, transcript: str, roster: list[dict]) -> list[dict]:
    roster_str = "\n".join(f"  {s['student_id']}: {s['name']}" for s in roster)
    prompt = PARSE_PROMPT.format(roster=roster_str, transcript=transcript)
    response = client.models.generate_content(model=MODEL, contents=[prompt])
    text = response.text.strip()
    # Strip markdown fences if model wraps output
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    return json.loads(text)


# ── step 4: save ──────────────────────────────────────────────────────────────

def save_notes(parsed: list[dict], date: datetime.date) -> None:
    data = json.loads(NOTES_PATH.read_text())
    week = week_of(date)
    date_str = date.isoformat()

    by_id = {s["student_id"]: s["entries"] for s in data["notes"]}

    for item in parsed:
        sid  = item["student_id"]
        entry = {"date": date_str, "week_of": week, "note": item["note"]}
        if sid in by_id:
            by_id[sid].append(entry)
        else:
            data["notes"].append({"student_id": sid, "entries": [entry]})
            by_id[sid] = data["notes"][-1]["entries"]

    NOTES_PATH.write_text(json.dumps(data, indent=2))


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Weekly teacher voice-note capture")
    parser.add_argument("--threshold", type=float, default=0.015,
                        help="RMS energy threshold for speech detection (default: 0.015)")
    parser.add_argument("--silence", type=float, default=1.5,
                        help="Seconds of silence before ending an utterance (default: 1.5)")
    args = parser.parse_args()

    api_key = load_api_key()
    if not api_key:
        print("Error: no API key found in api_key.env or GOOGLE_API_KEY.")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    roster = json.loads(ROSTER_PATH.read_text())["students"]

    print("=== Weekly Teacher Notes — Voice Capture ===")
    print(f"Roster : {', '.join(s['name'].split()[0] for s in roster)}")
    print(f"Model  : {MODEL}\n")

    # 1. Record
    frames = record(args.threshold, args.silence)
    if not frames:
        print("No speech detected. Exiting.")
        sys.exit(0)

    # 2. Transcribe
    print("Transcribing...")
    wav_bytes  = frames_to_wav(frames)
    transcript = transcribe(client, wav_bytes)
    print(f"\nTranscript:\n  {transcript}\n")

    # 3. Parse
    print("Parsing notes by student...")
    try:
        parsed = parse_notes(client, transcript, roster)
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error parsing LLM response: {e}")
        sys.exit(1)

    if not parsed:
        print("No students identified in the transcript. Nothing to save.")
        sys.exit(0)

    # 4. Review
    name_by_id = {s["student_id"]: s["name"] for s in roster}
    today = datetime.date.today()
    print(f"Week of {week_of(today)} — {len(parsed)} student(s) identified:\n")
    for item in parsed:
        name = name_by_id.get(item["student_id"], item["student_id"])
        print(f"  [{item['student_id']}] {name}")
        print(f"      {item['note']}\n")

    confirm = input("Save these notes to teacher_notes.json? [Y/n]: ").strip().lower()
    if confirm in ("", "y", "yes"):
        save_notes(parsed, today)
        print(f"Saved — {len(parsed)} note(s) added for week of {week_of(today)}.")
    else:
        print("Aborted. Nothing was saved.")


if __name__ == "__main__":
    main()
