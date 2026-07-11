import { describe, it, expect } from "vitest";

import { loadPlatformTracks } from "./content";
import { retrieveGrounding } from "./grounding";

const tracks = loadPlatformTracks();

describe("retrieveGrounding", () => {
  it("finds the Fiverr commission rule for a fee question", () => {
    const hits = retrieveGrounding("how much commission fee does fiverr take", "fiverr", tracks);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.map((h) => h.itemId)).toContain("commission_20");
  });

  it("works for Bangla queries", () => {
    const hits = retrieveGrounding("বিকাশে টাকা তুলবো কীভাবে", "fiverr", tracks);
    expect(hits.map((h) => h.itemId)).toContain("payoneer_bkash");
  });

  it("never returns items from the other marketplace's track", () => {
    const hits = retrieveGrounding("profile approval id verification", "fiverr", tracks);
    expect(hits.every((h) => h.trackId !== "upwork")).toBe(true);
  });

  it("caps results and returns nothing for an unmatched query", () => {
    expect(retrieveGrounding("x q z", "fiverr", tracks).length).toBe(0);
    expect(
      retrieveGrounding("gig profile fee video keyword", "fiverr", tracks).length,
    ).toBeLessThanOrEqual(4);
  });

  it("labels every hit with kind and source so the coach can cite honestly", () => {
    const hits = retrieveGrounding("fiverr commission", "fiverr", tracks);
    for (const hit of hits) {
      expect(["rule", "heuristic"]).toContain(hit.kind);
      expect(hit.text.en).toBeTruthy();
      expect(hit.text.bn).toBeTruthy();
    }
  });
});
