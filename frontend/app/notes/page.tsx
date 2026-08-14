import { AddNotes } from "../components/AddNotes";

export default function NotesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Add notes
        </h1>
        <p className="text-muted-foreground">
          Capture what you noticed today. These feed the outreach suggestions.
        </p>
      </header>

      <AddNotes />
    </main>
  );
}
