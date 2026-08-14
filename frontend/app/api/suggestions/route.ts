import { MOCK_SUGGESTIONS } from "@/lib/suggestions";

/**
 * GET /api/suggestions -> suggested parent communications for the current week.
 *
 * Returns mock data for now. When the Python backend exposes this, swap the body
 * for `proxyBackendResponse("/suggestions")` from `@/lib/backend`.
 */
export async function GET() {
  return Response.json({ suggestions: MOCK_SUGGESTIONS });
}
