import { z } from "zod";

import { bdPayoutsTrack } from "@content/platform-tracks/bd-payouts";
import { fiverrTrack } from "@content/platform-tracks/fiverr";
import { upworkTrack } from "@content/platform-tracks/upwork";
import { MISSIONS_VERSION, missionTemplates } from "@content/missions/core";

/**
 * Content layer (ADR-0001/0011): platform knowledge and mission templates are
 * curated, versioned, in-repo data — never scraped, never invented. Rules
 * cite the platform's published docs; heuristics are labeled as heuristics.
 * Zod validates at the boundary so a bad edit fails tests, not production.
 */

const BilingualText = z.object({
  bn: z.string().min(1),
  en: z.string().min(1),
});

export const TrackItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["rule", "heuristic"]),
  text: BilingualText,
  /** Required for rules; heuristics may cite experience write-ups. */
  source: z.string().url().optional(),
  capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const PlatformTrackSchema = z.object({
  id: z.enum(["fiverr", "upwork", "bd_payouts"]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  title: BilingualText,
  items: z.array(TrackItemSchema).min(1),
});

export type PlatformTrack = z.infer<typeof PlatformTrackSchema>;

export const MissionTemplateSchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/),
  phase: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  quest: z.string().min(1),
  order: z.number().int().nonnegative(),
  category: z.enum(["profile", "skill", "outreach", "delivery", "mindset"]),
  type: z.enum(["daily", "weekly", "quest", "boss", "side"]),
  estMinutes: z.number().int().positive(),
  completionKind: z.enum(["self_attest", "evidence", "ai_verify"]),
  /** "all" or an explicit platform list. */
  platforms: z.union([z.literal("all"), z.array(z.enum(["fiverr", "upwork"]))]),
  /** Optional audience conditions; absent = applies to everyone. */
  onlyEnglishConfidence: z.array(z.enum(["low", "medium", "high"])).optional(),
  skipForExperience: z.array(z.enum(["none", "some", "experienced"])).optional(),
  title: BilingualText,
  objective: BilingualText,
});

export type MissionTemplate = z.infer<typeof MissionTemplateSchema>;

export function loadPlatformTracks(): Record<
  "fiverr" | "upwork" | "bd_payouts",
  PlatformTrack
> {
  return {
    fiverr: PlatformTrackSchema.parse(fiverrTrack),
    upwork: PlatformTrackSchema.parse(upworkTrack),
    bd_payouts: PlatformTrackSchema.parse(bdPayoutsTrack),
  };
}

export function loadMissionTemplates(): MissionTemplate[] {
  return missionTemplates.map((m) => MissionTemplateSchema.parse(m));
}

export function missionsVersion(): string {
  return MISSIONS_VERSION;
}
