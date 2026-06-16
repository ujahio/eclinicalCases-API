// Generated from specs/student-registration-test-plan.md — TC-REG-003
import { test, expect } from "@playwright/test";

test.describe("Student Registration - Missing Fields", () => {
  test("TC-REG-003: Missing fields prevent form submission", async ({ page }) => {
    await page.goto("/signup");

    // All fields empty — button is disabled
    await expect(page.locator('[data-testid="signup-submit"]')).toBeDisabled();

    // Fill only name fields
    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");
    await expect(page.locator('[data-testid="signup-submit"]')).toBeDisabled();

    // Add email only
    await page.fill('[data-testid="signup-email"]', "jane@test.com");
    await expect(page.locator('[data-testid="signup-submit"]')).toBeDisabled();

    // Add password (not meeting all requirements)
    await page.fill('[data-testid="signup-password"]', "weak");
    await expect(page.locator('[data-testid="signup-submit"]')).toBeDisabled();
  });
});
