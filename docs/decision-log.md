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

---

### Template for new ADRs
```
## ADR-000N — <title>
**Date:** YYYY-MM-DD · **Status:** proposed | accepted | superseded by ADR-M
**Context:** <forces at play>
**Decision:** <what we chose>
**Consequences:** + <gains>  − <costs/risks>
```
