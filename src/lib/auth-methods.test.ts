import { describe, it, expect } from "vitest";

import { parseEnv, type Env } from "./env";
import { availableAuthMethods, anyAuthMethod } from "./auth-methods";

const baseSource: Record<string, string> = {
  DATABASE_URL: "postgres://user:pass@fake.host/db",
  BETTER_AUTH_SECRET: "s".repeat(32),
  ANTHROPIC_API_KEY: "sk-ant-test",
};

function env(extra: Record<string, string> = {}): Env {
  return parseEnv({ ...baseSource, ...extra });
}

const GOOGLE = { GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" };
const RESEND = {
  EMAIL_PROVIDER: "resend",
  RESEND_API_KEY: "re_test",
  EMAIL_FROM: "LaunchPilot <login@example.com>",
};
const TWILIO = {
  SMS_PROVIDER: "twilio",
  TWILIO_ACCOUNT_SID: "AC_test",
  TWILIO_AUTH_TOKEN: "tok_test",
  TWILIO_FROM_NUMBER: "+15550000000",
};

describe("availableAuthMethods", () => {
  it("outside production, dev mailboxes make phone + email usable (google needs creds)", () => {
    const methods = availableAuthMethods(env(), "development");
    // Dev mailboxes (/api/dev/otp, /api/dev/magic-link) let a tester complete
    // both flows, so both are usable; Google still needs real credentials.
    expect(methods).toEqual({ phone: true, email: true, google: false });
  });

  it("in production with nothing configured, no method is usable", () => {
    // The core Release-N guard: an unconfigured prod must not advertise a
    // sign-in path that only logs "undeliverable".
    const methods = availableAuthMethods(env(), "production");
    expect(methods).toEqual({ phone: false, email: false, google: false });
  });

  it("in production, Google creds + Resend make google + email usable but not phone", () => {
    const methods = availableAuthMethods(env({ ...GOOGLE, ...RESEND }), "production");
    expect(methods).toEqual({ phone: false, email: true, google: true });
  });

  it("in production, Twilio creds make phone usable", () => {
    const methods = availableAuthMethods(env(TWILIO), "production");
    expect(methods.phone).toBe(true);
  });

  it("anyAuthMethod is false only when every method is unavailable", () => {
    expect(anyAuthMethod({ phone: false, email: false, google: false })).toBe(false);
    expect(anyAuthMethod({ phone: false, email: true, google: false })).toBe(true);
  });
});
