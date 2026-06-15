# Teacher Dashboard — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Teacher dashboard page at `/teacher/dashboard`, published case display, archived cases
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

### Dashboard Flow

```
Browser (/teacher/dashboard)         Redux Slices                    API Gateway
┌─────────────────────────┐  dispatch  ┌──────────────────┐  GET    ┌────────────┐
│ useAuthRedirect()       │ ─────────► │ activeCase       │ ──────► │ /case/     │
│  → session              │           │ Slice            │        │ publish    │
│                         │           │                  │ ◄────── │            │
│ useGetActiveCase()      │           └──────────────────┘        └────────────┘
│ useGetArchiveCases()    │
│                         │  dispatch  ┌──────────────────┐  GET    ┌────────────┐
│                         │ ─────────► │ getArchiveCases  │ ──────► │ /case/     │
│                         │           │ Slice            │        │ archived/  │
│                         │           │                  │ ◄────── │            │
│ Presentation:           │           └──────────────────┘        └────────────┘
│ TeacherDashboard.tsx    │
└─────────────────────────┘
```

### Key Components

From `src/presentation/teacher/Dashboard.tsx`:

- **Published Case Section**: Shows `publishedCaseInfo` if a case is published
  - Case topic, created date, deadline
  - Feedback count, responses count
  - "INFO" button → `/teacher/responses-feedback/{id}`
- **No Active Case**: Shows "There is no active case at the moment."
- **Create Button**: "Create New Case" or "Draft a Case" → `/teacher/case-studies/create`
- **Recent Case Studies**: Grid of archived cases with "View All" → `/teacher/cases`

### Redux State Dependencies

| Slice | Selector | Data |
|---|---|---|
| `activeCase` | `state.activeCase.data` | Published case info |
| `getArchiveCases` | `state.getArchiveCases.cases` | Array of archived cases |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Test stage deployed
- Teacher user confirmed in Cognito
- At least one published case exists (for positive tests)

### 2.2 Test Data Setup

For dashboard tests, we need:
1. A confirmed teacher user
2. Optionally: a published case (can be created via API in setup)

```typescript
// Seed a published case via API for dashboard tests
async function seedPublishedCase(teacherAccessToken: string) {
  // POST /api/case/publish with valid case data
}
```

---

## 3. Test Scenarios

### 4.1 Dashboard Loads for Authenticated Teacher

| Field | Value |
|---|---|
| **ID** | TC-TDASH-001 |
| **Title** | Teacher dashboard loads successfully for authenticated teacher |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- Teacher is logged in

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher | Redirect to `/teacher/dashboard` |
| 2 | Verify page loads | "ONGOING CASE STUDY" heading visible |
| 3 | Verify create button | "Create New Case" or "Draft a Case" button visible |
| 4 | Verify recent cases section | "RECENT CASE STUDIES" heading visible |

**Code skeleton:**

```typescript
// tests/teacher-dashboard/dashboard-loads.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Teacher Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });
  });

  test("TC-TDASH-001: Dashboard loads with correct sections", async ({ page }) => {
    await expect(page.locator("text=ONGOING CASE STUDY")).toBeVisible();
    await expect(page.locator("text=RECENT CASE STUDIES")).toBeVisible();

    // Create button should be visible
    const createButton = page.locator('a[href="/teacher/case-studies/create"], button:has-text("Create New Case"), button:has-text("Draft a Case")');
    await expect(createButton.first()).toBeVisible();
  });
});
```

---

### 4.2 Dashboard With Published Case

| Field | Value |
|---|---|
| **ID** | TC-TDASH-002 |
| **Title** | Dashboard displays published case information when a case is active |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A published case exists for this teacher

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher with published case | Dashboard loads |
| 2 | Verify case topic displayed | Case topic text visible in ongoing case section |
| 3 | Verify created date | "Created:" label with date |
| 4 | Verify deadline | "Deadline:" label with date |
| 5 | Verify feedback count | "X Feedback" badge visible |
| 6 | Verify responses count | "X Responses" badge visible |
| 7 | Verify INFO button | "INFO" button visible, links to `/teacher/responses-feedback/{id}` |

**Code skeleton:**

