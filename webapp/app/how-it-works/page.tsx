import gradebookData from "@/data/gradebook.json";
import attendanceData from "@/data/attendance.json";
import rosterData from "@/data/roster.json";
import { AttendanceSection } from "./components/AttendanceSection";
import { ExpandableSection } from "./components/ExpandableSection";
import { GradebookSection } from "./components/GradebookSection";
import { InputDataTabs } from "./components/InputDataTabs";
import { OutreachGenerationSection } from "./components/OutreachGenerationSection";
import { TeacherNotesSection } from "./components/TeacherNotesSection";
import { VoiceNotePipeline } from "./components/VoiceNotePipeline";
import { buildPromptInstructions } from "@/lib/generate-messages";
import { getTeacherNotes } from "@/lib/teacher-notes-store";

export default async function HowItWorksPage() {
  const nameById = Object.fromEntries(
    rosterData.students.map((s) => [s.student_id, s.name]),
  );
  const teacherNotes = await getTeacherNotes();
  const promptText = buildPromptInstructions();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 font-sans">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          How it works
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          BridgeAI turns class records and teacher observations into suggested
          parent outreach.
        </p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">
            Guiding principle: create as little new work as possible for the
            teacher.
          </strong>{" "}
          The only new ask is a ~3 minute weekly voice note. Everything else
          syncs automatically or happens on its own.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <ExpandableSection
          id="sync"
          step={1}
          title="Data automatically syncs from the school's existing systems"
          summary="Gradebook and attendance records arrive without the teacher entering anything."
          defaultOpen
        >
          <InputDataTabs
            label="Synced data"
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
            ]}
          />
        </ExpandableSection>

        <ExpandableSection
          id="teacher-notes"
          step={2}
          title="The teacher brain dumps observations from their class once a week"
          summary="A ~3 minute voice note, which an LLM turns into structured per-student data."
        >
          <div className="flex flex-col gap-6">
            <VoiceNotePipeline />
            <TeacherNotesSection
              teacher={teacherNotes.teacher}
              notes={teacherNotes.notes}
              nameById={nameById}
            />
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="outreach"
          step={3}
          title="Every week, a small list of suggested parent outreach emails is generated automatically"
          summary="Drafted from the synced records and the teacher notes together, then held for approval."
        >
          <OutreachGenerationSection
            promptText={promptText}
            teacher={teacherNotes.teacher}
          />
        </ExpandableSection>
      </div>
    </main>
  );
}
