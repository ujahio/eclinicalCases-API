#!/bin/bash

# Get the environment 
ENVIRONMENT=$1

# Check if environment is provided
if [ -z "$ENVIRONMENT" ]; then
  echo "No environment provided."
  exit 1
else
  echo Environment provided: $ENVIRONMENT. Running SST remove with stage."
  sst dev --stage $ENVIRONMENT
fi
