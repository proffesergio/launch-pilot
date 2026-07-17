"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type TutorialStep = { title: string; body: string };
export type TutorialMock = {
  phoneTitle: string;
  phoneCta: string;
  wizardTitle: string;
  chatQ: string;
  chatA: string;
  roadmapTitle: string;
};

const STEP_MS = 5000;

/**
 * The animated product walkthrough: three auto-advancing mock screens
 * (sign-in → onboarding → Atlas) inside a phone frame, with the step list as
 * both narration and navigation. Clicking a step pins it; auto-play resumes
 * on the next full cycle. Everything is DOM + transforms — no video, no
 * canvas, cheap on 4G.
 */
export function Tutorial({
  steps,
  mock,
  skillSamples,
}: {
  steps: TutorialStep[];
  mock: TutorialMock;
  skillSamples: string[];
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (reduced || pinned) return;
    const id = setInterval(() => {
      setActive((current) => (current + 1) % steps.length);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [reduced, pinned, steps.length]);

  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const current = i === active;
          return (
            <li key={step.title}>
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setPinned(true);
                }}
                aria-current={current}
                className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                  current
                    ? "border-marigold/60 bg-white/[0.06]"
                    : "border-white/10 bg-transparent hover:border-white/25"
                }`}
              >
                <span
                  className={`font-mono text-sm ${current ? "text-marigold" : "text-stone-500"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-stone-50">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-stone-400">
                  {step.body}
                </p>
                {current && !reduced && !pinned && (
                  <motion.span
                    className="mt-3 block h-0.5 rounded-full bg-marigold/70"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto w-full max-w-xs">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#12100e] p-4 shadow-[0_0_60px_rgba(245,165,36,0.12)]">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/10" aria-hidden />
          <div className="relative h-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="absolute inset-0 flex flex-col gap-3"
                initial={reduced ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {active === 0 && <SignInMock mock={mock} reduced={!!reduced} />}
                {active === 1 && (
                  <WizardMock mock={mock} skills={skillSamples} reduced={!!reduced} />
                )}
                {active === 2 && <ChatMock mock={mock} reduced={!!reduced} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockTitle({ children }: { children: string }) {
  return (
    <p className="text-sm font-semibold text-stone-100">
      <span className="mr-2 inline-block h-1 w-6 rounded-full bg-marigold align-middle" />
      {children}
    </p>
  );
}

function SignInMock({ mock, reduced }: { mock: TutorialMock; reduced: boolean }) {
  return (
    <>
      <MockTitle>{mock.phoneTitle}</MockTitle>
      <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 font-mono text-sm text-stone-300">
        🌐 +•• ••• •••678
      </div>
      <div className="rounded-xl bg-marigold px-3 py-2.5 text-center text-sm font-semibold text-ink">
        {mock.phoneCta}
      </div>
      <div className="mt-2 flex justify-center gap-2" aria-hidden>
        {["4", "0", "9", "3", "2", "8"].map((digit, i) => (
          <motion.span
            key={i}
            className="flex h-10 w-8 items-center justify-center rounded-lg border border-marigold/50 bg-marigold/10 font-mono text-lg text-marigold"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.18 }}
          >
            {digit}
          </motion.span>
        ))}
      </div>
    </>
  );
}

function WizardMock({
  mock,
  skills,
  reduced,
}: {
  mock: TutorialMock;
  skills: string[];
  reduced: boolean;
}) {
  return (
    <>
      <MockTitle>{mock.wizardTitle}</MockTitle>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <motion.span
            key={skill}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              i === 1
                ? "border-marigold bg-marigold/15 text-marigold"
                : "border-white/15 text-stone-300"
            }`}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: i === 1 ? [1, 1.08, 1] : 1 }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="mt-2 flex flex-col gap-2"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <p className="text-xs uppercase tracking-wide text-stone-500">
          {mock.roadmapTitle}
        </p>
        {[0.85, 0.7, 0.55].map((width, i) => (
          <motion.div
            key={i}
            className="h-8 rounded-lg border border-white/10 bg-white/[0.05]"
            style={{ width: `${width * 100}%` }}
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 + i * 0.2 }}
          />
        ))}
      </motion.div>
    </>
  );
}

function ChatMock({ mock, reduced }: { mock: TutorialMock; reduced: boolean }) {
  return (
    <>
      <MockTitle>Atlas</MockTitle>
      <motion.p
        className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-marigold/90 px-3 py-2 text-xs leading-5 text-ink"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {mock.chatQ}
      </motion.p>
      <motion.p
        className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-3 py-2 text-xs leading-5 text-stone-200"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        {mock.chatA}
      </motion.p>
      <motion.span
        className="mt-1 w-fit rounded-full border border-marigold/40 bg-marigold/10 px-3 py-1 font-mono text-xs text-marigold"
        initial={reduced ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.9 }}
      >
        +10 XP
      </motion.span>
    </>
  );
}
