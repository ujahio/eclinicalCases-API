# Specs

This is a directory for Playwright E2E test plans.

## File Naming

`<kebab-case-flow-name>-test-plan.md`

Examples: `login-test-plan.md`, `teacher-case-studies-test-plan.md`

## Test Case ID Format

`TC-<FLOW>-NNN`

| Prefix | Flow |
|--------|------|
| TC-REG | Student Registration |
| TC-LOGIN | Login |
| TC-FORGOT-PW | Forgot Password |
| TC-LOGOUT | Logout / Destroy Session |
| TC-GUARD | Auth Guard / Middleware |
| TC-TDASH | Teacher Dashboard |
| TC-TCS | Teacher Case Studies |
| TC-TRF | Teacher Responses & Feedback |
| TC-TSET | Teacher Settings |
| TC-SDASH | Student Dashboard |
| TC-SCS | Student Case Studies |
| TC-SCERT | Student Certificates |
| TC-SSET | Student Settings |

## Priority Levels

| Priority | Meaning |
|----------|---------|
| P0 | Critical — core flow, blocking |
| P1 | High — important but workaround exists |
| P2 | Medium — edge case, nice-to-have |

## Required Sections Per Plan

1. Architecture Overview (ASCII flow diagram + key dependencies table)
2. Testability Requirements (`data-testid` attributes needed per element)
3. Test Environment Setup (stage config, env vars, Playwright config)
4. Test Data Management (unique data strategy, lifecycle, cleanup)
5. Test Scenarios (steps table, expected outcome, code skeleton)
6. Implementation Approach (fixtures, helpers, setup/teardown)
7. Directory Structure & Configuration (file tree for test code)

## Testability Requirements

All test plans include a `### Testability Requirements` subsection listing the `data-testid` attributes that must be added to HTML elements before implementing tests. This ensures tests use stable, semantic selectors instead of fragile CSS classes or text content.

### Naming Convention

```
data-testid="<page>-<element>"
```

Where `<page>` is a short kebab-case flow identifier (e.g., `login`, `signup`, `case-create`) and `<element>` describes the element's purpose (e.g., `email-input`, `submit-button`, `error-message`).

### Rules

1. **Prefer `data-testid`** over `aria-label`, CSS classes, or text content for test targeting
2. **Every form input** needs a `data-testid`
3. **Every submit/call-to-action button** needs a `data-testid`
4. **Every dynamic content region** (loading, empty, error states, modals) needs a `data-testid`
5. **Navigation links and sidebar items** need a `data-testid`
6. **Validation error messages** need unique `data-testid` per field
7. **Toast/notification containers** need a `data-testid`
8. **All elements must also have proper `aria-label` or `role` attributes** for accessibility — `data-testid` is a supplement, not a replacement

### Example

```tsx
<input data-testid="login-email" aria-label="Email" type="email" />
<button data-testid="login-submit" role="button">Sign In</button>
<div data-testid="login-error-message" role="alert">{error}</div>
```
