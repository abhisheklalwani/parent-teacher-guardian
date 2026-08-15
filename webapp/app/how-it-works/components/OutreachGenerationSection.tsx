"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { OutreachType, Suggestion } from "@/lib/suggestions";

type SkippedStudent = {
  student_id: string;
  student_name: string;
  reason_skipped: string;
};

type Props = {
  promptText: string;
  teacher: string;
};

const TYPE_META: Record<OutreachType, { label: string; className: string }> = {
  positive: {
    label: "Positive noticing",
    className: "bg-success/15 text-success",
  },
  intervention: {
    label: "Intervention needed",
    className: "bg-destructive/15 text-destructive",
  },
  change: {
    label: "Something changed",
    className: "bg-accent/20 text-accent-foreground",
  },
};

const PROMPT_RULES = [
  {
    title: "What it receives",
    body: "One JSON snapshot per student: overall grade and letter, every assignment score, missing work counts, excused and unexcused absences, tardies, and that student's teacher notes. Class name, period, and the reporting period window get templated into the instructions.",
  },
  {
    title: "Three message types",
    body: "Every draft has to be Positive noticing (name one concrete win, no ask), Intervention needed (direct but non-alarming, ends with one thing to try at home), or Something changed (a delta from that student's own baseline, explicitly invites a reply).",
  },
  {
    title: "Selection rules",
    body: "Pick 3 to 5 students, not the whole class. About half the batch has to be Positive noticing so concern messages cannot dominate. Steady performers with no notable event this week are skipped, with a one-line reason recorded for each.",
  },
  {
    title: "Privacy pre-flight",
    body: "Before drafting, the model classifies every sentence of a teacher note as academic, emotional, or circumstantial. Only academic sentences can be used as source material. Emotional and circumstantial content is discarded, not softened or paraphrased, and cannot influence the tone.",
  },
  {
    title: "Output contract",
    body: "A single JSON object with students_to_contact (message type, contact reason, subject, body) and students_not_contacted, so the result renders as cards instead of a wall of prose.",
  },
];

export function OutreachGenerationSection({ promptText, teacher }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">(
    "idle",
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [skipped, setSkipped] = useState<SkippedStudent[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setState("loading");
    setError(null);

    try {
      const res = await fetch("/api/suggestions?refresh=1");
      const data: {
        suggestions?: Suggestion[];
        students_not_contacted?: SkippedStudent[];
        generated_at?: string;
        error?: string;
      } = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      setSuggestions(data.suggestions ?? []);
      setSkipped(data.students_not_contacted ?? []);
      setGeneratedAt(data.generated_at ?? null);
      setState("loaded");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed");
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted-foreground">
        The synced records and the structured teacher notes are merged into one
        snapshot per student, then handed to a single prompt that decides who is
        worth a message this week and drafts it in {teacher}&apos;s voice.
        Nothing sends without the teacher&apos;s approval.
      </p>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-foreground">
          How the prompt works
        </h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          {PROMPT_RULES.map((rule) => (
            <div
              key={rule.title}
              className="flex flex-col gap-1.5 rounded-md border border-border bg-card/80 px-4 py-3.5"
            >
              <dt className="text-sm font-semibold text-foreground">
                {rule.title}
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground">
                {rule.body}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={showPrompt}
            onClick={() => setShowPrompt((value) => !value)}
            className="w-fit cursor-pointer text-sm text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {showPrompt ? "Hide the full prompt" : "View the full prompt"}
          </button>
          {showPrompt && (
            <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
              {promptText}
            </pre>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => void generate()}
            disabled={state === "loading"}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Sparkles aria-hidden="true" className="size-4" strokeWidth={2} />
            {state === "loading" ? "Generating…" : "Generate"}
          </button>
          <p className="text-sm text-muted-foreground">
            {state === "loading"
              ? "Running the prompt against this week's data. This takes about 30 seconds."
              : "Runs the prompt live and replaces the batch on the Outreach page."}
          </p>
        </div>

        {state === "error" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
            <p className="font-medium text-destructive">
              Could not generate messages
            </p>
            <p className="mt-1 text-muted-foreground">{error}</p>
          </div>
        )}

        {state === "loading" && (
          <div className="grid gap-3 md:grid-cols-2">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="flex flex-col gap-3 rounded-md border border-border bg-card/80 p-4"
              >
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {state === "loaded" && (
          <div className="flex flex-col gap-4">
            {generatedAt && (
              <p className="text-xs text-muted-foreground">
                Generated {new Date(generatedAt).toLocaleString()} ·{" "}
                {suggestions.length} of {suggestions.length + skipped.length}{" "}
                students selected
              </p>
            )}

            {suggestions.length === 0 ? (
              <p className="rounded-md border border-border bg-card/80 px-4 py-4 text-sm text-muted-foreground">
                No students were flagged for outreach this week.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {suggestions.map((suggestion) => {
                  const meta = TYPE_META[suggestion.type];
                  return (
                    <article
                      key={suggestion.id}
                      className="flex flex-col gap-3 rounded-md border border-border bg-card/80 p-4"
                    >
                      <header className="flex items-start justify-between gap-3">
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {suggestion.studentName}
                        </h4>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </header>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {suggestion.subject}
                      </p>
                      <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                        {suggestion.draft}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}

            {skipped.length > 0 && (
              <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-4 py-3.5">
                <h4 className="text-sm font-semibold text-foreground">
                  Not contacted this week
                </h4>
                <ul className="flex list-none flex-col gap-1.5">
                  {skipped.map((student) => (
                    <li
                      key={student.student_id}
                      className="text-sm text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        {student.student_name}
                      </span>
                      {": "}
                      {student.reason_skipped}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
