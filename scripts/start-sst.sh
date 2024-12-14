#!/bin/bash

# How to run script
# npm run start:sst --stage=localdev

# Start SST
STAGE=${npm_config_stage:-localdev}
npx sst dev --stage $STAGE