export type SendState = "idle" | "sending" | "sent" | "error";

export type GuardianSendResult = {
  studentId: string;
  studentName: string;
  guardianEmail: string;
  ok: boolean;
  error?: string;
};

export type SendResponse = {
  sent: number;
  total: number;
  results: GuardianSendResult[];
};

export async function postSend(path: string, body: unknown): Promise<SendResponse> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: SendResponse | { error: string } = await res.json();
  if (!res.ok || !("results" in data)) {
    throw new Error("error" in data ? data.error : `Request failed: ${res.status}`);
  }
  return data;
}

export function SendFeedback({
  sendState,
  sendResult,
  sendError,
}: {
  sendState: SendState;
  sendResult: SendResponse | null;
  sendError: string | null;
}) {
  const failedResults = sendResult?.results.filter((r) => !r.ok) ?? [];

  return (
    <>
      {sendState === "idle" && (
        <span className="text-sm text-muted-foreground">
          Nothing is sent to parents until you click send.
        </span>
      )}

      {sendState === "sent" && sendResult && (
        <span className="text-sm text-success">
          Sent to {sendResult.sent} of {sendResult.total} guardians
        </span>
      )}

      {sendState === "sent" && failedResults.length > 0 && (
        <div className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Follow up with these guardians manually:</p>
          <ul className="mt-1 list-inside list-disc">
            {failedResults.map((r) => (
              <li key={r.studentId}>
                {r.studentName} ({r.guardianEmail})
              </li>
            ))}
          </ul>
        </div>
      )}

      {sendState === "error" && (
        <div className="w-full rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-medium text-destructive">Could not send</p>
          <p className="mt-1 text-muted-foreground">{sendError}</p>
        </div>
      )}

      <p className="w-full text-xs text-muted-foreground">
        Demo mode: sends go to one guardian only, to stay under Resend&apos;s free-tier daily limit.
      </p>
    </>
  );
}
