# Login — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Login flow via `/login` page and `POST /api/auth/signin`, role-based redirects
> **Author**: Playwright Test Planner
> **Date**: 2026-06-15

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Test Data Management](#3-test-data-management)
4. [Test Scenarios](#4-test-scenarios)
5. [Implementation Approach](#5-implementation-approach)
6. [Directory Structure & Configuration](#6-directory-structure--configuration)

---

## 1. Architecture Overview

### Login Flow (simplified)

```
Browser (/login)                     Next.js API Route                   AWS Cognito
┌─────────────────────┐    POST     ┌──────────────────────┐  AdminInit   ┌────────────┐
│ LoginForm           │ ──────────► │ /api/auth/signin     │ ──────────► │ UserPool   │
│  - email            │             │ Lambda Handler       │             │ eccslabs   │
│  - password         │ ◄────────── │  auth.js → signin()  │ ◄────────── │            │
│                     │   200/400   │                      │             └────────────┘
│ Formik + Yup        │             │ 1. Validate inputs   │
│ loginSchema         │             │ 2. AdminInitiateAuth  │  ADMIN_NO_SRP_AUTH
│                     │             │ 3. Build token cookie │
│                     │             │ 4. Return role+tokens │
└─────────────────────┘             └──────────────────────┘
           │
           ├─ user_role=teacher → redirect /teacher/dashboard
           └─ user_role=student → redirect /student/dashboard
```

### Key Dependencies

| Resource | Purpose | Notes |
|---|---|---|
| Cognito UserPool (`eccslabs`) | User directory | Shared across stages |
| Cognito Web Client | ADMIN_NO_SRP_AUTH flow | `{stage.}eccswebclient` |
| `eccs_auth_data` cookie | Session storage | JSON with accessToken, refreshToken, user_role, etc. |
| Formik + Yup (`loginSchema`) | Client-side validation | Email required + valid format, password required |
| `react-toastify` | Error display | `toast.error("Error signing in. Please try again.")` |

### Client-Side Validation Schema

From `src/lib/schema.ts`:
```typescript
export const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email Required"),
  password: Yup.string().required("Password Required"),
});
```

### Cookie Structure

From `src/utils/cookies.ts` — stored as `eccs_auth_data`:
```typescript
{
  accessToken: string,
  refreshToken: string,
  accessTokenExpires: number,  // Date.now() + expiresIn
  id: string,
  firstName: string,
  lastName: string,
  user_role: "teacher" | "student",
  email: string,
}
```

---

## 2. Test Environment Setup

### 2.1 Recommended Stage: `test-e2e`

```bash
NEXT_PUBLIC_STAGE=test-e2e bunx sst deploy --stage test-e2e
```

### 2.2 Installing Playwright

```bash
bun add -D @playwright/test
bunx playwright install chromium
```

### 2.3 Seeding Test Users

Login tests require both a teacher and a student user in Cognito. The student must be confirmed (not in FORCE_CHANGE_PASSWORD state).

```typescript
// tests/helpers/cognito.ts — reuse from registration test plan
// Seed both teacher + student for login tests
export async function seedConfirmedStudent(email: string, password: string) {
  // 1. AdminCreateUser (SUPPRESS message)
  // 2. AdminSetUserPassword (Permanent: true)
  // 3. AdminConfirmSignUp (skip email verification)
}
```

### 2.4 Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://test-e2e.{domain}",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: "**/*.setup.ts",
      retries: 0,
    },
    {
      name: "login",
      dependencies: ["setup"],
      testMatch: "**/login/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

## 3. Test Data Management

### 3.1 Unique Data Strategy

```typescript
const TEST_PREFIX = `e2e-${Date.now()}`;
const STUDENT_EMAIL = `${TEST_PREFIX}-student@eccs-test.com`;
const TEACHER_EMAIL = `${TEST_PREFIX}-teacher@eccs-test.com`;
const TEST_PASSWORD = "TestPass123!";
```

### 3.2 Test Lifecycle

```
┌─────────────────────────────────────────────────┐
│                   GLOBAL SETUP                   │
│  - Seed teacher user in Cognito                 │
│  - Seed confirmed student user in Cognito       │
│  - Store credentials in env vars                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              TEST SUITE: LOGIN                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ 1. Student login → /student/dashboard       │ │
│  │ 2. Teacher login → /teacher/dashboard       │ │
│  │ 3. Invalid credentials → error toast        │ │
│  │ 4. Empty fields → form validation           │ │
│  │ 5. Cookie set correctly after login         │ │
│  │ 6. Unverified user login behavior           │ │
│  └─────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│                  GLOBAL TEARDOWN                 │
│  - Delete created test users                    │
└─────────────────────────────────────────────────┘
```

### 3.3 Cleanup Strategy

Reuse the same `cleanupTestUsers` helper from the registration test plan — delete all users with `e2e-` prefix.

---

## 4. Test Scenarios

### 4.1 Student Login — Happy Path

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-001 |
| **Title** | Student login with valid credentials redirects to /student/dashboard |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A confirmed student user exists in Cognito with `custom:user_role=student`
- Test stage `test-e2e` is deployed and accessible
- No `eccs_auth_data` cookie is set

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `{baseURL}/login` | Login page loads with "Sign in to Your Account" heading, email field, password field, and disabled "SIGN IN" button |
| 2 | Verify "SIGN IN" button is disabled | Button has `disabled` attribute (Formik initial state) |
| 3 | Enter valid email in email field | Field shows input, Yup validation passes |
| 4 | Enter valid password in password field | Field shows input, Yup validation passes |
| 5 | Click "SIGN IN" button | Button is enabled; form submits |
| 6 | Wait for redirect | URL changes to `/student/dashboard` |
| 7 | Verify cookie is set | `eccs_auth_data` cookie exists with `user_role=student` |

**Expected outcome:**
- Successful login with no error toast
- `eccs_auth_data` cookie is set with correct structure
- Page redirects to `/student/dashboard`

**Success criteria:**
- ✅ Login form renders with correct fields
- ✅ Form submits successfully
- ✅ `eccs_auth_data` cookie is set
- ✅ Redirect to `/student/dashboard`
- ✅ Dashboard page loads without further redirects

**Failure conditions:**
- ❌ Form doesn't submit (client-side validation blocks)
- ❌ API returns error (check network tab)
- ❌ Redirect goes to wrong dashboard
- ❌ Cookie not set after login

**Code skeleton:**

```typescript
// tests/login/student-login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Student Login - Happy Path", () => {
  const studentEmail = process.env.TEST_STUDENT_EMAIL!;
  const studentPassword = process.env.TEST_STUDENT_PASSWORD!;

  test("TC-LOGIN-001: Student login redirects to /student/dashboard", async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();

    await page.goto("/login");

    // Verify page loads
    await expect(page.locator("text=Sign in to Your Account")).toBeVisible();
    await expect(page.locator("button:has-text('SIGN IN')")).toBeDisabled();

    // Fill form
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);

    // Button should be enabled now
    await expect(page.locator("button:has-text('SIGN IN')")).toBeEnabled();

    // Submit
    await page.click("button:has-text('SIGN IN')");

    // Wait for redirect to student dashboard
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

    // Verify cookie is set
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === "eccs_auth_data");
    expect(authCookie).toBeDefined();

    const cookieData = JSON.parse(decodeURIComponent(authCookie!.value));
    expect(cookieData.user_role).toBe("student");
  });
});
```

---

### 4.2 Teacher Login — Happy Path

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-002 |
| **Title** | Teacher login with valid credentials redirects to /teacher/dashboard |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A confirmed teacher user exists in Cognito with `custom:user_role=teacher`
- Test stage `test-e2e` is deployed

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | Login page loads |
| 2 | Enter teacher email | Field shows input |
| 3 | Enter teacher password | Field shows input |
| 4 | Click "SIGN IN" | Form submits |
| 5 | Wait for redirect | URL changes to `/teacher/dashboard` |
| 6 | Verify cookie | `eccs_auth_data` cookie has `user_role=teacher` |

**Expected outcome:**
- Successful login
- Redirect to `/teacher/dashboard`
- Cookie contains teacher role

**Code skeleton:**

```typescript
test("TC-LOGIN-002: Teacher login redirects to /teacher/dashboard", async ({ page }) => {
  await page.context().clearCookies();

  await page.goto("/login");

  await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);

  await page.click("button:has-text('SIGN IN')");

  await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });

  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === "eccs_auth_data");
  const cookieData = JSON.parse(decodeURIComponent(authCookie!.value));
  expect(cookieData.user_role).toBe("teacher");
});
```

---

### 4.3 Invalid Credentials — Error Toast

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-003 |
| **Title** | Login with wrong password shows error toast |
| **Priority** | P0 (Critical) |
| **Type** | Negative / Error Handling |

**Preconditions:**
- A confirmed user exists in Cognito

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | Login page loads |
| 2 | Enter valid email | Field shows input |
| 3 | Enter wrong password `"WrongPass123!"` | Field shows input |
| 4 | Click "SIGN IN" | Form submits |
| 5 | Wait for error toast | Toast message: "Error signing in. Please try again." |
| 6 | Verify no redirect | URL remains `/login` |

**Expected outcome:**
- Error toast displayed: "Error signing in. Please try again."
- User remains on `/login`
- No cookie is set

**Code skeleton:**

```typescript
test("TC-LOGIN-003: Wrong password shows error toast", async ({ page }) => {
  await page.context().clearCookies();

  await page.goto("/login");

  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', "WrongPass123!");

  await page.click("button:has-text('SIGN IN')");

  // Expect error toast (react-toastify renders in a toast container)
  await expect(page.locator("text=Error signing in. Please try again."))
    .toBeVisible({ timeout: 10000 });

  // Verify still on login page
  await expect(page).toHaveURL(/\/login/);

  // Verify no auth cookie
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === "eccs_auth_data");
  expect(authCookie).toBeUndefined();
});
```

---

### 4.4 Non-Existent Email — Error Toast

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-004 |
| **Title** | Login with non-existent email shows error toast |
| **Priority** | P1 (High) |
| **Type** | Negative / Error Handling |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | Login page loads |
| 2 | Enter `nonexistent-${Date.now()}@eccs-test.com` | Field shows input |
| 3 | Enter any password | Field shows input |
| 4 | Click "SIGN IN" | Form submits |
| 5 | Wait for error toast | "Error signing in. Please try again." |

**Code skeleton:**

```typescript
test("TC-LOGIN-004: Non-existent email shows error toast", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="email"]', `nonexistent-${Date.now()}@eccs-test.com`);
  await page.fill('input[name="password"]', "SomePass123!");

  await page.click("button:has-text('SIGN IN')");

  await expect(page.locator("text=Error signing in. Please try again."))
    .toBeVisible({ timeout: 10000 });
});
```

---

### 4.5 Empty Fields — Form Validation

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-005 |
| **Title** | Login form blocks submission with empty fields and shows validation errors |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` with all fields empty | "SIGN IN" button is disabled |
| 2 | Click "SIGN IN" (if somehow enabled) | Form does not submit |
| 3 | Fill only email, leave password empty | Button remains disabled |
| 4 | Fill only password, leave email empty | Button remains disabled |
| 5 | Fill email with invalid format `"not-an-email"` | Yup shows "Invalid email address" error |
| 6 | Fill valid email + valid password | Button becomes enabled |

**Expected outcome:**
- Button remains disabled when fields are empty
- Yup validation errors appear for invalid email format
- Button only enabled when both fields have valid input

**Code skeleton:**

```typescript
test("TC-LOGIN-005: Empty fields block submission", async ({ page }) => {
  await page.goto("/login");

  // Button disabled with empty fields
  await expect(page.locator("button:has-text('SIGN IN')")).toBeDisabled();

  // Fill email only
  await page.fill('input[name="email"]', "test@test.com");
  await expect(page.locator("button:has-text('SIGN IN')")).toBeDisabled();

  // Clear email, fill password only
  await page.fill('input[name="email"]', "");
  await page.fill('input[name="password"]', "TestPass123!");
  await expect(page.locator("button:has-text('SIGN IN')")).toBeDisabled();

  // Fill invalid email
  await page.fill('input[name="email"]', "not-an-email");
  await page.fill('input[name="password"]', "");
  // Yup should show error for invalid email
  await expect(page.locator("text=Invalid email address")).toBeVisible();

  // Fill valid email + valid password
  await page.fill('input[name="email"]', "test@test.com");
  await page.fill('input[name="password"]', "TestPass123!");
  await expect(page.locator("button:has-text('SIGN IN')")).toBeEnabled();
});
```

---

### 4.6 Cookie Structure After Login

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-006 |
| **Title** | Login sets eccs_auth_data cookie with correct structure |
| **Priority** | P0 (Critical) |
| **Type** | Functional / Integration |

**Preconditions:**
- A confirmed user exists in Cognito

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear all cookies | No cookies present |
| 2 | Navigate to `/login` | Login page loads |
| 3 | Login with valid credentials | Redirect to dashboard |
| 4 | Check `eccs_auth_data` cookie | Contains: accessToken, refreshToken, accessTokenExpires, id, firstName, lastName, user_role, email |
| 5 | Verify `accessTokenExpires` | Is a future timestamp (Date.now() + 3600000) |
| 6 | Verify `SameSite=Strict` | Cookie has SameSite=Strict attribute |

**Code skeleton:**

```typescript
test("TC-LOGIN-006: Cookie structure is correct after login", async ({ page }) => {
  await page.context().clearCookies();

  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === "eccs_auth_data");

  expect(authCookie).toBeDefined();
  expect(authCookie!.path).toBe("/");
  expect(authCookie!.sameSite).toBe("Strict");

  const data = JSON.parse(decodeURIComponent(authCookie!.value));
  expect(data).toHaveProperty("accessToken");
  expect(data).toHaveProperty("refreshToken");
  expect(data).toHaveProperty("accessTokenExpires");
  expect(data).toHaveProperty("id");
  expect(data).toHaveProperty("firstName");
  expect(data).toHaveProperty("lastName");
  expect(data).toHaveProperty("user_role");
  expect(data).toHaveProperty("email");
  expect(data.user_role).toBe("student");
  expect(data.accessTokenExpires).toBeGreaterThan(Date.now());
});
```

---

### 4.7 Unverified User Login Behavior

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-007 |
| **Title** | Unverified user login behavior |
| **Priority** | P2 (Medium) |
| **Type** | Edge Case |

**Preconditions:**
- A user exists in Cognito but has NOT confirmed their email (`email_verified=false`)

**Note:** Cognito's `AdminInitiateAuth` with `ADMIN_NO_SRP_AUTH` may or may not succeed for unverified users depending on UserPool settings. This test documents the actual behavior.

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Create an unverified user via `AdminCreateUser` (no `AdminConfirmSignUp`) | User exists with `email_verified=false` |
| 2 | Navigate to `/login` | Login page loads |
| 3 | Enter unverified user credentials | Fields populate |
| 4 | Click "SIGN IN" | Observe behavior |

**Expected outcome (varies):**
- If Cognito blocks: error toast "Error signing in. Please try again."
- If Cognito allows: login succeeds (may need verification later)

**Code skeleton:**

```typescript
test("TC-LOGIN-007: Unverified user login behavior", async ({ page }) => {
  // This test is environment-dependent
  // Setup: create unverified user via cognito helper
  const unverifiedEmail = `e2e-unverified-${Date.now()}@eccs-test.com`;

  await page.goto("/login");
  await page.fill('input[name="email"]', unverifiedEmail);
  await page.fill('input[name="password"]', "TestPass123!");

  await page.click("button:has-text('SIGN IN')");

  // Either error toast or redirect — both are acceptable
  // Document the actual behavior
  const toastVisible = await page.locator("text=Error signing in").isVisible({ timeout: 5000 }).catch(() => false);
  const redirected = page.url().includes("/dashboard");

  // At least one should be true
  expect(toastVisible || redirected).toBeTruthy();
});
```

---

### 4.8 Login Redirect After Middleware Check

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-008 |
| **Title** | Unauthenticated user accessing protected page gets redirected to /login |
| **Priority** | P0 (Critical) |
| **Type** | Functional / Integration |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear all cookies | No cookies present |
| 2 | Navigate directly to `/student/dashboard` | Middleware redirects to `/login` |
| 3 | Navigate directly to `/teacher/dashboard` | Middleware redirects to `/login` |
| 4 | Login successfully | Redirect to appropriate dashboard |
| 5 | Navigate to `/student/dashboard` | Page loads (cookie present) |

**Code skeleton:**

```typescript
test("TC-LOGIN-008: Protected routes redirect to /login when unauthenticated", async ({ page }) => {
  await page.context().clearCookies();

  await page.goto("/student/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  await page.goto("/teacher/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});
```

---

### 4.9 Login Form UI Elements

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-009 |
| **Title** | Login page renders all expected UI elements |
| **Priority** | P2 (Medium) |
| **Type** | UI / Smoke |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | Page loads |
| 2 | Verify heading | "Sign in to Your Account" text visible |
| 3 | Verify email field | Email input with placeholder "example@example.com" |
| 4 | Verify password field | Password input with placeholder "***********" |
| 5 | Verify SIGN IN button | Button with text "SIGN IN" and arrow icon |
| 6 | Verify "New User? Create Account" link | Link text visible, href="/signup" |
| 7 | Verify "Forgot your password?" link | **Commented out in code** — NOT visible (known gap) |

**Code skeleton:**

```typescript
test("TC-LOGIN-009: Login page UI elements", async ({ page }) => {
  await page.goto("/login");

  await expect(page.locator("text=Sign in to Your Account")).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator("button:has-text('SIGN IN')")).toBeVisible();

  // "New User? Create Account" link
  await expect(page.locator("text=New User?")).toBeVisible();
  await expect(page.locator("text=Create Account")).toBeVisible();

  // Forgot password is commented out — verify it's NOT present
  const forgotLink = page.locator("text=Forgot your password");
  await expect(forgotLink).not.toBeVisible();
});
```

---

### 4.10 XSS Attempt in Login Fields

| Field | Value |
|---|---|
| **ID** | TC-LOGIN-010 |
| **Title** | XSS payload in login fields does not execute |
| **Priority** | P2 (Medium) |
| **Type** | Security |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | Login page loads |
| 2 | Enter `<script>alert('xss')</script>` in email field | Input accepted (no XSS execution) |
| 3 | Enter any password | Field shows input |
| 4 | Click "SIGN IN" | Yup validates email format — shows "Invalid email address" |
| 5 | No alert dialog appears | XSS did not execute |

**Code skeleton:**

```typescript
test("TC-LOGIN-010: XSS in login fields does not execute", async ({ page }) => {
  let dialogFired = false;
  page.on("dialog", () => { dialogFired = true; });

  await page.goto("/login");

  await page.fill('input[name="email"]', "<script>alert('xss')</script>");
  await page.fill('input[name="password"]', "TestPass123!");

  await page.click("button:has-text('SIGN IN')");

  // Wait a moment for any potential dialog
  await page.waitForTimeout(2000);
  expect(dialogFired).toBe(false);

  // Yup should show validation error
  await expect(page.locator("text=Invalid email address")).toBeVisible();
});
```

---

## 5. Implementation Approach

### 5.1 Fixtures

```typescript
// tests/fixtures/auth.fixture.ts
import { test as base } from "@playwright/test";

interface AuthFixtures {
  studentEmail: string;
  studentPassword: string;
  teacherEmail: string;
  teacherPassword: string;
}

export const test = base.extend<AuthFixtures>({
  studentEmail: [process.env.TEST_STUDENT_EMAIL!, { option: true }],
  studentPassword: [process.env.TEST_STUDENT_PASSWORD!, { option: true }],
  teacherEmail: [process.env.TEST_TEACHER_EMAIL!, { option: true }],
  teacherPassword: [process.env.TEST_TEACHER_PASSWORD!, { option: true }],
});

export { expect } from "@playwright/test";
```

### 5.2 Helper: Login via API (for setup)

```typescript
// tests/helpers/login.ts
import { Page } from "@playwright/test";

export async function loginAs(
  page: Page,
  email: string,
  password: string,
  expectedDashboard: string,
) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click("button:has-text('SIGN IN')");
  await page.waitForURL(new RegExp(expectedDashboard), { timeout: 15000 });
}
```

### 5.3 What to Test via Playwright

| Scenario | Why E2E |
|---|---|
| Happy path login (student + teacher) | Validates form, API call, cookie, redirect |
| Invalid credentials error | Validates toast display |
| Empty fields validation | Validates Formik/Yup behavior |
| Cookie structure | Validates complete auth flow |
| Protected route redirect | Validates middleware integration |

---

## 6. Directory Structure & Configuration

### 6.1 Folder Layout

```
tests/
├── fixtures/
│   └── auth.fixture.ts              # Shared auth fixtures
├── helpers/
│   ├── cognito.ts                   # Cognito SDK helpers
│   ├── cleanup.ts                   # Test user cleanup
│   └── login.ts                     # Login helper functions
├── login/
│   ├── student-login.spec.ts        # TC-LOGIN-001
│   ├── teacher-login.spec.ts        # TC-LOGIN-002
│   ├── invalid-credentials.spec.ts  # TC-LOGIN-003, 004
│   ├── form-validation.spec.ts      # TC-LOGIN-005
│   ├── cookie-structure.spec.ts     # TC-LOGIN-006
│   ├── unverified-user.spec.ts      # TC-LOGIN-007
│   ├── protected-routes.spec.ts     # TC-LOGIN-008
│   ├── ui-elements.spec.ts          # TC-LOGIN-009
│   └── xss-login.spec.ts           # TC-LOGIN-010
└── setup/
    └── global.setup.ts              # Seed users
```

### 6.2 Package.json Scripts

```json
{
  "scripts": {
    "test:e2e:login": "bunx playwright test --project=login",
    "test:e2e:login:debug": "bunx playwright test --project=login --debug"
  }
}
```

---

> **This plan should be saved to `specs/login-test-plan.md` and reviewed by the team before implementation.**
>
> Next steps:
> 1. Seed both teacher and confirmed student in global setup
> 2. Implement happy path tests first (TC-LOGIN-001, TC-LOGIN-002)
> 3. Add error handling tests (TC-LOGIN-003, TC-LOGIN-004)
> 4. Validate cookie structure (TC-LOGIN-006)
