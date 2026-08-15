import { getEmailConfig, sendEmail } from "@/lib/email";

type SendOutreachBody = {
  to: string;
  subject: string;
  text: string;
};

function isValidBody(body: unknown): body is SendOutreachBody {
  if (typeof body !== "object" || body === null) return false;
  const { to, subject, text } = body as Record<string, unknown>;
  return (
    typeof to === "string" &&
    to.length > 0 &&
    typeof subject === "string" &&
    subject.length > 0 &&
    typeof text === "string" &&
    text.length > 0
  );
}

/**
 * POST /api/outreach/send -> sends a teacher-approved draft to a guardian via Resend.
 *
 * Only ever called after explicit teacher approval in the UI; nothing here
 * triggers automatically.
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
      { error: "Request must include non-empty 'to', 'subject', and 'text'" },
      { status: 400 },
    );
  }

  const result = await sendEmail(config, body);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  return Response.json({ id: result.id });
}
