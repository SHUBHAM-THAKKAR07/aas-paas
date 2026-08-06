import { test, expect } from "@playwright/test";

/**
 * Playwright E2E smoke tests
 * Run: npm run test:e2e
 */
test.describe("Aas-Paas smoke tests", () => {
  test("landing page loads and shows brand name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Aas-Paas/);
    await expect(page.locator("h1").first()).toContainText("Aas-Paas");
  });

  test("home route loads the app shell", async ({ page }) => {
    await page.goto("/home");
    // Should load the app layout (even if unauthenticated — no redirect yet)
    await expect(page.locator("main")).toBeVisible();
  });

  test("api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });
});
