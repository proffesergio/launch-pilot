import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export * from "./auth-schema";

/**
 * Walking-skeleton table. Its only job is to prove a real read/write travels
 * through every layer (env -> drizzle -> Neon Postgres) in M0. The real domain
 * schema (users, freelancer_profiles, roadmaps, missions, xp_ledger, …) lands
 * in M1+ per docs/architecture.md §4. This table will be dropped then.
 */
export const skeletonChecks = pgTable("skeleton_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SkeletonCheck = typeof skeletonChecks.$inferSelect;
export type NewSkeletonCheck = typeof skeletonChecks.$inferInsert;

/**
 * TTS hash-cache (ADR-0005): one row per unique (locale, voice, text),
 * keyed by content hash. Audio is stored base64 in Postgres for M0 —
 * portable across serverless drivers; object storage takes over when the
 * evidence-upload slice brings R2 anyway. Clips are small (< ~100 KB).
 */
export const ttsCache = pgTable("tts_cache", {
  hash: text("hash").primaryKey(),
  locale: text("locale").notNull(),
  audioBase64: text("audio_base64").notNull(),
  contentType: text("content_type").notNull().default("audio/mpeg"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
