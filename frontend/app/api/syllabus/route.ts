import { readCoverageEntries } from "@/lib/coverageStore";
import { CLASS_ROSTER, SYLLABUS_UNITS } from "@/lib/syllabus";

/**
 * GET /api/syllabus -> this week's syllabus (units + lessons) for the class,
 * plus the saved coverage history so the widget can render past entries.
 *
 * Returns mock data for now. When the Python backend exposes this, swap the body
 * for `proxyBackendResponse("/syllabus")` from `@/lib/backend`.
 */
export async function GET() {
  const entries = await readCoverageEntries();
  return Response.json({ units: SYLLABUS_UNITS, rosterSize: CLASS_ROSTER.length, entries });
}
