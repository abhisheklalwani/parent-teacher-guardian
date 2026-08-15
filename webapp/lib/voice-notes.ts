import { GoogleGenAI } from "@google/genai";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const GEMINI_MODEL = "gemini-3.5-flash";
const DATA_DIR = path.join(process.cwd(), "data");
const ROSTER_PATH = path.join(DATA_DIR, "roster.json");
const NOTES_PATH = path.join(DATA_DIR, "teacher_notes.json");

type Student = {
  student_id: string;
  name: string;
};

type RosterData = {
  students: Student[];
};

type NotesData = {
  class_id: string;
  teacher: string;
  notes: {
    student_id: string;
    entries: {
      date: string;
      week_of?: string;
      note: string;
    }[];
  }[];
};

export type ParsedVoiceNote = {
  student_id: string;
  student_name: string;
  note: string;
};

const PARSE_PROMPT = `You are helping a teacher organize their weekly notes about students.

Class roster:
{{ROSTER}}

Full transcript of the teacher's voice dump:
"""{{TRANSCRIPT}}"""

Task:
- Read the entire transcript and identify every student mentioned by first name, last name, nickname, or another recognizable reference.
- Match each mention to the closest student on the roster using fuzzy, common-sense matching.
- For each matched student, write one clean note that captures what the teacher said. Preserve the teacher's meaning and do not add details.
- Omit students who were not mentioned.
- Skip names that cannot be confidently matched to the roster.

Return a JSON array only. Each item must have "student_id" and "note" string fields.`;

async function loadRoster(): Promise<RosterData> {
  return JSON.parse(await readFile(ROSTER_PATH, "utf8")) as RosterData;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

function responseText(response: { text?: string }): string {
  const text = response.text?.trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

export async function processVoiceNote(
  audio: ArrayBuffer,
  mimeType: string,
): Promise<{ transcript: string; notes: ParsedVoiceNote[] }> {
  const client = getClient();
  const roster = await loadRoster();
  const audioBase64 = Buffer.from(audio).toString("base64");

  const transcription = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        inlineData: {
          data: audioBase64,
          mimeType,
        },
      },
      {
        text: "Transcribe the speech verbatim. Return only the transcribed text.",
      },
    ],
  });
  const transcript = responseText(transcription);

  const rosterText = roster.students
    .map((student) => `${student.student_id}: ${student.name}`)
    .join("\n");
  const prompt = PARSE_PROMPT.replace("{{ROSTER}}", rosterText).replace(
    "{{TRANSCRIPT}}",
    transcript,
  );

  const parsedResponse = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            student_id: { type: "string" },
            note: { type: "string" },
          },
          required: ["student_id", "note"],
          additionalProperties: false,
        },
      },
    },
  });

  const parsed = JSON.parse(responseText(parsedResponse)) as {
    student_id: string;
    note: string;
  }[];
  const studentsById = new Map(
    roster.students.map((student) => [student.student_id, student]),
  );

  const notes = parsed.flatMap((item) => {
    const student = studentsById.get(item.student_id);
    const note = item.note?.trim();
    if (!student || !note) return [];
    return [
      {
        student_id: student.student_id,
        student_name: student.name,
        note,
      },
    ];
  });

  return { transcript, notes };
}

function weekOf(date: Date): string {
  const monday = new Date(date);
  const day = monday.getUTCDay();
  monday.setUTCDate(monday.getUTCDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export async function saveVoiceNotes(
  notes: { student_id: string; note: string }[],
): Promise<{ count: number; date: string; week_of: string }> {
  const [roster, notesData] = await Promise.all([
    loadRoster(),
    readFile(NOTES_PATH, "utf8").then(
      (contents) => JSON.parse(contents) as NotesData,
    ),
  ]);
  const validStudentIds = new Set(
    roster.students.map((student) => student.student_id),
  );
  const cleaned = notes.map((item) => ({
    student_id: item.student_id,
    note: item.note.trim(),
  }));

  if (
    cleaned.length === 0 ||
    cleaned.some(
      (item) => !validStudentIds.has(item.student_id) || !item.note,
    )
  ) {
    throw new Error("Notes must contain a valid student and non-empty text");
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const week = weekOf(now);
  const entriesById = new Map(
    notesData.notes.map((student) => [student.student_id, student.entries]),
  );

  for (const item of cleaned) {
    const entry = { date, week_of: week, note: item.note };
    const entries = entriesById.get(item.student_id);
    if (entries) {
      entries.push(entry);
    } else {
      notesData.notes.push({
        student_id: item.student_id,
        entries: [entry],
      });
    }
  }

  const temporaryPath = `${NOTES_PATH}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(notesData, null, 2)}\n`);
  await rename(temporaryPath, NOTES_PATH);

  return { count: cleaned.length, date, week_of: week };
}
