import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { freelancerProfiles, roadmapMissions, userRoadmaps } from "@/db/schema";
import { captureServer } from "./analytics";
import { loadMissionTemplates, loadPlatformTracks } from "./content";
import { transition, type JourneyState } from "./journey";
import { logger } from "./logger";
import { generateRoadmap, type RoadmapProfile } from "./roadmap";

/**
 * Creates and persists a user's roadmap from their profile (idempotent: an
 * existing roadmap is returned untouched — regeneration is a deliberate,
 * separate feature, not a side effect). Advances the journey to foundation.
 */
export async function ensureRoadmap(userId: string, correlationId: string) {
  const db = getDb();
  const log = logger.child({ correlationId, service: "ensureRoadmap" });

  const existing = await db.query.userRoadmaps.findFirst({
    where: eq(userRoadmaps.userId, userId),
  });
  if (existing) return { roadmapId: existing.id, created: false };

  const profile = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, userId),
  });
  if (!profile) return { roadmapId: null, created: false };

  const generated = generateRoadmap(
    profile as unknown as RoadmapProfile,
    loadMissionTemplates(),
    loadPlatformTracks(),
  );

  const [roadmap] = await db
    .insert(userRoadmaps)
    .values({
      userId,
      trackVersionPins: generated.trackVersionPins,
      generatedBy: generated.generatedBy,
    })
    .returning({ id: userRoadmaps.id });

  await db.insert(roadmapMissions).values(
    generated.missions.map((m, index) => ({
      roadmapId: roadmap.id,
      missionKey: m.key,
      phase: m.phase,
      quest: m.quest,
      position: index,
      status: m.status,
      unlockedAt: m.status === "unlocked" ? new Date() : null,
    })),
  );

  const nextState = transition(
    profile.journeyState as JourneyState,
    "roadmap_generated",
  );
  if (nextState) {
    await db
      .update(freelancerProfiles)
      .set({ journeyState: nextState, updatedAt: new Date() })
      .where(eq(freelancerProfiles.userId, userId));
  }

  await captureServer(userId, "roadmap_generated", {
    missions: generated.missions.length,
    pins: generated.trackVersionPins,
    generated_by: generated.generatedBy,
    correlation_id: correlationId,
  });
  log.info({
    event: "roadmap.generated",
    userId,
    missions: generated.missions.length,
  });
  return { roadmapId: roadmap.id, created: true };
}
