import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { aiUsageDaily, cvApplications } from "@/db/schema";
import { routing } from "@/i18n/routing";
import { checkDailyCap, costUsdMicros } from "@/lib/ai-cost";
import { getAuth } from "@/lib/auth";
import { getOrCreateCorrelationId } from "@/lib/correlation";
import { CvInputSchema, GENERATOR_VERSION } from "@/lib/cv-coach";
import {
  createDefaultCvGenerator,
  generateApplication,
} from "@/lib/cv-coach-generate";
import { getEnv } from "@/lib/env";
import { getFlag } from "@/lib/flags";
import { logger } from "@/lib/logger";
import { isPlatformId, platformCategory } from "@/lib/platforms";

/**
 * CV & Application Coach API (Slice 13, ADR-0015). One POST (generate + persist)
 * and one DELETE (one-click removal). Mirrors the coach route: flag → auth →
 * validated input → daily cost cap that degrades gracefully → structured logs
 * with a correlation id. Advisory only; nothing here touches a marketplace.
 *
 * Privacy: a CV is personal data. Raw cvText / jobDescription NEVER reach the
 * logs — only metadata (lengths, platform, ids). Retention is minimal; DELETE
 * removes the row outright.
 */

const BodySchema = z.object({
  cvText: CvInputSchema.shape.cvText,
  jobDescription: CvInputSchema.shape.jobDescription,
  platform: z.string().refine(
    (v) => isPlatformId(v) && platformCategory(v) === "job_board",
    { message: "platform must be a job_board platform" },
  ),
  locale: z.enum(routing.locales),
});

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  if (!getFlag("cv_coach")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const requestHeaders = await headers();
  const correlationId = getOrCreateCorrelationId(requestHeaders);
  const log = logger.child({ correlationId, route: "/api/cv-coach" });
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
  // Never destructure raw text into a log — keep it out of scope names too.
  const { cvText, jobDescription, platform, locale } = parsed.data;

  const env = getEnv();
  const db = getDb();

  // Cost cap first: over the cap degrades gracefully, never errors.
  const today = utcToday();
  const usage = await db.query.aiUsageDaily.findFirst({
    where: and(eq(aiUsageDaily.userId, userId), eq(aiUsageDaily.usageDate, today)),
  });
  const cap = checkDailyCap(usage?.costUsdMicros ?? 0, env.AI_DAILY_USD_CAP_PER_USER);
  if (!cap.allowed) {
    log.info({ event: "cv_coach.degraded", userId }, "daily AI cap reached");
    return NextResponse.json({ degraded: true, reason: "daily_cap" }, withId);
  }

  log.info({
    event: "cv_coach.start",
    userId,
    platform,
    locale,
    cvChars: cvText.length,
    jdChars: jobDescription.length,
  });

  try {
    const { result, tokensIn, tokensOut, model } = await generateApplication(
      { cvText, jobDescription },
      createDefaultCvGenerator(),
    );

    const cost = costUsdMicros(model, tokensIn, tokensOut);
    const [inserted] = await db
      .insert(cvApplications)
      .values({
        userId,
        platform,
        cvText,
        jobDescription,
        result,
        generatedBy: GENERATOR_VERSION,
      })
      .returning({ id: cvApplications.id });

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

    log.info({
      event: "cv_coach.finish",
      userId,
      id: inserted.id,
      platform,
      tokensIn,
      tokensOut,
      cost,
    });
    return NextResponse.json({ id: inserted.id, result }, withId);
  } catch (err) {
    // Includes a generation that drifts and fails the schema parse.
    log.error({ event: "cv_coach.generate_failed", userId, platform, err });
    return NextResponse.json(
      { error: "generation_failed" },
      { status: 502, ...withId },
    );
  }
}

export async function DELETE(request: Request) {
  if (!getFlag("cv_coach")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const requestHeaders = await headers();
  const correlationId = getOrCreateCorrelationId(requestHeaders);
  const log = logger.child({ correlationId, route: "/api/cv-coach" });
  const withId = { headers: { "x-correlation-id": correlationId } };

  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  const id = new URL(request.url).searchParams.get("id");
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsedId.error.issues },
      { status: 400, ...withId },
    );
  }

  const deleted = await getDb()
    .delete(cvApplications)
    .where(
      and(
        eq(cvApplications.id, parsedId.data),
        eq(cvApplications.userId, userId),
      ),
    )
    .returning({ id: cvApplications.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404, ...withId });
  }

  log.info({ event: "cv_coach.deleted", userId, id: parsedId.data });
  return NextResponse.json({ deleted: true }, withId);
}
