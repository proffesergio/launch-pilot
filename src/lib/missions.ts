import type { JourneyEvent } from "./journey";

/**
 * Mission completion rules (M5 core, pulled forward for the interactive
 * roadmap). Pure — the DB writes live in the roadmap server action. The
 * sequence is strictly positional: finishing a mission unlocks the next
 * locked one, and boss missions additionally fire the journey event that
 * advances the user's stage (architecture §8).
 */

export type MissionRowLite = {
  id: string;
  missionKey: string;
  phase: number;
  position: number;
  status: string; // locked | unlocked | done
};

export type CompletionEffects =
  | { valid: false; reason: "not_found" | "not_unlocked" }
  | { valid: true; unlockIds: string[]; journeyEvent: JourneyEvent | null };

/** Which journey event a boss completion fires, by the boss's phase. */
const BOSS_JOURNEY_EVENTS: Record<number, JourneyEvent> = {
  1: "boss_profile_live",
  2: "boss_gig_published",
  3: "earnings_reported",
};

export function completionEffects(
  rows: MissionRowLite[],
  missionId: string,
  bossKeys: ReadonlySet<string>,
): CompletionEffects {
  const mission = rows.find((r) => r.id === missionId);
  if (!mission) return { valid: false, reason: "not_found" };
  if (mission.status !== "unlocked") {
    return { valid: false, reason: "not_unlocked" };
  }

  const next = rows
    .filter((r) => r.position > mission.position && r.status === "locked")
    .sort((a, b) => a.position - b.position)[0];

  const journeyEvent = bossKeys.has(mission.missionKey)
    ? (BOSS_JOURNEY_EVENTS[mission.phase] ?? null)
    : null;

  return { valid: true, unlockIds: next ? [next.id] : [], journeyEvent };
}
