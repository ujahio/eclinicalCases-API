# Student Settings — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Student settings page at `/student/settings`, personal details, password, and payment tabs
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
Browser (/student/settings)
┌─────────────────────────────────────────┐
│ AccountSettings.tsx                     │
│                                         │
│ 1. Profile Image Section                │
│    - Avatar image (user.png)            │
│    - "Change Picture" button            │
│                                         │
│ 2. Tabs                                 │
│    - "Personal Details" (default)       │
│    - "Password"                         │
│    - "Payment"                          │
│                                         │
│ 3. Tab Content                          │
│    - PersonalDetailsSettings            │
│    - PasswordSettings                   │
│    - Payment (placeholder:              │
│       "Nothing to see here yet")        │
└─────────────────────────────────────────┘
```

### Key Components

From `src/presentation/student/Settings.tsx`:

- **Profile Section**: Avatar (user.png) + "Change Picture" button
- **Tabs**: "Personal Details", "Password", "Payment"
- **PersonalDetailsSettings**: Form with personal info
- **PasswordSettings**: Password change form
- **Payment**: Placeholder text "Nothing to see here yet"

### Tab Keys

| Tab Label | Tab Key | Component |
|---|---|---|
| Personal Details | `personal_details` | `PersonalDetailsSettings` |
| Password | `password` | `PasswordSettings` |
| Payment | `payment` | Static text |

### Testability Requirements

The following `data-testid` attributes must be added before implementing tests:

| data-testid | Element | Notes |
|---|---|---|
| `settings-nav-personal` | "Personal Details" tab | — |
| `settings-nav-password` | "Password" tab | — |
| `settings-nav-payment` | "Payment" tab | Shows placeholder text |
| `settings-personal-firstname` | First name input | — |
| `settings-personal-lastname` | Last name input | — |
| `settings-personal-email` | Email input (likely read-only) | — |
| `settings-personal-save` | Save personal details button | — |
| `settings-password-current` | Current password input | — |
| `settings-password-new` | New password input | — |
| `settings-password-confirm` | Confirm new password input | — |
| `settings-password-save` | Save password button | — |
| `settings-payment-placeholder` | Payment placeholder text | "Nothing to see here yet" |
| `settings-success-toast` | Success toast/notification | — |
| `settings-error-message` | Error message display | — |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Student user confirmed in Cognito

---

## 3. Test Scenarios

### 4.1 Settings Page Loads

| Field | Value |
|---|---|
| **ID** | TC-SSET-001 |
| **Title** | Student settings page loads with profile section and tabs |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Dashboard loads |
| 2 | Navigate to `/student/settings` | Settings page loads |
| 3 | Verify profile image | Avatar image visible |
| 4 | Verify "Change Picture" button | Button visible |
| 5 | Verify tabs | "Personal Details", "Password", "Payment" tabs visible |
| 6 | Verify "Personal Details" is active | Tab has active styling |

**Code skeleton:**

```typescript
// tests/student-settings/page-loads.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Student Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });
  });

  test("TC-SSET-001: Settings page loads correctly", async ({ page }) => {
    await page.goto("/student/settings");

    // Verify profile image
    await expect(page.locator('img[alt="Profile image"]')).toBeVisible();

    // Verify "Change Picture" button
    await expect(page.locator("button:has-text('Change Picture')")).toBeVisible();

    // Verify tabs
    await expect(page.locator("text=Personal Details")).toBeVisible();
    await expect(page.locator("text=Password")).toBeVisible();
    await expect(page.locator("text=Payment")).toBeVisible();
  });
});
```

---

### 4.2 Personal Details Tab Active by Default

| Field | Value |
|---|---|
| **ID** | TC-SSET-002 |
| **Title** | Personal Details tab is active by default |
| **Priority** | P1 (High) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/student/settings` | Page loads |
| 2 | Verify "Personal Details" tab content | Personal details form visible |
| 3 | Verify "Password" tab content hidden | Password form not visible |
| 4 | Verify "Payment" tab content hidden | Payment text not visible |

**Code skeleton:**

```typescript
test("TC-SSET-002: Personal Details tab active by default", async ({ page }) => {
  await page.goto("/student/settings");

  // Personal details form should be visible
  const personalDetailsForm = page.locator('input[name="firstName"], input[name="email"], text=Personal Details').first();
  await expect(personalDetailsForm).toBeVisible();

  // Payment text should NOT be visible
  await expect(page.locator("text=Nothing to see here yet")).not.toBeVisible();
});
```

---

### 4.3 Switch to Password Tab

| Field | Value |
|---|---|
| **ID** | TC-SSET-003 |
| **Title** | Clicking Password tab shows password change form |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/student/settings` | Page loads |
| 2 | Click "Password" tab | Tab switches |
| 3 | Verify password form visible | Password change form displayed |
| 4 | Verify personal details hidden | Personal details form not visible |

**Code skeleton:**

```typescript
test("TC-SSET-003: Switch to Password tab", async ({ page }) => {
  await page.goto("/student/settings");

  // Click Password tab
  await page.click("text=Password");

  // Password form should be visible
  const passwordForm = page.locator('input[type="password"], text=Password, text=Current Password').first();
  await expect(passwordForm).toBeVisible({ timeout: 5000 });
});
```

---

### 4.4 Switch to Payment Tab

| Field | Value |
|---|---|
| **ID** | TC-SSET-004 |
| **Title** | Clicking Payment tab shows placeholder message |
| **Priority** | P2 (Medium) |
| **Type** | Functional / UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/student/settings` | Page loads |
| 2 | Click "Payment" tab | Tab switches |
| 3 | Verify placeholder text | "Nothing to see here yet" visible |
| 4 | Verify personal details hidden | Personal details form not visible |

