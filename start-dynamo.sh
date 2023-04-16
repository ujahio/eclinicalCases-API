#!/bin/bash

# Usage
#   Downloads and starts the dynamo db local service

# download the dynamo jar file if needed
# if [ ! -e ".dynamodb/dynamo.tar.gz" ]; then
#   mkdir -p .dynamodb
#   curl --create-dirs -o .dynamodb/dynamo.tar.gz https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamo_local_latest.tar.gz
#   cd .dynamodb 
#   tar -xzf dynamo.tar.gz
#   cd .. || exit
# fi

# cd .dynamodb && java -Djava.library.path=.dynamodb/DynamoDBLocal_lib -jar DynamoDBLocal.jar -inMemory

if [ ! -e ".dynamodb/dynamo.tar.gz" ]; then  # does .dynamo directory exist?
  mkdir -p .dynamodb   # creates .dynamodb directory (folder)
  curl --create-dirs -o .dynamodb/dynamo.tar.gz https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz # make a request to aws to download local dynamodb
  cd .dynamodb || exit   # change direcotry to .dynamodb
  current_directory=$(pwd)
  echo "Current Directory: $current_directory"
  tar -zxvf dynamo.tar.gz   # unzip tar file
  cd .. /
fi


cd .dynamodb && java -Djava.library.path=DynamoDBLocal_lib -jar DynamoDBLocal.jar -inMemory && cd ..