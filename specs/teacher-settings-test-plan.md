# Teacher Settings — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Teacher settings page at `/teacher/settings`, personal details and password tabs
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

### Settings Page Structure

```
Browser (/teacher/settings)
┌─────────────────────────────────────────┐
│ AdminAccountSettings.tsx                │
│                                         │
│ 1. Profile Image Section                │
│    - Avatar image (admin.png)           │
│    - "Change Picture" button            │
│                                         │
│ 2. Tabs                                 │
│    - "Personal Details" (default)       │
│    - "Password"                         │
│                                         │
│ 3. Tab Content                          │
│    - PersonalDetailsSettings (isAdmin)  │
│    - PasswordSettings                   │
└─────────────────────────────────────────┘
```

### Key Components

From `src/presentation/teacher/settings.tsx`:

- **Profile Section**: Avatar + "Change Picture" button
- **Tabs**: "Personal Details" and "Password"
- **PersonalDetailsSettings**: Form with personal info (isAdmin=true)
- **PasswordSettings**: Password change form

### Known Issues

- `isAdmin` is hardcoded as `const isAdmin = true;` at the bottom of the file
- The `PersonalDetailsSettings` component receives `isAdmin={isAdmin}` prop

### Testability Requirements

The following `data-testid` attributes must be added before implementing tests:

| data-testid | Element | Notes |
|---|---|---|
| `settings-nav-personal` | "Personal Details" tab | — |
| `settings-nav-password` | "Password" tab | — |
| `settings-personal-firstname` | First name input | — |
| `settings-personal-lastname` | Last name input | — |
| `settings-personal-email` | Email input (likely read-only) | — |
| `settings-personal-save` | Save personal details button | — |
| `settings-password-current` | Current password input | — |
| `settings-password-new` | New password input | — |
| `settings-password-confirm` | Confirm new password input | — |
| `settings-password-save` | Save password button | — |
| `settings-success-toast` | Success toast/notification | — |
| `settings-error-message` | Error message display | — |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Teacher user confirmed in Cognito

---

## 3. Test Scenarios

### 4.1 Settings Page Loads

| Field | Value |
|---|---|
| **ID** | TC-TSET-001 |
| **Title** | Teacher settings page loads with profile section and tabs |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher | Dashboard loads |
| 2 | Navigate to `/teacher/settings` | Settings page loads |
| 3 | Verify profile image | Avatar image visible |
| 4 | Verify "Change Picture" button | Button visible |
| 5 | Verify tabs | "Personal Details" and "Password" tabs visible |
| 6 | Verify "Personal Details" is active | Tab has active styling |

**Code skeleton:**

```typescript
// tests/teacher-settings/page-loads.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Teacher Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });
  });

  test("TC-TSET-001: Settings page loads correctly", async ({ page }) => {
    await page.goto("/teacher/settings");

    // Verify profile image
    await expect(page.locator('img[alt="Profile image"]')).toBeVisible();

    // Verify "Change Picture" button
    await expect(page.locator("button:has-text('Change Picture')")).toBeVisible();

    // Verify tabs
    await expect(page.locator("text=Personal Details")).toBeVisible();
    await expect(page.locator("text=Password")).toBeVisible();
  });
});
```

---

### 4.2 Personal Details Tab Active by Default

| Field | Value |
|---|---|
| **ID** | TC-TSET-002 |
| **Title** | Personal Details tab is active by default |
| **Priority** | P1 (High) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/settings` | Page loads |
| 2 | Verify "Personal Details" tab content | Personal details form visible |
| 3 | Verify "Password" tab content is hidden | Password form not visible |

**Code skeleton:**

```typescript
test("TC-TSET-002: Personal Details tab active by default", async ({ page }) => {
  await page.goto("/teacher/settings");

  // Personal details form should be visible
  // (exact content depends on PersonalDetailsSettings component)
  const personalDetailsForm = page.locator('input[name="firstName"], input[name="email"], text=Personal Details').first();
  await expect(personalDetailsForm).toBeVisible();
});
```

---

### 4.3 Switch to Password Tab

| Field | Value |
|---|---|
| **ID** | TC-TSET-003 |
| **Title** | Clicking Password tab shows password change form |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/settings` | Page loads |
| 2 | Click "Password" tab | Tab switches |
| 3 | Verify password form visible | Password change form displayed |
| 4 | Verify personal details form hidden | Personal details form not visible |

