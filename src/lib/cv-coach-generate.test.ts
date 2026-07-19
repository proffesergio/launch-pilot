import { describe, expect, it } from "vitest";

import {
  CvAnalysisSchema,
  CvApplicationResultSchema,
  CvSuggestionsSchema,
  type CvAnalysis,
  type CvInput,
  type CvSuggestions,
} from "./cv-coach";
import { generateApplication, type CvGenerator } from "./cv-coach-generate";

/**
 * Unit test for the generation service with a FAKE generator — no network, no
 * env, no filesystem. Proves generateApplication assembles a valid bundle,
 * applies the pure normalizers (clampScore, normalizeKeywords) to raw model
 * output, and sums token usage across all four calls.
 */

const input: CvInput = {
  cvText:
    "Experienced widget engineer with five years building React dashboards, " +
    "Node services, and Postgres pipelines for remote teams.",
  jobDescription:
    "We are hiring a senior widget engineer to own our React and Node stack.",
};

// Deliberately out-of-range / dirty so the normalizers have something to do.
const analysisCanned: CvAnalysis = {
  matchScore: 140, // clampScore should pull this down to 100
  strengths: ["Five years of React"],
  gaps: ["No Kubernetes experience mentioned"],
  missingKeywords: ["React", "react", "  React  ", "Node"], // dedupe → React, Node
  verdict: "A realistic fit with a couple of gaps to close.",
};

const suggestionsCanned: CvSuggestions = {
  suggestions: [
    {
      section: "Summary",
      change: "Lead with the five years of React dashboard work.",
      why: "The job description names React first.",
    },
  ],
};

// Token counts per call — chosen so the sums are unambiguous.
const TOKENS = {
  analysis: { tokensIn: 10, tokensOut: 20 },
  suggestions: { tokensIn: 5, tokensOut: 7 },
  cover: { tokensIn: 3, tokensOut: 4 },
  outreach: { tokensIn: 6, tokensOut: 8 },
};

function makeFakeGenerator(): CvGenerator {
  return {
    async object(schema, _system, _prompt) {
      // Reference-dispatch the seam by which schema was requested. The seam's
      // generic type has no static overlap with a concrete schema, so compare
      // as unknown (the runtime identity is what matters here).
      const s = schema as unknown;
      if (s === CvAnalysisSchema) {
        return { value: analysisCanned as never, ...TOKENS.analysis };
      }
      if (s === CvSuggestionsSchema) {
        return { value: suggestionsCanned as never, ...TOKENS.suggestions };
      }
      throw new Error("fake generator: unexpected object schema");
    },
    async text(system, _prompt) {
      if (system.toLowerCase().includes("outreach")) {
        return {
          text: "Subject: Application for Senior Widget Role\n\nHello, I would love to apply.",
          ...TOKENS.outreach,
        };
      }
      return { text: "Dear hiring manager, here is my cover letter.", ...TOKENS.cover };
    },
  };
}

describe("generateApplication", () => {
  it("assembles a valid bundle from the four generator calls", async () => {
    const { result } = await generateApplication(input, makeFakeGenerator(), "test-model");
    expect(CvApplicationResultSchema.safeParse(result).success).toBe(true);
    expect(result.coverLetter.body).toBe("Dear hiring manager, here is my cover letter.");
    expect(result.outreachEmail.subject).toBe("Application for Senior Widget Role");
    expect(result.outreachEmail.body).toBe("Hello, I would love to apply.");
    expect(result.suggestions.suggestions).toHaveLength(1);
  });

  it("applies clampScore to the match score", async () => {
    const { result } = await generateApplication(input, makeFakeGenerator(), "test-model");
    expect(result.analysis.matchScore).toBe(100); // 140 clamped
  });

  it("applies normalizeKeywords to missing keywords", async () => {
    const { result } = await generateApplication(input, makeFakeGenerator(), "test-model");
    expect(result.analysis.missingKeywords).toEqual(["React", "Node"]);
  });

  it("sums token usage across all four calls and returns the model", async () => {
    const out = await generateApplication(input, makeFakeGenerator(), "test-model");
    expect(out.tokensIn).toBe(10 + 5 + 3 + 6);
    expect(out.tokensOut).toBe(20 + 7 + 4 + 8);
    expect(out.model).toBe("test-model");
  });
});
