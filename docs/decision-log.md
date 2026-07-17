# LaunchPilot — Decision Log (ADRs)

Architecture Decision Records. Every significant choice is a numbered, dated ADR with
**Context · Decision · Consequences.** Never delete an ADR — supersede it with a new one and
link both ways. Status: `accepted` · `superseded by ADR-N` · `proposed`.

---

## ADR-0001 — Advisory-only platform boundary
**Date:** 2026-06-09 · **Status:** accepted
**Context:** Freelance marketplaces' terms restrict third-party automation; their UIs are
IP; and bad "algorithm" advice can get a *user* banned. Touching them programmatically is the
project's existential risk (R1).
**Decision:** LaunchPilot never calls marketplace APIs, scrapes, or automates user accounts.
It coaches only. Platform knowledge is a curated, **versioned** in-repo knowledge base built
from each platform's public docs, with heuristics explicitly labeled as heuristics. We use
original redrawn diagrams, never real platform screenshots.
**Consequences:** + Lowest legal/TOS exposure; no integration/anti-abuse layer to build.
− Content must be manually maintained as platforms change (mitigated by versioned tracks +
admin authoring in M9). − We can't auto-verify on-platform actions; verification stays
user-driven.

## ADR-0002 — Free, success-based monetization (no paywall)
**Date:** 2026-06-09 · **Status:** accepted
**Context:** Target users are price-sensitive Bangladeshi beginners. The owner wants payment
only *after* the product demonstrably works for the user. Stripe does not pay out to
Bangladesh.
**Decision:** Free forever to use. After a user's **first real earning** via our guidance,
prompt a **pay-what-you-want** contribution. Billing is deferred past MVP and will use BD
rails (bKash/Nagad/SSLCommerz/aamarPay). The `earnings` table + contribution fields exist
from MVP so the flow drops in without a migration.
**Consequences:** + Aligns incentives with user success; removes the biggest activation
barrier. − Revenue is uncertain and lagging; no MVP cash. − Requires accurate first-earning
detection (a magic-moment metric we must instrument well).

## ADR-0003 — Drizzle ORM over Prisma
**Date:** 2026-06-09 · **Status:** accepted
**Context:** Serverless Postgres on metered infra; a SQL-literate, transaction-heavy data
model (XP ledger integrity).
**Decision:** Use Drizzle. SQL-shaped, no engine binary or generate step, fast cold starts,
readable plain-SQL migrations.
**Consequences:** + Control + cold-start performance + auditable migrations. − Less tooling
polish than Prisma (no Studio); smaller ecosystem. Revisit if DX cost grows.

## ADR-0004 — better-auth over Clerk
**Date:** 2026-06-09 · **Status:** accepted
**Context:** A free product for price-sensitive users; per-MAU auth pricing scales the wrong
way; we want data residency in our own Postgres and full control of a bilingual flow.
**Decision:** Use better-auth (email + magic link + Google), self-hosted in our Postgres.
**Consequences:** + No per-user auth cost; full UI/flow control; PII stays with us. − We own
more security-sensitive surface and ops than a hosted provider. Revisit if maintenance
outweighs savings.

## ADR-0005 — Google Cloud TTS, with hash-cached audio
**Date:** 2026-06-09 · **Status:** accepted
**Context:** Tap-to-listen is core to including lower-literacy users; Bangla voice quality and
cost both matter; the same text is heard by many users.
**Decision:** Use Google Cloud TTS (bn-IN + en). Cache synthesized audio by content hash so
each string is synthesized once and served forever; editing text invalidates naturally.
**Consequences:** + Inclusion at near-zero marginal cost. − English prosody is less natural
than premium vendors; a storage/caching layer to maintain.

## ADR-0006 — Bilingual (Bangla + English) UI from day one
**Date:** 2026-06-09 · **Status:** accepted
**Context:** Audience spans Bangla-first and English-comfortable users; i18n is very hard to
retrofit. Owner chose full bilingual UI at launch.
**Decision:** next-intl locale routing (`/bn`, `/en`) from M0. UI chrome in
`messages/{bn,en}.json`; domain content keyed by `(i18n_key, locale)`; coach output generated
natively per locale (not machine-translated). Coach additionally scaffolds English for client
communication.
**Consequences:** + Serves the whole audience; no painful retrofit; adding a 3rd locale later
is data, not migration. − Doubles content/translation effort now; every chrome string must be
keyed (enforced in review).

