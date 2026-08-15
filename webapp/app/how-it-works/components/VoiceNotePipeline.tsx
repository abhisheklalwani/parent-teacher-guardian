import { Mic } from "lucide-react";

const STEPS = [
  {
    title: "Record",
    body: "The teacher talks for about three minutes with no structure required: whoever comes to mind, in whatever order, using first names and nicknames.",
  },
  {
    title: "Transcribe",
    body: "The audio goes to Gemini, which returns a verbatim transcript. Nothing is summarized at this stage.",
  },
  {
    title: "Structure",
    body: "A second model call reads the transcript against the class roster, fuzzy-matches every name mentioned to a student id, and writes one clean note per student. It returns a JSON array constrained to a schema, so unmatched names are dropped instead of guessed. Each note is stored against the student and the week.",
  },
];

export function VoiceNotePipeline() {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex max-w-2xl items-start gap-2 text-sm text-muted-foreground">
        <Mic
          aria-hidden="true"
          className="mt-1 size-3.5 shrink-0"
          strokeWidth={2}
        />
        <span>
          This is the only new work the product asks of a teacher. An unstructured
          spoken brain dump becomes structured, per-student data that the outreach
          prompt can reason over.
        </span>
      </p>

      <ol className="grid list-none gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-col gap-1.5 rounded-md border border-border bg-card/80 px-4 py-3.5"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">
              Step {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-foreground">
              {step.title}
            </h4>
            <p className="text-sm leading-6 text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
