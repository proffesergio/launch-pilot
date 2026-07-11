# Slice A — Gamification core + dashboard redesign

Date: 2026-07-11 · Status: approved by owner · Flag: `m4_gamification`

Part 1 of 4 approved slices (A: this · B: profile page · C: SMS provider
interface · D: docs pass — ADR "global-ready, BD-first", roadmap update,
README rewrite). M4 is pulled forward ahead of the launch checkpoint because
the redesigned dashboard needs real numbers; ADR lands in Slice D.

## Decisions (owner, 2026-07-11)

- **Audience:** global-ready, BD-first (superseding ADR in Slice D).
- **Gamification:** real backend, built gradually feature by feature — no
  placeholder numbers. Docs written at the end.
- **SMS:** interface only, no provider signup yet; dev mailbox stays.
- **Design:** Marigold dark techy — extends the landing page's existing
  `dawn-sky` ink/marigold language. Not a separate neon-gaming look.

## Architecture: event-sourced XP ledger

One append-only table powers XP totals, level, streak, activity timeline
(profile page, Slice B), and future badges.

```
xp_events
  id          uuid pk
  user_id     text → user.id (cascade)
  kind        text: onboarding_completed | roadmap_generated |
                    mission_completed | coach_session | daily_checkin
  amount      int (XP awarded)
  source_id   text NOT NULL  — idempotency key within (user, kind):
              "once" for one-shot kinds, YYYY-MM-DD for daily kinds,
              mission row id for mission_completed (future)
  day         text YYYY-MM-DD (UTC) — cheap streak/day queries
  created_at  timestamptz
  UNIQUE (user_id, kind, source_id)  — double-award is a silent no-op
```

Rejected: counter columns (no history, racy); PostHog-derived (analytics is
not a source of truth).

## Pure logic (`src/lib/gamification.ts`, TDD)

- `XP_AWARDS`: onboarding_completed 50 · roadmap_generated 30 ·
  coach_session 10 (first per UTC day) · daily_checkin 5.
  Mission XP stays `missionXp()` from `src/lib/xp.ts` (architecture §7).
- `levelFromXp(totalXp)` → `{ level, intoLevel, needed, progress }`.
  Threshold curve: cost of level n→n+1 = `100 * n^1.5` rounded to nearest 10.
  Early levels come fast (level 2 ≈ one onboarding + a few check-ins).
- `computeStreak(days, today)` → consecutive-day count ending today or
  yesterday (yesterday keeps the flame alive until today's first activity).

## Award service (`src/lib/xp-service.ts`)

`awardXp({ userId, kind, sourceId, amount? })` — insert with
`onConflictDoNothing`, returns `{ awarded }`; logs `xp.awarded` and captures
PostHog `xp_awarded` only on a real insert. Never throws to callers (awards
must not break the flow that earned them). Behind `getFlag("m4_gamification")`
at each call site. `getGamificationSummary(userId)` returns total XP, active
days (for streak), and recent events for the dashboard/profile.

Wired into existing flows only (real activity, nothing invented):
- `completeOnboarding` → `onboarding_completed` (sourceId `once`)
- `ensureRoadmap` (created only) → `roadmap_generated` (sourceId `once`)
- coach route `onFinish` → `coach_session` (sourceId = UTC day)
- dashboard visit → `daily_checkin` (sourceId = UTC day)

## Dashboard (`/[locale]/dashboard`)

Dark techy on-brand: `dawn-sky`-derived ink background + grain, glassy
`bg-white/5 backdrop-blur` cards with marigold accents. Layout: header
(greeting, locale switcher, sign-out) → hero row (animated level ring +
XP-to-next-level bar, streak flame, total XP in Geist Mono) → bento grid:
roadmap progress card (missions unlocked/total, phase), "focus next" card
(first unlocked mission → roadmap), Atlas coach card, recent-activity card
(last xp_events). No profile yet → the grid yields to a single onboarding
CTA card. Motion: `motion` package (Framer Motion for React 19) — staggered
card entrance, animated ring/bar fills, `useReducedMotion` respected;
background stays CSS-only (perf budget: LCP < 2.0s mid-Android).

All strings in `messages/en.json` + `messages/bn.json`. Existing
`data-testid`s (`view-roadmap`, `open-coach`, `start-onboarding`,
`profile-summary`) are preserved so M1–M3 E2E paths keep passing.

## Error handling

Award failures log `xp.award_failed` + continue. Summary query failure
renders the dashboard with a zeroed summary (never a crash). Zod parses the
event kind at the service boundary.

## Testing

Vitest: level curve (monotonic, level 1 at 0 XP, exact thresholds), streak
(empty, gap, today-only, ends-yesterday, tz-string edges), XP_AWARDS shape.
Existing suites must stay green; E2E selectors unchanged.
