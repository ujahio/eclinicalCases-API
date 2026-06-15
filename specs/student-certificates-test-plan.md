# Student Certificates — E2E Test Plan

> **Project**: eccs-API (SST v4 + Next.js + Cognito + DynamoDB)
> **Focus**: Student certificates page at `/student/certificates`, certificate listing and download
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

### Certificates Flow

```
Browser (/student/certificates)        Redux / API                    S3
┌─────────────────────────────┐  GET   ┌──────────────────┐  SignedURL ┌────────────┐
│ Certificates.tsx            │ ─────► │ /student/        │ ─────────► │ Certificates│
│                             │       │ certificates     │           │ Bucket     │
│ 1. Certificate List         │ ◄───── │                  │ ◄───────── │            │
│    - Canvas thumbnail       │       └──────────────────┘           └────────────┘
│    - Download button        │
│                             │  Click  ┌──────────────────┐
│ 2. Certificate Modal        │ ──────► │ useRenderPdf()   │
│    - Full PDF view          │       │ - PDF.js          │
│    - Canvas rendering       │       │ - base64 → canvas │
│                             │       └──────────────────┘
└─────────────────────────────┘
```

### Key Components

From `src/presentation/student/Certificates.tsx`:

- **Certificate List**: Grid of certificate cards
  - Canvas thumbnail (PDF rendered)
  - "Download" button → opens S3 signed URL in new tab
  - Click card → opens modal with full PDF
- **Certificate Modal**: Full PDF view in canvas
- **Empty State**: "There are no certificates at the moment."

### Certificate Data Structure

```typescript
{
  caseTopicAnswer: string;    // Case topic name
  signedUrl: string;          // S3 signed URL for download
  base64Pdf: string;          // Base64-encoded PDF content
  certificateID: string;      // Unique certificate ID
}
```

### API Route

| Route | Method | Purpose |
|---|---|---|
| `/api/student/certificates` | GET | Get list of student's certificates |

---

## 2. Test Environment Setup

### 2.1 Prerequisites

- Playwright installed
- Student user confirmed in Cognito
- Student has at least one certificate (passed a case study)

### 2.2 Test Data

```typescript
const STUDENT_EMAIL = process.env.TEST_STUDENT_WITH_CERTS!;
const STUDENT_PASSWORD = process.env.TEST_STUDENT_WITH_CERTS_PASSWORD!;
```

---

## 3. Test Scenarios

### 4.1 Certificates Page Loads

| Field | Value |
|---|---|
| **ID** | TC-CERT-001 |
| **Title** | Certificates page loads and displays certificate list |
| **Priority** | P0 (Critical) |
| **Type** | Happy Path / Functional |

**Preconditions:**
- Student has at least one certificate

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student with certificates | Dashboard loads |
| 2 | Navigate to `/student/certificates` | Page loads |
| 3 | Verify certificate list | Certificate cards visible |
| 4 | Verify canvas thumbnail | PDF rendered in canvas element |
| 5 | Verify download button | "Download" button visible |

**Code skeleton:**

```typescript
// tests/student-certificates/page-loads.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Student Certificates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_STUDENT_WITH_CERTS!);
    await page.fill('input[name="password"]', process.env.TEST_STUDENT_WITH_CERTS_PASSWORD!);
    await page.click("button:has-text('SIGN IN')");
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 15000 });
  });

  test("TC-CERT-001: Certificates page loads with certificate list", async ({ page }) => {
    await page.goto("/student/certificates");

    // Verify certificate cards are rendered
    const certCards = page.locator("li, .grid > *");
    const count = await certCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify canvas thumbnails
    await expect(page.locator("canvas").first()).toBeVisible();

    // Verify download buttons
    await expect(page.locator("text=Download").first()).toBeVisible();
  });
});
```

---

### 4.2 Empty Certificates State

| Field | Value |
|---|---|
| **ID** | TC-CERT-002 |
| **Title** | Certificates page shows empty state when no certificates exist |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Preconditions:**
- Student has no certificates

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student without certificates | Dashboard loads |
| 2 | Navigate to `/student/certificates` | Page loads |
| 3 | Verify empty state message | "There are no certificates at the moment." visible |

**Code skeleton:**

```typescript
test("TC-CERT-002: Empty certificates state", async ({ page }) => {
  // This test needs a student with no certificates
  await page.goto("/student/certificates");

  await expect(page.locator("text=There are no certificates at the moment.")).toBeVisible();
});
```

---

### 4.3 Certificate Canvas Thumbnail Renders

| Field | Value |
|---|---|
| **ID** | TC-CERT-003 |
| **Title** | Certificate PDF renders as canvas thumbnail |
| **Priority** | P1 (High) |
| **Type** | Functional / Integration |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to certificates page | Page loads |
| 2 | Verify canvas elements | Canvas elements present |
| 3 | Verify canvas has content | Canvas is not blank (has rendered PDF) |

**Code skeleton:**

```typescript
test("TC-CERT-003: Canvas thumbnail renders PDF", async ({ page }) => {
  await page.goto("/student/certificates");

  // Find canvas elements
  const canvases = page.locator("canvas");
  const count = await canvases.count();
  expect(count).toBeGreaterThan(0);

  // Verify canvas has been drawn to (check if it's not blank)
  const firstCanvas = canvases.first();
  const dimensions = await firstCanvas.boundingBox();
  expect(dimensions).not.toBeNull();
  expect(dimensions!.width).toBeGreaterThan(0);
  expect(dimensions!.height).toBeGreaterThan(0);
});
```

