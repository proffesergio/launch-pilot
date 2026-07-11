import { describe, it, expect } from "vitest";

import {
  GENERATOR_VERSION,
  REVIEW_VERSION,
  ReviewSchema,
} from "./launch-studio";

describe("launch-studio pure exports", () => {
  it("carries semver-tagged version stamps for pinning", () => {
    expect(GENERATOR_VERSION).toMatch(/@\d+\.\d+\.\d+$/);
    expect(REVIEW_VERSION).toMatch(/@\d+\.\d+\.\d+$/);
  });

  it("ReviewSchema requires at least one well-formed finding", () => {
    expect(() => ReviewSchema.parse({ findings: [] })).toThrow();
    expect(() =>
      ReviewSchema.parse({
        findings: [{ label: "Title", status: "pass", note: "Reads well." }],
      }),
    ).not.toThrow();
    expect(() =>
      ReviewSchema.parse({
        findings: [{ label: "Title", status: "definitely", note: "x" }],
      }),
    ).toThrow();
  });
});
