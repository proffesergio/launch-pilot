import { describe, it, expect } from "vitest";

import { missionXp, CATEGORY_WEIGHTS } from "./xp";

describe("missionXp (architecture §7)", () => {
  it("computes xp = round(est_minutes * 1.5 * category_weight)", () => {
    // outreach weight 1.5 → 20 * 1.5 * 1.5 = 45
    expect(missionXp(20, "outreach")).toBe(45);
    // profile weight 1.0 → 30 * 1.5 * 1.0 = 45
    expect(missionXp(30, "profile")).toBe(45);
    // mindset weight 0.8 → 10 * 1.5 * 0.8 = 12
    expect(missionXp(10, "mindset")).toBe(12);
  });

  it("rewards real-world progress: outreach and delivery outweigh mindset", () => {
    expect(CATEGORY_WEIGHTS.outreach).toBeGreaterThan(CATEGORY_WEIGHTS.profile);
    expect(CATEGORY_WEIGHTS.delivery).toBeGreaterThan(CATEGORY_WEIGHTS.mindset);
  });

  it("never awards zero for a real mission", () => {
    expect(missionXp(1, "mindset")).toBeGreaterThan(0);
  });
});
