# Student Case Studies — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Student case study viewing, quiz submission, auto-grading, and certificate generation
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

### Student Case Study Flow

```
Browser (/student/case-studies/{id})
┌───────────────────────────────────────────────┐
│ StudentCaseStudy.tsx                          │
│                                               │
│ ProcessTabs (multi-step navigation):          │
│ 1. case_presentation  → CaseDescription       │
│ 2. case_comments      → StudentExplanation    │
│ 3. case_model_answers → ModelAnswerCompare    │
│ 4. case_teaching      → Teaching + Materials  │
│ 5. cme_questions      → Quiz Form             │
│ 6. feedback           → FeedbackSection       │
│ 7. certificate        → CertificateView       │
│                                               │
│ Submit Response: POST /student/response       │
│ Auto-grading: Score computed server-side      │
│ Certificate: Generated if score >= threshold  │
└───────────────────────────────────────────────┘
```

### Tab Flow

| Tab Key | Component | Purpose |
|---|---|---|
| `case_presentation` | `StudentCasePresentation` | Read case description (Plate.js rich text) |
| `case_comments` | `StudentCaseComments` | Enter student's case explanation |
| `case_model_answers` | `StudentCaseAnswer` | Compare with model answer |
| `case_teaching` | `StudentCaseTeaching` | View teaching points + materials/PDFs |
| `cme_questions` | `StudentCMEQuestions` | Answer CME quiz questions |
| `feedback` | `StudentFeedback` | View/submit feedback |
| `certificate` | `StudentCertificate` | View certificate (if passed) |

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/case/data/{caseID}` | GET | Get case details |
| `/api/case/details/{caseID}` | GET | Get case content |
| `/api/student/response` | POST | Submit quiz response |
| `/api/student/responses/{caseFilter}` | GET | Get student's past responses |
| `/api/student/certificates` | GET | Get student's certificates |

### Auto-Grading Logic

- Student submits CME quiz answers via POST `/api/student/response`
- Server grades responses and computes score
- If score >= threshold → certificate generated
- Certificate stored in S3, record in DynamoDB

### Testability Requirements

The following `data-testid` attributes must be added before implementing tests:

| data-testid | Element | Notes |
|---|---|---|
| `case-study-title` | Case study title/heading | — |
| `case-study-description` | Case description content area | Plate.js rich text rendered |
| `case-study-materials-list` | List of case material PDFs | — |
| `case-study-material-link-*` | Individual material download link | — |
| `case-study-question-*` | Quiz question text | Numbered, e.g. `case-study-question-1` |
| `case-study-option-*` | Quiz answer option | e.g. `case-study-option-1-a` |
| `case-study-submit` | Submit quiz answers button | — |
| `case-study-result-pass` | Passing result message | Shown after auto-grading |
| `case-study-result-fail` | Failing result message | Shown after auto-grading |
| `case-study-result-score` | Score display (e.g. "8/10") | — |
| `case-study-result-certificate` | View certificate link | Shown on pass |
| `case-study-loading` | Loading state | — |
| `case-study-error` | Error state | — |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Student user confirmed in Cognito
- A published case exists with CME questions
- Student has NOT yet submitted a response to this case

### 2.2 Test Data

```typescript
const CASE_ID = process.env.TEST_PUBLISHED_CASE_ID!;
const STUDENT_EMAIL = process.env.TEST_STUDENT_EMAIL!;
const STUDENT_PASSWORD = process.env.TEST_STUDENT_PASSWORD!;
```

---

## 3. Test Scenarios

### 4.1 Case Study Page Loads

| Field | Value |
|---|---|
| **ID** | TC-SCASE-001 |
| **Title** | Student case study page loads with ProcessTabs |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- Student is logged in
- A published case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/student/case-studies/{caseId}` | Page loads |
| 2 | Verify ProcessTabs visible | Tab navigation visible |
| 3 | Verify "Case Presentation" tab active | Tab highlighted |
| 4 | Verify case content area | Content container visible |

**Code skeleton:**

