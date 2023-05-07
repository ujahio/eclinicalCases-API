#! /bin/bash


. ./scripts/setup-local-env.sh

echo "Stopping currently running dynamodb instance"

pkill -f DynamoDBLocal

echo "Starting dynamo"
./scripts/start-dynamodb.sh &
DYNAMO_PID=$!

nodemon --delay 1 -e js,ts --ignore dist/ --exec "npx ts-node --transpile-only ./server.ts"
