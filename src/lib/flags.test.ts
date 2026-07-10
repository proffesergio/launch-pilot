import { describe, it, expect, vi, afterEach } from "vitest";

import { getFlag } from "./flags";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getFlag", () => {
  it("honors an explicit env override, on or off", () => {
    vi.stubEnv("FLAG_M1_ONBOARDING", "true");
    expect(getFlag("m1_onboarding")).toBe(true);
    vi.stubEnv("FLAG_M1_ONBOARDING", "false");
    expect(getFlag("m1_onboarding")).toBe(false);
  });

  it("defaults ON outside production (developer convenience)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(getFlag("m1_onboarding")).toBe(true);
  });

  it("defaults OFF in production (no half-built features in main)", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(getFlag("m1_onboarding")).toBe(false);
  });
});
