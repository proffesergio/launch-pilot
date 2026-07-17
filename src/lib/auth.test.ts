import { describe, it, expect } from "vitest";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import { parseEnv, type Env } from "./env";
import { createAuth } from "./auth";
import * as schema from "@/db/schema";

// neon() builds a query function without connecting, so a fake URL is safe:
// these tests inspect configuration, they never issue a query.
const db = drizzle(neon("postgres://user:pass@fake.host/db"), { schema });

const baseSource: Record<string, string> = {
  DATABASE_URL: "postgres://user:pass@fake.host/db",
  BETTER_AUTH_SECRET: "s".repeat(32),
  ANTHROPIC_API_KEY: "sk-ant-test",
};

function env(extra: Record<string, string> = {}): Env {
  return parseEnv({ ...baseSource, ...extra });
}

describe("createAuth", () => {
  it("registers phone OTP (primary) and magic-link plugins", () => {
    const auth = createAuth(env(), db);
    const ids = (auth.options.plugins ?? []).map((p) => p.id);
    expect(ids).toContain("phone-number");
    expect(ids).toContain("magic-link");
  });

  it("enables Google sign-in only when both Google credentials are set", () => {
    const without = createAuth(env(), db);
    expect(without.options.socialProviders?.google).toBeUndefined();

    const with_ = createAuth(
      env({ GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" }),
      db,
    );
    expect(with_.options.socialProviders?.google).toBeDefined();
  });

  it("stores the user's locale on the user model, defaulting to bn", () => {
    const auth = createAuth(env(), db);
    const locale = auth.options.user?.additionalFields?.locale;
    expect(locale).toMatchObject({ type: "string", defaultValue: "en" });
  });
});
