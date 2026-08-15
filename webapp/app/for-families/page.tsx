const DAILY_ROUTINE = [
  "Check the homework planner or online portal.",
  'Ask: "What homework do you have today?"',
  "Review completed work before submission.",
  "Read together or encourage independent reading.",
  "Help with organization, but avoid doing the work for them.",
];

const WEEKLY_ROUTINE = [
  "Review grades and missing assignments.",
  "Look ahead to upcoming tests and projects.",
  "Contact the teacher if a pattern of struggles develops.",
  "Celebrate completed work and effort.",
];

export default function ForFamiliesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          How Parents Can Help at Home
        </h1>
        <p className="text-muted-foreground">
          A simple homework routine, broken into a few minutes a day and a few minutes a week.
        </p>
        <p className="text-sm text-muted-foreground">
          Preview — this will move to a dedicated family login once accounts launch.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Daily routine (15–30 minutes)</h2>
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            {DAILY_ROUTINE.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-muted-foreground">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Weekly routine (10–15 minutes)</h2>
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            {WEEKLY_ROUTINE.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-muted-foreground">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
