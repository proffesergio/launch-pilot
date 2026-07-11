import { recordOtp } from "./dev-mailbox";
import type { Env } from "./env";
import { logger } from "./logger";

/**
 * Pluggable SMS delivery (Slice C, spec 2026-07-11). auth.ts talks only to
 * this contract; swapping vendors is a new provider + env vars, never an
 * auth change. No provider account exists yet (owner decision) — "dev"
 * captures codes in the dev mailbox, "none" logs loudly, "twilio" activates
 * the moment TWILIO_* credentials land in the environment.
 */

export type SmsResult = { delivered: boolean; provider: string };

export interface SmsProvider {
  readonly name: string;
  sendOtp(phoneNumber: string, code: string): Promise<SmsResult>;
}

export function otpMessageBody(code: string): string {
  // Both languages in one SMS — delivery happens before we know a locale.
  return `LaunchPilot code / লঞ্চপাইলট কোড: ${code}`;
}

const devMailboxProvider: SmsProvider = {
  name: "dev-mailbox",
  async sendOtp(phoneNumber, code) {
    recordOtp(phoneNumber, code);
    logger.info(
      { event: "sms.dev_mailbox", phone: phoneNumber },
      "OTP captured in dev mailbox (/api/dev/otp)",
    );
    return { delivered: false, provider: this.name };
  },
};

const logOnlyProvider: SmsProvider = {
  name: "log-only",
  async sendOtp(phoneNumber) {
    // Loud, tracked failure — never a silent drop (rail: errors first-class).
    logger.error(
      { event: "auth.otp.undeliverable", phone: phoneNumber },
      "OTP requested but no SMS provider is configured",
    );
    return { delivered: false, provider: this.name };
  },
};

function twilioProvider(env: Env): SmsProvider {
  return {
    name: "twilio",
    async sendOtp(phoneNumber, code) {
      const sid = env.TWILIO_ACCOUNT_SID as string;
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phoneNumber,
            From: env.TWILIO_FROM_NUMBER as string,
            Body: otpMessageBody(code),
          }),
        },
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        logger.error(
          { event: "sms.twilio_failed", status: res.status, detail },
          "Twilio send failed",
        );
        return { delivered: false, provider: this.name };
      }
      logger.info({ event: "sms.sent", provider: this.name });
      return { delivered: true, provider: this.name };
    },
  };
}

export function hasTwilioCreds(env: Env): boolean {
  return Boolean(
    env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER,
  );
}

/**
 * Explicit SMS_PROVIDER wins; otherwise dev mailbox outside production and
 * log-only in production. Selecting "twilio" without credentials is a
 * misconfiguration and fails loud at selection time, not at send time.
 */
export function selectSmsProvider(
  env: Env,
  nodeEnv: string | undefined,
): SmsProvider {
  const choice =
    env.SMS_PROVIDER ?? (nodeEnv === "production" ? "none" : "dev");
  switch (choice) {
    case "dev":
      return devMailboxProvider;
    case "none":
      return logOnlyProvider;
    case "twilio":
      if (!hasTwilioCreds(env)) {
        throw new Error(
          "SMS_PROVIDER=twilio requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER",
        );
      }
      return twilioProvider(env);
  }
}

let cached: SmsProvider | undefined;

export function getSmsProvider(env: Env): SmsProvider {
  if (!cached) cached = selectSmsProvider(env, process.env.NODE_ENV);
  return cached;
}