## ADR-0007 — Stack remains Node/TypeScript (stray Python venv was a mistake)
**Date:** 2026-06-09 · **Status:** accepted
**Context:** A `pyenv/` virtual environment appeared in the repo root. The approved stack is
Next.js/TypeScript with no Python component. Owner confirmed it was unintentional.
**Decision:** Keep the Node/TS stack unchanged. `pyenv/` (and common venv dirs) are gitignored
so a venv can never be committed; the directory may be deleted at will.
**Consequences:** + No stack drift; one language across the codebase. − None. If a genuine
Python need arises later (e.g. an ML/eval sidecar), it gets its own superseding ADR.

## ADR-0008 — Next.js 16 (not 15)
**Date:** 2026-06-09 · **Status:** accepted
**Context:** The plan defaulted to "Next.js 15". `create-next-app@latest` scaffolded
**16.2.7**, the current stable, using the App Router + Turbopack. Downgrading to 15 would
mean fighting the default and missing current fixes.
**Decision:** Stay on Next.js 16.x. Production build + strict TypeScript verified green at
scaffold time.
**Consequences:** + Current stable, App-Router/RSC model unchanged from the plan, less drift
from upstream. − Slightly newer surface; we watch for 16.x breaking changes and pin the
minor in `package.json`.

## ADR-0009 — Post-M3 metric gate becomes a non-blocking checkpoint
**Date:** 2026-07-10 · **Status:** accepted
**Context:** The roadmap gated all M4+ work on activation/first-earning metrics from a real
cohort (mitigating R2). The owner decided to build all slices M0→M10 in this push, accepting
the R2 exposure after explicit pushback.
**Decision:** Build proceeds sequentially through M0→M10 (one TDD'd, feature-flagged slice at
a time; `main` always deployable). After M3.5, the app ships to a real Bangladeshi cohort
behind flags **while build continues** — the gate becomes a checkpoint that informs, not
blocks. Metrics may still reorder or cut later milestones.
**Consequences:** + Full product surface sooner; sequential order still yields a launchable
MVP early. − Real R2 risk: M4–M10 effort is committed before user signal; owner owns this
trade-off explicitly.

## ADR-0010 — New slice M3.5: Profile & Gig Launch Studio (advisory-only, reaffirmed)
**Date:** 2026-07-10 · **Status:** accepted
**Context:** The owner's headline ask: AI help "creating profiles" on Fiverr/Upwork.
Automating marketplace accounts violates ADR-0001 and risks user bans (R1). The compliant
form — AI-drafted assets + a guided self-publish walkthrough — was chosen.
**Decision:** Add slice M3.5 after M3 (deps: M2 platform tracks, M3 coach): (1) asset
generator — Sonnet structured output, Zod-validated, per-platform drafts (Fiverr gig
title/packages/description/FAQ/gallery shot-list; Upwork headline/overview/spec-portfolio
briefs) persisted in a new `launch_assets` table; (2) guided publish walkthrough — stepwise
checklist with our own redrawn illustrations and copy-to-clipboard, steps mapped to the
"profile live"/"gig live" boss missions; (3) readiness review — Atlas critiques the final
draft against pinned platform-track rules. No marketplace HTTP calls anywhere; evals assert
the coach refuses automation asks.
**Consequences:** + Delivers the owner's intent with zero TOS exposure; reuses grounding +
mission systems. − One more pre-checkpoint slice; curated track content must be kept current.

## ADR-0011 — Mission templates in-repo; deterministic roadmap generation
**Date:** 2026-07-11 · **Status:** accepted
**Context:** Architecture §4 sketched a `missions` DB table. M2 needs a mission catalog and
a generator, but DB-authored content without an authoring UI (M9) means hand-edited rows and
unreviewable content changes. Separately, AI-generated roadmaps would make the M2 exit
criterion ("two profiles yield demonstrably different roadmaps") non-deterministic and add
cost to every onboarding.
**Decision:** Mission templates and platform tracks are versioned TypeScript data in
`content/` (Zod-validated in tests; bilingual inline; rules cited, heuristics labeled).
`roadmap_missions` references templates by key + pinned catalog version instead of FK. The
generator is a pure function of (profile, content) — filterable by platform, English
confidence, and experience — with XP computed from the §7 formula. Sonnet enrichment can
layer on later without changing the contract. The `missions` DB table arrives with M9 admin
authoring, migrating this catalog.
**Consequences:** + Reviewable content diffs, deterministic + free generation, exit criterion
is a unit test. − Content edits need a deploy until M9; template renames need key-migration
care once users hold live roadmaps.

