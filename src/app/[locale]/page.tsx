import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { RevealInView } from "@/components/reveal-in-view";
import { TapToListen } from "@/components/tap-to-listen";
import { Link } from "@/i18n/navigation";
import { loadMissionTemplates } from "@/lib/content";
import { SKILLS } from "@/lib/skills";
import { FloatingSkills, type SkillChip } from "./landing/floating-skills";
import { Tutorial } from "./landing/tutorial";

const SKILL_EMOJI: Record<string, string> = {
  writing: "✍️",
  graphic_design: "🎨",
  web_development: "💻",
  video_editing: "🎬",
  virtual_assistance: "🗂️",
  data_entry: "📊",
  translation: "🌐",
  social_media: "📣",
  voice_over: "🎙️",
  tutoring: "📚",
};

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

const FEATURES = [
  { key: "roadmap", emoji: "🗺️" },
  { key: "xp", emoji: "⚡" },
  { key: "atlas", emoji: "🧭" },
  { key: "bilingual", emoji: "🔊" },
  { key: "honest", emoji: "💸" },
  { key: "safe", emoji: "🛡️" },
] as const;

export default function Home() {
  const t = useTranslations();
  const missionCount = loadMissionTemplates().length;

  const skillChips: SkillChip[] = SKILLS.filter(
    (s) => s !== "general_freelancing",
  ).map((id) => ({
    id,
    label: t(`landing.skills.${id}`),
    emoji: SKILL_EMOJI[id] ?? "✨",
  }));

  const tutorialSteps = [0, 1, 2].map((i) => ({
    title: t(`landing.tutorial.${i}.title`),
    body: t(`landing.tutorial.${i}.body`),
  }));
  const tutorialMock = {
    phoneTitle: t("landing.mock.phoneTitle"),
    phoneCta: t("landing.mock.phoneCta"),
    wizardTitle: t("landing.mock.wizardTitle"),
    chatQ: t("landing.mock.chatQ"),
    chatA: t("landing.mock.chatA"),
    roadmapTitle: t("landing.mock.roadmapTitle"),
  };

  const stats: { value: string; label: string }[] = [
    { value: String(missionCount), label: t("landing.stats.missions") },
    { value: "2", label: t("landing.stats.platforms") },
    { value: "2", label: t("landing.stats.languages") },
    { value: "$0", label: t("landing.stats.cost") },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#191410] text-stone-100">
      {/* ── Hero: dawn over the delta ─────────────────────────────── */}
      <section className="dawn-sky grain">
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

          {/* Floating skill chips: tap what you already do. */}
          <div className="rise mt-4 w-full" style={{ animationDelay: "0.65s" }}>
            <FloatingSkills skills={skillChips} label={t("landing.skillsLabel")} />
          </div>

          <div className="rise mt-2 w-full" style={{ animationDelay: "0.8s" }}>
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

      {/* ── Honest numbers strip ──────────────────────────────────── */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <RevealInView key={stat.label} delay={i * 0.08}>
              <p className="font-mono text-3xl font-bold text-marigold">
                {stat.value}
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-400">{stat.label}</p>
            </RevealInView>
          ))}
        </div>
      </section>

      {/* ── Animated walkthrough: sign in → onboard → Atlas ───────── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <RevealInView>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-stone-50">
            {t("landing.tutorialTitle")}
          </h2>
          <p className="mt-2 text-stone-400">{t("landing.tutorialSub")}</p>
        </RevealInView>
        <RevealInView className="mt-10" delay={0.1}>
          <Tutorial
            steps={tutorialSteps}
            mock={tutorialMock}
            skillSamples={[
              t("landing.skills.writing"),
              t("landing.skills.graphic_design"),
              t("landing.skills.video_editing"),
            ]}
          />
        </RevealInView>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="tech-grid border-t border-white/10">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <RevealInView>
            <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-stone-50">
              {t("landing.featuresTitle")}
            </h2>
          </RevealInView>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <RevealInView key={feature.key} delay={(i % 3) * 0.1}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-marigold/50">
                  <span className="text-2xl" aria-hidden>
                    {feature.emoji}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-stone-50">
                    {t(`landing.features.${feature.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-stone-400">
                    {t(`landing.features.${feature.key}.body`)}
                  </p>
                </div>
              </RevealInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── The honest promise ────────────────────────────────────── */}
      <section className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16">
          <RevealInView>
            <span className="inline-block h-1.5 w-16 rounded-full bg-marigold" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-stone-50">
              {t("landing.honestTitle")}
            </h2>
            <p className="mt-3 text-pretty leading-8 text-stone-300">
              {t("landing.honestBody")}
            </p>
            <div className="mt-3">
              <TapToListen text={t("landing.honestBody")} />
            </div>
          </RevealInView>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="dawn-sky grain border-t border-white/10">
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-6 py-20 text-center">
          <RevealInView>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-stone-50">
              {t("landing.finalTitle")}
            </h2>
            <p className="mt-3 text-stone-300">{t("landing.finalBody")}</p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/sign-in"
                className="rounded-full bg-[#F5A524] px-8 py-3.5 text-lg font-semibold text-stone-900 shadow-[0_0_40px_rgba(245,165,36,0.35)] transition-transform hover:scale-[1.03]"
              >
                {t("landing.cta")}
              </Link>
            </div>
          </RevealInView>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8 text-sm text-stone-500">
          <span>{t("common.appName")}</span>
          <span>{t("landing.footer")}</span>
        </div>
      </footer>
    </div>
  );
}
