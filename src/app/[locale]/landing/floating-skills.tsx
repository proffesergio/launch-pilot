"use client";

import { motion, useReducedMotion } from "motion/react";

import { Link } from "@/i18n/navigation";

export type SkillChip = { id: string; label: string; emoji: string };

/**
 * The hero's floating skill chips: every chip is a real door into the
 * product (→ sign-in). Gentle bobbing — transform-only, staggered so the
 * cloud feels alive without a canvas in sight.
 */
export function FloatingSkills({
  skills,
  label,
}: {
  skills: SkillChip[];
  label: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-stone-400">{label}</p>
      <div className="flex max-w-3xl flex-wrap items-center justify-center gap-3">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.id}
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: [0, i % 2 === 0 ? -6 : -4, 0] }
            }
            transition={{
              opacity: { duration: 0.4, delay: 0.7 + i * 0.07 },
              scale: { duration: 0.4, delay: 0.7 + i * 0.07 },
              y: {
                duration: 3.2 + (i % 5) * 0.55,
                delay: 1.2 + (i % 3) * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={reduced ? undefined : { scale: 1.08 }}
          >
            <Link
              href="/sign-in"
              data-testid={`skill-chip-${skill.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-stone-200 backdrop-blur-sm transition-colors hover:border-marigold/70 hover:text-marigold"
            >
              <span aria-hidden>{skill.emoji}</span>
              {skill.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
