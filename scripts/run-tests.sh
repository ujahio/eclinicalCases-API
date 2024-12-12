#!/bin/bash
STAGE=${npm_config_stage:-localdev}
npx sst shell --stage $STAGE -- npx playwright test 