import Link from "next/link";
import { Mail, Mic } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          End of day review
        </h1>
        <p className="text-muted-foreground">
          Ms. Rivera &middot; Chemistry, Period 3 &middot; 24 students
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/notes"
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  );
}
