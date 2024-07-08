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
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

createTables();
