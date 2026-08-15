import { GoogleGenAI } from "@google/genai";
import type { OutreachType, Suggestion } from "@/lib/suggestions";
import rosterData from "@/data/roster.json";
import gradebookData from "@/data/gradebook.json";
import attendanceData from "@/data/attendance.json";
import teacherNotesData from "@/data/teacher_notes.json";
import {
  ACADEMIC_ONLY_PREFLIGHT,
  OUTREACH_PROMPT_TEMPLATE,
} from "@/lib/outreach-prompt";

const GEMINI_MODEL = "gemini-3.6-flash";

type ClassInfo = {
  name: string;
  period: number;
  teacher: string;
  grade: number;
  school_year: string;
};

type Roster = {
  class: ClassInfo;
  students: { student_id: string; name: string }[];
};

type Assignment = {
  id: string;
  type: string;
  title: string;
  max_points: number;
  due_date: string;
};

type Gradebook = {
  class_id: string;
  assignments: Assignment[];
  grades: {
    student_id: string;
    scores: Record<string, number | null>;
    notes?: string;
  }[];
};

type Attendance = {
  class_id: string;
  reporting_period: {
    start: string;
    end: string;
    total_days: number;
  };
  records: {
    student_id: string;
    absences_excused: number;
    absences_unexcused: number;
    tardies: number;
  }[];
};

type TeacherNotes = {
  notes: {
    student_id: string;
    entries: { date: string; note: string }[];
  }[];
};

export type StudentSnapshot = {
  student_id: string;
  name: string;
  grade_pct: number;
  grade_letter: string;
  missing_assignments: number;
  unexcused_absences: number;
  excused_absences: number;
  tardies: number;
  total_school_days: number;
  scores_by_assignment: Record<
    string,
    { title: string; type: string; score: number | null; max: number }
  >;
  teacher_notes: { date: string; note: string }[];
};

export type MessageType =
  | "positive_noticing"
  | "intervention_needed"
  | "something_changed";

export type ContactRecommendation = {
  student_id: string;
  student_name: string;
  message_type: MessageType;
  contact_reason: string;
  draft_subject: string;
  draft_body: string;
};

export type SkippedStudent = {
  student_id: string;
  student_name: string;
  reason_skipped: string;
};

export type GenerateMessagesResult = {
  generated_at: string;
  class: {
    name: string;
    period: string | number;
    teacher: string;
  };
  students_to_contact: ContactRecommendation[];
  students_not_contacted: SkippedStudent[];
};

export function loadClassData(): {
  roster: Roster;
  gradebook: Gradebook;
  attendance: Attendance;
  teacherNotes: TeacherNotes;
} {
  return {
    roster: rosterData as Roster,
    gradebook: gradebookData as Gradebook,
    attendance: attendanceData as Attendance,
    teacherNotes: teacherNotesData as TeacherNotes,
  };
}

