# Auth Guard / Middleware — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Route protection via `src/proxy.ts` middleware and `useAuthRedirect` hook
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

### Two-Layer Protection Model

```
Layer 1: Next.js Middleware (proxy.ts)          Layer 2: Client-Side Hook (useAuthRedirect)
┌──────────────────────────────────────┐      ┌──────────────────────────────────────┐
│ Matcher: /student/:path*,            │      │ Used in: dashboard pages,            │
│          /teacher/:path*             │      │          case study pages,            │
│                                      │      │          settings pages               │
│ Logic:                               │      │                                      │
│ 1. Check eccs_auth_data cookie       │      │ Logic:                               │
│ 2. If missing → redirect /login      │      │ 1. Read cookie via getAuthCookie()   │
│ 3. If present → NextResponse.next()  │      │ 2. If null → router.replace(/login)  │
│                                      │      │ 3. If no accessToken → signOut()     │
│ Runs: Server-side (before page)      │      │ Runs: Client-side (after page mount) │
└──────────────────────────────────────┘      └──────────────────────────────────────┘
```

### Middleware Implementation

From `src/proxy.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const eccsAuthCookie = request.cookies.get("eccs_auth_data");

  if (!eccsAuthCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*"],
};
```

### Client-Side Hook

From `src/services/hooks/useAuthRedirect.ts`:

```typescript
export const useAuthRedirect = () => {
  const router = useRouter();
  const cookieData = getAuthCookie();

  useEffect(() => {
    if (!cookieData) {
      router.replace("/login");
      return;
    }
    if (!cookieData.accessToken) {
      const timeoutId = setTimeout(() => { signOut(); }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [cookieData, router]);

  // Returns session object or null
};
```

### Protected Routes

| Route Pattern | Middleware | useAuthRedirect |
|---|---|---|
| `/student/dashboard` | ✅ | ✅ |
| `/student/case-studies/*` | ✅ | ✅ |
| `/student/certificates` | ✅ | ✅ |
| `/student/settings` | ✅ | ✅ |
| `/teacher/dashboard` | ✅ | ✅ |
| `/teacher/case-studies/*` | ✅ | ✅ |
| `/teacher/cases` | ✅ | ✅ |
| `/teacher/responses-feedback/*` | ✅ | ✅ |
| `/teacher/settings` | ✅ | ✅ |

### Unprotected Routes

| Route Pattern | Protected? |
|---|---|
| `/` | ❌ |
| `/login` | ❌ |
| `/signup` | ❌ |
| `/forgot-password` | ❌ |
| `/faculty` | ❌ |
| `/admin` | ❌ |

---

### Testability Requirements

No page-specific `data-testid` attributes are needed for middleware tests — they test URL redirect behavior.

For tests that verify redirect after login, use the login page attributes from the `login-test-plan.md` specification.

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Test stage deployed
- Confirmed users seeded (teacher + student)

### 2.2 Key Behavior Notes

1. **Middleware runs server-side**: It checks for the *existence* of the cookie, not its validity
2. **Cookie validity is checked client-side**: `useAuthRedirect` checks for `accessToken` property
3. **Expired cookies**: Middleware allows access (cookie exists), but `useAuthRedirect` will trigger `signOut()` if `accessToken` is missing

---

## 3. Test Scenarios

### 4.1 Unauthenticated Access to /student/dashboard

| Field | Value |
|---|---|
| **ID** | TC-GUARD-001 |
| **Title** | Unauthenticated access to /student/dashboard redirects to /login |
| **Priority** | P0 (Critical) |
| **Type** | Security / Functional |

**Preconditions:**
- No `eccs_auth_data` cookie is set

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear all cookies | No cookies present |
| 2 | Navigate directly to `/student/dashboard` | Middleware redirects to `/login` |
| 3 | Verify URL | URL is `/login` |

**Expected outcome:**
- Server-side redirect from `/student/dashboard` to `/login`
- No flash of protected content

**Code skeleton:**

```typescript
// tests/auth-guard/unauthenticated-student.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Auth Guard - Unauthenticated Access", () => {
  test("TC-GUARD-001: /student/dashboard redirects to /login", async ({ page }) => {
    await page.context().clearCookies();

    await page.goto("/student/dashboard");

    // Middleware should redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
```

---

### 4.2 Unauthenticated Access to /teacher/dashboard

| Field | Value |
|---|---|
| **ID** | TC-GUARD-002 |
| **Title** | Unauthenticated access to /teacher/dashboard redirects to /login |
| **Priority** | P0 (Critical) |
| **Type** | Security / Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear all cookies | No cookies present |
| 2 | Navigate directly to `/teacher/dashboard` | Middleware redirects to `/login` |
| 3 | Verify URL | URL is `/login` |

**Code skeleton:**

```typescript
test("TC-GUARD-002: /teacher/dashboard redirects to /login", async ({ page }) => {
  await page.context().clearCookies();

  await page.goto("/teacher/dashboard");

  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});
```

---

### 4.3 Unauthenticated Access to Nested Student Routes

