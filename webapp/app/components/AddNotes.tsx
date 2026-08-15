"use client";

import { LoaderCircle, Mic, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PROMPTS } from "@/lib/prompts";
import { PromptRail } from "./PromptRail";
import { Waveform } from "./Waveform";

type Status = "idle" | "recording" | "processing" | "review";

type ParsedNote = {
  student_id: string;
  student_name: string;
  note: string;
};

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function AddNotes({ children }: { children?: ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState<ParsedNote[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuiet, setIsQuiet] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const wasQuietRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (status !== "recording") return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(
    () => () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  function handleQuietChange(quiet: boolean) {
    if (quiet === wasQuietRef.current) return;
    wasQuietRef.current = quiet;
    setIsQuiet(quiet);
    // Move on once they start talking again so the next pause offers a new question.
    if (!quiet) setPromptIndex((index) => (index + 1) % PROMPTS.length);
  }

  function preferredMimeType() {
    const options = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    return options.find((type) => MediaRecorder.isTypeSupported(type));
  }

  async function processRecording(blob: Blob) {
    if (blob.size === 0) {
      setError("No audio was captured. Check your microphone and try again.");
      setStatus("idle");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "audio",
        blob,
        blob.type.includes("mp4") ? "voice-note.m4a" : "voice-note.webm",
      );
      const response = await fetch("/api/voice-notes", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        transcript?: string;
        notes?: ParsedNote[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not process the recording");
      }

      setTranscript(result.transcript ?? "");
      setNotes(result.notes ?? []);
      setStatus("review");
    } catch (processingError) {
      setError(
        processingError instanceof Error
          ? processingError.message
          : "Could not process the recording",
      );
      setStatus("idle");
    }
  }

  async function startRecording() {
    setError(null);
    setElapsed(0);
    setSavedAt(null);
    setTranscript("");
    setNotes([]);
    setIsQuiet(false);
    setPromptIndex(0);
    wasQuietRef.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("Audio recording is not supported in this browser.");
      }
      const microphone = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const chunks: Blob[] = [];
      const mimeType = preferredMimeType();
      const recorder = new MediaRecorder(
        microphone,
        mimeType ? { mimeType } : undefined,
      );

      streamRef.current = microphone;
      mediaRecorderRef.current = recorder;
      setStream(microphone);
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const blob = new Blob(chunks, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        microphone.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setStream(null);
        void processRecording(blob);
      });
      recorder.start(250);
      setStatus("recording");
    } catch (recordingError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "Could not access the microphone",
      );
      setStatus("idle");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    setStatus("processing");
    recorder.stop();
  }

  async function saveNotes() {
    const notesToSave = notes.filter((item) => item.note.trim().length > 0);
    if (notesToSave.length === 0) return;
    setError(null);

    try {
      const response = await fetch("/api/voice-notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesToSave }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not save the notes");
      }
      setSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save notes",
      );
    }
  }

  function updateNote(studentId: string, note: string) {
    setNotes((current) =>
      current.map((item) =>
        item.student_id === studentId ? { ...item, note } : item,
      ),
    );
    setSavedAt(null);
  }

  function removeNote(studentId: string) {
    setNotes((current) =>
      current.filter((item) => item.student_id !== studentId),
    );
    setSavedAt(null);
  }

  if (status === "review") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-10">
        {children}

        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">
              Recording ({formatElapsed(elapsed)})
            </span>
            <button
              type="button"
              onClick={() => void startRecording()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic aria-hidden="true" className="size-3.5" strokeWidth={2} />
              Record again
            </button>
          </div>

          <details className="rounded-md border border-border bg-muted/40 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium">
              View transcript
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {transcript}
            </p>
          </details>

          {notes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {notes.map((item) => (
                <label
                  key={item.student_id}
                  className="flex flex-col gap-2 rounded-md border border-border p-4 text-sm"
                >
                  <span className="flex items-center justify-between gap-3 font-medium">
                    {item.student_name}
                    <button
                      type="button"
                      onClick={() => removeNote(item.student_id)}
                      aria-label={`Remove note for ${item.student_name}`}
                      className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </span>
                  <textarea
                    rows={3}
                    value={item.note}
                    onChange={(event) =>
                      updateNote(item.student_id, event.target.value)
                    }
                    className="resize-y rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-border p-4 text-sm text-muted-foreground">
              No students could be matched to the class roster. Record again and
              include each student&apos;s name.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void saveNotes()}
              disabled={
                notes.length === 0 ||
                notes.every((item) => item.note.trim().length === 0) ||
                savedAt !== null
              }
              className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Save notes
            </button>
            {savedAt ? (
              <span className="text-sm text-success">Saved at {savedAt}</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Nothing is sent to parents from here.
              </span>
            )}
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col justify-center gap-10">
        {children}

        <section className="flex flex-col items-center gap-4">
          <Waveform
            active={status === "recording"}
            stream={stream}
            onQuietChange={handleQuietChange}
          />

          {status === "idle" ? (
            <button
              type="button"
              onClick={() => void startRecording()}
              className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-primary px-10 py-5 text-lg font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Mic aria-hidden="true" className="size-6" strokeWidth={1.75} />
              Start recording
            </button>
          ) : status === "recording" ? (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-border bg-muted px-10 py-5 text-lg font-medium text-foreground shadow-sm transition-colors hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Square
                aria-hidden="true"
                className="size-5 fill-destructive text-destructive"
              />
              Stop recording
              <span className="tabular-nums text-muted-foreground">
                {formatElapsed(elapsed)}
              </span>
            </button>
          ) : (
            <div
              role="status"
              className="inline-flex items-center gap-3 rounded-full border border-border bg-muted px-10 py-5 text-lg font-medium text-foreground"
            >
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin text-primary"
              />
              Transcribing and organizing notes
            </div>
          )}

          {status === "recording" ? (
            <p className="text-sm text-muted-foreground">
              Listening. Take your time.
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </section>
      </div>

      <div className="pt-10">
        <PromptRail
          activeIndex={status === "recording" && isQuiet ? promptIndex : null}
        />
      </div>
    </>
  );
}
