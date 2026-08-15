import { upsertCoverageEntry } from "@/lib/coverageStore";
import { validateCoverageInput } from "@/lib/syllabus";

/**
 * POST /api/syllabus/save -> persists a dated coverage record without
 * emailing anyone. Saving again with the same date overwrites that entry.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const input = validateCoverageInput(body);
  if (!input) {
    return Response.json(
      { error: "Request must include a valid date and at least one valid covered lesson id" },
      { status: 400 },
    );
  }

  const entry = await upsertCoverageEntry(input);
  return Response.json({ entry });
}
