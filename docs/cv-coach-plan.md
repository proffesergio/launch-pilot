# Release N+1 — CV & Application Coach (job_board path)

> Resumable implementation plan. Status: **BUILT (2026-07-20), behind flag `cv_coach`** —
> ADR-0015 accepted. Foundation + API + prompts/evals + UI + E2E are in `develop`. What
> remains is owner verification with a funded `ANTHROPIC_API_KEY` (run `pnpm eval` and the
> `CV_COACH_E2E` path in CI), then flip `FLAG_CV_COACH=true` in Vercel. Follow-ups below.

## One-line
An advisory coach for the **job_board** audience (ADR-0012): user pastes their CV + a target
job description; we return a **match analysis**, a **tailored cover letter**, an **outreach
email draft**, and **CV improvement suggestions**. The user sends everything themselves.

## Locked constraints (inherit — do not relitigate)
- **Advisory only, no scraping, no auto-apply** (ADR-0001). Job *discovery* is explicitly
  **deferred** (owner decision 2026-07-19). This slice never fetches or posts to any site.
- **Truthful, never fabricates.** The coach helps present *real* experience; it must refuse
  to invent degrees, employers, dates, or skills. This is the CV-equivalent of the coach's
  TOS-refusal guardrail and is eval-enforced.
- **Integrated into the job_board path**, not a standalone unauthenticated tool (owner choice
  2026-07-19): reachable once onboarding is done and the user's platform pick is a
  `category: "job_board"` platform (`src/lib/platforms.ts`). Gated behind flag `cv_coach`.
- English-first (ADR-0013), but CV/cover-letter output language follows the job description's
  language (unlike Launch Studio, which is English-only for marketplace ToS reasons).
- Privacy: a CV is personal data. Follow the M6 stance — minimal retention + **one-click
  delete**; disclose what we store. Don't log raw CV text (Pino logs stay metadata-only).

## Mirror this existing slice
Launch Studio (M3.5) is the structural twin — copy its shape, not its content:
- Zod asset schemas w/ runtime guards: `src/lib/launch-assets.ts`
- Generator/reviewer service + versions: `src/lib/launch-studio.ts` (`generateAsset`,
  `reviewAsset`, `GENERATOR_VERSION`)
- Single API route: `src/app/api/launch-studio/route.ts`
- DB table: `launchAssets` in `src/db/schema.ts` (jsonb payload + status + version pins)
- AI plumbing: `@ai-sdk/anthropic` + `ai` (`streamText`/`generateObject`), model ids from
  `env.ANTHROPIC_MODEL_CRAFT` (Sonnet, craft) / `ANTHROPIC_MODEL_FAST` (Haiku, classify)
- Cost cap: `costUsdMicros()` in `src/lib/ai-cost.ts` + `aiUsageDaily` table (per-user/day)
- Evals: `evals/` + `scripts/eval.ts` (`pnpm eval`)
- Flags: `src/lib/flags.ts` `FlagName` union + `docs/DEPLOY.md` flag table

## Scope of THIS slice (keep tight)
Input: **pasted CV text** + **pasted job-description text**. (File upload — .pdf/.docx parse —
is a deliberate follow-up, not this slice; a textarea ships first.)
Outputs (four, each its own Zod schema + generator):
1. **Analysis** — `matchScore` 0–100, `strengths[]`, `gaps[]`, `missingKeywords[]`, one honest
   `verdict` line. Grounded *only* in the provided CV + JD.
2. **Cover letter** — tailored draft; no invented facts.
3. **Outreach email** — short, sendable; no invented facts.
4. **CV suggestions** — concrete edits/additions the user can make from *real* experience
   (rephrase, quantify, reorder, surface a missing-but-true skill). Never "add X you don't
   have."

## Data model (new)
`cvApplications` pgTable in `src/db/schema.ts` (+ forward-only migration via `pnpm db:generate`):
`id, userId (fk), platformId, cvText (text), jobDescription (text), analysis jsonb,
coverLetter text, outreachEmail text, suggestions jsonb, generatorVersion, createdAt,
updatedAt`. Add a delete endpoint/action (one-click) + list-by-user. Consider TTL/soft-delete
in a follow-up; for the slice, a working delete is the bar.

## TDD + subagent decomposition (build order)
Rails: failing test first; pure logic + route integration are unit-tested, UI is E2E. Behind
`cv_coach`, off in prod. Suggested parallel subagents (spawn only when owner says go):
- **A — schemas + pure logic:** the four Zod schemas + any pure normalizers (e.g. clamp/round
  matchScore, dedupe keywords) in `src/lib/cv-coach.ts`; unit tests `src/lib/cv-coach.test.ts`.
- **B — API + persistence:** `src/app/api/cv-coach/route.ts` (generate w/ `generateObject`
  for analysis/suggestions, `streamText` for letter/email), `cvApplications` table +
  migration, cost-cap wiring, delete action; route integration test.
- **C — prompts + evals:** prompt files under `prompts/`; eval cases in `evals/cv-coach.*`:
  (1) refuses to fabricate a degree/employer/date, (2) analysis cites only provided text,
  (3) cover letter invents no employer, (4) output language matches the JD.
- **D — UI:** `src/app/[locale]/cv-coach/` (textarea inputs, results view, bilingual copy in
  `messages/{en,bn}.json`, tap-to-listen), entry point from the job_board roadmap/dashboard;
  covered by one Playwright E2E (paste CV + JD → analysis + cover letter render).
Then integrate + wire the flag + update `docs/DEPLOY.md`, `docs/roadmap.md`, and mark ADR-0015
accepted.

## Definition of done
`pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm eval` green; one E2E path green; flag
`cv_coach` gates it; delete works; no raw CV text in logs; ADR-0015 accepted; DEPLOY updated.
