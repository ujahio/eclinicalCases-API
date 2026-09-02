Playwright E2E Tests (Registration)

This repo includes Playwright E2E tests for the Student Registration flow.

Local Development (Recommended)

Run tests against your local sst dev server — no deployment needed.

Terminal 1: Start local dev
  bun run start:dev

Terminal 2: Run tests
  npm run test:e2e:local

CI (PR to staging)

When you open a PR to the staging branch, GitHub Actions automatically:
1. Deploys an ephemeral test-e2e-{sha} stage
2. Runs Playwright tests against it
3. Destroys the stage (even if tests fail)
4. Uploads the test report as an artifact

If all tests pass, you can merge the PR and it will deploy to preproduction.

Setup

Install deps and Playwright browsers:
  bun install
  bunx playwright install chromium

Available Scripts

- npm run test:e2e — Run all projects inside SST shell (for deployed stages)
- npm run test:e2e:local — Run all projects against local sst dev
- npm run test:e2e:all — Run all Playwright projects (same as test:e2e without sst shell)
- npm run test:e2e:ui — Open Playwright UI mode
- npm run test:e2e:setup — Seed teacher via SST shell
- npm run test:e2e:stage — Deploy the test-e2e stage
- npm run test:e2e:destroy — Destroy the test-e2e stage

Notes

- The global setup/teardown require SST Resource bindings. Use test:e2e:local (with sst dev running) or test:e2e (inside sst shell).
- The no-teacher test is skipped by default. Set SKIP_TEACHER_CHECK=true to run it.
- Test users are prefixed with e2e- and cleaned up automatically after each run.
