"use client";

import Link from "next/link";
import { Clock, Info, Mail, Mic, Sprout } from "lucide-react";
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
          <p className="inline-flex max-w-lg flex-wrap items-center justify-center gap-x-1.5 text-muted-foreground">
            <span>You&apos;ve planted</span>
            <span className="inline-flex items-center gap-1 font-semibold text-success">
              <Sprout aria-hidden="true" className="size-4" strokeWidth={2} />
              {seeds} {seeds === 1 ? "seed" : "seeds"} of positive culture
            </span>
            <span className="group relative inline-flex">
              <button
                type="button"
                aria-label="About seeds of positive culture"
                className="inline-flex cursor-pointer rounded-full text-success/80 transition-colors hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Info aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 flex w-72 -translate-x-1/2 flex-col gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-left text-xs font-normal leading-5 text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <span>
                  Every time you send positive feedback about a student, it
                  plants a seed of positive culture in your classroom.
                </span>
                <span>
                  These small actions can have an outsized impact on your
                  students.
                </span>
                <span className="italic">
                  Plus, it makes it easier to have hard conversations with parents
                  later if needed!
                </span>
              </span>
            </span>
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/notes"
            className="flex flex-col gap-3 rounded-lg border border-border bg-card/90 p-6 text-card-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="inline-flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Mic className="size-4.5" />
              </span>
              <span className="text-lg font-semibold">Add Notes</span>
            </span>
            <span className="text-sm text-muted-foreground">
              Brain dump what you noticed about your students today.
            </span>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
              <Clock aria-hidden="true" className="size-3.5" strokeWidth={2} />
              3 minutes
            </span>
          </Link>

          <Link
            href="/outreach"
            className="flex flex-col gap-3 rounded-lg border border-border bg-card/90 p-6 text-card-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="inline-flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Mail className="size-4.5" />
              </span>
              <span className="text-lg font-semibold">Outreach</span>
            </span>
            <span className="text-sm text-muted-foreground">
              Review and send suggested parent communications.
            </span>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
              <Clock aria-hidden="true" className="size-3.5" strokeWidth={2} />
              10 minutes
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
