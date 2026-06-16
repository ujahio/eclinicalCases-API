#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/run-e2e-project.sh [project] [stage]
# project: playwright project name (default: registration)
# stage: SST stage name (default: test-e2e)

PROJECT="${1:-registration}"
STAGE="${2:-test-e2e}"

echo "Running Playwright project '${PROJECT}' inside SST shell for stage '${STAGE}'..."

# Run Playwright inside sst shell so SST Resource bindings are available to globalSetup
bunx sst shell --stage "$STAGE" bunx playwright test --project="$PROJECT"
