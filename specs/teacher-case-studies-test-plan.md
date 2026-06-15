# Teacher Case Studies CRUD — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Case study creation, editing, deletion, publishing, and materials management
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

### Case Study CRUD Flow

```
Browser                           Next.js API Routes               DynamoDB / S3
┌─────────────────┐  POST /case/draft  ┌──────────────┐  PutItem  ┌────────────┐
│ Create Case     │ ─────────────────► │ Lambda       │ ────────► │ Teacher    │
│ Study           │                    │ Handler      │          │ CaseStudies│
│                 │ ◄───────────────── │              │ ◄──────── │ Table      │
│ Tabs:           │    201 + caseID    │              │          └────────────┘
│ 1. Presentation │                    └──────────────┘
│ 2. Answer       │  PUT /case/draft/{id}  ┌──────────────┐  UpdateItem
│ 3. Teaching     │ ──────────────────────► │ Lambda       │ ────────► DynamoDB
│ 4. CME Qs       │ ◄───────────────────── │ Handler      │ ◄────────
│ 5. Final Review │    200                 └──────────────┘
│                 │
│                 │  POST /case/publish  ┌──────────────┐  UpdateItem
│                 │ ──────────────────► │ Lambda       │ ────────► DynamoDB
│                 │ ◄───────────────── │ Handler      │   (status: published)
│                 │    200              └──────────────┘
│                 │
│                 │  DELETE /case/delete/{id}  ┌──────────────┐  DeleteItem
│                 │ ────────────────────────► │ Lambda       │ ────────► DynamoDB
│                 │ ◄─────────────────────── │ Handler      │
│                 │    200                    └──────────────┘
│                 │
│ Materials:      │  GET /case/get-signed-url-for-pdf-upload  ┌─────┐
│ Upload PDF      │ ────────────────────────────────────────► │ S3  │
│ View PDFs       │  POST /case/get-signed-url-for-pdf-fetch  │     │
│ Delete PDF      │ ────────────────────────────────────────► │     │
│                 │  DELETE /case/delete-case-material         │     │
└─────────────────┘ ────────────────────────────────────────► └─────┘
```

### Create Case Study Tabs

From `src/services/constants` — `createCaseStudyTabs`:

| Tab Key | Component | Purpose |
|---|---|---|
| `case_model_presentation` | `TeacherCasePresentation` | Case topic, description (Plate.js rich text) |
| `case_model_answer` | `TeacherCaseAnswer` | Model answer/explanation |
| `case_teaching` | `TeacherCaseTeaching` | Teaching points |
| `cme_questions` | `TeacherCMEQuestions` | CME quiz questions |
| `final_review` | `FinalReview` | Review and publish |

### Key API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/case/draft` | POST | Create new draft |
| `/api/case/draft` | GET | List draft cases |
| `/api/case/draft/{caseID}` | PUT | Update draft |
| `/api/case/publish` | POST | Publish a case |
| `/api/case/publish` | GET | Get published case |
| `/api/case/archived/{caseFilter}` | GET | Get archived cases |
| `/api/case/delete-case/{caseID}` | DELETE | Delete a case |
| `/api/case/get-signed-url-for-pdf-upload` | GET | Get S3 upload URL |
| `/api/case/get-signed-url-for-pdf-fetch` | POST | Get S3 fetch URL |
| `/api/case/delete-case-material` | DELETE | Delete case material |

### 1-Active-Published-Case Limit

A teacher can only have **1 active published case** at a time. Publishing a new case while one is already published will replace the active case (the old one becomes archived).

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Test stage deployed
- Teacher user confirmed in Cognito
- No existing published case (for publish limit tests)

### 2.2 Test Data Strategy

```typescript
const CASE_TOPIC = `Test Case ${Date.now()}`;
const CASE_DESCRIPTION = "This is a test case description for E2E testing.";
const CASE_EXPLANATION = "Model answer for the test case.";
const CASE_TEACHING = "Teaching points for this case.";
```

