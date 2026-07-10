import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { TapToListen } from "@/components/tap-to-listen";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex flex-1 flex-col bg-stone-50 font-sans text-stone-900">
      <header className="flex w-full items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">
          {t("common.appName")}
        </span>
        <LocaleSwitcher />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-6 px-6 pb-24">
        <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          {t("home.title")}
        </h1>
        <p className="max-w-prose text-lg leading-8 text-stone-600">
          {t("home.intro")}
        </p>
        <TapToListen text={t("home.intro")} />
        <p className="max-w-prose text-sm leading-6 text-stone-500">
          {t("home.status")}
        </p>
      </main>
    </div>
  );
}
