import { Mic } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 text-sm ml-4">
        <Mic
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0"
          strokeWidth={2}
        />
        <span>
          Generated automatically from the teacher&apos;s weekly
          ~3 minute &quot;brain dump&quot; voice recording.
        </span>
      </p>

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
    </div>
  );
}
