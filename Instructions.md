
To take it live (the remaining M0 exit criteria — needs your accounts)

1. Local: corepack pnpm run setup → fill .env.local (DATABASE_URL, BETTER_AUTH_SECRET — openssl rand -base64 32, ANTHROPIC_API_KEY, GOOGLE_TTS_API_KEY, GOOGLE_CLIENT_ID/SECRET) → re-run it to migrate → corepack pnpm dev, then hand-test: sign in (grab the link from /api/dev/magic-link), run the AI proof, tap-to-listen on the home page.
2. GitHub: add those same values as repo secrets — the 3 skipped E2E specs go live in CI.
3. Vercel: vercel link + set the env vars in the dashboard (production NEXT_PUBLIC_APP_URL + Google OAuth redirect https://<domain>/api/auth/callback/google), then push — CI + deploy complete M0's exit criteria.

Once you've pushed and the deploy is up, M0 is done and I start M1: bilingual onboarding → Haiku skill normalization → Freelancer Profile (first failing test: the profile Zod schema).