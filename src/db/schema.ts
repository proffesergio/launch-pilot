import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

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
