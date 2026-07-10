"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

/**
 * The inclusion primitive: reads any string aloud via /api/tts. Silent
 * degrade (disabled state) if audio fails — listening is an enhancement,
 * never a blocker.
 */
export function TapToListen({ text }: { text: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "failed">("idle");

  async function play() {
    try {
      setState("playing");
      if (!audioRef.current) {
        const params = new URLSearchParams({ text, locale });
        audioRef.current = new Audio(`/api/tts?${params}`);
        audioRef.current.addEventListener("ended", () => setState("idle"));
      }
      await audioRef.current.play();
    } catch {
      setState("failed");
    }
  }

  return (
    <button
      type="button"
      onClick={play}
      disabled={state !== "idle"}
      data-testid="tap-to-listen"
      aria-label={t("listen")}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 disabled:opacity-50"
    >
      <span aria-hidden>🔊</span>
      {t("listen")}
    </button>
  );
}
