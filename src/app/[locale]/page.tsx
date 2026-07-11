import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { TapToListen } from "@/components/tap-to-listen";
import { Link } from "@/i18n/navigation";

/** The product's core metaphor as the hero visual: a journey toward sunrise. */
function JourneyPath({ labels }: { labels: [string, string, string, string] }) {
  const stops: { x: number; y: number; delay: number }[] = [
    { x: 40, y: 150, delay: 0 },
    { x: 200, y: 118, delay: 1.4 },
    { x: 360, y: 128, delay: 2.8 },
    { x: 520, y: 74, delay: 4.2 },
  ];
  return (
    <svg
      viewBox="0 0 640 200"
      role="img"
      aria-label={labels.join(" → ")}
      className="w-full max-w-2xl"
    >
      {/* rising sun behind the final milestone */}
      <circle cx="560" cy="60" r="34" fill="#F5A524" opacity="0.16" className="sun-pulse" />
      <circle cx="560" cy="60" r="20" fill="#F5A524" opacity="0.35" className="sun-pulse" />
      <path
        d="M 40 150 C 120 150, 140 118, 200 118 S 300 140, 360 128 S 470 96, 520 74"
        fill="none"
        stroke="#F5A524"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="journey-trail"
        opacity="0.8"
      />
      {stops.map(({ x, y, delay }, i) => (
        <g key={i} className="milestone" style={{ animationDelay: `${delay}s` }}>
          <circle cx={x} cy={y} r="7" fill={i === 3 ? "#F5A524" : "#FAF9F7"} />
          <circle cx={x} cy={y} r="12" fill="none" stroke="#F5A524" strokeWidth="1.5" opacity="0.6" />
          <text
            x={x}
            y={y + 32}
            textAnchor="middle"
            fill="#D6CBB8"
            fontSize="13"
            fontWeight="500"
          >
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Home() {
  const t = useTranslations();

  const steps: { title: string; body: string }[] = [0, 1, 2].map((i) => ({
    title: t(`landing.steps.${i}.title`),
    body: t(`landing.steps.${i}.body`),
  }));

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero: dawn over the delta ─────────────────────────────── */}
      <section className="dawn-sky grain text-stone-100">
        <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-lg font-bold tracking-tight text-stone-50">
            {t("common.appName")}
          </span>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link
              href="/sign-in"
              className="rounded-full border border-stone-500/60 px-4 py-1.5 text-sm text-stone-200 transition-colors hover:border-[#F5A524] hover:text-[#F5A524]"
            >
              {t("landing.signIn")}
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 pb-20 pt-12 text-center sm:pt-20">
          <p
            className="rise rounded-full border border-[#F5A524]/40 bg-[#F5A524]/10 px-4 py-1 text-sm text-[#F5A524]"
            style={{ animationDelay: "0.05s" }}
          >
            {t("landing.badge")}
          </p>
          <h1
            className="rise max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-stone-50 sm:text-6xl"
            style={{ animationDelay: "0.15s" }}
          >
            {t("landing.headline")}
            <span className="text-[#F5A524]"> {t("landing.headlineAccent")}</span>
          </h1>
          <p
            className="rise max-w-xl text-pretty text-lg leading-8 text-stone-300"
            style={{ animationDelay: "0.3s" }}
          >
            {t("landing.sub")}
          </p>
          <div className="rise" style={{ animationDelay: "0.4s" }}>
            <TapToListen text={`${t("landing.headline")} ${t("landing.headlineAccent")}. ${t("landing.sub")}`} />
          </div>
          <div
            className="rise flex flex-col items-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.5s" }}
          >
            <Link
              href="/sign-in"
              data-testid="landing-cta"
              className="rounded-full bg-[#F5A524] px-8 py-3.5 text-lg font-semibold text-stone-900 shadow-[0_0_40px_rgba(245,165,36,0.35)] transition-transform hover:scale-[1.03]"
            >
              {t("landing.cta")}
            </Link>
            <span className="text-sm text-stone-400">{t("landing.ctaHint")}</span>
          </div>
          <div className="rise mt-6 w-full" style={{ animationDelay: "0.65s" }}>
            <div className="mx-auto flex justify-center">
              <JourneyPath
                labels={[
                  t("landing.path.0"),
                  t("landing.path.1"),
                  t("landing.path.2"),
                  t("landing.path.3"),
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          {t("landing.howTitle")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(245,165,36,0.15)]"
            >
              <span className="font-mono text-4xl font-bold text-[#F5A524]/30 transition-colors group-hover:text-[#F5A524]/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-stone-900">
                {step.title}
              </h3>
              <p className="mt-1.5 leading-7 text-stone-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The honest promise ────────────────────────────────────── */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-14">
          <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            {t("landing.honestTitle")}
          </h2>
          <p className="text-pretty leading-8 text-stone-600">
            {t("landing.honestBody")}
          </p>
          <TapToListen text={t("landing.honestBody")} />
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8 text-sm text-stone-500">
        <span>{t("common.appName")}</span>
        <span>{t("landing.footer")}</span>
      </footer>
    </div>
  );
}
