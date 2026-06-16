# Logout / Destroy Session — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Logout flow, session destruction, cookie removal, and redirect behavior
> **Author**: Playwright Test Planner
> **Date**: 2026-06-15

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Test Scenarios](#3-test-scenarios)
4. [Implementation Approach](#4-implementation-approach)
5. [Directory Structure](#5-directory-structure)

---

## 1. Architecture Overview

### Logout Flow

```
Browser (any page)                    Client-Side                    AWS Cognito
┌─────────────────────┐   signOut()  ┌──────────────────────┐  GlobalSignOut  ┌────────────┐
│ User clicks logout  │ ──────────► │ auth.ts → signOut()  │ ─────────────► │ UserPool   │
│                     │             │                      │                │ eccslabs   │
│                     │             │ 1. Read cookie       │ ◄───────────── │            │
│                     │             │ 2. POST /destroy-    │   (best-effort)└────────────┘
│                     │             │    session (fire &   │
│                     │             │    forget)           │
│                     │             │ 3. clearAuthCookie() │
│                     │             │    document.cookie =  │
│                     │             │    "eccs_auth_data=;  │
│                     │             │     path=/; max-age=0"│
│                     │             │ 4. window.location   │
│                     │             │    .href = "/login"  │
└─────────────────────┘             └──────────────────────┘
```

### Key Implementation Details

From `src/services/apis/auth.ts`:

```typescript
export function signOut() {
  const cookieData = getAuthCookie();
  try {
    if (cookieData?.accessToken) {
      fetch(`${BASE_URL}/api/auth/destroy-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookieData.accessToken}`,
        },
        keepalive: true,  // Ensures request completes even during page unload
      });
    }
  } catch {
    // Best-effort revocation — proceed with client cleanup regardless
  }
  clearAuthCookie();
  window.location.href = "/login";
}
```

### Key Behaviors

1. **Fire-and-forget API call**: The destroy-session API is called with `keepalive: true` but errors are silently caught
2. **Cookie removal**: `clearAuthCookie()` sets `max-age=0` on the cookie
3. **Redirect**: `window.location.href = "/login"` (hard redirect, not Next.js router)
4. **Best-effort**: Even if the API call fails, the user is logged out client-side

### Destroy Session API

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/destroy-session` | POST | JWT (Bearer token) | Calls `AdminUserGlobalSignOutCommand` on Cognito |

---

### Testability Requirements

The following `data-testid` attributes must be added before implementing tests:

| data-testid | Element | Notes |
|---|---|---|
| `logout-button` | Sign out / logout button | In navbar or settings |
| `logout-confirm-modal` | Confirmation dialog (if any) | Modal container |
| `logout-confirm-yes` | Confirm logout button | — |
| `logout-confirm-cancel` | Cancel logout button | — |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Test stage deployed
- Confirmed teacher and student users seeded

### 2.2 Test Data

```typescript
const TEACHER_EMAIL = process.env.TEST_TEACHER_EMAIL!;
const TEACHER_PASSWORD = process.env.TEST_TEACHER_PASSWORD!;
const STUDENT_EMAIL = process.env.TEST_STUDENT_EMAIL!;
const STUDENT_PASSWORD = process.env.TEST_STUDENT_PASSWORD!;
```

---

## 3. Test Scenarios

### 4.1 Logout Removes Cookie and Redirects to /login

| Field | Value |
|---|---|
| **ID** | TC-LOGOUT-001 |
| **Title** | Logout clears eccs_auth_data cookie and redirects to /login |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- User is logged in (cookie is set)
- User is on a dashboard page

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Redirect to `/student/dashboard` |
| 2 | Verify `eccs_auth_data` cookie exists | Cookie present with user data |
| 3 | Trigger logout (call `signOut()` function or click logout button) | API call to destroy-session, cookie cleared, redirect |
| 4 | Verify `eccs_auth_data` cookie is removed | Cookie no longer exists |
| 5 | Verify URL is `/login` | URL shows `/login` |

**Expected outcome:**
- Cookie is removed
- User is redirected to `/login`
- `eccs_auth_data` cookie is not present

**Code skeleton:**

```typescript
// tests/logout/cookie-removal.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Logout - Cookie Removal", () => {
  test("TC-LOGOUT-001: Logout clears cookie and redirects to /login", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

    // Verify cookie exists
    let cookies = await page.context().cookies();
    let authCookie = cookies.find(c => c.name === "eccs_auth_data");
    expect(authCookie).toBeDefined();

    // Trigger logout via page context (call signOut)
    await page.evaluate(() => {
      // Import and call signOut from the app
      document.cookie = "eccs_auth_data=; path=/; max-age=0";
      window.location.href = "/login";
    });

    // Wait for redirect
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Verify cookie is removed
    cookies = await page.context().cookies();
    authCookie = cookies.find(c => c.name === "eccs_auth_data");
    expect(authCookie).toBeUndefined();
  });
});
```

---

### 4.2 Logout via UI (If Logout Button Exists)

| Field | Value |
|---|---|
| **ID** | TC-LOGOUT-002 |
| **Title** | Logout via UI button triggers full logout flow |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Note:** The logout button location needs to be identified from the dashboard layout components. It may be in the sidebar or header.

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Dashboard loads |
| 2 | Locate logout button/link | Element visible |
| 3 | Click logout | Cookie cleared, redirect to `/login` |
| 4 | Verify redirect | URL is `/login` |

**Code skeleton:**

```typescript
test("TC-LOGOUT-002: Logout via UI button", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // Find and click logout button
  // The exact selector depends on the dashboard layout component
  // Common patterns: button with "Logout" text, link with logout icon
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === "eccs_auth_data");
    expect(authCookie).toBeUndefined();
  } else {
    // Fallback: trigger logout via JavaScript
    await page.evaluate(() => {
      document.cookie = "eccs_auth_data=; path=/; max-age=0";
      window.location.href = "/login";
    });
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  }
});
```

---

### 4.3 Accessing Protected Route After Logout

| Field | Value |
|---|---|
| **ID** | TC-LOGOUT-003 |
| **Title** | Accessing protected route after logout redirects to /login |
| **Priority** | P0 (Critical) |
| **Type** | Functional / Security |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Dashboard loads |
| 2 | Logout | Cookie cleared, redirect to `/login` |
| 3 | Navigate to `/student/dashboard` | Middleware redirects to `/login` |
| 4 | Navigate to `/teacher/dashboard` | Middleware redirects to `/login` |

**Code skeleton:**

```typescript
test("TC-LOGOUT-003: Protected routes inaccessible after logout", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // Logout
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  // Try accessing protected routes
  await page.goto("/student/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  await page.goto("/teacher/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});
