import { RefreshCw } from "lucide-react";

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
    <div className="flex flex-col gap-3">
      <p className="flex items-start gap-2 text-sm ml-4">
        <RefreshCw
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0"
          strokeWidth={2}
        />
        <span>
          Synced automatically from the school&apos;s existing
          data sources.{" "}
          <i>
            (mocked for this demo)
          </i>
        </span>
      </p>

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
    </div>
  );
}