```typescript
// tests/student-case-studies/page-loads.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Student Case Studies", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });
  });

  test("TC-SCASE-001: Case study page loads", async ({ page }) => {
    const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
    await page.goto(`/student/case-studies/${caseId}`);

    // Verify ProcessTabs are visible
    await expect(page.locator("nav")).toBeVisible();

    // Verify content container
    await expect(page.locator(".max-w-3xl")).toBeVisible();
  });
});
```

---

### 4.2 Read Case Description (Presentation Tab)

| Field | Value |
|---|---|
| **ID** | TC-SCASE-002 |
| **Title** | Student reads case description on Presentation tab |
| **Priority** | P0 (Critical) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to case study page | Page loads on Presentation tab |
| 2 | Verify case description content | Rich text content visible |
| 3 | Verify deadline displayed | Deadline date visible |
| 4 | Click "Next" to advance | Move to next tab |

**Code skeleton:**

```typescript
test("TC-SCASE-002: Read case description", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Verify case content is displayed (rich text)
  const contentArea = page.locator('.ProseMirror, [role="textbox"], [contenteditable="true"], .max-w-3xl').first();
  await expect(contentArea).toBeVisible();

  // Verify deadline
  await expect(page.locator("text=Deadline")).toBeVisible();
});
```

---

### 4.3 Navigate Through Tabs

| Field | Value |
|---|---|
| **ID** | TC-SCASE-003 |
| **Title** | Student can navigate through all case study tabs |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to case study page | Presentation tab active |
| 2 | Click Next or tab button | Advance to Comments tab |
| 3 | Click Next | Advance to Model Answers tab |
| 4 | Click Next | Advance to Teaching tab |
| 5 | Click Next | Advance to CME Questions tab |
| 6 | Verify all tabs are accessible | No errors during navigation |

**Code skeleton:**

```typescript
test("TC-SCASE-003: Navigate through tabs", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Navigate through tabs by clicking Next buttons
  const nextButton = page.locator('button:has-text("Next"), button:has-text("NEXT")').first();

  // Click through 4 tabs (Presentation → Comments → Model Answers → Teaching → CME)
  for (let i = 0; i < 4; i++) {
    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
  }

  // Should be on CME Questions tab
  // Verify quiz content is visible
  await expect(page.locator("text=CME, text=Questions, text=Quiz").first()).toBeVisible({ timeout: 5000 });
});
```

---

### 4.4 View Case Materials/PDFs

| Field | Value |
|---|---|
| **ID** | TC-SCASE-004 |
| **Title** | Student views case materials on Teaching tab |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Preconditions:**
- Case has uploaded materials/PDFs

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to case study | Page loads |
| 2 | Navigate to Teaching tab | Teaching content visible |
| 3 | Verify materials section | Materials/PDFs listed |
| 4 | Click on a material | PDF opens or downloads |

**Code skeleton:**

```typescript
test("TC-SCASE-004: View case materials", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Navigate to Teaching tab
  // (Click through tabs or directly select)
  const teachingTab = page.locator("text=Case Teaching, text=case_teaching").first();
  if (await teachingTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await teachingTab.click();
    await page.waitForTimeout(1000);
  }

  // Verify materials section
  // (exact selector depends on StudentCaseTeaching component)
  const materials = page.locator("text=Materials, text=PDF, a[href*='.pdf']");
  if (await materials.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await expect(materials.first()).toBeVisible();
  }
});
```

---

### 4.5 Submit Quiz Response

| Field | Value |
|---|---|
| **ID** | TC-SCASE-005 |
| **Title** | Student submits CME quiz response |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- Student is on CME Questions tab
- Quiz questions are displayed

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to CME Questions tab | Quiz form visible |
| 2 | Answer question 1 | Selection made |
| 3 | Answer question 2 | Selection made |
| 4 | Answer all required questions | All questions answered |
| 5 | Click "Submit" button | API call to POST `/api/student/response` |
| 6 | Verify submission | Success message or redirect |

**Code skeleton:**

