# Student Registration — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Student signup flow via `/signup` page and `POST /api/auth/signup`
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
7. [CI/CD Considerations](#7-cicd-considerations)
8. [Cost Optimization](#8-cost-optimization)
9. [Appendices](#9-appendices)

---

## 1. Architecture Overview

### Registration Flow (simplified)

```
Browser (/signup)                    Next.js API Route                   AWS Cognito
┌─────────────────────┐    POST     ┌──────────────────────┐   SignUp    ┌────────────┐
│ SignupForm          │ ──────────► │ /api/auth/signup     │ ──────────► │ UserPool   │
│  - firstName        │             │ Lambda Handler       │             │ eccslabs   │
│  - lastName         │ ◄────────── │  auth.js → signup()  │ ◄────────── │            │
│  - email            │   201/400   │                      │             └────────────┘
│  - password         │             │ 1. Validate inputs   │                   │
│  - confirmPassword  │             │ 2. AdminGetUser       │  ListUsers        │
│                     │             │ 3. ListUsers(60)      │ ◄────────────────│
│ Redux signupSlice   │             │ 4. Filter teachers    │                   │
│  → signupUser thunk │             │ 5. SignUpCommand      │                   │
└─────────────────────┘             └──────────────────────┘                   │
                                                                  Email verification
                                                                  (CONFIRM_WITH_LINK)
```

### Key Dependencies

| Resource | Purpose | Stage isolation |
|---|---|---|
| Cognito UserPool (`eccslabs`) | User directory | Shared across stage? Check `sst.config.ts` — stage-based naming only for domain |
| Cognito Web Client | App client for auth flows | `{stage.}eccswebclient` |
| API Gateway V2 (`eccs`) | REST API | `{stage}-api.{domain}` |
| DynamoDB tables | Feedback, responses, case studies | Shared per stage |
| S3 | Case materials, certificates | Shared per stage |
| SES | Email verification | Uses Cognito's built-in email sending |

### Client-Side Password Requirements

- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (`!@#$%^&*`)

---

### Testability Requirements

The following `data-testid` attributes must be added to the signup page before implementing tests:

| data-testid | Element | Notes |
|---|---|---|
| `signup-firstname` | First name input | `input[name="firstName"]` |
| `signup-lastname` | Last name input | `input[name="lastName"]` |
| `signup-email` | Email input | `input[name="email"]` |
| `signup-password` | Password input | `input[name="password"]` |
| `signup-confirm-password` | Confirm password input | `input[name="confirmPassword"]` |
| `signup-submit` | "SIGN UP" submit button | `button` with text "SIGN UP" |
| `signup-password-hint-*` | Individual password requirement hint | e.g. `signup-password-hint-length`, `signup-password-hint-uppercase` |
| `signup-error-message` | Field-level validation error | Per-field error message |
| `signup-api-error` | Server error toast/message | e.g. "A user with this email already exists" |
| `signup-success-toast` | Success toast after registration | "Please check your email to finish registration." |

---

## 2. Test Environment Setup

### 2.1 Recommended Stage: `test-e2e`

Use a dedicated SST stage for E2E testing. This isolates test infrastructure from production, staging, and local development.

```bash
# Deploy the test-e2e stage
NEXT_PUBLIC_STAGE=test-e2e bunx sst deploy --stage test-e2e
```

**What gets created:**
- Cognito UserPool with `test-e2e.eccswebclient` app client
- API Gateway at `test-e2e-api.{domain}`
- DynamoDB tables with test-e2e prefix
- S3 buckets with test-e2e prefix
- CloudFront distribution for the Next.js frontend

**Stage naming convention** (from `infra/auth.ts`):
```
Production:  no prefix (eccswebclient)
Other:       {stage}.eccswebclient  (e.g., test-e2e.eccswebclient)
```

### 2.2 Environment Variables

Create a `.env.test-e2e` file (do NOT commit secrets):

```bash
# .env.test-e2e (local reference, keep .gitignored)
NEXT_PUBLIC_STAGE=test-e2e
NEXT_PUBLIC_REGION=us-east-2
NEXT_PUBLIC_BASE_URL=https://test-e2e-api.{domain}
NEXT_PUBLIC_NODE_ENV=test
NEXT_PUBLIC_DOMAIN={domain}
HASH_SECRET_KEY={same-as-other-stages}
AUTH_SECRET={same-as-other-stages}
AWS_ACCOUNT_ID={account-id}
```

The deployed frontend URL is `https://test-e2e.{domain}` (configured in `infra/client.ts`).

### 2.3 Installing Playwright

Playwright is NOT currently in `package.json`. Add it:

```bash
bun add -D @playwright/test
bunx playwright install chromium
```

### 2.4 Seeding a Teacher User

Student registration **requires** at least one teacher to exist in Cognito. Use the AWS SDK directly in a setup script:

```typescript
// tests/seed/teacher.seed.ts
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

const cognito = new CognitoIdentityProviderClient({ region: "us-east-2" });

export async function seedTeacher(stage: string) {
  const teacherEmail = `teacher-${stage}-${Date.now()}@eccs-test.com`;
  const teacherPassword = "TestTeacher123!";

  // Create the teacher user
  await cognito.send(new AdminCreateUserCommand({
    UserPoolId: Resource.eccslabs.id,
    Username: teacherEmail,
    TemporaryPassword: teacherPassword,
    UserAttributes: [
      { Name: "email", Value: teacherEmail },
      { Name: "email_verified", Value: "true" },
      { Name: "custom:firstName", Value: "Test" },
      { Name: "custom:lastName", Value: "Teacher" },
      { Name: "custom:user_role", Value: "teacher" },
    ],
    MessageAction: "SUPPRESS",  // Don't send invite email
  }));

  // Set permanent password (no Force Alias Creation issues)
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: Resource.eccslabs.id,
    Username: teacherEmail,
    Password: teacherPassword,
    Permanent: true,
  }));

  return { email: teacherEmail, password: teacherPassword };
}
```

> **Important**: This script runs inside `sst shell` context to access `Resource.eccslabs.id`. See [Section 5.2](#52-direct-api-testing-via-sst-shell).

### 2.5 Test Configuration File

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,       // Sequential to avoid Cognite collisions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,                 // Single worker to avoid race conditions on Cognito
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    // Base URL points to the deployed Next.js frontend
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://test-e2e.{domain}",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/*.setup.ts",
      // No retries for setup — fail fast
      retries: 0,
    },
    {
      name: "registration",
      dependencies: ["setup"],
      testMatch: "**/registration/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

## 3. Test Data Management

### 3.1 Unique Email Strategy

Cognito requires unique usernames (emails). Generate unique emails per test run:

```typescript
const TEST_PREFIX = `e2e-${Date.now()}`;
const STUDENT_EMAIL = `${TEST_PREFIX}-student-1@eccs-test.com`;
const TEACHER_EMAIL = `${TEST_PREFIX}-teacher-1@eccs-test.com`;
const DUPLICATE_EMAIL = `${TEST_PREFIX}-dup@eccs-test.com`;
```

Use the same prefix for the entire test run so cleanup can iterate all users matching the prefix.

### 3.2 Test Lifecycle

```
┌─────────────────────────────────────────────────┐
│                   GLOBAL SETUP                   │
│  - Check stage is deployed                      │
│  - Seed teacher user in Cognito                 │
│  - Store teacher credentials                    │
│  - Set environment variables                    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              TEST SUITE: REGISTRATION            │
│  ┌─────────────────────────────────────────────┐ │
│  │ 1. Successful signup (happy path)           │ │
│  │ 2. Duplicate email registration             │ │
│  │ 3. Missing required fields                  │ │
│  │ 4. Invalid email format                     │ │
│  │ 5. Weak password validation                 │ │
│  │ 6. Password mismatch                        │ │
│  │ 7. Registration without teacher seed        │ │
│  └─────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│                  GLOBAL TEARDOWN                 │
│  - Disable/delete created student users         │
│  - Remove seeded teacher user                   │
│  - (Optional) Destroy stage if CI ephemeral     │
└─────────────────────────────────────────────────┘
```

### 3.3 Cleanup Strategy

Use a helper that iterates Cognito users and removes those created during testing:

```typescript
// tests/helpers/cleanup.ts
import { CognitoIdentityProviderClient, ListUsersCommand, AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

export async function cleanupTestUsers(prefix: string) {
  const cognito = new CognitoIdentityProviderClient({ region: "us-east-2" });

  let paginationToken: string | undefined;
  do {
    const response = await cognito.send(new ListUsersCommand({
      UserPoolId: Resource.eccslabs.id,
      Limit: 60,
      PaginationToken: paginationToken,
    }));

    for (const user of response.Users || []) {
      if (user.Username?.startsWith(`e2e-`)) {
        await cognito.send(new AdminDeleteUserCommand({
          UserPoolId: Resource.eccslabs.id,
          Username: user.Username,
        }));
        console.log(`Deleted test user: ${user.Username}`);
      }
    }

    paginationToken = response.PaginationToken;
  } while (paginationToken);
}
```

> **Warning**: Cognito `AdminDeleteUserCommand` is irreversible. Always prefix test usernames with a distinctive marker like `e2e-`.

### 3.4 User Storage (Test Fixture)

Create a shared fixture for test-scoped data:

```typescript
// tests/fixtures/testUsers.ts
export interface TestUsers {
  teacherEmail: string;
  teacherPassword: string;
  studentEmail: string;
  studentPassword: string;
}

export function generateTestUsers(): TestUsers {
  const ts = Date.now();
  return {
    teacherEmail: `e2e-teacher-${ts}@eccs-test.com`,
    teacherPassword: "TestTeacherPass1!",
    studentEmail: `e2e-student-${ts}@eccs-test.com`,
    studentPassword: "TestStudentPass1!",
  };
}
```

---

## 4. Test Scenarios

### 4.1 Happy Path: Successful Student Registration

| Field | Value |
|---|---|
| **ID** | TC-REG-001 |
| **Title** | Student registers with valid data and sees success toast |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A teacher user exists in Cognito (seeded by global setup)
- Test stage `test-e2e` is deployed and accessible
- No student with the test email exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `{baseURL}/signup` | Signup page loads with empty form fields and disabled "SIGN UP" button |
| 2 | Enter first name `"Jane"` | First name field shows input |
| 3 | Enter last name `"Doe"` | Last name field shows input |
| 4 | Enter email `e2e-student-{ts}@eccs-test.com` | Email field shows input |
| 5 | Enter password `"TestPass123!"` | Password validation hints appear; all 5 turn green |
| 6 | Enter confirm password `"TestPass123!"` | Confirm password matches |
| 7 | Click "SIGN UP" button | Button is enabled; form submits |

**Expected outcome:**
- Toast message: "Please check your email to finish registration."
- URL changes to `{baseURL}/login`
- Cognito user is created with `custom:user_role=student` and `custom:teacherId` assigned

**Success criteria:**
- ✅ Status code 201 from API
- ✅ Toast with email verification message displayed
- ✅ Redirect to `/login`
- ✅ User exists in Cognito with correct attributes
- ✅ `custom:teacherId` equals the seeded teacher's username

**Failure conditions:**
- ❌ Form doesn't submit (client-side validation blocks)
- ❌ API returns error (check network tab)
- ❌ No redirect after success
- ❌ Teacher ID not assigned

**Code skeleton:**

```typescript
// tests/registration/happy-path.spec.ts
import { test, expect } from "@playwright/test";
import { generateTestUsers } from "../fixtures/testUsers";

test.describe("Student Registration - Happy Path", () => {
  const users = generateTestUsers();

  test("TC-REG-001: Successful student signup with valid data", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("button:has-text('SIGN UP')")).toBeDisabled();

    await page.fill('input[name="firstName"]', "Jane");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="email"]', users.studentEmail);
    await page.fill('input[name="password"]', users.studentPassword);
    await page.fill('input[name="confirmPassword"]', users.studentPassword);

    // Verify password hints all green
    await expect(page.locator("text=At least 8 characters")).toHaveClass(/text-green-600/);
    await expect(page.locator("text=At least one special character")).toHaveClass(/text-green-600/);

    await page.click("button:has-text('SIGN UP')");

    // Wait for success toast
    await expect(page.locator("text=Please check your email to finish registration."))
      .toBeVisible({ timeout: 15000 });

    // Verify redirect
    await expect(page).toHaveURL(/\/login/);
  });
});
```

---

### 4.2 Duplicate Email Registration

| Field | Value |
|---|---|
| **ID** | TC-REG-002 |
| **Title** | Registration with an already-registered email returns error |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Preconditions:**
- A teacher exists in Cognito
- A student with email `e2e-student-dup-{ts}@eccs-test.com` already exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/signup` | Form loads |
| 2 | Fill all fields with valid data using an email that already exists | Fields populate |
| 3 | Click "SIGN UP" | Form submits to API |
| 4 | API returns 400 `{"message":"A user with this email already exists."}` | Error is displayed on page |

**Expected outcome:**
- Toast or inline error: "A user with this email already exists."
- User remains on `/signup` page (no redirect)

**Code skeleton:**

```typescript
test("TC-REG-002: Duplicate email shows error message", async ({ page }) => {
  const users = generateTestUsers();

  // First registration
  await page.goto("/signup");
  await page.fill('input[name="firstName"]', "Jane");
  await page.fill('input[name="lastName"]', "Doe");
  await page.fill('input[name="email"]', users.studentEmail);
  await page.fill('input[name="password"]', users.studentPassword);
  await page.fill('input[name="confirmPassword"]', users.studentPassword);
  await page.click("button:has-text('SIGN UP')");
  await expect(page.locator("text=Please check your email")).toBeVisible({ timeout: 15000 });

  // Second registration with same email
  await page.goto("/signup");
  await page.fill('input[name="firstName"]', "Jane");
  await page.fill('input[name="lastName"]', "Doe");
  await page.fill('input[name="email"]', users.studentEmail);
  await page.fill('input[name="password"]', "DiffPass123!");
  await page.fill('input[name="confirmPassword"]', "DiffPass123!");
  await page.click("button:has-text('SIGN UP')");

  // Expect error
  await expect(page.locator("text=A user with this email already exists"))
    .toBeVisible({ timeout: 10000 });
});
```

---

### 4.3 Missing Required Fields

| Field | Value |
|---|---|
| **ID** | TC-REG-003 |
| **Title** | Registration with missing required fields is blocked client-side |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/signup` with all fields empty | "SIGN UP" button is disabled |
| 2 | Fill only firstName, leave lastName empty | Button remains disabled |
| 3 | Fill only email, leave password empty | Button remains disabled |
| 4 | Fill only password, leave confirmPassword empty | Button remains disabled |
| 5 | Fill only confirmPassword, leave password empty | Button remains disabled (because password validation fails) |

**Expected outcome:**
- "SIGN UP" button remains `disabled` (check for `disabled` attribute or `pointer-events-none` class)
- Form cannot be submitted

**Code skeleton:**

```typescript
test("TC-REG-003: Missing fields prevent form submission", async ({ page }) => {
  await page.goto("/signup");

  // All fields empty — button is disabled
  await expect(page.locator("button:has-text('SIGN UP')")).toBeDisabled();

  // Fill only name fields
  await page.fill('input[name="firstName"]', "Jane");
  await page.fill('input[name="lastName"]', "Doe");
  await expect(page.locator("button:has-text('SIGN UP')")).toBeDisabled();

  // Add email only
  await page.fill('input[name="email"]', "jane@test.com");
  await expect(page.locator("button:has-text('SIGN UP')")).toBeDisabled();

  // Add password (not meeting all requirements)
  await page.fill('input[name="password"]', "weak");
  await expect(page.locator("button:has-text('SIGN UP')")).toBeDisabled();
});
```

---

### 4.4 Invalid Email Format

| Field | Value |
|---|---|
| **ID** | TC-REG-004 |
| **Title** | Registration with malformed email passes client but gets rejected by API |
| **Priority** | P2 (Medium) |
| **Type** | Negative / Edge Case |

> **Note**: The client-side form has `type="email"` on the email input, which provides basic browser validation. However, the TODO in `form.tsx` says "ADD EMAIL VALIDATION USING ZOD!!!!!" — meaning programmatic validation may be missing. The API does NOT validate email format (only checks it's a string). This could be a bug.

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/signup` | Form loads |
| 2 | Fill all fields with email `"not-an-email"` | (Depends on browser validation via `type="email"`) |
| 3 | Try submitting | If browser blocks: form not submitted; if not: email is accepted |

**Expected outcome variation:**
- Browser with `type="email"`: form submission blocked natively
- If browser doesn't enforce: API accepts it (server only checks `typeof email === "string"`)

**Code skeleton:**

```typescript
test("TC-REG-004: Invalid email format", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('input[name="firstName"]', "Jane");
  await page.fill('input[name="lastName"]', "Doe");

  // Try an obviously invalid email
  await page.fill('input[name="email"]', "not-an-email");
  await page.fill('input[name="password"]', "ValidPass123!");
  await page.fill('input[name="confirmPassword"]', "ValidPass123!");

  // Test with an email missing @ symbol
  // Browser may prevent submission due to type="email"
  const isDisabled = await page.locator("button:has-text('SIGN UP')").isDisabled();
  if (!isDisabled) {
    await page.click("button:has-text('SIGN UP')");
    // If it submits, API will accept it (potential bug)
    console.log("WARNING: Invalid email was accepted by client — server does not validate email format");
  }
});
```

---

### 4.5 Weak Password Validation

| Field | Value |
|---|---|
| **ID** | TC-REG-005 |
| **Title** | Passwords not meeting requirements show validation hints and block submission |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/signup`, enter all fields, type a short password `"Ab1!"` | Password hint "At least 8 characters" shows red |
| 2 | Type `"abcdefgh"` | Hints: uppercase (red), number (red), special (red) |
| 3 | Type `"ABCDEFGH"` | Hints: lowercase (red), number (red), special (red) |
| 4 | Type `"ABCDefgh"` | Hints: number (red), special (red) |
| 5 | Type `"ABCDef12"` | Hints: special (red) |
| 6 | Type `"TestPass123!"` | All 5 hints green |

**Expected outcome:**
- Button enabled only when all 5 requirements are met **AND** confirmPassword matches
- Each requirement shows green/red state dynamically as user types

**Code skeleton:**

```typescript
test("TC-REG-005: Password requirements validate in real-time", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('input[name="firstName"]', "Jane");
  await page.fill('input[name="lastName"]', "Doe");
  await page.fill('input[name="email"]', "jane@test.com");

  const passwordInput = page.locator('input[name="password"]');

  // Test too short
  await passwordInput.fill("Ab1!");
  await expect(page.locator("text=At least 8 characters")).toHaveClass(/text-red-600/);

  // Test missing uppercase
  await passwordInput.fill("abcdefgh1!");
  await expect(page.locator("text=At least one uppercase letter")).toHaveClass(/text-red-600/);

  // Test missing special char
  await passwordInput.fill("Abcdefgh1");
  await expect(page.locator("text=At least one special character")).toHaveClass(/text-red-600/);

  // Test valid password — all green
  await passwordInput.fill("TestPass123!");
  await expect(page.locator("text=At least 8 characters")).toHaveClass(/text-green-600/);
  await expect(page.locator("text=At least one uppercase letter")).toHaveClass(/text-green-600/);
  await expect(page.locator("text=At least one lowercase letter")).toHaveClass(/text-green-600/);
  await expect(page.locator("text=At least one number")).toHaveClass(/text-green-600/);
  await expect(page.locator("text=At least one special character")).toHaveClass(/text-green-600/);
});
```

---

### 4.6 Password Mismatch

| Field | Value |
|---|---|
| **ID** | TC-REG-006 |
| **Title** | Password and confirm password do not match — error toast shown |
| **Priority** | P1 (High) |
| **Type** | Negative / Validation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/signup`, fill all fields | Button disabled until confirm matches |
| 2 | Enter password `"TestPass123!"`, confirm `"TestPass456!"` | Button remains disabled |
| 3 | Click "SIGN UP" (if enabled by bug) — or notice button is disabled | Toast "Passwords do not match" (shown by form handler) |

**Expected outcome:**
- Toast error: "Passwords do not match"
- Form is NOT submitted
- User stays on signup page

**Code skeleton:**

```typescript
test("TC-REG-006: Password mismatch shows error", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('input[name="firstName"]', "Jane");
  await page.fill('input[name="lastName"]', "Doe");
  await page.fill('input[name="email"]', "jane@test.com");

  // Valid password for requirements, but different confirm
  await page.fill('input[name="password"]', "TestPass123!");
  await page.fill('input[name="confirmPassword"]', "DifferentPass1!");

  // Button should be disabled (isFormValid checks match)
  // If button somehow becomes enabled, clicking should show toast
  const isDisabled = await page.locator("button:has-text('SIGN UP')").isDisabled();
  if (!isDisabled) {
    await page.click("button:has-text('SIGN UP')");
    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  }
});
```

---

### 4.7 Registration Without a Teacher

| Field | Value |
|---|---|
| **ID** | TC-REG-007 |
| **Title** | Student registration fails when no teacher exists in Cognito |
| **Priority** | P1 (High) |
| **Type** | Negative / Edge Case |

**Preconditions:**
- No Cognito users with `custom:user_role=teacher` exist
- (This is hard to guarantee in shared environment — skip or run on isolated stage)

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Ensure no teacher exists in Cognito user pool | — |
| 2 | Submit valid student registration | API returns 400: `{"error": "No teacher found in the system."}` |
| 3 | User sees error message | Error displayed on page |

**Expected outcome:**
- 400 response from API
- Error message: "No teacher found in the system."

**Note**: This test requires a stage with no teacher seeded, or temporary deletion of the teacher. Run only when you control the stage completely. Alternatively, use `sst shell` to call the Lambda directly.

**Code skeleton (direct API test):**

```typescript
test("TC-REG-007: No teacher blocks registration", async ({ page }) => {
  // This test is environment-dependent. Skip if teacher exists.
  test.skip(!process.env.SKIP_TEACHER_CHECK, "Requires stage without teacher");

  await page.goto("/signup");
  await page.fill('input[name="firstName"]', "Jane");
  await page.fill('input[name="lastName"]', "Doe");
  await page.fill('input[name="email"]', `e2e-noteacher-${Date.now()}@eccs-test.com`);
  await page.fill('input[name="password"]', "TestPass123!");
  await page.fill('input[name="confirmPassword"]', "TestPass123!");
  await page.click("button:has-text('SIGN UP')");

  await expect(page.locator("text=No teacher found in the system"))
    .toBeVisible({ timeout: 15000 });
});
```

---

### 4.8 Rapid Sequential Registration

| Field | Value |
|---|---|
| **ID** | TC-REG-008 |
| **Title** | Rapid sequential signup attempts are handled gracefully |
| **Priority** | P2 (Medium) |
| **Type** | Load / Edge Case |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit signup requests for 3 different emails in rapid succession (via API) | All 3 return 201 or rate-limiting errors |
| 2 | Verify each user was created (or rate-limited) | No server crash, no 5xx |

**Code skeleton:**

```typescript
test("TC-REG-008: Rapid sequential registrations", async ({ page }) => {
  // This is better tested via direct API calls (see Section 5.2)
  // Using Playwright page for 3 rapid sequential attempts
  const emails = Array.from({ length: 3 }, (_, i) => `e2e-rapid-${Date.now()}-${i}@eccs-test.com`);

  for (const email of emails) {
    await page.goto("/signup");
    await page.fill('input[name="firstName"]', "Rapid");
    await page.fill('input[name="lastName"]', "Test");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "TestPass123!");
    await page.fill('input[name="confirmPassword"]', "TestPass123!");
    await page.click("button:has-text('SIGN UP')");

    // Check success or rate limit message
    await expect(page.locator("text=Please check your email").or(page.locator("text=try again")))
      .toBeVisible({ timeout: 10000 });
  }
});
```

---

### 4.9 XSS and Injection Attempts

| Field | Value |
|---|---|
| **ID** | TC-REG-009 |
| **Title** | XSS attempts in name fields are stored safely |
| **Priority** | P2 (Medium) |
| **Type** | Security |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Fill firstName with `<script>alert('xss')</script>` | Form submits if password is valid |
| 2 | Check user created in Cognito | Attributes stored as literal string (no script execution) |

**Code skeleton:**

```typescript
test("TC-REG-009: XSS in name fields", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('input[name="firstName"]', "<script>alert('xss')</script>");
  await page.fill('input[name="lastName"]', "Test");
  await page.fill('input[name="email"]', `e2e-xss-${Date.now()}@eccs-test.com`);
  await page.fill('input[name="password"]', "TestPass123!");
  await page.fill('input[name="confirmPassword"]', "TestPass123!");
  await page.click("button:has-text('SIGN UP')");

  await expect(page.locator("text=Please check your email")).toBeVisible({ timeout: 15000 });
});
```

---

### 4.10 Email Verification (Edge Case)

| Field | Value |
|---|---|
| **ID** | TC-REG-010 |
| **Title** | Email verification link works (manual / partial automation) |
| **Priority** | P3 (Low) |
| **Type** | Edge Case |

**Challenge**: Cognito sends the verification email via SES. Capturing the confirmation link programmatically requires either:
- Access to the recipient's email inbox (hard in E2E)
- Using a mail-catch service like Mailtrap, Mailosaur, or SES rule to S3

**Alternative approaches (from easiest to hardest):**

| Approach | Description | Effort |
|---|---|---|
| **A. Skip E2E** | Verify via direct Cognito `AdminConfirmSignUp` call after signup | Minimal |
| **B. Mailosaur** | Use Mailosaur's disposable email API to read the verification email | Medium |
| **C. SES Rule Set** | Create SES receipt rule to save verification emails to S3, read from S3 in test | High |

**Recommendation**: Skip full E2E verification testing. Use approach A — `AdminConfirmSignUp` — to simulate verification for downstream tests (login, case studies).

```typescript
// tests/helpers/confirmUser.ts
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

export async function confirmUser(email: string) {
  const cognito = new CognitoIdentityProviderClient({ region: "us-east-2" });
  await cognito.send(new AdminConfirmSignUpCommand({
    UserPoolId: Resource.eccslabs.id,
    Username: email,
  }));
}
```

---

## 5. Implementation Approach

### 5.1 What to Test via Playwright (Full E2E)

Test the complete user-facing flow:

| Scenario | Why E2E |
|---|---|
| Happy path signup | Validates form, Redux, toast, redirect |
| Duplicate email | Validates error display in UI |
| Password mismatch | Validates client-side toast |
| Missing fields | Validates button disabled state |
| Weak password | Validates real-time validation hints |
| XSS injection | Validates safe server-side storage |

### 5.2 What to Test via Direct API Calls (Faster, Cheaper)

Test server-side logic directly without browser overhead:

| Scenario | Why API |
|---|---|
| Validation error messages | Test each field independently |
| Missing teacher response | No browser setup needed |
| Rate limiting / rapid requests | No page navigation overhead |
| Email verification flow | Call `AdminConfirmSignUp` + signin |

Use `sst shell` to run API tests with access to `Resource` bindings:

```bash
# Run a script that has access to SST Resource bindings
bunx sst shell --stage test-e2e bun --eval '
  import { signup } from "./tests/api/signup.api-test.ts";
  await signup();
'
```

**Suggested file structure for API tests:**

```typescript
// tests/api/signup.api-test.ts
import { Resource } from "sst";
import { CognitoIdentityProviderClient, SignUpCommand, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({ region: "us-east-2" });
const stagePrefix = Resource.App.stage === "production" ? "" : `${Resource.App.stage}.`;
const clientId = Resource[`${stagePrefix}eccswebclient` as any].id;

export async function directSignup(email: string, password: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Test",
      lastName: "User",
      email,
      password,
      user_role: "student",
    }),
  });
  return { status: response.status, body: await response.json() };
}
```

### 5.3 Test Pyramid Decision

```
          ╱  Full E2E Flow (Playwright)  ╲        ← Happy path, duplicate
         ╱    Signup → Toast → Redirect     ╲
        ╱   ─────────────────────────────      ╲
       ╱     API Tests (direct HTTP)           ╲   ← Validation errors,
      ╱      Against deployed API Gateway        ╲    missing teacher,
     ╱      ─────────────────────────────         ╲    rapid signups
    ╱        SDK Tests (sst shell)                ╲   ← Seed teacher,
   ╱         Direct Cognito calls                  ╲    confirm user,
  ╱          ─────────────────────────────          ╲  cleanup
