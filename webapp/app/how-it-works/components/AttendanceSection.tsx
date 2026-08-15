type AttendanceEvent = {
  date: string;
  type: string;
  excused: boolean;
  reason?: string | null;
  minutes_late?: number;
};

type AttendanceRecord = {
  student_id: string;
  absences_excused: number;
  absences_unexcused: number;
  tardies: number;
  events: AttendanceEvent[];
};

type ReportingPeriod = {
  start: string;
  end: string;
  total_days: number;
};

type Props = {
  reportingPeriod: ReportingPeriod;
  records: AttendanceRecord[];
  nameById: Record<string, string>;
};

export function AttendanceSection({
  reportingPeriod,
  records,
  nameById,
}: Props) {
  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby="attendance-heading"
    >
      <div className="flex flex-col gap-1">
        <h3
          id="attendance-heading"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Attendance data
        </h3>
        <p className="text-sm text-muted-foreground">
          Reporting period {reportingPeriod.start} to {reportingPeriod.end} (
          {reportingPeriod.total_days} school days).
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card/80">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className="px-3 py-2.5 font-medium text-foreground">
                Student
              </th>
              <th className="px-3 py-2.5 font-medium text-foreground">
                Excused absences
              </th>
              <th className="px-3 py-2.5 font-medium text-foreground">
                Unexcused absences
              </th>
              <th className="px-3 py-2.5 font-medium text-foreground">
                Tardies
              </th>
              <th className="px-3 py-2.5 font-medium text-foreground">
                Recent events
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.student_id}
                className="border-b border-border align-top last:border-b-0"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground"
                >
                  {nameById[record.student_id] ?? record.student_id}
                </th>
                <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                  {record.absences_excused}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                  {record.absences_unexcused}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                  {record.tardies}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {record.events.length === 0 ? (
                    <span>None</span>
                  ) : (
                    <ul className="flex list-none flex-col gap-1">
                      {record.events.map((event) => (
                        <li key={`${record.student_id}-${event.date}-${event.type}`}>
                          <span className="tabular-nums">{event.date}</span>
                          {": "}
                          {event.type}
                          {event.excused ? " (excused)" : " (unexcused)"}
                          {event.reason ? ` · ${event.reason}` : ""}
                          {event.minutes_late != null
                            ? ` · ${event.minutes_late} min late`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
