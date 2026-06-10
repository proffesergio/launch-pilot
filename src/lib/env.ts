import { z } from "zod";

/**
 * Runtime environment validation (Principle: "Zod at every runtime boundary").
 *
 * `parseEnv` is a pure function so it is testable with an injected source.
 * `getEnv` memoizes validation of the real `process.env` and fails loud — but
 * only when first accessed, so a missing secret never silently degrades and
 * never blocks a build that doesn't touch it. Nothing imports `getEnv` until a
 * layer actually needs a secret.
 */

const EnvSchema = z.object({
  // Core
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Database — UNPOOLED is optional; it falls back to DATABASE_URL post-parse.
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),

  // Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),

  // AI (Claude) — model ids configurable so we can bump versions via env.
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  ANTHROPIC_MODEL_CRAFT: z.string().default("claude-sonnet-4-6"),
  ANTHROPIC_MODEL_FAST: z.string().default("claude-haiku-4-5"),

  // Cost guardrail — string env coerced to a number.
  AI_DAILY_USD_CAP_PER_USER: z.coerce.number().positive().default(0.5),

  // Observability / integrations — optional; absent = that feature is off.
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://us.i.posthog.com"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_TTS_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema> & {
  DATABASE_URL_UNPOOLED: string;
};

/**
 * Validate an environment source. Throws an Error naming every offending
 * variable when validation fails — so the failure is actionable at a glance.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const name = issue.path.join(".") || "(root)";
        return `${name}: ${issue.message}`;
      })
      .join("; ");
    throw new Error(`Invalid environment — ${details}`);
  }
  const parsed = result.data;
  return {
    ...parsed,
    // Migrations want a direct connection; default it to the pooled URL.
    DATABASE_URL_UNPOOLED: parsed.DATABASE_URL_UNPOOLED ?? parsed.DATABASE_URL,
  };
}

let cached: Env | undefined;

/** Memoized, validated view of the real process environment. */
export function getEnv(): Env {
  if (!cached) {
    cached = parseEnv(process.env as Record<string, string | undefined>);
  }
  return cached;
}
