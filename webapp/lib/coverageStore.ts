import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Server-only. Uses fs/promises, so only import this from Route Handlers,
 * never from client components.
 */

export type CoverageEntry = {
  date: string;
  coveredLessonIds: string[];
  notes?: string;
  updatedAt: string;
};

type CoverageFile = {
  entries: CoverageEntry[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "weekly-coverage.json");

function sortByDateDesc(entries: CoverageEntry[]): CoverageEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

async function readFileContents(): Promise<CoverageFile> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray((parsed as CoverageFile).entries)
    ) {
      return parsed as CoverageFile;
    }
    return { entries: [] };
  } catch {
    return { entries: [] };
  }
}

export async function readCoverageEntries(): Promise<CoverageEntry[]> {
  const file = await readFileContents();
  return sortByDateDesc(file.entries);
}

export async function upsertCoverageEntry(
  entry: { date: string; coveredLessonIds: string[]; notes?: string },
): Promise<CoverageEntry> {
  const file = await readFileContents();
  const saved: CoverageEntry = { ...entry, updatedAt: new Date().toISOString() };

  const withoutExisting = file.entries.filter((existing) => existing.date !== entry.date);
  const nextEntries = sortByDateDesc([...withoutExisting, saved]);

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify({ entries: nextEntries }, null, 2), "utf-8");

  return saved;
}