---

### Template for new ADRs
```
## ADR-000N — <title>
**Date:** YYYY-MM-DD · **Status:** proposed | accepted | superseded by ADR-M
**Context:** <forces at play>
**Decision:** <what we chose>
**Consequences:** + <gains>  − <costs/risks>
```

## ADR-0012 — 17-platform expansion with marketplace/job-board categories
**Date:** 2026-07-12 · **Status:** accepted
**Context:** The owner wants the landing page to show that LaunchPilot coaches for many
remote-work sites, not just Fiverr/Upwork, and wants users to pick a starting site and get
guidance specific to it. Fifteen well-known remote job boards (Wellfound, RemoteOK, We Work
Remotely, FlexJobs, Remotive, …) differ fundamentally from gig marketplaces: you apply to
posted roles with a CV instead of publishing a service, many roles are region-locked, and
the first-earning timeline is slower.
**Decision:** A single platform registry (`src/lib/platforms.ts`) becomes the source of
truth for 17 platforms, each with a `category` — `marketplace` or `job_board`. Every
platform gets a curated, versioned, bilingual track in `content/platform-tracks/` (ADR-0011
rules: sources cited, heuristics labeled; job-board tracks lean heuristic and stress
worldwide-eligibility and scam guards). Mission templates may now scope to a whole category;
job-board profiles get a CV/alerts/applications/interview path with their own phase-2 boss,
while gig-shaped missions (gig draft, delivery dry run, review ask) are marketplace-scoped.
The landing page gains a flag-gated (`m5_platforms`) explorer where a visitor picks a site;
the pick survives sign-in via localStorage and pre-fills onboarding, which now offers all 17
grouped by category. Advisory-only stands: links out, never integration.
**Consequences:** + One registry drives landing, onboarding, roadmap, and coach grounding;
honest per-site expectations are content, not marketing. − 15 new tracks to keep current
(quarterly review needed); job-board copy is thinner than Fiverr/Upwork until real user
questions harden it; onboarding platform step is longer (mitigated by grouping + flag).

## ADR-0013 — Global-first repositioning (English default, worldwide scope, BD as flagship)
**Date:** 2026-07-17 · **Status:** accepted · **Amends** the "literate beginners in
Bangladesh / Bangla-first" framing in earlier docs and ADR-0006 (locale ordering).
**Context:** The owner is open-sourcing LaunchPilot and wants it to serve a beginner
*anywhere* in the world, read English-first, and attract contributors/stars — not present as
a Bangladesh-only tool. The prior BD-first framing was deliberate (an underserved market with
specific payout rails), and that work is real differentiation we don't want to throw away.
**Decision:** Reposition to **global-first, English-first, with Bangladesh as the flagship
supported region** (not removed). Concretely: (1) `defaultLocale` and the new-user stored
locale become `en`; the locale switcher is a single toggle to the other language instead of a
side-by-side pair; browser-language negotiation still auto-lands e.g. a Bangla browser on
`/bn`. (2) The BD-specific payout module generalizes into a **community-maintained global
pricing & payout registry** (per-country rails, fees, PPP-aware rate guidance); the existing
BD content becomes its reference entry. (3) Copy that hard-codes "Bangladesh" generalizes to
"wherever you are," with region examples kept as examples. (4) Advisory-only (ADR-0001),
grounded content, and the versioned-tracks model are unchanged — they scale to more regions,
not fewer. Bangla, TTS, and the low-literacy phase-2 segment remain first-class.
**Consequences:** + Larger addressable audience and an obvious open-source contribution
surface ("add your country/platform"); English-first lowers the barrier for global
contributors and users. + Keeps the BD differentiation as a concrete, deep example rather
than the whole thesis. − A copy-localization sweep (messages, landing) is now owed; "global"
risks genericness if we don't keep shipping the deep, region-specific content that made the
BD version credible (mitigated by the community registry + flagship-region discipline).
