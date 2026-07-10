import { getTranslations } from "next-intl/server";

import { StreamProof } from "./stream-proof";

export default async function AiProofPage() {
  const t = await getTranslations("aiProof");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
        {t("title")}
      </h1>
      <p className="text-sm text-stone-500">{t("hint")}</p>
      <StreamProof />
    </main>
  );
}
