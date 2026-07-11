import { describe, it, expect } from "vitest";

import { costUsdMicros, checkDailyCap } from "./ai-cost";

describe("costUsdMicros", () => {
  it("prices sonnet-4-6 at $3/MTok in, $15/MTok out", () => {
    // 1000 in = $0.003 = 3000 micros; 1000 out = $0.015 = 15000 micros
    expect(costUsdMicros("claude-sonnet-4-6", 1000, 1000)).toBe(18000);
  });

  it("prices haiku-4-5 at $1/MTok in, $5/MTok out", () => {
    expect(costUsdMicros("claude-haiku-4-5", 1000, 1000)).toBe(6000);
  });

  it("returns integer micros, rounding up — never undercount spend", () => {
    const cost = costUsdMicros("claude-haiku-4-5", 1, 0); // $0.000001 exactly
    expect(Number.isInteger(cost)).toBe(true);
    expect(cost).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(costUsdMicros("claude-sonnet-4-6", 7, 13))).toBe(true);
  });

  it("prices unknown models at the most expensive known rate (fail safe)", () => {
    expect(costUsdMicros("claude-fancy-new", 1000, 1000)).toBe(
      costUsdMicros("claude-sonnet-4-6", 1000, 1000),
    );
  });
});

describe("checkDailyCap", () => {
  const capUsd = 0.5; // 500_000 micros

  it("allows spend under the cap and reports the remainder", () => {
    const result = checkDailyCap(100_000, capUsd);
    expect(result.allowed).toBe(true);
    expect(result.remainingUsdMicros).toBe(400_000);
  });

  it("blocks at or over the cap — graceful degrade, never negative remainder", () => {
    expect(checkDailyCap(500_000, capUsd)).toEqual({
      allowed: false,
      remainingUsdMicros: 0,
    });
    expect(checkDailyCap(600_000, capUsd)).toEqual({
      allowed: false,
      remainingUsdMicros: 0,
    });
  });
});
