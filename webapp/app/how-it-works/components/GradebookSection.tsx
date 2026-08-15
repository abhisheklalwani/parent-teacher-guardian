import { RefreshCw } from "lucide-react";

type Assignment = {
  id: string;
  type: string;
  title: string;
  max_points: number;
  due_date: string;
};

type GradeRow = {
  student_id: string;
  scores: Record<string, number | null>;
  notes?: string;
};

type Props = {
  assignments: Assignment[];
  grades: GradeRow[];
  nameById: Record<string, string>;
};

function formatScore(score: number | null | undefined) {
  if (score === null || score === undefined) return "-";
  return String(score);
}

export function GradebookSection({ assignments, grades, nameById }: Props) {
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
              <th className="sticky left-0 z-10 bg-muted/95 px-3 py-2.5 font-medium text-foreground">
                Student
              </th>
              {assignments.map((assignment) => (
                <th
                  key={assignment.id}
                  className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground"
                  title={`${assignment.title} (${assignment.max_points} pts)`}
                >
                  <span className="block">{assignment.id}</span>
                  <span className="block text-xs font-normal capitalize text-muted-foreground">
                    {assignment.type}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((row) => (
              <tr
                key={row.student_id}
                className="border-b border-border last:border-b-0"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 whitespace-nowrap bg-card/95 px-3 py-2 font-medium text-foreground"
                >
                  {nameById[row.student_id] ?? row.student_id}
                </th>
                {assignments.map((assignment) => (
                  <td
                    key={assignment.id}
                    className="px-3 py-2 tabular-nums text-muted-foreground"
                  >
                    {formatScore(row.scores[assignment.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