╱                                                        ╲
────────────────────────────────────────────────────────────
```

| Layer | Tool | Speed | Cost | Coverage |
|---|---|---|---|---|
| SDK (sst shell) | `bun run` | Instant | Free | Data setup/teardown |
| API (HTTP) | Playwright APIRequestContext | Fast | ~0 | Server validation |
| E2E (Browser) | Playwright page | Slow | ~0 | UI flow, toasts |

---

## 6. Directory Structure & Configuration

### 6.1 Folder Layout

```
tests/
├── fixtures/
│   └── testUsers.ts                 # Generate unique test emails
├── helpers/
│   ├── cognito.ts                   # Cognito SDK helpers (seed, confirm, delete)
│   └── cleanup.ts                   # Test user cleanup
├── api/
│   ├── signup.api-test.ts           # Direct API test functions
│   └── signup.api.spec.ts           # Playwright APIRequest tests
├── registration/
│   ├── happy-path.spec.ts           # TC-REG-001
│   ├── duplicate-email.spec.ts      # TC-REG-002
│   ├── missing-fields.spec.ts       # TC-REG-003
│   ├── invalid-email.spec.ts        # TC-REG-004
│   ├── weak-password.spec.ts        # TC-REG-005
│   ├── password-mismatch.spec.ts    # TC-REG-006
│   ├── no-teacher.spec.ts           # TC-REG-007
│   ├── rapid-signups.spec.ts        # TC-REG-008
│   └── xss-injection.spec.ts        # TC-REG-009
├── setup/
│   ├── global.setup.ts              # Run once: seed teacher, verify deployment
│   └── global.teardown.ts           # Run once: cleanup test users
└── utils/
    └── stage.ts                     # Stage name helpers
