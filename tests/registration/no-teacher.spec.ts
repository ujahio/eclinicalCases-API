// Generated from specs/student-registration-test-plan.md — TC-REG-007
import { test, expect } from "@playwright/test";

test.describe("Student Registration - No Teacher", () => {
  test.skip(!process.env.SKIP_TEACHER_CHECK, "Requires stage without teacher");

  test("TC-REG-007: No teacher blocks registration", async ({ page }) => {
    await page.goto("/signup");
    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");
    await page.fill('[data-testid="signup-email"]', `e2e-noteacher-${Date.now()}@eccs-test.com`);
    await page.fill('[data-testid="signup-password"]', "TestPass123!");
    await page.fill('[data-testid="signup-confirm-password"]', "TestPass123!");
    await page.click('[data-testid="signup-submit"]');

    await expect(page.locator("text=No teacher found in the system")).toBeVisible({ timeout: 15000 });
  });
});
