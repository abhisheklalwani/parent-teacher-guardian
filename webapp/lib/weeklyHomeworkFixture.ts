import { readFile } from "node:fs/promises";
import path from "node:path";
import type { WeeklyAssignment } from "./homework";

/**
 * Server-only. Uses fs/promises, so only import this from Route Handlers,
 * never from client components.
 *
 * Reads the repo-root /data fixture (shared with the offline Python script)
 * rather than a frontend-local mock, since this is seed content for the
 * weekly homework email, not app-generated state.
 */

const DATA_FILE = path.join(process.cwd(), "..", "data", "weekly_homework.json");

type WeeklyHomeworkFixtureFile = {
  class_id: string;
  week_of: string;
  assignments: {
    day: string;
    title: string;
    due_date: string;
    instructions?: string;
  }[];
};

export type WeeklyHomeworkFixture = {
  weekOf: string;
  assignments: WeeklyAssignment[];
};

export async function readWeeklyHomeworkFixture(): Promise<WeeklyHomeworkFixture | null> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as WeeklyHomeworkFixtureFile;

    return {
      weekOf: parsed.week_of,
      assignments: parsed.assignments.map((assignment) => ({
        day: assignment.day,
        title: assignment.title,
        dueDate: assignment.due_date,
        instructions: assignment.instructions,
      })),
    };
  } catch {
    return null;
  }
}