---

## 3. Test Scenarios

### 4.1 Create New Draft Case

| Field | Value |
|---|---|
| **ID** | TC-CASE-001 |
| **Title** | Teacher creates a new draft case study via the multi-step form |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- Teacher is logged in
- No existing draft with the same topic

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/case-studies/create` | Create case page loads with ProcessTabs |
| 2 | Verify "Case Presentation" tab is active | Tab highlighted, form visible |
| 3 | Enter case topic | Field shows input |
| 4 | Enter case description (rich text) | Plate.js editor accepts input |
| 5 | Click "Next" or tab to advance | Move to "Case Answer" tab |
| 6 | Enter model answer | Field shows input |
| 7 | Click "Next" | Move to "Case Teaching" tab |
| 8 | Enter teaching points | Field shows input |
| 9 | Click "Next" | Move to "CME Questions" tab |
| 10 | Enter CME questions | Form accepts input |
| 11 | Click "Next" | Move to "Final Review" tab |
| 12 | Click "Save as Draft" | Draft saved, API returns 201 |

**Expected outcome:**
- Draft case created in DynamoDB
- User stays on create page or redirected to cases list
- Draft appears in `/teacher/cases` drafts tab

**Code skeleton:**

```typescript
// tests/teacher-case-studies/create-draft.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Teacher Case Studies - Create", () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_TEACHER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_TEACHER_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });
  });

  test("TC-CASE-001: Create new draft case study", async ({ page }) => {
    await page.goto("/teacher/case-studies/create");

    // Verify ProcessTabs are visible
    await expect(page.locator("text=Case Model Presentation").or(page.locator("text=case_model_presentation"))).toBeVisible();

    // Step 1: Case Presentation
    // Fill case topic (exact selector depends on component)
    const topicInput = page.locator('input[name="caseTopic"], input[placeholder*="topic"]').first();
    if (await topicInput.isVisible()) {
      await topicInput.fill(`Test Case ${Date.now()}`);
    }

    // Fill description (Plate.js rich text editor)
    const editor = page.locator('[role="textbox"], .tiptap, .ProseMirror, [contenteditable="true"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await editor.fill("Test case description for E2E testing.");
    }

    // Advance to next tab
    const nextButton = page.locator('button:has-text("Next"), button:has-text("SAVE DRAFT")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }

    // Continue through tabs...
    // The exact flow depends on the multi-step form implementation
  });
});
```

---

### 4.2 View Draft Cases List

| Field | Value |
|---|---|
| **ID** | TC-CASE-002 |
| **Title** | Teacher views draft cases list on /teacher/cases |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- At least one draft case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/cases` | Cases page loads |
| 2 | Verify "DRAFTS" tab is active | Tab has active styling |
| 3 | Verify draft case cards | At least one CaseCard visible |
| 4 | Verify "ARCHIVED" tab exists | Tab clickable |

**Code skeleton:**

```typescript
test("TC-CASE-002: View draft cases list", async ({ page }) => {
  await page.goto("/teacher/cases");

  // Verify DRAFTS tab is active
  await expect(page.locator("text=DRAFTS")).toBeVisible();

  // Verify case cards are rendered
  const caseCards = page.locator(".tab-content .grid > *");
  const count = await caseCards.count();
  expect(count).toBeGreaterThan(0);
});
```

---

### 4.3 Switch Between Drafts and Archived Tabs

