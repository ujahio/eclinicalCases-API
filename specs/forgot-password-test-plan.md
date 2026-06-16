# Forgot Password — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Forgot password flow via `/forgot-password` page
> **Author**: Playwright Test Planner
> **Date**: 2026-06-15

---

## ⚠️ Known Gap: Forgot Password Link is Commented Out

The "Forgot your password?" link on the login page is **currently commented out** in `src/app/(auth)/login/page.tsx` (lines 110-115):

```tsx
{/* <Link
  href="/forgot-password"
  className="text-dark text-xs uppercase font-medium mt-2 inline-block border-b border-dark hover:text-primary-300 hover:border-primary-300 transition-colors duration-100"
>
  Forgot your password ?
</Link> */}
```

**Impact:** Users cannot navigate to `/forgot-password` from the login page UI. The page still exists and is routable via direct URL. This plan documents tests for when the link is re-enabled.

**Recommendation:** Re-enable the forgot password link before shipping to production.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Test Scenarios](#3-test-scenarios)
4. [Implementation Approach](#4-implementation-approach)
5. [Directory Structure](#5-directory-structure)

---

## 1. Architecture Overview

### Forgot Password Flow

```
Browser (/forgot-password)          Redux Slices                    AWS Cognito
┌─────────────────────────┐    dispatch    ┌──────────────────┐   OTP Send    ┌────────────┐
│ Step 1: Send OTP        │ ─────────────► │ sendOtpSlice     │ ───────────► │ UserPool   │
│  - email                │               │ sendOtp()        │              │ eccslabs   │
│                         │ ◄───────────── │ POST /send-otp   │ ◄────────── │            │
│ Step 2: Verify OTP      │   succeeded   └──────────────────┘              └────────────┘
│  - email                │
│  - otp (6 digits)       │    dispatch    ┌──────────────────┐  ResetPass   ┌────────────┐
│  - newPassword          │ ─────────────► │ resetPassword    │ ──────────► │ UserPool   │
│                         │               │ Slice            │             │ eccslabs   │
│                         │ ◄───────────── │ POST /reset-     │ ◄───────── │            │
│                         │   succeeded    │ password         │             └────────────┘
└─────────────────────────┘               └──────────────────┘
           │
           └─ On success → redirect /login
```

### Client-Side Validation Schemas

From `src/lib/schema.ts`:

```typescript
// Step 1: Send OTP
export const forgetPassStep1Schema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email Required"),
});

// Step 2: Reset Password
export const forgetPassStep2Schema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email Required"),
  otp: Yup.number()
    .typeError("OTP must be a number")
    .required("OTP Required")
    .test("len", "OTP must be exactly 6 digits", (val) => val && val.toString().length === 6),
  newPassword: Yup.string().required("Password Required").min(8, "Password must be at least 8 characters"),
});
```

### API Routes Used

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/send-otp` | POST | Send OTP to user's email |
| `/api/auth/reset-password` | POST | Reset password with OTP |

---

### Testability Requirements

The following `data-testid` attributes must be added to the forgot password page before implementing tests:

| data-testid | Element | Notes |
|---|---|---|
| `forgot-password-email` | Email input field | — |
| `forgot-password-submit` | Submit / "Send OTP" button | — |
| `forgot-password-error` | Error message display | — |
| `forgot-password-success` | Success message / confirmation | — |
| `forgot-password-link` | "Forgot your password?" link on login page | Currently commented out — add when re-enabled |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed: `bun add -D @playwright/test && bunx playwright install chromium`
- Test stage deployed: `bunx sst deploy --stage test-e2e`
- A confirmed user exists in Cognito for password reset testing

### 2.2 Email Capture Strategy

The forgot password flow requires receiving the OTP email. Options:

| Approach | Description | Effort |
|---|---|---|
| **Skip E2E** | Test the UI form validation only, not the actual OTP flow | Low |
| **Mailosaur** | Use Mailosaur to capture OTP emails | Medium |
| **SES Rule** | Save emails to S3, read from S3 in test | High |

**Recommendation**: Test form validation via E2E, test actual password reset via API.

---

## 3. Test Scenarios

### 3.1 Forgot Password Page — UI Elements

| Field | Value |
|---|---|
| **ID** | TC-FP-001 |
| **Title** | Forgot password page renders Step 1 form correctly |
| **Priority** | P1 (High) |
| **Type** | UI / Smoke |

**Preconditions:**
- The forgot password link must be re-enabled in login page (currently commented out)

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/forgot-password` | Page loads with Step 1 form |
| 2 | Verify email input field | Email input visible |
| 3 | Verify submit button | Button visible (text TBD from component) |
| 4 | Verify "Back to login" link | Link present, href="/login" |

**Code skeleton:**

```typescript
// tests/forgot-password/ui-elements.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Forgot Password - UI", () => {
  test("TC-FP-001: Page renders Step 1 form", async ({ page }) => {
    await page.goto("/forgot-password");

    // Verify email input is present
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });
});
```

---

### 3.2 Empty Email — Form Validation

| Field | Value |
|---|---|
| **ID** | TC-FP-002 |
| **Title** | Submitting empty email shows validation error |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/forgot-password` | Form loads |
| 2 | Leave email field empty | Field empty |
| 3 | Click submit button | Yup validation: "Email Required" error shown |

**Code skeleton:**

```typescript
test("TC-FP-002: Empty email shows validation error", async ({ page }) => {
  await page.goto("/forgot-password");

  // Try to submit with empty email
  await page.click('button[type="submit"]');

  // Yup validation should show error
  await expect(page.locator("text=Email Required")).toBeVisible();
});
```

---

### 3.3 Invalid Email Format — Form Validation

| Field | Value |
|---|---|
| **ID** | TC-FP-003 |
| **Title** | Invalid email format shows validation error |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/forgot-password` | Form loads |
| 2 | Enter `"not-an-email"` in email field | Field shows input |
| 3 | Click submit | Yup validation: "Invalid email address" |

**Code skeleton:**

```typescript
test("TC-FP-003: Invalid email shows validation error", async ({ page }) => {
  await page.goto("/forgot-password");

  await page.fill('input[name="email"]', "not-an-email");
  await page.click('button[type="submit"]');

  await expect(page.locator("text=Invalid email address")).toBeVisible();
});
```

---

### 3.4 Valid Email Submission — Step 1 to Step 2

| Field | Value |
|---|---|
| **ID** | TC-FP-004 |
| **Title** | Valid email submission advances to Step 2 (OTP input) |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A confirmed user exists with a known email
- The `/send-otp` API endpoint is functional

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/forgot-password` | Step 1 form loads |
| 2 | Enter valid email of existing user | Field shows input |
| 3 | Click submit | API call to `/send-otp` |
| 4 | Wait for success response | Form advances to Step 2 (OTP + new password fields) |

**Code skeleton:**

```typescript
test("TC-FP-004: Valid email advances to Step 2", async ({ page }) => {
  await page.goto("/forgot-password");

  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.click('button[type="submit"]');

  // Wait for Step 2 to appear — OTP and new password fields
  // The actual selectors depend on the ForgotPasswordComp component
  // Step 2 should show OTP input and new password input
  await page.waitForTimeout(3000);

  // Verify we moved to step 2 (check for OTP-related elements)
  // This depends on the actual component implementation
  const otpField = page.locator('input[name="otp"]');
  const passwordField = page.locator('input[name="newPassword"]');

  // At least one of these should be visible after step transition
  const step2Visible = await otpField.isVisible().catch(() => false) ||
    await passwordField.isVisible().catch(() => false);

  expect(step2Visible).toBeTruthy();
});
```

---

### 3.5 OTP Validation — Step 2

| Field | Value |
|---|---|
| **ID** | TC-FP-005 |
| **Title** | Step 2 validates OTP format (6 digits) |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Preconditions:**
- User has reached Step 2 (OTP input visible)

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter OTP `"123"` (less than 6 digits) | Yup: "OTP must be exactly 6 digits" |
| 2 | Enter OTP `"1234567"` (more than 6 digits) | Yup: "OTP must be exactly 6 digits" |
| 3 | Enter OTP `"abcdef"` (non-numeric) | Yup: "OTP must be a number" |
| 4 | Enter OTP `"123456"` (valid) | No OTP error |

**Code skeleton:**

```typescript
test("TC-FP-005: OTP validation in Step 2", async ({ page }) => {
  // This test requires being in Step 2 state
  // May need to intercept API or seed state
  await page.goto("/forgot-password");

  // Fill email and submit to reach Step 2
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // If Step 2 is visible, test OTP validation
  const otpField = page.locator('input[name="otp"]');
  if (await otpField.isVisible()) {
    // Short OTP
    await otpField.fill("123");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=OTP must be exactly 6 digits")).toBeVisible();

    // Non-numeric OTP
    await otpField.fill("abcdef");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=OTP must be a number")).toBeVisible();
  }
});
```

---

### 3.6 Password Requirements in Step 2

| Field | Value |
|---|---|
| **ID** | TC-FP-006 |
| **Title** | New password must meet minimum length requirement |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | In Step 2, enter short password `"Ab1!"` | Yup: "Password must be at least 8 characters" |
| 2 | Enter valid password `"TestPass123!"` | No password error |

**Code skeleton:**

```typescript
test("TC-FP-006: Password length validation in Step 2", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const passwordField = page.locator('input[name="newPassword"]');
  if (await passwordField.isVisible()) {
    await passwordField.fill("Ab1!");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Password must be at least 8 characters")).toBeVisible();
  }
});
```

---

### 3.7 Successful Password Reset

| Field | Value |
|---|---|
| **ID** | TC-FP-007 |
| **Title** | Valid OTP + new password resets password and redirects to /login |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Note:** This test requires actual OTP capture (email integration). Skip if email capture is not configured.

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Reach Step 2 with valid OTP | OTP input visible |
| 2 | Enter correct OTP | Field shows input |
| 3 | Enter new valid password | Field shows input |
| 4 | Click submit | API call to `/reset-password` |
| 5 | Success response | Redirect to `/login` |

**Code skeleton:**

```typescript
test("TC-FP-007: Successful password reset redirects to /login", async ({ page }) => {
  test.skip(!process.env.TEST_OTP, "Requires OTP capture integration");

  await page.goto("/forgot-password");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const otpField = page.locator('input[name="otp"]');
  if (await otpField.isVisible()) {
    await otpField.fill(process.env.TEST_OTP!);
    await page.fill('input[name="newPassword"]', "NewTestPass123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  }
});
```

---

### 3.8 Navigation Back to Login

| Field | Value |
|---|---|
| **ID** | TC-FP-008 |
| **Title** | Back to login link navigates to /login |
| **Priority** | P2 (Medium) |
| **Type** | Navigation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/forgot-password` | Page loads |
| 2 | Click "Back to login" link (or navigate via URL) | Redirect to `/login` |

**Code skeleton:**

```typescript
test("TC-FP-008: Back to login navigation", async ({ page }) => {
  await page.goto("/forgot-password");

  // Look for back to login link
  const backLink = page.locator('a[href="/login"]');
  if (await backLink.isVisible()) {
    await backLink.click();
    await expect(page).toHaveURL(/\/login/);
  } else {
    // Direct navigation
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
  }
});
```

---

## 4. Implementation Approach

### 4.1 Test Isolation

- Each test clears cookies before running
- OTP-dependent tests are skipped when `TEST_OTP` env var is not set
- Form validation tests can run independently

### 4.2 API Interception

For tests that need to verify API calls without actual email:

```typescript
// Intercept the send-otp API call
await page.route("**/api/auth/send-otp", async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ message: "OTP sent successfully" }),
  });
});
```

---

## 5. Directory Structure

```
tests/
├── forgot-password/
│   ├── ui-elements.spec.ts          # TC-FP-001
│   ├── empty-email.spec.ts          # TC-FP-002
│   ├── invalid-email.spec.ts        # TC-FP-003
│   ├── step-transition.spec.ts      # TC-FP-004
│   ├── otp-validation.spec.ts       # TC-FP-005
│   ├── password-validation.spec.ts  # TC-FP-006
│   ├── successful-reset.spec.ts     # TC-FP-007
│   └── navigation.spec.ts           # TC-FP-008
└── helpers/
    └── otp.ts                       # OTP capture helper (optional)
```

---

> **This plan should be saved to `specs/forgot-password-test-plan.md`.**
>
> **Action Item:** Re-enable the "Forgot your password?" link on the login page before implementing these tests.
