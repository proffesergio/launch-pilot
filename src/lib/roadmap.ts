import type { MissionTemplate, PlatformTrack } from "./content";
import { missionsVersion } from "./content";
import { missionXp } from "./xp";

/**
 * Roadmap generator (M2). Deliberately deterministic: the roadmap is
 * assembled from curated templates filtered by the profile, so results are
 * reproducible, testable, and free — no AI call on this path (cost principle;
 * Sonnet enrichment can layer on later without changing this contract).
 * The roadmap pins every content version it read (architecture §4).
 */

export const GENERATOR_VERSION = "roadmap-gen@0.1.0";

export type RoadmapProfile = {
  skillTrack: string;
  targetPlatform: "fiverr" | "upwork";
  weeklyHours: number;
  englishConfidence: "low" | "medium" | "high";
  experience: "none" | "some" | "experienced";
};

export type RoadmapMission = MissionTemplate & {
  xp: number;
  status: "unlocked" | "locked";
};

export type GeneratedRoadmap = {
  missions: RoadmapMission[];
  trackVersionPins: Record<string, string>;
  generatedBy: string;
};

function applies(m: MissionTemplate, profile: RoadmapProfile): boolean {
  if (m.platforms !== "all" && !m.platforms.includes(profile.targetPlatform)) {
    return false;
  }
  if (
    m.onlyEnglishConfidence &&
    !m.onlyEnglishConfidence.includes(profile.englishConfidence)
  ) {
    return false;
  }
  if (m.skipForExperience?.includes(profile.experience)) {
    return false;
  }
  return true;
}

export function generateRoadmap(
  profile: RoadmapProfile,
  templates: MissionTemplate[],
  tracks: Record<"fiverr" | "upwork" | "bd_payouts", PlatformTrack>,
): GeneratedRoadmap {
  const missions = templates
    .filter((m) => applies(m, profile))
    .sort((a, b) => a.phase - b.phase || a.order - b.order)
    .map((m, index) => ({
      ...m,
      xp: missionXp(m.estMinutes, m.category),
      // Boss missions gate phases; everything starts locked except step one.
      status: index === 0 ? ("unlocked" as const) : ("locked" as const),
    }));

  return {
    missions,
    trackVersionPins: {
      [profile.targetPlatform]: tracks[profile.targetPlatform].version,
      bd_payouts: tracks.bd_payouts.version,
      missions: missionsVersion(),
    },
    generatedBy: GENERATOR_VERSION,
  };
}