**Code skeleton:**

```typescript
test("TC-SSET-004: Payment tab shows placeholder", async ({ page }) => {
  await page.goto("/student/settings");

  // Click Payment tab
  await page.click("text=Payment");

  // Verify placeholder
  await expect(page.locator("text=Nothing to see here yet")).toBeVisible();
});
```

---

### 4.5 Tab Switching Cycle

| Field | Value |
|---|---|
| **ID** | TC-SSET-005 |
| **Title** | Switching between all tabs works correctly |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to settings | Personal Details active |
| 2 | Click "Password" | Password tab active |
| 3 | Click "Payment" | Payment tab active |
| 4 | Click "Personal Details" | Back to Personal Details |

**Code skeleton:**

```typescript
test("TC-SSET-005: Tab switching cycle", async ({ page }) => {
  await page.goto("/student/settings");

  // Personal Details (default)
  await expect(page.locator("text=Personal Details")).toBeVisible();

  // Switch to Password
  await page.click("text=Password");
  await page.waitForTimeout(500);

  // Switch to Payment
  await page.click("text=Payment");
  await expect(page.locator("text=Nothing to see here yet")).toBeVisible();

  // Switch back to Personal Details
  await page.click("text=Personal Details");
  await page.waitForTimeout(500);

  // Verify personal details content
  const personalDetails = page.locator('input[name="firstName"], input[name="email"]').first();
  await expect(personalDetails).toBeVisible();
});
```

---

### 4.6 Change Picture Button

| Field | Value |
|---|---|
| **ID** | TC-SSET-006 |
| **Title** | Change Picture button is present and clickable |
| **Priority** | P2 (Medium) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/student/settings` | Page loads |
| 2 | Verify "Change Picture" button | Button visible |
| 3 | Click "Change Picture" | Button is clickable |

**Code skeleton:**

```typescript
test("TC-SSET-006: Change Picture button", async ({ page }) => {
  await page.goto("/student/settings");

  const changePictureBtn = page.locator("button:has-text('Change Picture')");
  await expect(changePictureBtn).toBeVisible();
  await expect(changePictureBtn).toBeEnabled();
});
```

---

### 4.7 Navigation from Settings to Dashboard

| Field | Value |
|---|---|
| **ID** | TC-SSET-007 |
| **Title** | Navigation from settings back to dashboard works |
| **Priority** | P2 (Medium) |
| **Type** | Navigation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/student/settings` | Page loads |
| 2 | Click dashboard link in sidebar | Navigate to `/student/dashboard` |
| 3 | Verify URL | URL is `/student/dashboard` |

**Code skeleton:**

```typescript
test("TC-SSET-007: Navigation back to dashboard", async ({ page }) => {
  await page.goto("/student/settings");

  const dashboardLink = page.locator('a[href="/student/dashboard"]').first();
  if (await dashboardLink.isVisible()) {
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/student\/dashboard/);
  }
});
```

---

### 4.8 Student vs Teacher Settings Differences

| Field | Value |
|---|---|
| **ID** | TC-SSET-008 |
| **Title** | Student settings has Payment tab (teacher does not) |
| **Priority** | P2 (Medium) |
| **Type** | Comparison |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/student/settings` | Student settings loads |
| 2 | Verify "Payment" tab | Tab visible |
| 3 | Navigate to `/teacher/settings` | Teacher settings loads |
| 4 | Verify "Payment" tab NOT present | Tab not visible |

**Code skeleton:**

```typescript
test("TC-SSET-008: Student has Payment tab, teacher does not", async ({ page }) => {
  // Login as student
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });

  // Student settings has Payment tab
  await page.goto("/student/settings");
  await expect(page.locator("text=Payment")).toBeVisible();

  // Logout and login as teacher
  await page.evaluate(() => {
    document.cookie = "eccs_auth_data=; path=/; max-age=0";
    window.location.href = "/login";
  });
  await page.waitForURL(/\/login/);

  await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });

  // Teacher settings does NOT have Payment tab
  await page.goto("/teacher/settings");
  await expect(page.locator("text=Payment")).not.toBeVisible();
});
```

---

## 4. Implementation Approach

### 4.1 Component Selectors

The settings page uses shared components:
- `PersonalDetailsSettings` — form with personal info fields
- `PasswordSettings` — password change form
- `Tabs` — tab navigation component

### 4.2 What to Test via Playwright

| Scenario | Why E2E |
|---|---|
| Page load and layout | Validates complete render |
| Tab switching | Validates tab state management |
| Form presence | Validates component rendering |
| Navigation | Validates routing |
| Role differences | Validates feature gating |

---

## 5. Directory Structure

```
tests/
├── student-settings/
│   ├── page-loads.spec.ts             # TC-SSET-001
│   ├── default-tab.spec.ts            # TC-SSET-002
│   ├── switch-password-tab.spec.ts    # TC-SSET-003
│   ├── switch-payment-tab.spec.ts     # TC-SSET-004
│   ├── tab-cycle.spec.ts              # TC-SSET-005
│   ├── change-picture.spec.ts         # TC-SSET-006
│   ├── navigation.spec.ts             # TC-SSET-007
│   └── role-differences.spec.ts       # TC-SSET-008
```

---

> **This plan should be saved to `specs/student-settings-test-plan.md`.**
>
> Note: The actual form field selectors need to be confirmed from the `PersonalDetailsSettings` and `PasswordSettings` components.
