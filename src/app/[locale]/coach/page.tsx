import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getAuth } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { CoachChat } from "./coach-chat";

export default async function CoachPage({
  params,
}: PageProps<"/[locale]/coach">) {
  if (!getFlag("m3_coach")) notFound();

  const { locale } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  const t = await getTranslations("coach");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-8">
      <div>
        <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{t("subtitle")}</p>
      </div>
      <CoachChat />
    </main>
  );
}