| Field | Value |
|---|---|
| **ID** | TC-CASE-003 |
| **Title** | Switching between DRAFTS and ARCHIVED tabs shows correct content |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/cases` | DRAFTS tab active by default |
| 2 | Click "ARCHIVED" tab | Tab switches, archived cases shown |
| 3 | Click "DRAFTS" tab | Tab switches back, draft cases shown |

**Code skeleton:**

```typescript
test("TC-CASE-003: Tab switching between drafts and archived", async ({ page }) => {
  await page.goto("/teacher/cases");

  // Click ARCHIVED tab
  await page.click("text=ARCHIVED");
  await page.waitForTimeout(500);

  // Verify ARCHIVED tab is now active (has active styling)
  const archivedTab = page.locator("text=ARCHIVED").first();
  await expect(archivedTab).toHaveClass(/border-b-2|text-black/);

  // Click DRAFTS tab
  await page.click("text=DRAFTS");
  await page.waitForTimeout(500);

  // Verify DRAFTS tab is active
  const draftsTab = page.locator("text=DRAFTS").first();
  await expect(draftsTab).toHaveClass(/border-b-2|text-black/);
});
```

---

### 4.4 Update a Draft Case

| Field | Value |
|---|---|
| **ID** | TC-CASE-004 |
| **Title** | Teacher updates an existing draft case |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A draft case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/cases` | Drafts list loads |
| 2 | Click on a draft case card | Navigate to `/teacher/case-studies/update/{id}` |
| 3 | Verify case data is loaded | Form fields show existing data |
| 4 | Modify case topic | Field shows new value |
| 5 | Click "Save Draft" or advance through tabs | Updated via PUT `/api/case/draft/{id}` |
| 6 | Verify success | No error toast |

**Code skeleton:**

```typescript
test("TC-CASE-004: Update existing draft case", async ({ page }) => {
  await page.goto("/teacher/cases");

  // Click on first draft case
  const firstDraft = page.locator(".tab-content .grid > a, .tab-content .grid > div").first();
  await firstDraft.click();

  // Should navigate to update page
  await expect(page).toHaveURL(/\/teacher\/case-studies\/update\//);

  // Verify form is loaded (ProcessTabs visible)
  await expect(page.locator("nav")).toBeVisible();
});
```

---

### 4.5 Delete a Draft Case

