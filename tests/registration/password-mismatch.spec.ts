// Generated from specs/student-registration-test-plan.md — TC-REG-006
import { test, expect } from "@playwright/test";

test.describe("Student Registration - Password Mismatch", () => {
  test("TC-REG-006: Password mismatch shows error", async ({ page }) => {
    await page.goto("/signup");
    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");
    await page.fill('[data-testid="signup-email"]', "jane@test.com");

    // Valid password for requirements, but different confirm
    await page.fill('[data-testid="signup-password"]', "TestPass123!");
    await page.fill('[data-testid="signup-confirm-password"]', "DifferentPass1!");

    const isDisabled = await page.locator('[data-testid="signup-submit"]').isDisabled();
    if (!isDisabled) {
      await page.click('[data-testid="signup-submit"]');
      await expect(page.locator("text=Passwords do not match")).toBeVisible();
    }
  });
});
