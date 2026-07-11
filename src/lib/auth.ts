import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink, phoneNumber } from "better-auth/plugins";

import { getDb } from "@/db";
import { recordMagicLink, recordOtp } from "./dev-mailbox";
import { getEnv, type Env } from "./env";
import { logger } from "./logger";

type Db = ReturnType<typeof getDb>;

/**
 * Auth factory (better-auth, ADR-0004): email magic link + Google OAuth,
 * sessions in our Postgres. A factory rather than a singleton so tests can
 * inject env/db; `getAuth` memoizes the real instance.
 */
export function createAuth(env: Env, db: Db) {
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return betterAuth({
    appName: "LaunchPilot",
    baseURL: env.NEXT_PUBLIC_APP_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "pg" }),
    user: {
      additionalFields: {
        // Personalizes every later layer (UI, coach, TTS). Bangla-first.
        locale: { type: "string", defaultValue: "bn", input: false },
      },
    },
    socialProviders: googleEnabled
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : undefined,
    plugins: [
      // Primary sign-in: phone OTP — everyone in the audience has a phone
      // number; many don't use email. SMS delivery is the dev mailbox until
      // an SMS provider account exists (owner action); the flow is real.
      phoneNumber({
        sendOTP: async ({ phoneNumber: phone, code }) => {
          recordOtp(phone, code);
          if (process.env.NODE_ENV === "production") {
            logger.error(
              { event: "auth.otp.undeliverable", phone },
              "OTP requested but no SMS provider is configured",
            );
            return;
          }
          logger.info(
            { event: "auth.otp.dev_mailbox", phone },
            "OTP captured in dev mailbox (/api/dev/otp)",
          );
        },
        signUpOnVerification: {
          // Phone users may have no email; better-auth requires one on the
          // user row, so mint a stable placeholder in our own namespace.
          getTempEmail: (phone) => `${phone.replace("+", "")}@phone.launchpilot.app`,
          getTempName: (phone) => phone,
        },
      }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          // No email provider in M0 (Resend lands in its own slice). Outside
          // production the link goes to the dev mailbox; in production this
          // is a loud, tracked failure — not a silent one.
          recordMagicLink(email, url);
          if (process.env.NODE_ENV === "production") {
            logger.error(
              { event: "auth.magic_link.undeliverable", email },
              "magic link requested but no email provider is configured",
            );
            return;
          }
          logger.info(
            { event: "auth.magic_link.dev_mailbox", email },
            "magic link captured in dev mailbox (/api/dev/magic-link)",
          );
        },
      }),
      // Keep last: lets server actions set auth cookies.
      nextCookies(),
    ],
  });
}

let cached: ReturnType<typeof createAuth> | undefined;

/** Memoized auth instance over the real env + db. */
export function getAuth() {
  if (!cached) {
    cached = createAuth(getEnv(), getDb());
  }
  return cached;
}
