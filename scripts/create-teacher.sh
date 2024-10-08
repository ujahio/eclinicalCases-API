#!/bin/bash

# Function to generate a UUID using uuidgen (works on macOS)
generate_uuid() {
  uuidgen
}

# Hashing the password using the Node.js script, passing the secret key from environment
hash_password() {
  local password="$1"
  local secretKey="$2" # Fetch the secret key from environment

  # Use Node.js script to hash the password and capture the output
  local hashedPassword=$(NEXT_PUBLIC_PASS_SECRET_KEY="$secretKey" node scripts/hashPassword.cjs "$password")
  echo "$hashedPassword"
}

# Fetch the secret key from environment variables
secretKey=$NEXT_PUBLIC_PASS_SECRET_KEY

# Ensure that the secret key is available
if [ -z "$secretKey" ]; then
  echo "Error: NEXT_PUBLIC_PASS_SECRET_KEY environment variable is not set."
  exit 1
fi

# Prompt the user to enter the teacher's first name
read -p "Enter the first name for the teacher: " firstname

# Prompt the user to enter the teacher's last name
read -p "Enter the last name for the teacher: " lastname

# Prompt the user to enter the teacher's email
read -p "Enter the email for the teacher: " email

# Prompt the user to enter the password
read -sp "Enter the password for the teacher: " plainTextPassword
echo # Newline after the input

user_role="teacher"
signUpLevel=1
status="active"

# Hash the password using the custom Node.js script and capture the result
hashedPassword=$(hash_password "$plainTextPassword" "$secretKey")

# Ensure that the hashedPassword is not empty
if [ -z "$hashedPassword" ]; then
  echo "Error: Password hash is empty. Something went wrong."
  exit 1
fi

# Generate unique user ID and timestamp (ISO 8601 with milliseconds)
userId=$(generate_uuid)
createdAt=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

# Create teacher info with correct DynamoDB types
teacherInfo=$(jq -n \
  --arg email "$email" \
  --arg createdAt "$createdAt" \
  --arg firstname "$firstname" \
  --arg id "$userId" \
  --arg lastname "$lastname" \
  --arg password "$hashedPassword" \
  --arg user_role "$user_role" \
  --argjson signUpLevel "$signUpLevel" \
  --arg status "$status" \
  '{
    email: { "S": $email },
    createdAt: { "S": $createdAt },
    firstname: { "S": $firstname },
    id: { "S": $id },
    lastname: { "S": $lastname },
    password: { "S": $password },
    user_role: { "S": $user_role },
    signUpLevel: { "N": ($signUpLevel | tostring) },
    status: { "S": $status }
  }')

# Save the teacher to DynamoDB using AWS CLI
aws dynamodb put-item \
    --table-name e-clinical-js-otktechnologies-UsersTable \
    --item "$teacherInfo" \
    --return-consumed-capacity TOTAL

if [ $? -eq 0 ]; then
  echo "Teacher created successfully"
else
  echo "Error creating teacher"
fi