```typescript
test("TC-TDASH-002: Published case info displayed", async ({ page }) => {
  // Assumes a published case exists
  // The ongoing case section should show case details
  const ongoingCase = page.locator(".ongoing-case");

  await expect(ongoingCase).toBeVisible();

  // Check for case topic (specific text depends on seeded data)
  await expect(ongoingCase.locator("h5.font-bold")).toBeVisible();

  // Check for date labels
  await expect(ongoingCase.locator("text=Created:")).toBeVisible();
  await expect(ongoingCase.locator("text=Deadline:")).toBeVisible();

  // Check for stats badges
  await expect(ongoingCase.locator("text=Feedback")).toBeVisible();
  await expect(ongoingCase.locator("text=Responses")).toBeVisible();

  // Check INFO button
  await expect(ongoingCase.locator("text=INFO")).toBeVisible();
});
```

---

### 4.3 Dashboard Without Published Case

| Field | Value |
|---|---|
| **ID** | TC-TDASH-003 |
| **Title** | Dashboard shows "no active case" when no case is published |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Preconditions:**
- No published case exists for this teacher

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher without published case | Dashboard loads |
| 2 | Verify "no active case" message | "There is no active case at the moment." visible |
| 3 | Verify create button says "Create New Case" | Button text is "Create New Case" |

**Code skeleton:**

```typescript
test("TC-TDASH-003: No active case message", async ({ page }) => {
  // This test needs a teacher with no published case
  await expect(page.locator("text=There is no active case at the moment.")).toBeVisible();

  // Create button should say "Create New Case" (not "Draft a Case")
  await expect(page.locator("text=Create New Case")).toBeVisible();
});
```

---

### 4.4 Create Button Navigation

| Field | Value |
|---|---|
| **ID** | TC-TDASH-004 |
| **Title** | Create button navigates to case creation page |
| **Priority** | P0 (Critical) |
| **Type** | Navigation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher | Dashboard loads |
| 2 | Click "Create New Case" or "Draft a Case" button | Navigate to `/teacher/case-studies/create` |
| 3 | Verify URL | URL is `/teacher/case-studies/create` |

**Code skeleton:**

```typescript
test("TC-TDASH-004: Create button navigates to creation page", async ({ page }) => {
  const createButton = page.locator('a[href="/teacher/case-studies/create"]').first();
  await createButton.click();

  await expect(page).toHaveURL(/\/teacher\/case-studies\/create/);
});
```

---

### 4.5 INFO Button Navigation

| Field | Value |
|---|---|
| **ID** | TC-TDASH-005 |
| **Title** | INFO button navigates to responses and feedback page |
| **Priority** | P1 (High) |
| **Type** | Navigation |

**Preconditions:**
- A published case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher with published case | Dashboard loads |
| 2 | Click "INFO" button | Navigate to `/teacher/responses-feedback/{caseId}` |
| 3 | Verify URL | URL contains `/teacher/responses-feedback/` |

**Code skeleton:**

```typescript
test("TC-TDASH-005: INFO button navigates to responses page", async ({ page }) => {
  const infoButton = page.locator('a[href*="/teacher/responses-feedback/"]').first();
  await infoButton.click();

  await expect(page).toHaveURL(/\/teacher\/responses-feedback\//);
});
```

---

### 4.6 Recent Case Studies List

| Field | Value |
|---|---|
| **ID** | TC-TDASH-006 |
| **Title** | Recent case studies are displayed as cards |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Preconditions:**
- At least one archived case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher with archived cases | Dashboard loads |
| 2 | Verify "RECENT CASE STUDIES" section | Heading visible |
| 3 | Verify case cards rendered | At least one case card visible |
| 4 | Verify "View All" link | "View All" link visible, href="/teacher/cases" |

**Code skeleton:**

```typescript
test("TC-TDASH-006: Recent case studies displayed", async ({ page }) => {
  await expect(page.locator("text=RECENT CASE STUDIES")).toBeVisible();

  // Check for case cards (rendered as Link elements)
  const caseCards = page.locator('a[href*="/teacher/responses-feedback/"]');
  const count = await caseCards.count();
  expect(count).toBeGreaterThan(0);

  // Check for "View All" link
  await expect(page.locator('a[href="/teacher/cases"]:has-text("View All")')).toBeVisible();
});
```

---

