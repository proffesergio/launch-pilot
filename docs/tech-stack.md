# LaunchPilot — Tech Stack

For each choice: **what it is · why over the obvious alternative · what we lose.** Default
stack from the brief is accepted unless noted. Final picks are ratified as ADRs in
`decision-log.md`.

## Language & runtime

**TypeScript (strict, no `any`)** — Typed superset of JS. *Why over plain JS:* types are our
primary documentation and catch whole error classes at the boundary (Principle 3). *We lose:*
some velocity on throwaway code, and a compile step.

**Node.js (via Next.js)** — JS runtime for server. *Why over a Python/Go backend:* one
language across client and server, the richest ecosystem for this app shape, and it keeps the
team surface small. *We lose:* CPU-bound work is awkward (we have none at MVP). *(See
ADR-0007: a stray Python venv was a mistake; stack stays Node/TS.)*

## Frontend

**Next.js 15 (App Router)** — React framework with server components, server actions,
streaming. *Why over a SPA + separate API:* RSC ships less JS to low-end Android (Principle
9), server actions remove a hand-written API layer, and streaming suits the coach. *We lose:*
App Router's mental model is newer and has sharper edges than a plain SPA.

**Tailwind CSS + shadcn/ui** — Utility CSS + unstyled, owned components. *Why over a component
library like MUI:* we own the markup (accessibility, bundle size, brand control) instead of
fighting a theme. *We lose:* more initial wiring than drop-in components.

**Framer Motion** — Declarative animation. *Why:* purposeful motion is a product pillar; it's
the ergonomic choice in React. *We lose:* a few KB; must be disciplined to keep CLS low.

**TanStack Query (server state) + Zustand (client state)** — *Why this split:* server cache
and ephemeral UI state are different problems; conflating them in one store is a known pain.
*We lose:* two concepts to learn instead of one.

**next-intl** — i18n with locale routing (`/bn`, `/en`). *Why over next-i18next:* first-class
App Router support. *We lose:* a routing layer and the discipline of keying all chrome text.

## Backend (in-app)

**Next.js Route Handlers + Server Actions** — *Why over a separate Node service now:* the MVP
has no background work that needs its own process; co-locating keeps deploys and tracing
simple. *We lose:* nothing yet — a Hono/Fastify worker is added the slice it's needed
(notifications, heavy jobs), not before.

## Database & ORM

**PostgreSQL (Neon or Supabase)** — Relational DB. *Why over a document DB:* our data is
deeply relational (roadmaps, missions, completions, ledgers) and we want real transactions
and constraints (XP integrity). *We lose:* schema rigidity (embraced via migrations).

**Drizzle ORM** *(ADR-0003, vs Prisma)* — Typed SQL-first ORM. *Why over Prisma:* thin,
SQL-shaped, no separate engine binary or generate step, serverless-friendly cold starts,
and migrations are plain SQL we can read. *We lose:* Prisma Studio's polish and some
ecosystem maturity. *Chosen because* on metered serverless + a SQL-literate design, control
and cold-start beat convenience.

## Auth

**better-auth** *(ADR-0004, vs Clerk)* — Self-hosted TS auth (email + magic link + Google).
*Why over Clerk:* no per-MAU cost (matters for a free product aimed at price-sensitive
users), data stays in our Postgres, full control of the bilingual flow. *We lose:* Clerk's
turnkey UI and hosted ops — we own more. *Revisit* if auth maintenance outweighs the savings.

## AI

**Anthropic Claude — Sonnet (craft) + Haiku (fast)** via **Vercel AI SDK** — *Why this split:*
Sonnet for the coaching voice and copy where quality matters; Haiku for cheap classification
(Principle 10). AI SDK gives typed streaming + tool calls. *We lose:* single-provider
coupling — mitigated by keeping model ids in env and prompts as files.

## Text-to-Speech

**Google Cloud TTS** *(ADR-0005)* — bn-IN + en neural voices for tap-to-listen. *Why over
ElevenLabs:* solid Bangla coverage at low cost, which matters because audio is core to
inclusion. *We lose:* the most natural English prosody — acceptable, and the **hash-cache**
keeps spend near zero.

## Storage / Email (later slices)

**Cloudflare R2 / UploadThing** (evidence uploads, Slice 7) and **Resend** (email, Slice 8) —
introduced when their slice lands, not at MVP, to honor "cost is a feature."

## Observability

**PostHog** (analytics + feature flags + session replay), **Sentry** (errors), **Pino** →
Better Stack/Axiom (logs). *Why PostHog:* flags + analytics + replay in one tool we already
need for slice-gating and A/B nudges. *We lose:* some best-of-breed depth per category; fine
at our scale. Log sink is console in the skeleton; hosted sink added when volume warrants.

## Testing

**Vitest** (unit), **Playwright** (E2E), **MSW** (API/network mocking). *Why:* Vitest is fast
and Vite-native; Playwright is the robust cross-browser E2E choice; MSW mocks at the network
layer so tests exercise real client code. *We lose:* nothing material. TDD is the workflow
(Principle 5), not just the tooling.

## CI/CD & tooling

**GitHub Actions → Vercel** (web), Railway/Fly.io reserved for any future non-Vercel service.
**pnpm** package manager. **Single app**, no Turborepo monorepo until we genuinely have a
second deployable. *Why:* fewest moving parts to ship the skeleton; add structure only when
it pays for itself.

## Runtime validation

**Zod** at every runtime boundary — API inputs, AI outputs, env vars (`lib/env.ts`), form
data. *Why:* types vanish at runtime; Zod is the gate that makes "types are documentation"
true where data actually enters the system.
