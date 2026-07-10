import { NextResponse } from "next/server";

import { readLastMagicLink } from "@/lib/dev-mailbox";

/**
 * Dev/E2E-only: surfaces the last magic link since M0 has no email provider.
 * Hard 404 in production — and the mailbox itself is a no-op there too.
 */
export function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const link = readLastMagicLink();
  if (!link) {
    return NextResponse.json({ error: "empty_mailbox" }, { status: 404 });
  }
  return NextResponse.json(link);
}
