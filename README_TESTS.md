Playwright E2E Tests (Registration)

This repo includes Playwright E2E tests for the Student Registration flow.

Quick commands

- Install deps and Playwright browsers:
  - bun install
  - bunx playwright install chromium

- Run registration UI tests:
  - PLAYWRIGHT_BASE_URL=https://test-e2e.{domain} PLAYWRIGHT_PROJECT=registration bunx npm run test:e2e

- Run full test suite:
  - bunx playwright test

- Seed teacher (if not using globalSetup via sst shell):
  - bunx sst shell --stage test-e2e bun tests/setup/global.setup.ts

Convenience

- Run the Playwright registration project inside an SST shell (ensures SST Resources are available for globalSetup):
  - ./scripts/run-e2e-project.sh registration test-e2e

- Forward raw Playwright CLI args (example: run api project if you exported it elsewhere):
  - bunx npm run test:e2e:cli -- --project=registration

Notes
- The global setup/teardown expect SST Resource bindings. Run in sst shell or ensure Resource is resolvable.
- The no-teacher test is skipped by default. Set SKIP_TEACHER_CHECK=true to run it.
