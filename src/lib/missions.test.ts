import { describe, it, expect } from "vitest";

import { completionEffects, type MissionRowLite } from "./missions";

const bossKeys = new Set(["boss_foundation_review", "boss_profile_live"]);

function row(
  id: string,
  position: number,
  status: MissionRowLite["status"],
  phase = 1,
  missionKey = `m${position}`,
): MissionRowLite {
  return { id, missionKey, phase, position, status };
}

describe("completionEffects", () => {
  it("rejects a mission that does not exist", () => {
    expect(completionEffects([row("a", 0, "unlocked")], "zzz", bossKeys)).toEqual({
      valid: false,
      reason: "not_found",
    });
  });

  it("rejects locked and already-done missions — no double XP, no skipping", () => {
    const rows = [row("a", 0, "done"), row("b", 1, "locked")];
    expect(completionEffects(rows, "a", bossKeys)).toEqual({
      valid: false,
      reason: "not_unlocked",
    });
    expect(completionEffects(rows, "b", bossKeys)).toEqual({
      valid: false,
      reason: "not_unlocked",
    });
  });

  it("unlocks exactly the next locked mission by position", () => {
    const rows = [
      row("a", 0, "done"),
      row("b", 1, "unlocked"),
      row("c", 2, "locked"),
      row("d", 3, "locked"),
    ];
    const effects = completionEffects(rows, "b", bossKeys);
    expect(effects).toEqual({ valid: true, unlockIds: ["c"], journeyEvent: null });
  });

  it("unlocks nothing after the final mission", () => {
    const rows = [row("a", 0, "done"), row("b", 1, "unlocked")];
    expect(completionEffects(rows, "b", bossKeys)).toEqual({
      valid: true,
      unlockIds: [],
      journeyEvent: null,
    });
  });

  it("skips positions that are already unlocked or done", () => {
    const rows = [
      row("a", 0, "unlocked"),
      row("b", 1, "done"),
      row("c", 2, "locked"),
    ];
    expect(completionEffects(rows, "a", bossKeys)).toEqual({
      valid: true,
      unlockIds: ["c"],
      journeyEvent: null,
    });
  });

  it("maps boss completions to the phase's journey event", () => {
    const phase1 = [row("a", 0, "unlocked", 1, "boss_foundation_review")];
    expect(completionEffects(phase1, "a", bossKeys)).toEqual({
      valid: true,
      unlockIds: [],
      journeyEvent: "boss_profile_live",
    });

    const phase2 = [row("a", 0, "unlocked", 2, "boss_profile_live")];
    expect(completionEffects(phase2, "a", bossKeys)).toEqual({
      valid: true,
      unlockIds: [],
      journeyEvent: "boss_gig_published",
    });

    const phase3 = [row("a", 0, "unlocked", 3, "boss_first_earning")];
    expect(
      completionEffects(phase3, "a", new Set(["boss_first_earning"])),
    ).toEqual({
      valid: true,
      unlockIds: [],
      journeyEvent: "earnings_reported",
    });
  });

  it("non-boss missions never advance the journey", () => {
    const rows = [row("a", 0, "unlocked", 2, "ordinary")];
    const effects = completionEffects(rows, "a", bossKeys);
    expect(effects.valid && effects.journeyEvent).toBeNull();
  });
});
