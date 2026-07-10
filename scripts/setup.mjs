#!/usr/bin/env node
/**
 * One-command local bootstrap (M0 exit criterion: clone → working dev in
 * < 10 min). Idempotent: safe to re-run.
 *
 *   corepack pnpm setup:local
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

const run = (cmd) => {
  console.log(`\n→ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

console.log("LaunchPilot local setup");

if (!existsSync(".env.local")) {
  copyFileSync(".env.example", ".env.local");
  console.log(
    "→ created .env.local from .env.example — fill in your secrets " +
      "(DATABASE_URL, BETTER_AUTH_SECRET, ANTHROPIC_API_KEY at minimum)",
  );
} else {
  console.log("→ .env.local already exists, leaving it alone");
}

run("corepack pnpm install");

const { config } = await import("dotenv");
config({ path: ".env.local" });

if (process.env.DATABASE_URL) {
  run("corepack pnpm db:migrate");
  console.log("→ database migrated");
} else {
  console.log("→ DATABASE_URL empty — skipped migrations (fill .env.local, re-run)");
}

console.log(`\nDone. Start the app with: corepack pnpm dev`);
