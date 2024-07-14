const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const ddb = new DynamoDB({ endpoint: "http://localhost:8000" });

const USERS_TABLE_NAME = "Users";
const CASES_TABLE_NAME = "Cases";
const FEEDBACK_TABLE_NAME = "Feedback"
const ANSWERS_TABLE_NAME = "Answers"
const CERTIFICATE_TABLE_NAME = "Certificates"
const STUDENT_CASE_ATTEMPTS_TABLE_NAME = "StudentCaseAttempts"

const HASH_KEY = "id";
const HASH_KEY_TYPE = "S";

const createTables = async () => {
  const usersParams = {
    TableName: USERS_TABLE_NAME,
    AttributeDefinitions: [
      { AttributeName: HASH_KEY, AttributeType: HASH_KEY_TYPE },
    ],
    KeySchema: [{ AttributeName: HASH_KEY, KeyType: "HASH" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    TableName: 'Feedback',
    AttributeDefinitions: [
      { AttributeName: 'feedbackID', AttributeType: 'S' },
      { AttributeName: 'caseID', AttributeType: 'S' },
      { AttributeName: 'studentID', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'feedbackID', KeyType: 'HASH' },
      { AttributeName: 'caseID', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CaseIDIndex',
        KeySchema: [{ AttributeName: 'caseID', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
      {
        IndexName: 'StudentIDIndex',
        KeySchema: [{ AttributeName: 'studentID', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
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
    TableName: 'Answers',
    AttributeDefinitions: [
      { AttributeName: 'answerID', AttributeType: 'S' },
      { AttributeName: 'studentID', AttributeType: 'S' },
      { AttributeName: 'caseID', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'answerID', KeyType: 'HASH' },
      { AttributeName: 'studentID', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CaseIDIndex',
        KeySchema: [{ AttributeName: 'caseID', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
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
    TableName: 'Certificates',
    AttributeDefinitions: [
      { AttributeName: 'certificateID', AttributeType: 'S' },
      { AttributeName: 'studentID', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'certificateID', KeyType: 'HASH' },
      { AttributeName: 'studentID', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StudentIDIndex',
        KeySchema: [{ AttributeName: 'studentID', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
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
    TableName: 'StudentCaseAttempts',
    AttributeDefinitions: [
      { AttributeName: 'attemptID', AttributeType: 'S' },
      { AttributeName: 'studentID', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'attemptID', KeyType: 'HASH' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StudentIDIndex',
        KeySchema: [
          { AttributeName: 'studentID', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  };

  try {
    const existingTables = await ddb.listTables();

    if (!existingTables.TableNames.includes(USERS_TABLE_NAME)) {
      await ddb.createTable(usersParams);
      console.log(`Table '${USERS_TABLE_NAME}' created.`);
    } else {
      console.log(
        `Table '${USERS_TABLE_NAME}' already exists. Skipping creation.`
      );
    }

    if (!existingTables.TableNames.includes(CASES_TABLE_NAME)) {
      await ddb.createTable(casesParams);
      console.log(`Table '${CASES_TABLE_NAME}' created.`);
    } else {
      console.log(
        `Table '${CASES_TABLE_NAME}' already exists. Skipping creation.`
      );
    }

    if (!existingTables.TableNames.includes(FEEDBACK_TABLE_NAME)) {
      await ddb.createTable(feedbackParams);
      console.log(`Table '${FEEDBACK_TABLE_NAME}' created.`);
    } else {
      console.log(
        `Table '${FEEDBACK_TABLE_NAME}' already exists. Skipping creation.`
      );
    }

    if (!existingTables.TableNames.includes(ANSWERS_TABLE_NAME)) {
      await ddb.createTable(answersParams);
      console.log(`Table '${ANSWERS_TABLE_NAME}' created.`);
    } else {
      console.log(
        `Table '${ANSWERS_TABLE_NAME}' already exists. Skipping creation.`
      );
    }

    if (!existingTables.TableNames.includes(CERTIFICATE_TABLE_NAME)) {
      await ddb.createTable(certificatesParams);
      console.log(`Table '${CERTIFICATE_TABLE_NAME}' created.`);
    } else {
      console.log(
        `Table '${CERTIFICATE_TABLE_NAME}' already exists. Skipping creation.`
      );
    }

    if (!existingTables.TableNames.includes(STUDENT_CASE_ATTEMPTS_TABLE_NAME)) {
      await ddb.createTable(studentCaseAttemptsParams);
      console.log(`Table '${STUDENT_CASE_ATTEMPTS_TABLE_NAME}' created.`);
    } else {
      console.log(
        `Table '${STUDENT_CASE_ATTEMPTS_TABLE_NAME}' already exists. Skipping creation.`
      );
    }

  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

createTables();
