import { describe, it, expect } from "vitest";

import { parseEnv } from "./env";

// A minimal complete environment — only the variables required to boot.
const validSource: Record<string, string | undefined> = {
  DATABASE_URL: "postgres://u:p@host/db",
  BETTER_AUTH_SECRET: "x".repeat(32),
  ANTHROPIC_API_KEY: "sk-ant-test",
};

describe("parseEnv", () => {
  it("parses a complete, valid environment into typed config", () => {
    const env = parseEnv(validSource);
    expect(env.DATABASE_URL).toBe("postgres://u:p@host/db");
    // unspecified optionals fall back to documented defaults
    expect(env.AI_DAILY_USD_CAP_PER_USER).toBe(0.5);
    expect(env.ANTHROPIC_MODEL_CRAFT).toBe("claude-sonnet-4-6");
    expect(env.ANTHROPIC_MODEL_FAST).toBe("claude-haiku-4-5");
  });

  it("coerces the daily cap from string to number", () => {
    const env = parseEnv({ ...validSource, AI_DAILY_USD_CAP_PER_USER: "1.25" });
    expect(env.AI_DAILY_USD_CAP_PER_USER).toBe(1.25);
  });

  it("throws a clear error naming the missing variable", () => {
    const { DATABASE_URL: _omit, ...incomplete } = validSource;
    expect(() => parseEnv(incomplete)).toThrowError(/DATABASE_URL/);
  });

  it("rejects a BETTER_AUTH_SECRET shorter than 32 chars, naming it", () => {
    expect(() => parseEnv({ ...validSource, BETTER_AUTH_SECRET: "tooshort" })).toThrowError(
      /BETTER_AUTH_SECRET/,
    );
  });

  it("treats blank values as absent — a copied .env.example must not fail", () => {
    const env = parseEnv({
      ...validSource,
      DATABASE_URL_UNPOOLED: "",
      GOOGLE_TTS_API_KEY: "   ",
    });
    // Optional blank → fallback/undefined, not a validation error.
    expect(env.DATABASE_URL_UNPOOLED).toBe(validSource.DATABASE_URL);
    expect(env.GOOGLE_TTS_API_KEY).toBeUndefined();
    // Required blank still fails, with the "required" message.
    expect(() => parseEnv({ ...validSource, DATABASE_URL: "" })).toThrowError(
      /DATABASE_URL/,
    );
  });
});
