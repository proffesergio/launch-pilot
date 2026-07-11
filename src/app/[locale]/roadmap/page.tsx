import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { getDb } from "@/db";
import { roadmapMissions, userRoadmaps } from "@/db/schema";
import { Link, redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getAuth } from "@/lib/auth";
import { loadMissionTemplates } from "@/lib/content";
import { getFlag } from "@/lib/flags";
import { missionXp } from "@/lib/xp";
import { RoadmapView, type MissionVM, type PhaseVM } from "./roadmap-view";

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
  const tDash = await getTranslations("dashboard");
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

  const phases: PhaseVM[] = [1, 2, 3].map((phase) => ({
    phase,
    name: PHASE_NAMES[phase][lang],
    missions: rows
      .filter((r) => r.phase === phase)
      .flatMap((r): MissionVM[] => {
        const template = templates.get(r.missionKey);
        if (!template) return [];
        return [
          {
            id: r.id,
            key: r.missionKey,
            title: template.title[lang],
            objective: template.objective[lang],
            minutes: template.estMinutes,
            xp: missionXp(template.estMinutes, template.category),
            status: r.status as MissionVM["status"],
            boss: template.type === "boss",
          },
        ];
      }),
  }));

  return (
    <main className="dawn-sky grain relative flex min-h-dvh flex-1 flex-col">
      <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-stone-400 transition-colors hover:text-marigold"
          >
            ← {tDash("title")}
          </Link>
          <span className="mt-4 block h-1.5 w-16 rounded-full bg-marigold" />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-stone-400">{t("subtitle")}</p>
        </div>

        <RoadmapView phases={phases} />
      </div>
    </main>
  );
}
