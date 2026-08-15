import { FeatureGrid } from "./components/FeatureGrid";

export default function FeaturesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Features
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Placeholder page. Feature content coming soon.
        </p>
      </div>

      <FeatureGrid />
    </main>
  );
}
