import { upsertCoverageEntry } from "@/lib/coverageStore";
import { getEmailConfig, sendEmail } from "@/lib/email";
import { formatCoverageSummary, SYLLABUS_UNITS, validateCoverageInput } from "@/lib/syllabus";
import { BROADCAST_ROSTER } from "@/lib/roster";

type GuardianSendResult = {
  studentId: string;
  studentName: string;
  guardianEmail: string;
  ok: boolean;
  error?: string;
};

/**
 * POST /api/syllabus/send -> saves this dated coverage record (same as
 * /api/syllabus/save) and emails BROADCAST_ROSTER (capped to one guardian for
 * now, see lib/roster.ts) a summary of the covered lessons, plus optional
 * teacher notes.
 *
 * Only ever called after the teacher clicks "Send status to all students" in
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
  const input = validateCoverageInput(body);
  if (!input) {
    return Response.json(
      { error: "Request must include a valid date and at least one valid covered lesson id" },
      { status: 400 },
    );
  }

  const entry = await upsertCoverageEntry(input);

  const summary = formatCoverageSummary(SYLLABUS_UNITS, input.coveredLessonIds, input.notes);
  const subject = "This week's Algebra II coverage";

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