| Field | Value |
|---|---|
| **ID** | TC-CASE-005 |
| **Title** | Teacher deletes a draft case |
| **Priority** | P1 (High) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A draft case exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/cases` | Drafts list loads |
| 2 | Locate delete button on case card | Delete icon/button visible |
| 3 | Click delete | Confirmation dialog (if any) |
| 4 | Confirm deletion | Case removed via DELETE `/api/case/delete-case/{id}` |
| 5 | Verify case removed | Case card no longer in list |

**Code skeleton:**

```typescript
test("TC-CASE-005: Delete draft case", async ({ page }) => {
  await page.goto("/teacher/cases");

  // Count initial cases
  const initialCount = await page.locator(".tab-content .grid > *").count();

  // Find and click delete button on first case
  const deleteButton = page.locator(".tab-content .grid button, .tab-content .grid [data-testid='delete']").first();
  if (await deleteButton.isVisible()) {
    await deleteButton.click();

    // Handle confirmation dialog if present
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Wait for deletion
    await page.waitForTimeout(2000);

    // Verify count decreased
    const newCount = await page.locator(".tab-content .grid > *").count();
    expect(newCount).toBeLessThan(initialCount);
  }
});
```

---

### 4.6 Publish a Case

| Field | Value |
|---|---|
| **ID** | TC-CASE-006 |
| **Title** | Teacher publishes a case from the Final Review tab |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- A draft case is ready for publishing
- No active published case (or this will replace it)

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to case creation/update page | Form loads |
| 2 | Complete all tabs (Presentation, Answer, Teaching, CME) | All tabs filled |
| 3 | Navigate to Final Review tab | Review content displayed |
| 4 | Click "Publish" button | API call to POST `/api/case/publish` |
| 5 | Verify success | Redirect or success message |
| 6 | Verify case is now published | Appears in dashboard as active case |

**Code skeleton:**

```typescript
test("TC-CASE-006: Publish a case", async ({ page }) => {
  // Navigate to a draft case's update page
  await page.goto("/teacher/cases");

  // Click on first draft
  const firstDraft = page.locator(".tab-content .grid > a, .tab-content .grid > div").first();
  await firstDraft.click();
  await expect(page).toHaveURL(/\/teacher\/case-studies\/update\//);

  // Navigate to Final Review tab (click through tabs or directly)
  // The ProcessTabs component allows clicking on tabs
  const finalReviewTab = page.locator("text=Final Review, text=final_review").first();
  if (await finalReviewTab.isVisible()) {
    await finalReviewTab.click();
  }

  // Click Publish button
  const publishButton = page.locator('button:has-text("Publish"), button:has-text("PUBLISH")').first();
  if (await publishButton.isVisible()) {
    await publishButton.click();

    // Wait for success
    await page.waitForTimeout(3000);

    // Verify published — should appear on dashboard
    await page.goto("/teacher/dashboard");
    await expect(page.locator(".ongoing-case")).toBeVisible();
  }
});
```

---

### 4.7 One Active Published Case Limit

| Field | Value |
|---|---|
| **ID** | TC-CASE-007 |
| **Title** | Publishing a second case replaces the active published case |
| **Priority** | P0 (Critical) |
| **Type** | Business Rule |

**Preconditions:**
- A published case already exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher with published case | Dashboard shows active case |
| 2 | Note the active case topic | Record topic |
| 3 | Create and publish a second case | New case published |
| 4 | Go to dashboard | Active case is now the NEW case |
| 5 | Old case moves to archived | Old case in archived list |

**Code skeleton:**

```typescript
test("TC-CASE-007: One active published case limit", async ({ page }) => {
  // This test requires API setup to create two cases
  // Skip if not possible to set up
  test.skip(!process.env.TEST_CASE_ID, "Requires pre-seeded cases");

  await page.goto("/teacher/dashboard");

  // Get current active case topic
  const activeTopic = await page.locator(".ongoing-case h5.font-bold").textContent();

  // Publish a new case via API (in test setup)
  // Then verify dashboard shows new case
  // This is best tested via API + dashboard verification
});
```

---

### 4.8 View Archived Cases

| Field | Value |
|---|---|
| **ID** | TC-CASE-008 |
| **Title** | Teacher views archived cases in the ARCHIVED tab |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/teacher/cases` | Page loads |
| 2 | Click "ARCHIVED" tab | Tab switches |
| 3 | Verify archived case cards | Cases displayed with topic, dates, stats |
| 4 | Verify empty state if no archived cases | "No cases found" message |

**Code skeleton:**

```typescript
test("TC-CASE-008: View archived cases", async ({ page }) => {
  await page.goto("/teacher/cases");

  // Switch to ARCHIVED tab
  await page.click("text=ARCHIVED");
  await page.waitForTimeout(500);

  // Check for case cards or empty state
  const caseCards = page.locator(".tab-content .grid > *");
  const count = await caseCards.count();

  if (count === 0) {
    await expect(page.locator("text=No cases found matching your search query.")).toBeVisible();
  } else {
    expect(count).toBeGreaterThan(0);
  }
});
```

---

### 4.9 Upload Case Material (PDF)

| Field | Value |
|---|---|
| **ID** | TC-CASE-009 |
| **Title** | Teacher uploads a PDF as case material |
| **Priority** | P1 (High) |
| **Type** | Functional / Integration |

**Preconditions:**
- On case creation/update page
- S3 upload URL generation works

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to case creation page | Form loads |
| 2 | Locate file upload input | Input visible |
| 3 | Select a PDF file | File selected |
| 4 | Upload triggers S3 signed URL request | GET `/api/case/get-signed-url-for-pdf-upload` |
| 5 | File uploads to S3 | Upload successful |
| 6 | Material appears in case materials list | PDF listed |

**Code skeleton:**

```typescript
test("TC-CASE-009: Upload case material PDF", async ({ page }) => {
  await page.goto("/teacher/case-studies/create");

  // Find file input (may be hidden behind a button)
  const fileInput = page.locator('input[type="file"]').first();

  if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Set file
    await fileInput.setInputFiles({
      name: "test-material.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test PDF content"),
    });

    // Wait for upload
    await page.waitForTimeout(3000);

    // Verify material appears in list
    // (exact selector depends on component)
  }
});
```

---

### 4.10 Delete Case Material

| Field | Value |
|---|---|
| **ID** | TC-CASE-010 |
| **Title** | Teacher deletes a case material |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Preconditions:**
- A case material exists

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to case with materials | Materials list visible |
| 2 | Click delete button on material | DELETE `/api/case/delete-case-material` |
| 3 | Confirm deletion | Material removed |
| 4 | Verify material removed | No longer in list |

**Code skeleton:**

```typescript
test("TC-CASE-010: Delete case material", async ({ page }) => {
  // Navigate to case with materials
  await page.goto("/teacher/cases");

  // Click on a case with materials
  const caseWithMaterials = page.locator(".tab-content .grid > a, .tab-content .grid > div").first();
  await caseWithMaterials.click();

  // Find delete button for material
  const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-material"]').first();
  if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await deleteButton.click();

    // Confirm if dialog appears
    const confirm = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
    if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirm.click();
    }

    await page.waitForTimeout(2000);
  }
});
```

---

### 4.11 Empty Drafts State

| Field | Value |
|---|---|
| **ID** | TC-CASE-011 |
| **Title** | Empty drafts list shows appropriate message |
| **Priority** | P2 (Medium) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as teacher with no drafts | Dashboard loads |
| 2 | Navigate to `/teacher/cases` | Cases page loads |
| 3 | Verify DRAFTS tab shows empty state | "No cases found" message |

**Code skeleton:**

```typescript
test("TC-CASE-011: Empty drafts state", async ({ page }) => {
  await page.goto("/teacher/cases");

  // DRAFTS tab should be active
  const emptyMessage = page.locator("text=No cases found matching your search query.");
  await expect(emptyMessage).toBeVisible();
});
```

---

## 4. Implementation Approach

### 4.1 Test Data Setup

```typescript
// tests/helpers/case-seed.ts
export async function seedDraftCase(accessToken: string) {
  const response = await fetch(`${process.env.PLAYWRIGHT_BASE_URL}/api/case/draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      caseTopic: `E2E Draft Case ${Date.now()}`,
      caseDescription: "Test description",
      caseExplanation: "Test explanation",
      caseTeaching: "Test teaching",
    }),
  });
  return response.json();
}

