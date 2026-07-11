"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  JOB_BOARD_PLATFORMS,
  MARKETPLACE_PLATFORMS,
  PLATFORM_HINT_STORAGE_KEY,
  PLATFORM_META,
  type PlatformId,
} from "@/lib/platforms";

/**
 * The "pick your launchpad" explorer: 17 sites as tappable tiles, one detail
 * card. Selection is a hint, not a commitment — it pre-fills onboarding via
 * localStorage and stays fully changeable there.
 */
export function PlatformExplorer() {
  const t = useTranslations("landing.platforms");
  const [selected, setSelected] = useState<PlatformId>("fiverr");
  const meta = PLATFORM_META[selected];

  const groups: { label: string; hint: string; ids: readonly PlatformId[] }[] = [
    {
      label: t("marketplaces"),
      hint: t("marketplacesHint"),
      ids: MARKETPLACE_PLATFORMS,
    },
    {
      label: t("jobBoards"),
      hint: t("jobBoardsHint"),
      ids: JOB_BOARD_PLATFORMS,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-sm font-semibold text-stone-200">
              {group.label}
              <span className="ml-2 font-normal text-stone-500">{group.hint}</span>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {group.ids.map((id) => {
                const active = id === selected;
                return (
                  <button
                    key={id}
                    type="button"
                    data-testid={`explore-${id}`}
                    aria-pressed={active}
                    onClick={() => setSelected(id)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      active
                        ? "border-[#F5A524] bg-[#F5A524]/15 text-[#F5A524]"
                        : "border-white/15 bg-white/[0.04] text-stone-300 hover:border-[#F5A524]/60"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        active
                          ? "bg-[#F5A524] text-stone-900"
                          : "bg-white/10 text-stone-400"
                      }`}
                    >
                      {PLATFORM_META[id].name[0]}
                    </span>
                    {PLATFORM_META[id].name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        key={selected}
        className="rise flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
        data-testid="explore-detail"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-stone-50">{meta.name}</h3>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-stone-400">
            {meta.category === "marketplace" ? t("marketplaceBadge") : t("jobBoardBadge")}
          </span>
        </div>
        <p className="text-pretty leading-7 text-stone-300">
          {t(`items.${selected}.tagline`)}
        </p>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {t("approachLabel")}
          </p>
          <p className="mt-1 text-sm leading-6 text-stone-300">
            {t(`items.${selected}.approach`)}
          </p>
        </div>
        <div className="rounded-xl border border-[#F5A524]/25 bg-[#F5A524]/[0.06] p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#F5A524]">
            {t("patienceLabel")}
          </p>
          <p className="mt-1 text-sm leading-6 text-stone-300">
            {t(`items.${selected}.patience`)}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/sign-in"
            data-testid="explore-start"
            onClick={() =>
              window.localStorage.setItem(PLATFORM_HINT_STORAGE_KEY, selected)
            }
            className="rounded-full bg-[#F5A524] px-5 py-2.5 text-sm font-semibold text-stone-900 transition-transform hover:scale-[1.03]"
          >
            {t("startWith", { name: meta.name })}
          </Link>
          <a
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone-400 transition-colors hover:text-[#F5A524]"
          >
            {t("visit")} ↗
          </a>
        </div>
      </div>
    </div>
  );
}
