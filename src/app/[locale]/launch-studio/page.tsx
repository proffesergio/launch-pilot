import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getDb } from "@/db";
import { freelancerProfiles, launchAssets } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import { getAuth } from "@/lib/auth";
import { loadPlatformTracks } from "@/lib/content";
import { getFlag } from "@/lib/flags";
import {
  ASSET_KINDS,
  schemaForKind,
  type AssetContent,
  type AssetKind,
} from "@/lib/launch-assets";
import {
  PLATFORMS,
  PLATFORM_META,
  type PlatformCategory,
} from "@/lib/platforms";
import type { SkillId } from "@/lib/skills";
import { toolsForPlatform } from "@/lib/tools";
import { LaunchStudio, type AssetState, type PlaybookEntry } from "./studio";

export default async function LaunchStudioPage({
  params,
}: PageProps<"/[locale]/launch-studio">) {
  if (!getFlag("m35_launch_studio")) notFound();

  const { locale } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }
  const userId = session!.user.id;

  const db = getDb();
  const [profile, rows] = await Promise.all([
    db.query.freelancerProfiles.findFirst({
      where: eq(freelancerProfiles.userId, userId),
    }),
    db.query.launchAssets.findMany({
      where: eq(launchAssets.userId, userId),
    }),
  ]);

  // Existing drafts keyed by kind, re-validated so a stale row can't crash the editor.
  const assets: Record<AssetKind, AssetState | null> = {
    fiverr_gig: null,
    upwork_profile: null,
  };
  for (const kind of ASSET_KINDS) {
    const row = rows.find((r) => r.assetKind === kind);
    if (!row) continue;
    const parsed = schemaForKind(kind).safeParse(row.content);
    if (parsed.success) {
      assets[kind] = {
        content: parsed.data as AssetContent,
        status: row.status === "published" ? "published" : "draft",
      };
    }
  }

  const tracks = loadPlatformTracks();
  const skillId = profile?.skillId as SkillId | undefined;

  // Precompute the Playbook for all 17 platforms: curated tips + curated tools.
  const playbook: PlaybookEntry[] = PLATFORMS.map((id) => ({
    id,
    name: PLATFORM_META[id].name,
    url: PLATFORM_META[id].url,
    category: PLATFORM_META[id].category as PlatformCategory,
    tips: tracks[id].items.map((i) => ({ kind: i.kind, text: i.text })),
    tools: toolsForPlatform(id, skillId).map((t) => ({
      id: t.id,
      name: t.name,
      url: t.url,
      pricing: t.pricing,
      whatFor: t.whatFor,
    })),
  }));

  const t = await getTranslations("studio");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8 text-stone-100">
      <div>
        <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-50">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-stone-400">{t("subtitle")}</p>
      </div>
      <LaunchStudio
        hasProfile={!!profile}
        assets={assets}
        playbook={playbook}
      />
    </main>
  );
}
