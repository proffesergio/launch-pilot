import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getAuth } from "@/lib/auth";
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
        {t("title")}
      </h1>
      <p className="text-stone-600">
        {t("signedInAs", { email: session!.user.email })}
      </p>
      <SignOutButton />
    </main>
  );
}
