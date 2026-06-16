// Generated from specs/student-registration-test-plan.md — TC-REG-008
import { test, expect } from "@playwright/test";

test.describe("Student Registration - Rapid Signups", () => {
  test("TC-REG-008: Rapid sequential registrations", async ({ page }) => {
    const emails = Array.from({ length: 3 }, (_, i) => `e2e-rapid-${Date.now()}-${i}@eccs-test.com`);

    for (const email of emails) {
      await page.goto("/signup");
      await page.fill('[data-testid="signup-firstname"]', "Rapid");
      await page.fill('[data-testid="signup-lastname"]', "Test");
      await page.fill('[data-testid="signup-email"]', email);
      await page.fill('[data-testid="signup-password"]', "TestPass123!");
      await page.fill('[data-testid="signup-confirm-password"]', "TestPass123!");
      await page.click('[data-testid="signup-submit"]');

      // Check success or rate limit message
      const success = page.locator("text=Please check your email");
      const retry = page.locator("text=try again");
      await expect(success.or(retry)).toBeVisible({ timeout: 10000 });
    }
  });
});
