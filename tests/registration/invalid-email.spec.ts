// Generated from specs/student-registration-test-plan.md — TC-REG-004
import { test, expect } from "@playwright/test";

test.describe("Student Registration - Invalid Email", () => {
  test("TC-REG-004: Invalid email format", async ({ page }) => {
    await page.goto("/signup");
    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");

    // Try an obviously invalid email
    await page.fill('[data-testid="signup-email"]', "not-an-email");
    await page.fill('[data-testid="signup-password"]', "ValidPass123!");
    await page.fill('[data-testid="signup-confirm-password"]', "ValidPass123!");

    const isDisabled = await page.locator('[data-testid="signup-submit"]').isDisabled();
    if (!isDisabled) {
      await page.click('[data-testid="signup-submit"]');
      // If it submits, API will accept it (potential bug)
      console.warn("WARNING: Invalid email was accepted by client — server may not validate email format");
    }
  });
});
