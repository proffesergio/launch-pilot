import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getEnv } from "@/lib/env";
// Side effect: widen Node's per-attempt connect timeout, or every Neon fetch
// dies with ETIMEDOUT on slow networks (see net-tuning.ts).
import "@/lib/net-tuning";

import { withConnectRetry } from "./fetch-retry";
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
    // Retry connect-phase failures only (see fetch-retry.ts) — first
    // connections on dual-stack networks are observably flaky.
    neonConfig.fetchFunction = withConnectRetry(
      (url, init) => fetch(url as string, init),
      // 5 attempts: some dev-machine networks drop several connects in a row.
      // Connect-phase-only retries stay write-safe at any count.
      { attempts: 5, delayMs: 400 },
    );
    const sql = neon(getEnv().DATABASE_URL);
    cached = drizzle(sql, { schema });
  }
  return cached;
}
