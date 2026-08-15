import { generateMessages, toSuggestions } from "@/lib/generate-messages";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/suggestions -> suggested parent communications for the current week.
 *
 * Calls Gemini with class snapshot data (ported from scripts/generate_messages.py)
 * and maps the result into the Suggestion shape the outreach UI expects.
 */
export async function GET() {
  try {
    const { result, snapshots } = await generateMessages();

    return Response.json({
      suggestions: toSuggestions(result, snapshots),
      generated_at: result.generated_at,
      students_not_contacted: result.students_not_contacted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("GEMINI_API_KEY") ? 501 : 502;
    return Response.json({ error: message }, { status });
  }
}
