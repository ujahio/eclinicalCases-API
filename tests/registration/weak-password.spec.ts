// Generated from specs/student-registration-test-plan.md — TC-REG-005
import { test, expect } from "@playwright/test";

test.describe("Student Registration - Weak Password", () => {
  test("TC-REG-005: Password requirements validate in real-time", async ({ page }) => {
    await page.goto("/signup");
    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");
    await page.fill('[data-testid="signup-email"]', "jane@test.com");

    const passwordInput = page.locator('[data-testid="signup-password"]');

    // Test too short
    await passwordInput.fill("Ab1!");
    await expect(page.locator('[data-testid="signup-password-hint-length"]')).toHaveClass(/text-red-600/);

    // Test missing uppercase
    await passwordInput.fill("abcdefgh1!");
    await expect(page.locator('[data-testid="signup-password-hint-uppercase"]')).toHaveClass(/text-red-600/);

    // Test missing special char
    await passwordInput.fill("Abcdefgh1");
    await expect(page.locator('[data-testid="signup-password-hint-special"]')).toHaveClass(/text-red-600/);

    // Test valid password — all green
    await passwordInput.fill("TestPass123!");
    await expect(page.locator('[data-testid="signup-password-hint-length"]')).toHaveClass(/text-green-600/);
    await expect(page.locator('[data-testid="signup-password-hint-uppercase"]')).toHaveClass(/text-green-600/);
    await expect(page.locator('[data-testid="signup-password-hint-lowercase"]')).toHaveClass(/text-green-600/);
    await expect(page.locator('[data-testid="signup-password-hint-number"]')).toHaveClass(/text-green-600/);
    await expect(page.locator('[data-testid="signup-password-hint-special"]')).toHaveClass(/text-green-600/);
  });
});
