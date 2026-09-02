// Generated from specs/student-registration-test-plan.md — TC-REG-009
import { test, expect } from "@playwright/test";

test.describe("Student Registration - XSS Injection", () => {
  test("TC-REG-009: XSS in name fields", async ({ page }) => {
    await page.goto("/signup");
    await page.fill('[data-testid="signup-firstname"]', "<script>alert('xss')</script>");
    await page.fill('[data-testid="signup-lastname"]', "Test");
    await page.fill('[data-testid="signup-email"]', `e2e-xss-${Date.now()}@eccs-test.com`);
    await page.fill('[data-testid="signup-password"]', "TestPass123!");
    await page.fill('[data-testid="signup-confirm-password"]', "TestPass123!");
    await page.click('[data-testid="signup-submit"]');

    await expect(page.locator("text=Please check your email")).toBeVisible({ timeout: 15000 });
  });
});
