import { defineConfig, devices } from "@playwright/test";

/**
 * E2E harness (M0). Runs against the dev server locally; CI starts its own.
 * Secret-dependent specs (auth/AI/TTS) self-skip when the relevant env var is
 * absent, so the suite is green on a fresh clone and complete in CI.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    // Mid-range Android is the primary device (perf budget target).
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "corepack pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    timeout: 120_000,
  },
});
