"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { TapToListen } from "@/components/tap-to-listen";
import { useRouter } from "@/i18n/navigation";
import type { OnboardingAnswers } from "@/lib/onboarding";
import { SKILLS } from "@/lib/skills";

import { completeOnboarding } from "./actions";

const SUGGESTED_SKILLS = SKILLS.filter((s) => s !== "general_freelancing");

const STEPS = ["skill", "platform", "hours", "english", "experience"] as const;
type Step = (typeof STEPS)[number];

const HOUR_CHOICES = [5, 10, 15, 20, 30, 40];

type Draft = Partial<OnboardingAnswers>;

/** One choice-card. Selection advances state; submission happens at the end. */
function Choice({
  selected,
  onSelect,
  title,
  hint,
  testId,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint?: string;
  testId: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
        selected
          ? "border-[#F5A524] bg-amber-50"
          : "border-stone-200 bg-white hover:border-stone-400"
      }`}
    >
      <span className="font-medium text-stone-900">{title}</span>
      {hint && <span className="text-sm text-stone-500">{hint}</span>}
    </button>
  );
}

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const reduced = useReducedMotion();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const step: Step = STEPS[stepIndex];

  const stepComplete: Record<Step, boolean> = {
    skill: !!draft.rawSkill?.trim(),
    platform: !!draft.targetPlatform,
    hours: !!draft.weeklyHours,
    english: !!draft.englishConfidence,
    experience: !!draft.experience,
  };

  async function submit() {
    setStatus("saving");
    const result = await completeOnboarding(draft);
    if (result.ok) {
      // No router.refresh() here: in Next 16 a refresh issued right after
      // push cancels the pending navigation, and the completed server action
      // has already invalidated the client cache for the dashboard.
      router.push("/dashboard");
    } else {
      setStatus("error");
    }
  }

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
    else void submit();
  }

  const question = t(`${step}.question`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              i <= stepIndex ? "w-8 bg-[#F5A524]" : "w-4 bg-stone-200"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          {question}
        </h1>
        <TapToListen text={question} />
      </div>

      {step === "skill" && (
        <div className="flex flex-col gap-4">
          <textarea
            data-testid="onboarding-skill"
            value={draft.rawSkill ?? ""}
            onChange={(e) => setDraft({ ...draft, rawSkill: e.target.value })}
            placeholder={t("skill.placeholder")}
            rows={3}
            maxLength={300}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-[#F5A524]"
          />
          <div className="flex flex-col gap-2.5">
            <p className="text-sm text-stone-500">{t("skill.suggestionsLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map((skillId, i) => {
                const phrase = t(`skill.suggestions.${skillId}`);
                const selected = draft.rawSkill === phrase;
                return (
                  <motion.button
                    key={skillId}
                    type="button"
                    data-testid={`skill-suggestion-${skillId}`}
                    aria-pressed={selected}
                    onClick={() => setDraft({ ...draft, rawSkill: phrase })}
                    initial={reduced ? false : { opacity: 0, scale: 0.85, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                    whileHover={reduced ? undefined : { scale: 1.05 }}
                    whileTap={reduced ? undefined : { scale: 0.97 }}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      selected
                        ? "border-[#F5A524] bg-amber-50 text-stone-900"
                        : "border-stone-300 bg-white text-stone-700 hover:border-[#F5A524]"
                    }`}
                  >
                    {phrase}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === "platform" && (
        <div className="grid grid-cols-2 gap-3">
          {(["fiverr", "upwork"] as const).map((p) => (
            <Choice
              key={p}
              testId={`platform-${p}`}
              selected={draft.targetPlatform === p}
              onSelect={() => setDraft({ ...draft, targetPlatform: p })}
              title={t(`platform.${p}`)}
              hint={t(`platform.${p}Hint`)}
            />
          ))}
        </div>
      )}

      {step === "hours" && (
        <div className="grid grid-cols-3 gap-3">
          {HOUR_CHOICES.map((h) => (
            <Choice
              key={h}
              testId={`hours-${h}`}
              selected={draft.weeklyHours === h}
              onSelect={() => setDraft({ ...draft, weeklyHours: h })}
              title={t("hours.perWeek", { hours: h })}
            />
          ))}
        </div>
      )}

      {step === "english" && (
        <div className="flex flex-col gap-3">
          {(["low", "medium", "high"] as const).map((level) => (
            <Choice
              key={level}
              testId={`english-${level}`}
              selected={draft.englishConfidence === level}
              onSelect={() => setDraft({ ...draft, englishConfidence: level })}
              title={t(`english.${level}`)}
              hint={t(`english.${level}Hint`)}
            />
          ))}
        </div>
      )}

      {step === "experience" && (
        <div className="flex flex-col gap-3">
          {(["none", "some", "experienced"] as const).map((level) => (
            <Choice
              key={level}
              testId={`experience-${level}`}
              selected={draft.experience === level}
              onSelect={() => setDraft({ ...draft, experience: level })}
              title={t(`experience.${level}`)}
              hint={t(`experience.${level}Hint`)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0 || status === "saving"}
          className="rounded-lg px-4 py-2.5 font-medium text-stone-500 disabled:opacity-0"
        >
          {t("back")}
        </button>
        <button
          type="button"
          data-testid="onboarding-next"
          onClick={next}
          disabled={!stepComplete[step] || status === "saving"}
          className="rounded-lg bg-stone-900 px-6 py-2.5 font-medium text-stone-50 disabled:opacity-50"
        >
          {stepIndex === STEPS.length - 1 ? t("finish") : t("next")}
        </button>
      </div>

      <p aria-live="polite" className="min-h-6 text-sm text-red-600">
        {status === "error" && t("error")}
      </p>
    </div>
  );
}
