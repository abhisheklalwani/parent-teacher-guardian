"use client";

import { useEffect, useRef, useState } from "react";
import type { CoverageEntry } from "@/lib/coverageStore";
import { getCoveredLessonsByUnit, type Unit } from "@/lib/syllabus";

type LoadState = "loading" | "loaded" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";
type SendState = "idle" | "sending" | "sent" | "error";

type GuardianSendResult = {
  studentId: string;
  studentName: string;
  guardianEmail: string;
  ok: boolean;
  error?: string;
};

type SendResponse = {
  entry: CoverageEntry;
  sent: number;
  total: number;
  results: GuardianSendResult[];
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatEntryDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortByDateDesc(entries: CoverageEntry[]): CoverageEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

export function SyllabusCoverage() {
  const [state, setState] = useState<LoadState>("loading");
  const [units, setUnits] = useState<Unit[]>([]);
  const [entries, setEntries] = useState<CoverageEntry[]>([]);
  const [date, setDate] = useState(todayIsoDate);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendResult, setSendResult] = useState<SendResponse | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/syllabus");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: { units: Unit[]; entries: CoverageEntry[] } = await res.json();
        if (cancelled) return;
        setUnits(data.units);
        setEntries(sortByDateDesc(data.entries));
        setState("loaded");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleLesson(lessonId: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  }

  function upsertLocalEntry(entry: CoverageEntry) {
    setEntries((current) => sortByDateDesc([...current.filter((e) => e.date !== entry.date), entry]));
  }

  function loadEntry(entry: CoverageEntry) {
    setDate(entry.date);
    setEditingDate(entry.date);
    setChecked(new Set(entry.coveredLessonIds));
    setNotes(entry.notes ?? "");
    setSaveState("idle");
    setSendState("idle");
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startNewUpdate() {
    setDate(todayIsoDate());
    setEditingDate(null);
    setChecked(new Set());
    setNotes("");
    setSaveState("idle");
    setSendState("idle");
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);

    try {
      const res = await fetch("/api/syllabus/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          coveredLessonIds: [...checked],
          notes: notes.trim() || undefined,
        }),
      });

      const data: { entry: CoverageEntry } | { error: string } = await res.json();
      if (!res.ok || !("entry" in data)) {
        throw new Error("error" in data ? data.error : `Request failed: ${res.status}`);
      }

      upsertLocalEntry(data.entry);
      setSaveState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown error");
      setSaveState("error");
    }
  }

  async function handleSend() {
    setSendState("sending");
    setSendError(null);

    try {
      const res = await fetch("/api/syllabus/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          coveredLessonIds: [...checked],
          notes: notes.trim() || undefined,
        }),
      });

      const data: SendResponse | { error: string } = await res.json();
      if (!res.ok || !("results" in data)) {
        throw new Error("error" in data ? data.error : `Request failed: ${res.status}`);
      }

      upsertLocalEntry(data.entry);
      setSendResult(data);
      setSendState("sent");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Unknown error");
      setSendState("error");
    }
  }

  const totalLessons = units.reduce((count, unit) => count + unit.lessons.length, 0);
  const failedResults = sendResult?.results.filter((r) => !r.ok) ?? [];
  const canAct = checked.size > 0;

  return (
    <section className="flex flex-col gap-6">
      {state === "loading" && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-medium text-destructive">Could not load the syllabus</p>
          <p className="mt-1 text-muted-foreground">Refresh the page to try again.</p>
        </div>
      )}

      {state === "loaded" && (
        <>
          <div ref={formTopRef} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setEditingDate(null);
                }}
                className="w-44 rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            {editingDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Editing {formatEntryDate(editingDate)}</span>
                <button
                  type="button"
                  onClick={startNewUpdate}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  New update
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {checked.size} of {totalLessons} lessons checked
          </p>

          <div className="flex flex-col gap-4">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <h2 className="text-sm font-semibold text-foreground">{unit.title}</h2>
                <div className="flex flex-col gap-1">
                  {unit.lessons.map((lesson) => (
                    <label
                      key={lesson.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={checked.has(lesson.id)}
                        onChange={() => toggleLesson(lesson.id)}
                        className="size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      {lesson.title}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Notes for families (optional)</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything else parents should know about this week?"
              className="resize-y rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canAct || saveState === "saving"}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {saveState === "saving" ? "Saving…" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!canAct || sendState === "sending"}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {sendState === "sending" ? "Sending…" : "Send status to all students"}
            </button>

            {sendState === "sent" && sendResult ? (
              <span className="text-sm text-success">
                Sent to {sendResult.sent} of {sendResult.total} guardians
              </span>
            ) : saveState === "saved" ? (
              <span className="text-sm text-success">Saved for {formatEntryDate(date)}</span>
            ) : sendState === "idle" && saveState === "idle" ? (
              <span className="text-sm text-muted-foreground">
                Nothing is sent to parents until you click send.
              </span>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            Demo mode: sends go to one guardian only, to stay under Resend&apos;s free-tier daily limit.
          </p>

          {saveState === "error" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
              <p className="font-medium text-destructive">Could not save</p>
              <p className="mt-1 text-muted-foreground">{saveError}</p>
            </div>
          )}

          {sendState === "sent" && failedResults.length > 0 && (
            <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Follow up with these guardians manually:</p>
              <ul className="mt-1 list-inside list-disc">
                {failedResults.map((r) => (
                  <li key={r.studentId}>
                    {r.studentName} ({r.guardianEmail})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sendState === "error" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
              <p className="font-medium text-destructive">Could not send status</p>
              <p className="mt-1 text-muted-foreground">{sendError}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Weekly updates</h2>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved updates yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {entries.map((entry) => {
                  const unitGroups = getCoveredLessonsByUnit(units, entry.coveredLessonIds);

                  return (
                    <div
                      key={entry.date}
                      className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="font-medium text-foreground">{formatEntryDate(entry.date)}</span>
                        <div className="flex flex-col gap-1 text-muted-foreground">
                          {unitGroups.map((group) => (
                            <div key={group.unitTitle}>
                              <span className="font-medium text-foreground/80">{group.unitTitle}</span>
                              <ul className="list-inside list-disc">
                                {group.lessonTitles.map((title) => (
                                  <li key={title}>{title}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        {entry.notes && (
                          <span className="text-muted-foreground">Notes: {entry.notes}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => loadEntry(entry)}
                        className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Edit
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
