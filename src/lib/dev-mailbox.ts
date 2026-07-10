/**
 * Dev/test-only in-memory mailbox for auth magic links.
 *
 * M0 has no email provider (Resend lands with its own slice); in development
 * and E2E the magic link is captured here and read back via the dev-only
 * route /api/dev/magic-link. Every function is a hard no-op in production so
 * a token can never be exfiltrated through this path.
 */

type MagicLinkRecord = { email: string; url: string };

let last: MagicLinkRecord | null = null;

const inProduction = () => process.env.NODE_ENV === "production";

export function recordMagicLink(email: string, url: string): void {
  if (inProduction()) return;
  last = { email, url };
}

export function readLastMagicLink(): MagicLinkRecord | null {
  if (inProduction()) return null;
  return last;
}
