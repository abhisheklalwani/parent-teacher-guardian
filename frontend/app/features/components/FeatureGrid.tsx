import { FeatureCard } from "./FeatureCard";

type Feature = {
  title: string;
  description: string;
};

const PLACEHOLDER_FEATURES: Feature[] = [
  { title: "Feature one", description: "Placeholder description." },
  { title: "Feature two", description: "Placeholder description." },
  { title: "Feature three", description: "Placeholder description." },
];

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PLACEHOLDER_FEATURES.map((feature) => (
        <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
      ))}
    </div>
  );
}
