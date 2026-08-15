"use client";

import { useEffect, useState } from "react";
import type { CoverageEntry } from "@/lib/coverageStore";
import { formatCoverageSummary, SYLLABUS_UNITS } from "@/lib/syllabus";
import { formatWeeklyHomeworkSummary, type NewsletterReminders } from "@/lib/homework";
import type { HomeworkWeekEntry } from "@/lib/homeworkStore";
import { postSend, SendFeedback, type SendResponse, type SendState } from "./SendFeedback";

const inputClasses =
  "rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textareaClasses = `resize-y ${inputClasses}`;
const labelClasses = "flex flex-col gap-1.5 text-sm";
const sendButtonClasses =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const REMINDER_FIELDS: {
  key: keyof NewsletterReminders;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "officeHours",
    label: "Office Hours & Extra Help",
    placeholder: "e.g. I'm available Tuesdays and Thursdays after school in Room 214.",
  },
  {
    key: "gradedWork",
    label: "Graded Work & Portal Access",
    placeholder: "e.g. Graded quizzes are returned within a week and posted to the gradebook portal.",
  },
  {
    key: "beginningOfYearAssessments",
    label: "Beginning-of-Year Diagnostic Assessments",
    placeholder: "e.g. This week students took a diagnostic quiz to help tailor instruction.",
  },
  {
    key: "upcomingEvents",
    label: "Upcoming Events",
    placeholder: "e.g. Back-to-School Night is Thursday, September 3rd — details to come.",
  },
  {
    key: "classroomSupplies",
    label: "Classroom Supplies",
    placeholder: "e.g. Please make sure your student has a graphing calculator and a dedicated notebook.",
  },
  {
    key: "volunteerOpportunities",
    label: "Volunteer Opportunities",
    placeholder: "e.g. Reply directly to me if you're interested in helping proctor an upcoming exam.",
  },
];

export function NewsletterComposer() {
  const [coverageEntries, setCoverageEntries] = useState<CoverageEntry[]>([]);
  const [homeworkEntries, setHomeworkEntries] = useState<HomeworkWeekEntry[]>([]);

  const [greeting, setGreeting] = useState("");
  const [selectedCoverageDate, setSelectedCoverageDate] = useState("");
  const [classworkUpdate, setClassworkUpdate] = useState("");
  const [selectedHomeworkWeek, setSelectedHomeworkWeek] = useState("");
  const [homeworkUpdate, setHomeworkUpdate] = useState("");
  const [reminders, setReminders] = useState<NewsletterReminders>({});
  const [closing, setClosing] = useState("");

  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendResult, setSendResult] = useState<SendResponse | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [syllabusRes, homeworkRes] = await Promise.all([
          fetch("/api/syllabus"),
          fetch("/api/homework/weekly"),
        ]);
        if (cancelled) return;

        if (syllabusRes.ok) {
          const data: { entries: CoverageEntry[] } = await syllabusRes.json();
          if (!cancelled) setCoverageEntries(data.entries);
        }
        if (homeworkRes.ok) {
          const data: { entries: HomeworkWeekEntry[] } = await homeworkRes.json();
          if (!cancelled) setHomeworkEntries(data.entries);
        }
      } catch {
        // Pickers just stay empty if this fails; the composer still works with manual text.
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateReminder(key: keyof NewsletterReminders, value: string) {
    setReminders((current) => ({ ...current, [key]: value }));
  }

  function handleSelectCoverage(date: string) {
    setSelectedCoverageDate(date);
    const entry = coverageEntries.find((e) => e.date === date);
    if (!entry) return;
    setClassworkUpdate(formatCoverageSummary(SYLLABUS_UNITS, entry.coveredLessonIds, entry.notes));
  }

  function handleSelectHomework(weekOf: string) {
    setSelectedHomeworkWeek(weekOf);
    const entry = homeworkEntries.find((e) => e.weekOf === weekOf);
    if (!entry) return;
    setHomeworkUpdate(formatWeeklyHomeworkSummary(entry));
  }

  const canSend = greeting.trim().length > 0 && sendState !== "sending";

  async function handleSend() {
    setSendState("sending");
    setSendError(null);

    try {
      const data = await postSend("/api/homework/newsletter/send", {
        greeting: greeting.trim(),
        classworkUpdate: classworkUpdate.trim() || undefined,
        homeworkUpdate: homeworkUpdate.trim() || undefined,
        reminders,
        closing: closing.trim() || undefined,
      });
      setSendResult(data);
      setSendState("sent");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Unknown error");
      setSendState("error");
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <label className={labelClasses}>
        <span className="font-medium text-foreground">Greeting (required)</span>
        <textarea
          rows={3}
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          placeholder="Dear Algebra II Families, thank you for a great week in class!"
          className={textareaClasses}
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm text-foreground">Classwork update</span>
        <select
          value={selectedCoverageDate}
          onChange={(e) => handleSelectCoverage(e.target.value)}
          className={inputClasses}
        >
          <option value="">Pull from a saved week on This Week&apos;s Coverage…</option>
          {coverageEntries.map((entry) => (
            <option key={entry.date} value={entry.date}>
              {formatDate(entry.date)}
            </option>
          ))}
        </select>
        <textarea
          rows={4}
          value={classworkUpdate}
          onChange={(e) => setClassworkUpdate(e.target.value)}
          placeholder="What the class covered this week (or pull it from a saved week above)"
          className={textareaClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm text-foreground">Homework update</span>
        <select
          value={selectedHomeworkWeek}
          onChange={(e) => handleSelectHomework(e.target.value)}
          className={inputClasses}
        >
          <option value="">Pull from a saved week of homework…</option>
          {homeworkEntries.map((entry) => (
            <option key={entry.weekOf} value={entry.weekOf}>
              Week of {formatDate(entry.weekOf)}
            </option>
          ))}
        </select>
        <textarea
          rows={4}
          value={homeworkUpdate}
          onChange={(e) => setHomeworkUpdate(e.target.value)}
          placeholder="This week's homework (or pull it from a saved week above)"
          className={textareaClasses}
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-medium text-sm text-foreground">Reminders (all optional)</span>
        {REMINDER_FIELDS.map((field) => (
          <label key={field.key} className={labelClasses}>
            <span className="text-foreground">{field.label}</span>
            <textarea
              rows={2}
              value={reminders[field.key] ?? ""}
              onChange={(e) => updateReminder(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={textareaClasses}
            />
          </label>
        ))}
      </div>

      <label className={labelClasses}>
        <span className="font-medium text-foreground">Closing</span>
        <textarea
          rows={2}
          value={closing}
          onChange={(e) => setClosing(e.target.value)}
          placeholder="Thank you, and have a great weekend!"
          className={textareaClasses}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSend} disabled={!canSend} className={sendButtonClasses}>
          {sendState === "sending" ? "Sending…" : "Send this week's newsletter"}
        </button>
        {greeting.trim().length === 0 && (
          <span className="text-sm text-muted-foreground">Add a greeting above to enable sending.</span>
        )}
      </div>

      <SendFeedback sendState={sendState} sendResult={sendResult} sendError={sendError} />
    </div>
  );
}
