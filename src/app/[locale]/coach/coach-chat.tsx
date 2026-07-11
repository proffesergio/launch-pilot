"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { TapToListen } from "@/components/tap-to-listen";
import { VoiceInputButton } from "@/components/voice-input-button";

type Turn = { role: "user" | "assistant"; text: string };

export function CoachChat() {
  const t = useTranslations("coach");
  const locale = useLocale();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const listRef = useRef<HTMLDivElement>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || status === "streaming") return;

    setInput("");
    setStatus("streaming");
    setTurns((prev) => [...prev, { role: "user", text: message }]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, locale }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        // Graceful degrade path: daily cap reached — a message, not an error.
        const body = (await res.json()) as { degraded?: boolean };
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            text: body.degraded ? t("dailyCap") : t("error"),
          },
        ]);
        setStatus(body.degraded ? "idle" : "error");
        return;
      }
      if (!res.ok || !res.body) throw new Error(`http ${res.status}`);

      setTurns((prev) => [...prev, { role: "assistant", text: "" }]);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setTurns((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            text: next[next.length - 1].text + value,
          };
          return next;
        });
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      }
      setStatus("idle");
    } catch {
      setStatus("error");
      setTurns((prev) => [...prev, { role: "assistant", text: t("error") }]);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div
        ref={listRef}
        data-testid="coach-turns"
        className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-stone-200 bg-white p-4"
      >
        {turns.length === 0 && (
          <p className="text-sm text-stone-400">{t("empty")}</p>
        )}
        {turns.map((turn, i) => (
          <div
            key={i}
            className={`flex max-w-[85%] flex-col gap-1.5 ${
              turn.role === "user" ? "self-end" : "self-start"
            }`}
          >
            <div
              className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 leading-7 ${
                turn.role === "user"
                  ? "bg-stone-900 text-stone-50"
                  : "bg-amber-50 text-stone-900"
              }`}
            >
              {turn.text || "…"}
            </div>
            {turn.role === "assistant" && turn.text && status !== "streaming" && (
              <TapToListen text={turn.text.slice(0, 500)} />
            )}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <VoiceInputButton
          testId="coach-voice"
          onTranscript={(text) =>
            setInput((prev) => (prev ? `${prev} ${text}` : text))
          }
        />
        <input
          data-testid="coach-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          maxLength={2000}
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none focus:border-[#F5A524]"
        />
        <button
          type="submit"
          data-testid="coach-send"
          disabled={status === "streaming" || !input.trim()}
          className="rounded-xl bg-stone-900 px-5 py-2.5 font-medium text-stone-50 disabled:opacity-50"
        >
          {t("send")}
        </button>
      </form>
    </div>
  );
}
