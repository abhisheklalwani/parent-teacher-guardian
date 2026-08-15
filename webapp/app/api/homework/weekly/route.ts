import { readHomeworkWeeks } from "@/lib/homeworkStore";
import { readWeeklyHomeworkFixture } from "@/lib/weeklyHomeworkFixture";

/**
 * GET /api/homework/weekly -> this week's homework fixture (weekOf + day-by-day
 * assignments) from data/weekly_homework.json, used to pre-fill a brand-new
 * week's form, plus the saved history of past weeks (from
 * data/weekly-homework-updates.json) for the "Saved weeks" list and the
 * newsletter composer's homework picker.
 */
export async function GET() {
  const [fixture, entries] = await Promise.all([
    readWeeklyHomeworkFixture(),
    readHomeworkWeeks(),
  ]);
  return Response.json({ fixture, entries });
}
