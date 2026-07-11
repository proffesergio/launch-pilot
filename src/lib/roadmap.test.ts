import { describe, it, expect } from "vitest";

import { loadMissionTemplates, loadPlatformTracks } from "./content";
import { generateRoadmap, GENERATOR_VERSION } from "./roadmap";

const templates = loadMissionTemplates();
const tracks = loadPlatformTracks();

const beginnerDesigner = {
  skillTrack: "design",
  targetPlatform: "fiverr",
  weeklyHours: 10,
  englishConfidence: "low",
  experience: "none",
} as const;

const seasonedDev = {
  skillTrack: "dev",
  targetPlatform: "upwork",
  weeklyHours: 30,
  englishConfidence: "high",
  experience: "experienced",
} as const;

const jobBoardStarter = {
  skillTrack: "dev",
  targetPlatform: "remoteok",
  weeklyHours: 15,
  englishConfidence: "medium",
  experience: "some",
} as const;

describe("generateRoadmap", () => {
  it("two different profiles yield demonstrably different roadmaps (M2 exit criterion)", () => {
    const a = generateRoadmap(beginnerDesigner, templates, tracks);
    const b = generateRoadmap(seasonedDev, templates, tracks);
    const keysA = a.missions.map((m) => m.key);
    const keysB = b.missions.map((m) => m.key);
    expect(keysA).not.toEqual(keysB);
    // Platform-specific work must not leak across platforms.
    expect(keysA.some((k) => k.startsWith("fiverr_"))).toBe(true);
    expect(keysA.some((k) => k.startsWith("upwork_"))).toBe(false);
    expect(keysB.some((k) => k.startsWith("upwork_"))).toBe(true);
    expect(keysB.some((k) => k.startsWith("fiverr_"))).toBe(false);
  });

  it("job-board profiles get application missions, never gig/marketplace work", () => {
    const { missions, trackVersionPins } = generateRoadmap(
      jobBoardStarter,
      templates,
      tracks,
    );
    const keys = missions.map((m) => m.key);
    expect(keys.some((k) => k.startsWith("job_board_"))).toBe(true);
    expect(keys.some((k) => k.startsWith("fiverr_"))).toBe(false);
    expect(keys.some((k) => k.startsWith("upwork_"))).toBe(false);
    // Marketplace-scoped templates must not leak onto job boards.
    for (const m of missions) {
      expect(m.platforms).not.toBe("marketplace");
    }
    expect(trackVersionPins.remoteok).toBe(tracks.remoteok.version);
  });

  it("marketplace profiles never see job-board application missions", () => {
    const { missions } = generateRoadmap(beginnerDesigner, templates, tracks);
    expect(missions.some((m) => m.key.startsWith("job_board_"))).toBe(false);
  });

  it("scaffolds English only for low-confidence users", () => {
    const low = generateRoadmap(beginnerDesigner, templates, tracks);
    const high = generateRoadmap(seasonedDev, templates, tracks);
    expect(low.missions.some((m) => m.key === "english_client_basics")).toBe(true);
    expect(high.missions.some((m) => m.key === "english_client_basics")).toBe(false);
  });

  it("lets experienced users skip beginner skill-building", () => {
    const fresh = generateRoadmap(beginnerDesigner, templates, tracks);
    const seasoned = generateRoadmap(
      { ...beginnerDesigner, experience: "experienced" },
      templates,
      tracks,
    );
    expect(fresh.missions.some((m) => m.key === "skill_sharpen")).toBe(true);
    expect(seasoned.missions.some((m) => m.key === "skill_sharpen")).toBe(false);
  });

  it("orders missions by phase and keeps each phase's boss last", () => {
    const { missions } = generateRoadmap(beginnerDesigner, templates, tracks);
    const phases = missions.map((m) => m.phase);
    expect([...phases].sort((x, y) => x - y)).toEqual(phases);
    for (const phase of [1, 2, 3]) {
      const inPhase = missions.filter((m) => m.phase === phase);
      expect(inPhase.at(-1)?.type).toBe("boss");
      expect(inPhase.filter((m) => m.type === "boss")).toHaveLength(1);
    }
  });

  it("pins the exact content versions it generated from", () => {
    const { trackVersionPins, generatedBy } = generateRoadmap(
      beginnerDesigner,
      templates,
      tracks,
    );
    expect(trackVersionPins.fiverr).toBe(tracks.fiverr.version);
    expect(trackVersionPins.bd_payouts).toBe(tracks.bd_payouts.version);
    expect(trackVersionPins.missions).toMatch(/^\d+\.\d+\.\d+$/);
    expect(generatedBy).toBe(GENERATOR_VERSION);
  });

  it("only the first mission starts unlocked — bosses gate progression", () => {
    const { missions } = generateRoadmap(beginnerDesigner, templates, tracks);
    expect(missions[0].status).toBe("unlocked");
    expect(missions.slice(1).every((m) => m.status === "locked")).toBe(true);
  });
});
