# M3.5 — Profile & Gig Launch Studio (design)

**Date:** 2026-07-12 · **Anchor:** ADR-0010 · **Flag:** `m35_launch_studio`
**Scope decision (owner, 2026-07-12):**
- Asset generator drafts **both marketplaces** — Fiverr gig *and* Upwork profile — for every
  user (not just their onboarding target).
- Generated gig/profile copy is **English only, always** — marketplaces reject non-English
  listings. This is a hard rule, not a default.
- **New sub-feature: Platform Playbook** — the user can pick *any* of the 17 platforms "to
  try", and the assistant surfaces tips (from that platform's curated track) plus recommended
  **tools** (a new curated catalog) specific to that platform.
- Job-board CV/cover-letter *asset generation* remains out of scope (possible fast-follow);
  but job boards ARE covered by the Playbook's tips + tools.

## Goal
Turn a user's Freelancer Profile into the actual, publishable marketplace assets and walk
them through publishing it themselves. This is the bridge from "here's your 90-day plan" to
"you have a live gig/profile" — the step that unblocks a first earning. **Advisory only:
zero marketplace HTTP calls, ever.** We draft; the user copies and publishes.

## The parts
1. **Asset generator** — Sonnet (`ANTHROPIC_MODEL_CRAFT`), structured output, Zod-fenced,
   grounded in the pinned platform track. Drafts **both** the Fiverr gig and the Upwork
   profile; each is independently editable, reviewable, and publishable.
2. **Guided publish walkthrough** — a stepwise, copy-to-clipboard checklist with our own
   illustrations; the final "I published it" step self-attests the matching boss mission.
3. **Readiness review** — Atlas critiques a draft against the track's rules and returns
   honest pass/warn/can't-verify findings before the user publishes.