```

Create the directories:

```bash
mkdir -p tests/{fixtures,helpers,api,registration,setup,utils}
```

### 6.2 Playwright Config (Full)

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import path from "path";

export const STAGE = process.env.PLAYWRIGHT_STAGE || "test-e2e";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
    ...(process.env.CI ? [["github"]] : []),
  ],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `https://${STAGE}.${process.env.NEXT_PUBLIC_DOMAIN}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  globalSetup: require.resolve("./tests/setup/global.setup.ts"),
  globalTeardown: require.resolve("./tests/setup/global.teardown.ts"),

  projects: [
    {
      name: "registration",
      testMatch: "**/registration/**/*.spec.ts",
    },
  ],
});
```

### 6.3 Global Setup

```typescript
// tests/setup/global.setup.ts
import { FullConfig } from "@playwright/test";
import { seedTeacher } from "../helpers/cognito";

async function globalSetup(config: FullConfig) {
  console.log("🌱 Seeding teacher user...");
  const teacher = await seedTeacher();
  process.env.TEACHER_EMAIL = teacher.email;
  process.env.TEACHER_PASSWORD = teacher.password;
  console.log(`✅ Teacher seeded: ${teacher.email}`);
}

export default globalSetup;
```

### 6.4 Global Teardown

```typescript
// tests/setup/global.teardown.ts
import { FullConfig } from "@playwright/test";
import { cleanupTestUsers } from "../helpers/cleanup";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Cleaning up test users...");
  await cleanupTestUsers("e2e-");
  console.log("✅ Cleanup complete");
}

