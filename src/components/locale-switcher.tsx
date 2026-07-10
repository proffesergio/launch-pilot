"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("common.localeSwitcher");
  const active = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-current={locale === active ? "true" : undefined}
          className={
            locale === active
              ? "rounded-full bg-stone-900 px-3 py-1 text-stone-50"
              : "rounded-full px-3 py-1 text-stone-500 hover:text-stone-900"
          }
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
