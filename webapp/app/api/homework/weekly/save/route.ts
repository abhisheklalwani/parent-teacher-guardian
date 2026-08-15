import { upsertHomeworkWeek } from "@/lib/homeworkStore";
import { validateHomeworkWeekInput } from "@/lib/homework";

/**
 * POST /api/homework/weekly/save -> persists a dated weekly homework record
 * without emailing anyone. Saving again with the same weekOf overwrites that
 * entry.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const input = validateHomeworkWeekInput(body);
  if (!input) {
    return Response.json(
      { error: "Request must include a valid week and a non-empty learning plan" },
      { status: 400 },
    );
  }

  const entry = await upsertHomeworkWeek(input);
  return Response.json({ entry });
}
