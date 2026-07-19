import { readFileSync } from "node:fs";
import path from "node:path";

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import type { ZodType } from "zod";

import {
  CvAnalysisSchema,
  CvApplicationResultSchema,
  CvSuggestionsSchema,
  clampScore,
  normalizeKeywords,
  type CvApplicationResult,
  type CvInput,
} from "./cv-coach";
import { getEnv } from "./env";

/**
 * CV & Application Coach generation service (Slice 13, ADR-0015). Turns a
 * user's CV + a target job description into the four structured artifacts
 * defined in `cv-coach.ts`: analysis, cover letter, outreach email, and CV
 * suggestions. Advisory only — the user sends everything themselves.
 *
 * The model access is behind an injectable `CvGenerator` seam so the assembly
 * logic (order of calls, normalization, token accounting, final validation) is
 * unit-testable WITHOUT the network, env, or filesystem. The default generator
 * wires the seam to Sonnet (`ANTHROPIC_MODEL_CRAFT`) via the Vercel AI SDK and
 * reads the persona/guardrail system prompt from `prompts/cv-coach-system.md`.
 * Cost accounting and persistence live in the route, like the coach.
 */

// ── Generator seam ───────────────────────────────────────────────────────────

export interface CvGenerator {
  object<T>(
    schema: ZodType<T>,
    system: string,
    prompt: string,
  ): Promise<{ value: T; tokensIn: number; tokensOut: number }>;
  text(
    system: string,
    prompt: string,
  ): Promise<{ text: string; tokensIn: number; tokensOut: number }>;
}

// ── Per-artifact task instructions (layered on the base system prompt) ─────────
// The persona + "never fabricate" guardrail is the base prompt file; these only
// steer each call to the right artifact. Keywords ("outreach", "cover letter")
// are load-bearing for readability, not parsing.

const ANALYSIS_SYSTEM =
  "## TASK — MATCH ANALYSIS\n" +
  "Assess how well the CV fits the job description. Ground every claim only in " +
  "the provided CV and job description; invent nothing. Return a match score " +
  "(0-100), concrete strengths, honest gaps, missing keywords from the job " +
  "description, and one honest verdict line (never a guaranteed outcome).";

const SUGGESTIONS_SYSTEM =
  "## TASK — CV SUGGESTIONS\n" +
  "Propose concrete edits the user can make from their REAL experience only " +
  "(rephrase, quantify, reorder, surface a true-but-missing skill). Never tell " +
  "them to add experience, degrees, employers, or dates they do not have. Each " +
  "suggestion names a section, the change, and why it helps for THIS job.";

const COVER_LETTER_SYSTEM =
  "## TASK — COVER LETTER\n" +
  "Write a tailored cover letter drawing only on facts present in the CV. Do " +
  "not invent employers, dates, degrees, or skills. Match the language of the " +
  "job description. Output the letter body only — no preamble, no subject line.";

const OUTREACH_EMAIL_SYSTEM =
  "## TASK — OUTREACH EMAIL\n" +
  "Write a short, sendable outreach email to a hiring contact, grounded only in " +
  "the CV. Invent no facts. Match the language of the job description. Begin " +
  'with a single "Subject:" line, then a blank line, then the email body.';

// ── Prompt assembly ──────────────────────────────────────────────────────────

function buildPrompt(input: CvInput): string {
  return [
    "## CV",
    input.cvText,
    "",
    "## JOB DESCRIPTION",
    input.jobDescription,
  ].join("\n");
}

/**
 * Split a text outreach draft into subject + body. The prompt asks the model to
 * lead with a "Subject:" line; we parse it, and fall back to first-line-as-
 * subject so a stray format never loses the whole draft. Pure + total.
 */
