import { readFileSync } from "node:fs";
import path from "node:path";

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

import type { PlatformTrack } from "./content";
import { getEnv } from "./env";
import {
  FiverrGigSchema,
  UpworkProfileSchema,
  assetKindPlatform,
  type AssetContent,
  type AssetKind,
} from "./launch-assets";

/**
 * Launch Studio AI core (M3.5). Sonnet (`ANTHROPIC_MODEL_CRAFT`, the craft
 * model) drafts and reviews marketplace assets with structured output, fenced
 * by the same Zod schemas the editor and DB use — a generation that drifts to
 * Bangla or breaks a rule fails the parse and never persists. Every
 * platform-specific claim is grounded in the pinned track; nothing here ever
 * calls a marketplace. DB writes, cost accounting, and XP live in the route.
 */

export const GENERATOR_VERSION = "studio-gen@0.1.0";
export const REVIEW_VERSION = "studio-review@0.1.0";

export const ReviewFindingSchema = z.object({
  label: z.string().min(1),
  status: z.enum(["pass", "warn", "cant_verify"]),
  note: z.string().min(1),
});
export const ReviewSchema = z.object({
  findings: z.array(ReviewFindingSchema).min(1),
});
export type ReviewFinding = z.infer<typeof ReviewFindingSchema>;

export type ProfileContext = {
  skillId: string;
  skillTrack: string;
  rawSkill: string;
  englishConfidence: string;
  experience: string;
};

export type GenModelUsage = {
  inputTokens: number;
  outputTokens: number;
  model: string;
};

const PROMPT_FILE: Record<AssetKind, string> = {
  fiverr_gig: "studio-fiverr-gig.md",
  upwork_profile: "studio-upwork-profile.md",
};

function promptFile(name: string): string {
  return readFileSync(path.join(process.cwd(), "prompts", name), "utf8");
}

/** All track rules + heuristics as grounding — generation wants the whole set. */
function groundingBlock(track: PlatformTrack): string {
  const lines = track.items.map(
    (i) => `- [${i.kind}] ${i.text.en}${i.source ? ` (source: ${i.source})` : ""}`,
  );
  return [
    `## GROUNDING (${track.id} track v${track.version} — the only source for platform rules)`,
    ...lines,
  ].join("\n");
}

function profileBlock(ctx: ProfileContext): string {
  return [
    "## PROFILE",
    `skill: ${ctx.skillId} (${ctx.skillTrack})`,
    `the user's own words: ${JSON.stringify(ctx.rawSkill)}`,
    `english confidence: ${ctx.englishConfidence} · experience: ${ctx.experience}`,
  ].join("\n");
}

/** Draft one asset. Returns validated content + token usage for accounting. */
export async function generateAsset(
  kind: AssetKind,
  profile: ProfileContext,
  track: PlatformTrack,
): Promise<{ content: AssetContent; usage: GenModelUsage }> {
  const env = getEnv();
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.ANTHROPIC_MODEL_CRAFT;
  const schema = kind === "fiverr_gig" ? FiverrGigSchema : UpworkProfileSchema;

  const { object, usage } = await generateObject({
    model: anthropic(model),
    schema,
    system: promptFile(PROMPT_FILE[kind]),
    prompt: `${groundingBlock(track)}\n\n${profileBlock(profile)}`,
    maxOutputTokens: 1500,
  });

  return {
    content: object as AssetContent,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      model,
    },
  };
}

/** Critique a draft against the track. Findings only; never persists. */
export async function reviewAsset(
  kind: AssetKind,
  content: AssetContent,
  track: PlatformTrack,
): Promise<{ findings: ReviewFinding[]; usage: GenModelUsage }> {
  const env = getEnv();
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.ANTHROPIC_MODEL_CRAFT;

  const { object, usage } = await generateObject({
    model: anthropic(model),
    schema: ReviewSchema,
    system: promptFile("studio-review.md"),
    prompt: [
      groundingBlock(track),
      "",
      `## DRAFT (${assetKindPlatform(kind)} ${kind})`,
      "```json",
      JSON.stringify(content, null, 2),
      "```",
    ].join("\n"),
    maxOutputTokens: 1200,
  });

  return {
    findings: object.findings,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      model,
    },
  };
}