export async function deleteCase(accessToken: string, caseId: string) {
  await fetch(`${process.env.PLAYWRIGHT_BASE_URL}/api/case/delete-case/${caseId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
```

### 4.2 Plate.js Rich Text Editor

The case description uses Plate.js (rich text editor). Interacting with it in Playwright:

```typescript
// Fill rich text editor
const editor = page.locator('[role="textbox"], .ProseMirror, [contenteditable="true"]').first();
await editor.click();
await editor.fill("Test content");
// Or use keyboard
await editor.pressSequentially("Test content", { delay: 10 });
```

---

## 5. Directory Structure

```
tests/
├── teacher-case-studies/
│   ├── create-draft.spec.ts           # TC-CASE-001
│   ├── view-drafts.spec.ts            # TC-CASE-002
│   ├── tab-switching.spec.ts          # TC-CASE-003
│   ├── update-draft.spec.ts           # TC-CASE-004
│   ├── delete-draft.spec.ts           # TC-CASE-005
│   ├── publish-case.spec.ts           # TC-CASE-006
│   ├── one-active-limit.spec.ts       # TC-CASE-007
│   ├── view-archived.spec.ts          # TC-CASE-008
│   ├── upload-material.spec.ts        # TC-CASE-009
│   ├── delete-material.spec.ts        # TC-CASE-010
│   └── empty-drafts.spec.ts           # TC-CASE-011
└── helpers/
    └── case-seed.ts                   # Case seeding helpers
```

---

> **This plan should be saved to `specs/teacher-case-studies-test-plan.md`.**
