// Generated from specs/student-registration-test-plan.md — TC-REG-001
import { test, expect } from "@playwright/test";
import { generateTestUsers } from "../fixtures/testUsers";

test.describe("Student Registration - Happy Path", () => {
  const users = generateTestUsers();

  test("TC-REG-001: Successful student signup with valid data", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('[data-testid="signup-submit"]')).toBeDisabled();

    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");
    await page.fill('[data-testid="signup-email"]', users.studentEmail);
    await page.fill('[data-testid="signup-password"]', users.studentPassword);
    await page.fill('[data-testid="signup-confirm-password"]', users.studentPassword);

    // Verify password hints all green
    await expect(page.locator('[data-testid="signup-password-hint-length"]')).toHaveClass(/text-green-600/);
    await expect(page.locator('[data-testid="signup-password-hint-special"]')).toHaveClass(/text-green-600/);

    await page.click('[data-testid="signup-submit"]');

    // Wait for success toast
    await expect(page.locator("text=Please check your email to finish registration."))
      .toBeVisible({ timeout: 15000 });

    // Verify redirect
    await expect(page).toHaveURL(/\/login/);
  });
});
