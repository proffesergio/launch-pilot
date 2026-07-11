import { desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { xpEvents, type XpEventRow } from "@/db/schema";
import { captureServer } from "./analytics";
import {
  XP_AWARDS,
  XpEventKindSchema,
  computeStreak,
  earnedBadges,
  levelFromXp,
  longestStreak,
  utcToday,
  type BadgeId,
  type LevelInfo,
  type XpEventKind,
} from "./gamification";
import { logger } from "./logger";

/**
 * The ledger writes/reads around the pure logic in gamification.ts.
 * Awards are idempotent (unique user+kind+sourceId, conflict = no-op) and
 * never throw to callers — losing 10 XP must not break the coach reply that
 * earned it.
 */

export type AwardInput = {
  userId: string;
  kind: XpEventKind;
  /** "once" | YYYY-MM-DD | mission row id — see schema comment. */
  sourceId: string;
  /** Required for mission_completed, ignored for fixed-award kinds. */
  amount?: number;
  correlationId?: string;
};

export async function awardXp(input: AwardInput): Promise<{ awarded: boolean }> {
  const log = logger.child({
    correlationId: input.correlationId,
    service: "awardXp",
  });
  try {
    const kind = XpEventKindSchema.parse(input.kind);
    const amount =
      kind === "mission_completed" ? (input.amount ?? 0) : XP_AWARDS[kind];
    if (amount <= 0) {
      log.warn({ event: "xp.award_skipped", kind }, "non-positive amount");
      return { awarded: false };
    }

    const inserted = await getDb()
      .insert(xpEvents)
      .values({
        userId: input.userId,
        kind,
        amount,
        sourceId: input.sourceId,
        day: utcToday(),
      })
      .onConflictDoNothing()
      .returning({ id: xpEvents.id });

    if (inserted.length === 0) return { awarded: false }; // already earned

    log.info({ event: "xp.awarded", userId: input.userId, kind, amount });
    await captureServer(input.userId, "xp_awarded", {
      kind,
      amount,
      correlation_id: input.correlationId,
    });
    return { awarded: true };
  } catch (err) {
    log.error({ event: "xp.award_failed", userId: input.userId, err });
    return { awarded: false };
  }
}

export type GamificationSummary = {
  totalXp: number;
  level: LevelInfo;
  streak: number;
  recent: Pick<XpEventRow, "kind" | "amount" | "day" | "createdAt">[];
};

const EMPTY_SUMMARY: GamificationSummary = {
  totalXp: 0,
  level: levelFromXp(0),
  streak: 0,
  recent: [],
};

/** Everything the dashboard/profile need, or a zeroed summary on failure. */
export async function getGamificationSummary(
  userId: string,
): Promise<GamificationSummary> {
  try {
    const db = getDb();
    const [totals, days, recent] = await Promise.all([
      db
        .select({ total: sql<number>`coalesce(sum(${xpEvents.amount}), 0)` })
        .from(xpEvents)
        .where(eq(xpEvents.userId, userId)),
      db
        .selectDistinct({ day: xpEvents.day })
        .from(xpEvents)
        .where(eq(xpEvents.userId, userId)),
      db.query.xpEvents.findMany({
        where: eq(xpEvents.userId, userId),
        orderBy: [desc(xpEvents.createdAt)],
        limit: 8,
        columns: { kind: true, amount: true, day: true, createdAt: true },
      }),
    ]);

    const totalXp = Number(totals[0]?.total ?? 0);
    return {
      totalXp,
      level: levelFromXp(totalXp),
      streak: computeStreak(
        days.map((d) => d.day),
        utcToday(),
      ),
      recent,
    };
  } catch (err) {
    // The dashboard renders zeroed rather than crashing; the failure is loud.
    logger.error({ event: "xp.summary_failed", userId, err });
    return EMPTY_SUMMARY;
  }
}

export type ProfileStats = GamificationSummary & {
  badges: BadgeId[];
  activeDays: number;
  timeline: Pick<XpEventRow, "kind" | "amount" | "day" | "createdAt">[];
};

/** The profile page's read: summary + badges + a longer activity timeline. */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  try {
    const db = getDb();
    const [totals, days, kinds, timeline] = await Promise.all([
      db
        .select({ total: sql<number>`coalesce(sum(${xpEvents.amount}), 0)` })
        .from(xpEvents)
        .where(eq(xpEvents.userId, userId)),
      db
        .selectDistinct({ day: xpEvents.day })
        .from(xpEvents)
        .where(eq(xpEvents.userId, userId)),
      db
        .selectDistinct({ kind: xpEvents.kind })
        .from(xpEvents)
        .where(eq(xpEvents.userId, userId)),
      db.query.xpEvents.findMany({
        where: eq(xpEvents.userId, userId),
        orderBy: [desc(xpEvents.createdAt)],
        limit: 30,
        columns: { kind: true, amount: true, day: true, createdAt: true },
      }),
    ]);

    const totalXp = Number(totals[0]?.total ?? 0);
    const dayList = days.map((d) => d.day);
    const level = levelFromXp(totalXp);
    return {
      totalXp,
      level,
      streak: computeStreak(dayList, utcToday()),
      recent: timeline.slice(0, 8),
      badges: earnedBadges({
        kinds: kinds
          .map((k) => XpEventKindSchema.safeParse(k.kind))
          .flatMap((k) => (k.success ? [k.data] : [])),
        bestStreak: longestStreak(dayList),
        level: level.level,
        totalXp,
      }),
      activeDays: dayList.length,
      timeline,
    };
  } catch (err) {
    logger.error({ event: "xp.profile_stats_failed", userId, err });
    return { ...EMPTY_SUMMARY, badges: [], activeDays: 0, timeline: [] };
  }
}
