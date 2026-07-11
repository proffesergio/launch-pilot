"use server";

import { headers } from "next/headers";

import { getDb } from "@/db";
import { freelancerProfiles } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { captureServer } from "@/lib/analytics";
import { getOrCreateCorrelationId } from "@/lib/correlation";
import { transition } from "@/lib/journey";
import { logger } from "@/lib/logger";
import { getFlag } from "@/lib/flags";
import { OnboardingAnswersSchema } from "@/lib/onboarding";
import { ensureRoadmap } from "@/lib/roadmap-service";
import { aiClassifySkill } from "@/lib/skill-classifier";
import { normalizeSkill } from "@/lib/skills";
import { awardXp } from "@/lib/xp-service";

export type CompleteOnboardingResult =
  | { ok: true }
  | { ok: false; code: "unauthenticated" | "invalid_answers" | "save_failed" };

/**
 * The M1 write: validate answers → classify skill (Haiku, keyword fallback)
 * → upsert the profile with the journey advanced to skill_assessment →
 * capture onboarding_completed. Stable error codes, never a throw to the UI.
 */
export async function completeOnboarding(
  input: unknown,
): Promise<CompleteOnboardingResult> {
  const requestHeaders = await headers();
  const correlationId = getOrCreateCorrelationId(requestHeaders);
  const log = logger.child({ correlationId, action: "completeOnboarding" });

  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return { ok: false, code: "unauthenticated" };

  const parsed = OnboardingAnswersSchema.safeParse(input);
  if (!parsed.success) {
    log.warn({ event: "onboarding.invalid", issues: parsed.error.issues });
    return { ok: false, code: "invalid_answers" };
  }
  const answers = parsed.data;

  const skill = await normalizeSkill(answers.rawSkill, {
    classify: aiClassifySkill,
  });
  log.info({
    event: "onboarding.skill_classified",
    skillId: skill.skillId,
    source: skill.source,
    confidence: skill.confidence,
  });

  const journeyState = transition("onboarding", "profile_saved");
  const profile = {
    skillId: skill.skillId,
    skillTrack: skill.skillTrack,
    skillConfidence: skill.confidence,
    skillSource: skill.source,
    targetPlatform: answers.targetPlatform,
    weeklyHours: answers.weeklyHours,
    englishConfidence: answers.englishConfidence,
    experience: answers.experience,
    rawInputs: { rawSkill: answers.rawSkill },
    journeyState: journeyState ?? "skill_assessment",
    updatedAt: new Date(),
  };

  try {
    await getDb()
      .insert(freelancerProfiles)
      .values({ userId: session.user.id, ...profile })
      .onConflictDoUpdate({
        target: freelancerProfiles.userId,
        set: profile,
      });
  } catch (err) {
    log.error({ event: "onboarding.save_failed", err });
    return { ok: false, code: "save_failed" };
  }

  if (getFlag("m4_gamification")) {
    await awardXp({
      userId: session.user.id,
      kind: "onboarding_completed",
      sourceId: "once",
      correlationId,
    });
  }

  // M2: a fresh profile flows straight into its roadmap (diagram 3a).
  if (getFlag("m2_roadmap")) {
    try {
      await ensureRoadmap(session.user.id, correlationId);
    } catch (err) {
      // Roadmap can be generated later from the dashboard; onboarding stands.
      log.error({ event: "onboarding.roadmap_failed", err });
    }
  }

  await captureServer(session.user.id, "onboarding_completed", {
    skill_id: skill.skillId,
    skill_source: skill.source,
    target_platform: answers.targetPlatform,
    weekly_hours: answers.weeklyHours,
    english_confidence: answers.englishConfidence,
    experience: answers.experience,
    correlation_id: correlationId,
  });
  log.info({ event: "onboarding.completed", userId: session.user.id });
  return { ok: true };
}
