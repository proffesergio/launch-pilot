import { defineRouting } from "next-intl/routing";

// Bangla-first: the primary audience reads Bangla; English is the second
// first-class locale (ADR-0006). "always" keeps /bn and /en canonical so
// links, analytics, and TTS caching never see an ambiguous unprefixed URL.
export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
