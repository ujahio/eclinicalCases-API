// Generated from specs/student-registration-test-plan.md — TC-REG-002
import { test, expect } from "@playwright/test";
import { generateTestUsers } from "../fixtures/testUsers";

test.describe("Student Registration - Duplicate Email", () => {
  test("TC-REG-002: Duplicate email shows error message", async ({ page }) => {
    const users = generateTestUsers();

    // First registration
    await page.goto("/signup");
    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");
    await page.fill('[data-testid="signup-email"]', users.studentEmail);
    await page.fill('[data-testid="signup-password"]', users.studentPassword);
    await page.fill('[data-testid="signup-confirm-password"]', users.studentPassword);
    await page.click('[data-testid="signup-submit"]');
    await expect(page.locator("text=Please check your email")).toBeVisible({ timeout: 15000 });

    // Second registration with same email
    await page.goto("/signup");
    await page.fill('[data-testid="signup-firstname"]', "Jane");
    await page.fill('[data-testid="signup-lastname"]', "Doe");
    await page.fill('[data-testid="signup-email"]', users.studentEmail);
    await page.fill('[data-testid="signup-password"]', "DiffPass123!");
    await page.fill('[data-testid="signup-confirm-password"]', "DiffPass123!");
    await page.click('[data-testid="signup-submit"]');

    // Expect error
    await expect(page.locator("text=A user with this email already exists")).toBeVisible({ timeout: 10000 });
  });
});
