import { GoogleGenAI } from "@google/genai";
import rosterData from "@/data/roster.json";
import {
  CLASS_ID,
  insertTeacherNotes,
} from "@/lib/teacher-notes-store";

const GEMINI_MODEL = "gemini-3.7-flash";

type Student = {
  student_id: string;
  name: string;
};

type RosterData = {
  students: Student[];
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

function loadRoster(): RosterData {
  return rosterData as RosterData;
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
  const roster = loadRoster();
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

export async function saveVoiceNotes(
  notes: { student_id: string; note: string }[],
): Promise<{ count: number; date: string; week_of: string }> {
  const roster = loadRoster();
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

  return insertTeacherNotes(cleaned, { classId: CLASS_ID });
}
