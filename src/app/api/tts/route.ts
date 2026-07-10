import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { ttsCache } from "@/db/schema";
import { routing, type AppLocale } from "@/i18n/routing";
import { getOrCreateCorrelationId } from "@/lib/correlation";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { synthesizeSpeech, ttsCacheKey } from "@/lib/tts";

const QuerySchema = z.object({
  // UI strings only — long-form content is chunked by the caller. The cap
  // also bounds cost per request.
  text: z.string().trim().min(1).max(500),
  locale: z.enum(routing.locales),
});

function audioResponse(bytes: Uint8Array, contentType: string, hash: string) {
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": contentType,
      // Immutable by construction: the URL embeds the text, the hash pins it.
      "cache-control": "public, max-age=31536000, immutable",
      etag: `"${hash}"`,
    },
  });
}

export async function GET(request: Request) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  const log = logger.child({ correlationId, route: "/api/tts" });

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    text: url.searchParams.get("text"),
    locale: url.searchParams.get("locale"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "tts_invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { text, locale } = parsed.data;

  const env = getEnv();
  if (!env.GOOGLE_TTS_API_KEY) {
    log.warn({ event: "tts.unconfigured" }, "GOOGLE_TTS_API_KEY not set");
    return NextResponse.json({ error: "tts_unconfigured" }, { status: 503 });
  }

  const hash = ttsCacheKey(text, locale as AppLocale);
  const db = getDb();

  const cached = await db.query.ttsCache.findFirst({
    where: eq(ttsCache.hash, hash),
  });
  if (cached) {
    log.info({ event: "tts.cache_hit", hash });
    return audioResponse(
      Uint8Array.from(Buffer.from(cached.audioBase64, "base64")),
      cached.contentType,
      hash,
    );
  }

  try {
    const bytes = await synthesizeSpeech(text, locale as AppLocale, env.GOOGLE_TTS_API_KEY);
    await db
      .insert(ttsCache)
      .values({
        hash,
        locale,
        audioBase64: Buffer.from(bytes).toString("base64"),
      })
      .onConflictDoNothing();
    log.info({ event: "tts.synthesized", hash, bytes: bytes.length });
    return audioResponse(bytes, "audio/mpeg", hash);
  } catch (err) {
    log.error({ event: "tts.failed", err }, "synthesis failed");
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }
}
