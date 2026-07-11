import { describe, it, expect } from "vitest";

import { loadTools, toolsForPlatform } from "./tools";

describe("tools catalog", () => {
  const tools = loadTools();

  it("has a substantial catalog with unique ids", () => {
    expect(tools.length).toBeGreaterThanOrEqual(12);
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every tool is bilingual and has an https url", () => {
    for (const t of tools) {
      expect(t.url).toMatch(/^https:\/\//);
      expect(t.whatFor.en.trim()).not.toBe("");
      expect(t.whatFor.bn.trim()).not.toBe("");
    }
  });
});

describe("toolsForPlatform", () => {
  it("returns general (all-platform) tools for a marketplace", () => {
    const fiverr = toolsForPlatform("fiverr").map((t) => t.id);
    expect(fiverr.length).toBeGreaterThan(0);
    // A payout tool applies everywhere.
    expect(fiverr).toContain("payoneer");
  });

  it("never returns tools scoped to a category the platform isn't in", () => {
    // CV builders are job-board only; a marketplace must not see them.
    const fiverr = toolsForPlatform("fiverr").map((t) => t.id);
    expect(fiverr).not.toContain("novoresume");

    const remoteok = toolsForPlatform("remoteok").map((t) => t.id);
    expect(remoteok).toContain("novoresume");
    expect(remoteok).toContain("payoneer");
  });

  it("ranks skill-matched tools ahead of general ones", () => {
    const forDesigner = toolsForPlatform("fiverr", "graphic_design");
    const canvaIndex = forDesigner.findIndex((t) => t.id === "canva");
    const payoneerIndex = forDesigner.findIndex((t) => t.id === "payoneer");
    expect(canvaIndex).toBeGreaterThanOrEqual(0);
    expect(canvaIndex).toBeLessThan(payoneerIndex);
  });

  it("excludes tools scoped to a different skill when a skill is given", () => {
    const forWriter = toolsForPlatform("fiverr", "writing").map((t) => t.id);
    // A designer-only tool shouldn't clutter a writer's list.
    expect(forWriter).not.toContain("figma");
    // But a general-skill tool still shows.
    expect(forWriter).toContain("payoneer");
  });
});