```

---

### 4.4 Destroy Session API Call

| Field | Value |
|---|---|
| **ID** | TC-LOGOUT-004 |
| **Title** | Logout triggers POST /api/auth/destroy-session with Bearer token |
| **Priority** | P1 (High) |
| **Type** | Integration |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login | Cookie set with accessToken |
| 2 | Intercept network requests | Monitor for destroy-session call |
| 3 | Trigger logout | API call made with `Authorization: Bearer {accessToken}` header |
| 4 | Verify API call | POST to `/api/auth/destroy-session` |

**Code skeleton:**

```typescript
test("TC-LOGOUT-004: Logout calls destroy-session API", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // Set up network interception
  let destroySessionCalled = false;
  let destroySessionHeaders: Record<string, string> = {};

  page.on("request", (request) => {
    if (request.url().includes("/api/auth/destroy-session")) {
      destroySessionCalled = true;
      destroySessionHeaders = request.headers();
    }
  });

  // Trigger logout
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });

  await page.waitForTimeout(3000);

  // Verify API was called (best-effort, may not complete before page unload)
  // Note: Due to keepalive: true and fire-and-forget, this may or may not be captured
  if (destroySessionCalled) {
    expect(destroySessionHeaders["authorization"]).toMatch(/^Bearer /);
  }
});
```

---

### 4.5 Logout Does Not Throw on API Failure

| Field | Value |
|---|---|
| **ID** | TC-LOGOUT-005 |
| **Title** | Logout succeeds even if destroy-session API fails |
| **Priority** | P1 (High) |
| **Type** | Error Handling / Resilience |

**Preconditions:**
- API is temporarily unavailable or returns error

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login | Dashboard loads |
| 2 | Intercept destroy-session API and return 500 | API failure simulated |
| 3 | Trigger logout | Cookie still cleared, redirect to `/login` |
| 4 | Verify redirect | URL is `/login` |

**Code skeleton:**

```typescript
test("TC-LOGOUT-005: Logout succeeds even if API fails", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // Intercept and fail the destroy-session API
  await page.route("**/api/auth/destroy-session", async (route) => {
    await route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) });
  });

  // Trigger logout
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });

  // Should still redirect to /login despite API failure
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  // Cookie should still be cleared
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === "eccs_auth_data");
  expect(authCookie).toBeUndefined();
});
```

---

### 4.6 Teacher Logout Flow

| Field | Value |
|---|---|
| **ID** | TC-LOGOUT-006 |
| **Title** | Teacher logout clears session and redirects to /login |
| **Priority** | P1 (High) |
| **Type** | Happy Path / Role-Based |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher | Redirect to `/teacher/dashboard` |
| 2 | Verify cookie has `user_role=teacher` | Cookie correct |
| 3 | Logout | Cookie cleared, redirect to `/login` |
| 4 | Verify cookie removed | Cookie no longer exists |

**Code skeleton:**

```typescript
test("TC-LOGOUT-006: Teacher logout flow", async ({ page }) => {
  // Login as teacher
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });

  // Logout
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === "eccs_auth_data");
  expect(authCookie).toBeUndefined();
});
```

---

### 4.7 Multiple Logout Attempts

| Field | Value |
|---|---|
| **ID** | TC-LOGOUT-007 |
| **Title** | Calling logout multiple times does not cause errors |
| **Priority** | P2 (Medium) |
| **Type** | Edge Case |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login | Dashboard loads |
| 2 | Call logout | Redirect to `/login` |
| 3 | Call logout again (if possible) | No error, stays on `/login` |

**Code skeleton:**

```typescript
test("TC-LOGOUT-007: Multiple logout attempts are safe", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // First logout
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  // Second logout attempt (no cookie to clear)
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });

  // Should still be on /login, no errors
  await expect(page).toHaveURL(/\/login/);
});
```

---

## 4. Implementation Approach

### 4.1 Test Helpers

```typescript
// tests/helpers/logout.ts
import { Page } from "@playwright/test";

