"use client";

import Link from "next/link";
import { Mail, Mic } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { TEACHER_NAME } from "@/lib/seeds";

const NAV_ITEMS: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  { href: "/notes", label: "Add Notes", Icon: Mic },
  { href: "/outreach", label: "Outreach", Icon: Mail },
];

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4">
        <path
          d="M12 3.5 4.5 7.5v4c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9v-4L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur-sm">
      <div className="border-b border-border px-4 py-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoMark />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              Parent Teacher Guardian
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {TEACHER_NAME} · Period 3
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-3" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
