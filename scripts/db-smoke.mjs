/**
 * One-off M0 proof: insert a row and read it back from Neon.
 * Run: node scripts/db-smoke.mjs
 * Plain Node + the Neon HTTP driver (no bundler in the path). Hits the real DB,
 * so it is NOT part of the test suite. Safe to delete after M0.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const inserted = await sql`
  insert into skeleton_checks (note)
  values (${`m0 db smoke @ ${new Date().toISOString()}`})
  returning id, note, created_at
`;
const [{ n }] = await sql`select count(*)::int as n from skeleton_checks`;

console.log("inserted row id:", inserted[0].id);
console.log("note:", inserted[0].note);
console.log("total rows now:", n);
