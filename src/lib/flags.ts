/**
 * Feature flags (rail: one slice at a time, behind a flag). M1 resolution
 * order: explicit env override (FLAG_<NAME>) → default ON outside production,
 * OFF in production. PostHog flags take over the middle of that chain once a
 * project key exists; the env override stays for CI and emergencies.
 */

export type FlagName =
  | "m1_onboarding"
  | "m2_roadmap"
  | "m3_coach"
  | "m4_gamification"
  | "m5_platforms";

export function getFlag(name: FlagName): boolean {
  const override = process.env[`FLAG_${name.toUpperCase()}`];
  if (override === "true") return true;
  if (override === "false") return false;
  return process.env.NODE_ENV !== "production";
}
