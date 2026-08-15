import gradebookData from "@/data/gradebook.json";
import rosterData from "@/data/roster.json";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const CLASS_ID = gradebookData.class_id as string;
export const TEACHER_NAME = rosterData.class.teacher as string;

export type TeacherNoteEntry = {
  date: string;
  week_of?: string;
  note: string;
};

export type StudentTeacherNotes = {
  student_id: string;
  entries: TeacherNoteEntry[];
};

export type TeacherNotes = {
  class_id: string;
  teacher: string;
  notes: StudentTeacherNotes[];
};

type TeacherNoteRow = {
  student_id: string;
  note: string;
  note_date: string;
  week_of: string;
};

function weekOfFromDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - ((weekday + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function groupRows(rows: TeacherNoteRow[]): StudentTeacherNotes[] {
  const byStudent = new Map<string, TeacherNoteEntry[]>();

  for (const row of rows) {
    const entries = byStudent.get(row.student_id) ?? [];
    entries.push({
      date: row.note_date,
      week_of: row.week_of,
      note: row.note,
    });
    byStudent.set(row.student_id, entries);
  }

  return [...byStudent.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([student_id, entries]) => ({
      student_id,
      entries: entries.sort((a, b) => a.date.localeCompare(b.date)),
    }));
}

export async function getTeacherNotes(
  classId: string = CLASS_ID,
): Promise<TeacherNotes> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("teacher_notes")
    .select("student_id, note, note_date, week_of")
    .eq("class_id", classId)
    .order("note_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to load teacher notes: ${error.message}`);
  }

  return {
    class_id: classId,
    teacher: TEACHER_NAME,
    notes: groupRows((data ?? []) as TeacherNoteRow[]),
  };
}

export async function insertTeacherNotes(
  notes: { student_id: string; note: string }[],
  options?: {
    classId?: string;
    noteDate?: string;
    weekOf?: string;
  },
): Promise<{ count: number; date: string; week_of: string }> {
  const classId = options?.classId ?? CLASS_ID;
  const date = options?.noteDate ?? new Date().toISOString().slice(0, 10);
  const week = options?.weekOf ?? weekOfFromDate(date);

  if (notes.length === 0) {
    throw new Error("Notes must contain a valid student and non-empty text");
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("teacher_notes").insert(
    notes.map((item) => ({
      class_id: classId,
      student_id: item.student_id,
      note: item.note,
      note_date: date,
      week_of: week,
    })),
  );

  if (error) {
    throw new Error(`Failed to save teacher notes: ${error.message}`);
  }

  return { count: notes.length, date, week_of: week };
}

/** Seed helper: insert historical rows with explicit dates (idempotent by content). */
export async function insertTeacherNoteRows(
  rows: {
    student_id: string;
    note: string;
    note_date: string;
    week_of?: string;
  }[],
  classId: string = CLASS_ID,
): Promise<number> {
  if (rows.length === 0) return 0;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("teacher_notes").insert(
    rows.map((row) => ({
      class_id: classId,
      student_id: row.student_id,
      note: row.note,
      note_date: row.note_date,
      week_of: row.week_of ?? weekOfFromDate(row.note_date),
    })),
  );

  if (error) {
    throw new Error(`Failed to seed teacher notes: ${error.message}`);
  }

  return rows.length;
}
