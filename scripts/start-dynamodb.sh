#!/bin/bash

# Usage
#   Downloads and starts the dynamo db local service

if [ ! -e ".dynamodb/dynamo.tar.gz" ]; then 
  mkdir -p .dynamodb  
  curl --create-dirs -o .dynamodb/dynamo.tar.gz https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz
  cd .dynamodb || exit  
  tar -zxvf dynamo.tar.gz 
  cd ../
fi


cd .dynamodb && java -Djava.library.path=DynamoDBLocal_lib -jar DynamoDBLocal.jar -inMemory && cd ..