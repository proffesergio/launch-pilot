import { readFileSync } from "node:fs";
import path from "node:path";

import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { and, asc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { aiUsageDaily, coachMessages, freelancerProfiles } from "@/db/schema";
import { routing } from "@/i18n/routing";
import { checkDailyCap, costUsdMicros } from "@/lib/ai-cost";
import { getAuth } from "@/lib/auth";
import { loadPlatformTracks } from "@/lib/content";
import { getOrCreateCorrelationId } from "@/lib/correlation";
import { getEnv } from "@/lib/env";
import { getFlag } from "@/lib/flags";
import { retrieveGrounding } from "@/lib/grounding";
import { logger } from "@/lib/logger";

const BodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  locale: z.enum(routing.locales),
});

const PROMPT_VERSION = "coach-system@0.1.0";
const HISTORY_TURNS = 10;

function systemPrompt(): string {
  // Read once per process; prompts are versioned files, never inline strings.
  return readFileSync(
    path.join(process.cwd(), "prompts", "coach-system.md"),
    "utf8",
  );
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  if (!getFlag("m3_coach")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const requestHeaders = await headers();
  const correlationId = getOrCreateCorrelationId(requestHeaders);
  const log = logger.child({ correlationId, route: "/api/coach" });

  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "coach_invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { message, locale } = parsed.data;

  const env = getEnv();
  const db = getDb();

  // Cost cap first (§3c): over the cap degrades gracefully, never errors.
  const today = utcToday();
  const usage = await db.query.aiUsageDaily.findFirst({
    where: and(eq(aiUsageDaily.userId, userId), eq(aiUsageDaily.usageDate, today)),
  });
  const cap = checkDailyCap(usage?.costUsdMicros ?? 0, env.AI_DAILY_USD_CAP_PER_USER);
  if (!cap.allowed) {
    log.info({ event: "coach.degraded", userId }, "daily AI cap reached");
    return NextResponse.json(
      { degraded: true, reason: "daily_cap" },
      { headers: { "x-correlation-id": correlationId } },
    );
  }

  // Context load (§3c): profile, grounding, recent history — in parallel.
  const [profile, history] = await Promise.all([
    db.query.freelancerProfiles.findFirst({
      where: eq(freelancerProfiles.userId, userId),
    }),
    db.query.coachMessages.findMany({
      where: eq(coachMessages.userId, userId),
      orderBy: [asc(coachMessages.createdAt)],
      limit: HISTORY_TURNS * 2,
    }),
  ]);

  const platform = (profile?.targetPlatform ?? "fiverr") as "fiverr" | "upwork";
  const grounding = retrieveGrounding(message, platform, loadPlatformTracks());

  const context = [
    "## USER PROFILE",
    profile
      ? `skill: ${profile.skillId} (${profile.skillTrack}) · platform: ${profile.targetPlatform} · ` +
        `weekly hours: ${profile.weeklyHours} · english confidence: ${profile.englishConfidence} · ` +
        `experience: ${profile.experience} · journey: ${profile.journeyState} · ui locale: ${locale}`
      : `no profile yet · ui locale: ${locale} — coach them toward completing onboarding`,
    "",
    "## GROUNDING (the only source for platform specifics)",
    grounding.length
      ? grounding
          .map(
            (g) =>
              `- [${g.kind}] (${g.trackId}/${g.itemId}) ${g.text.en}\n  bn: ${g.text.bn}`,
          )
          .join("\n")
      : "(nothing retrieved — do not state platform specifics; say you don't know)",
  ].join("\n");

  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.ANTHROPIC_MODEL_CRAFT;

  log.info({ event: "coach.start", userId, grounded: grounding.length });

  const result = streamText({
    model: anthropic(model),
    system: `${systemPrompt()}\n\n${context}`,
    messages: [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ],
    maxOutputTokens: 1000,
    onFinish: async ({ text, usage: turnUsage }) => {
      const tokensIn = turnUsage.inputTokens ?? 0;
      const tokensOut = turnUsage.outputTokens ?? 0;
      const cost = costUsdMicros(model, tokensIn, tokensOut);
      try {
        await db.insert(coachMessages).values([
          { userId, role: "user", content: message, locale, correlationId },
          {
            userId,
            role: "assistant",
            content: text,
            locale,
            tokensIn,
            tokensOut,
            costUsdMicros: cost,
            model,
            promptVersion: PROMPT_VERSION,
            correlationId,
          },
        ]);
        await db
          .insert(aiUsageDaily)
          .values({ userId, usageDate: today, costUsdMicros: cost, calls: 1 })
          .onConflictDoUpdate({
            target: [aiUsageDaily.userId, aiUsageDaily.usageDate],
            set: {
              costUsdMicros: sql`${aiUsageDaily.costUsdMicros} + ${cost}`,
              calls: sql`${aiUsageDaily.calls} + 1`,
            },
          });
        log.info({ event: "coach.finish", userId, tokensIn, tokensOut, cost });
      } catch (err) {
        // Accounting failure must not break the reply — but it is loud.
        log.error({ event: "coach.accounting_failed", err });
      }
    },
    onError: ({ error }) => {
      log.error({ event: "coach.stream_failed", err: error });
    },
  });

  return result.toTextStreamResponse({
    headers: { "x-correlation-id": correlationId },
  });
}
