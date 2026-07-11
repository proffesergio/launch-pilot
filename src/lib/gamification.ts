import { z } from "zod";

/**
 * Gamification pure logic (M4, pulled forward for the dashboard — see
 * docs/superpowers/specs/2026-07-11-gamification-dashboard-design.md).
 * Everything here is deterministic and DB-free; the ledger writes live in
 * xp-service.ts. Mission XP stays in xp.ts (architecture §7) — these are the
 * fixed awards for the non-mission events that exist today.
 */

export const XpEventKindSchema = z.enum([
  "onboarding_completed",
  "roadmap_generated",
  "mission_completed",
  "coach_session",
  "daily_checkin",
]);

export type XpEventKind = z.infer<typeof XpEventKindSchema>;

/** Fixed awards; mission_completed is absent because its XP is per-mission. */
export const XP_AWARDS: Record<Exclude<XpEventKind, "mission_completed">, number> = {
  onboarding_completed: 50,
  roadmap_generated: 30,
  coach_session: 10,
  daily_checkin: 5,
};

export type LevelInfo = {
  level: number;
  /** XP earned inside the current level. */
  intoLevel: number;
  /** XP the current level costs in total. */
  needed: number;
  /** intoLevel / needed, 0..1 — drives the ring and the bar. */
  progress: number;
};

/**
 * Climbing out of level n costs 100 * n^1.5 XP, rounded to the nearest 10 —
 * level 2 lands with onboarding + a first week of check-ins, later levels
 * demand real mission work.
 */
function levelCost(level: number): number {
  return Math.round((100 * level ** 1.5) / 10) * 10;
}

export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0;
  let level = 1;
  let remaining = xp;
  while (remaining >= levelCost(level)) {
    remaining -= levelCost(level);
    level += 1;
  }
  const needed = levelCost(level);
  return { level, intoLevel: remaining, needed, progress: remaining / needed };
}

/** Today as YYYY-MM-DD (UTC) — the sourceId and `day` for daily events. */
export function utcToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

const dayNumber = (day: string): number => {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

/**
 * Consecutive active days ending today — or ending yesterday, so the flame
 * survives until today's first activity instead of resetting at midnight.
 * `days` are YYYY-MM-DD (UTC), any order, duplicates fine.
 */
export function computeStreak(days: string[], today: string): number {
  const active = new Set(days.map(dayNumber));
  const todayNum = dayNumber(today);

  let cursor = active.has(todayNum) ? todayNum : todayNum - 1;
  if (!active.has(cursor)) return 0;

  let streak = 0;
  while (active.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}
