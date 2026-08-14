"use client";

import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PROMPTS } from "@/lib/prompts";
import { PromptRail } from "./PromptRail";
import { Waveform } from "./Waveform";

type Status = "idle" | "recording" | "review";

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function AddNotes({ children }: { children?: ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isQuiet, setIsQuiet] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const wasQuietRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status !== "recording") return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  function handleQuietChange(quiet: boolean) {
    if (quiet === wasQuietRef.current) return;
    wasQuietRef.current = quiet;
    setIsQuiet(quiet);
    // Move on once they start talking again so the next pause offers a new question.
    if (!quiet) setPromptIndex((index) => (index + 1) % PROMPTS.length);
  }

  function startRecording() {
    setElapsed(0);
    setSavedAt(null);
    setIsQuiet(false);
    setPromptIndex(0);
    wasQuietRef.current = false;
    setStatus("recording");
  }

  function stopRecording() {
    setStatus("review");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function saveNotes() {
    if (notes.trim().length === 0) return;
    setSavedAt(
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    );
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
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic aria-hidden="true" className="size-3.5" strokeWidth={2} />
              Record again
            </button>
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="sr-only">Transcript</span>
            <textarea
              ref={textareaRef}
              rows={8}
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setSavedAt(null);
              }}
              placeholder="Your transcript will appear here. Edit anything that came out wrong."
              className="resize-y rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveNotes}
              disabled={notes.trim().length === 0}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            onQuietChange={handleQuietChange}
          />

          {status === "idle" ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-lg font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Mic aria-hidden="true" className="size-6" strokeWidth={1.75} />
              Start recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-3 rounded-full border border-border bg-muted px-10 py-5 text-lg font-medium text-foreground shadow-sm transition-colors hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
          )}

          {status === "recording" ? (
            <p className="text-sm text-muted-foreground">
              Listening. Take your time.
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