export default globalTeardown;
```

### 6.5 Cognito Helpers

```typescript
// tests/helpers/cognito.ts
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AdminConfirmSignUpCommand,
  ListUsersCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

const cognito = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION || "us-east-2" });

export function getClientId(): string {
  const stage = process.env.PLAYWRIGHT_STAGE || "test-e2e";
  const clientName = stage === "production" ? "eccswebclient" : `${stage}.eccswebclient`;
  return (Resource as any)[clientName]?.id;
}

export async function seedTeacher() {
  const email = `e2e-teacher-${Date.now()}@eccs-test.com`;
  const password = "TestTeacherPass1!";

  await cognito.send(new AdminCreateUserCommand({
    UserPoolId: Resource.eccslabs.id,
    Username: email,
    TemporaryPassword: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" },
      { Name: "custom:firstName", Value: "Test" },
      { Name: "custom:lastName", Value: "Teacher" },
      { Name: "custom:user_role", Value: "teacher" },
    ],
    MessageAction: "SUPPRESS",
  }));

  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: Resource.eccslabs.id,
    Username: email,
    Password: password,
    Permanent: true,
  }));

  return { email, password };
}

export async function deleteUser(email: string) {
  try {
    await cognito.send(new AdminDeleteUserCommand({
      UserPoolId: Resource.eccslabs.id,
      Username: email,
    }));
  } catch (e) {
    console.warn(`Could not delete ${email}:`, (e as Error).message);
  }
}

