import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink, phoneNumber } from "better-auth/plugins";

import { getDb } from "@/db";
import { getEmailProvider } from "./email";
import { getEnv, type Env } from "./env";
import { getSmsProvider } from "./sms";

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
          // Delivery is a pluggable provider (sms.ts): dev mailbox locally,
          // loud log-only in production until a vendor account exists.
          await getSmsProvider(env).sendOtp(phone, code);
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
          // Delivery is a pluggable provider (email.ts): dev mailbox locally,
          // Resend in production, loud log-only until a vendor account exists.
          await getEmailProvider(env).sendMagicLink(email, url);
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
