/**
 * XP economics (architecture §7): xp = round(est_minutes * 1.5 * weight).
 * Weights reward real-world progress — talking to clients and delivering work
 * earn more per minute than reading or reflection ever can.
 */

export type MissionCategory =
  | "profile"
  | "skill"
  | "outreach"
  | "delivery"
  | "mindset";

export const CATEGORY_WEIGHTS: Record<MissionCategory, number> = {
  outreach: 1.5,
  delivery: 1.5,
  skill: 1.2,
  profile: 1.0,
  mindset: 0.8,
};

export function missionXp(estMinutes: number, category: MissionCategory): number {
  return Math.max(1, Math.round(estMinutes * 1.5 * CATEGORY_WEIGHTS[category]));
}