### 4.7 No Recent Cases

| Field | Value |
|---|---|
| **ID** | TC-TDASH-007 |
| **Title** | Dashboard shows "no recent case studies" when list is empty |
| **Priority** | P2 (Medium) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher with no archived cases | Dashboard loads |
| 2 | Verify message | "You have no recent case studies." visible |

**Code skeleton:**

```typescript
test("TC-TDASH-007: No recent cases message", async ({ page }) => {
  await expect(page.locator("text=You have no recent case studies.")).toBeVisible();
});
```

---

### 4.8 Case Card Click Navigation

| Field | Value |
|---|---|
| **ID** | TC-TDASH-008 |
| **Title** | Clicking a case card navigates to responses-feedback page |
| **Priority** | P1 (High) |
| **Type** | Navigation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher with archived cases | Dashboard loads |
| 2 | Click on first case card | Navigate to `/teacher/responses-feedback/{id}` |
| 3 | Verify URL | URL contains `/teacher/responses-feedback/` |

**Code skeleton:**

```typescript
test("TC-TDASH-008: Case card click navigates to responses", async ({ page }) => {
  const firstCard = page.locator('a[href*="/teacher/responses-feedback/"]').first();
  await firstCard.click();

  await expect(page).toHaveURL(/\/teacher\/responses-feedback\//);
});
```

---

### 4.9 Mobile Create Button

| Field | Value |
|---|---|
| **ID** | TC-TDASH-009 |
| **Title** | Mobile-only create button is visible on small viewports |
| **Priority** | P2 (Medium) |
| **Type** | UI / Responsive |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Set viewport to mobile (375x667) | Mobile layout |
| 2 | Login as teacher | Dashboard loads |
| 3 | Verify mobile create button | Button visible (different from desktop button) |

**Code skeleton:**

```typescript
test("TC-TDASH-009: Mobile create button visible", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
  await page.click("button:has-text('SIGN IN')");
  await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });

  // Mobile create button should be visible
  const mobileButton = page.locator('.block.sm\\:hidden a[href="/teacher/case-studies/create"], .block.sm\\:hidden button:has-text("Create")');
  await expect(mobileButton.first()).toBeVisible();
});
```

---

## 4. Implementation Approach

### 4.1 Test Fixtures

```typescript
// tests/fixtures/teacher.fixture.ts
import { test as base } from "@playwright/test";

interface TeacherFixtures {
  teacherEmail: string;
  teacherPassword: string;
}

export const test = base.extend<TeacherFixtures>({
  teacherEmail: [process.env.TEST_TEACHER_EMAIL!, { option: true }],
  teacherPassword: [process.env.TEST_TEACHER_PASSWORD!, { option: true }],
});

export { expect } from "@playwright/test";
```

### 4.2 Setup: Seed Published Case

```typescript
// tests/helpers/seed-case.ts
export async function seedPublishedCase(accessToken: string) {
  const response = await fetch(`${process.env.PLAYWRIGHT_BASE_URL}/api/case/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      caseTopic: "Test Case Topic",
      caseDescription: "Test description",
      caseExplanation: "Test explanation",
      caseTeaching: "Test teaching",
      caseDeadline: new Date(Date.now() + 86400000).toISOString(),
      // ... other required fields
    }),
  });
  return response.json();
}
```

---

## 5. Directory Structure

```
tests/
├── teacher-dashboard/
│   ├── dashboard-loads.spec.ts        # TC-TDASH-001
│   ├── published-case.spec.ts         # TC-TDASH-002
│   ├── no-active-case.spec.ts         # TC-TDASH-003
│   ├── create-button.spec.ts          # TC-TDASH-004
│   ├── info-button.spec.ts            # TC-TDASH-005
│   ├── recent-cases.spec.ts           # TC-TDASH-006
│   ├── no-recent-cases.spec.ts        # TC-TDASH-007
│   ├── case-card-click.spec.ts        # TC-TDASH-008
│   └── mobile-create.spec.ts          # TC-TDASH-009
├── fixtures/
│   └── teacher.fixture.ts             # Teacher test fixtures
└── helpers/
    └── seed-case.ts                   # Case seeding helper
```

---

> **This plan should be saved to `specs/teacher-dashboard-test-plan.md`.**
