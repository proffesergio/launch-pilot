import { describe, it, expect } from "vitest";

import { normalizeBdPhone } from "./phone";

describe("normalizeBdPhone", () => {
  it("accepts the common local format 01XXXXXXXXX", () => {
    expect(normalizeBdPhone("01712345678")).toBe("+8801712345678");
  });

  it("accepts +880 and 880 prefixed forms", () => {
    expect(normalizeBdPhone("+8801712345678")).toBe("+8801712345678");
    expect(normalizeBdPhone("8801712345678")).toBe("+8801712345678");
  });

  it("tolerates spaces and dashes people actually type", () => {
    expect(normalizeBdPhone("017 1234-5678")).toBe("+8801712345678");
  });

  it("accepts every BD mobile operator prefix (013–019)", () => {
    for (const p of ["013", "014", "015", "016", "017", "018", "019"]) {
      // The leading 0 of the local form is replaced by the +880 country code.
      expect(normalizeBdPhone(`${p}12345678`)).toBe(`+880${p.slice(1)}12345678`);
    }
  });

  it("rejects non-mobile, wrong-length, and non-BD numbers", () => {
    expect(normalizeBdPhone("0212345678")).toBeNull(); // landline
    expect(normalizeBdPhone("0171234567")).toBeNull(); // too short
    expect(normalizeBdPhone("017123456789")).toBeNull(); // too long
    expect(normalizeBdPhone("+15551234567")).toBeNull(); // not BD (v1 is BD-first)
    expect(normalizeBdPhone("hello")).toBeNull();
  });
});
