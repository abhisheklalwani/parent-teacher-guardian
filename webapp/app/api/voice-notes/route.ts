import { processVoiceNote, saveVoiceNotes } from "@/lib/voice-notes";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return Response.json({ error: "An audio file is required" }, { status: 400 });
    }
    if (!audio.type.startsWith("audio/")) {
      return Response.json({ error: "The uploaded file must be audio" }, { status: 415 });
    }
    if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
      return Response.json(
        { error: "Audio must be between 1 byte and 20 MB" },
        { status: 413 },
      );
    }

    const result = await processVoiceNote(await audio.arrayBuffer(), audio.type);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("GEMINI_API_KEY") ? 501 : 502;
    return Response.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      notes?: { student_id?: unknown; note?: unknown }[];
    };
    if (!Array.isArray(body.notes)) {
      return Response.json({ error: "A notes array is required" }, { status: 400 });
    }

    const notes = body.notes.map((item) => {
      if (typeof item.student_id !== "string" || typeof item.note !== "string") {
        throw new Error("Each note requires student_id and note strings");
      }
      return { student_id: item.student_id, note: item.note };
    });
    const result = await saveVoiceNotes(notes);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}
