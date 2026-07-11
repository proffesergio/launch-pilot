"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { normalizeBdPhone } from "@/lib/phone";

type Status = "idle" | "busy" | "error";

export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const locale = useLocale();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<"invalidPhone" | "wrongCode" | "error" | null>(null);

  const callbackURL = `/${locale}/dashboard`;

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeBdPhone(phone);
    if (!normalized) {
      setErrorKey("invalidPhone");
      return;
    }
    setErrorKey(null);
    setStatus("busy");
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: normalized,
    });
    if (error) {
      setErrorKey("error");
      setStatus("error");
      return;
    }
    setNormalizedPhone(normalized);
    setStep("code");
    setStatus("idle");
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    setErrorKey(null);
    setStatus("busy");
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: normalizedPhone,
      code,
    });
    if (error) {
      setErrorKey("wrongCode");
      setStatus("error");
      return;
    }
    window.location.assign(callbackURL);
  }

  async function signInWithGoogle() {
    setStatus("busy");
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    if (error) {
      setErrorKey("error");
      setStatus("error");
    }
  }

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setStatus("busy");
    const { error } = await authClient.signIn.magicLink({ email, callbackURL });
    setEmailSent(!error);
    if (error) setErrorKey("error");
    setStatus(error ? "error" : "idle");
  }

  const inputClass =
    "rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg text-stone-900 outline-none focus:border-[#F5A524]";
  const primaryClass =
    "rounded-xl bg-[#F5A524] px-4 py-3 font-semibold text-stone-900 disabled:opacity-50";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
        {t("title")}
      </h1>

      {step === "phone" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <label htmlFor="phone" className="text-sm text-stone-600">
            {t("phoneLabel")}
          </label>
          <div className="flex gap-2">
            <span className="flex items-center rounded-xl border border-stone-200 bg-stone-100 px-3 font-medium text-stone-600">
              +880
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePlaceholder")}
              className={`flex-1 ${inputClass}`}
              data-testid="phone-input"
            />
          </div>
          <button type="submit" disabled={status === "busy"} className={primaryClass} data-testid="send-code">
            {t("sendCode")}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <p className="text-sm text-stone-600">
            {t("codeSentTo", { phone: normalizedPhone })}
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            data-testid="otp-input"
          />
          <button type="submit" disabled={status === "busy" || code.length < 6} className={primaryClass} data-testid="verify-code">
            {t("verify")}
          </button>
          <button
            type="button"
            onClick={() => { setStep("phone"); setCode(""); setErrorKey(null); }}
            className="text-sm text-stone-500 underline-offset-2 hover:underline"
          >
            {t("wrongPhone")}
          </button>
        </form>
      )}

      <p aria-live="polite" className="min-h-5 text-sm text-red-600">
        {errorKey && t(errorKey)}
      </p>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        {t("otherOptions")}
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      {!showOther ? (
        <button
          type="button"
          onClick={() => setShowOther(true)}
          data-testid="show-other-options"
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700"
        >
          {t("useGoogleOrEmail")}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={status === "busy"}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 font-medium text-stone-900 disabled:opacity-50"
          >
            {t("google")}
          </button>
          {emailSent ? (
            <p className="text-sm text-stone-600">{t("sent")}</p>
          ) : (
            <form onSubmit={sendMagicLink} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                aria-label={t("emailLabel")}
                className={`flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none focus:border-[#F5A524]`}
              />
              <button
                type="submit"
                disabled={status === "busy"}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 disabled:opacity-50"
              >
                {t("sendLink")}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