**Code skeleton:**

```typescript
test("TC-TSET-003: Switch to Password tab", async ({ page }) => {
  await page.goto("/teacher/settings");

  // Click Password tab
  await page.click("text=Password");

  // Password form should be visible
  // (exact content depends on PasswordSettings component)
  const passwordForm = page.locator('input[type="password"], text=Password, text=Current Password').first();
  await expect(passwordForm).toBeVisible({ timeout: 5000 });
});
```

---

### 4.4 Switch Back to Personal Details Tab

| Field | Value |
|---|---|
| **ID** | TC-TSET-004 |
| **Title** | Switching back to Personal Details tab works |
| **Priority** | P2 (Medium) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/settings` | Page loads |
| 2 | Click "Password" tab | Tab switches |
| 3 | Click "Personal Details" tab | Tab switches back |
| 4 | Verify personal details form visible | Form displayed |

**Code skeleton:**

```typescript
test("TC-TSET-004: Switch back to Personal Details tab", async ({ page }) => {
  await page.goto("/teacher/settings");

  // Switch to Password
  await page.click("text=Password");
  await page.waitForTimeout(500);

  // Switch back to Personal Details
  await page.click("text=Personal Details");
  await page.waitForTimeout(500);

  // Verify personal details content is visible
  const personalDetails = page.locator('input[name="firstName"], input[name="email"]').first();
  await expect(personalDetails).toBeVisible();
});
```

---

### 4.5 Change Picture Button

| Field | Value |
|---|---|
| **ID** | TC-TSET-005 |
| **Title** | Change Picture button is present and clickable |
| **Priority** | P2 (Medium) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/settings` | Page loads |
| 2 | Verify "Change Picture" button | Button visible |
| 3 | Click "Change Picture" | Button is clickable (may open file picker) |

**Code skeleton:**

```typescript
test("TC-TSET-005: Change Picture button", async ({ page }) => {
  await page.goto("/teacher/settings");

  const changePictureBtn = page.locator("button:has-text('Change Picture')");
  await expect(changePictureBtn).toBeVisible();
  await expect(changePictureBtn).toBeEnabled();
});
```

---

### 4.6 Navigation from Settings to Dashboard

| Field | Value |
|---|---|
| **ID** | TC-TSET-006 |
| **Title** | Navigation from settings back to dashboard works |
| **Priority** | P2 (Medium) |
| **Type** | Navigation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/settings` | Page loads |
| 2 | Click dashboard link in sidebar | Navigate to `/teacher/dashboard` |
| 3 | Verify URL | URL is `/teacher/dashboard` |

**Code skeleton:**

```typescript
test("TC-TSET-006: Navigation back to dashboard", async ({ page }) => {
  await page.goto("/teacher/settings");

  const dashboardLink = page.locator('a[href="/teacher/dashboard"]').first();
  if (await dashboardLink.isVisible()) {
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/teacher\/dashboard/);
  }
});
```

---

## 4. Implementation Approach

### 4.1 Component Selectors

The settings page uses shared components:
- `PersonalDetailsSettings` — form with personal info fields
- `PasswordSettings` — password change form
- `Tabs` — tab navigation component

Exact selectors depend on the implementation of these shared components.

### 4.2 What to Test via Playwright

| Scenario | Why E2E |
|---|---|
| Page load and layout | Validates complete render |
| Tab switching | Validates tab state management |
| Form presence | Validates component rendering |
| Navigation | Validates routing |

---

## 5. Directory Structure

```
tests/
├── teacher-settings/
│   ├── page-loads.spec.ts             # TC-TSET-001
│   ├── default-tab.spec.ts            # TC-TSET-002
│   ├── switch-password-tab.spec.ts    # TC-TSET-003
│   ├── switch-back.spec.ts            # TC-TSET-004
│   ├── change-picture.spec.ts         # TC-TSET-005
│   └── navigation.spec.ts             # TC-TSET-006
```

---

> **This plan should be saved to `specs/teacher-settings-test-plan.md`.**
>
> Note: The actual form field selectors need to be confirmed from the `PersonalDetailsSettings` and `PasswordSettings` components.
