import { describe, it, expect } from "vitest";

import {
  CvInputSchema,
  CvAnalysisSchema,
  CvApplicationResultSchema,
  clampScore,
  normalizeKeywords,
} from "./cv-coach";

describe("clampScore", () => {
  it("rounds and clamps into 0..100", () => {
    expect(clampScore(87.4)).toBe(87);
    expect(clampScore(87.6)).toBe(88);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(140)).toBe(100);
  });
  it("treats NaN as 0 (a bad generation can't produce a negative-looking gap)", () => {
    expect(clampScore(Number.NaN)).toBe(0);
  });
});

describe("normalizeKeywords", () => {
  it("trims, dedupes case-insensitively, drops empties, keeps first casing/order", () => {
    expect(
      normalizeKeywords(["React", " react ", "", "TypeScript", "typescript", "  "]),
    ).toEqual(["React", "TypeScript"]);
  });
});

describe("CvInputSchema", () => {
  it("rejects too-short CV or job description (guards junk generations)", () => {
    expect(CvInputSchema.safeParse({ cvText: "too short", jobDescription: "x" }).success).toBe(
      false,
    );
  });
  it("accepts substantive inputs", () => {
    const cvText = "Experienced writer. ".repeat(10);
    const jobDescription = "We need a content writer for SaaS. ".repeat(5);
    expect(CvInputSchema.safeParse({ cvText, jobDescription }).success).toBe(true);
  });
});

describe("CvAnalysisSchema", () => {
  const valid = {
    matchScore: 72,
    strengths: ["Clear writing samples"],
    gaps: ["No SaaS experience shown"],
    missingKeywords: ["saas", "b2b"],
    verdict: "A realistic stretch — worth applying with a tailored letter.",
  };
  it("accepts a well-formed analysis", () => {
    expect(CvAnalysisSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a score above 100 and empty strengths", () => {
    expect(CvAnalysisSchema.safeParse({ ...valid, matchScore: 101 }).success).toBe(false);
    expect(CvAnalysisSchema.safeParse({ ...valid, strengths: [] }).success).toBe(false);
  });
});

describe("CvApplicationResultSchema", () => {
  it("round-trips a full bundle", () => {
    const bundle = {
      analysis: {
        matchScore: 60,
        strengths: ["a"],
        gaps: [],
        missingKeywords: [],
        verdict: "Fair fit.",
      },
      coverLetter: { body: "Dear hiring manager, ...".repeat(3) },
      outreachEmail: { subject: "Application: Writer", body: "Hello, ...".repeat(3) },
      suggestions: {
        suggestions: [{ section: "Summary", change: "Quantify output", why: "Shows impact" }],
      },
    };
    expect(CvApplicationResultSchema.safeParse(bundle).success).toBe(true);
  });
});
