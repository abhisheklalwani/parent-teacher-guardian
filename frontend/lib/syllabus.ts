export type { GuardianContact } from "./roster";
export { CLASS_ROSTER } from "./roster";

export type Lesson = {
  id: string;
  title: string;
};

export type Unit = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export const SYLLABUS_UNITS: Unit[] = [
  {
    id: "u1",
    title: "Unit 1 — Polynomials & Factoring",
    lessons: [
      { id: "u1-l1", title: "Intro to Polynomials" },
      { id: "u1-l2", title: "Factoring Basics" },
      { id: "u1-l3", title: "Solving Quadratic Equations by Factoring" },
      { id: "u1-l4", title: "Polynomial Quiz Review" },
      { id: "u1-l5", title: "Unit 1 Test – Polynomials" },
    ],
  },
  {
    id: "u2",
    title: "Unit 2 — Rational & Radical Expressions",
    lessons: [
      { id: "u2-l1", title: "Rational Expressions" },
      { id: "u2-l2", title: "Simplifying Complex Fractions" },
      { id: "u2-l3", title: "Radical Functions" },
      { id: "u2-l4", title: "Solving Radical Equations" },
      { id: "u2-l5", title: "Unit 2 Test – Rational & Radical" },
    ],
  },
  {
    id: "u3",
    title: "Unit 3 — Quadratic Functions & Complex Numbers",
    lessons: [
      { id: "u3-l1", title: "Graphing Quadratic Functions" },
      { id: "u3-l2", title: "Completing the Square" },
      { id: "u3-l3", title: "The Quadratic Formula & Discriminant" },
      { id: "u3-l4", title: "Intro to Complex Numbers" },
      { id: "u3-l5", title: "Midterm Review" },
    ],
  },
];

export function getAllLessonIds(): string[] {
  return SYLLABUS_UNITS.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
}

const MAX_NOTES_LENGTH = 2000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type CoverageInput = {
  date: string;
  coveredLessonIds: string[];
  notes?: string;
};

/** Shared validation for the /api/syllabus/save and /api/syllabus/send request bodies. */
export function validateCoverageInput(body: unknown): CoverageInput | null {
  if (typeof body !== "object" || body === null) return null;
  const { date, coveredLessonIds, notes } = body as Record<string, unknown>;

  if (typeof date !== "string" || !ISO_DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
    return null;
  }

  if (
    !Array.isArray(coveredLessonIds) ||
    coveredLessonIds.length === 0 ||
    !coveredLessonIds.every((id) => typeof id === "string")
  ) {
    return null;
  }

  const validIds = new Set(getAllLessonIds());
  if (!coveredLessonIds.every((id) => validIds.has(id))) return null;

  if (notes !== undefined && (typeof notes !== "string" || notes.length > MAX_NOTES_LENGTH)) {
    return null;
  }

  return { date, coveredLessonIds, notes };
}

export type CoveredUnitGroup = {
  unitTitle: string;
  lessonTitles: string[];
};

/**
 * Groups covered lesson titles by unit, skipping units with nothing covered.
 * Shared by the email summary below and the "Weekly updates" history list,
 * so the widget shows the same breakdown families receive.
 */
export function getCoveredLessonsByUnit(
  units: Unit[],
  coveredLessonIds: string[],
): CoveredUnitGroup[] {
  const covered = new Set(coveredLessonIds);

  return units
    .map((unit) => ({
      unitTitle: unit.title,
      lessonTitles: unit.lessons
        .filter((lesson) => covered.has(lesson.id))
        .map((lesson) => lesson.title),
    }))
    .filter((group) => group.lessonTitles.length > 0);
}

/**
 * Builds the shared plain-text summary sent to every guardian. Only units
 * with at least one covered lesson are included, so a partial week doesn't
 * read like the whole syllabus was taught.
 */
export function formatCoverageSummary(
  units: Unit[],
  coveredLessonIds: string[],
  notes?: string,
): string {
  const unitBlocks = getCoveredLessonsByUnit(units, coveredLessonIds).map(
    (group) => `${group.unitTitle}\n${group.lessonTitles.map((title) => `  - ${title}`).join("\n")}`,
  );

  const sections = [
    "Here's what we covered in class this week:",
    unitBlocks.join("\n\n"),
  ];

  if (notes && notes.trim().length > 0) {
    sections.push(`Notes from your teacher:\n${notes.trim()}`);
  }

  return sections.join("\n\n");
}
