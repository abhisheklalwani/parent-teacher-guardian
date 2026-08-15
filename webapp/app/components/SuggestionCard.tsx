"use client";

import { Copy, Send } from "lucide-react";
import { useState } from "react";
import type { OutreachType, Suggestion } from "@/lib/suggestions";

const TYPE_META: Record<
  OutreachType,
  { label: string; badgeClassName: string; callToAction: string }
> = {
  positive: {
    label: "Positive noticing",
    badgeClassName: "bg-success/15 text-success",
    callToAction: "No reply needed",
  },
  intervention: {
    label: "Intervention needed",
    badgeClassName: "bg-destructive/15 text-destructive",
    callToAction: "Includes one thing to try at home",
  },
  change: {
    label: "Something changed",
    badgeClassName: "bg-accent/20 text-accent-foreground",
    callToAction: "Invites a reply",
  },
};

type SuggestionCardProps = {
  suggestion: Suggestion;
  isApproved: boolean;
  onApprove: () => void;
  onSkip: () => void;
};

export function SuggestionCard({
  suggestion,
  isApproved,
  onApprove,
  onSkip,
}: SuggestionCardProps) {
  const [draft, setDraft] = useState(suggestion.draft);
  const [copied, setCopied] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "sending" | "error">(
    "idle",
  );
  const [sendError, setSendError] = useState<string | null>(null);
  const meta = TYPE_META[suggestion.type];

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function approveAndSend() {
    setSendState("sending");
    setSendError(null);

    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: suggestion.guardianEmail,
          subject: suggestion.subject,
          text: draft,
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      onApprove();
    } catch (error) {
      setSendState("error");
      setSendError(error instanceof Error ? error.message : "Send failed");
    }
  }

  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate text-lg font-semibold">
              {suggestion.studentName}
            </h3>
            <p className="text-xs text-muted-foreground">
              To {suggestion.guardianName}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-md px-2.5 py-0.5 text-xs font-medium ${meta.badgeClassName}`}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-sm text-foreground">{suggestion.reason}</p>
      </header>

      <ul className="flex flex-col gap-1.5 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
        {suggestion.evidence.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">&bull;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          Subject: {suggestion.subject}
        </p>
        <label className="flex flex-col gap-1 text-sm">
          <span className="sr-only">Draft message</span>
          <textarea
            rows={9}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={isApproved}
            className="resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <p className="text-xs text-muted-foreground">{meta.callToAction}</p>
      </div>

      {isApproved ? (
        <div className="mt-auto rounded-md border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success">
          Approved and sent
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={approveAndSend}
              disabled={sendState === "sending"}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Send aria-hidden="true" className="size-3.5" strokeWidth={2} />
              {sendState === "sending" ? "Sending…" : "Approve & send"}
            </button>
            <button
              type="button"
              onClick={copyDraft}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Copy aria-hidden="true" className="size-3.5" strokeWidth={2} />
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={sendState === "sending"}
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Skip
            </button>
          </div>
          {sendState === "error" && (
            <p className="text-xs font-medium text-destructive">{sendError}</p>
          )}
        </div>
      )}
    </article>
  );
}
