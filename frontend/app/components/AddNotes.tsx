"use client";

import { useRef, useState } from "react";

const PROMPTS = [
  "Who surprised you today?",
  "Who is slipping?",
  "Any effort worth naming?",
  "Anyone seem off?",
] as const;

function MicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-7"
    >
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M5 11v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 19v2" />
    </svg>
  );
}

export function AddNotes() {
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function appendPrompt(prompt: string) {
    setNotes((current) => {
      const prefix = current.trim().length > 0 ? `${current.trimEnd()}\n\n` : "";
      return `${prefix}${prompt} `;
    });
    setSavedAt(null);
    textareaRef.current?.focus();
  }

  function saveNotes() {
    if (notes.trim().length === 0) return;
    setSavedAt(
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2 sm:w-32">
          <button
            type="button"
            disabled
            title="Voice notes coming soon"
            className="flex size-16 items-center justify-center rounded-full border border-dashed border-border bg-muted text-muted-foreground opacity-70"
          >
            <MicIcon />
            <span className="sr-only">Record a voice note</span>
          </button>
          <span className="text-center text-xs text-muted-foreground">
            Voice notes coming soon
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => appendPrompt(prompt)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {prompt}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="sr-only">Today&apos;s notes</span>
            <textarea
              ref={textareaRef}
              rows={5}
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setSavedAt(null);
              }}
              placeholder="Jonah worked alone again today. Amara led her lab group start to finish."
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
        </div>
      </div>
    </section>
  );
}
