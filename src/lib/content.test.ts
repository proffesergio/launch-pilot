import { describe, it, expect } from "vitest";

import {
  PlatformTrackSchema,
  MissionTemplateSchema,
  loadPlatformTracks,
  loadMissionTemplates,
} from "./content";
import { PLATFORMS, PLATFORM_META, platformCategory } from "./platforms";

describe("platform tracks v0", () => {
  const tracks = loadPlatformTracks();

  it("ships a track for all 17 platforms plus the BD payout module", () => {
    expect(Object.keys(tracks).sort()).toEqual(
      [...PLATFORMS, "bd_payouts"].sort(),
    );
  });

  it("every registry entry has a matching track and a category", () => {
    for (const id of PLATFORMS) {
      expect(tracks[id].id, `track for ${id}`).toBe(id);
      expect(["marketplace", "job_board"]).toContain(PLATFORM_META[id].category);
      expect(PLATFORM_META[id].url).toMatch(/^https:\/\//);
    }
  });

  it("every track validates against the schema and carries a semver version", () => {
    for (const track of Object.values(tracks)) {
      expect(() => PlatformTrackSchema.parse(track)).not.toThrow();
      expect(track.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it("every rule cites a source URL; heuristics are explicitly labeled", () => {
    for (const track of Object.values(tracks)) {
      for (const item of track.items) {
        if (item.kind === "rule") {
          expect(item.source, `${track.id}/${item.id} rule needs source`).toMatch(
            /^https:\/\//,
          );
        }
        expect(["rule", "heuristic"]).toContain(item.kind);
      }
    }
  });

  it("every item is bilingual", () => {
    for (const track of Object.values(tracks)) {
      for (const item of track.items) {
        expect(item.text.bn.trim()).not.toBe("");
        expect(item.text.en.trim()).not.toBe("");
      }
    }
  });
});

describe("mission templates v0", () => {
  const missions = loadMissionTemplates();

  it("has a substantial catalog with unique keys", () => {
    expect(missions.length).toBeGreaterThanOrEqual(18);
    const keys = missions.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every template validates, is bilingual, and has positive effort", () => {
    for (const m of missions) {
      expect(() => MissionTemplateSchema.parse(m)).not.toThrow();
      expect(m.title.bn.trim()).not.toBe("");
      expect(m.title.en.trim()).not.toBe("");
      expect(m.estMinutes).toBeGreaterThan(0);
    }
  });

  it("each of the three phases ends in exactly one boss mission per platform", () => {
    for (const platform of PLATFORMS) {
      for (const phase of [1, 2, 3] as const) {
        const bosses = missions.filter(
          (m) =>
            m.type === "boss" &&
            m.phase === phase &&
            (m.platforms === "all" ||
              m.platforms === platformCategory(platform) ||
              (Array.isArray(m.platforms) && m.platforms.includes(platform))),
        );
        expect(
          bosses.length,
          `phase ${phase} on ${platform} needs exactly 1 boss`,
        ).toBe(1);
      }
    }
  });
});
