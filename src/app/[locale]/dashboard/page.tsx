import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { getDb } from "@/db";
import { freelancerProfiles } from "@/db/schema";
import { Link, redirect } from "@/i18n/navigation";
import { getAuth } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { SignOutButton } from "./sign-out-button";

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

  const t = await getTranslations("dashboard");
  const profile = await getDb().query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, session!.user.id),
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
        {t("title")}
      </h1>
      <p className="text-stone-600">
        {t("signedInAs", { email: session!.user.email })}
      </p>

      {profile && getFlag("m2_roadmap") && (
        <Link
          href="/roadmap"
          data-testid="view-roadmap"
          className="w-fit rounded-lg bg-[#F5A524] px-5 py-2.5 font-medium text-stone-900"
        >
          {t("viewRoadmap")}
        </Link>
      )}

      {profile ? (
        <dl
          data-testid="profile-summary"
          className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-xl border border-stone-200 bg-white p-5 text-stone-800"
        >
          <dt className="text-stone-500">{t("profile.skill")}</dt>
          <dd className="font-medium">{profile.skillId}</dd>
          <dt className="text-stone-500">{t("profile.platform")}</dt>
          <dd className="font-medium">{profile.targetPlatform}</dd>
          <dt className="text-stone-500">{t("profile.state")}</dt>
          <dd className="font-medium">{profile.journeyState}</dd>
        </dl>
      ) : (
        getFlag("m1_onboarding") && (
          <Link
            href="/onboarding"
            data-testid="start-onboarding"
            className="w-fit rounded-lg bg-[#F5A524] px-5 py-2.5 font-medium text-stone-900"
          >
            {t("startOnboarding")}
          </Link>
        )
      )}

      <SignOutButton />
    </main>
  );
}
