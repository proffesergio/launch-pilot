import { z } from "zod";

/**
 * CV & Application Coach shapes + pure logic (Slice 13, ADR-0015). The
 * structured artifacts we generate from a user's CV + a target job description:
 * a match analysis, a cover letter, an outreach email, and CV-improvement
 * suggestions. Advisory only — the user sends everything themselves.
 *
 * Unlike Launch Studio (English-only for marketplace ToS), output language
 * follows the job description, so text fields are language-agnostic here. The
 * "never fabricate experience" guardrail lives in the prompt + evals, not the
 * schema — the schema only enforces shape and sane bounds.
 */

export const GENERATOR_VERSION = "cv-coach-gen@0.1.0";

/** Non-empty free text with an upper bound (any language). */
const text = (max: number) => z.string().trim().min(1).max(max);

// ── Inputs ───────────────────────────────────────────────────────────────────

export const CvInputSchema = z.object({
  // Floors are deliberately low but non-trivial: enough to analyse, not a stray
  // word. Ceilings keep a single generation within the per-user cost cap.
  cvText: z.string().trim().min(50).max(20000),
  jobDescription: z.string().trim().min(30).max(20000),
});
export type CvInput = z.infer<typeof CvInputSchema>;

// ── Generated artifacts ──────────────────────────────────────────────────────

export const CvAnalysisSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  strengths: z.array(text(300)).min(1).max(8),
  gaps: z.array(text(300)).max(8),
  missingKeywords: z.array(text(60)).max(20),
  // One honest line about realistic fit (never an outcome promise).
  verdict: text(400),
});
export type CvAnalysis = z.infer<typeof CvAnalysisSchema>;

export const CoverLetterSchema = z.object({
  body: text(3000),
});
export type CoverLetter = z.infer<typeof CoverLetterSchema>;

export const OutreachEmailSchema = z.object({
  subject: text(160),
  body: text(2000),
});
export type OutreachEmail = z.infer<typeof OutreachEmailSchema>;

export const CvSuggestionSchema = z.object({
  section: text(80), // e.g. "Summary", "Experience"
  change: text(400), // the concrete edit/addition (from real experience only)
  why: text(300), // why it helps for THIS job description
});
export type CvSuggestion = z.infer<typeof CvSuggestionSchema>;

export const CvSuggestionsSchema = z.object({
  suggestions: z.array(CvSuggestionSchema).min(1).max(12),
});
export type CvSuggestions = z.infer<typeof CvSuggestionsSchema>;

/** The full bundle persisted as jsonb on cv_applications.result. */
export const CvApplicationResultSchema = z.object({
  analysis: CvAnalysisSchema,
  coverLetter: CoverLetterSchema,
  outreachEmail: OutreachEmailSchema,
  suggestions: CvSuggestionsSchema,
});
export type CvApplicationResult = z.infer<typeof CvApplicationResultSchema>;

// ── Pure normalizers (unit-tested; safe to run on model output) ───────────────

/** Round + clamp a match score into 0..100; NaN → 0. */
export function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Trim, drop empties, dedupe case-insensitively, keep first casing + order. */
export function normalizeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of keywords) {
    const trimmed = raw.trim();
    const key = trimmed.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}
