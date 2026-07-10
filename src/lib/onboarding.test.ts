import { describe, it, expect } from "vitest";

import { OnboardingAnswersSchema } from "./onboarding";

const valid = {
  rawSkill: "আমি লোগো ডিজাইন করি",
  targetPlatform: "fiverr",
  weeklyHours: 10,
  englishConfidence: "low",
  experience: "none",
};

describe("OnboardingAnswersSchema", () => {
  it("accepts a complete, sane set of answers", () => {
    const parsed = OnboardingAnswersSchema.parse(valid);
    expect(parsed.weeklyHours).toBe(10);
    expect(parsed.rawSkill).toBe("আমি লোগো ডিজাইন করি");
  });

  it("trims and bounds the free-text skill (1–300 chars)", () => {
    expect(
      OnboardingAnswersSchema.parse({ ...valid, rawSkill: "  writing  " })
        .rawSkill,
    ).toBe("writing");
    expect(() =>
      OnboardingAnswersSchema.parse({ ...valid, rawSkill: "" }),
    ).toThrow();
    expect(() =>
      OnboardingAnswersSchema.parse({ ...valid, rawSkill: "x".repeat(301) }),
    ).toThrow();
  });

  it("rejects platforms we have no track for", () => {
    expect(() =>
      OnboardingAnswersSchema.parse({ ...valid, targetPlatform: "ebay" }),
    ).toThrow();
  });

  it("bounds weekly hours to a human range (1–80) and coerces strings", () => {
    expect(
      OnboardingAnswersSchema.parse({ ...valid, weeklyHours: "25" }).weeklyHours,
    ).toBe(25);
    expect(() =>
      OnboardingAnswersSchema.parse({ ...valid, weeklyHours: 0 }),
    ).toThrow();
    expect(() =>
      OnboardingAnswersSchema.parse({ ...valid, weeklyHours: 999 }),
    ).toThrow();
  });
});
