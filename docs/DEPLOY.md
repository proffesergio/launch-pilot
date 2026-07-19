# Deploying LaunchPilot to Vercel (v1)

Your manual runbook — Release N (make the live app usable)

Everything below is owner-only (secrets/dashboards). I can't and shouldn't hold prod creds.

1. Google OAuth — Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Web client:
- Authorized JavaScript origin: https://launch-pilot-nine.vercel.app
- Authorized redirect URI: https://launch-pilot-nine.vercel.app/api/auth/callback/google
- Copy the Client ID + Secret.

2. Resend (magic-link email) — create account at resend.com → verify a sending domain → create an API key. Note a verified EMAIL_FROM like LaunchPilot <login@yourdomain.com>.

3. Vercel → Project → Settings → Environment Variables (Production) — set:
NEXT_PUBLIC_APP_URL=https://launch-pilot-nine.vercel.app
GOOGLE_CLIENT_ID=...            GOOGLE_CLIENT_SECRET=...
EMAIL_PROVIDER=resend           RESEND_API_KEY=...   EMAIL_FROM=LaunchPilot <login@yourdomain.com>
# turn features on (all default OFF in prod):
FLAG_M1_ONBOARDING=true  FLAG_M2_ROADMAP=true  FLAG_M3_COACH=true
FLAG_M4_GAMIFICATION=true  FLAG_M5_PLATFORMS=true  FLAG_M35_LAUNCH_STUDIO=true
(Leave all SMS_PROVIDER/TWILIO_* unset — sign-in auto-hides phone. DATABASE_URL, BETTER_AUTH_SECRET, ANTHROPIC_API_KEY should already be set from the first deploy; GOOGLE_TTS_API_KEY, PostHog, Sentry are optional.)

4. Ship it (git — run these yourself):
git push -u origin develop           # publish the branch
git checkout main && git merge --ff-only develop && git push origin main
Pushing main triggers the Vercel production deploy. (Prefer review? gh pr create --base main --head develop instead, then merge.) Watch the build log for env-validation errors — they name the offending var.

5. Smoke test the live URL (once deployed):
1. /en and /bn render; language toggle works.
2. Sign in with Google → lands on /dashboard.
3. Sign in with magic link (check email) → /dashboard. Phone should not appear as an option.
4. Onboarding → roadmap generates → open coach, confirm a reply streams and a TOS-violating ask is refused.



## 0. Preconditions
- Green `main`: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass.
- A GitHub remote Vercel can import.

