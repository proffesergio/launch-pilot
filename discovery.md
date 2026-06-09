# LaunchPilot — Discovery (Phase 0)

> This document is the signed-off output of Phase 0. It captures *why* LaunchPilot exists,
> what it deliberately is not, and the decisions every later choice flows from. Treat it as
> living: when product direction changes, change it here first.

## The user

A **literate beginner in Bangladesh** — often a school/college/university student, a recent
graduate, a stay-at-home parent, or a career-changer. They have a skill (or want one):
writing, coding, design, video, voice-over, tutoring, translation, virtual assistance, data
entry, social media. They likely have zero portfolio, low confidence, limited English for
client communication, a low-to-mid-range Android phone, and intermittent, metered internet.

**Out of scope for v1:** non-literate rural professionals (mechanics, farmers). We will
serve them in **phase 2** with a different on-ramp (local digital-adjacent gigs, a different
definition of "first earning", and voice *input*). Designing them out of v1 is a focusing
decision, not a value judgement — see Risk R2.

## The promise (honest version)

If you show up ~30 minutes a day and complete the missions, LaunchPilot gives you the
clearest possible path to your first paid order and a sustainable income — and tells you the
truth about how long that realistically takes for *your* skill, in *your* country, on *your*
platform. **We commit to the process and to honesty. We do not guarantee an outcome.** (The
original brief's "first order in 60 days, period" is reframed here on purpose — see R3.)

## The five clarifying questions (and the owner's answers)

1. **Platform boundary — do we ever touch the marketplaces programmatically?**
   → **No. Advisory only.** LaunchPilot maintains a curated, versioned knowledge base of
   each platform's published rules + labeled heuristics, and coaches the user. The user
   performs every action on the platform themselves.

2. **Monetization at launch?**
   → **Free, success-based.** No paywall, ever. After the user's **first real earning**
   through our guidance, they pay what they want. Billing is deferred past MVP and will use
   **Bangladeshi rails** (bKash / Nagad / SSLCommerz / aamarPay) — Stripe does not pay out
   to Bangladesh.

3. **Localization at launch?**
   → **Bilingual Bangla + English UI from day one**, plus tap-to-listen audio so
   lower-literacy users can hear content. The coach also actively scaffolds the English
   needed to talk to clients.

4. **Launch audience & path?**
   → **Literate beginners first**, on the standard global-platform path. The roadmap engine
   is built so a separate lower-literacy / local-gig path can be added later.

5. **Interaction modality for v1?**
   → **Text (bn + en) + icon navigation + TTS playback.** Voice *input* (Bangla ASR) is the
   immediate next phase, not v1.

## Risk register

| ID | Risk | Why it could kill us | Mitigation |
|----|------|----------------------|------------|
| **R1** | **Platform TOS / IP exposure** | Showing real marketplace UI = trademark/copyright risk. "Algorithm" advice or proposal tooling can get the *user* banned. This is existential. | Advisory-only boundary. Original redrawn diagrams, never real screenshots. Coach refuses TOS-violating asks and explains why. Platform advice grounded only in curated, version-controlled content. Legal review of any outcome claim before public copy. |
| **R2** | **Building unvalidated scope** | 12 slices + 12 docs + ~10 paid services before any beginner has tried it = months spent on a guess. | Ship the coaching brain (Slices 1/2/4) behind flags to real Bangladeshi beginners first. Gate everything else on activation + first-earning metrics. Phase-2 audiences stay out of v1. |
| **R3** | **Guarantee betrayal + AI hallucination on platform specifics** | An absolute outcome promise is a legal liability *and* a trust bomb for the exact people we want to help. Platform specifics are where LLMs confidently hallucinate. | Commit to process + honest base rates, never outcomes. Ground platform answers in curated docs (RAG). Label heuristics as heuristics. Prompt-eval harness (`pnpm eval`) from day one to catch regressions. |

## Scope boundary — LaunchPilot is NOT

- A course platform or content library.
- A job board or placement service. We never place users in jobs.
- An automation/bot tool. No auto-applying, scraping, or activity on platforms.
- A payments intermediary between the user and their clients.
- A social network. No DMs, comment threads, or doom-scroll feeds.
- A guarantee of income or employment.
- (v1 only) A voice-*input* app, or a product for non-literate users.

We reference this list every time scope creep appears: *does it fit the current slice, or
is it a new milestone?*

## Success criteria — what "shipped" (MVP) means

1. A literate beginner completes **bilingual onboarding → personalized roadmap in < 5 min**,
   with every screen tap-to-listen.
2. **Activation:** ≥ 40% of sign-ups complete their first real-world mission.
3. **First-earning funnel** (sign-up → first real freelance outcome) is instrumented
   end-to-end and visible on a dashboard. *(This is the user-outcome metric.)*
4. Coach **P95 first-token latency < 800 ms**; per-user daily AI cost is **capped and
   tracked**.
5. Three **E2E paths green in CI**: onboard→first mission, mission completion, coach chat.
6. **Account deletion + data export** work (baseline privacy hygiene).
7. **Core Web Vitals** budget met on a mid-range Android / 4G synthetic profile in CI
   (LCP < 2.0 s, INP < 200 ms, CLS < 0.1).

## Glossary

| Term | Meaning |
|------|---------|
| **Freelancer Profile** | Structured record of the user's skills, target platform, weekly hours, country, English confidence, and experience. Drives all personalization. |
| **Platform Track** | Versioned knowledge module for one marketplace (Fiverr, Upwork…): rules, payout method, labeled heuristics, platform-specific missions. |
| **Skill Track** | Versioned content for one skill domain (design, dev, writing…). |
| **Roadmap** | A 90-day plan: **Phases → Quests → Missions**, personalized per Profile. |
| **Mission** | Smallest unit of action: objective, est. time, category, completion criterion, XP. Types: Daily / Weekly / Quest / Boss / Side. |
| **Quest** | A themed group of missions toward a milestone. |
| **XP / Level** | Progression currency and named tiers: **Apprentice → Practitioner → Specialist → Authority → Mentor**. XP is awarded only for evidenced real-world actions. |
| **Streak / Freeze** | Daily-engagement mechanic; one weekly "freeze" prevents rage-quitting. |
| **Confidence Meter** | Visualizes the user's *actual* readiness (from completed missions) vs. *perceived* readiness. |
| **Coach** | The conversational AI persona. Name TBD — owner picks from **Sol / Remi / Atlas**. |
| **First Earning** | The user's first real income via our guidance. Both the magic moment and the monetization trigger. |
| **Journey state machine** | Onboarding → Skill Assessment → Foundation → Profile Built → Gig Live → First Order → Level Up → Scaling. |

## Two small inputs still needed from the owner (Phase 1)

- **Coach name:** Sol / Remi / Atlas (or propose your own).
- **Accent color / palette:** a proposed palette is in `docs/architecture.md` → Brand.
