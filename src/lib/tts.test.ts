import { describe, it, expect } from "vitest";

import { buildSynthesisRequest, ttsCacheKey } from "./tts";

describe("ttsCacheKey", () => {
  it("is deterministic for the same text and locale", () => {
    expect(ttsCacheKey("hello", "en")).toBe(ttsCacheKey("hello", "en"));
  });

  it("changes when the text changes", () => {
    expect(ttsCacheKey("hello", "en")).not.toBe(ttsCacheKey("hello.", "en"));
  });

  it("changes when the locale changes, so bn and en audio never collide", () => {
    expect(ttsCacheKey("LaunchPilot", "bn")).not.toBe(
      ttsCacheKey("LaunchPilot", "en"),
    );
  });

  it("is a hex sha-256 digest (stable key shape for the cache table)", () => {
    expect(ttsCacheKey("x", "bn")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("buildSynthesisRequest", () => {
  it("selects a Bangla (bn-IN) voice for bn", () => {
    const req = buildSynthesisRequest("শুনুন", "bn");
    expect(req.voice.languageCode).toBe("bn-IN");
    expect(req.input.text).toBe("শুনুন");
    expect(req.audioConfig.audioEncoding).toBe("MP3");
  });

  it("selects an English voice for en", () => {
    expect(buildSynthesisRequest("listen", "en").voice.languageCode).toBe(
      "en-US",
    );
  });
});
