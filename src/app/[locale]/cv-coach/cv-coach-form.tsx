"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  CvApplicationResultSchema,
  type CvApplicationResult,
} from "@/lib/cv-coach";

type Status = "idle" | "busy" | "done" | "deleting";
type ErrorKind =
  | "validation"
  | "degraded"
  | "auth"
  | "badRequest"
  | "error"
  | null;

// Client-side floors mirror the server Zod schema (CvInputSchema) so an obvious
// too-short paste is caught before we spend an AI request.
const MIN_CV = 50;
const MIN_JD = 30;

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-[#F5A524]";

export function CvCoachForm({
  platform,
  platformName,
}: {
  platform: string;
  platformName: string;
}) {
  const t = useTranslations("cvCoach");
  const locale = useLocale();

  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [result, setResult] = useState<CvApplicationResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1500);
    } catch {
      setCopiedKey(null);
    }
  }

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setErrorKind(null);
    if (cvText.trim().length < MIN_CV || jobDescription.trim().length < MIN_JD) {
      setErrorKind("validation");
      return;
    }
    setStatus("busy");
    setResult(null);
    setSavedId(null);
    try {
      const res = await fetch("/api/cv-coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription, platform, locale }),
      });
      if (res.status === 401) {
        setErrorKind("auth");
        setStatus("idle");
        return;
      }
      if (res.status === 400) {
        setErrorKind("badRequest");
        setStatus("idle");
        return;
      }
      if (!res.ok) {
        setErrorKind("error");
        setStatus("idle");
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { id?: string; result?: unknown; degraded?: boolean }
        | null;
      if (!data) {
        setErrorKind("error");
        setStatus("idle");
        return;
      }
      if (data.degraded) {
        setErrorKind("degraded");
        setStatus("idle");
        return;
      }
      const parsed = CvApplicationResultSchema.safeParse(data.result);
      if (!parsed.success || !data.id) {
        setErrorKind("error");
        setStatus("idle");
        return;
      }
      setResult(parsed.data);
      setSavedId(data.id);
      setStatus("done");
    } catch {
      setErrorKind("error");
      setStatus("idle");
    }
  }

  async function remove() {
    if (!savedId) return;
    setStatus("deleting");
    setErrorKind(null);
    try {
      const res = await fetch(
        `/api/cv-coach?id=${encodeURIComponent(savedId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        setErrorKind("error");
        setStatus("done");
        return;
      }
      setResult(null);
      setSavedId(null);
      setStatus("idle");
    } catch {
      setErrorKind("error");
      setStatus("done");
    }
  }

  const busy = status === "busy";
  const showSignIn = errorKind === "auth" || errorKind === "badRequest";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          {t("title")}
        </h1>
        <p className="text-stone-600">{t("subtitle")}</p>
        <p className="text-sm text-stone-500">
          {t("platformNote", { platform: platformName })}
        </p>
      </header>

      <form onSubmit={generate} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="cv" className="text-sm font-medium text-stone-700">
            {t("cvLabel")}
          </label>
          <textarea
            id="cv"
            data-testid="cv-input"
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder={t("cvPlaceholder")}
            rows={8}
            className={`${inputClass} resize-y leading-6`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="jd" className="text-sm font-medium text-stone-700">
            {t("jdLabel")}
          </label>
          <textarea
            id="jd"
            data-testid="jd-input"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t("jdPlaceholder")}
            rows={6}
            className={`${inputClass} resize-y leading-6`}
          />
        </div>

        <p className="text-xs text-stone-500">{t("privacyNote")}</p>

        <button
          type="submit"
          data-testid="generate"
          disabled={busy}
          className="self-start rounded-xl bg-[#F5A524] px-6 py-3 font-semibold text-stone-900 disabled:opacity-50"
        >
          {busy ? t("generating") : t("generate")}
        </button>

        {errorKind && (
          <div
            data-testid="cv-error"
            aria-live="polite"
            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700"
          >
            <p>
              {errorKind === "validation" && t("validation")}
              {errorKind === "degraded" && t("degraded")}
              {errorKind === "auth" && t("errorAuth")}
              {errorKind === "badRequest" && t("errorBadRequest")}
              {errorKind === "error" && t("error")}
            </p>
            {showSignIn && (
              <Link
                href="/sign-in"
                className="mt-1 inline-block font-medium text-stone-900 underline underline-offset-2 hover:text-[#F5A524]"
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        )}
      </form>

      {result && (
        <section
          data-testid="cv-result"
          className="flex flex-col gap-8 border-t border-stone-200 pt-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            {t("resultTitle")}
          </h2>

          {/* Analysis */}
          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t("analysisTitle")}
              </h3>
              <span className="text-sm text-stone-500">{t("matchLabel")}</span>
              <span className="text-2xl font-semibold text-[#F5A524]">
                <span data-testid="match-score">{result.analysis.matchScore}</span>
                <span className="text-base text-stone-400"> / 100</span>
              </span>
            </div>

            <p className="text-stone-700">{result.analysis.verdict}</p>

            <Bullets title={t("strengthsTitle")} items={result.analysis.strengths} />
            {result.analysis.gaps.length > 0 && (
              <Bullets title={t("gapsTitle")} items={result.analysis.gaps} />
            )}
            {result.analysis.missingKeywords.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-stone-700">
                  {t("keywordsTitle")}
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {result.analysis.missingKeywords.map((kw) => (
                    <li
                      key={kw}
                      className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-sm text-stone-700"
                    >
                      {kw}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Cover letter */}
          <Artifact
            title={t("coverLetterTitle")}
            copyLabel={copiedKey === "cover" ? t("copied") : t("copy")}
            onCopy={() => copy("cover", result.coverLetter.body)}
          >
            <p className="whitespace-pre-wrap text-stone-700">
              {result.coverLetter.body}
            </p>
          </Artifact>

          {/* Outreach email */}
          <Artifact
            title={t("outreachTitle")}
            copyLabel={copiedKey === "outreach" ? t("copied") : t("copy")}
            onCopy={() =>
              copy(
                "outreach",
                `${result.outreachEmail.subject}\n\n${result.outreachEmail.body}`,
              )
            }
          >
            <p className="text-sm text-stone-500">
              {t("outreachSubject")}:{" "}
              <span className="font-medium text-stone-800">
                {result.outreachEmail.subject}
              </span>
            </p>
            <p className="mt-2 whitespace-pre-wrap text-stone-700">
              {result.outreachEmail.body}
            </p>
          </Artifact>

          {/* CV suggestions */}
          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-stone-900">
              {t("suggestionsTitle")}
            </h3>
            <ul className="flex flex-col gap-4">
              {result.suggestions.suggestions.map((s, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#F5A524]">
                    {s.section}
                  </span>
                  <span className="text-stone-800">{s.change}</span>
                  <span className="text-sm text-stone-500">
                    {t("suggestionWhy")}: {s.why}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            data-testid="delete-analysis"
            onClick={remove}
            disabled={status === "deleting"}
            className="self-start rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:border-red-400 hover:text-red-600 disabled:opacity-50"
          >
            {status === "deleting" ? t("deleting") : t("delete")}
          </button>
        </section>
      )}
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-stone-700">{title}</h4>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-stone-700">
            <span aria-hidden className="text-[#F5A524]">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Artifact({
  title,
  copyLabel,
  onCopy,
  children,
}: {
  title: string;
  copyLabel: string;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 hover:border-[#F5A524]"
        >
          {copyLabel}
        </button>
      </div>
      {children}
    </div>
  );
}