export async function confirmUser(email: string) {
  await cognito.send(new AdminConfirmSignUpCommand({
    UserPoolId: Resource.eccslabs.id,
    Username: email,
  }));
}
```

### 6.6 Package.json Additions

Add to `devDependencies`:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "playwright": "^1.52.0",
    ...
  },
  "scripts": {
    "test:e2e": "bunx playwright test --project=registration",
    "test:e2e:api": "bunx playwright test --project=api-tests",
    "test:e2e:all": "bunx playwright test",
    "test:e2e:ui": "bunx playwright test --ui",
    "test:e2e:setup": "bunx sst shell --stage test-e2e bun tests/setup/global.setup.ts",
    "test:e2e:stage": "bunx sst deploy --stage test-e2e",
    "test:e2e:destroy": "bunx sst remove --stage test-e2e"
  }
}
```

### 6.7 Playwright Test Runner Script

```bash
#!/usr/bin/env bash
# scripts/run-e2e.sh — Full E2E test pipeline
set -euo pipefail

STAGE="${1:-test-e2e}"
echo "=== Deploying stage: $STAGE ==="
bunx sst deploy --stage "$STAGE"

echo "=== Running E2E tests ==="
PLAYWRIGHT_STAGE="$STAGE" bunx playwright test

echo "=== Cleaning up stage ==="
bunx sst remove --stage "$STAGE"
```

