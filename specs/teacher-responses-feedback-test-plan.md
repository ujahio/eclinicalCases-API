# Teacher Responses & Feedback — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Viewing student responses and adding feedback on responses
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

### Responses & Feedback Flow

```
Browser (/teacher/responses-feedback/{id})
┌─────────────────────────────────────────┐
│ ResponsesAndFeedback.tsx                │
│                                         │
│ 1. Case Info Card                       │
│    - caseTopic                          │
│    - totalResponses count               │
│    - feedbackCount                      │
│                                         │
│ 2. Student Response Cards               │
│    - firstName + lastName               │
│    - submittedAt                        │
│    - Click → opens ResponseFeedbackModal│
│                                         │
│ 3. ResponseFeedbackModal                │
│    - Student's response details         │
│    - Feedback form                      │
│    - Submit feedback → POST /add/feedback│
└─────────────────────────────────────────┘
```

### Key Components

From `src/presentation/teacher/ResponsesAndFeedback.tsx`:

- **Case Info Card**: Shows case topic, response count, feedback count
- **Student Cards**: Grid of student response cards with name and submission date
- **ResponseFeedbackModal**: Modal with student response details and feedback form

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/case/data/{caseID}` | GET | Get case data including responses and feedback |
| `/api/case/add/feedback` | POST | Add feedback on a student response |

### Redux State

| Slice | Selector | Data |
|---|---|---|
| `getCaseData` | `state.getCaseData` | Case info + responses + feedback |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Teacher user confirmed in Cognito
- A published case with student responses exists

### 2.2 Test Data Setup

Need:
1. A published case ID
2. At least one student response to that case

```typescript
// Seed via API in test setup
const CASE_ID = process.env.TEST_PUBLISHED_CASE_ID!;
```

---

## 3. Test Scenarios

### 4.1 Responses Page Loads

| Field | Value |
|---|---|
| **ID** | TC-RF-001 |
| **Title** | Responses and feedback page loads with case info |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- Teacher is logged in
- A published case with responses exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/responses-feedback/{caseId}` | Page loads |
| 2 | Verify case info card | Case topic displayed |
| 3 | Verify response count | "X Responses" badge visible |
| 4 | Verify feedback count | "X Feedback" badge visible |

**Code skeleton:**

```typescript
// tests/teacher-responses-feedback/page-loads.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Teacher Responses & Feedback", () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });
  });

  test("TC-RF-001: Page loads with case info", async ({ page }) => {
    const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
    await page.goto(`/teacher/responses-feedback/${caseId}`);

    // Verify case info card is visible
    await expect(page.locator("article")).toBeVisible();

    // Verify response/feedback counts
    await expect(page.locator("text=Responses")).toBeVisible();
    await expect(page.locator("text=Feedback")).toBeVisible();
  });
});
```

---

### 4.2 Student Response Cards Displayed

| Field | Value |
|---|---|
| **ID** | TC-RF-002 |
| **Title** | Student response cards are displayed in a grid |
| **Priority** | P0 (Critical) |
| **Type** | Functional |

**Preconditions:**
- At least one student has submitted a response

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to responses page | Page loads |
| 2 | Verify student cards rendered | At least one card with student name |
| 3 | Verify student name | firstName + lastName visible |
| 4 | Verify submission date | "Submitted on: {date}" visible |

**Code skeleton:**

