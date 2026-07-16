# LaunchPilot

A gamified, AI-powered freelance career coach. It takes a literate beginner in
Bangladesh — any skill, zero portfolio — and walks them step by step to their first
paid freelance order, then to a sustainable freelance income.

LaunchPilot is **a coach, not a course**. It is advisory only: it never touches your
freelance-marketplace accounts. It guides; you do the work.

> Status: **v1 ready to ship (M0–M3.5).** Onboarding → roadmap → coach → Launch Studio are
> built behind feature flags; lint/typecheck/unit/build are green. Deploying to Vercel is
> owner-gated ops (account, prod Postgres, secrets) — see [`docs/DEPLOY.md`](./docs/DEPLOY.md).

## What's here now

| File | Purpose |
|------|---------|
| [`discovery.md`](./discovery.md) | Phase 0 — clarifying questions (answered), risks, scope boundary, success criteria, glossary |
| [`docs/architecture.md`](./docs/architecture.md) | System design: diagrams, data model, state machine, AI, gamification, observability, security |
| [`docs/tech-stack.md`](./docs/tech-stack.md) | Every technology choice, justified |
| [`docs/roadmap.md`](./docs/roadmap.md) | Milestones from today to v1.0 |
| [`docs/decision-log.md`](./docs/decision-log.md) | Architecture Decision Records (ADRs) |

## Locked product decisions (summary)

- **Advisory only** — curated, versioned per-platform knowledge base; no automation.
- **Free, success-based** — pay-what-you-want *after* your first real earning.
- **Bilingual Bangla + English** UI from day one, with tap-to-listen audio (TTS).
- **Literate beginners first**; lower-literacy / rural users are a phase-2 segment.
- **MVP = onboarding → personalized roadmap → AI coach.**

## Getting started

Not yet — there is no app to run. Once the walking skeleton lands (Phase 2), this section
becomes a one-command setup: `pnpm setup` → working local dev with seeded data in < 10 min.