---

## 7. CI/CD Considerations

### 7.1 CI Workflow for E2E Tests

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests (Registration)

on:
  pull_request:
    branches: [staging, main]
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

env:
  AWS_REGION: us-east-2
  PLAYWRIGHT_STAGE: test-e2e-${{ github.sha }}

jobs:
  e2e:
    environment: staging
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: oven-sh/setup-bun@v2

      - uses: actions/checkout@v6

      - name: Install dependencies
        run: bun install

      - name: Install Playwright browsers
        run: bunx playwright install chromium

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/gh-actions-deployment
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy test stage
        run: bunx sst deploy --stage $PLAYWRIGHT_STAGE
        env:
          NEXT_PUBLIC_DOMAIN: ${{ secrets.NEXT_PUBLIC_DOMAIN }}
          NEXT_PUBLIC_BASE_URL: ${{ secrets.NEXT_PUBLIC_BASE_URL }}
          HASH_SECRET_KEY: ${{ secrets.HASH_SECRET_KEY }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}

      - name: Run Playwright tests
        run: bunx playwright test
        env:
          PLAYWRIGHT_BASE_URL: https://$PLAYWRIGHT_STAGE.${{ secrets.NEXT_PUBLIC_DOMAIN }}

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ github.sha }}
          path: playwright-report/
          retention-days: 7

      - name: Destroy test stage
        if: always()
        run: bunx sst remove --stage $PLAYWRIGHT_STAGE
        env:
          NEXT_PUBLIC_DOMAIN: ${{ secrets.NEXT_PUBLIC_DOMAIN }}