```typescript
test("TC-RF-002: Student response cards displayed", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/teacher/responses-feedback/${caseId}`);

  // Verify student cards are rendered
  const studentCards = page.locator('[id="firsStudent"], .grid > div[role="button"], .grid > div[class*="cursor-pointer"]');
  const count = await studentCards.count();
  expect(count).toBeGreaterThan(0);

  // Verify student name is displayed
  await expect(studentCards.first().locator("h2")).toBeVisible();
});
```

---

### 4.3 Click Student Card Opens Modal

| Field | Value |
|---|---|
| **ID** | TC-RF-003 |
| **Title** | Clicking a student card opens the response feedback modal |
| **Priority** | P0 (Critical) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to responses page | Page loads |
| 2 | Click on first student card | Modal opens |
| 3 | Verify modal content | Student name, response details visible |
| 4 | Verify close button | Modal can be closed |

**Code skeleton:**

```typescript
test("TC-RF-003: Click student card opens modal", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/teacher/responses-feedback/${caseId}`);

  // Click first student card
  const firstCard = page.locator('[id="firsStudent"], .grid > div[class*="cursor-pointer"]').first();
  await firstCard.click();

  // Modal should open (check for modal overlay or content)
  const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
});
```

---

### 4.4 Add Feedback on Student Response

| Field | Value |
|---|---|
| **ID** | TC-RF-004 |
| **Title** | Teacher adds feedback on a student response via modal |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A student response exists
- Modal opens when clicking student card

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to responses page | Page loads |
| 2 | Click student card | Modal opens |
| 3 | Locate feedback textarea/input | Input visible |
| 4 | Enter feedback text | Field shows input |
| 5 | Click submit feedback button | API call to POST `/api/case/add/feedback` |
| 6 | Verify success | Modal closes or success message shown |
| 7 | Verify feedback count increased | Feedback count updated |

**Code skeleton:**

```typescript
test("TC-RF-004: Add feedback on student response", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/teacher/responses-feedback/${caseId}`);

  // Click first student card
  const firstCard = page.locator('[id="firsStudent"], .grid > div[class*="cursor-pointer"]').first();
  await firstCard.click();

  // Wait for modal
  await page.waitForTimeout(1000);

  // Find feedback input (textarea or input in modal)
  const feedbackInput = page.locator('textarea, input[placeholder*="feedback"], [contenteditable="true"]').last();

  if (await feedbackInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await feedbackInput.fill("Great work on this case study!");

    // Click submit
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Send"), button:has-text("Add Feedback")').last();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for success
      await page.waitForTimeout(3000);

      // Verify modal closed or success message
    }
  }
});
```

---

### 4.5 Empty Responses State

| Field | Value |
|---|---|
| **ID** | TC-RF-005 |
| **Title** | Page shows appropriate state when no responses exist |
| **Priority** | P2 (Medium) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to responses page for case with no responses | Page loads |
| 2 | Verify case info shows "0 Responses" | Count is 0 |
| 3 | Verify no student cards rendered | Empty grid |

**Code skeleton:**

```typescript
test("TC-RF-005: Empty responses state", async ({ page }) => {
  // This test needs a case with no responses
  const caseId = process.env.TEST_CASE_NO_RESPONSES_ID!;
  await page.goto(`/teacher/responses-feedback/${caseId}`);

  // Verify 0 responses
  await expect(page.locator("text=0 Responses")).toBeVisible();

  // Verify no student cards
  const studentCards = page.locator('[id="firsStudent"]');
  expect(await studentCards.count()).toBe(0);
});
```

---

### 4.6 Navigation Back to Dashboard

| Field | Value |
|---|---|
| **ID** | TC-RF-006 |
| **Title** | Navigation from responses page back to dashboard works |
| **Priority** | P2 (Medium) |
| **Type** | Navigation |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to responses page | Page loads |
| 2 | Click dashboard link/icon in sidebar | Navigate to `/teacher/dashboard` |
| 3 | Verify URL | URL is `/teacher/dashboard` |

**Code skeleton:**

```typescript
test("TC-RF-006: Navigation back to dashboard", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/teacher/responses-feedback/${caseId}`);

  // Find dashboard link in sidebar/navigation
  const dashboardLink = page.locator('a[href="/teacher/dashboard"]').first();
  if (await dashboardLink.isVisible()) {
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/teacher\/dashboard/);
  }
});
```

---

## 4. Implementation Approach

### 4.1 Test Data Requirements

```typescript
// Required test data
process.env.TEST_PUBLISHED_CASE_ID;     // Case with responses
process.env.TEST_CASE_NO_RESPONSES_ID;  // Case without responses
```

### 4.2 Modal Interaction Pattern

```typescript
// Common pattern for modal interactions
async function openStudentModal(page: Page, studentIndex = 0) {
  const card = page.locator('[id="firsStudent"], .grid > div[class*="cursor-pointer"]').nth(studentIndex);
  await card.click();
  await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
}

async function closeModal(page: Page) {
  const closeBtn = page.locator('[role="dialog"] button[class*="close"], .modal button[class*="close"], button:has-text("×")');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
}
```

---

## 5. Directory Structure

```
tests/
├── teacher-responses-feedback/
│   ├── page-loads.spec.ts             # TC-RF-001
│   ├── student-cards.spec.ts          # TC-RF-002
│   ├── open-modal.spec.ts             # TC-RF-003
│   ├── add-feedback.spec.ts           # TC-RF-004
│   ├── empty-responses.spec.ts        # TC-RF-005
│   └── navigation.spec.ts             # TC-RF-006
└── fixtures/
    └── case-data.fixture.ts           # Case test data fixtures
```

---

> **This plan should be saved to `specs/teacher-responses-feedback-test-plan.md`.**
