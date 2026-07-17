import { describe, it, expect } from "vitest";

import { DIAL_CODES, toE164 } from "./phone";

describe("toE164", () => {
  it("combines a dial code and national number into E.164", () => {
    expect(toE164("+880", "1712345678")).toBe("+8801712345678");
    expect(toE164("+1", "5551234567")).toBe("+15551234567");
    expect(toE164("+44", "7911123456")).toBe("+447911123456");
  });

  it("strips a national trunk-prefix 0 and separators people actually type", () => {
    expect(toE164("+880", "017 1234-5678")).toBe("+8801712345678");
    expect(toE164("+44", "07911 123456")).toBe("+447911123456");
  });

  it("rejects too-short, over-15-digit, and non-numeric numbers", () => {
    expect(toE164("+880", "123")).toBeNull(); // too short
    expect(toE164("+1", "1234567890123456")).toBeNull(); // > 15 digits total
    expect(toE164("+880", "hello")).toBeNull();
    expect(toE164("+880", "")).toBeNull();
  });
});

describe("DIAL_CODES", () => {
  it("lists Bangladesh first (flagship default) with unique, well-formed entries", () => {
    expect(DIAL_CODES[0].code).toBe("BD");
    const codes = DIAL_CODES.map((d) => d.code);
    expect(new Set(codes).size).toBe(codes.length); // country codes unique
    for (const d of DIAL_CODES) {
      expect(d.dial).toMatch(/^\+\d{1,3}$/);
      expect(d.name.length).toBeGreaterThan(0);
    }
  });
});
