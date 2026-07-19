# LaunchPilot — Roadmap

Milestones from today to v1.0. Each has: **goal · scope · exit criteria · effort
(S/M/L) · dependencies.** Effort is relative, not calendar. The roadmap is our weapon
against scope creep: anything new is measured as *"fits the current milestone, or becomes a
new one?"*

Legend: **MVP** = the launchable coaching brain (M0–M3). Everything after is metric-gated.

---

## M0 — Walking Skeleton  · effort: M · deps: none
**Goal:** prove every layer talks end-to-end, deployed to production.
**Scope:** git/scaffold; better-auth (one provider); one Postgres row read/write via Drizzle;
one streaming Sonnet call rendered; one PostHog event; one Pino log w/ correlation id; `/bn`
`/en` locale scaffold; one TTS tap-to-listen proof; one Playwright test of the full path; CI
on every push; Vercel preview.
**Exit criteria:** live preview URL; green GitHub Actions; visible log line; PostHog event
recorded; Playwright green; tap-to-listen works; `pnpm setup` brings up local dev + seed in
< 10 min.

## M1 — Slice 1: Bilingual Onboarding & Skill Assessment  · effort: M · deps: M0
**Goal:** a warm, < 5-min first run that produces a validated Freelancer Profile.
**Scope:** conversational onboarding (text + icons + tap-to-listen), Haiku skill
normalization, Zod-validated `freelancer_profiles` write, bilingual chrome, adaptive depth
(beginner↔expert), feature-flagged.
**Exit criteria:** profile persisted; both locales pass; E2E onboard→profile green;
`onboarding_completed` analytics event; CWV budget held on synthetic Android profile.

## M2 — Slice 2: Personalized 90-Day Roadmap  · effort: L · deps: M1 + Platform Tracks v0
**Goal:** generate a platform- and profile-specific Phases→Quests→Missions plan, rendered as
an interactive journey path.
**Scope:** roadmap generator (structured output, grounded in pinned Platform Track versions —
**Fiverr + Upwork** curated for MVP), `user_roadmaps`/`roadmap_missions` instancing,
journey-path UI, bilingual + audio, version pinning.
**Exit criteria:** two different profiles yield demonstrably different roadmaps; roadmap pins
track versions; E2E profile→roadmap green; generation cost within per-user budget.

## M3 — Slice 4: Conversational AI Coach  · effort: L · deps: M1 (M2 enriches context)
**Goal:** a grounded, bilingual, streaming coach with full user context.
**Scope:** `/api/coach` streaming; context load (profile, current mission, recent activity);
platform-track grounding; English-for-clients scaffolding; TOS-refusal; cost-cap +
graceful-degrade; version-controlled prompt files; **prompt-eval harness (`pnpm eval`) in
CI**.
**Exit criteria:** P95 first-token < 800 ms; refuses TOS-violating asks (eval-proven); no
hallucination when ungrounded (eval-proven); E2E coach conversation green; per-turn cost
accounted.

> **MVP launch decision gate** after M3: ship to a small cohort of real Bangladeshi
> beginners behind flags. **Do not start M4+ until activation + first-earning signal is
> read.** (Risk R2.)

---

## M4 — Slice 5: Gamification Layer  · effort: M · deps: M2, M3 · gated
XP/levels (named tiers), streaks + freeze, milestone achievements, Confidence Meter.
Anti-gaming enforced (XP only on real completions). **Exit:** XP/unlock/state unit-tested;
no XP for login/reading; level-up E2E.

## M5 — Slice 3 depth + Slice 6: Mission Engine & Platform Specialization  · effort: L · gated
Full mission-type behaviors; deeper Fiverr/Upwork specialization as versioned modules.
**Exit:** each mission type behaves per spec; track updates don't break live roadmaps.

## M6 — Slice 7: Evidence & Verification  · effort: M · gated
Metadata-first uploads; AI plausibility as a **soft signal only**; ephemeral retention;
"what we do with uploads" disclosure + one-click delete. **Exit:** self-attestation remains
system of record; deletion verified.

## M7 — Slice 8: Streaks, Notifications, Re-engagement  · effort: M · gated
Daily mission, smart nudges (purpose-measured), A/B via PostHog flags; first background
worker if needed. **Exit:** every notification has a tracked purpose; opt-out works.

## M8 — Slice 10: Settings, Export, Deletion, Contribution  · effort: M · gated
GDPR-grade export + one-click deletion (baseline already in MVP, hardened here); the
**pay-what-you-want contribution** flow on first-earning via **BD rails** (bKash/Nagad/
SSLCommerz); idempotency keys where money moves. **Exit:** export/delete verified;
contribution flow idempotent.

## M9 — Slice 11: Admin & Content Authoring  · effort: L · gated
Internal UI to author/edit missions, quests, Platform Tracks without deploys; versioned
content; preview; rollback. **Exit:** owner edits content live; rollback works.

## M10 — Slice 12: Observability Dashboards  · effort: S · gated
The single "system breathing" page: DAU/WAU, missions/day, AI calls + cost, P95 latency,
error rate, sign-up funnel, activation, first-earning funnel. **Exit:** all panels read from
events emitted since M0.

## M11 — Slice 13: CV & Application Coach (job_board)  · effort: M · BUILT (flag `cv_coach`, 2026-07-20)
Advisory coach for the job_board audience (ADR-0012): paste CV + job description → match
analysis, tailored cover letter, outreach email, CV-improvement suggestions. Advisory-only,
never fabricates experience (eval-enforced); job *discovery* deferred (no scraping, ADR-0001).
Flag `cv_coach`. Full plan: `docs/cv-coach-plan.md`; design in ADR-0015 (proposed).
**Exit:** four artifacts generate + persist; delete works; eval proves no fabrication; one E2E
green; per-user AI cost within cap.

## Deferred / conditional
- **Job discovery from CV:** only via official public feeds/APIs (RemoteOK/WWR/Remotive),
  never scraping; deferred until the CV coach validates (owner decision 2026-07-19).
- **Slice 9 (Community):** built only if a Phase-0 trust/safety review clears it; default is
  to **skip** at our scale (R1).
- **Phase-2 audience:** lower-literacy / rural path + Bangla **voice input (ASR)** — separate
  initiative after MVP validates.

---

## Critical path
`M0 → M1 → M2 → M3 → (launch gate) → metric-driven ordering of M4–M10.`
