import { describe, it, expect } from "vitest";

import { routing } from "./routing";

describe("locale routing", () => {
  it("supports exactly en and bn, with English as the default", () => {
    expect([...routing.locales]).toEqual(["en", "bn"]);
    expect(routing.defaultLocale).toBe("en");
  });

  it("always prefixes URLs with the locale, so /bn and /en are canonical", () => {
    expect(routing.localePrefix).toBe("always");
  });
});
