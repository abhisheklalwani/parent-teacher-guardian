type NoteEntry = {
  date: string;
  note: string;
};

type StudentNotes = {
  student_id: string;
  entries: NoteEntry[];
};

type Props = {
  teacher: string;
  notes: StudentNotes[];
  nameById: Record<string, string>;
};

export function TeacherNotesSection({ teacher, notes, nameById }: Props) {
  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="teacher-notes-heading"
    >
      <div className="flex flex-col gap-1">
        <h3
          id="teacher-notes-heading"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Teacher notes
        </h3>
        <p className="text-sm text-muted-foreground">
          Observations from {teacher}, grouped by student after capture.
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="rounded-md border border-border bg-card/80 px-4 py-4 text-sm text-muted-foreground">
          No teacher notes yet. Capture a voice note to populate this section.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-card/80">
          {notes.map((student) => (
            <article
              key={student.student_id}
              className="flex flex-col gap-3 px-4 py-4"
            >
              <h4 className="text-sm font-semibold text-foreground">
                {nameById[student.student_id] ?? student.student_id}
                <span className="ml-2 font-normal text-muted-foreground">
                  {student.student_id}
                </span>
              </h4>
              <ul className="flex list-none flex-col gap-3">
                {student.entries.map((entry, index) => (
                  <li
                    key={`${student.student_id}-${entry.date}-${index}`}
                    className="flex flex-col gap-1 sm:flex-row sm:gap-4"
                  >
                    <time
                      dateTime={entry.date}
                      className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground sm:w-24 sm:pt-0.5"
                    >
                      {entry.date}
                    </time>
                    <p className="text-sm leading-6 text-foreground">
                      {entry.note}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
