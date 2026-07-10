import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

import { getEnv } from "./env";
import { SKILLS, type SkillId } from "./skills";

/**
 * The production classifier for normalizeSkill: Haiku, structured output,
 * Zod-fenced to the canonical catalog (cost principle: Haiku classifies,
 * Sonnet crafts). Callers already handle a throw by falling back to keywords,
 * so this stays deliberately throw-happy.
 */
const ClassificationSchema = z.object({
  skillId: z.enum(SKILLS),
  confidence: z.enum(["high", "low"]),
});

export async function aiClassifySkill(
  rawText: string,
): Promise<{ skillId: SkillId; confidence: "high" | "low" }> {
  const env = getEnv();
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const { object } = await generateObject({
    model: anthropic(env.ANTHROPIC_MODEL_FAST),
    schema: ClassificationSchema,
    prompt:
      `Classify this freelancer's self-described skill (may be Bangla or English) ` +
      `into exactly one canonical skill id. Use "general_freelancing" only when ` +
      `nothing fits. Mark confidence "low" when you are unsure.\n\n` +
      `Self-description: ${JSON.stringify(rawText)}`,
  });
  return object;
}
