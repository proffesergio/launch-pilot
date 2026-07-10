import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { redirect } from "@/i18n/navigation";
import { getAuth } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage({
  params,
}: PageProps<"/[locale]/onboarding">) {
  if (!getFlag("m1_onboarding")) notFound();

  const { locale } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-6 py-12">
      <OnboardingWizard />
    </main>
  );
}
