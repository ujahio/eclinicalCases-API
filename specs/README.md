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
2. Test Environment Setup (stage config, env vars, Playwright config)
3. Test Data Management (unique data strategy, lifecycle, cleanup)
4. Test Scenarios (steps table, expected outcome, code skeleton)
5. Implementation Approach (fixtures, helpers, setup/teardown)
6. Directory Structure & Configuration (file tree for test code)
