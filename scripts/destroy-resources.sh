#!/bin/bash

# Get the environment 
ENVIRONMENT=$1

# Check if environment is provided
if [ -z "$ENVIRONMENT" ]; then
  echo "No environment provided. Running SST remove without stage."
  sst remove
else
  echo "Environment provided: $ENVIRONMENT. Running SST remove with stage."
  sst remove --stage $ENVIRONMENT
fi


# Check if the command was successful
if [ $? -eq 0 ]; then
  echo "Resources removed successfully."
else
  echo "Failed to remove resources."
  exit 1
fi