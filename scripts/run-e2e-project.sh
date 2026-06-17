#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/run-e2e-project.sh [project] [stage] [--local]
# project: playwright project name (optional — runs all projects if omitted)
# stage: SST stage name (default: test-e2e)
# --local: run against local sst dev (no sst shell wrapper)

PROJECT="${1:-}"
STAGE="${2:-test-e2e}"
LOCAL="${3:-}"

PROJECT_FLAG=""
if [ -n "$PROJECT" ]; then
  PROJECT_FLAG="--project=$PROJECT"
fi

if [ "$LOCAL" = "--local" ]; then
  echo "Running Playwright${PROJECT:+ project '$PROJECT'} against local sst dev..."
  echo "Make sure 'sst dev' is already running in another terminal."
  bunx playwright test $PROJECT_FLAG
else
  echo "Running Playwright${PROJECT:+ project '$PROJECT'} inside SST shell for stage '${STAGE}'..."
  bunx sst shell --stage "$STAGE" bunx playwright test $PROJECT_FLAG
fi
