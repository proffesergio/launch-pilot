import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getDb } from "@/db";
import { freelancerProfiles } from "@/db/schema";
import { Link, redirect } from "@/i18n/navigation";
import { getAuth } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { ALL_BADGES, XpEventKindSchema } from "@/lib/gamification";
import { JOURNEY_STATES, type JourneyState } from "@/lib/journey";
import { getProfileStats } from "@/lib/xp-service";
import { Reveal } from "../dashboard/reveal";

const card =
  "rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm";

const BADGE_EMOJI: Record<(typeof ALL_BADGES)[number], string> = {
  first_steps: "👣",
  pathfinder: "🗺️",
  first_words: "💬",
  streak_3: "🔥",
  streak_7: "🚀",
  level_2: "⛰️",
  level_5: "🌄",
  xp_500: "💫",
};

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/profile">) {
  if (!getFlag("m4_gamification")) notFound();

  const { locale } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }
  const user = session!.user;

  const t = await getTranslations("profilePage");
  const tDash = await getTranslations("dashboard");

  const [profile, stats] = await Promise.all([
    getDb().query.freelancerProfiles.findFirst({
      where: eq(freelancerProfiles.userId, user.id),
    }),
    getProfileStats(user.id),
  ]);

  // Same placeholder-identity rules as the dashboard header.
  const email = user.email ?? "";
  const phoneSignup = email.endsWith("@phone.launchpilot.app");
  const displayName =
    user.name && !/^\+?[\d\s-]+$/.test(user.name)
      ? user.name
      : phoneSignup
        ? user.name || email
        : email;
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();

  const memberSince = new Intl.DateTimeFormat(
    locale === "bn" ? "bn-BD" : "en-US",
    { month: "long", year: "numeric" },
  ).format(user.createdAt);

  const journeyState = (profile?.journeyState ?? "onboarding") as JourneyState;
  const journeyIndex = JOURNEY_STATES.indexOf(journeyState);
  const earned = new Set(stats.badges);

  const statTiles = [
    { value: stats.totalXp, label: t("stats.totalXp") },
    { value: stats.level.level, label: t("stats.level") },
    { value: stats.streak, label: t("stats.streak") },
    { value: stats.activeDays, label: t("stats.activeDays") },
  ];

  const timeline = stats.timeline.flatMap((e) => {
    const kind = XpEventKindSchema.safeParse(e.kind);
    return kind.success ? [{ ...e, kind: kind.data }] : [];
  });

  return (
    <main className="dawn-sky grain relative flex min-h-dvh flex-1 flex-col">
      <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
        <Link
          href="/dashboard"
          className="w-fit text-sm text-stone-400 transition-colors hover:text-marigold"
        >
          ← {t("backToDashboard")}
        </Link>

        <Reveal className={card}>
          <div className="flex flex-wrap items-center gap-5">
            <span
              aria-hidden
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-marigold/50 bg-marigold/15 text-2xl font-bold text-marigold"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <h1
                className="truncate text-2xl font-semibold tracking-tight text-stone-50"
                data-testid="profile-name"
              >
                {displayName}
              </h1>
              <p className="mt-1 text-sm text-stone-400">
                {t("memberSince", { date: memberSince })}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statTiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center"
              >
                <dd className="font-mono text-2xl font-semibold text-stone-50">
                  {tile.value}
                </dd>
                <dt className="mt-0.5 text-xs text-stone-400">{tile.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className={card} delay={0.08}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                {t("badgesTitle")}
              </h2>
              <span className="font-mono text-xs text-stone-500">
                {earned.size}/{ALL_BADGES.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500">{t("badgesHint")}</p>
            <ul className="mt-4 grid grid-cols-2 gap-3" data-testid="badge-grid">
              {ALL_BADGES.map((badge) => {
                const has = earned.has(badge);
                return (
                  <li
                    key={badge}
                    data-earned={has}
                    className={`rounded-xl border p-3 ${
                      has
                        ? "border-marigold/40 bg-marigold/10"
                        : "border-white/10 bg-white/[0.02] opacity-50"
                    }`}
                  >
                    <span className={has ? "" : "grayscale"} aria-hidden>
                      {BADGE_EMOJI[badge]}
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-stone-100">
                      {t(`badges.${badge}.name`)}
                    </p>
                    <p className="mt-0.5 text-xs leading-4 text-stone-400">
                      {has ? t(`badges.${badge}.desc`) : t("locked")}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal className={card} delay={0.16}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                {t("focusTitle")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-200">
                {profile ? t(`focusHints.${journeyState}`) : t("noProfile")}
              </p>
            </Reveal>

            <Reveal className={card} delay={0.24}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                {t("journeyTitle")}
              </h2>
              <ol className="mt-4 flex flex-col gap-0.5">
                {JOURNEY_STATES.map((state, i) => {
                  const done = i < journeyIndex;
                  const current = i === journeyIndex;
                  return (
                    <li key={state} className="flex items-center gap-3">
                      <span className="flex flex-col items-center self-stretch">
                        <span
                          className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${
                            current
                              ? "border-marigold bg-marigold shadow-[0_0_10px_rgba(245,165,36,0.7)]"
                              : done
                                ? "border-marigold/60 bg-marigold/50"
                                : "border-white/20 bg-transparent"
                          }`}
                        />
                        {i < JOURNEY_STATES.length - 1 && (
                          <span
                            className={`w-px flex-1 ${done ? "bg-marigold/40" : "bg-white/10"}`}
                            aria-hidden
                          />
                        )}
                      </span>
                      <span
                        className={`pb-3 text-sm ${
                          current
                            ? "font-semibold text-marigold"
                            : done
                              ? "text-stone-300"
                              : "text-stone-500"
                        }`}
                      >
                        {t(`journey.${state}`)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          </div>
        </div>

        <Reveal className={card} delay={0.32}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            {t("timelineTitle")}
          </h2>
          {timeline.length > 0 ? (
            <ol className="mt-3 flex flex-col gap-2" data-testid="activity-timeline">
              {timeline.map((e, i) => (
                <li
                  key={`${e.kind}-${e.createdAt.getTime()}-${i}`}
                  className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2 text-sm last:border-b-0"
                >
                  <span className="text-stone-300">{tDash(`activity.${e.kind}`)}</span>
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-marigold">+{e.amount}</span>
                    <span className="font-mono text-xs text-stone-500">{e.day}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-stone-400">{t("timelineEmpty")}</p>
          )}
        </Reveal>
      </div>
    </main>
  );
}
