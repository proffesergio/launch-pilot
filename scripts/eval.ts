/**
 * Coach prompt eval runner (`pnpm eval`, M3). Runs every case in
 * evals/coach-cases.ts against the real model with the real system prompt and
 * real grounding retrieval. Exits non-zero on any failure so CI blocks prompt
 * regressions. Without an ANTHROPIC_API_KEY it skips (exit 0) and says so.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { config } from "dotenv";
config({ path: ".env.local" });

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import { coachCases } from "../evals/coach-cases";
import { studioReviewCases } from "../evals/studio-cases";
import { loadPlatformTracks } from "../src/lib/content";
import { retrieveGrounding } from "../src/lib/grounding";
import { reviewAsset } from "../src/lib/launch-studio";
import type { AssetContent } from "../src/lib/launch-assets";

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.log("eval: skipped — ANTHROPIC_API_KEY not set");
    return;
  }

  const anthropic = createAnthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL_CRAFT?.trim() || "claude-sonnet-4-6";
  const systemPrompt = readFileSync(
    path.join(process.cwd(), "prompts", "coach-system.md"),
    "utf8",
  );
  const tracks = loadPlatformTracks();

  let failures = 0;
  for (const c of coachCases) {
    const grounding = retrieveGrounding(c.message, c.platform, tracks);
    const context = [
      "## USER PROFILE",
      `skill: writing (writing) · platform: ${c.platform} · weekly hours: 10 · ` +
        `english confidence: low · experience: none · journey: foundation · ui locale: ${c.locale}`,
      "",
      "## GROUNDING (the only source for platform specifics)",
      grounding.length
        ? grounding.map((g) => `- [${g.kind}] (${g.trackId}/${g.itemId}) ${g.text.en}`).join("\n")
        : "(nothing retrieved — do not state platform specifics; say you don't know)",
    ].join("\n");

    try {
      const { text } = await generateText({
        model: anthropic(model),
        system: `${systemPrompt}\n\n${context}`,
        messages: [{ role: "user", content: c.message }],
        maxOutputTokens: 600,
      });

      const problems: string[] = [];
      for (const rx of c.mustMatch ?? []) {
        if (!rx.test(text)) problems.push(`expected match: ${rx}`);
      }
      for (const rx of c.mustNotMatch ?? []) {
        if (rx.test(text)) problems.push(`forbidden match: ${rx}`);
      }

      if (problems.length) {
        failures += 1;
        console.log(`✗ ${c.id}`);
        for (const p of problems) console.log(`    ${p}`);
        console.log(`    reply: ${text.slice(0, 200).replaceAll("\n", " ")}…`);
      } else {
        console.log(`✓ ${c.id}`);
      }
    } catch (err) {
      failures += 1;
      console.log(`✗ ${c.id} — call failed: ${(err as Error).message.slice(0, 120)}`);
    }
  }

  // ── Launch Studio review boundary evals (M3.5) ─────────────────────────
  let studioFailures = 0;
  for (const c of studioReviewCases) {
    try {
      const { findings } = await reviewAsset(
        c.kind,
        c.content as AssetContent,
        tracks[c.platform],
      );
      const blob = JSON.stringify(findings);
      const problems: string[] = [];
      for (const rx of c.mustMatch ?? []) {
        if (!rx.test(blob)) problems.push(`expected match: ${rx}`);
      }
      for (const rx of c.mustNotMatch ?? []) {
        if (rx.test(blob)) problems.push(`forbidden match: ${rx}`);
      }
      if (problems.length) {
        studioFailures += 1;
        console.log(`✗ ${c.id}`);
        for (const p of problems) console.log(`    ${p}`);
        console.log(`    findings: ${blob.slice(0, 200)}…`);
      } else {
        console.log(`✓ ${c.id}`);
      }
    } catch (err) {
      studioFailures += 1;
      console.log(`✗ ${c.id} — call failed: ${(err as Error).message.slice(0, 120)}`);
    }
  }

  const total = coachCases.length + studioReviewCases.length;
  const passed = total - failures - studioFailures;
  console.log(`\neval: ${passed}/${total} passed`);
  if (failures + studioFailures > 0) process.exit(1);
}

main();
