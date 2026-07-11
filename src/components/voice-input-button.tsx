"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";

/**
 * Voice input via the browser's Web Speech API — for users who find typing
 * hard (a core LaunchPilot audience). Renders nothing when the API is
 * unavailable, so it is purely progressive enhancement. Bangla first:
 * recognition language follows the UI locale.
 */

type MinimalSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type RecognitionCtor = new () => MinimalSpeechRecognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  // The API is vendor-prefixed and absent from TS's DOM lib; this cast is the
  // documented feature-detection pattern, not a type shortcut.
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceInputButton({
  onTranscript,
  testId = "voice-input",
}: {
  onTranscript: (text: string) => void;
  testId?: string;
}) {
  const t = useTranslations("common.voice");
  const locale = useLocale();
  // Hydration-safe feature detection: false on the server, real on the client.
  const supported = useSyncExternalStore(
    () => () => {},
    () => recognitionCtor() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = locale === "bn" ? "bn-BD" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = Array.from(
        { length: event.results.length },
        (_, i) => event.results[i][0]?.transcript ?? "",
      )
        .join(" ")
        .trim();
      if (text) onTranscript(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? t("stop") : t("start")}
      title={listening ? t("stop") : t("start")}
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors ${
        listening
          ? "border-[#F5A524] bg-[#F5A524]/15 text-[#F5A524]"
          : "border-stone-300 bg-white text-stone-500 hover:border-[#F5A524] hover:text-[#F5A524]"
      }`}
    >
      {listening && (
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-xl border border-[#F5A524]/60"
        />
      )}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
      </svg>
    </button>
  );
}
