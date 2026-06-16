# Student Dashboard — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Student dashboard page at `/student/dashboard`, active case display, recent responses
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
Browser (/student/dashboard)           Redux Slices                    API Gateway
┌─────────────────────────┐  dispatch  ┌──────────────────┐  GET    ┌────────────┐
│ useAuthRedirect()       │ ─────────► │ activeCase       │ ──────► │ /case/     │
│  → session              │           │ Slice            │        │ publish    │
│                         │           │                  │ ◄────── │            │
│ useGetActiveCase()      │           └──────────────────┘        └────────────┘
│ useGetStudentsResponses │
│   ToCases()             │  dispatch  ┌──────────────────┐  GET    ┌────────────┐
│                         │ ─────────► │ studentsResponses│ ──────► │ /student/  │
│                         │           │ ToCases Slice    │        │ responses/ │
│                         │           │                  │ ◄────── │            │
│ Presentation:           │           └──────────────────┘        └────────────┘
│ StudentDashboard.tsx    │
└─────────────────────────┘
```

### Key Components

From `src/presentation/student/Dashboard.tsx`:

- **Active Case Section**:
  - If published case exists: shows case info (topic, CME credit, faculty, dates)
  - "View Case" button → `/student/case-studies/{id}`
  - If no case: "There is no active case at the moment."
- **Recent Case Studies**: Grid of student's past responses
  - ResponseCaseCard for each response
  - Empty state: "You have no recent case studies."

### Redux State Dependencies

| Slice | Selector | Data |
|---|---|---|
| `activeCase` | `state.activeCase.data` | Published case info |
| `studentsResponsesToCases` | `state.studentsResponsesToCases.responses` | Array of student responses |

### Testability Requirements

The following `data-testid` attributes must be added to the student dashboard page before implementing tests:

| data-testid | Element | Notes |
|---|---|---|
| `student-dashboard-title` | Page heading / title | — |
| `student-dashboard-active-case` | Active case study card | Shows current published case |
| `student-dashboard-no-case` | Empty state when no active case | — |
| `student-dashboard-recent-response` | Recent responses summary | — |
| `student-dashboard-nav-cases` | "Case Studies" navigation link | — |
| `student-dashboard-nav-certificates` | "Certificates" navigation link | — |
| `student-dashboard-nav-settings` | Settings navigation link | — |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Student user confirmed in Cognito
- Optionally: a published case exists, student has past responses

---

## 3. Test Scenarios

### 4.1 Dashboard Loads for Authenticated Student

| Field | Value |
|---|---|
| **ID** | TC-SDASH-001 |
| **Title** | Student dashboard loads successfully for authenticated student |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Redirect to `/student/dashboard` |
| 2 | Verify page loads | Page content visible |
| 3 | Verify "ONGOING CASE STUDY" or no-case message | Section visible |
| 4 | Verify "RECENT CASE STUDIES" section | Heading visible |

**Code skeleton:**

```typescript
// tests/student-dashboard/dashboard-loads.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Student Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });
  });

  test("TC-SDASH-001: Dashboard loads with correct sections", async ({ page }) => {
    // Verify ongoing case section (either case info or no-case message)
    const ongoingSection = page.locator("text=ONGOING CASE STUDY").or(
      page.locator("text=There is no active case at the moment.")
    );
    await expect(ongoingSection).toBeVisible();

    // Verify recent cases section
    await expect(page.locator("text=RECENT CASE STUDIES")).toBeVisible();
  });
});
```

---

### 4.2 Dashboard With Active Published Case

| Field | Value |
|---|---|
| **ID** | TC-SDASH-002 |
| **Title** | Dashboard displays active case information when a case is published |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A published case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student with active case | Dashboard loads |
| 2 | Verify "ONGOING CASE STUDY" heading | Heading visible |
| 3 | Verify CME credit display | "1 CME" text visible |
| 4 | Verify faculty info | Faculty name visible |
| 5 | Verify created date | "Created:" label with date |
| 6 | Verify deadline | "Deadline:" label with date |
| 7 | Verify "View Case" button | Button visible, links to case page |

**Code skeleton:**

```typescript
test("TC-SDASH-002: Active case info displayed", async ({ page }) => {
  await expect(page.locator("text=ONGOING CASE STUDY")).toBeVisible();

  // Check for case details
  await expect(page.locator("text=1 CME")).toBeVisible();
  await expect(page.locator("text=Faculty:")).toBeVisible();
  await expect(page.locator("text=Created:")).toBeVisible();
  await expect(page.locator("text=Deadline:")).toBeVisible();

  // Check View Case button
  await expect(page.locator("button:has-text('View Case'), a:has-text('View Case')")).toBeVisible();
});
```

---

### 4.3 Dashboard Without Active Case

| Field | Value |
|---|---|
| **ID** | TC-SDASH-003 |
| **Title** | Dashboard shows "no active case" when no case is published |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student without active case | Dashboard loads |
| 2 | Verify "no active case" message | "There is no active case at the moment." visible |
| 3 | Verify no "View Case" button | Button not present |

**Code skeleton:**

```typescript
test("TC-SDASH-003: No active case message", async ({ page }) => {
  await expect(page.locator("text=There is no active case at the moment.")).toBeVisible();

  // View Case button should not be present
  const viewCaseButton = page.locator("button:has-text('View Case'), a:has-text('View Case')");
  await expect(viewCaseButton).not.toBeVisible();
});
```

---

### 4.4 View Case Button Navigation

| Field | Value |
|---|---|
| **ID** | TC-SDASH-004 |
| **Title** | "View Case" button navigates to case study page |
| **Priority** | P0 (Critical) |
| **Type** | Navigation |

**Preconditions:**
- A published case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student with active case | Dashboard loads |
| 2 | Click "View Case" button | Navigate to `/student/case-studies/{id}` |
| 3 | Verify URL | URL contains `/student/case-studies/` |

**Code skeleton:**

```typescript
test("TC-SDASH-004: View Case button navigates to case page", async ({ page }) => {
  const viewCaseButton = page.locator('a:has-text("View Case"), button:has-text("View Case")').first();
  await viewCaseButton.click();

  await expect(page).toHaveURL(/\/student\/case-studies\//);
});
```

---

### 4.5 Recent Case Studies List

| Field | Value |
|---|---|
| **ID** | TC-SDASH-005 |
| **Title** | Recent case studies are displayed as response cards |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Preconditions:**
- Student has past responses

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student with past responses | Dashboard loads |
| 2 | Verify "RECENT CASE STUDIES" section | Heading visible |
| 3 | Verify response cards | At least one ResponseCaseCard visible |

**Code skeleton:**

```typescript
test("TC-SDASH-005: Recent case studies displayed", async ({ page }) => {
  await expect(page.locator("text=RECENT CASE STUDIES")).toBeVisible();

  // Check for response cards (rendered as list items or cards)
  const responseCards = page.locator(".grid > li, .grid > div[class*='cursor']");
  const count = await responseCards.count();
  expect(count).toBeGreaterThan(0);
});
```

---

### 4.6 No Recent Cases

| Field | Value |
|---|---|
| **ID** | TC-SDASH-006 |
| **Title** | Dashboard shows "no recent case studies" when list is empty |
| **Priority** | P2 (Medium) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student with no past responses | Dashboard loads |
| 2 | Verify message | "You have no recent case studies." visible |

**Code skeleton:**

```typescript
test("TC-SDASH-006: No recent cases message", async ({ page }) => {
  await expect(page.locator("text=You have no recent case studies.")).toBeVisible();
});
```

---

### 4.7 Response Card Click Navigation

| Field | Value |
|---|---|
| **ID** | TC-SDASH-007 |
| **Title** | Clicking a response card navigates to case study page |
| **Priority** | P1 (High) |
| **Type** | Navigation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student with past responses | Dashboard loads |
| 2 | Click on first response card | Navigate to case study page |
| 3 | Verify URL | URL contains `/student/case-studies/` |

**Code skeleton:**

```typescript
test("TC-SDASH-007: Response card click navigates to case", async ({ page }) => {
  const firstCard = page.locator(".grid > li, .grid > div[class*='cursor']").first();
  await firstCard.click();

  await expect(page).toHaveURL(/\/student\/case-studies\//);
});
```

---

### 4.8 Dashboard Resets State on Load

| Field | Value |
|---|---|
| **ID** | TC-SDASH-008 |
| **Title** | Dashboard resets Redux state on mount |
| **Priority** | P2 (Medium) |
| **Type** | Integration |

**Note:** The student dashboard dispatches reset actions on mount. This test verifies the UI reflects fresh state.

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student | Dashboard loads |
| 2 | Navigate away (e.g., to settings) | Different page |
| 3 | Navigate back to dashboard | Fresh state loaded |
| 4 | Verify content | Correct data displayed (no stale data) |

**Code skeleton:**

```typescript
test("TC-SDASH-008: Dashboard loads fresh state", async ({ page }) => {
  // Dashboard loads initially
  await expect(page.locator("text=RECENT CASE STUDIES")).toBeVisible();

  // Navigate away
  await page.goto("/student/settings");
  await page.waitForTimeout(1000);

  // Navigate back
  await page.goto("/student/dashboard");

  // Should load fresh data
  await expect(page.locator("text=RECENT CASE STUDIES")).toBeVisible();
});
```

---

## 4. Implementation Approach

### 4.1 Test Data Requirements

```typescript
process.env.TEST_STUDENT_EMAIL;
process.env.TEST_STUDENT_PASSWORD;
process.env.TEST_STUDENT_WITH_CASE_ID;     // Student with active case
process.env.TEST_STUDENT_NO_CASE_ID;       // Student without active case
```

### 4.2 Component Selectors

- Active case section: `.ongoing-case` (from CSS class in dashboard)
- Case info: `h5.font-bold` for topic, `text=Created:`, `text=Deadline:`
- View Case button: `button:has-text('View Case')` or `a:has-text('View Case')`
- Recent cases: `.grid > li` or `.grid > div`

---

## 5. Directory Structure

```
tests/
├── student-dashboard/
│   ├── dashboard-loads.spec.ts        # TC-SDASH-001
│   ├── active-case.spec.ts            # TC-SDASH-002
│   ├── no-active-case.spec.ts         # TC-SDASH-003
│   ├── view-case-button.spec.ts       # TC-SDASH-004
│   ├── recent-cases.spec.ts           # TC-SDASH-005
│   ├── no-recent-cases.spec.ts        # TC-SDASH-006
│   ├── response-card-click.spec.ts    # TC-SDASH-007
│   └── fresh-state.spec.ts            # TC-SDASH-008
```

---

> **This plan should be saved to `specs/student-dashboard-test-plan.md`.**