| Field | Value |
|---|---|
| **ID** | TC-GUARD-003 |
| **Title** | Unauthenticated access to nested /student/* routes redirects to /login |
| **Priority** | P0 (Critical) |
| **Type** | Security / Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear cookies | No cookies |
| 2 | Navigate to `/student/certificates` | Redirect to `/login` |
| 3 | Navigate to `/student/settings` | Redirect to `/login` |
| 4 | Navigate to `/student/case-studies/some-id` | Redirect to `/login` |

**Code skeleton:**

```typescript
test("TC-GUARD-003: Nested student routes redirect to /login", async ({ page }) => {
  await page.context().clearCookies();

  const studentRoutes = [
    "/student/certificates",
    "/student/settings",
    "/student/case-studies/test-id",
  ];

  for (const route of studentRoutes) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  }
});
```

---

### 4.4 Unauthenticated Access to Nested Teacher Routes

| Field | Value |
|---|---|
| **ID** | TC-GUARD-004 |
| **Title** | Unauthenticated access to nested /teacher/* routes redirects to /login |
| **Priority** | P0 (Critical) |
| **Type** | Security / Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear cookies | No cookies |
| 2 | Navigate to `/teacher/case-studies/create` | Redirect to `/login` |
| 3 | Navigate to `/teacher/cases` | Redirect to `/login` |
| 4 | Navigate to `/teacher/settings` | Redirect to `/login` |
| 5 | Navigate to `/teacher/responses-feedback/test-id` | Redirect to `/login` |

**Code skeleton:**

```typescript
test("TC-GUARD-004: Nested teacher routes redirect to /login", async ({ page }) => {
  await page.context().clearCookies();

  const teacherRoutes = [
    "/teacher/case-studies/create",
    "/teacher/cases",
    "/teacher/settings",
    "/teacher/responses-feedback/test-id",
  ];

  for (const route of teacherRoutes) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  }
});
```

---

### 4.5 Authenticated Access Passes Through

| Field | Value |
|---|---|
| **ID** | TC-GUARD-005 |
| **Title** | Authenticated user can access protected routes |
| **Priority** | P0 (Critical) |
| **Type** | Functional |

**Preconditions:**
- User is logged in (cookie is set)

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Cookie set |
| 2 | Navigate to `/student/dashboard` | Page loads (no redirect) |
| 3 | Navigate to `/student/certificates` | Page loads |
| 4 | Navigate to `/student/settings` | Page loads |

**Code skeleton:**

```typescript
test("TC-GUARD-005: Authenticated student accesses protected routes", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // Access other protected routes
  await page.goto("/student/certificates");
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/student/settings");
  await expect(page).not.toHaveURL(/\/login/);
});
```

---

### 4.6 Authenticated Teacher Access

| Field | Value |
|---|---|
| **ID** | TC-GUARD-006 |
| **Title** | Authenticated teacher can access teacher routes |
| **Priority** | P0 (Critical) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher | Cookie set with `user_role=teacher` |
| 2 | Navigate to `/teacher/dashboard` | Page loads |
| 3 | Navigate to `/teacher/case-studies/create` | Page loads |
| 4 | Navigate to `/teacher/cases` | Page loads |
| 5 | Navigate to `/teacher/settings` | Page loads |

**Code skeleton:**

```typescript
test("TC-GUARD-006: Authenticated teacher accesses teacher routes", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });

  const teacherRoutes = [
    "/teacher/case-studies/create",
    "/teacher/cases",
    "/teacher/settings",
  ];

  for (const route of teacherRoutes) {
    await page.goto(route);
    await expect(page).not.toHaveURL(/\/login/);
  }
});
```

---

### 4.7 Expired/Invalid Cookie — Client-Side Redirect

| Field | Value |
|---|---|
| **ID** | TC-GUARD-007 |
| **Title** | Cookie with missing accessToken triggers client-side logout |
| **Priority** | P1 (High) |
| **Type** | Edge Case / Security |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Set a cookie with invalid/expired data (no accessToken) | Cookie exists but invalid |
| 2 | Navigate to `/student/dashboard` | Middleware allows (cookie exists) |
| 3 | Client-side `useAuthRedirect` detects missing accessToken | Triggers `signOut()` |
| 4 | User redirected to `/login` | URL is `/login` |

**Code skeleton:**

```typescript
test("TC-GUARD-007: Invalid cookie triggers client-side logout", async ({ page }) => {
  // Set a cookie with missing accessToken
  await page.context().addCookies([{
    name: "eccs_auth_data",
    value: encodeURIComponent(JSON.stringify({
      id: "fake-id",
      firstName: "Fake",
      lastName: "User",
      user_role: "student",
      email: "fake@test.com",
      // No accessToken!
    })),
    domain: new URL(process.env.PLAYWRIGHT_BASE_URL || "").hostname,
    path: "/",
  }]);

  await page.goto("/student/dashboard");

  // Middleware allows (cookie exists), but useAuthRedirect triggers signOut
  // Should redirect to /login
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
});
```

---

### 4.8 Cross-Role Access Prevention

| Field | Value |
|---|---|
| **ID** | TC-GUARD-008 |
| **Title** | Student cookie does not grant access to teacher routes at middleware level |
| **Priority** | P1 (High) |
| **Type** | Security |

**Note:** The middleware only checks for cookie *existence*, not role. Cross-role prevention happens at the API level (JWT authorizer) and client-side (useAuthRedirect). This test documents the actual behavior.

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Cookie set with `user_role=student` |
| 2 | Navigate to `/teacher/dashboard` | Middleware allows (cookie exists) |
| 3 | Page loads, `useAuthRedirect` reads cookie | Session shows `user_role=student` |
| 4 | Observe behavior | Page may load but API calls fail, or UI shows unauthorized state |

**Code skeleton:**

```typescript
test("TC-GUARD-008: Student cookie on teacher routes behavior", async ({ page }) => {
  // Login as student
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // Try accessing teacher route
  await page.goto("/teacher/dashboard");

  // Middleware allows (cookie exists)
  // The page loads but API calls may fail due to role mismatch
  // Document the actual behavior — page may show error or empty state
  const currentUrl = page.url();
  // The URL should NOT be /login (middleware passed)
  // But the page content may indicate unauthorized access
  expect(currentUrl).not.toMatch(/\/login/);
});
```

---

### 4.9 Unprotected Routes Accessible Without Auth

| Field | Value |
|---|---|
| **ID** | TC-GUARD-009 |
| **Title** | Public routes are accessible without authentication |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear all cookies | No cookies |
| 2 | Navigate to `/` | Home page loads |
| 3 | Navigate to `/login` | Login page loads |
| 4 | Navigate to `/signup` | Signup page loads |
| 5 | Navigate to `/faculty` | Faculty page loads |

**Code skeleton:**

```typescript
test("TC-GUARD-009: Public routes accessible without auth", async ({ page }) => {
  await page.context().clearCookies();

  const publicRoutes = ["/", "/login", "/signup", "/faculty"];

  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page).not.toHaveURL(/\/login/); // Should NOT redirect to /login
  }
});
```

---

### 4.10 Middleware Matcher Coverage

| Field | Value |
|---|---|
| **ID** | TC-GUARD-010 |
| **Title** | Only /student/* and /teacher/* routes are matched by middleware |
| **Priority** | P2 (Medium) |
| **Type** | Edge Case |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Clear cookies | No cookies |
| 2 | Navigate to `/student` (exact) | Redirect to `/login` |
| 3 | Navigate to `/teacher` (exact) | Redirect to `/login` |
| 4 | Navigate to `/admin` | NOT redirected (middleware doesn't match) |

**Code skeleton:**

```typescript
test("TC-GUARD-010: Middleware matcher coverage", async ({ page }) => {
  await page.context().clearCookies();

  // These should redirect
  await page.goto("/student");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  await page.goto("/teacher");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  // This should NOT redirect (not in matcher)
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/login/);
});
```

---

## 4. Implementation Approach

### 4.1 Test Strategy

- **Server-side middleware tests**: Use `page.goto()` with cleared cookies — redirect happens before page render
- **Client-side hook tests**: Set cookie manually, navigate, observe redirect after page mount
- **Role-based tests**: Login with specific role, verify access to appropriate routes

### 4.2 Helper Functions

```typescript
// tests/helpers/auth-guard.ts
import { Page } from "@playwright/test";

export async function clearAuthAndNavigate(page: Page, route: string) {
  await page.context().clearCookies();
  await page.goto(route);
}

export async function setInvalidCookie(page: Page) {
  await page.context().addCookies([{
    name: "eccs_auth_data",
    value: encodeURIComponent(JSON.stringify({ id: "fake" })),
    domain: new URL(process.env.PLAYWRIGHT_BASE_URL || "").hostname,
    path: "/",
  }]);
}
```

---

## 5. Directory Structure

```
tests/
├── auth-guard/
│   ├── unauthenticated-student.spec.ts    # TC-GUARD-001
│   ├── unauthenticated-teacher.spec.ts    # TC-GUARD-002
│   ├── nested-student-routes.spec.ts     # TC-GUARD-003
│   ├── nested-teacher-routes.spec.ts     # TC-GUARD-004
│   ├── authenticated-access.spec.ts      # TC-GUARD-005, 006
│   ├── invalid-cookie.spec.ts            # TC-GUARD-007
│   ├── cross-role.spec.ts               # TC-GUARD-008
│   ├── public-routes.spec.ts            # TC-GUARD-009
│   └── matcher-coverage.spec.ts         # TC-GUARD-010
└── helpers/
    └── auth-guard.ts                    # Auth guard test helpers
```

---

> **This plan should be saved to `specs/auth-guard-test-plan.md`.**
>
> Key insight: The middleware is a simple cookie-existence check, not a role validator. Role-based access control is enforced at the API Gateway JWT authorizer level and client-side via `useAuthRedirect`.
