/**
 * Credential smoke check: validates .env.local via parseEnv, then pings each
 * external service with the cheapest possible real call. Prints statuses
 * only — never values.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon, neonConfig } from "@neondatabase/serverless";

import { withConnectRetry } from "../src/db/fetch-retry";

neonConfig.fetchFunction = withConnectRetry((url, init) =>
  fetch(url as string, init),
);
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import { parseEnv } from "../src/lib/env";

async function main() {
  let env;
  try {
    env = parseEnv(process.env as Record<string, string | undefined>);
    console.log("✓ parseEnv: all required variables valid");
  } catch (e) {
    console.log("✗ parseEnv FAILED:", (e as Error).message);
    process.exit(1);
  }

  // Database
  try {
    const sql = neon(env.DATABASE_URL);
    const [row] = await sql`select 1 as ok`;
    console.log(row.ok === 1 ? "✓ Postgres: connected" : "✗ Postgres: odd reply");
  } catch (e) {
    console.log("✗ Postgres FAILED:", (e as Error).message.slice(0, 120));
  }

  // Anthropic (few-token Haiku call)
  try {
    const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic(env.ANTHROPIC_MODEL_FAST),
      prompt: "Reply with exactly: ok",
      maxOutputTokens: 5,
    });
    console.log(`✓ Anthropic (${env.ANTHROPIC_MODEL_FAST}): replied "${text.trim()}"`);
  } catch (e) {
    console.log("✗ Anthropic FAILED:", (e as Error).message.slice(0, 160));
  }

  // Google TTS (tiny synthesis)
  if (env.GOOGLE_TTS_API_KEY) {
    try {
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_API_KEY}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            input: { text: "ok" },
            voice: { languageCode: "bn-IN", name: "bn-IN-Wavenet-A" },
            audioConfig: { audioEncoding: "MP3" },
          }),
        },
      );
      const body = (await res.json()) as { audioContent?: string; error?: { message?: string } };
      console.log(
        res.ok && body.audioContent
          ? `✓ Google TTS: synthesized ${Buffer.from(body.audioContent, "base64").length} bytes (bn-IN)`
          : `✗ Google TTS FAILED: http ${res.status} ${body.error?.message ?? ""}`.slice(0, 160),
      );
    } catch (e) {
      console.log("✗ Google TTS FAILED:", (e as Error).message.slice(0, 120));
    }
  } else {
    console.log("– Google TTS: no key set (tap-to-listen returns 503 until added)");
  }

  console.log(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? "✓ Google OAuth: both id + secret present (validated on first sign-in)"
      : "– Google OAuth: not configured (magic link still works)",
  );
  console.log(
    process.env.NEXT_PUBLIC_POSTHOG_KEY
      ? "✓ PostHog: key present"
      : "– PostHog: no key (analytics no-op)",
  );
  console.log(
    process.env.NEXT_PUBLIC_SENTRY_DSN
      ? "✓ Sentry: DSN present"
      : "– Sentry: no DSN",
  );
}

main();
