"use client";

import Link from "next/link";
import { Mail, Mic, Sprout } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  BASELINE_SEEDS,
  getSeedCount,
  TEACHER_NAME,
} from "@/lib/seeds";
import { SeedGarden } from "./components/SeedGarden";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("ptg:seeds-changed", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("ptg:seeds-changed", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export default function Home() {
  const seeds = useSyncExternalStore(
    subscribe,
    getSeedCount,
    () => BASELINE_SEEDS,
  );

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <SeedGarden count={seeds} />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-16 font-sans">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome, {TEACHER_NAME}
          </h1>
          <p className="inline-flex max-w-md flex-wrap items-center justify-center gap-x-1.5 text-muted-foreground">
            <span>You&apos;ve planted</span>
            <span className="inline-flex items-center gap-1 font-semibold text-success">
              <Sprout aria-hidden="true" className="size-4" strokeWidth={2} />
              {seeds} {seeds === 1 ? "seed" : "seeds"} of positive culture
            </span>
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/notes"
            className="flex flex-col gap-3 rounded-lg border border-border bg-card/90 p-6 text-card-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Mic className="size-5" />
            </span>
            <span className="text-lg font-semibold">Add Notes</span>
            <span className="text-sm text-muted-foreground">
              Record what you noticed about students today.
            </span>
          </Link>

          <Link
            href="/outreach"
            className="flex flex-col gap-3 rounded-lg border border-border bg-card/90 p-6 text-card-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <span className="text-lg font-semibold">Outreach</span>
            <span className="text-sm text-muted-foreground">
              Review and send suggested parent communications.
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
