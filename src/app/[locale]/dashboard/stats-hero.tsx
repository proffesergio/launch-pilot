"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

export type StatsHeroProps = {
  totalXp: number;
  level: number;
  intoLevel: number;
  needed: number;
  /** 0..1 — fill of the ring and the bar. */
  progress: number;
  streak: number;
};

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The hero stats: animated level ring, XP-to-next-level bar, streak flame.
 * Numbers render in Geist Mono (font-mono) — the "instrument panel" of the
 * dashboard. All animation is transform/opacity/stroke, cheap on mid Android.
 */
export function StatsHero({
  totalXp,
  level,
  intoLevel,
  needed,
  progress,
  streak,
}: StatsHeroProps) {
  const t = useTranslations("dashboard");
  const reduced = useReducedMotion();
  const dashTarget = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="relative h-32 w-32 shrink-0" data-testid="level-ring">
        <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <motion.circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            stroke="#F5A524"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={
              reduced ? { strokeDashoffset: dashTarget } : { strokeDashoffset: CIRCUMFERENCE }
            }
            animate={{ strokeDashoffset: dashTarget }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ filter: "drop-shadow(0 0 6px rgba(245,165,36,0.45))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold text-stone-50">
            {level}
          </span>
          <span className="text-xs uppercase tracking-widest text-stone-400">
            {t("levelLabel")}
          </span>
        </div>
      </div>

      <div className="flex min-w-56 flex-1 flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-sm text-stone-300">
            {t("levelProgress", { into: intoLevel, needed })}
          </span>
          <span className="text-sm text-stone-400">
            {t("toNextLevel", { xp: needed - intoLevel, next: level + 1 })}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#e07a2e] to-[#F5A524]"
            style={{ transformOrigin: "left" }}
            initial={reduced ? { scaleX: progress } : { scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 1.1, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-2xl font-semibold text-stone-50"
              data-testid="total-xp"
            >
              {totalXp}
            </span>
            <span className="text-sm text-stone-400">{t("totalXp")}</span>
          </div>
          <div className="flex items-center gap-2" data-testid="streak">
            <span aria-hidden className={streak > 0 ? "" : "opacity-40 grayscale"}>
              🔥
            </span>
            {streak > 0 ? (
              <span className="text-sm text-stone-200">
                {t("streakAlive", { days: streak })}
              </span>
            ) : (
              <span className="text-sm text-stone-400">{t("streakNone")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
