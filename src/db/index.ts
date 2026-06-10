import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getEnv } from "@/lib/env";

import * as schema from "./schema";

/**
 * Drizzle client over Neon's HTTP driver — serverless/edge-friendly, no pooled
 * connection to manage. Uses the POOLED DATABASE_URL at runtime; migrations use
 * the direct URL via drizzle.config.ts. Lazily constructed so importing this
 * module never forces env validation until a query is actually issued.
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!cached) {
    const sql = neon(getEnv().DATABASE_URL);
    cached = drizzle(sql, { schema });
  }
  return cached;
}
