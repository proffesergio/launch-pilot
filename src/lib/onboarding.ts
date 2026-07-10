import { z } from "zod";

/**
 * The five onboarding answers (M1). Everything the roadmap generator and
 * coach personalize on. `rawSkill` stays free-text — the user's own words are
 * preserved in freelancer_profiles.raw_inputs for coach context and future
 * re-classification (architecture §4).
 */
export const OnboardingAnswersSchema = z.object({
  rawSkill: z.string().trim().min(1).max(300),
  targetPlatform: z.enum(["fiverr", "upwork"]),
  weeklyHours: z.coerce.number().int().min(1).max(80),
  englishConfidence: z.enum(["low", "medium", "high"]),
  experience: z.enum(["none", "some", "experienced"]),
});

export type OnboardingAnswers = z.infer<typeof OnboardingAnswersSchema>;
