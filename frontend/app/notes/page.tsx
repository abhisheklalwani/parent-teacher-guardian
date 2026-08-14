import { AddNotes } from "../components/AddNotes";

const PROMPTS = [
  "Who surprised you today?",
  "Who is slipping?",
  "Any effort worth naming?",
  "Anyone seem off?",
] as const;

export default function NotesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12 font-sans">
      <div className="flex flex-1 flex-col justify-center gap-10">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Add Notes
          </h1>
          <p className="max-w-lg text-muted-foreground">
            Brain dump what you noticed about your students today.
          </p>
        </header>

        <AddNotes />
      </div>

      <footer className="flex flex-col items-center gap-3 pt-10">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Not sure where to start?
        </span>
        <ul className="flex flex-wrap justify-center gap-2">
          {PROMPTS.map((prompt) => (
            <li
              key={prompt}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {prompt}
            </li>
          ))}
        </ul>
      </footer>
    </main>
  );
}