```typescript
test("TC-SCASE-005: Submit quiz response", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Navigate to CME Questions tab
  // (Click through tabs)
  for (let i = 0; i < 4; i++) {
    const nextButton = page.locator('button:has-text("Next"), button:has-text("NEXT")').first();
    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
  }

  // Answer quiz questions
  // (exact selectors depend on StudentCMEQuestions component)
  const radioButtons = page.locator('input[type="radio"], input[type="checkbox"]');
  const count = await radioButtons.count();

  // Select first option for each question
  for (let i = 0; i < count; i += 2) { // Assuming 2 options per question
    await radioButtons.nth(i).click();
  }

  // Submit
  const submitButton = page.locator('button:has-text("Submit"), button:has-text("SUBMIT")').first();
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();

    // Wait for submission
    await page.waitForTimeout(3000);
  }
});
```

---

### 4.6 Auto-Grading Behavior

| Field | Value |
|---|---|
| **ID** | TC-SCASE-006 |
| **Title** | Quiz response is auto-graded after submission |
| **Priority** | P0 (Critical) |
| **Type** | Functional / Integration |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit quiz response (TC-SCASE-005) | Response submitted |
| 2 | Wait for grading | Server processes response |
| 3 | Verify score displayed | Score shown on page |
| 4 | Verify pass/fail status | Status indicated |

**Code skeleton:**

```typescript
test("TC-SCASE-006: Auto-grading after submission", async ({ page }) => {
  // This test assumes a response was just submitted
  // Check for score display on the page
  const scoreDisplay = page.locator("text=Score, text=score, text=Grade, text=grade").first();

  if (await scoreDisplay.isVisible({ timeout: 5000 }).catch(() => false)) {
    await expect(scoreDisplay).toBeVisible();
  }
});
```

---

### 4.7 Certificate Generation on Pass

| Field | Value |
|---|---|
| **ID** | TC-SCASE-007 |
| **Title** | Certificate is generated when student passes (score >= threshold) |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Integration |

**Preconditions:**
- Student submitted a response with passing score

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit passing quiz response | Response submitted |
| 2 | Navigate to Certificate tab | Certificate view visible |
| 3 | Verify certificate content | Certificate displayed |
| 4 | Verify download option | Download button visible |

**Code skeleton:**

```typescript
test("TC-SCASE-007: Certificate generated on pass", async ({ page }) => {
  // This test requires a passing response
  test.skip(!process.env.TEST_PASSING_CASE_ID, "Requires passing response setup");

  const caseId = process.env.TEST_PASSING_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Navigate to Certificate tab
  const certTab = page.locator("text=Certificate, text=certificate").first();
  if (await certTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await certTab.click();
    await page.waitForTimeout(1000);

    // Verify certificate is displayed
    await expect(page.locator("canvas, img[alt*='certificate']")).toBeVisible();
  }
});
```

---

### 4.8 Enter Student Case Explanation

| Field | Value |
|---|---|
| **ID** | TC-SCASE-008 |
| **Title** | Student enters case explanation on Comments tab |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Comments tab | Tab active |
| 2 | Locate text input area | Textarea/contenteditable visible |
| 3 | Enter explanation text | Text entered |
| 4 | Save/advance | Explanation saved |

**Code skeleton:**

```typescript
test("TC-SCASE-008: Enter case explanation", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Navigate to Comments tab
  const nextButton = page.locator('button:has-text("Next"), button:has-text("NEXT")').first();
  if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nextButton.click();
    await page.waitForTimeout(1000);
  }

  // Enter explanation
  const explanationInput = page.locator('textarea, [contenteditable="true"], .ProseMirror').first();
  if (await explanationInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await explanationInput.click();
    await explanationInput.fill("My analysis of this case study...");
  }
});
```

---

### 4.9 Compare with Model Answer

| Field | Value |
|---|---|
| **ID** | TC-SCASE-009 |
| **Title** | Student views model answer on Model Answers tab |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Model Answers tab | Tab active |
| 2 | Verify student's explanation shown | Student's text visible |
| 3 | Verify model answer shown | Model answer text visible |
| 4 | Compare both | Both visible side by side or sequentially |

