import { upsertHomeworkWeek } from "@/lib/homeworkStore";
import { getEmailConfig, sendEmail } from "@/lib/email";
import { formatWeeklyHomeworkSummary, validateHomeworkWeekInput } from "@/lib/homework";
import { BROADCAST_ROSTER } from "@/lib/roster";

type GuardianSendResult = {
  studentId: string;
  studentName: string;
  guardianEmail: string;
  ok: boolean;
  error?: string;
};

/**
 * POST /api/homework/weekly/send -> saves this dated weekly homework record
 * (same as /api/homework/weekly/save) and emails BROADCAST_ROSTER (capped to
 * one guardian for now, see lib/roster.ts) the learning plan, assignments,
 * upcoming assessments, practice areas, progress note, and resources.
 *
 * Only ever called after the teacher clicks "Send this week's homework" in
 * the UI; nothing here triggers automatically.
 */
export async function POST(request: Request) {
  const config = getEmailConfig();
  if (!config) {
    return Response.json(
      { error: "Email sending is not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL)" },
      { status: 501 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const input = validateHomeworkWeekInput(body);
  if (!input) {
    return Response.json(
      { error: "Request must include a valid week and a non-empty learning plan" },
      { status: 400 },
    );
  }

  const entry = await upsertHomeworkWeek(input);

  const summary = formatWeeklyHomeworkSummary(input);
  const subject = "This week's homework plan — Algebra II";

  const results: GuardianSendResult[] = await Promise.all(
    BROADCAST_ROSTER.map(async (guardian) => {
      const text = `Hi ${guardian.guardianName},\n\n${summary}\n\nBest,\nMs. Rivera`;
      const result = await sendEmail(config, { to: guardian.guardianEmail, subject, text });
      return {
        studentId: guardian.studentId,
        studentName: guardian.studentName,
        guardianEmail: guardian.guardianEmail,
        ok: result.ok,
        error: result.ok ? undefined : result.error,
      };
    }),
  );

  const sent = results.filter((r) => r.ok).length;

  return Response.json({ entry, sent, total: results.length, results });
}
