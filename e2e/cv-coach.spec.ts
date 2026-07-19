import { expect, test, type Page } from "@playwright/test";

/**
 * CV & Application Coach (Slice 13, ADR-0015). The structural path (auth → the
 * form renders → client-side validation) runs on DATABASE_URL alone. The
 * generate→result path calls the real craft model, so it's gated behind
 * CV_COACH_E2E=1 + a funded key — same treatment as the Studio spec, so an
 * unfunded CI run doesn't fail for billing reasons.
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

test("the CV coach form renders and validates an empty submit (no AI)", async ({
  page,
}) => {
  await signIn(page, `e2e-cvcoach-${Date.now()}@launchpilot.test`);

  await page.goto("/en/cv-coach");
  // First visit compiles /cv-coach on the dev server — generous timeout.
  await expect(page.getByTestId("cv-input")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("jd-input")).toBeVisible();
  await expect(page.getByTestId("generate")).toBeVisible();

  // Empty submit is caught client-side: an error shows, no result is rendered,
  // and we never hit the AI route.
  await page.getByTestId("generate").click();
  await expect(page.getByTestId("cv-error")).toBeVisible();
  await expect(page.getByTestId("cv-result")).toHaveCount(0);
});

test("paste CV + JD → analysis and cover letter render", async ({ page }) => {
  test.skip(
    !process.env.ANTHROPIC_API_KEY || !process.env.CV_COACH_E2E,
    "requires a funded ANTHROPIC_API_KEY (set CV_COACH_E2E=1)",
  );
  await signIn(page, `e2e-cvcoach-gen-${Date.now()}@launchpilot.test`);

  await page.goto("/en/cv-coach");
  await expect(page.getByTestId("cv-input")).toBeVisible({ timeout: 60_000 });

  await page.getByTestId("cv-input").fill(
    "Rahim Uddin — Junior web developer based in Dhaka. Two years building " +
      "responsive sites with HTML, CSS, JavaScript and React. Freelance projects " +
      "for local businesses: a bakery storefront and a tutoring landing page. " +
      "Comfortable with Git, Figma handoff, and basic Node.js APIs.",
  );
  await page.getByTestId("jd-input").fill(
    "We're hiring a remote front-end developer to build and maintain a React " +
      "web app. Must know JavaScript, React, and CSS; TypeScript and REST APIs a " +
      "plus. Good written English for a distributed team.",
  );

  await page.getByTestId("generate").click();

  const result = page.getByTestId("cv-result");
  await expect(result).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("match-score")).toBeVisible();
  await expect(result).toContainText("Cover letter");
});
