const SWATCHES = [
  { name: "background", className: "bg-background", fg: "text-foreground" },
  { name: "foreground", className: "bg-foreground", fg: "text-background" },
  { name: "card", className: "bg-card", fg: "text-card-foreground" },
  { name: "primary", className: "bg-primary", fg: "text-primary-foreground" },
  { name: "secondary", className: "bg-secondary", fg: "text-secondary-foreground" },
  { name: "accent", className: "bg-accent", fg: "text-accent-foreground" },
  { name: "muted", className: "bg-muted", fg: "text-muted-foreground" },
  { name: "border", className: "bg-border", fg: "text-foreground" },
  { name: "destructive", className: "bg-destructive", fg: "text-destructive-foreground" },
  { name: "success", className: "bg-success", fg: "text-success-foreground" },
] as const;

export default function ThemePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-16 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Theme preview
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Light-mode tokens from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            globals.css
          </code>
          . Use classes like{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            bg-primary
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            text-muted-foreground
          </code>
          .
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Color swatches</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              className={`flex aspect-[4/3] flex-col justify-end rounded-lg border border-border p-3 ${swatch.className}`}
            >
              <span className={`text-xs font-medium ${swatch.fg}`}>{swatch.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Typography</h2>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground">
          <h3 className="text-2xl font-semibold tracking-tight">Heading / display</h3>
          <p className="text-base text-foreground">
            Body text uses{" "}
            <span className="font-medium">foreground</span> on card or background.
          </p>
          <p className="text-sm text-muted-foreground">
            Muted foreground for supporting copy, captions, and helper text.
          </p>
          <a
            href="#buttons"
            className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Primary link style
          </a>
        </div>
      </section>

      <section id="buttons" className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Primary
          </button>
          <button
            type="button"
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Secondary
          </button>
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Accent
          </button>
          <button
            type="button"
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Destructive
          </button>
          <button
            type="button"
            className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Success
          </button>
          <button
            type="button"
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Outline
          </button>
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Ghost
          </button>
          <button
            type="button"
            disabled
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50"
          >
            Disabled
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Badges</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            Primary
          </span>
          <span className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            Secondary
          </span>
          <span className="rounded-md bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            Accent
          </span>
          <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Muted
          </span>
          <span className="rounded-md bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground">
            Destructive
          </span>
          <span className="rounded-md bg-success px-2.5 py-0.5 text-xs font-medium text-success-foreground">
            Success
          </span>
          <span className="rounded-md border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
            Outline
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground">
            <p className="font-medium">Neutral notice</p>
            <p className="mt-1 text-muted-foreground">
              Something informational for parents or teachers.
            </p>
          </div>
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
            <p className="font-medium text-success">Success</p>
            <p className="mt-1 text-muted-foreground">
              Message delivered to both guardians.
            </p>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            <p className="font-medium text-destructive">Error</p>
            <p className="mt-1 text-muted-foreground">
              Could not save draft. Try again.
            </p>
          </div>
          <div className="rounded-lg border border-accent/40 bg-accent/15 px-4 py-3 text-sm text-foreground">
            <p className="font-medium text-accent-foreground">Accent callout</p>
            <p className="mt-1 text-muted-foreground">
              Parent conference reminder for Thursday.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Form controls</h2>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Student name</span>
            <input
              type="text"
              defaultValue="Maya Chen"
              className="rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-xs text-muted-foreground">Helper text under the field.</span>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Audience</span>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option>Parents / guardians</option>
              <option>Teachers</option>
              <option>Both</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm sm:col-span-2">
            <span className="font-medium text-foreground">Message</span>
            <textarea
              rows={3}
              defaultValue="Quick update on today's reading progress."
              className="resize-y rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="size-4 rounded border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            Send a copy to my email
          </label>
          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="font-medium text-foreground">Priority</legend>
            <label className="flex items-center gap-2 text-foreground">
              <input
                type="radio"
                name="priority"
                defaultChecked
                className="accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              Normal
            </label>
            <label className="flex items-center gap-2 text-foreground">
              <input
                type="radio"
                name="priority"
                className="accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              Urgent
            </label>
          </fieldset>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Card</h2>
        <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Conference draft</h3>
              <p className="text-sm text-muted-foreground">
                Ready to review before sending to guardians.
              </p>
            </div>
            <span className="rounded-md bg-success px-2.5 py-0.5 text-xs font-medium text-success-foreground">
              Ready
            </span>
          </div>
          <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            Maya has improved fluency this week. Next step: home reading practice 15 minutes
            nightly.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Send message
            </button>
            <button
              type="button"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Edit draft
            </button>
          </div>
        </article>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Table</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-border bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last contact</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr className="border-b border-border">
                <td className="px-4 py-3">Maya Chen</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    On track
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">2 days ago</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3">Jordan Lee</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    Needs follow-up
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">1 week ago</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Sam Rivera</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                    Urgent
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">Today</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
