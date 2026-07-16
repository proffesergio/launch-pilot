import { recordMagicLink } from "./dev-mailbox";
import type { Env } from "./env";
import { logger } from "./logger";

/**
 * Pluggable transactional email (magic-link sign-in). auth.ts talks only to
 * this contract; swapping vendors is a new provider + env vars, never an auth
 * change — mirrors the SMS provider in `sms.ts`. "dev" captures links in the
 * dev mailbox (read back via /api/dev/magic-link), "none" logs loudly, and
 * "resend" activates the moment RESEND_API_KEY + EMAIL_FROM land.
 */

export type EmailResult = { delivered: boolean; provider: string };

export interface EmailProvider {
  readonly name: string;
  sendMagicLink(email: string, url: string): Promise<EmailResult>;
}

export type MagicLinkEmail = { subject: string; text: string; html: string };

export function magicLinkEmail(url: string): MagicLinkEmail {
  // Bilingual in one email — we don't know the recipient's locale at send time.
  const subject = "Your LaunchPilot sign-in link / আপনার লঞ্চপাইলট সাইন-ইন লিংক";
  const text = [
    "Sign in to LaunchPilot by opening this link:",
    url,
    "",
    "এই লিংকটি খুলে লঞ্চপাইলটে সাইন ইন করুন। লিংকটি অল্প সময়ের জন্য কার্যকর।",
    "If you didn't request this, you can ignore this email.",
  ].join("\n");
  const html = [
    `<p>Sign in to LaunchPilot by opening this link:</p>`,
    `<p><a href="${url}">${url}</a></p>`,
    `<p>এই লিংকটি খুলে লঞ্চপাইলটে সাইন ইন করুন। লিংকটি অল্প সময়ের জন্য কার্যকর।</p>`,
    `<p>If you didn't request this, you can ignore this email.</p>`,
  ].join("");
  return { subject, text, html };
}

const devMailboxProvider: EmailProvider = {
  name: "dev-mailbox",
  async sendMagicLink(email, url) {
    recordMagicLink(email, url);
    logger.info(
      { event: "auth.magic_link.dev_mailbox", email },
      "magic link captured in dev mailbox (/api/dev/magic-link)",
    );
    return { delivered: false, provider: this.name };
  },
};

const logOnlyProvider: EmailProvider = {
  name: "log-only",
  async sendMagicLink(email) {
    // Loud, tracked failure — never a silent drop (rail: errors first-class).
    logger.error(
      { event: "auth.magic_link.undeliverable", email },
      "magic link requested but no email provider is configured",
    );
    return { delivered: false, provider: this.name };
  },
};

function resendProvider(env: Env): EmailProvider {
  return {
    name: "resend",
    async sendMagicLink(email, url) {
      const mail = magicLinkEmail(url);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: email,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        logger.error(
          { event: "email.resend_failed", status: res.status, detail },
          "Resend send failed",
        );
        return { delivered: false, provider: this.name };
      }
      logger.info({ event: "email.sent", provider: this.name }, "magic link sent");
      return { delivered: true, provider: this.name };
    },
  };
}

export function hasResendCreds(env: Env): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

/**
 * Explicit EMAIL_PROVIDER wins; otherwise dev mailbox outside production and
 * log-only in production. Selecting "resend" without credentials is a
 * misconfiguration and fails loud at selection time, not at send time.
 */
export function selectEmailProvider(
  env: Env,
  nodeEnv: string | undefined,
): EmailProvider {
  const choice =
    env.EMAIL_PROVIDER ?? (nodeEnv === "production" ? "none" : "dev");
  switch (choice) {
    case "dev":
      return devMailboxProvider;
    case "none":
      return logOnlyProvider;
    case "resend":
      if (!hasResendCreds(env)) {
        throw new Error(
          "EMAIL_PROVIDER=resend requires RESEND_API_KEY and EMAIL_FROM",
        );
      }
      return resendProvider(env);
  }
}

let cached: EmailProvider | undefined;

export function getEmailProvider(env: Env): EmailProvider {
  if (!cached) cached = selectEmailProvider(env, process.env.NODE_ENV);
  return cached;
}
