import { describe, it, expect } from "vitest";

import { transition, JOURNEY_STATES } from "./journey";

describe("journey state machine", () => {
  it("walks the happy path from onboarding to scaling", () => {
    expect(transition("onboarding", "profile_saved")).toBe("skill_assessment");
    expect(transition("skill_assessment", "roadmap_generated")).toBe("foundation");
    expect(transition("foundation", "boss_profile_live")).toBe("profile_built");
    expect(transition("profile_built", "boss_gig_published")).toBe("gig_live");
    expect(transition("gig_live", "earnings_reported")).toBe("first_order");
    expect(transition("first_order", "post_order_missions")).toBe("level_up");
    expect(transition("level_up", "sustained_activity")).toBe("scaling");
  });

  it("allows the two reversible transitions reality allows", () => {
    expect(transition("profile_built", "profile_reset")).toBe("foundation");
    expect(transition("gig_live", "gig_taken_down")).toBe("profile_built");
  });

  it("never reverses past first_order — you don't un-earn money", () => {
    expect(transition("first_order", "gig_taken_down")).toBeNull();
    expect(transition("first_order", "profile_reset")).toBeNull();
    expect(transition("scaling", "profile_reset")).toBeNull();
  });

  it("returns null for any event that does not apply to the state", () => {
    expect(transition("onboarding", "earnings_reported")).toBeNull();
    expect(transition("foundation", "profile_saved")).toBeNull();
  });

  it("exposes every state from the architecture diagram", () => {
    expect(JOURNEY_STATES).toEqual([
      "onboarding",
      "skill_assessment",
      "foundation",
      "profile_built",
      "gig_live",
      "first_order",
      "level_up",
      "scaling",
    ]);
  });
});
