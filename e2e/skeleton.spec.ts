import { expect, test } from "@playwright/test";

const hasDb = !!process.env.DATABASE_URL;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
const hasTts = !!process.env.GOOGLE_TTS_API_KEY;

test.describe("Bangla-preferring browser", () => {
  test.use({ locale: "bn-BD" });

  test("root lands on /bn and the switcher reaches English", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/bn$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "আপনার প্রথম ফ্রিল্যান্স আয়",
    );

    // The locale switcher renders in both header and footer; use the header's.
    await page
      .locator("header")
      .getByRole("link", { name: "English" })
      .click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "your first freelance income",
    );
  });
});

test.describe("browser preferring an unsupported language", () => {
  test.use({ locale: "fr-FR" });

  test("root falls back to English (global-first default)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });
});

test.describe("English-preferring browser", () => {
  test.use({ locale: "en-US" });

  test("root negotiates to /en", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });
});

test("phone OTP sign-in (primary method) reaches the dashboard", async ({
  page,
  request,
}) => {
  test.skip(!hasDb, "DATABASE_URL not set");

  // Unique, valid BD mobile per run: 017 + 8 digits.
  const local = `017${String(Date.now()).slice(-8)}`;
  await page.goto("/en/sign-in");
  await page.getByTestId("phone-input").fill(local);
  await page.getByTestId("send-code").click();
  // The code step only renders after the send-otp call resolves, which is
  // also the moment the dev mailbox is guaranteed to hold the code.
  await expect(page.getByTestId("otp-input")).toBeVisible();

  const mailbox = await request.get(
    `/api/dev/otp?phone=${encodeURIComponent(`+880${local.slice(1)}`)}`,
  );
  expect(mailbox.ok()).toBeTruthy();
  const { code } = (await mailbox.json()) as { code: string };

  await page.getByTestId("otp-input").fill(code);
  await page.getByTestId("verify-code").click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
});

test("magic-link sign-in reaches the dashboard and signs out", async ({
  page,
  request,
}) => {
  test.skip(!hasDb, "DATABASE_URL not set");

  const email = `e2e-${Date.now()}@launchpilot.test`;
  await page.goto("/en/sign-in");
  await page.getByTestId("show-other-options").click();
  await page.getByLabel("Your email address").fill(email);
  await page.getByRole("button", { name: "Send me a sign-in link" }).click();
  await expect(page.getByText("Link sent.", { exact: false })).toBeVisible();

  // M0 has no email provider: the dev mailbox holds the link.
  const mailbox = await request.get(
    `/api/dev/magic-link?email=${encodeURIComponent(email)}`,
  );
  expect(mailbox.ok()).toBeTruthy();
  const { url } = (await mailbox.json()) as { url: string };

  await page.goto(url);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(email)).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("one Sonnet reply streams into the page", async ({ page }) => {
  test.skip(!hasAnthropic, "ANTHROPIC_API_KEY not set");

  await page.goto("/en/ai-proof");
  await page.getByRole("button", { name: "Run the proof" }).click();
  const output = page.getByTestId("ai-proof-output");
  await expect(output).not.toBeEmpty({ timeout: 30_000 });
});

test("tap-to-listen serves cacheable audio", async ({ request }) => {
  test.skip(!hasTts || !hasDb, "GOOGLE_TTS_API_KEY or DATABASE_URL not set");

  const res = await request.get("/api/tts?text=hello&locale=en");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("audio/");
  expect(res.headers()["cache-control"]).toContain("immutable");

  // Second call must be a cache hit with an identical ETag.
  const again = await request.get("/api/tts?text=hello&locale=en");
  expect(again.headers()["etag"]).toBe(res.headers()["etag"]);
});