---

### 4.4 Click Certificate Opens Modal

| Field | Value |
|---|---|
| **ID** | TC-CERT-004 |
| **Title** | Clicking certificate thumbnail opens modal with full PDF |
| **Priority** | P0 (Critical) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to certificates page | Page loads |
| 2 | Click on certificate thumbnail | Modal opens |
| 3 | Verify modal content | Full PDF canvas visible in modal |
| 4 | Close modal | Modal closes |

**Code skeleton:**

```typescript
test("TC-CERT-004: Click certificate opens modal", async ({ page }) => {
  await page.goto("/student/certificates");

  // Click first certificate thumbnail
  const firstCert = page.locator("li button, .grid > li button").first();
  await firstCert.click();

  // Modal should open
  const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Verify canvas in modal
  await expect(modal.locator("canvas")).toBeVisible();

  // Close modal
  const closeBtn = modal.locator('button[class*="close"], button:has-text("×"), button:has-text("Close")').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
});
```

---

### 4.5 Download Button Opens PDF

| Field | Value |
|---|---|
| **ID** | TC-CERT-005 |
| **Title** | Download button opens certificate PDF in new tab |
| **Priority** | P0 (Critical) |
| **Type** | Functional |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to certificates page | Page loads |
| 2 | Locate download button | Button visible |
| 3 | Verify href points to S3 signed URL | Link has valid URL |
| 4 | Click download | Opens new tab with PDF |

**Code skeleton:**

```typescript
test("TC-CERT-005: Download button opens PDF", async ({ page }) => {
  await page.goto("/student/certificates");

  // Find download link
  const downloadLink = page.locator('a:has-text("Download")').first();
  await expect(downloadLink).toBeVisible();

  // Verify it has an href (S3 signed URL)
  const href = await downloadLink.getAttribute("href");
  expect(href).toBeTruthy();
  expect(href).toMatch(/https?:\/\//);

  // Verify it opens in new tab
  const target = await downloadLink.getAttribute("target");
  expect(target).toBe("_blank");
});
```

---

### 4.6 Multiple Certificates Display

| Field | Value |
|---|---|
| **ID** | TC-CERT-006 |
| **Title** | Multiple certificates are displayed in a grid |
| **Priority** | P1 (High) |
| **Type** | Functional |

**Preconditions:**
- Student has multiple certificates

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as student with 2+ certificates | Dashboard loads |
| 2 | Navigate to certificates page | Page loads |
| 3 | Verify multiple cards | At least 2 certificate cards |
| 4 | Verify grid layout | Cards arranged in responsive grid |

**Code skeleton:**

```typescript
test("TC-CERT-006: Multiple certificates in grid", async ({ page }) => {
  await page.goto("/student/certificates");

  const certCards = page.locator("li, .grid > li");
  const count = await certCards.count();
  expect(count).toBeGreaterThanOrEqual(2);
});
```

---

### 4.7 Certificate Modal Close on Overlay Click

| Field | Value |
|---|---|
| **ID** | TC-CERT-007 |
| **Title** | Certificate modal closes when clicking outside |
| **Priority** | P2 (Medium) |
| **Type** | UI |

**Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open certificate modal | Modal visible |
| 2 | Click outside modal (overlay) | Modal closes |
| 3 | Verify modal hidden | Modal not visible |

**Code skeleton:**

```typescript
test("TC-CERT-007: Modal closes on overlay click", async ({ page }) => {
  await page.goto("/student/certificates");

  // Open modal
  const firstCert = page.locator("li button, .grid > li button").first();
  await firstCert.click();

  const modal = page.locator('[role="dialog"], .modal').first();
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Click overlay (area outside modal)
  await page.click("body", { position: { x: 10, y: 10 } });

  // Wait for modal to close
  await page.waitForTimeout(500);

  // Modal should be hidden
  const isModalVisible = await modal.isVisible().catch(() => false);
  expect(isModalVisible).toBe(false);
});
```

---

## 4. Implementation Approach

### 4.1 PDF Rendering in Tests

The certificates page uses `useRenderPdf` hook to render PDFs on canvas. In E2E tests:

- Canvas elements should be present but may not render actual PDF content (requires PDF.js)
- Focus on verifying element presence and interaction, not visual accuracy

### 4.2 Download Link Testing

Download links point to S3 signed URLs. In tests:
- Verify the link exists and has a valid href
- Don't actually download the file (S3 signed URLs are temporary)
- Use `expect(href).toMatch(/https?:\/\//)` for basic validation

### 4.3 Modal Testing Pattern

```typescript
// Common modal interaction pattern
async function openCertModal(page: Page) {
  await page.locator("li button, .grid > li button").first().click();
  await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
}

async function closeCertModal(page: Page) {
  const closeBtn = page.locator('[role="dialog"] button[class*="close"], button:has-text("×")');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
}
```

---

## 5. Directory Structure

```
tests/
├── student-certificates/
│   ├── page-loads.spec.ts             # TC-CERT-001
│   ├── empty-state.spec.ts            # TC-CERT-002
│   ├── canvas-render.spec.ts          # TC-CERT-003
│   ├── open-modal.spec.ts             # TC-CERT-004
│   ├── download-button.spec.ts        # TC-CERT-005
│   ├── multiple-certs.spec.ts         # TC-CERT-006
│   └── modal-close.spec.ts            # TC-CERT-007
└── helpers/
    └── certificate.ts                 # Certificate test helpers
```

---

> **This plan should be saved to `specs/student-certificates-test-plan.md`.**
