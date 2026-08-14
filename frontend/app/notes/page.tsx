import { AddNotes } from "../components/AddNotes";

export default function NotesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Add Notes
        </h1>
        <p className="max-w-lg text-muted-foreground">
          Brain dump what you noticed about your students today.
        </p>
      </header>

      <AddNotes />
    </main>
  );
}
