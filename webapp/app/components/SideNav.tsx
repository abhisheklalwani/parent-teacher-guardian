"use client";

import Link from "next/link";
import { CircleHelp, ClipboardCheck, ListChecks, Mail, Mic, Newspaper, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";


const NAV_ITEMS: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
    { href: "/notes", label: "Add Notes", Icon: Mic },
    { href: "/outreach", label: "Outreach", Icon: Mail },
    { href: "/syllabus", label: "This Week", Icon: ClipboardCheck },
    { href: "/homework", label: "Homework Updates", Icon: ListChecks },
    { href: "/newsletter", label: "Newsletter", Icon: Newspaper },
    { href: "/for-families", label: "For Families", Icon: Users },
  ];

const BOTTOM_NAV_ITEM = {
  href: "/how-it-works",
  label: "How it works",
  Icon: CircleHelp,
};

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        {/* Suspension cables: edge to tower, sagging between the towers */}
        <path d="M2 9.5C4.9 9.5 7 7.4 7 4" />
        <path d="M7 4c0 4 2.2 6.2 5 6.2s5-2.2 5-6.2" />
        <path d="M17 4c0 3.4 2.1 5.5 5 5.5" />
        {/* Towers and deck */}
        <path d="M7 4v17M17 4v17" />
        <path d="M2 15.5h20" />
      </svg>
    </span>
  );
}

function NavLink({
  href,
  label,
  Icon,
  isActive,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const isHowItWorksActive =
    pathname === BOTTOM_NAV_ITEM.href ||
    pathname.startsWith(`${BOTTOM_NAV_ITEM.href}/`);

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col self-start border-r border-border bg-card/70 backdrop-blur-sm">
      <div className="border-b border-border px-4 py-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoMark />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              BridgeAI
            </span>
          </span>
        </Link>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
        aria-label="Main"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.Icon}
              isActive={isActive}
            />
          );
        })}
      </nav>

      <nav
        className="mt-auto border-t border-border p-3"
        aria-label="About"
      >
        <NavLink
          href={BOTTOM_NAV_ITEM.href}
          label={BOTTOM_NAV_ITEM.label}
          Icon={BOTTOM_NAV_ITEM.Icon}
          isActive={isHowItWorksActive}
        />
      </nav>
    </aside>
  );
}
