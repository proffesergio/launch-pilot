import { selectEmailProvider } from "./email";
import type { Env } from "./env";
import { selectSmsProvider } from "./sms";

/**
 * Which sign-in methods can actually reach a real user in this environment.
 *
 * "Usable" means the resolved delivery provider is *not* the loud log-only
 * fallback — i.e. a code/link lands somewhere retrievable (a real vendor in
 * production, the dev mailbox outside it). This is the single source of truth
 * the sign-in page uses so production never leads with a method that silently
 * dead-ends (ADR-0004 auth; rail: errors first-class, no silent drops).
 */
export type AuthMethod = "phone" | "email" | "google";
export type AuthMethods = Record<AuthMethod, boolean>;

export function availableAuthMethods(
  env: Env,
  nodeEnv: string | undefined,
): AuthMethods {
  return {
    // Reuse the provider selectors so this can never drift from what auth.ts
    // will actually use to deliver. log-only == unusable for a real user.
    phone: selectSmsProvider(env, nodeEnv).name !== "log-only",
    email: selectEmailProvider(env, nodeEnv).name !== "log-only",
    // Google is usable whenever both halves of the OAuth client are present
    // (mirrors the socialProviders gate in auth.ts).
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  };
}

export function anyAuthMethod(methods: AuthMethods): boolean {
  return methods.phone || methods.email || methods.google;
}