## 1. Provision production Postgres  **[owner]**
Use Neon (the app + migrations speak Neon's HTTP driver).
1. Create a **production** Neon project/branch.
2. Copy two connection strings:
   - **Pooled** → `DATABASE_URL` (app runtime).
   - **Direct / unpooled** → `DATABASE_URL_UNPOOLED` (migrations only).

## 2. Apply migrations to the prod database  **[owner, from your machine]**
Migrations are forward-only and idempotent (Drizzle's journal skips applied ones).
Run them **against prod once, before the first user hits the app**:
```bash
DATABASE_URL_UNPOOLED="<prod-direct-url>" pnpm db:migrate
```
Re-run after every future deploy that adds a migration. (Latest: `0009_material_amphibian`.)

## 3. Create the Vercel project  **[owner]**
1. Vercel → **Add New → Project** → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Build/output settings: leave default.
3. Package manager: Vercel reads `packageManager` in `package.json` (pnpm) automatically.
4. **Don't deploy yet** — set env vars first (step 4).

## 4. Set environment variables in Vercel  **[owner]**
Project → Settings → Environment Variables → **Production** (and Preview if you
want branch deploys to work).

### Required — app boot-fails without these
| Var | Value |
|-----|-------|
| `DATABASE_URL` | pooled Neon URL (step 1) |
| `DATABASE_URL_UNPOOLED` | direct Neon URL (step 1) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` (≥32 chars) |
| `ANTHROPIC_API_KEY` | console.anthropic.com key (must be **funded** — coach/studio call the model) |
| `NEXT_PUBLIC_APP_URL` | your prod URL, e.g. `https://launchpilot.vercel.app` (auth callbacks + absolute links break if wrong) |

### At least one sign-in method — REQUIRED for anyone to log in
Configure **at least one** (all three are code-complete):
- **Phone OTP** → set `SMS_PROVIDER=twilio` + the `TWILIO_*` trio (primary path for the BD audience).
- **Google OAuth** → set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` + do step 5.
- **Magic-link email** → set `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` + `EMAIL_FROM`.

The sign-in page adapts to what's configured (ADR-0014): it shows only methods that can
actually deliver, leads with phone OTP when SMS is live (else with Google/magic-link), and
shows an honest "sign-in isn't set up yet" message if *none* are configured. So configure at
least one, or no one can get in.

### Feature flags — REQUIRED to expose any feature in production
In production every flag defaults **OFF** (`src/lib/flags.ts`). Without these the
site is just a landing page. Set each to `true`:
```
FLAG_M1_ONBOARDING=true
FLAG_M2_ROADMAP=true
FLAG_M3_COACH=true
FLAG_M4_GAMIFICATION=true
FLAG_M5_PLATFORMS=true
FLAG_M35_LAUNCH_STUDIO=true
FLAG_CV_COACH=true
```
(Ship a subset by omitting/setting `false` — e.g. hold `FLAG_M35_LAUNCH_STUDIO` for a later cohort.)
`FLAG_CV_COACH` enables the CV & Application Coach (Slice 13, ADR-0015) on the job_board path;
it needs a funded `ANTHROPIC_API_KEY` (already required) and no other new secret.

### Optional — feature stays off cleanly if absent
| Var | Enables |
|-----|---------|
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in (also do step 5) |
| `GOOGLE_TTS_API_KEY` | tap-to-listen audio |
| `NEXT_PUBLIC_POSTHOG_KEY` | product analytics + remote flags |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | error tracking + source maps |
| `SMS_PROVIDER=twilio` + `TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM_NUMBER` | real SMS OTP / phone sign-in (else log-only in prod) |
| `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` + `EMAIL_FROM` | magic-link email sign-in (else log-only in prod) |
| `AI_DAILY_USD_CAP_PER_USER` | per-user daily AI spend cap (default `0.50`) |
| `ANTHROPIC_MODEL_CRAFT`, `ANTHROPIC_MODEL_FAST` | override model ids |

## 5. Configure Google OAuth for the prod domain  **[owner]** (only if using Google sign-in)
Google Cloud Console → Credentials → your OAuth Web client → add:
- Authorized origin: `https://<prod-domain>`
- Redirect URI: `https://<prod-domain>/api/auth/callback/google`

## 6. Deploy
Trigger the first deploy (push to `main`, or Vercel "Deploy"). Vercel builds with
`pnpm build`. Watch the build log for env validation errors (they name the offending var).

## 7. Post-deploy smoke test
On the live URL:
1. `/en` and `/bn` landing render; locale switcher works.
2. Sign in (magic link or Google) → lands on `/dashboard`.
3. Complete onboarding → roadmap generates.
4. Open the coach → grounded reply streams; a TOS-violating ask is refused.
5. Launch Studio → generate a Fiverr gig → publish walkthrough → XP on dashboard.
6. Sentry receives a test event; PostHog shows pageviews (if configured).

## 8. CI secrets (optional but recommended)  **[owner]**
`.github/workflows/ci.yml` already runs lint/typecheck/test/build/e2e/eval on push.
Add the same secrets as **GitHub repo secrets** so the E2E + eval steps run instead
of self-skipping: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`,
`ANTHROPIC_API_KEY`, plus `COACH_E2E`/`STUDIO_E2E` if you want the AI-path E2E to run.

## Rollback
Vercel → Deployments → promote the previous good deployment. Migrations are
forward-only; a schema rollback needs a new forward migration, not a revert.
