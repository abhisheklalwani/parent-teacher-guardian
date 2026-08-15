import { Resend } from "resend";

export type EmailConfig = {
  apiKey: string;
  from: string;
  testRecipient?: string;
};

/** Reads Resend config from env. Returns null if sending isn't configured. */
export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return null;
  return { apiKey, from, testRecipient: process.env.RESEND_TEST_RECIPIENT_EMAIL };
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

/**
 * Sends one email via Resend. In demo mode (RESEND_TEST_RECIPIENT_EMAIL set),
 * every send is redirected to that inbox instead of the (synthetic,
 * non-deliverable) guardian address, with the intended recipient called out
 * in the subject and body for visibility during a demo.
 */
export async function sendEmail(
  config: EmailConfig,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const resend = new Resend(config.apiKey);
  const recipient = config.testRecipient || input.to;
  const subject = config.testRecipient ? `[demo -> ${input.to}] ${input.subject}` : input.subject;
  const text = config.testRecipient
    ? `(This is a demo send. Intended guardian recipient: ${input.to})\n\n${input.text}`
    : input.text;

  try {
    const { data, error } = await resend.emails.send({
      from: config.from,
      to: recipient,
      subject,
      text,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
