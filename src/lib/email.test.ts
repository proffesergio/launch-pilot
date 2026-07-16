import { describe, it, expect } from "vitest";

import type { Env } from "./env";
import { magicLinkEmail, selectEmailProvider } from "./email";

const baseEnv = {} as Env;

describe("selectEmailProvider", () => {
  it("defaults to the dev mailbox outside production", () => {
    expect(selectEmailProvider(baseEnv, "development").name).toBe("dev-mailbox");
    expect(selectEmailProvider(baseEnv, "test").name).toBe("dev-mailbox");
    expect(selectEmailProvider(baseEnv, undefined).name).toBe("dev-mailbox");
  });

  it("defaults to log-only in production — loud, never silent", () => {
    expect(selectEmailProvider(baseEnv, "production").name).toBe("log-only");
  });

  it("honors an explicit EMAIL_PROVIDER over the environment default", () => {
    expect(
      selectEmailProvider({ ...baseEnv, EMAIL_PROVIDER: "none" } as Env, "development")
        .name,
    ).toBe("log-only");
    expect(
      selectEmailProvider({ ...baseEnv, EMAIL_PROVIDER: "dev" } as Env, "production")
        .name,
    ).toBe("dev-mailbox");
  });

  it("selects resend only with full credentials, else fails loud", () => {
    const withCreds = {
      ...baseEnv,
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "re_123",
      EMAIL_FROM: "LaunchPilot <login@launchpilot.app>",
    } as Env;
    expect(selectEmailProvider(withCreds, "production").name).toBe("resend");

    expect(() =>
      selectEmailProvider({ ...baseEnv, EMAIL_PROVIDER: "resend" } as Env, "production"),
    ).toThrow(/RESEND_API_KEY/);
  });
});

describe("magicLinkEmail", () => {
  it("carries the sign-in url in a bilingual message", () => {
    const url = "https://launchpilot.app/api/auth/magic-link/verify?token=abc";
    const mail = magicLinkEmail(url);
    expect(mail.subject).toContain("LaunchPilot");
    expect(mail.text).toContain(url);
    expect(mail.html).toContain(url);
    // Bilingual: English + Bangla both present.
    expect(mail.text).toContain("লঞ্চপাইলট");
  });
});
