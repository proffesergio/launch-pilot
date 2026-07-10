/**
 * Canonical skill catalog (M1). Curated, versioned in-repo — the Haiku
 * classifier maps free-text onto exactly this set, and anything it invents
 * outside the set is rejected. `general_freelancing` is the honest catch-all,
 * never a guess.
 */

export const SKILLS = [
  "writing",
  "graphic_design",
  "web_development",
  "video_editing",
  "virtual_assistance",
  "data_entry",
  "translation",
  "social_media",
  "voice_over",
  "tutoring",
  "general_freelancing",
] as const;

export type SkillId = (typeof SKILLS)[number];

export type SkillTrack =
  | "design"
  | "dev"
  | "writing"
  | "video"
  | "audio"
  | "support"
  | "marketing"
  | "education"
  | "general";

const TRACKS: Record<SkillId, SkillTrack> = {
  writing: "writing",
  graphic_design: "design",
  web_development: "dev",
  video_editing: "video",
  virtual_assistance: "support",
  data_entry: "support",
  translation: "writing",
  social_media: "marketing",
  voice_over: "audio",
  tutoring: "education",
  general_freelancing: "general",
};

export function trackFor(skill: SkillId): SkillTrack {
  return TRACKS[skill];
}

/**
 * Keyword heuristic — the graceful-degrade path when Haiku is unavailable
 * or over budget. Bilingual on purpose: most first-run users type Bangla.
 */
const KEYWORDS: [SkillId, RegExp][] = [
  ["graphic_design", /design|logo|banner|poster|graphic|ডিজাইন|লোগো|ব্যানার/i],
  ["video_editing", /video|reel|edit.*(video|reel)|ভিডিও|রিল/i],
  ["web_development", /website|web ?dev|react|frontend|backend|ওয়েবসাইট|কোডিং|code/i],
  ["translation", /translat|অনুবাদ/i],
  ["writing", /writ|blog|article|content|লেখা|লিখি|আর্টিকেল|কনটেন্ট/i],
  ["data_entry", /data entry|excel|spreadsheet|ডাটা এন্ট্রি|এক্সেল/i],
  ["virtual_assistance", /assistant|admin support|ভার্চুয়াল|সহকারী/i],
  ["social_media", /social media|instagram|facebook|tiktok|সোশ্যাল|ফেসবুক/i],
  ["voice_over", /voice|dubbing|ভয়েস|কণ্ঠ/i],
  ["tutoring", /tutor|teach|পড়াই|শেখাই|টিউটর/i],
];

export function keywordFallback(rawText: string): SkillId | null {
  for (const [skill, pattern] of KEYWORDS) {
    if (pattern.test(rawText)) return skill;
  }
  return null;
}

export type SkillClassification = {
  skillId: SkillId;
  skillTrack: SkillTrack;
  confidence: "high" | "low";
  source: "ai" | "fallback";
};

type Classifier = (
  rawText: string,
) => Promise<{ skillId: SkillId; confidence: "high" | "low" }>;

function isCanonical(skillId: string): skillId is SkillId {
  return (SKILLS as readonly string[]).includes(skillId);
}

/**
 * Normalize free-text into the catalog. The classifier (Haiku in production)
 * is injected so this stays testable and degrades gracefully: classifier
 * error or off-catalog output → bilingual keyword fallback → catch-all.
 */
export async function normalizeSkill(
  rawText: string,
  opts: { classify: Classifier },
): Promise<SkillClassification> {
  try {
    const ai = await opts.classify(rawText);
    if (isCanonical(ai.skillId)) {
      return {
        skillId: ai.skillId,
        skillTrack: trackFor(ai.skillId),
        confidence: ai.confidence,
        source: "ai",
      };
    }
  } catch {
    // fall through to the keyword path
  }
  const guess = keywordFallback(rawText) ?? "general_freelancing";
  return {
    skillId: guess,
    skillTrack: trackFor(guess),
    confidence: "low",
    source: "fallback",
  };
}
