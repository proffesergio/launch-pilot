import { describe, it, expect } from "vitest";

import { routing } from "./routing";

describe("locale routing", () => {
  it("supports exactly bn and en, with Bangla as the default", () => {
    expect([...routing.locales]).toEqual(["bn", "en"]);
    expect(routing.defaultLocale).toBe("bn");
  });

  it("always prefixes URLs with the locale, so /bn and /en are canonical", () => {
    expect(routing.localePrefix).toBe("always");
  });
});
