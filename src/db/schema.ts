import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export * from "./auth-schema";
import { user } from "./auth-schema";

/**
 * The Freelancer Profile (M1, architecture §4): one row per user, drives all
 * personalization. Typed columns are what the roadmap generator and coach
 * query on; `rawInputs` preserves the user's own words (schema-on-read) for
 * coach context and future re-classification.
 */
export const freelancerProfiles = pgTable("freelancer_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull(),
  skillTrack: text("skill_track").notNull(),
  skillConfidence: text("skill_confidence").notNull(), // high | low
  skillSource: text("skill_source").notNull(), // ai | fallback
  targetPlatform: text("target_platform").notNull(), // fiverr | upwork
  weeklyHours: integer("weekly_hours").notNull(),
  country: text("country").notNull().default("BD"),
  englishConfidence: text("english_confidence").notNull(), // low | medium | high
  experience: text("experience").notNull(), // none | some | experienced
  rawInputs: jsonb("raw_inputs").notNull(),
  journeyState: text("journey_state").notNull().default("onboarding"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FreelancerProfile = typeof freelancerProfiles.$inferSelect;

/**
 * A generated roadmap (M2, architecture §4). Pins the content versions it was
 * generated from so a later track update never rewrites a user's live plan.
 * Mission templates live in-repo (ADR-0011); instances reference them by key.
 */
export const userRoadmaps = pgTable("user_roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  trackVersionPins: jsonb("track_version_pins").notNull(),
  generatedBy: text("generated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const roadmapMissions = pgTable("roadmap_missions", {
  id: uuid("id").primaryKey().defaultRandom(),
  roadmapId: uuid("roadmap_id")
    .notNull()
    .references(() => userRoadmaps.id, { onDelete: "cascade" }),
  missionKey: text("mission_key").notNull(),
  phase: integer("phase").notNull(),
  quest: text("quest").notNull(),
  position: integer("position").notNull(),
  status: text("status").notNull().default("locked"), // locked | unlocked | done
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type RoadmapMissionRow = typeof roadmapMissions.$inferSelect;

/** Coach turns (M3): every message with token + cost accounting (§4). */
export const coachMessages = pgTable("coach_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  locale: text("locale").notNull(),
  tokensIn: integer("tokens_in").notNull().default(0),
  tokensOut: integer("tokens_out").notNull().default(0),
  costUsdMicros: integer("cost_usd_micros").notNull().default(0),
  model: text("model"),
  promptVersion: text("prompt_version"),
  correlationId: text("correlation_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Per-user daily AI spend — the cheap hot-path read for the cap check (§4). */
export const aiUsageDaily = pgTable(
  "ai_usage_daily",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    usageDate: text("usage_date").notNull(), // YYYY-MM-DD (UTC)
    costUsdMicros: integer("cost_usd_micros").notNull().default(0),
    calls: integer("calls").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.usageDate] })],
);

/**
 * XP ledger (M4, pulled forward — spec 2026-07-11): append-only, one row per
 * award. Totals, level, streak, and the activity timeline are all derived
 * from it. `sourceId` makes awards idempotent within (user, kind): "once"
 * for one-shot kinds, the UTC day for daily kinds, the mission row id for
 * mission_completed. `day` denormalizes created_at for cheap streak queries.
 */
export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    amount: integer("amount").notNull(),
    sourceId: text("source_id").notNull(),
    day: text("day").notNull(), // YYYY-MM-DD (UTC)
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("xp_events_award_once").on(t.userId, t.kind, t.sourceId)],
);

export type XpEventRow = typeof xpEvents.$inferSelect;

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
