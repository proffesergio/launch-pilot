import { describe, it, expect } from "vitest";

import type { Env } from "./env";
import { otpMessageBody, selectSmsProvider } from "./sms";

const baseEnv = {} as Env;

describe("selectSmsProvider", () => {
  it("defaults to the dev mailbox outside production", () => {
    expect(selectSmsProvider(baseEnv, "development").name).toBe("dev-mailbox");
    expect(selectSmsProvider(baseEnv, "test").name).toBe("dev-mailbox");
    expect(selectSmsProvider(baseEnv, undefined).name).toBe("dev-mailbox");
  });

  it("defaults to log-only in production — loud, never silent", () => {
    expect(selectSmsProvider(baseEnv, "production").name).toBe("log-only");
  });

  it("honors an explicit SMS_PROVIDER over the environment default", () => {
    expect(
      selectSmsProvider({ ...baseEnv, SMS_PROVIDER: "none" } as Env, "development")
        .name,
    ).toBe("log-only");
    expect(
      selectSmsProvider({ ...baseEnv, SMS_PROVIDER: "dev" } as Env, "production")
        .name,
    ).toBe("dev-mailbox");
  });

  it("selects twilio only with full credentials, else fails loud", () => {
    const withCreds = {
      ...baseEnv,
      SMS_PROVIDER: "twilio",
      TWILIO_ACCOUNT_SID: "AC123",
      TWILIO_AUTH_TOKEN: "token",
      TWILIO_FROM_NUMBER: "+15550001111",
    } as Env;
    expect(selectSmsProvider(withCreds, "production").name).toBe("twilio");

    expect(() =>
      selectSmsProvider({ ...baseEnv, SMS_PROVIDER: "twilio" } as Env, "production"),
    ).toThrow(/TWILIO_ACCOUNT_SID/);
  });
});

describe("otpMessageBody", () => {
  it("carries the code in a bilingual message", () => {
    const body = otpMessageBody("482913");
    expect(body).toContain("482913");
    expect(body).toContain("LaunchPilot");
    expect(body).toContain("লঞ্চপাইলট");
  });
});
