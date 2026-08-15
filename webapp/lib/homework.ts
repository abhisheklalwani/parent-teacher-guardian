export type UpcomingAssessment = {
  title: string;
  date: string;
};

export type WeeklyAssignment = {
  day: string;
  title: string;
  dueDate: string;
  instructions?: string;
};

export type WeeklyHomeworkUpdate = {
  learningPlan: string;
  weeklyAssignments: WeeklyAssignment[];
  upcomingAssessments: UpcomingAssessment[];
  practiceAreas?: string;
  progressNote?: string;
  resources?: string;
};

export type HomeworkWeekInput = WeeklyHomeworkUpdate & { weekOf: string };

const MAX_TEXT_LENGTH = 4000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Shared validation for /api/homework/weekly/save and /api/homework/weekly/send. */
export function validateHomeworkWeekInput(body: unknown): HomeworkWeekInput | null {
  if (typeof body !== "object" || body === null) return null;
  const { weekOf, learningPlan, weeklyAssignments, upcomingAssessments, practiceAreas, progressNote, resources } =
    body as Record<string, unknown>;

  if (
    typeof weekOf !== "string" ||
    !ISO_DATE_PATTERN.test(weekOf) ||
    Number.isNaN(Date.parse(weekOf))
  ) {
    return null;
  }

  if (typeof learningPlan !== "string" || learningPlan.trim().length === 0) return null;
  if (learningPlan.length > MAX_TEXT_LENGTH) return null;

  if (!Array.isArray(weeklyAssignments)) return null;
  const weeklyAssignmentsValid = weeklyAssignments.every((assignment) => {
    if (typeof assignment !== "object" || assignment === null) return false;
    const { day, title, dueDate, instructions } = assignment as Record<string, unknown>;
    if (typeof day !== "string" || day.trim().length === 0) return false;
    if (typeof title !== "string" || title.trim().length === 0) return false;
    if (typeof dueDate !== "string" || dueDate.trim().length === 0) return false;
    if (instructions !== undefined && typeof instructions !== "string") return false;
    return true;
  });
  if (!weeklyAssignmentsValid) return null;

  if (!Array.isArray(upcomingAssessments)) return null;
  const assessmentsValid = upcomingAssessments.every((assessment) => {
    if (typeof assessment !== "object" || assessment === null) return false;
    const { title, date } = assessment as Record<string, unknown>;
    return (
      typeof title === "string" && title.trim().length > 0 &&
      typeof date === "string" && date.trim().length > 0
    );
  });
  if (!assessmentsValid) return null;

  const optionalStrings = [practiceAreas, progressNote, resources];
  if (
    !optionalStrings.every(
      (value) => value === undefined || (typeof value === "string" && value.length <= MAX_TEXT_LENGTH),
    )
  ) {
    return null;
  }

  return {
    weekOf,
    learningPlan,
    weeklyAssignments: weeklyAssignments as WeeklyAssignment[],
    upcomingAssessments: upcomingAssessments as UpcomingAssessment[],
    practiceAreas: practiceAreas as string | undefined,
    progressNote: progressNote as string | undefined,
    resources: resources as string | undefined,
  };
}

export function formatWeeklyHomeworkSummary(update: WeeklyHomeworkUpdate): string {
  const sections: string[] = [update.learningPlan.trim()];

  if (update.weeklyAssignments.length > 0) {
    const bullets = update.weeklyAssignments
      .map((assignment) => {
        const lines = [`  - ${assignment.day}: ${assignment.title} (due ${assignment.dueDate})`];
        if (assignment.instructions && assignment.instructions.trim().length > 0) {
          lines.push(`    ${assignment.instructions.trim()}`);
        }
        return lines.join("\n");
      })
      .join("\n");
    sections.push(`This week's homework:\n${bullets}`);
  }

  if (update.upcomingAssessments.length > 0) {
    const bullets = update.upcomingAssessments
      .map((assessment) => `  - ${assessment.title} (${assessment.date})`)
      .join("\n");
    sections.push(`Upcoming quizzes, tests, and projects:\n${bullets}`);
  }

  if (update.practiceAreas && update.practiceAreas.trim().length > 0) {
    sections.push(`Where extra practice would help:\n${update.practiceAreas.trim()}`);
  }

  if (update.progressNote && update.progressNote.trim().length > 0) {
    sections.push(`Progress update:\n${update.progressNote.trim()}`);
  }

  if (update.resources && update.resources.trim().length > 0) {
    sections.push(`Recommended resources:\n${update.resources.trim()}`);
  }

  return sections.join("\n\n");
}

export type NewsletterReminders = {
  officeHours?: string;
  gradedWork?: string;
  beginningOfYearAssessments?: string;
  upcomingEvents?: string;
  classroomSupplies?: string;
  volunteerOpportunities?: string;
};

export type NewsletterDraft = {
  greeting: string;
  classworkUpdate?: string;
  homeworkUpdate?: string;
  reminders: NewsletterReminders;
  closing?: string;
};

const REMINDER_LABELS: Record<keyof NewsletterReminders, string> = {
  officeHours: "Office Hours & Extra Help",
  gradedWork: "Graded Work & Portal Access",
  beginningOfYearAssessments: "Beginning-of-Year Diagnostic Assessments",
  upcomingEvents: "Upcoming Events",
  classroomSupplies: "Classroom Supplies",
  volunteerOpportunities: "Volunteer Opportunities",
};

/**
 * Builds the plain-text family newsletter: greeting, then labeled Classwork
 * update / Homework update blocks (already-formatted text pulled from saved
 * syllabus/homework weeks), then one labeled block per non-empty reminder,
 * then the closing. Empty optional sections are skipped entirely.
 */
export function formatNewsletter(draft: NewsletterDraft): string {
  const sections: string[] = [draft.greeting.trim()];

  if (draft.classworkUpdate && draft.classworkUpdate.trim().length > 0) {
    sections.push(`Classwork update:\n${draft.classworkUpdate.trim()}`);
  }

  if (draft.homeworkUpdate && draft.homeworkUpdate.trim().length > 0) {
    sections.push(`Homework update:\n${draft.homeworkUpdate.trim()}`);
  }

  for (const key of Object.keys(REMINDER_LABELS) as (keyof NewsletterReminders)[]) {
    const value = draft.reminders[key];
    if (value && value.trim().length > 0) {
      sections.push(`${REMINDER_LABELS[key]}:\n${value.trim()}`);
    }
  }

  if (draft.closing && draft.closing.trim().length > 0) {
    sections.push(draft.closing.trim());
  }

  return sections.join("\n\n");
}
