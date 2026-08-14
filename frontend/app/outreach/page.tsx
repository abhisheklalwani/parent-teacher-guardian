import { SuggestionsList } from "../components/SuggestionsList";

export default function OutreachPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Outreach
        </h1>
        <p className="text-muted-foreground">
          Suggested parent communications for this week. Nothing sends without
          your approval.
        </p>
      </header>

      <SuggestionsList />
    </main>
  );
}