```

### 7.2 Stage Lifecycle in CI

```
PR opened/updated
  │
  ▼
Deploy: sst deploy --stage test-e2e-{sha}
  │
  ▼
Seed teacher → Run E2E tests → Collect artifacts
  │
  ▼
Destroy: sst remove --stage test-e2e-{sha}   (always, even on failure)
```

**Stage naming**: `test-e2e-{commit-sha}` ensures uniqueness per CI run. SST's `removal: "remove"` for non-production stages means all resources are cleaned up on `sst remove`.

### 7.3 Cost Control in CI

| Strategy | Implementation |
|---|---|
| **Ephemeral stages** | Each CI run gets its own stage (`test-e2e-{sha}`) |
| **Auto-destroy** | `sst remove` in `if: always()` block |
| **Guard against orphaned stages** | GitHub Actions retention rules → cron job that deletes stages older than N days |
| **Minimize test data** | Create 1 teacher + 3-5 students per run |
| **Parallel worker limit** | Playwright `workers: 1` to avoid Cognito race conditions |

---

## 8. Cost Optimization

### 8.1 Cognito Costs

Cognito pricing (as of 2026):
- **MAU (Monthly Active Users)**: First 50,000 MAU free
- Test creates ~10 users per run × N runs → negligible cost

**Recommendations:**
- Use `AdminCreateUser` with `MessageAction: "SUPPRESS"` to avoid SES email costs
- Delete test users immediately after test run — they are MAU if they sign in
- Use a shared stage (`test-e2e`) for local development, ephemeral stages for CI

### 8.2 SST Infrastructure Costs

| Resource | Estimated monthly cost | Notes |
|---|---|---|
| Cognito UserPool | Free | No cost per pool |
| API Gateway V2 | ~$1/month | Pay per request |
| DynamoDB (on-demand) | ~$1/month | Minimal usage |
| S3 | < $0.10/month | Tiny data volume |
| CloudFront | ~$0.50/month | Data transfer |
| **Total (test stage)** | **~$3-5/month** | If left running |

**Savings tips:**
- Destroy the stage when not in use: `bunx sst remove --stage test-e2e`
- For local testing, use `sst shell` to invoke Lambda functions directly — no infrastructure needed beyond the deployed stage
- DynamoDB on-demand is cost-effective for test workloads

### 8.3 Minimizing User Creation

| Test | Users needed | Reuse strategy |
|---|---|---|
| Teacher seed | 1 teacher | Created once in global setup |
| Happy path | 1 student | Create and delete per test |
| Duplicate email | 1 reused student | Create in setup, use in test |
| No teacher | 1 student | Require isolated stage |
| Rapid signups | 3 students | Bulk creation & cleanup |

**Optimization**: For the duplicate email test, create the duplicate user during `test.beforeAll()` and delete in `test.afterAll()`.

---

## 9. Appendices

### A. Known Issues / Risks

| Issue | Impact | Mitigation |
|---|---|---|
| Server doesn't validate email format | Invalid emails accepted | Add TODO: server-side email validation |
| `ListUsersCommand` limit of 60 | If >60 users, teacher may not be found | Track teacher ID at signup time |
| Cognito rate limiting | Tests may be throttled | Add retry logic with backoff |
| Shared Cognito pool for dev + tests | Cross-contamination | Use `custom:user_role` filtering |
| SES email for each signup | Costs, spam concerns | `AdminConfirmSignUp` instead |

### B. Useful SST Commands

```bash
# Get info about the current stage
bunx sst info --stage test-e2e

