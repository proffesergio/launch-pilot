"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("common.localeSwitcher");
  const active = useLocale();
  const pathname = usePathname();

  // A single toggle button, not a side-by-side pair: show only the *other*
  // locale, so one tap switches languages. The link text is the target
  // language in its own script (e.g. "English" while on /bn, "বাংলা" on /en).
  const target = routing.locales.find((locale) => locale !== active);
  if (!target) return null;

  return (
    <nav aria-label={t("label")} className="text-sm">
      <Link
        href={pathname}
        locale={target}
        className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1 text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
      >
        <span aria-hidden="true">🌐</span>
        {t(target)}
      </Link>
    </nav>
  );
}
