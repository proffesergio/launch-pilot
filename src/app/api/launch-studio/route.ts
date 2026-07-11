import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { aiUsageDaily, freelancerProfiles, launchAssets } from "@/db/schema";
import { checkDailyCap, costUsdMicros } from "@/lib/ai-cost";
import { captureServer } from "@/lib/analytics";
import { getAuth } from "@/lib/auth";
import { loadPlatformTracks } from "@/lib/content";
import { getOrCreateCorrelationId } from "@/lib/correlation";
import { getEnv } from "@/lib/env";
import { getFlag } from "@/lib/flags";
import {
  ASSET_KINDS,
  assetKindPlatform,
  schemaForKind,
} from "@/lib/launch-assets";
import {
  GENERATOR_VERSION,
  generateAsset,
  reviewAsset,
  type ProfileContext,
} from "@/lib/launch-studio";
import { logger } from "@/lib/logger";
import { awardXp } from "@/lib/xp-service";

/**
 * Launch Studio API (M3.5). One POST, dispatched by `action`. Mirrors the coach
 * route's contract: auth → flag → (for AI actions) daily cost cap that degrades
 * gracefully → structured logs with a correlation id. `generate` and `review`
 * cost money and are capped; `save` and `publish` are free. `publish` is the
 * decoupled reward — it marks the asset published and awards idempotent XP; the
 * roadmap boss mission stays the user's to tick, keeping journey state in one
 * place. Nothing here ever calls a marketplace.
 */

const kindField = z.enum(ASSET_KINDS);

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generate"), kind: kindField }),
  z.object({ action: z.literal("save"), kind: kindField, content: z.unknown() }),
  z.object({ action: z.literal("review"), kind: kindField, content: z.unknown() }),
  z.object({ action: z.literal("publish"), kind: kindField }),
]);

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

async function accountCost(
  userId: string,
  today: string,
  cost: number,
): Promise<void> {
  await getDb()
    .insert(aiUsageDaily)
    .values({ userId, usageDate: today, costUsdMicros: cost, calls: 1 })
    .onConflictDoUpdate({
      target: [aiUsageDaily.userId, aiUsageDaily.usageDate],
      set: {
        costUsdMicros: sql`${aiUsageDaily.costUsdMicros} + ${cost}`,
        calls: sql`${aiUsageDaily.calls} + 1`,
      },
    });
}

export async function POST(request: Request) {
  if (!getFlag("m35_launch_studio")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const requestHeaders = await headers();
  const correlationId = getOrCreateCorrelationId(requestHeaders);
  const log = logger.child({ correlationId, route: "/api/launch-studio" });
  const withId = { headers: { "x-correlation-id": correlationId } };

  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400, ...withId },
    );
  }
  const body = parsed.data;
  const { kind } = body;
  const platform = assetKindPlatform(kind);

  const db = getDb();
  const env = getEnv();

  // ── save: persist edited content, no AI ────────────────────────────────
  if (body.action === "save") {
    const valid = schemaForKind(kind).safeParse(body.content);
    if (!valid.success) {
      return NextResponse.json(
        { error: "invalid_content", issues: valid.error.issues },
        { status: 400, ...withId },
      );
    }
    const track = loadPlatformTracks()[platform];
    await db
      .insert(launchAssets)
      .values({
        userId,
        platform,
        assetKind: kind,
        content: valid.data,
        trackVersion: track.version,
        generatedBy: GENERATOR_VERSION,
        status: "draft",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [launchAssets.userId, launchAssets.assetKind],
        set: { content: valid.data, status: "draft", updatedAt: new Date() },
      });
    log.info({ event: "studio.saved", userId, kind });
    return NextResponse.json({ ok: true, status: "draft" }, withId);
  }

  // ── publish: mark published + idempotent XP, no AI, no journey mutation ─
  if (body.action === "publish") {
    const updated = await db
      .update(launchAssets)
      .set({ status: "published", updatedAt: new Date() })
      .where(
        and(eq(launchAssets.userId, userId), eq(launchAssets.assetKind, kind)),
      )
      .returning({ id: launchAssets.id });
    if (updated.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404, ...withId });
    }
    if (getFlag("m4_gamification")) {
      // One award per (user, kind); a re-publish no-ops on the unique index.
      await awardXp({
        userId,
        kind: "asset_published",
        sourceId: kind,
        correlationId,
      });
    }
    await captureServer(userId, "launch_asset_published", {
      platform,
      asset_kind: kind,
      correlation_id: correlationId,
    });
    log.info({ event: "studio.published", userId, kind });
    return NextResponse.json({ ok: true, status: "published" }, withId);
  }

  // ── generate / review: AI actions, cost-capped ─────────────────────────
  const today = utcToday();
  const usage = await db.query.aiUsageDaily.findFirst({
    where: and(
      eq(aiUsageDaily.userId, userId),
      eq(aiUsageDaily.usageDate, today),
    ),
  });
  const cap = checkDailyCap(
    usage?.costUsdMicros ?? 0,
    env.AI_DAILY_USD_CAP_PER_USER,
  );
  if (!cap.allowed) {
    log.info({ event: "studio.degraded", userId }, "daily AI cap reached");
    return NextResponse.json({ degraded: true, reason: "daily_cap" }, withId);
  }

  const track = loadPlatformTracks()[platform];

  if (body.action === "review") {
    const valid = schemaForKind(kind).safeParse(body.content);
    if (!valid.success) {
      return NextResponse.json(
        { error: "invalid_content", issues: valid.error.issues },
        { status: 400, ...withId },
      );
    }
    try {
      const { findings, usage: u } = await reviewAsset(kind, valid.data, track);
      await accountCost(userId, today, costUsdMicros(u.model, u.inputTokens, u.outputTokens));
      log.info({ event: "studio.reviewed", userId, kind, findings: findings.length });
      return NextResponse.json({ ok: true, findings }, withId);
    } catch (err) {
      log.error({ event: "studio.review_failed", userId, kind, err });
      return NextResponse.json({ error: "review_failed" }, { status: 502, ...withId });
    }
  }

  // action === "generate"
  const profile = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, userId),
  });
  if (!profile) {
    return NextResponse.json({ error: "no_profile" }, { status: 409, ...withId });
  }
  const ctx: ProfileContext = {
    skillId: profile.skillId,
    skillTrack: profile.skillTrack,
    rawSkill:
      (profile.rawInputs as { rawSkill?: string })?.rawSkill ?? profile.skillId,
    englishConfidence: profile.englishConfidence,
    experience: profile.experience,
  };

  try {
    const { content, usage: u } = await generateAsset(kind, ctx, track);
    await accountCost(userId, today, costUsdMicros(u.model, u.inputTokens, u.outputTokens));
    await db
      .insert(launchAssets)
      .values({
        userId,
        platform,
        assetKind: kind,
        content,
        trackVersion: track.version,
        generatedBy: GENERATOR_VERSION,
        status: "draft",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [launchAssets.userId, launchAssets.assetKind],
        set: {
          content,
          trackVersion: track.version,
          generatedBy: GENERATOR_VERSION,
          status: "draft",
          updatedAt: new Date(),
        },
      });
    log.info({ event: "studio.generated", userId, kind });
    return NextResponse.json(
      { ok: true, content, status: "draft", trackVersion: track.version },
      withId,
    );
  } catch (err) {
    // Includes the English-only guard tripping on a bad generation.
    log.error({ event: "studio.generate_failed", userId, kind, err });
    return NextResponse.json({ error: "generation_failed" }, { status: 502, ...withId });
  }
}
