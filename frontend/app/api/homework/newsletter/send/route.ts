import { getEmailConfig, sendEmail } from "@/lib/email";
import { formatNewsletter, type NewsletterDraft, type NewsletterReminders } from "@/lib/homework";
import { BROADCAST_ROSTER } from "@/lib/roster";

const MAX_TEXT_LENGTH = 4000;

const REMINDER_KEYS: (keyof NewsletterReminders)[] = [
  "officeHours",
  "gradedWork",
  "beginningOfYearAssessments",
  "upcomingEvents",
  "classroomSupplies",
  "volunteerOpportunities",
];

function isValidBody(body: unknown): body is NewsletterDraft {
  if (typeof body !== "object" || body === null) return false;
  const { greeting, classworkUpdate, homeworkUpdate, reminders, closing } =
    body as Record<string, unknown>;

  if (typeof greeting !== "string" || greeting.trim().length === 0) return false;

  const optionalTopLevel = [greeting, classworkUpdate, homeworkUpdate, closing];
  if (
    !optionalTopLevel.every(
      (value) => value === undefined || (typeof value === "string" && value.length <= MAX_TEXT_LENGTH),
    )
  ) {
    return false;
  }

  if (typeof reminders !== "object" || reminders === null) return false;
  const remindersRecord = reminders as Record<string, unknown>;
  const remindersValid = REMINDER_KEYS.every((key) => {
    const value = remindersRecord[key];
    return value === undefined || (typeof value === "string" && value.length <= MAX_TEXT_LENGTH);
  });
  if (!remindersValid) return false;

  return true;
}

type GuardianSendResult = {
  studentId: string;
  studentName: string;
  guardianEmail: string;
  ok: boolean;
  error?: string;
};

/**
 * POST /api/homework/newsletter/send -> emails BROADCAST_ROSTER (capped to
 * one guardian for now, see lib/roster.ts) the composed weekly family
 * newsletter: greeting, pulled classwork/homework updates, reminders, closing.
 *
 * Only ever called after the teacher clicks "Send this week's newsletter" in
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
  if (!isValidBody(body)) {
    return Response.json(
      { error: "Request must include a non-empty greeting" },
      { status: 400 },
    );
  }

  const summary = formatNewsletter(body);
  const subject = "This week's newsletter — Algebra II";

  const results: GuardianSendResult[] = await Promise.all(
    BROADCAST_ROSTER.map(async (guardian) => {
      const text = `Hi ${guardian.guardianName},\n\n${summary}`;
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

  return Response.json({ sent, total: results.length, results });
}
