import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { skeletonChecks } from "@/db/schema";

// Read path of the M0 skeleton: proves the app can reach Neon through Drizzle.
// Read-only (the write path is exercised by the migration + scripts/db-smoke.mjs).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(skeletonChecks);
    return NextResponse.json({ ok: true, skeletonChecks: count });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "db error" },
      { status: 503 },
    );
  }
}
