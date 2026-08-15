"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { UpcomingAssessment, WeeklyAssignment } from "@/lib/homework";
import type { HomeworkWeekEntry } from "@/lib/homeworkStore";
import { postSend, SendFeedback, type SendResponse, type SendState } from "./SendFeedback";

type LoadState = "loading" | "loaded" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";
type WeeklySendResponse = SendResponse & { entry: HomeworkWeekEntry };

const inputClasses =
  "rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textareaClasses = `resize-y ${inputClasses}`;
const labelClasses = "flex flex-col gap-1.5 text-sm";
const cardClasses = "flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm";
const removeRowButtonClasses =
  "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const addRowButtonClasses =
  "inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const sendButtonClasses =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const saveButtonClasses =
  "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatWeekOf(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortByWeekOfDesc(entries: HomeworkWeekEntry[]): HomeworkWeekEntry[] {
  return [...entries].sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

export function HomeworkUpdates() {
  const [state, setState] = useState<LoadState>("loading");
  const [entries, setEntries] = useState<HomeworkWeekEntry[]>([]);
  const [weekOf, setWeekOf] = useState(todayIsoDate);
  const [editingWeekOf, setEditingWeekOf] = useState<string | null>(null);
  const [learningPlan, setLearningPlan] = useState("");
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeeklyAssignment[]>([
    { day: "", title: "", dueDate: "", instructions: "" },
  ]);
  const [upcomingAssessments, setUpcomingAssessments] = useState<UpcomingAssessment[]>([
    { title: "", date: "" },
  ]);
  const [practiceAreas, setPracticeAreas] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [resources, setResources] = useState("");
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
        const res = await fetch("/api/homework/weekly");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: {
          fixture: { weekOf: string; assignments: WeeklyAssignment[] } | null;
          entries: HomeworkWeekEntry[];
        } = await res.json();
        if (cancelled) return;

        setEntries(sortByWeekOfDesc(data.entries));
        if (data.fixture && data.fixture.assignments.length > 0) {
          setWeekOf(data.fixture.weekOf);
          setWeeklyAssignments(data.fixture.assignments);
        }
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

  function updateWeeklyAssignment(index: number, field: keyof WeeklyAssignment, value: string) {
    setWeeklyAssignments((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function addWeeklyAssignmentRow() {
    setWeeklyAssignments((rows) => [...rows, { day: "", title: "", dueDate: "", instructions: "" }]);
  }

  function removeWeeklyAssignmentRow(index: number) {
    setWeeklyAssignments((rows) => rows.filter((_, i) => i !== index));
  }

  function updateAssessment(index: number, field: keyof UpcomingAssessment, value: string) {
    setUpcomingAssessments((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function addAssessmentRow() {
    setUpcomingAssessments((rows) => [...rows, { title: "", date: "" }]);
  }

  function removeAssessmentRow(index: number) {
    setUpcomingAssessments((rows) => rows.filter((_, i) => i !== index));
  }

  function upsertLocalEntry(entry: HomeworkWeekEntry) {
    setEntries((current) => sortByWeekOfDesc([...current.filter((e) => e.weekOf !== entry.weekOf), entry]));
  }

  function loadEntry(entry: HomeworkWeekEntry) {
    setWeekOf(entry.weekOf);
    setEditingWeekOf(entry.weekOf);
    setLearningPlan(entry.learningPlan);
    setWeeklyAssignments(
      entry.weeklyAssignments.length > 0
        ? entry.weeklyAssignments
        : [{ day: "", title: "", dueDate: "", instructions: "" }],
    );
    setUpcomingAssessments(
      entry.upcomingAssessments.length > 0 ? entry.upcomingAssessments : [{ title: "", date: "" }],
    );
    setPracticeAreas(entry.practiceAreas ?? "");
    setProgressNote(entry.progressNote ?? "");
    setResources(entry.resources ?? "");
    setSaveState("idle");
    setSendState("idle");
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startNewUpdate() {
    setWeekOf(todayIsoDate());
    setEditingWeekOf(null);
    setLearningPlan("");
    setWeeklyAssignments([{ day: "", title: "", dueDate: "", instructions: "" }]);
    setUpcomingAssessments([{ title: "", date: "" }]);
    setPracticeAreas("");
    setProgressNote("");
    setResources("");
    setSaveState("idle");
    setSendState("idle");
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const validWeeklyAssignments = weeklyAssignments.filter(
    (row) => row.day.trim().length > 0 && row.title.trim().length > 0 && row.dueDate.trim().length > 0,
  );
  const validAssessments = upcomingAssessments.filter(
    (row) => row.title.trim().length > 0 && row.date.trim().length > 0,
  );
  const canAct = learningPlan.trim().length > 0;

  function buildBody() {
    return {
      weekOf,
      learningPlan: learningPlan.trim(),
      weeklyAssignments: validWeeklyAssignments,
      upcomingAssessments: validAssessments,
      practiceAreas: practiceAreas.trim() || undefined,
      progressNote: progressNote.trim() || undefined,
      resources: resources.trim() || undefined,
    };
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);

    try {
      const res = await fetch("/api/homework/weekly/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const data: { entry: HomeworkWeekEntry } | { error: string } = await res.json();
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
      const data = (await postSend("/api/homework/weekly/send", buildBody())) as WeeklySendResponse;
      upsertLocalEntry(data.entry);
      setSendResult(data);
      setSendState("sent");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Unknown error");
      setSendState("error");
    }
  }

  return (
    <div className={cardClasses}>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">This week&apos;s homework</h2>
        <p className="text-sm text-muted-foreground">
          Save it to build history, or send it directly to families.
        </p>
      </div>

      {state === "loading" && (
        <div className="flex flex-col gap-2">
          <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
        </div>
      )}

      {state === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-medium text-destructive">Could not load this week&apos;s homework</p>
          <p className="mt-1 text-muted-foreground">Refresh the page to try again.</p>
        </div>
      )}

      {state === "loaded" && (
        <>
          <div ref={formTopRef} className="flex flex-wrap items-end gap-3">
            <label className={labelClasses}>
              <span className="font-medium text-foreground">Week of</span>
              <input
                type="date"
                value={weekOf}
                onChange={(e) => {
                  setWeekOf(e.target.value);
                  setEditingWeekOf(null);
                }}
                className={`w-44 ${inputClasses}`}
              />
            </label>

            {editingWeekOf && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Editing week of {formatWeekOf(editingWeekOf)}</span>
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

          <label className={labelClasses}>
            <span className="font-medium text-foreground">Weekly learning plan / newsletter</span>
            <textarea
              rows={4}
              value={learningPlan}
              onChange={(e) => setLearningPlan(e.target.value)}
              placeholder="What the class is working on this week"
              className={textareaClasses}
            />
          </label>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">This week&apos;s assignments</span>
            {weeklyAssignments.map((assignment, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-md border border-border p-3">
                <div className="flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={assignment.day}
                      onChange={(e) => updateWeeklyAssignment(index, "day", e.target.value)}
                      placeholder="Day (e.g. Monday)"
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      value={assignment.title}
                      onChange={(e) => updateWeeklyAssignment(index, "title", e.target.value)}
                      placeholder="Assignment title"
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      value={assignment.dueDate}
                      onChange={(e) => updateWeeklyAssignment(index, "dueDate", e.target.value)}
                      placeholder="Due date"
                      className={inputClasses}
                    />
                  </div>
                  {weeklyAssignments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWeeklyAssignmentRow(index)}
                      aria-label="Remove assignment"
                      className={removeRowButtonClasses}
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={assignment.instructions ?? ""}
                  onChange={(e) => updateWeeklyAssignment(index, "instructions", e.target.value)}
                  placeholder="Instructions (optional)"
                  className={inputClasses}
                />
              </div>
            ))}
            <button type="button" onClick={addWeeklyAssignmentRow} className={addRowButtonClasses}>
              <Plus className="size-3.5" />
              Add assignment
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">
              Upcoming quizzes, tests, and projects
            </span>
            {upcomingAssessments.map((assessment, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={assessment.title}
                    onChange={(e) => updateAssessment(index, "title", e.target.value)}
                    placeholder="e.g. Unit 3 Test"
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    value={assessment.date}
                    onChange={(e) => updateAssessment(index, "date", e.target.value)}
                    placeholder="Date"
                    className={inputClasses}
                  />
                </div>
                {upcomingAssessments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAssessmentRow(index)}
                    aria-label="Remove upcoming assessment"
                    className={removeRowButtonClasses}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addAssessmentRow} className={addRowButtonClasses}>
              <Plus className="size-3.5" />
              Add upcoming assessment
            </button>
          </div>

          <label className={labelClasses}>
            <span className="font-medium text-foreground">Where extra practice would help (optional)</span>
            <textarea
              rows={2}
              value={practiceAreas}
              onChange={(e) => setPracticeAreas(e.target.value)}
              placeholder="Skills the class could use more practice on"
              className={textareaClasses}
            />
          </label>

          <label className={labelClasses}>
            <span className="font-medium text-foreground">Progress update (optional)</span>
            <textarea
              rows={2}
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="Note if assignments are frequently missing"
              className={textareaClasses}
            />
          </label>

          <label className={labelClasses}>
            <span className="font-medium text-foreground">Recommended resources (optional)</span>
            <textarea
              rows={2}
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="Links or tips for practicing at home"
              className={textareaClasses}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleSave} disabled={!canAct || saveState === "saving"} className={saveButtonClasses}>
              {saveState === "saving" ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={handleSend} disabled={!canAct || sendState === "sending"} className={sendButtonClasses}>
              {sendState === "sending" ? "Sending…" : "Send this week's homework"}
            </button>

            {saveState === "saved" && (
              <span className="text-sm text-success">Saved for week of {formatWeekOf(weekOf)}</span>
            )}
          </div>

          {saveState === "error" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
              <p className="font-medium text-destructive">Could not save</p>
              <p className="mt-1 text-muted-foreground">{saveError}</p>
            </div>
          )}

          <SendFeedback sendState={sendState} sendResult={sendResult} sendError={sendError} />

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4">
            <h3 className="text-sm font-semibold text-foreground">Saved weeks</h3>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved weeks yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <div
                    key={entry.weekOf}
                    className="flex items-start justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">Week of {formatWeekOf(entry.weekOf)}</span>
                        <span className="text-muted-foreground">
                          {entry.learningPlan || "(no learning plan)"}
                        </span>
                      </div>

                      {entry.weeklyAssignments.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground/80">Assignments</span>
                          <ul className="list-inside list-disc text-muted-foreground">
                            {entry.weeklyAssignments.map((assignment, i) => (
                              <li key={i}>
                                {assignment.day}: {assignment.title} (due {assignment.dueDate})
                                {assignment.instructions ? ` — ${assignment.instructions}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.upcomingAssessments.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground/80">
                            Upcoming quizzes, tests, and projects
                          </span>
                          <ul className="list-inside list-disc text-muted-foreground">
                            {entry.upcomingAssessments.map((assessment, i) => (
                              <li key={i}>
                                {assessment.title} ({assessment.date})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.practiceAreas && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground/80">Practice areas: </span>
                          {entry.practiceAreas}
                        </p>
                      )}

                      {entry.progressNote && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground/80">Progress update: </span>
                          {entry.progressNote}
                        </p>
                      )}

                      {entry.resources && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground/80">Resources: </span>
                          {entry.resources}
                        </p>
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
