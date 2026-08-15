import { generateMessages, toSuggestions } from "@/lib/generate-messages";
import {
  getLatestSuggestions,
  saveSuggestions,
} from "@/lib/outreach-store";
import { CLASS_ID } from "@/lib/teacher-notes-store";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/suggestions -> suggested parent communications for the current week.
 *
 * Returns the latest saved batch from Supabase when present.
 * Pass ?refresh=1 to regenerate with Gemini and replace the stored batch.
 */
export async function GET(request: Request) {
  try {
    const refresh =
      new URL(request.url).searchParams.get("refresh") === "1";

    if (!refresh) {
      const cached = await getLatestSuggestions(CLASS_ID);
      if (cached) {
        return Response.json({
          suggestions: cached.suggestions,
          generated_at: cached.generated_at,
          students_not_contacted: cached.students_not_contacted,
          source: "cache",
        });
      }
    }

    const { result, snapshots } = await generateMessages();
    const suggestions = toSuggestions(result, snapshots);
    const saved = await saveSuggestions(CLASS_ID, result, suggestions);

    return Response.json({
      suggestions: saved.suggestions,
      generated_at: saved.generated_at,
      students_not_contacted: saved.students_not_contacted,
      source: "generated",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message.includes("GEMINI_API_KEY") ||
      message.includes("SUPABASE_PROJECT_URL") ||
      message.includes("SUPABASE_SECRET_KEY")
        ? 501
        : 502;
    return Response.json({ error: message }, { status });
  }
}
