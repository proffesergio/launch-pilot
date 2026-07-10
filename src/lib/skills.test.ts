import { describe, it, expect } from "vitest";

import { SKILLS, trackFor, keywordFallback, normalizeSkill } from "./skills";

describe("skill catalog", () => {
  it("maps every canonical skill to a track", () => {
    for (const skill of SKILLS) {
      expect(trackFor(skill), `no track for ${skill}`).toBeTruthy();
    }
  });
});

describe("keywordFallback", () => {
  it("recognizes English skill descriptions", () => {
    expect(keywordFallback("I design logos for shops")).toBe("graphic_design");
    expect(keywordFallback("I edit reels and videos")).toBe("video_editing");
    expect(keywordFallback("I build websites with react")).toBe("web_development");
  });

  it("recognizes Bangla skill descriptions", () => {
    expect(keywordFallback("আমি লোগো ডিজাইন করি")).toBe("graphic_design");
    expect(keywordFallback("আমি ভিডিও এডিট করি")).toBe("video_editing");
    expect(keywordFallback("আমি বাংলা থেকে ইংরেজি অনুবাদ করি")).toBe("translation");
  });

  it("returns null when nothing matches", () => {
    expect(keywordFallback("zzz qqq")).toBeNull();
  });
});

describe("normalizeSkill", () => {
  it("uses the injected classifier when it succeeds", async () => {
    const result = await normalizeSkill("I write blog posts", {
      classify: async () => ({ skillId: "writing", confidence: "high" }),
    });
    expect(result).toEqual({
      skillId: "writing",
      skillTrack: trackFor("writing"),
      confidence: "high",
      source: "ai",
    });
  });

  it("falls back to keywords when the classifier throws (graceful degrade)", async () => {
    const result = await normalizeSkill("আমি লোগো ডিজাইন করি", {
      classify: async () => {
        throw new Error("no api key");
      },
    });
    expect(result.skillId).toBe("graphic_design");
    expect(result.source).toBe("fallback");
    expect(result.confidence).toBe("low");
  });

  it("lands on general_freelancing when nothing matches anywhere", async () => {
    const result = await normalizeSkill("zzz qqq", {
      classify: async () => {
        throw new Error("down");
      },
    });
    expect(result.skillId).toBe("general_freelancing");
    expect(result.confidence).toBe("low");
  });

  it("rejects classifier output that is not in the canonical catalog", async () => {
    const result = await normalizeSkill("I hack satellites", {
      classify: async () =>
        ({ skillId: "satellite_hacking", confidence: "high" }) as never,
    });
    // Invalid AI output is treated as a failed classification, not trusted.
    expect(result.source).toBe("fallback");
  });
});
