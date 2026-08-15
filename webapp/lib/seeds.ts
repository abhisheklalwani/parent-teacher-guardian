export const TEACHER_NAME = "Ms. Rivera";
export const BASELINE_SEEDS = 5;

const STORAGE_KEY = "ptg.positiveSeeds";

export function getSeedCount(): number {
  if (typeof window === "undefined") return BASELINE_SEEDS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return BASELINE_SEEDS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : BASELINE_SEEDS;
}

export function setSeedCount(count: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(Math.max(0, count)));
  window.dispatchEvent(
    new CustomEvent("ptg:seeds-changed", { detail: { count } }),
  );
}

/** Increments the planted-seed count when a positive message is approved. */
export function plantSeed(): number {
  const next = getSeedCount() + 1;
  setSeedCount(next);
  return next;
}