function letterGrade(pct: number): string {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

export function buildStudentSnapshots(
  roster: Roster,
  gradebook: Gradebook,
  attendance: Attendance,
  teacherNotes: TeacherNotes,
): StudentSnapshot[] {
  const assignments = Object.fromEntries(
    gradebook.assignments.map((a) => [a.id, a]),
  );
  const gradesBySid = Object.fromEntries(
    gradebook.grades.map((g) => [g.student_id, g.scores]),
  );
  const attBySid = Object.fromEntries(
    attendance.records.map((r) => [r.student_id, r]),
  );
  const notesBySid = Object.fromEntries(
    teacherNotes.notes.map((n) => [n.student_id, n.entries]),
  );
  const totalDays = attendance.reporting_period.total_days;
  const possible = gradebook.assignments.reduce(
    (sum, a) => sum + a.max_points,
    0,
  );

  return roster.students.map((student) => {
    const sid = student.student_id;
    const scores = gradesBySid[sid] ?? {};
    const earned = Object.values(scores).reduce<number>(
      (sum, s) => sum + (s ?? 0),
      0,
    );
    const missing = Object.values(scores).filter((s) => s === null).length;
    const gradePct = possible ? Math.round((earned / possible) * 1000) / 10 : 0;
    const att = attBySid[sid];

    return {
      student_id: sid,
      name: student.name,
      grade_pct: gradePct,
      grade_letter: letterGrade(gradePct),
      missing_assignments: missing,
      unexcused_absences: att?.absences_unexcused ?? 0,
      excused_absences: att?.absences_excused ?? 0,
      tardies: att?.tardies ?? 0,
      total_school_days: totalDays,
      scores_by_assignment: Object.fromEntries(
        Object.entries(scores).map(([aid, score]) => {
          const assignment = assignments[aid];
          return [
            aid,
            {
              title: assignment?.title ?? aid,
              type: assignment?.type ?? "unknown",
              score,
              max: assignment?.max_points ?? 0,
            },
          ];
        }),
      ),
      teacher_notes: notesBySid[sid] ?? [],
    };
  });
}

function ordinal(n: number): string {
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th");
  return `${n}${suffix}`;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fillTemplate(
  template: string,
  roster: Roster,
  attendance: Attendance,
): string {
  const cls = roster.class;
  const period = attendance.reporting_period;
  const replacements: Record<string, string> = {
    "{{TEACHER_NAME}}": cls.teacher,
    "{{CLASS_NAME}}": cls.name,
    "{{PERIOD}}": String(cls.period),
    "{{GRADE_LEVEL}}": ordinal(cls.grade),
    "{{SCHOOL_YEAR}}": cls.school_year,
    "{{REPORTING_PERIOD_START}}": formatDate(period.start),
    "{{REPORTING_PERIOD_END}}": formatDate(period.end),
    "{{TOTAL_SCHOOL_DAYS}}": String(period.total_days),
  };

  let filled = template;
  for (const [key, value] of Object.entries(replacements)) {
    filled = filled.split(key).join(value);
  }
  return filled;
}

export function buildPrompt(
  snapshots: StudentSnapshot[],
  roster: Roster,
  attendance: Attendance,
): string {
  const template = OUTREACH_PROMPT_TEMPLATE.replace(
    "\n\n---\n\n## Tone Guidance",
    `\n\n${ACADEMIC_ONLY_PREFLIGHT}\n\n---\n\n## Tone Guidance`,
  );
  const instruction = fillTemplate(template, roster, attendance);
  const dataBlock = JSON.stringify({ students: snapshots }, null, 2);
  return `${instruction}\n\n## Student Data\n\n\`\`\`json\n${dataBlock}\n\`\`\`\n`;
}

function extractJson(raw: string): GenerateMessagesResult {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/m, "");
  cleaned = cleaned.replace(/\s*```$/m, "");

  try {
    return JSON.parse(cleaned) as GenerateMessagesResult;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as GenerateMessagesResult;
    }
    throw new Error(
      `Could not parse JSON from model response: ${raw.slice(0, 500)}`,
    );
  }
}

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to webapp/.env.local.",
    );
  }

  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}

export async function generateMessages(): Promise<{
  result: GenerateMessagesResult;
  snapshots: StudentSnapshot[];
}> {
  const { roster, gradebook, attendance, teacherNotes } = loadClassData();
  const snapshots = buildStudentSnapshots(
    roster,
    gradebook,
    attendance,
    teacherNotes,
  );
  const prompt = buildPrompt(snapshots, roster, attendance);
  const raw = await callGemini(prompt);
  const result = extractJson(raw);

  if (!result.generated_at) {
    result.generated_at = new Date().toISOString();
  }

  return { result, snapshots };
}

const MESSAGE_TYPE_MAP: Record<MessageType, OutreachType> = {
  positive_noticing: "positive",
  intervention_needed: "intervention",
  something_changed: "change",
};

function syntheticGuardian(studentName: string): {
  guardianName: string;
  guardianEmail: string;
} {
  const parts = studentName.trim().split(/\s+/);
  const first = parts[0] ?? "Student";
  const last = (parts[parts.length - 1] ?? "student").toLowerCase();
  return {
    guardianName: `Parent/Guardian of ${first}`,
    guardianEmail: `guardian.${last}@example.com`,
  };
}

function evidenceFromSnapshot(snapshot: StudentSnapshot | undefined): string[] {
  if (!snapshot) return [];
  const items: string[] = [
    `Current grade: ${snapshot.grade_pct}% (${snapshot.grade_letter})`,
  ];
  if (snapshot.missing_assignments > 0) {
    items.push(`${snapshot.missing_assignments} missing assignment(s)`);
  }
  if (snapshot.unexcused_absences > 0) {
    items.push(`${snapshot.unexcused_absences} unexcused absence(s)`);
  }
  if (snapshot.tardies > 0) {
    items.push(`${snapshot.tardies} tardy arrival(s)`);
  }
  return items;
}

/** Map Gemini output into the Suggestion shape the outreach UI expects. */
export function toSuggestions(
  result: GenerateMessagesResult,
  snapshots: StudentSnapshot[],
): Suggestion[] {
  const byId = Object.fromEntries(snapshots.map((s) => [s.student_id, s]));

  return result.students_to_contact.map((rec) => {
    const guardian = syntheticGuardian(rec.student_name);
    return {
      id: rec.student_id,
      studentName: rec.student_name,
      type: MESSAGE_TYPE_MAP[rec.message_type] ?? "intervention",
      reason: rec.contact_reason,
      evidence: evidenceFromSnapshot(byId[rec.student_id]),
      subject: rec.draft_subject,
      draft: rec.draft_body,
      guardianName: guardian.guardianName,
      guardianEmail: guardian.guardianEmail,
    };
  });
}
