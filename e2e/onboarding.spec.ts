import { expect, test, type Page } from "@playwright/test";

/**
 * M1 exit-criterion path: sign in → onboarding wizard → profile persisted →
 * dashboard summary. Runs with DATABASE_URL only; skill classification falls
 * back to keywords when ANTHROPIC_API_KEY is absent — same user outcome.
 */
test.skip(!process.env.DATABASE_URL, "DATABASE_URL not set");

async function signIn(page: Page, email: string) {
  await page.goto("/en/sign-in");
  await page.getByLabel("Your email address").fill(email);
  await page.getByRole("button", { name: "Send me a sign-in link" }).click();
  await expect(page.getByText("Link sent.", { exact: false })).toBeVisible();
  const mailbox = await page.request.get("/api/dev/magic-link");
  const { url } = (await mailbox.json()) as { url: string };
  await page.goto(url);
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("a beginner completes onboarding and gets a profile", async ({ page }) => {
  await signIn(page, `e2e-onboard-${Date.now()}@launchpilot.test`);

  await page.getByTestId("start-onboarding").click();
  await expect(page).toHaveURL(/\/onboarding$/);

  // Bangla answer through the English UI — classification is bilingual.
  await page.getByTestId("onboarding-skill").fill("আমি লোগো ডিজাইন করি");
  await page.getByTestId("onboarding-next").click();

  await page.getByTestId("platform-fiverr").click();
  await page.getByTestId("onboarding-next").click();

  await page.getByTestId("hours-10").click();
  await page.getByTestId("onboarding-next").click();

  await page.getByTestId("english-low").click();
  await page.getByTestId("onboarding-next").click();

  await page.getByTestId("experience-none").click();
  await page.getByTestId("onboarding-next").click();

  await expect(page).toHaveURL(/\/dashboard$/);
  const summary = page.getByTestId("profile-summary");
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("graphic_design");
  await expect(summary).toContainText("fiverr");
  await expect(summary).toContainText("skill_assessment");
});

test("both locales render the wizard", async ({ page }) => {
  await signIn(page, `e2e-locale-${Date.now()}@launchpilot.test`);
  await page.goto("/bn/onboarding");
  await expect(
    page.getByRole("heading", { name: "আপনি কী করতে পারেন, বা কী শিখতে চান?" }),
  ).toBeVisible();
  await page.goto("/en/onboarding");
  await expect(
    page.getByRole("heading", {
      name: "What can you do, or what would you love to learn?",
    }),
  ).toBeVisible();
});