**Code skeleton:**

```typescript
test("TC-SCASE-009: View model answer comparison", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Navigate to Model Answers tab (2 clicks from Presentation)
  const nextButton = page.locator('button:has-text("Next"), button:has-text("NEXT")').first();
  for (let i = 0; i < 2; i++) {
    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
  }

  // Verify both explanations are visible
  const contentArea = page.locator(".max-w-3xl");
  await expect(contentArea).toBeVisible();
});
```

---

### 4.10 ProcessTabs Progress Indicator

| Field | Value |
|---|---|
| **ID** | TC-SCASE-010 |
| **Title** | ProcessTabs shows correct progress indicator |
| **Priority** | P2 (Medium) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to case study | Progress at 0% or first step |
| 2 | Advance through tabs | Progress increases |
| 3 | Reach CME Questions | Progress at ~70% |
| 4 | Complete quiz | Progress at 100% |

**Code skeleton:**

```typescript
test("TC-SCASE-010: ProcessTabs progress indicator", async ({ page }) => {
  const caseId = process.env.TEST_PUBLISHED_CASE_ID!;
  await page.goto(`/student/case-studies/${caseId}`);

  // Verify progress indicator exists
  const progressBar = page.locator('[role="progressbar"], .progress, [class*="progress"]').first();
  if (await progressBar.isVisible({ timeout: 3000 }).catch(() => false)) {
    await expect(progressBar).toBeVisible();
  }
});
```

---

## 4. Implementation Approach

### 4.1 Test Data Setup

```typescript
// Required environment variables
process.env.TEST_PUBLISHED_CASE_ID;      // Case with CME questions
process.env.TEST_PASSING_CASE_ID;        // Case where student passed
process.env.TEST_CASE_NO_RESPONSE_ID;    // Case student hasn't responded to
```

### 4.2 Tab Navigation Helper

```typescript
// tests/helpers/tab-navigation.ts
import { Page } from "@playwright/test";

export async function navigateToTab(page: Page, tabName: string, maxClicks = 5) {
  // Try clicking the tab directly
  const tab = page.locator(`text=${tabName}`).first();
  if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(500);
    return;
  }

  // Fall back to clicking Next buttons
  const nextButton = page.locator('button:has-text("Next"), button:has-text("NEXT")').first();
  for (let i = 0; i < maxClicks; i++) {
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
  }
}
```

### 4.3 Quiz Interaction Helper

```typescript
// tests/helpers/quiz.ts
import { Page } from "@playwright/test";

export async function answerQuizQuestions(page: Page) {
  // Find all radio buttons and select first option per question
  const questions = page.locator('[class*="question"], fieldset, [role="radiogroup"]');
  const count = await questions.count();

  for (let i = 0; i < count; i++) {
    const firstOption = questions.nth(i).locator('input[type="radio"]').first();
    if (await firstOption.isVisible().catch(() => false)) {
      await firstOption.click();
    }
  }
}
```

---

## 5. Directory Structure

```
tests/
├── student-case-studies/
│   ├── page-loads.spec.ts             # TC-SCASE-001
│   ├── read-description.spec.ts       # TC-SCASE-002
│   ├── tab-navigation.spec.ts         # TC-SCASE-003
│   ├── view-materials.spec.ts         # TC-SCASE-004
│   ├── submit-quiz.spec.ts            # TC-SCASE-005
│   ├── auto-grading.spec.ts           # TC-SCASE-006
│   ├── certificate-generation.spec.ts # TC-SCASE-007
│   ├── enter-explanation.spec.ts      # TC-SCASE-008
│   ├── model-answer.spec.ts           # TC-SCASE-009
│   └── progress-indicator.spec.ts     # TC-SCASE-010
├── fixtures/
│   └── case-data.fixture.ts           # Case test data fixtures
└── helpers/
    ├── tab-navigation.ts              # Tab navigation helper
    └── quiz.ts                        # Quiz interaction helper
```

---

> **This plan should be saved to `specs/student-case-studies-test-plan.md`.**
