import { defineRouting } from "next-intl/routing";

// Global-first: English is the default/fallback locale so the product reads
// for a newcomer anywhere in the world (ADR-0011). Bangla stays a first-class
// locale, and browser-language negotiation still auto-lands a Bangla browser
// on /bn. "always" keeps /en and /bn canonical so links, analytics, and TTS
// caching never see an ambiguous unprefixed URL.
export const routing = defineRouting({
  locales: ["en", "bn"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
