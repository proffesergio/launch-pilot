import { z } from "zod";

import { bdPayoutsTrack } from "@content/platform-tracks/bd-payouts";
import { builtinTrack } from "@content/platform-tracks/builtin";
import { fiverrTrack } from "@content/platform-tracks/fiverr";
import { flexjobsTrack } from "@content/platform-tracks/flexjobs";
import { jobgetherTrack } from "@content/platform-tracks/jobgether";
import { jobspressoTrack } from "@content/platform-tracks/jobspresso";
import { justremoteTrack } from "@content/platform-tracks/justremote";
import { remoteCoTrack } from "@content/platform-tracks/remote-co";
import { remoteokTrack } from "@content/platform-tracks/remoteok";
import { remotiveTrack } from "@content/platform-tracks/remotive";
import { skipthedriveTrack } from "@content/platform-tracks/skipthedrive";
import { underdogTrack } from "@content/platform-tracks/underdog";
import { upworkTrack } from "@content/platform-tracks/upwork";
import { virtualvocationsTrack } from "@content/platform-tracks/virtualvocations";
import { web3CareerTrack } from "@content/platform-tracks/web3-career";
import { wellfoundTrack } from "@content/platform-tracks/wellfound";
import { weworkremotelyTrack } from "@content/platform-tracks/weworkremotely";
import { workingNomadsTrack } from "@content/platform-tracks/working-nomads";
import { MISSIONS_VERSION, missionTemplates } from "@content/missions/core";
import { PLATFORMS, type PlatformId } from "./platforms";

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

/** Every id a track file may carry: the 17 platforms + shared BD payout module. */
export const TRACK_IDS = [...PLATFORMS, "bd_payouts"] as const;
export type TrackId = (typeof TRACK_IDS)[number];

export const PlatformTrackSchema = z.object({
  id: z.enum(TRACK_IDS),
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
  /** "all", a whole category ("marketplace"/"job_board"), or an explicit list. */
  platforms: z.union([
    z.literal("all"),
    z.literal("marketplace"),
    z.literal("job_board"),
    z.array(z.enum(PLATFORMS)),
  ]),
  /** Optional audience conditions; absent = applies to everyone. */
  onlyEnglishConfidence: z.array(z.enum(["low", "medium", "high"])).optional(),
  skipForExperience: z.array(z.enum(["none", "some", "experienced"])).optional(),
  title: BilingualText,
  objective: BilingualText,
});

export type MissionTemplate = z.infer<typeof MissionTemplateSchema>;

export function loadPlatformTracks(): Record<TrackId, PlatformTrack> {
  const sources: Record<TrackId, unknown> = {
    fiverr: fiverrTrack,
    upwork: upworkTrack,
    wellfound: wellfoundTrack,
    working_nomads: workingNomadsTrack,
    web3_career: web3CareerTrack,
    remoteok: remoteokTrack,
    weworkremotely: weworkremotelyTrack,
    jobspresso: jobspressoTrack,
    flexjobs: flexjobsTrack,
    justremote: justremoteTrack,
    jobgether: jobgetherTrack,
    underdog: underdogTrack,
    builtin: builtinTrack,
    remote_co: remoteCoTrack,
    skipthedrive: skipthedriveTrack,
    remotive: remotiveTrack,
    virtualvocations: virtualvocationsTrack,
    bd_payouts: bdPayoutsTrack,
  };
  return Object.fromEntries(
    TRACK_IDS.map((id) => [id, PlatformTrackSchema.parse(sources[id])]),
  ) as Record<TrackId, PlatformTrack>;
}

export type { PlatformId };

export function loadMissionTemplates(): MissionTemplate[] {
  return missionTemplates.map((m) => MissionTemplateSchema.parse(m));
}

export function missionsVersion(): string {
  return MISSIONS_VERSION;
}
