#!/bin/bash

# How to run script
# npm run e2e:tests --stage=localdev

# Run tests
STAGE=${npm_config_stage:-localdev}
npx sst shell --stage $STAGE -- npx playwright test
