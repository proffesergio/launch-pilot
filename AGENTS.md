<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LaunchPilot — working agreement (the rails)

Read this every session. `discovery.md` and `/docs` are the source of truth; this is the
short version. `CLAUDE.md` imports this file.

## What we're building
**LaunchPilot** — a gamified AI freelance career coach for **literate beginners in
Bangladesh**. It is **a coach, not a course**, and **advisory only** (never touches the
user's freelance-marketplace accounts). Coach persona name: **Atlas**.

## Locked decisions (don't relitigate without a superseding ADR)
- **Advisory only.** No marketplace APIs, scraping, or automation. Platform knowledge is
  curated, versioned, in-repo (`content/platform-tracks/`), grounded, heuristics labeled.
- **Free, success-based.** No paywall. Pay-what-you-want *after* first real earning.
  Billing deferred; BD rails (bKash/Nagad/SSLCommerz), never Stripe.
- **Bilingual Bangla + English** from day one (next-intl `/bn` `/en`) + tap-to-listen TTS.
- **Literate beginners first**; lower-literacy/rural + Bangla voice input = phase 2.
- **MVP = onboarding → personalized roadmap → AI coach** (M0–M3). Rest is metric-gated
  (`docs/roadmap.md`).
- Stack: Next.js 16 (App Router) · TS strict · Tailwind+shadcn · Drizzle/Postgres ·
  better-auth · Claude (Sonnet craft / Haiku fast) via Vercel AI SDK · Google TTS ·
  PostHog · Sentry · Pino. Rationale in `docs/tech-stack.md` + ADRs.

## How we work (process)
1. **Phases, not vibes.** discovery → architecture → walking skeleton → vertical slices.
   No feature code until its design is signed off. Pause at each slice boundary; explain
   what changed, what's instrumented, what to test by hand.
2. **TDD is rigid.** Failing test first (pure logic: XP, unlock rules, state machine;
   route integration; the three E2E paths), then implement.
3. **One slice at a time, behind a feature flag.** No half-built features in `main`.
4. **Push back** on off-strategy/risky asks (TOS, outcome guarantees, scope creep) and say
   why. "I don't know" is a complete sentence.
5. **Commit often**, messages explain *why*. Migrations are forward-only.
6. **Update the docs** with every meaningful change; significant choice = new dated ADR.

## Engineering principles (non-negotiable)
- System explains itself: structured Pino logs + correlation id, traceable end-to-end.
- No magic: clever code gets a what/why comment.
- Types are documentation: **TS strict, no `any`, no unjustified `as`.** Zod at every
  runtime boundary (API, AI output, env, forms).
- Errors first-class: stable code + user message + log + metric. No swallowed catches.
- Tests for confidence, not coverage. Fix a flaky test the day it flakes.
- Secrets are secrets: none in the repo; every var in `.env.example` + validated in
  `lib/env.ts` at boot.
- Cost is a feature: Haiku to classify, Sonnet to craft; per-user daily AI cap; TTS
  hash-cache; graceful degrade over the cap, never an error.
- Perf budget (mid Android/4G): LCP < 2.0s, INP < 200ms, CLS < 0.1; AI first token < 800ms.

## Brand / voice
Warm, honest, never condescending, dry humor, sentence case, no fake-enthusiasm exclamation
marks. Accent **Marigold `#F5A524`**, generous whitespace, purposeful motion. No stock
photos, no cartoon high-fives, no 2019 startup-landing-page energy. Atlas tells the truth
about realistic timelines and never promises a guaranteed outcome.

## Commands
`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm test` (Vitest, M0) · `pnpm e2e` (Playwright,
M0) · `pnpm eval` (coach prompt evals, M3).

## Status
**M0 — Walking Skeleton, in progress.** Scaffold + toolchain green (Next 16, build passes).
Wiring layers next; several need owner-provided secrets (see README / session checklist).
