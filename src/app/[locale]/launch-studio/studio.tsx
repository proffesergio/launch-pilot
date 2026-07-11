"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type {
  AssetContent,
  AssetKind,
  FiverrGig,
  UpworkProfile,
} from "@/lib/launch-assets";
import { ASSET_KINDS } from "@/lib/launch-assets";
import {
  JOB_BOARD_PLATFORMS,
  MARKETPLACE_PLATFORMS,
  type PlatformCategory,
  type PlatformId,
} from "@/lib/platforms";
import type { ReviewFinding } from "@/lib/launch-studio";

type Bilingual = { bn: string; en: string };

export type AssetState = {
  content: AssetContent;
  status: "draft" | "published";
};

export type PlaybookEntry = {
  id: PlatformId;
  name: string;
  url: string;
  category: PlatformCategory;
  tips: { kind: "rule" | "heuristic"; text: Bilingual }[];
  tools: {
    id: string;
    name: string;
    url: string;
    pricing: "free" | "freemium" | "paid";
    whatFor: Bilingual;
  }[];
};

const API = "/api/launch-studio";

async function post(body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export function LaunchStudio({
  hasProfile,
  assets,
  playbook,
}: {
  hasProfile: boolean;
  assets: Record<AssetKind, AssetState | null>;
  playbook: PlaybookEntry[];
}) {
  const t = useTranslations("studio");
  const [tab, setTab] = useState<"assets" | "playbook">("assets");

  const tabBtn = (id: "assets" | "playbook", label: string) => (
    <button
      type="button"
      data-testid={`studio-tab-${id}`}
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        tab === id
          ? "bg-[#F5A524] text-stone-900"
          : "border border-white/15 text-stone-300 hover:border-[#F5A524]/60"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {tabBtn("assets", t("tabs.assets"))}
        {tabBtn("playbook", t("tabs.playbook"))}
      </div>

      {tab === "assets" &&
        (hasProfile ? (
          <div className="flex flex-col gap-6">
            {ASSET_KINDS.map((kind) => (
              <AssetCard key={kind} kind={kind} initial={assets[kind]} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-stone-300">
            {t("noProfile")}
          </p>
        ))}

      {tab === "playbook" && <Playbook entries={playbook} />}
    </div>
  );
}

/* ── Assets ─────────────────────────────────────────────────────────────── */

function AssetCard({
  kind,
  initial,
}: {
  kind: AssetKind;
  initial: AssetState | null;
}) {
  const t = useTranslations("studio");
  const [content, setContent] = useState<AssetContent | null>(
    initial?.content ?? null,
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status ?? "draft",
  );
  const [busy, setBusy] = useState<null | "generate" | "save" | "review">(null);
  const [findings, setFindings] = useState<ReviewFinding[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  async function generate() {
    setBusy("generate");
    setNotice(null);
    const r = await post({ action: "generate", kind });
    setBusy(null);
    if (r.degraded) return setNotice(t("degraded"));
    if (!r.ok) return setNotice(t("error"));
    setContent(r.content as AssetContent);
    setStatus("draft");
    setFindings(null);
  }

  async function save() {
    if (!content) return;
    setBusy("save");
    const r = await post({ action: "save", kind, content });
    setBusy(null);
    setNotice(r.ok ? t("saved") : t("error"));
  }

  async function review() {
    if (!content) return;
    setBusy("review");
    setNotice(null);
    const r = await post({ action: "review", kind, content });
    setBusy(null);
    if (r.degraded) return setNotice(t("degraded"));
    if (!r.ok) return setNotice(t("error"));
    setFindings(r.findings as ReviewFinding[]);
  }

  async function publish() {
    const r = await post({ action: "publish", kind });
    if (r.ok) {
      setStatus("published");
      setShowPublish(false);
      setNotice(t("publish.publishedToast"));
    } else {
      setNotice(t("error"));
    }
  }

  return (
    <section
      data-testid={`asset-${kind}`}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-50">
          {t(`kind.${kind}`)}
        </h2>
        {status === "published" && (
          <span
            data-testid={`asset-${kind}-published`}
            className="rounded-full border border-[#F5A524]/40 bg-[#F5A524]/10 px-3 py-1 text-xs text-[#F5A524]"
          >
            {t("published")}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-stone-500">{t("englishNote")}</p>

      {!content ? (
        <div className="mt-4">
          <p className="text-sm text-stone-400">{t("generateHint")}</p>
          <button
            type="button"
            data-testid={`generate-${kind}`}
            onClick={generate}
            disabled={busy === "generate"}
            className="mt-3 rounded-lg bg-[#F5A524] px-5 py-2.5 font-medium text-stone-900 disabled:opacity-50"
          >
            {busy === "generate" ? t("generating") : t("generate")}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          {kind === "fiverr_gig" ? (
            <GigEditor value={content as FiverrGig} onChange={setContent} />
          ) : (
            <ProfileEditor value={content as UpworkProfile} onChange={setContent} />
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid={`save-${kind}`}
              onClick={save}
              disabled={busy !== null}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-100 disabled:opacity-50 hover:border-[#F5A524]/60"
            >
              {busy === "save" ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              data-testid={`review-${kind}`}
              onClick={review}
              disabled={busy !== null}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-100 disabled:opacity-50 hover:border-[#F5A524]/60"
            >
              {busy === "review" ? t("reviewing") : t("review")}
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={busy !== null}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-400 disabled:opacity-50 hover:border-white/40"
            >
              {t("regenerate")}
            </button>
            <button
              type="button"
              data-testid={`publish-${kind}`}
              onClick={() => setShowPublish((v) => !v)}
              className="rounded-lg bg-[#F5A524] px-4 py-2 text-sm font-semibold text-stone-900"
            >
              {t("publish.open")}
            </button>
          </div>

          {findings && <ReviewPanel findings={findings} />}
          {showPublish && (
            <PublishWalkthrough kind={kind} content={content} onPublished={publish} />
          )}
        </div>
      )}

      {notice && (
        <p aria-live="polite" className="mt-3 text-sm text-[#F5A524]">
          {notice}
        </p>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-stone-400">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-stone-100 outline-none focus:border-[#F5A524]"
      />
    </label>
  );
}

function GigEditor({
  value,
  onChange,
}: {
  value: FiverrGig;
  onChange: (c: FiverrGig) => void;
}) {
  const t = useTranslations("studio.fields");
  const set = (patch: Partial<FiverrGig>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-4">
      <Field label={t("title")} value={value.title} onChange={(v) => set({ title: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        {value.packages.map((p, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
            <Field label={t("name")} value={p.name} rows={1} onChange={(v) => {
              const packages = [...value.packages] as FiverrGig["packages"];
              packages[i] = { ...p, name: v };
              set({ packages });
            }} />
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-stone-400">{t("price")}</span>
              <input
                type="number"
                value={p.priceUsd}
                min={5}
                onChange={(e) => {
                  const packages = [...value.packages] as FiverrGig["packages"];
                  packages[i] = { ...p, priceUsd: Number(e.target.value) };
                  set({ packages });
                }}
                className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-stone-100 outline-none focus:border-[#F5A524]"
              />
            </label>
            <Field label={t("packageDesc")} value={p.description} onChange={(v) => {
              const packages = [...value.packages] as FiverrGig["packages"];
              packages[i] = { ...p, description: v };
              set({ packages });
            }} />
          </div>
        ))}
      </div>
      <Field label={t("description")} rows={4} value={value.description} onChange={(v) => set({ description: v })} />
      <div className="flex flex-col gap-2">
        <span className="text-sm text-stone-400">{t("faq")}</span>
        {value.faq.map((f, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2">
            <Field label={t("question")} value={f.q} rows={1} onChange={(v) => {
              const faq = [...value.faq];
              faq[i] = { ...f, q: v };
              set({ faq });
            }} />
            <Field label={t("answer")} value={f.a} rows={1} onChange={(v) => {
              const faq = [...value.faq];
              faq[i] = { ...f, a: v };
              set({ faq });
            }} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm text-stone-400">{t("gallery")}</span>
        {value.galleryShotList.map((s, i) => (
          <Field key={i} label={`#${i + 1}`} value={s} rows={1} onChange={(v) => {
            const galleryShotList = [...value.galleryShotList];
            galleryShotList[i] = v;
            set({ galleryShotList });
          }} />
        ))}
      </div>
    </div>
  );
}

function ProfileEditor({
  value,
  onChange,
}: {
  value: UpworkProfile;
  onChange: (c: UpworkProfile) => void;
}) {
  const t = useTranslations("studio.fields");
  const set = (patch: Partial<UpworkProfile>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-4">
      <Field label={t("headline")} value={value.headline} onChange={(v) => set({ headline: v })} />
      <Field label={t("overview")} rows={5} value={value.overview} onChange={(v) => set({ overview: v })} />
      <div className="flex flex-col gap-2">
        <span className="text-sm text-stone-400">{t("briefs")}</span>
        {value.portfolioBriefs.map((b, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2">
            <Field label={t("briefTitle")} value={b.title} rows={1} onChange={(v) => {
              const portfolioBriefs = [...value.portfolioBriefs];
              portfolioBriefs[i] = { ...b, title: v };
              set({ portfolioBriefs });
            }} />
            <Field label={t("brief")} value={b.brief} rows={1} onChange={(v) => {
              const portfolioBriefs = [...value.portfolioBriefs];
              portfolioBriefs[i] = { ...b, brief: v };
              set({ portfolioBriefs });
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewPanel({ findings }: { findings: ReviewFinding[] }) {
  const t = useTranslations("studio.review");
  const dot: Record<ReviewFinding["status"], string> = {
    pass: "bg-emerald-400",
    warn: "bg-[#F5A524]",
    cant_verify: "bg-stone-400",
  };
  return (
    <div data-testid="review-panel" className="rounded-xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-semibold text-stone-200">{t("title")}</h3>
      <ul className="mt-2 flex flex-col gap-2.5">
        {findings.map((f, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[f.status]}`} />
            <span className="text-stone-300">
              <span className="font-medium text-stone-100">{f.label}: </span>
              {f.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Flatten a draft into labeled, copy-ready blocks for the publish walkthrough. */
function copyBlocks(kind: AssetKind, content: AssetContent): { label: string; text: string }[] {
  if (kind === "fiverr_gig") {
    const g = content as FiverrGig;
    return [
      { label: "Title", text: g.title },
      ...g.packages.map((p) => ({
        label: `${p.name} — $${p.priceUsd}, ${p.deliveryDays}d`,
        text: p.description,
      })),
      { label: "Description", text: g.description },
      { label: "FAQ", text: g.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n") },
      { label: "Gallery shot list", text: g.galleryShotList.map((s, i) => `${i + 1}. ${s}`).join("\n") },
    ];
  }
  const p = content as UpworkProfile;
  return [
    { label: "Headline", text: p.headline },
    { label: "Overview", text: p.overview },
    { label: "Portfolio briefs", text: p.portfolioBriefs.map((b) => `• ${b.title}: ${b.brief}`).join("\n") },
  ];
}

function PublishWalkthrough({
  kind,
  content,
  onPublished,
}: {
  kind: AssetKind;
  content: AssetContent;
  onPublished: () => void;
}) {
  const t = useTranslations("studio.publish");
  const [copied, setCopied] = useState<number | null>(null);
  const blocks = copyBlocks(kind, content);

  async function copy(i: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div data-testid={`publish-steps-${kind}`} className="rounded-xl border border-[#F5A524]/25 bg-[#F5A524]/[0.05] p-4">
      <h3 className="text-sm font-semibold text-[#F5A524]">{t("title")}</h3>
      <p className="mt-1 text-sm leading-6 text-stone-300">{t("intro")}</p>
      <ol className="mt-3 flex flex-col gap-2">
        {blocks.map((b, i) => (
          <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <span className="min-w-0 truncate text-sm text-stone-200">{b.label}</span>
            <button
              type="button"
              onClick={() => copy(i, b.text)}
              className="shrink-0 rounded-md border border-white/15 px-3 py-1 text-xs text-stone-200 hover:border-[#F5A524]/60"
            >
              {copied === i ? t("copied") : t("copy")}
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        data-testid={`mark-published-${kind}`}
        onClick={onPublished}
        className="mt-4 rounded-lg bg-[#F5A524] px-5 py-2.5 text-sm font-semibold text-stone-900"
      >
        {t("markPublished")}
      </button>
    </div>
  );
}

/* ── Playbook ───────────────────────────────────────────────────────────── */

function Playbook({ entries }: { entries: PlaybookEntry[] }) {
  const t = useTranslations("studio.playbook");
  const [selected, setSelected] = useState<PlatformId>("fiverr");
  const entry = entries.find((e) => e.id === selected) ?? entries[0];

  const groups: { label: string; ids: readonly PlatformId[] }[] = [
    { label: t("marketplaces"), ids: MARKETPLACE_PLATFORMS },
    { label: t("jobBoards"), ids: JOB_BOARD_PLATFORMS },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="text-sm font-semibold text-stone-300">{g.label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {g.ids.map((id) => {
                const e = entries.find((x) => x.id === id);
                if (!e) return null;
                const active = id === selected;
                return (
                  <button
                    key={id}
                    type="button"
                    data-testid={`playbook-${id}`}
                    aria-pressed={active}
                    onClick={() => setSelected(id)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-[#F5A524] bg-[#F5A524]/15 text-[#F5A524]"
                        : "border-white/15 text-stone-300 hover:border-[#F5A524]/60"
                    }`}
                  >
                    {e.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div data-testid="playbook-detail" className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-stone-50">{entry.name}</h2>
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone-400 hover:text-[#F5A524]"
          >
            {t("visit")} ↗
          </a>
        </div>

        {entry.category === "job_board" && (
          <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-stone-300">
            {t("jobBoardNote")}
          </p>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {t("tips")}
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {entry.tips.map((tip, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="mt-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-stone-400">
                  {t(tip.kind)}
                </span>
                <span className="text-stone-300">{tip.text.en}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {t("tools")}
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {entry.tools.map((tool) => (
              <li key={tool.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-stone-300">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-stone-100 hover:text-[#F5A524]"
                  >
                    {tool.name}
                  </a>{" "}
                  — {tool.whatFor.en}
                </span>
                <span className="shrink-0 text-xs text-stone-500">{t(tool.pricing)}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/coach"
          data-testid="playbook-ask-atlas"
          className="w-fit rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-100 hover:border-[#F5A524]/60"
        >
          {t("askAtlas")}
        </Link>
      </div>
    </div>
  );
}
