const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const ddb = new DynamoDB({ endpoint: "http://localhost:8000" });

const USERS_TABLE_NAME = "Users";
const CASES_TABLE_NAME = "Cases";
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
  AttributeDefinitions: [
    { AttributeName: HASH_KEY, AttributeType: HASH_KEY_TYPE },
    { AttributeName: "createdOn", AttributeType: "S" },
    { AttributeName: "caseStatus", AttributeType: "S" },
  ],
  KeySchema: [
    { AttributeName: HASH_KEY, KeyType: "HASH" },
    { AttributeName: "createdOn", KeyType: "RANGE" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "caseStatus-createdOn-index",
      KeySchema: [
        { AttributeName: "caseStatus", KeyType: "HASH" },
        { AttributeName: "createdOn", KeyType: "RANGE" },
      ],
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

  try {
    const existingTables = await ddb.listTables();

    if (!existingTables.TableNames.includes(USERS_TABLE_NAME)) {
      await ddb.createTable(usersParams);
      console.log(`Table '${USERS_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${USERS_TABLE_NAME}' already exists. Skipping creation.`);
    }

    if (!existingTables.TableNames.includes(CASES_TABLE_NAME)) {
      await ddb.createTable(casesParams);
      console.log(`Table '${CASES_TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${CASES_TABLE_NAME}' already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

createTables();