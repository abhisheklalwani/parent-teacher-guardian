import { NewsletterComposer } from "../components/NewsletterComposer";

export default function NewsletterPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Weekly Family Newsletter
        </h1>
        <p className="text-muted-foreground">
          Draft this week&apos;s newsletter, pulling in saved classwork and homework updates.
        </p>
      </header>

      <NewsletterComposer />
    </main>
  );
}
