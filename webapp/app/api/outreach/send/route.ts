import { Resend } from "resend";

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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const testRecipient = process.env.RESEND_TEST_RECIPIENT_EMAIL;

  if (!apiKey || !from) {
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

  const resend = new Resend(apiKey);
  const { to, subject, text } = body;

  // Demo/test mode: every send is redirected to a single inbox instead of the
  // (synthetic, non-deliverable) guardian address, so the intended recipient
  // is called out in the subject and body for visibility during a demo.
  const recipient = testRecipient || to;
  const demoSubject = testRecipient ? `[demo -> ${to}] ${subject}` : subject;
  const demoText = testRecipient
    ? `(This is a demo send. Intended guardian recipient: ${to})\n\n${text}`
    : text;

  const { data, error } = await resend.emails.send({
    from,
    to: recipient,
    subject: demoSubject,
    text: demoText,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }

  return Response.json({ id: data?.id });
}
