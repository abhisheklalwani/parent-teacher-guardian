import gradebookData from "@/data/gradebook.json";
import attendanceData from "@/data/attendance.json";
import rosterData from "@/data/roster.json";
import { Mic, RefreshCw } from "lucide-react";
import { AttendanceSection } from "./components/AttendanceSection";
import { GradebookSection } from "./components/GradebookSection";
import { TeacherNotesSection } from "./components/TeacherNotesSection";
import { InputDataTabs } from "./components/InputDataTabs";
import { getTeacherNotes } from "@/lib/teacher-notes-store";

export default async function HowItWorksPage() {
  const nameById = Object.fromEntries(
    rosterData.students.map((s) => [s.student_id, s.name]),
  );
  const teacherNotes = await getTeacherNotes();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12 font-sans">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          How it works
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          BridgeAI turns class records and teacher observations into suggested
          parent outreach. These are the inputs for {rosterData.class.name},
          Period {rosterData.class.period}.
        </p>
      </header>

      <section className="flex flex-col gap-8" aria-labelledby="input-data-heading">
        <div className="flex flex-col gap-3">
          <h2
            id="input-data-heading"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            Input data
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Guiding principle: create as little new work as possible for the
              teacher.
            </strong>{" "}
            The only new ask is a ~3 minute weekly voice note: a brain dump
            about their students. Everything else syncs automatically from the
            school&apos;s existing systems.
          </p>
        </div>

        <InputDataTabs
          tabs={[
            {
              id: "gradebook",
              label: "Gradebook",
              content: (
                <GradebookSection
                  assignments={gradebookData.assignments}
                  grades={gradebookData.grades}
                  nameById={nameById}
                />
              ),
            },
            {
              id: "attendance",
              label: "Attendance",
              content: (
                <AttendanceSection
                  reportingPeriod={attendanceData.reporting_period}
                  records={attendanceData.records}
                  nameById={nameById}
                />
              ),
            },
            {
              id: "teacher-notes",
              label: "Teacher notes",
              content: (
                <TeacherNotesSection
                  teacher={teacherNotes.teacher}
                  notes={teacherNotes.notes}
                  nameById={nameById}
                />
              ),
            },
          ]}
        />
      </section>
    </main>
  );
}
