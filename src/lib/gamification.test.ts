import { describe, it, expect } from "vitest";

import {
  XP_AWARDS,
  XpEventKindSchema,
  levelFromXp,
  computeStreak,
} from "./gamification";

describe("XP_AWARDS", () => {
  it("prices every fixed-amount event kind", () => {
    expect(XP_AWARDS).toEqual({
      onboarding_completed: 50,
      roadmap_generated: 30,
      coach_session: 10,
      daily_checkin: 5,
    });
  });

  it("accepts mission_completed as a kind even though its XP is per-mission", () => {
    expect(XpEventKindSchema.parse("mission_completed")).toBe(
      "mission_completed",
    );
  });

  it("rejects unknown kinds at the boundary", () => {
    expect(XpEventKindSchema.safeParse("hacked_the_ledger").success).toBe(
      false,
    );
  });
});

describe("levelFromXp", () => {
  it("starts everyone at level 1 with 100 XP to climb", () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      intoLevel: 0,
      needed: 100,
      progress: 0,
    });
  });

  it("levels up exactly at the threshold", () => {
    // Cost of level n → n+1 is 100 * n^1.5, rounded to the nearest 10:
    // L1→2: 100, L2→3: 280, L3→4: 520, L4→5: 800.
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100)).toEqual({
      level: 2,
      intoLevel: 0,
      needed: 280,
      progress: 0,
    });
    expect(levelFromXp(379).level).toBe(2);
    expect(levelFromXp(380).level).toBe(3);
    expect(levelFromXp(900).level).toBe(4);
    expect(levelFromXp(1700).level).toBe(5);
  });

  it("reports progress toward the next level", () => {
    const at = levelFromXp(240); // level 2 since 100, 140 into a 280 climb
    expect(at.level).toBe(2);
    expect(at.intoLevel).toBe(140);
    expect(at.needed).toBe(280);
    expect(at.progress).toBeCloseTo(0.5, 5);
  });

  it("is monotonic — more XP never means a lower level", () => {
    let last = 1;
    for (let xp = 0; xp <= 5000; xp += 37) {
      const { level } = levelFromXp(xp);
      expect(level).toBeGreaterThanOrEqual(last);
      last = level;
    }
  });

  it("clamps garbage (negative, NaN) to level 1 at zero", () => {
    expect(levelFromXp(-50)).toEqual(levelFromXp(0));
    expect(levelFromXp(Number.NaN)).toEqual(levelFromXp(0));
  });
});

describe("computeStreak", () => {
  const today = "2026-07-11";

  it("is zero with no activity", () => {
    expect(computeStreak([], today)).toBe(0);
  });

  it("counts a single active day (today)", () => {
    expect(computeStreak(["2026-07-11"], today)).toBe(1);
  });

  it("keeps the flame alive when the last activity was yesterday", () => {
    expect(computeStreak(["2026-07-10"], today)).toBe(1);
  });

  it("dies after a full missed day", () => {
    expect(computeStreak(["2026-07-09"], today)).toBe(0);
  });

  it("counts consecutive days and stops at the first gap", () => {
    expect(
      computeStreak(["2026-07-09", "2026-07-10", "2026-07-11"], today),
    ).toBe(3);
    expect(
      computeStreak(["2026-07-07", "2026-07-10", "2026-07-11"], today),
    ).toBe(2);
  });

  it("tolerates unsorted and duplicated days", () => {
    expect(
      computeStreak(
        ["2026-07-11", "2026-07-09", "2026-07-10", "2026-07-10"],
        today,
      ),
    ).toBe(3);
  });

  it("crosses month boundaries by calendar, not string, arithmetic", () => {
    expect(computeStreak(["2026-06-30", "2026-07-01"], "2026-07-01")).toBe(2);
  });
});
