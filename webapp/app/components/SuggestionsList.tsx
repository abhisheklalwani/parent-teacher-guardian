"use client";

import { useCallback, useEffect, useState } from "react";
import { plantSeed } from "@/lib/seeds";
import type { Suggestion } from "@/lib/suggestions";
import { SuggestionCard } from "./SuggestionCard";

type LoadState = "loading" | "loaded" | "error";

export function SuggestionsList() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async (opts?: { refresh?: boolean }) => {
    const refresh = opts?.refresh === true;
    setState("loading");
    setErrorDetail(null);
    if (refresh) setRegenerating(true);

    try {
      const url = refresh
        ? "/api/suggestions?refresh=1"
        : "/api/suggestions";
      const res = await fetch(url);
      const data: { suggestions?: Suggestion[]; error?: string } =
        await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }
      setSuggestions(data.suggestions ?? []);
      if (refresh) {
        setApprovedIds([]);
        setSkippedIds([]);
      }
      setState("loaded");
    } catch (error) {
      setErrorDetail(
        error instanceof Error ? error.message : "Request failed",
      );
      setState("error");
    } finally {
      setRegenerating(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = suggestions.filter((s) => !skippedIds.includes(s.id));
  const remaining = visible.filter((s) => !approvedIds.includes(s.id)).length;

  return (
    <section className="flex flex-col gap-4">
      {(state === "loaded" || state === "error") && (
        <div className="flex items-center justify-between gap-3">
          {state === "loaded" ? (
            <p className="text-sm text-muted-foreground">
              {remaining} waiting on you
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => void load({ refresh: true })}
            disabled={regenerating}
            className="text-sm text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
          >
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      )}

      {state === "loading" && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-32 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-medium text-destructive">
            Could not load suggestions
          </p>
          <p className="mt-1 text-muted-foreground">
            {errorDetail ?? "Refresh the page to try again."}
          </p>
        </div>
      )}

      {state === "loaded" &&
        (visible.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing left in the queue. Come back after tomorrow&apos;s notes.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isApproved={approvedIds.includes(suggestion.id)}
                onApprove={() => {
                  if (approvedIds.includes(suggestion.id)) return;
                  if (suggestion.type === "positive") plantSeed();
                  setApprovedIds((ids) => [...ids, suggestion.id]);
                }}
                onSkip={() =>
                  setSkippedIds((ids) =>
                    ids.includes(suggestion.id) ? ids : [...ids, suggestion.id],
                  )
                }
              />
            ))}
          </div>
        ))}
    </section>
  );
}
