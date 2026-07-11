"use client";

import { useLocale, useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  async function signOut() {
    await authClient.signOut();
    // Full navigation, not router.push + refresh: in Next 16 a refresh right
    // after push cancels the navigation, and sign-out must also drop every
    // cached authed page — a document load does both.
    window.location.assign(`/${locale}/sign-in`);
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="w-fit rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-medium text-stone-900"
    >
      {t("signOut")}
    </button>
  );
}
