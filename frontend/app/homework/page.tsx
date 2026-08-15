import { HomeworkUpdates } from "../components/HomeworkUpdates";

export default function HomeworkPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Homework Updates
        </h1>
        <p className="text-muted-foreground">
          Give families this week&apos;s homework picture they&apos;re asking for.
        </p>
      </header>

      <HomeworkUpdates />
    </main>
  );
}
