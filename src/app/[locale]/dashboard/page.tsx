import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { getDb } from "@/db";
import { freelancerProfiles, roadmapMissions, userRoadmaps } from "@/db/schema";
import { Link, redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getAuth } from "@/lib/auth";
import { loadMissionTemplates } from "@/lib/content";
import { getFlag } from "@/lib/flags";
import { XpEventKindSchema, utcToday } from "@/lib/gamification";
import { missionXp } from "@/lib/xp";
import { awardXp, getGamificationSummary } from "@/lib/xp-service";
import { Reveal } from "./reveal";
import { SignOutButton } from "./sign-out-button";
import { StatsHero } from "./stats-hero";

const card =
  "rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm";

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect({ href: "/sign-in", locale });
  }
  const userId = session!.user.id;

  const t = await getTranslations("dashboard");
  const db = getDb();
  const gamified = getFlag("m4_gamification");

  // Opening the app is the day's first activity — it feeds the streak.
  if (gamified) {
    await awardXp({ userId, kind: "daily_checkin", sourceId: utcToday() });
  }

  const [profile, summary] = await Promise.all([
    db.query.freelancerProfiles.findFirst({
      where: eq(freelancerProfiles.userId, userId),
    }),
    gamified ? getGamificationSummary(userId) : Promise.resolve(null),
  ]);

  // Roadmap progress + the first unlocked mission ("focus next").
  let progress: { unlocked: number; total: number } | null = null;
  let focus: { title: string; minutes: number; xp: number } | null = null;
  if (profile && getFlag("m2_roadmap")) {
    const roadmap = await db.query.userRoadmaps.findFirst({
      where: eq(userRoadmaps.userId, userId),
    });
    if (roadmap) {
      const rows = await db.query.roadmapMissions.findMany({
        where: eq(roadmapMissions.roadmapId, roadmap.id),
        orderBy: [asc(roadmapMissions.position)],
      });
      const unlocked = rows.filter((r) => r.status === "unlocked");
      progress = { unlocked: unlocked.length, total: rows.length };
      const templates = new Map(loadMissionTemplates().map((m) => [m.key, m]));
      const next = unlocked[0] && templates.get(unlocked[0].missionKey);
      if (next) {
        focus = {
          title: next.title[locale as AppLocale],
          minutes: next.estMinutes,
          xp: missionXp(next.estMinutes, next.category),
        };
      }
    }
  }

  // Phone sign-ups carry placeholder identity (auth.ts getTempEmail/Name):
  // name = the phone number, email = <digits>@phone.launchpilot.app. Greet
  // those users generically and show the phone, not the synthetic email.
  const rawName = session!.user.name;
  const email = session!.user.email ?? "";
  const phoneSignup = email.endsWith("@phone.launchpilot.app");
  const name =
    rawName && !/^\+?[\d\s-]+$/.test(rawName)
      ? rawName
      : !phoneSignup && email
        ? email.split("@")[0]
        : null;
  const identity = phoneSignup ? rawName || email : email;
  const recent = (summary?.recent ?? []).flatMap((e) => {
    const kind = XpEventKindSchema.safeParse(e.kind);
    return kind.success ? [{ ...e, kind: kind.data }] : [];
  });

  return (
    <main className="dawn-sky grain relative flex min-h-dvh flex-1 flex-col">
      <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block h-1.5 w-16 rounded-full bg-marigold" />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50">
              {name ? t("greeting", { name }) : t("greetingAnon")}
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              {t("signedInAs", { email: identity })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {gamified && (
              <Link
                href="/profile"
                data-testid="open-profile"
                aria-label={t("viewProfile")}
                title={t("viewProfile")}
                className="grid h-11 w-11 place-items-center rounded-full border border-marigold/50 bg-marigold/15 font-semibold text-marigold transition-transform hover:scale-105"
              >
                {(name || identity || "?").trim().charAt(0).toUpperCase()}
              </Link>
            )}
            <SignOutButton />
          </div>
        </header>

        {summary && (
          <Reveal className={card} delay={0}>
            <StatsHero
              totalXp={summary.totalXp}
              level={summary.level.level}
              intoLevel={summary.level.intoLevel}
              needed={summary.level.needed}
              progress={summary.level.progress}
              streak={summary.streak}
            />
          </Reveal>
        )}

        {profile ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal className={card} delay={0.08}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                {t("cards.roadmap")}
              </h2>
              {progress ? (
                <>
                  <p className="mt-3 font-mono text-2xl text-stone-50">
                    {progress.unlocked}
                    <span className="text-stone-500"> / {progress.total}</span>
                  </p>
                  <p className="mt-1 text-sm text-stone-400">
                    {t("cards.roadmapProgress", {
                      unlocked: progress.unlocked,
                      total: progress.total,
                    })}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-marigold"
                      style={{
                        width: `${Math.round((progress.unlocked / Math.max(1, progress.total)) * 100)}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-stone-400">
                  {t("cards.roadmapEmpty")}
                </p>
              )}
              {getFlag("m2_roadmap") && (
                <Link
                  href="/roadmap"
                  data-testid="view-roadmap"
                  className="mt-4 inline-block w-fit rounded-lg bg-marigold px-5 py-2.5 font-medium text-ink transition-transform hover:scale-[1.02]"
                >
                  {t("viewRoadmap")}
                </Link>
              )}
            </Reveal>

            <Reveal className={card} delay={0.16}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                {t("cards.focus")}
              </h2>
              {focus ? (
                <>
                  <p className="mt-3 text-lg font-medium text-stone-50">
                    {focus.title}
                  </p>
                  <p className="mt-1 font-mono text-sm text-marigold">
                    {t("cards.focusMinutes", {
                      minutes: focus.minutes,
                      xp: focus.xp,
                    })}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-stone-400">
                  {t("cards.focusEmpty")}
                </p>
              )}
            </Reveal>

            {getFlag("m3_coach") && (
              <Reveal className={card} delay={0.24}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                  {t("cards.coach")}
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  {t("cards.coachBody")}
                </p>
                <Link
                  href="/coach"
                  data-testid="open-coach"
                  className="mt-4 inline-block w-fit rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 font-medium text-stone-100 transition-colors hover:border-marigold/60"
                >
                  {t("openCoach")}
                </Link>
              </Reveal>
            )}

            {getFlag("m35_launch_studio") && profile && (
              <Reveal className={card} delay={0.28}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                  {t("cards.studio")}
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  {t("cards.studioBody")}
                </p>
                <Link
                  href="/launch-studio"
                  data-testid="open-launch-studio"
                  className="mt-4 inline-block w-fit rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 font-medium text-stone-100 transition-colors hover:border-marigold/60"
                >
                  {t("openStudio")}
                </Link>
              </Reveal>
            )}

            {summary && (
              <Reveal className={card} delay={0.32}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                  {t("cards.activity")}
                </h2>
                {recent.length > 0 ? (
                  <ol className="mt-3 flex flex-col gap-2" data-testid="recent-activity">
                    {recent.map((e, i) => (
                      <li
                        key={`${e.kind}-${e.createdAt.getTime()}-${i}`}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="text-stone-300">
                          {t(`activity.${e.kind}`)}
                        </span>
                        <span className="flex items-baseline gap-3">
                          <span className="font-mono text-marigold">
                            +{e.amount}
                          </span>
                          <span className="font-mono text-xs text-stone-500">
                            {e.day}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-stone-400">
                    {t("cards.activityEmpty")}
                  </p>
                )}
              </Reveal>
            )}

            <Reveal className={`${card} md:col-span-2`} delay={0.4}>
              <dl
                data-testid="profile-summary"
                className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm text-stone-200"
              >
                <dt className="text-stone-500">{t("profile.skill")}</dt>
                <dd className="font-medium">{profile.skillId}</dd>
                <dt className="text-stone-500">{t("profile.platform")}</dt>
                <dd className="font-medium">{profile.targetPlatform}</dd>
                <dt className="text-stone-500">{t("profile.state")}</dt>
                <dd className="font-medium">{profile.journeyState}</dd>
              </dl>
            </Reveal>
          </div>
        ) : (
          getFlag("m1_onboarding") && (
            <Reveal className={card} delay={0.08}>
              <h2 className="text-lg font-semibold text-stone-50">
                {t("cards.onboarding")}
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-6 text-stone-300">
                {t("cards.onboardingBody")}
              </p>
              <Link
                href="/onboarding"
                data-testid="start-onboarding"
                className="mt-4 inline-block w-fit rounded-lg bg-marigold px-5 py-2.5 font-medium text-ink transition-transform hover:scale-[1.02]"
              >
                {t("startOnboarding")}
              </Link>
            </Reveal>
          )
        )}
      </div>
    </main>
  );
}
