"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "streaming" | "done" | "error";

export function StreamProof() {
  const t = useTranslations("aiProof");
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");

  async function run() {
    setStatus("streaming");
    setText("");
    try {
      const res = await fetch("/api/ai-proof", { method: "POST" });
      if (!res.ok || !res.body) throw new Error(`http ${res.status}`);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + value);
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={run}
        disabled={status === "streaming"}
        className="w-fit rounded-lg bg-stone-900 px-4 py-2.5 font-medium text-stone-50 disabled:opacity-50"
      >
        {t("run")}
      </button>
      <p
        data-testid="ai-proof-output"
        aria-live="polite"
        className="min-h-16 whitespace-pre-wrap rounded-lg border border-stone-200 bg-white p-4 leading-7 text-stone-800"
      >
        {text}
        {status === "error" && (
          <span className="text-red-600">{t("error")}</span>
        )}
      </p>
    </div>
  );
}
