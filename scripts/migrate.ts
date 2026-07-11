/**
 * Applies ./drizzle migrations over Neon's HTTP driver — the same transport
 * the app uses (drizzle-kit's websocket path is unreliable on some networks).
 * Forward-only, idempotent: drizzle's journal skips applied migrations.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

import { withConnectRetry } from "../src/db/fetch-retry";

neonConfig.fetchFunction = withConnectRetry((url, init) =>
  fetch(url as string, init),
);

const nonBlank = (v: string | undefined) => (v?.trim() ? v : undefined);
const url =
  nonBlank(process.env.DATABASE_URL_UNPOOLED) ??
  nonBlank(process.env.DATABASE_URL);
if (!url) {
  console.error("DATABASE_URL (or DATABASE_URL_UNPOOLED) is required");
  process.exit(1);
}

const db = drizzle(neon(url));
const started = Date.now();
migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => {
    console.log(`✓ migrations applied in ${Date.now() - started}ms`);
  })
  .catch((err) => {
    console.error("✗ migration failed:", err.message);
    process.exit(1);
  });
