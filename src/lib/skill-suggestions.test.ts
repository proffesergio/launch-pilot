import { describe, it, expect } from "vitest";

import bn from "../../messages/bn.json";
import en from "../../messages/en.json";
import { keywordFallback } from "./skills";

/**
 * The onboarding suggestion chips promise a specific skill. Even when the AI
 * classifier is down (keyword fallback path), tapping a chip must land on
 * exactly that skill in both languages — otherwise the chip lies.
 */
describe("onboarding skill suggestion phrases", () => {
  for (const [lang, messages] of [
    ["en", en],
    ["bn", bn],
  ] as const) {
    it(`every ${lang} phrase keyword-classifies to its own skill`, () => {
      const suggestions = messages.onboarding.skill.suggestions as Record<
        string,
        string
      >;
      expect(Object.keys(suggestions).length).toBeGreaterThan(0);
      for (const [skillId, phrase] of Object.entries(suggestions)) {
        expect(keywordFallback(phrase), `${lang}: "${phrase}"`).toBe(skillId);
      }
    });
  }
});
