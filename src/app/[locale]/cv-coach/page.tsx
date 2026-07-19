import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getDb } from "@/db";
import { freelancerProfiles } from "@/db/schema";
import { redirect } from "@/i18n/navigation";
import { getAuth } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import {
  JOB_BOARD_PLATFORMS,
  PLATFORM_META,
  isPlatformId,
  platformCategory,
  type PlatformId,
} from "@/lib/platforms";
import { CvCoachForm } from "./cv-coach-form";

/** Representative job board used before the user has picked one of their own. */
const DEFAULT_JOB_BOARD: PlatformId = JOB_BOARD_PLATFORMS[0];

export default async function CvCoachPage({
  params,
}: PageProps<"/[locale]/cv-coach">) {
  // One slice, one flag: off in production until the coach path is signed off.
  if (!getFlag("cv_coach")) notFound();

  const { locale } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }
  const userId = session!.user.id;

  const profile = await getDb().query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, userId),
  });

  // The coach lives in the job_board path (ADR-0012/0015): tailor to the user's
  // chosen job board when it is one, otherwise a sensible default so the tool
  // still works before a job-board platform is picked.
  const picked = profile?.targetPlatform;
  const platform: PlatformId =
    picked && isPlatformId(picked) && platformCategory(picked) === "job_board"
      ? picked
      : DEFAULT_JOB_BOARD;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
      <CvCoachForm
        platform={platform}
        platformName={PLATFORM_META[platform].name}
      />
    </main>
  );
}
