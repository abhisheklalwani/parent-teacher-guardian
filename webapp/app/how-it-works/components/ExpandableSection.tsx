"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

type Props = {
  id: string;
  step: number;
  title: string;
  summary: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function ExpandableSection({
  id,
  step,
  title,
  summary,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-card/40"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold tabular-nums text-primary"
          >
            {step}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </span>
            <span className="text-sm text-muted-foreground">{summary}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className={`ml-auto mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h2>

      <div
        id={`${id}-panel`}
        hidden={!open}
        className="border-t border-border px-5 py-6"
      >
        {children}
      </div>
    </section>
  );
}
