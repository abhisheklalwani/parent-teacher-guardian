import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UpcomingAssessment, WeeklyAssignment } from "./homework";

/**
 * Server-only. Uses fs/promises, so only import this from Route Handlers,
 * never from client components.
 */

export type HomeworkWeekEntry = {
  weekOf: string;
  learningPlan: string;
  weeklyAssignments: WeeklyAssignment[];
  upcomingAssessments: UpcomingAssessment[];
  practiceAreas?: string;
  progressNote?: string;
  resources?: string;
  updatedAt: string;
};

type HomeworkWeeksFile = {
  entries: HomeworkWeekEntry[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "weekly-homework-updates.json");

function sortByWeekOfDesc(entries: HomeworkWeekEntry[]): HomeworkWeekEntry[] {
  return [...entries].sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

async function readFileContents(): Promise<HomeworkWeeksFile> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray((parsed as HomeworkWeeksFile).entries)
    ) {
      return parsed as HomeworkWeeksFile;
    }
    return { entries: [] };
  } catch {
    return { entries: [] };
  }
}

export async function readHomeworkWeeks(): Promise<HomeworkWeekEntry[]> {
  const file = await readFileContents();
  return sortByWeekOfDesc(file.entries);
}

export async function upsertHomeworkWeek(
  entry: {
    weekOf: string;
    learningPlan: string;
    weeklyAssignments: WeeklyAssignment[];
    upcomingAssessments: UpcomingAssessment[];
    practiceAreas?: string;
    progressNote?: string;
    resources?: string;
  },
): Promise<HomeworkWeekEntry> {
  const file = await readFileContents();
  const saved: HomeworkWeekEntry = { ...entry, updatedAt: new Date().toISOString() };

  const withoutExisting = file.entries.filter((existing) => existing.weekOf !== entry.weekOf);
  const nextEntries = sortByWeekOfDesc([...withoutExisting, saved]);

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify({ entries: nextEntries }, null, 2), "utf-8");

  return saved;
}
