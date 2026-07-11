"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { TapToListen } from "@/components/tap-to-listen";
import { useRouter } from "@/i18n/navigation";
import { completeMission } from "./actions";

export type MissionVM = {
  id: string;
  key: string;
  title: string;
  objective: string;
  minutes: number;
  xp: number;
  status: "locked" | "unlocked" | "done";
  boss: boolean;
};

export type PhaseVM = {
  phase: number;
  name: string;
  missions: MissionVM[];
};

/**
 * The interactive journey: expandable mission cards with an honesty
 * checklist, a guarded complete action, XP toast, and per-phase progress.
 * data-testid / data-status stay stable for the M2 E2E path.
 */
export function RoadmapView({ phases }: { phases: PhaseVM[] }) {
  const t = useTranslations("roadmap");
  const router = useRouter();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const toastSeq = useRef(0);

  const all = phases.flatMap((p) => p.missions);
  const doneCount = all.filter((m) => m.status === "done").length;

  function showToast(text: string) {
    toastSeq.current += 1;
    setToast({ text, key: toastSeq.current });
    setTimeout(() => setToast(null), 2600);
  }

  async function markDone(mission: MissionVM) {
    setSaving(mission.id);
    const result = await completeMission({ missionId: mission.id });
    setSaving(null);
    if (result.ok) {
      showToast(
        result.journeyAdvanced
          ? `${t("xpToast", { xp: result.xp })} · ${t("phaseUnlocked")}`
          : t("xpToast", { xp: result.xp }),
      );
      setOpen(null);
      router.refresh();
    } else {
      showToast(t("completeError"));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Overall progress */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-2xl text-stone-50">
            {doneCount}
            <span className="text-stone-500"> / {all.length}</span>
          </p>
          <p className="text-sm text-stone-400">
            {t("progress", { done: doneCount, total: all.length })}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#e07a2e] to-marigold"
            style={{ transformOrigin: "left" }}
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: all.length ? doneCount / all.length : 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </div>
      </div>

      {phases.map(({ phase, name, missions }) => {
        const phaseDone = missions.filter((m) => m.status === "done").length;
        return (
          <section key={phase} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
                {t("phase", { number: phase })} — {name}
              </h2>
              <span className="font-mono text-xs text-stone-500">
                {phaseDone}/{missions.length}
              </span>
            </div>

            <ol className="flex flex-col gap-3">
              {missions.map((mission) => {
                const isOpen = open === mission.id;
                const isDone = mission.status === "done";
                const isLocked = mission.status === "locked";
                return (
                  <li
                    key={mission.id}
                    data-testid={`mission-${mission.key}`}
                    data-status={mission.status}
                    className={`rounded-xl border transition-colors ${
                      isDone
                        ? "border-marigold/40 bg-marigold/[0.07]"
                        : isLocked
                          ? "border-white/10 bg-white/[0.02] opacity-60"
                          : "border-marigold/70 bg-white/[0.05]"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setOpen(isOpen ? null : mission.id)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left disabled:cursor-not-allowed"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-sm ${
                            isDone
                              ? "border-marigold bg-marigold text-ink"
                              : isLocked
                                ? "border-white/20 text-stone-500"
                                : "border-marigold/70 text-marigold"
                          }`}
                        >
                          {isDone ? "✓" : isLocked ? "🔒" : mission.boss ? "⚔️" : "•"}
                        </span>
                        <span className="flex flex-col">
                          <span
                            className={`font-medium ${
                              isDone ? "text-stone-300" : "text-stone-50"
                            }`}
                          >
                            {mission.title}
                          </span>
                          <span className="font-mono text-xs text-stone-500">
                            {mission.boss && `${t("bossLabel")} · `}
                            {t("effort", { minutes: mission.minutes, xp: mission.xp })}
                            {isLocked && ` · ${t("locked")}`}
                            {isDone && ` · ${t("doneLabel")}`}
                          </span>
                        </span>
                      </span>
                      {!isLocked && !isDone && (
                        <span
                          aria-hidden
                          className={`text-stone-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        >
                          ▾
                        </span>
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && !isDone && !isLocked && (
                        <motion.div
                          initial={reduced ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduced ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-4 border-t border-white/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                              {t("checklist")}
                            </p>
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                data-testid={`mission-check-${mission.key}`}
                                checked={checked[mission.id] ?? false}
                                onChange={(e) =>
                                  setChecked((prev) => ({
                                    ...prev,
                                    [mission.id]: e.target.checked,
                                  }))
                                }
                                className="mt-1 h-4 w-4 accent-[#F5A524]"
                              />
                              <span className="text-sm leading-6 text-stone-200">
                                {mission.objective}
                              </span>
                            </label>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <TapToListen text={mission.objective} />
                              <button
                                type="button"
                                data-testid={`mission-complete-${mission.key}`}
                                disabled={!checked[mission.id] || saving === mission.id}
                                onClick={() => void markDone(mission)}
                                className="rounded-lg bg-marigold px-5 py-2.5 font-medium text-ink transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
                              >
                                {saving === mission.id ? t("saving") : t("markDone")}
                              </button>
                            </div>
                            <p className="text-xs text-stone-500">{t("checklistHint")}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {/* XP toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-marigold/50 bg-[#191410] px-5 py-2.5 font-mono text-sm text-marigold shadow-[0_0_30px_rgba(245,165,36,0.35)]"
            role="status"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