export function parseOutreachEmail(raw: string): { subject: string; body: string } {
  const trimmed = raw.trim();
  const labelled = trimmed.match(/^\s*subject\s*:\s*(.+?)(?:\r?\n)([\s\S]*)$/i);
  if (labelled) {
    const subject = labelled[1].trim();
    const body = labelled[2].trim();
    if (subject && body) return { subject, body };
  }
  const newline = trimmed.indexOf("\n");
  if (newline === -1) {
    // Single line: reuse it for both so neither field is empty.
    return { subject: trimmed, body: trimmed };
  }
  const subject = trimmed.slice(0, newline).replace(/^\s*subject\s*:\s*/i, "").trim();
  const body = trimmed.slice(newline + 1).trim();
  return {
    subject: subject || trimmed,
    body: body || trimmed,
  };
}

// ── Orchestration ────────────────────────────────────────────────────────────

export interface GenerateApplicationOutput {
  result: CvApplicationResult;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

/**
 * Generate the full application bundle. Runs the four generator calls, applies
 * the pure normalizers to the raw analysis, validates the assembled bundle with
 * `CvApplicationResultSchema` (throws on drift), and reports summed token usage.
 * `model` defaults to the craft model from env; tests inject it to stay env-free.
 */
export async function generateApplication(
  input: CvInput,
  generator: CvGenerator,
  model: string = getEnv().ANTHROPIC_MODEL_CRAFT,
): Promise<GenerateApplicationOutput> {
  const prompt = buildPrompt(input);

  const [analysis, suggestions, cover, outreach] = await Promise.all([
    generator.object(CvAnalysisSchema, ANALYSIS_SYSTEM, prompt),
    generator.object(CvSuggestionsSchema, SUGGESTIONS_SYSTEM, prompt),
    generator.text(COVER_LETTER_SYSTEM, prompt),
    generator.text(OUTREACH_EMAIL_SYSTEM, prompt),
  ]);

  // Defense in depth: clamp/dedupe raw model output before the strict parse.
  const normalizedAnalysis = {
    ...analysis.value,
    matchScore: clampScore(analysis.value.matchScore),
    missingKeywords: normalizeKeywords(analysis.value.missingKeywords),
  };

  const result = CvApplicationResultSchema.parse({
    analysis: normalizedAnalysis,
    coverLetter: { body: cover.text.trim() },
    outreachEmail: parseOutreachEmail(outreach.text),
    suggestions: suggestions.value,
  });

  const tokensIn =
    analysis.tokensIn + suggestions.tokensIn + cover.tokensIn + outreach.tokensIn;
  const tokensOut =
    analysis.tokensOut + suggestions.tokensOut + cover.tokensOut + outreach.tokensOut;

  return { result, tokensIn, tokensOut, model };
}

// ── Default generator (real network path) ─────────────────────────────────────

const OBJECT_MAX_TOKENS = 1500;
const TEXT_MAX_TOKENS = 1200;

function baseSystemPrompt(): string {
  // Versioned prompt file (authored separately); read once per generator.
  return readFileSync(
    path.join(process.cwd(), "prompts", "cv-coach-system.md"),
    "utf8",
  );
}

/**
 * The production generator: Sonnet via the Vercel AI SDK. Each call layers the
 * per-artifact task instruction on the shared base prompt so the guardrail
 * travels with every generation. Reads env + prompt file at construction, so it
 * is only built inside the request path — never at import time.
 */
export function createDefaultCvGenerator(): CvGenerator {
  const env = getEnv();
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.ANTHROPIC_MODEL_CRAFT;
  const base = baseSystemPrompt();

  return {
    async object(schema, system, prompt) {
      const { object, usage } = await generateObject({
        model: anthropic(model),
        schema,
        system: `${base}\n\n${system}`,
        prompt,
        maxOutputTokens: OBJECT_MAX_TOKENS,
      });
      return {
        value: object,
        tokensIn: usage.inputTokens ?? 0,
        tokensOut: usage.outputTokens ?? 0,
      };
    },
    async text(system, prompt) {
      const { text, usage } = await generateText({
        model: anthropic(model),
        system: `${base}\n\n${system}`,
        prompt,
        maxOutputTokens: TEXT_MAX_TOKENS,
      });
      return {
        text,
        tokensIn: usage.inputTokens ?? 0,
        tokensOut: usage.outputTokens ?? 0,
      };
    },
  };
}
