"use client";

import { PROMPTS } from "@/lib/prompts";

export function PromptRail({ activeIndex }: { activeIndex: number | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {activeIndex === null ? "Not sure where to start?" : "Try this one"}
      </span>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {PROMPTS.map((prompt, index) => {
          const isActive = index === activeIndex;
          return (
            <li
              key={prompt}
              aria-current={isActive ? "true" : undefined}
              className={
                isActive
                  ? "scale-110 rounded-full border border-primary bg-primary/10 px-4 py-1.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-300"
                  : `rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-all duration-300 ${
                      activeIndex === null ? "" : "opacity-50"
                    }`
              }
            >
              {prompt}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