# Open SST console for debugging
bunx sst console --stage test-e2e

# Run a script with Resource bindings
bunx sst shell --stage test-e2e bun script.ts

# View logs for a function
bunx sst shell --stage test-e2e --target=server/controllers/auth.signup

# Remove the entire test stage
bunx sst remove --stage test-e2e
```

### C. Test Data Flow

```
Global Setup
  │
  ├─ seedTeacher() → Cognito: AdminCreateUser (teacher@eccs-test.com)
  │
  ▼
TC-REG-001: signup POST /api/auth/signup {email: student@..., user_role: "student"}
  │
  ├─ Cognito: ListUsers → filter custom:user_role=teacher
  ├─ Cognito: SignUp (with custom:teacherId = teacher's Username)
  │
  ▼
TC-REG-002: signup POST same email again
  │
  ├─ Cognito: AdminGetUser → user exists
  └─ Response: 400 "A user with this email already exists."
  │
  ▼
Global Teardown
  │
  ├─ Cognito: ListUsers → filter by e2e- prefix
  └─ Cognito: AdminDeleteUser (each matched user)
```

### D. Playwright MCP Commands (from opencode.json)

The project already has Playwright MCP tooling configured:

| MCP Agent | Purpose | Invocation |
|---|---|---|
| `playwright-test-planner` | Create test plans | `planner_setup_page`, `planner_save_plan` |
| `playwright-test-generator` | Generate test code | Browser automation, `generator_write_test` |
| `playwright-test-healer` | Debug failing tests | `test_run`, `test_debug`, network intercept |

Use these agents via the OpenCode MCP infrastructure for rapid test development.

### E. Security Considerations

- Test users use a distinctive `e2e-` prefix for easy identification and cleanup
- Suppress verification emails during test seeding to avoid spam
- Never use real personal data in test fixtures
- Test emails use `eccs-test.com` domain (not registered — avoids accidental email sends)
- Delete test users from Cognito after run (SES may attempt delivery otherwise)
- Run tests in a dedicated AWS account or use strict IAM policies to limit blast radius

---

> **This plan should be saved to `specs/student-registration-test-plan.md` and reviewed by the team before implementation.**
>
> Next steps:
> 1. Install Playwright: `bun add -D @playwright/test && bunx playwright install chromium`
> 2. Create test directory structure: `mkdir -p tests/{fixtures,helpers,api,registration,setup,utils}`
> 3. Create global setup/teardown with Cognito seed and cleanup
> 4. Implement test cases starting with happy path (TC-REG-001)
> 5. Run against `test-e2e` stage: `bunx sst deploy --stage test-e2e && bunx playwright test`
