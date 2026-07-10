"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";

type Status = "idle" | "sending" | "sent" | "error";

export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const callbackURL = `/${locale}/dashboard`;

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL,
    });
    setStatus(error ? "error" : "sent");
  }

  async function signInWithGoogle() {
    setStatus("sending");
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    if (error) setStatus("error");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
        {t("title")}
      </h1>
      <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm text-stone-600">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none focus:border-[#F5A524]"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-lg bg-stone-900 px-4 py-2.5 font-medium text-stone-50 disabled:opacity-50"
        >
          {t("sendLink")}
        </button>
      </form>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={status === "sending"}
        className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-medium text-stone-900 disabled:opacity-50"
      >
        {t("google")}
      </button>
      <p aria-live="polite" className="min-h-6 text-sm text-stone-600">
        {status === "sent" && t("sent")}
        {status === "error" && t("error")}
      </p>
    </div>
  );
}
