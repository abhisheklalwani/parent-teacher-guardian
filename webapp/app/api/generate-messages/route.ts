import { generateMessages, toSuggestions } from "@/lib/generate-messages";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/generate-messages
 *
 * Runs the weekly outreach pipeline: load class data, build student snapshots,
 * call Gemini with the outreach prompt, return structured recommendations.
 *
 * Query: ?format=suggestions  -> also include UI-shaped Suggestion[] under
 *                                `suggestions` (what /outreach consumes).
 */
export async function POST(request: Request) {
  try {
    const { result, snapshots } = await generateMessages();
    const url = new URL(request.url);

    if (url.searchParams.get("format") === "suggestions") {
      return Response.json({
        ...result,
        suggestions: toSuggestions(result, snapshots),
      });
    }

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("GEMINI_API_KEY") ? 501 : 502;
    return Response.json({ error: message }, { status });
  }
}

/**
 * GET /api/generate-messages
 *
 * Same as POST. Convenience for browser/manual checks.
 */
export async function GET(request: Request) {
  return POST(request);
}
