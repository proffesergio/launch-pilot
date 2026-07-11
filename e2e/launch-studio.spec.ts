import { expect, test, type Page } from "@playwright/test";

/**
 * M3.5 Launch Studio. The structural path (auth → onboard → Studio → Playbook)
 * runs on DATABASE_URL alone. The generate→publish path calls the real craft
 * model, so it's gated behind STUDIO_E2E=1 + a funded key — same treatment as
 * the coach spec, so an unfunded CI run doesn't fail for billing reasons.
 */
test.skip(!process.env.DATABASE_URL, "DATABASE_URL not set");

async function signIn(page: Page, email: string) {
  await page.goto("/en/sign-in");
  await page.getByTestId("show-other-options").click();
  await page.getByLabel("Your email address").fill(email);
  await page.getByRole("button", { name: "Send me a sign-in link" }).click();
  await expect(page.getByText("Link sent.", { exact: false })).toBeVisible();
  const mailbox = await page.request.get(
    `/api/dev/magic-link?email=${encodeURIComponent(email)}`,
  );
  const { url } = (await mailbox.json()) as { url: string };
  await page.goto(url);
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function onboard(page: Page) {
  await page.getByTestId("start-onboarding").click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByTestId("onboarding-skill").fill("I design logos and banners");
  await page.getByTestId("onboarding-next").click();
  await page.getByTestId("platform-fiverr").click();
  await page.getByTestId("onboarding-next").click();
  await page.getByTestId("hours-10").click();
  await page.getByTestId("onboarding-next").click();
  await page.getByTestId("english-low").click();
  await page.getByTestId("onboarding-next").click();
  await page.getByTestId("experience-none").click();
  await page.getByTestId("onboarding-next").click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
}

test("Studio Playbook shows platform-specific tips and tools (no AI)", async ({
  page,
}) => {
  await signIn(page, `e2e-studio-${Date.now()}@launchpilot.test`);
  await onboard(page);

  await page.getByTestId("open-launch-studio").click();
  await expect(page).toHaveURL(/\/launch-studio$/, { timeout: 60_000 });

  // Assets tab (default): both marketplace drafts are offered.
  await expect(page.getByTestId("generate-fiverr_gig")).toBeVisible();
  await expect(page.getByTestId("generate-upwork_profile")).toBeVisible();

  // Playbook tab: a job board surfaces its apply-with-CV note + a CV tool,
  // proving curated tips/tools are wired per platform with zero AI cost.
  await page.getByTestId("studio-tab-playbook").click();
  await page.getByTestId("playbook-remoteok").click();
  const detail = page.getByTestId("playbook-detail");
  await expect(detail).toContainText("RemoteOK");
  await expect(detail).toContainText("Novoresume"); // job-board-only tool
  await expect(page.getByTestId("playbook-ask-atlas")).toBeVisible();

  // A marketplace shows a general tool instead.
  await page.getByTestId("playbook-fiverr").click();
  await expect(detail).toContainText("Payoneer");
});

test("generate → publish a Fiverr gig earns XP", async ({ page }) => {
  test.skip(
    !process.env.ANTHROPIC_API_KEY || !process.env.STUDIO_E2E,
    "requires a funded ANTHROPIC_API_KEY (set STUDIO_E2E=1)",
  );
  await signIn(page, `e2e-studio-pub-${Date.now()}@launchpilot.test`);
  await onboard(page);

  await page.getByTestId("open-launch-studio").click();
  await expect(page).toHaveURL(/\/launch-studio$/, { timeout: 60_000 });

  // Draft with the real model, then walk through publishing it.
  await page.getByTestId("generate-fiverr_gig").click();
  await expect(page.getByTestId("save-fiverr_gig")).toBeVisible({ timeout: 60_000 });

  await page.getByTestId("publish-fiverr_gig").click();
  await page.getByTestId("mark-published-fiverr_gig").click();
  await expect(page.getByTestId("asset-fiverr_gig-published")).toBeVisible({
    timeout: 15_000,
  });

  // The publish reward lands on the dashboard activity feed.
  await page.goto("/en/dashboard");
  await expect(page.getByTestId("recent-activity")).toContainText(
    /marketplace asset|অ্যাসেট/,
  );
});
