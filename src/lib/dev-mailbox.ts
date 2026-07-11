/**
 * Dev/test-only mailbox for auth magic links and phone OTPs.
 *
 * M0 has no email/SMS provider (Resend and an SMS gateway land in their own
 * slices); in development and E2E the secrets are captured here and read back
 * via the dev-only routes /api/dev/magic-link and /api/dev/otp. Every
 * function is a hard no-op in production so a token can never be exfiltrated
 * through this path.
 *
 * Backed by tmpdir files, not module state: the Next dev server runs app code
 * in recyclable worker processes, so an in-memory Map can vanish (or live in
 * a different worker) between the write and the E2E read-back.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type MagicLinkRecord = { email: string; url: string };

const inProduction = () => process.env.NODE_ENV === "production";

const boxDir = join(tmpdir(), "launchpilot-dev-mailbox");

// Identifiers (emails, E.164 phones) become filenames; strip anything risky.
const fileFor = (kind: "link" | "otp", id: string) =>
  join(boxDir, `${kind}-${id.replace(/[^a-zA-Z0-9@.+_-]/g, "_")}.json`);

function put(path: string, value: unknown): void {
  mkdirSync(boxDir, { recursive: true });
  writeFileSync(path, JSON.stringify(value));
}

function get<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null; // missing file = empty mailbox
  }
}

export function recordMagicLink(email: string, url: string): void {
  if (inProduction()) return;
  const record: MagicLinkRecord = { email, url };
  // Per-email so parallel E2E sign-ins never consume each other's token.
  put(fileFor("link", email), record);
  put(fileFor("link", "__last__"), record);
}

export function readLastMagicLink(email?: string): MagicLinkRecord | null {
  if (inProduction()) return null;
  return get<MagicLinkRecord>(fileFor("link", email ?? "__last__"));
}

export function recordOtp(phoneNumber: string, code: string): void {
  if (inProduction()) return;
  put(fileFor("otp", phoneNumber), { code });
}

export function readOtp(phoneNumber: string): string | null {
  if (inProduction()) return null;
  return get<{ code: string }>(fileFor("otp", phoneNumber))?.code ?? null;
}
