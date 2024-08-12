import { DynamoDBClient, ListTablesCommand, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({ endpoint: "http://localhost:8000" });

const USERS_TABLE_NAME = "Users";
const CASES_TABLE_NAME = "Cases";
const FEEDBACK_TABLE_NAME = "Feedback";
const ANSWERS_TABLE_NAME = "Answers";
const CERTIFICATE_TABLE_NAME = "Certificates";
const STUDENT_CASE_ATTEMPTS_TABLE_NAME = "StudentCaseAttempts";

const createTables = async () => {
  const usersParams = {
    TableName: USERS_TABLE_NAME,
    AttributeDefinitions: [
      { AttributeName: "email", AttributeType: "S" },
      { AttributeName: "id", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: "IDIndex", // Create a secondary index for id if needed
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  };

  const casesParams = {
    TableName: CASES_TABLE_NAME,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "N" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: "CreatedAtIndex",
        KeySchema: [{ AttributeName: "createdAt", KeyType: "HASH" }],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  };

  const feedbackParams = {
    TableName: "Feedback",
    AttributeDefinitions: [
      { AttributeName: "feedbackID", AttributeType: "S" },
      { AttributeName: "caseID", AttributeType: "S" },
      { AttributeName: "studentID", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "feedbackID", KeyType: "HASH" },
      { AttributeName: "caseID", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "CaseIDIndex",
        KeySchema: [{ AttributeName: "caseID", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
      {
        IndexName: "StudentIDIndex",
        KeySchema: [{ AttributeName: "studentID", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  const answersParams = {
    TableName: "Answers",
    AttributeDefinitions: [
      { AttributeName: "answerID", AttributeType: "S" },
      { AttributeName: "studentID", AttributeType: "S" },
      { AttributeName: "caseID", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "answerID", KeyType: "HASH" },
      { AttributeName: "studentID", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "CaseIDIndex",
        KeySchema: [{ AttributeName: "caseID", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  const certificatesParams = {
    TableName: "Certificates",
    AttributeDefinitions: [
      { AttributeName: "certificateID", AttributeType: "S" },
      { AttributeName: "studentID", AttributeType: "S" },
      { AttributeName: "caseID", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "certificateID", KeyType: "HASH" },
      { AttributeName: "studentID", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "StudentIDIndex",
        KeySchema: [{ AttributeName: "studentID", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  const studentCaseAttemptsParams = {
    TableName: "StudentCaseAttempts",
    AttributeDefinitions: [
      { AttributeName: "attemptID", AttributeType: "S" },
      { AttributeName: "studentID", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "attemptID", KeyType: "HASH" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: "StudentIDIndex",
        KeySchema: [{ AttributeName: "studentID", KeyType: "HASH" }],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  };

  try {
    const command = new ListTablesCommand({});
    const response = await ddb.send(command);
    const existingTables = response.TableNames;

    if (!existingTables.includes(USERS_TABLE_NAME)) {
      const command = new CreateTableCommand(usersParams);
      await ddb.send(command);
      console.log(`Table '${USERS_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${USERS_TABLE_NAME}' already exists. Skipping creation.`);
    }

    if (!existingTables.includes(CASES_TABLE_NAME)) {
      const command = new CreateTableCommand(casesParams);
      await ddb.send(command);
      // await ddb.createTable(casesParams);
      console.log(`Table '${CASES_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${CASES_TABLE_NAME}' already exists. Skipping creation.`);
    }

    if (!existingTables.includes(FEEDBACK_TABLE_NAME)) {
      // await ddb.createTable(feedbackParams);
      const command = new CreateTableCommand(feedbackParams);
      await ddb.send(command);
      console.log(`Table '${FEEDBACK_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${FEEDBACK_TABLE_NAME}' already exists. Skipping creation.`);
    }

    if (!existingTables.includes(ANSWERS_TABLE_NAME)) {
      // await ddb.createTable(answersParams);
      const command = new CreateTableCommand(answersParams);
      await ddb.send(command);
      console.log(`Table '${ANSWERS_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${ANSWERS_TABLE_NAME}' already exists. Skipping creation.`);
    }

    if (!existingTables.includes(CERTIFICATE_TABLE_NAME)) {
      // await ddb.createTable(certificatesParams);
      const command = new CreateTableCommand(certificatesParams);
      await ddb.send(command);
      console.log(`Table '${CERTIFICATE_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${CERTIFICATE_TABLE_NAME}' already exists. Skipping creation.`);
    }

    if (!existingTables.includes(STUDENT_CASE_ATTEMPTS_TABLE_NAME)) {
      // await ddb.createTable(studentCaseAttemptsParams);
      const command = new CreateTableCommand(studentCaseAttemptsParams);
      await ddb.send(command);
      console.log(`Table '${STUDENT_CASE_ATTEMPTS_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${STUDENT_CASE_ATTEMPTS_TABLE_NAME}' already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

createTables();
