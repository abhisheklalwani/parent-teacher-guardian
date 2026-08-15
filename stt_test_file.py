"""
Speech-to-text via Gemini API with live microphone input.

Usage:
    export GOOGLE_API_KEY=your_key_here
    python stt_test_file.py

Optional flags:
    --threshold 0.02     RMS energy threshold to detect speech (default: 0.015)
    --silence 1.5        Seconds of silence before ending an utterance (default: 1.5)
    --model gemini-2.0-flash  Gemini model to use
"""

import os
import sys
import io
import wave
import queue
import argparse
import numpy as np
import sounddevice as sd
from google import genai
from google.genai import types

SAMPLE_RATE = 16000
CHANNELS = 1
BLOCK_SIZE = 512  # ~32ms per block for responsive VAD


def audio_to_wav_bytes(frames: list[np.ndarray], sample_rate: int) -> bytes:
    audio = np.concatenate(frames, axis=0)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit PCM
        wf.setframerate(sample_rate)
        wf.writeframes((audio * 32767).astype(np.int16).tobytes())
    return buf.getvalue()


def transcribe(client: genai.Client, audio_bytes: bytes, model: str) -> str:
    response = client.models.generate_content(
        model=model,
        contents=[
            types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav"),
            "Transcribe the speech in this audio accurately. Return only the transcribed text with no additional commentary.",
        ],
    )
    return response.text.strip()


def main():
    parser = argparse.ArgumentParser(description="Live microphone STT via Gemini")
    parser.add_argument("--threshold", type=float, default=0.015,
                        help="RMS energy threshold to detect speech (default: 0.015)")
    parser.add_argument("--silence", type=float, default=1.5,
                        help="Seconds of silence to end an utterance (default: 1.5)")
    parser.add_argument("--min-speech", type=float, default=0.3,
                        help="Minimum speech duration in seconds to send (default: 0.3)")
    parser.add_argument("--model", default="gemini-3.5-flash",
                        help="Gemini model to use (default: gemini-3.5-flash)")
    args = parser.parse_args()

    key_file = os.path.join(os.path.dirname(__file__), "api_key.env")
    api_key = None
    if os.path.exists(key_file):
        with open(key_file) as f:
            api_key = f.read().strip()
    if not api_key:
        api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("Error: no API key found in api_key.env or GOOGLE_API_KEY env var.")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    silence_limit_blocks = int(args.silence * SAMPLE_RATE / BLOCK_SIZE)
    min_speech_blocks = int(args.min_speech * SAMPLE_RATE / BLOCK_SIZE)

    audio_q: queue.Queue[np.ndarray] = queue.Queue()

    def callback(indata, frames, time_info, status):
        audio_q.put(indata.copy())

    speech_frames: list[np.ndarray] = []
    silence_count = 0
    in_speech = False

    print(f"Model : {args.model}")
    print(f"Threshold : {args.threshold} RMS | Silence : {args.silence}s")
    print("Listening... (Ctrl+C to stop)\n")

    try:
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="float32",
            blocksize=BLOCK_SIZE,
            callback=callback,
        ):
            while True:
                try:
                    block = audio_q.get(timeout=0.1)
                except queue.Empty:
                    continue

                rms = float(np.sqrt(np.mean(block**2)))
                is_speech = rms >= args.threshold

                if is_speech:
                    if not in_speech:
                        in_speech = True
                        print("\r[Recording...]   ", end="", flush=True)
                    silence_count = 0
                    speech_frames.append(block)

                elif in_speech:
                    speech_frames.append(block)
                    silence_count += 1

                    if silence_count >= silence_limit_blocks:
                        if len(speech_frames) >= min_speech_blocks:
                            print("\r[Transcribing...]", end="", flush=True)
                            wav_bytes = audio_to_wav_bytes(speech_frames, SAMPLE_RATE)
                            try:
                                text = transcribe(client, wav_bytes, args.model)
                                print(f"\r> {text}                    ")
                            except Exception as e:
                                print(f"\r[Transcription error: {e}]")

                        speech_frames = []
                        silence_count = 0
                        in_speech = False
                        print("\rListening...     ", end="", flush=True)

    except KeyboardInterrupt:
        print("\n\nStopped.")


if __name__ == "__main__":
    main()
