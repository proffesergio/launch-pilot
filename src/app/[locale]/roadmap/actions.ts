"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { getDb } from "@/db";
import { freelancerProfiles, roadmapMissions, userRoadmaps } from "@/db/schema";
import { captureServer } from "@/lib/analytics";
import { loadMissionTemplates } from "@/lib/content";
import { getOrCreateCorrelationId } from "@/lib/correlation";
import { getAuth } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { transition, type JourneyState } from "@/lib/journey";
import { logger } from "@/lib/logger";
import { completionEffects } from "@/lib/missions";
import { missionXp } from "@/lib/xp";
import { awardXp } from "@/lib/xp-service";

const InputSchema = z.object({ missionId: z.string().uuid() });

export type CompleteMissionResult =
  | { ok: true; xp: number; journeyAdvanced: boolean }
  | {
      ok: false;
      code: "unauthenticated" | "invalid" | "not_found" | "not_unlocked" | "save_failed";
    };

/**
 * The M5 write: mark an unlocked mission done, unlock the next one, fire the
 * boss journey transition, award mission XP. No interactive transaction on
 * the HTTP driver — the done-update is guarded (`status = 'unlocked'`) so a
 * double submit can never double-award, and later steps log loud on failure.
 */
export async function completeMission(
  input: unknown,
): Promise<CompleteMissionResult> {
  const requestHeaders = await headers();
  const correlationId = getOrCreateCorrelationId(requestHeaders);
  const log = logger.child({ correlationId, action: "completeMission" });

  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return { ok: false, code: "unauthenticated" };

  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid" };
  const { missionId } = parsed.data;

  const db = getDb();
  const mission = await db.query.roadmapMissions.findFirst({
    where: eq(roadmapMissions.id, missionId),
  });
  if (!mission) return { ok: false, code: "not_found" };

  const roadmap = await db.query.userRoadmaps.findFirst({
    where: and(
      eq(userRoadmaps.id, mission.roadmapId),
      eq(userRoadmaps.userId, session.user.id),
    ),
  });
  if (!roadmap) return { ok: false, code: "not_found" }; // not yours = not found

  const rows = await db.query.roadmapMissions.findMany({
    where: eq(roadmapMissions.roadmapId, mission.roadmapId),
    orderBy: [asc(roadmapMissions.position)],
  });
  const templates = new Map(loadMissionTemplates().map((m) => [m.key, m]));
  const bossKeys = new Set(
    [...templates.values()].filter((m) => m.type === "boss").map((m) => m.key),
  );

  const effects = completionEffects(rows, missionId, bossKeys);
  if (!effects.valid) {
    return { ok: false, code: effects.reason };
  }

  // Guarded write: only an unlocked row flips to done. A lost race no-ops.
  const done = await db
    .update(roadmapMissions)
    .set({ status: "done", completedAt: new Date() })
    .where(
      and(eq(roadmapMissions.id, missionId), eq(roadmapMissions.status, "unlocked")),
    )
    .returning({ id: roadmapMissions.id });
  if (done.length === 0) return { ok: false, code: "not_unlocked" };

  try {
    if (effects.unlockIds.length > 0) {
      await db
        .update(roadmapMissions)
        .set({ status: "unlocked", unlockedAt: new Date() })
        .where(
          and(
            inArray(roadmapMissions.id, effects.unlockIds),
            eq(roadmapMissions.status, "locked"),
          ),
        );
    }

    let journeyAdvanced = false;
    if (effects.journeyEvent) {
      const profile = await db.query.freelancerProfiles.findFirst({
        where: eq(freelancerProfiles.userId, session.user.id),
      });
      const nextState =
        profile &&
        transition(profile.journeyState as JourneyState, effects.journeyEvent);
      if (nextState) {
        await db
          .update(freelancerProfiles)
          .set({ journeyState: nextState, updatedAt: new Date() })
          .where(eq(freelancerProfiles.userId, session.user.id));
        journeyAdvanced = true;
      }
    }

    const template = templates.get(mission.missionKey);
    const xp = template ? missionXp(template.estMinutes, template.category) : 0;
    if (getFlag("m4_gamification") && xp > 0) {
      await awardXp({
        userId: session.user.id,
        kind: "mission_completed",
        sourceId: mission.id,
        amount: xp,
        correlationId,
      });
    }

    await captureServer(session.user.id, "mission_completed", {
      mission_key: mission.missionKey,
      phase: mission.phase,
      xp,
      journey_advanced: journeyAdvanced,
      correlation_id: correlationId,
    });
    log.info({
      event: "mission.completed",
      userId: session.user.id,
      missionKey: mission.missionKey,
      xp,
    });
    return { ok: true, xp, journeyAdvanced };
  } catch (err) {
    // The mission IS done (guarded write landed); follow-ups failed loud.
    log.error({ event: "mission.followup_failed", missionId, err });
    return { ok: true, xp: 0, journeyAdvanced: false };
  }
}
