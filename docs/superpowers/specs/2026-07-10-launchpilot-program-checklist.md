# LaunchPilot — Program Checklist (2026-07-10)

Owner-approved build program. Full rationale lives in `discovery.md`, `docs/architecture.md`,
`docs/roadmap.md`. Decisions made today (owner, 2026-07-10):

- **Boundary:** profile help = AI-drafted assets + guided self-publish walkthrough. Never
  automation. (Reaffirms ADR-0001.)
- **Scope:** all slices M0→M10, sequential roadmap order, TDD, flags. The post-M3 metric
  gate becomes a **non-blocking checkpoint** (cohort ships, build continues) → ADR-0009 (to write).
- **New slice M3.5 — Profile & Gig Launch Studio** → ADR-0010 (to write): asset generator
  (Sonnet, structured, Zod) → guided publish walkthrough (redrawn illustrations, copy-to-
  clipboard, maps to boss missions) → readiness review (critique vs platform track rules).
  New table: `launch_assets(user_id, platform, asset_kind, content jsonb, track_version,
  generated_by, status)`.
- **Process:** Claude develops; owner commits/pushes manually — Claude supplies staged-file
  list + commit message after each feature. Docs get checklists now, prose later.
- **Secrets:** owner can provide Anthropic, Google (TTS+OAuth), Vercel, BD merchant.

## Research anchors (for Platform Tracks v0, curate with citations in M2)
- Fiverr: gig = Overview/Pricing/Description+FAQ/Requirements/Gallery; "I will…" titles;
  ≤75s video; 3 packages; 20% flat commission; desktop-only gig editing.
- Upwork: stricter approvals; specialization + specific headline; 6–12 portfolio samples
  (spec projects OK); ID verification; first-client-in-30-days survival threshold; target
  newer clients, $50–500 jobs, <10 proposals.
- BD payouts: Payoneer default (~2% to bank; direct Payoneer→bKash, min ৳1,000); Upwork
  direct-to-bank $0.99 + compliance delays; Fiverr-via-Payoneer excluded from 2.5% govt
  remittance incentive.

## M0 — finish walking skeleton
- [ ] next-intl: `/bn` `/en` routing, `messages/{bn,en}.json`, locale switcher, all M0 strings keyed
- [ ] better-auth: email magic-link + Google OAuth, sessions in Postgres, one protected page
- [ ] AI proof: route handler streams one Sonnet reply via AI SDK; token usage logged
- [ ] TTS proof: `/api/tts` text+locale → Google TTS → hash-cache → tap-to-listen button
- [ ] Playwright: sign-in → DB row → streamed AI line → audio plays
- [ ] GitHub Actions CI: lint + typecheck + Vitest + Playwright on push
- [ ] Vercel production deploy; live URL
- [ ] `pnpm setup` < 10 min local bootstrap
- [ ] Write ADR-0009 + ADR-0010

## M1 — bilingual onboarding & skill assessment
- [ ] Conversational onboarding UI (text + icons + tap-to-listen), adaptive depth, flag `m1_onboarding`
- [ ] Haiku skill normalization (structured output, Zod)
- [ ] `freelancer_profiles` write (Zod-validated server action) + `onboarding_completed` event
- [ ] E2E onboard→profile green; CWV budget on synthetic Android profile

## M2 — personalized 90-day roadmap
- [ ] Platform Tracks v0: Fiverr + Upwork + BD payout module (curated, versioned, cited, in-repo)
- [ ] Roadmap generator (structured output, grounded, version-pinned), `user_roadmaps`/`roadmap_missions`
- [ ] Journey-path UI, bilingual + audio; two different profiles ⇒ different roadmaps
- [ ] E2E profile→roadmap green; generation cost within budget

## M3 — conversational AI coach (Atlas)
- [ ] `/api/coach` streaming with context load + grounding + history
- [ ] Cost cap + graceful degrade; per-turn accounting (`coach_messages`, `ai_usage_daily`)
- [ ] Prompt files + versions; TOS-refusal; English-for-clients scaffolding
- [ ] `pnpm eval` harness in CI (refusal, no-hallucination, tone, bilingual)
- [ ] P95 first-token < 800ms; E2E coach green

## M3.5 — Profile & Gig Launch Studio (new)
- [ ] `launch_assets` schema + migration
- [ ] Asset generator: Fiverr (title/packages/description/FAQ/gallery shot-list) + Upwork
      (headline/overview/spec-portfolio briefs); editable; regeneration inside AI budget
- [ ] Guided publish walkthrough: step wizard, redrawn illustrations, copy-to-clipboard,
      steps mapped to boss missions ("profile live", "gig live")
- [ ] Readiness review: Atlas critique vs track rules; honest can't-verify notes
- [ ] Boundary tests: no marketplace HTTP anywhere; eval: refuses automation asks
- [ ] **Cohort checkpoint: ship M0–M3.5 behind flags to real users**

## M4 — gamification
- [ ] XP formula + level curve + tiers (pure functions, unit-tested first)
- [ ] Streaks + weekly freeze; achievements; Confidence Meter
- [ ] Anti-gaming: XP only on completions; ledger unique constraint; no XP for login/reading

## M5 — mission engine & platform depth
- [ ] All five mission-type behaviors per spec
- [ ] Deeper Fiverr/Upwork modules as versioned track updates; live roadmaps unaffected

## M6 — evidence & verification
- [ ] Metadata-first uploads (R2/UploadThing); AI plausibility = soft signal only
- [ ] Ephemeral retention + disclosure + one-click delete

## M7 — streaks, notifications, re-engagement
- [ ] Daily mission surface; purposeful nudges; A/B via PostHog flags; opt-out works

## M8 — settings, export, deletion, contribution
- [ ] Data export + hard-delete (verified)
- [ ] Pay-what-you-want on first earning via bKash/Nagad/SSLCommerz (sandbox → prod), idempotent

## M9 — admin & content authoring
- [ ] Internal CMS for missions/quests/tracks; versioned; preview; rollback

## M10 — observability dashboards
- [ ] "System breathing" page reading events emitted since M0
