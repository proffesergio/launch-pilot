import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, it, expect } from "vitest";

/**
 * Advisory-only boundary (ADR-0001/0010): the Launch Studio drafts and reviews
 * assets, but NOTHING here may reach a marketplace. These server modules must
 * make no outbound HTTP of their own (their only network is the AI SDK) and
 * must never name a marketplace host. If a future edit adds a fetch or a
 * marketplace API call here, this test fails loudly.
 */

const SERVER_MODULES = [
  "src/lib/launch-studio.ts",
  "src/app/api/launch-studio/route.ts",
];

const MARKETPLACE_HOSTS = /fiverr\.com|upwork\.com|api\.fiverr|api\.upwork/i;

describe("Launch Studio stays advisory-only", () => {
  for (const rel of SERVER_MODULES) {
    const src = readFileSync(path.join(process.cwd(), rel), "utf8");

    it(`${rel} makes no raw HTTP calls`, () => {
      // The generator uses the AI SDK; the route uses the DB. Neither fetches.
      expect(src).not.toMatch(/\bfetch\s*\(/);
      expect(src).not.toMatch(/\baxios\b/);
    });

    it(`${rel} never references a marketplace host`, () => {
      expect(src).not.toMatch(MARKETPLACE_HOSTS);
    });
  }
});
