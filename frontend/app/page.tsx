import { AddNotes } from "./components/AddNotes";
import { SuggestionsList } from "./components/SuggestionsList";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          End of day review
        </h1>
        <p className="text-muted-foreground">
          Ms. Rivera &middot; Chemistry, Period 3 &middot; 24 students
        </p>
      </header>

      <AddNotes />
      <SuggestionsList />
    </main>
  );
}