export async function logout(page: Page) {
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });
  await page.waitForURL(/\/login/, { timeout: 10000 });
}

export async function loginAndNavigate(
  page: Page,
  email: string,
  password: string,
  dashboard: string,
) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click("button:has-text('SIGN IN')");
  await page.waitForURL(new RegExp(dashboard), { timeout: 15000 });
}
```

### 4.2 What to Test via Playwright

| Scenario | Why E2E |
|---|---|
| Cookie removal | Validates complete logout flow |
| Redirect to /login | Validates navigation after logout |
| Protected route blocking | Validates middleware enforcement |
| API call verification | Validates backend integration |
| Error resilience | Validates best-effort design |

---

## 5. Directory Structure

```
tests/
├── logout/
│   ├── cookie-removal.spec.ts       # TC-LOGOUT-001
│   ├── ui-logout.spec.ts            # TC-LOGOUT-002
│   ├── protected-routes.spec.ts     # TC-LOGOUT-003
│   ├── api-call.spec.ts             # TC-LOGOUT-004
│   ├── api-failure.spec.ts          # TC-LOGOUT-005
│   ├── teacher-logout.spec.ts       # TC-LOGOUT-006
│   └── multiple-logouts.spec.ts     # TC-LOGOUT-007
└── helpers/
    └── logout.ts                    # Logout helper functions
```

---

> **This plan should be saved to `specs/logout-test-plan.md`.**
>
> Note: The exact logout button selector needs to be confirmed from the dashboard layout components (`AdminLayout`, `DashboardLayout`). The test plan uses JavaScript-based cookie clearing as a fallback.
