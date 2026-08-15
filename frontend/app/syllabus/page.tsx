import { SyllabusCoverage } from "../components/SyllabusCoverage";

export default function SyllabusPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          This Week&apos;s Coverage
        </h1>
        <p className="text-muted-foreground">
          Check off what you taught this week, then send guardians a summary.
        </p>
      </header>

      <SyllabusCoverage />
    </main>
  );
}
