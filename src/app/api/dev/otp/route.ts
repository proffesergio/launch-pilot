import { NextResponse } from "next/server";

import { readOtp } from "@/lib/dev-mailbox";

/** Dev/E2E-only OTP readback (no SMS provider yet). Hard 404 in production. */
export function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const phone = new URL(request.url).searchParams.get("phone");
  const code = phone ? readOtp(phone) : null;
  if (!code) {
    return NextResponse.json({ error: "empty_mailbox" }, { status: 404 });
  }
  return NextResponse.json({ phone, code });
}
