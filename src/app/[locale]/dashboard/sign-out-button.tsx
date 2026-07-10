"use client";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const t = useTranslations("dashboard");
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
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
