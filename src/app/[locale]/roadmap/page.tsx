import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { getDb } from "@/db";
import { roadmapMissions, userRoadmaps } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { TapToListen } from "@/components/tap-to-listen";
import { getAuth } from "@/lib/auth";
import { loadMissionTemplates } from "@/lib/content";
import { getFlag } from "@/lib/flags";
import { missionXp } from "@/lib/xp";

const PHASE_NAMES: Record<number, { bn: string; en: string }> = {
  1: { bn: "ভিত্তি", en: "Foundation" },
  2: { bn: "লাইভ হোন", en: "Go live" },
  3: { bn: "প্রথম অর্ডার", en: "First orders" },
};

export default async function RoadmapPage({
  params,
}: PageProps<"/[locale]/roadmap">) {
  if (!getFlag("m2_roadmap")) notFound();

  const { locale } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  const t = await getTranslations("roadmap");
  const db = getDb();
  const roadmap = await db.query.userRoadmaps.findFirst({
    where: eq(userRoadmaps.userId, session!.user.id),
  });

  if (!roadmap) {
    redirect({ href: "/onboarding", locale });
  }

  const rows = await db.query.roadmapMissions.findMany({
    where: eq(roadmapMissions.roadmapId, roadmap!.id),
    orderBy: [asc(roadmapMissions.position)],
  });
  const templates = new Map(loadMissionTemplates().map((m) => [m.key, m]));
  const lang = locale as AppLocale;

  const phases = [1, 2, 3].map((phase) => ({
    phase,
    rows: rows.filter((r) => r.phase === phase),
  }));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-stone-600">{t("subtitle")}</p>
      </div>

      {phases.map(({ phase, rows: phaseRows }) => (
        <section key={phase} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {t("phase", { number: phase })} — {PHASE_NAMES[phase][lang]}
          </h2>
          <ol className="flex flex-col gap-3">
            {phaseRows.map((row) => {
              const template = templates.get(row.missionKey);
              if (!template) return null;
              const locked = row.status === "locked";
              return (
                <li
                  key={row.id}
                  data-testid={`mission-${row.missionKey}`}
                  data-status={row.status}
                  className={`rounded-xl border p-4 ${
                    locked
                      ? "border-stone-200 bg-stone-50 opacity-70"
                      : "border-[#F5A524] bg-amber-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium text-stone-900">
                        {template.type === "boss" && <span aria-hidden>⚔️</span>}
                        {template.title[lang]}
                      </span>
                      <span className="text-sm leading-6 text-stone-600">
                        {template.objective[lang]}
                      </span>
                      <span className="mt-1 text-xs text-stone-500">
                        {t("effort", {
                          minutes: template.estMinutes,
                          xp: missionXp(template.estMinutes, template.category),
                        })}
                        {locked && ` · ${t("locked")}`}
                      </span>
                    </div>
                    {!locked && <TapToListen text={template.objective[lang]} />}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </main>
  );
}