4. **Platform Playbook** (new) — the user picks any of the 17 platforms; we show that
   platform's curated **tips** (its track's rules + heuristics, no AI cost) and curated
   **tools** (new catalog, filtered to the platform and ranked by the user's skill). Atlas is
   one tap away for grounded follow-up. Job boards get a "no gig to draft here — apply with
   your CV" note instead of the asset generator.

## Decisions (flag any that are wrong)
- **Generated copy is English, always** (marketplaces reject other languages). UI chrome,
  guidance, review findings, tips, and tool descriptions are **bilingual** with tap-to-listen.
- **Both marketplace bundles are generated** for every user. Cost stays bounded: generation
  is on-demand per platform (the user triggers each), and both go through the daily cap.
- **Tools are curated in-repo, not AI-invented** — same grounding discipline as tracks
  (versioned, cited where a claim needs it). The assistant surfaces them; it never
  hallucinates a tool or URL. Tips come straight from the existing track items.
- **One row per (user, asset_kind)**. `asset_kind` = `fiverr_gig` | `upwork_profile`. The
  structured draft lives in `content` jsonb; regeneration upserts; `track_version` pins what
  it was grounded on.
- **Access:** Studio + Playbook always reachable once a profile exists; the dashboard/roadmap
  *surfaces* the Studio in the go-live phase. No hard journey gate.
- **Regeneration and review go through the daily AI cost cap** and degrade gracefully over
  it — never an error, matching the coach. The Playbook is free (curated retrieval, no AI).

## Data model
New table `launch_assets`:
| column | type | note |
|---|---|---|
| id | uuid pk | |
| user_id | text fk→user (cascade) | |
| platform | text | PlatformId (fiverr/upwork only for now) |
| asset_kind | text | `fiverr_gig` \| `upwork_profile` |
| content | jsonb | the Zod-validated structured draft |
| track_version | text | pinned track version it was grounded on |
| generated_by | text | e.g. `studio-gen@0.1.0` |
| status | text | `draft` \| `published` (self-attested) |
| created_at / updated_at | timestamptz | |

Unique index on `(user_id, asset_kind)` — one live draft per kind per user; regeneration
upserts.

### Content shapes (Zod, `src/lib/launch-assets.ts`)
- **fiverr_gig:** `{ title, packages: [basic, standard, premium]{name, price, deliveryDays,
  description}, description, faq: {q,a}[], galleryShotList: string[] }` — mirrors the five
  Fiverr gig sections and the 20%-commission / 3-package track rules.
- **upwork_profile:** `{ headline, overview, portfolioBriefs: {title, brief}[] (6–12) }` —
  mirrors the specialization + 6–12 samples track rules.
- All string fields are English (validated: reject if the copy is written in Bangla — a
  simple Bengali-codepoint guard on generated output before persist).

### Tools catalog (`content/tools/catalog.ts`, Zod in `src/lib/tools.ts`)
Curated, versioned. Each tool:
`{ id, name, url, whatFor: {bn,en}, pricing: "free"|"freemium"|"paid",
  skills: SkillId[] | "all", platforms: PlatformId[] | "all" }`.
`toolsForPlatform(platformId, skillId?)` filters to tools whose `platforms` include the id
(or "all"), ranked so skill-matched tools surface first. Examples: Canva/Figma (design),
Grammarly/QuillBot (writing + Upwork proposals), CapCut/DaVinci (video), a Payoneer/bKash
payout note (all), desktop-reminder for Fiverr gig editing.

## Components / files
- `src/db/schema.ts` — `launchAssets` table (+ migration via `pnpm db:generate`).
- `src/lib/launch-assets.ts` — Zod schemas, `AssetKind`, pure helpers (kind↔platform,
  empty-draft factory, English-only guard). Unit-tested first.
- `content/tools/catalog.ts` + `src/lib/tools.ts` — curated tools catalog, Zod schema,
  `toolsForPlatform(platformId, skillId?)`. Unit-tested first.
- `src/lib/launch-studio.ts` — `generateAsset(kind, profile, track)` (Sonnet, generateObject,
  grounded prompt) and `reviewAsset(asset, track)` (structured findings). Prompts are
  versioned files in `prompts/` (`studio-fiverr-gig.md`, `studio-upwork-profile.md`,
  `studio-review.md`).
- `src/app/api/launch-studio/route.ts` — POST actions: `generate` (per kind), `save`,
  `review`, `publish`. Auth + flag + cost-cap + correlation-id + structured logs, mirroring
  the coach route. `publish` self-attests the matching boss mission (reuse `completeMission`)
  → journey event (`gig_live` / `profile_built`, boss → `boss_gig_published` /
  `boss_profile_live`) + XP via existing `awardXp` (idempotent).
- `src/app/[locale]/launch-studio/` — page + client `studio.tsx` with two tabs:
  **Assets** (per-marketplace generate → edit → review → publish walkthrough) and
  **Playbook** (platform picker over all 17 → tips from track + tools from catalog, with an
  "ask Atlas" deep-link). Marigold dark-techy, `motion/react`, bilingual + tap-to-listen.
- Dashboard/roadmap: a "Launch Studio" entry surfaced in the go-live phase (stable testid
  `open-launch-studio`).
- `messages/{en,bn}.json` — all Studio + Playbook chrome, step copy, review labels, tool
  descriptions.

## Testing (TDD, rails)
- **Pure logic first:** `launch-assets.test.ts` — schema validation, platform→kind mapping,
  empty-draft factory, English-only guard, published-status transition.
- **Tools:** `tools.test.ts` — catalog validates; every tool has a real https url;
  `toolsForPlatform` returns platform-relevant tools, ranks skill matches first, and never
  returns tools scoped to other platforms.
- **Route integration:** generate persists a draft; save round-trips edits; publish is
  idempotent and completes exactly the right boss mission once; over-cap returns degraded not
  error; unauthenticated/flag-off → 401/404.
- **Boundary eval:** extend `pnpm eval` — Studio prompts refuse "just publish it for me" /
  automation asks; review never invents a rule that isn't in the grounded track.
- **E2E:** onboard → roadmap → open Studio → generate → edit → publish → boss mission shows
  done + XP awarded. New testid `open-launch-studio`.
- No test or code path issues any marketplace HTTP request (grep-asserted in a unit test).

## Out of scope (this slice)
Job-board CV/cover-letter *asset generation* (Playbook tips+tools DO cover job boards);
image generation for gallery (we emit a *shot list*, not images); marketplace automation of
any kind.

## Exit criteria
Both marketplace drafts generate grounded + version-pinned; generated copy is English (guard
enforced); edits persist; readiness review returns honest findings from track rules only;
publish self-attest completes the matching boss mission (E2E green); Playbook shows correct
tips + tools for a selected platform across all 17; generation+review within per-user AI
budget; automation-refusal eval green; both locales pass.
