const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const ddb = new DynamoDB({ endpoint: "http://localhost:8000" });

const TABLE_NAME = "Users";
const HASH_KEY = "UserID";
const HASH_KEY_TYPE = "S";

const createTable = async () => {
  const params = {
    TableName: TABLE_NAME,
    AttributeDefinitions: [
      { AttributeName: HASH_KEY, AttributeType: HASH_KEY_TYPE },
    ],
    KeySchema: [{ AttributeName: HASH_KEY, KeyType: "HASH" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    const existingTables = await ddb.listTables();

    if (!existingTables.TableNames.includes(TABLE_NAME)) {
      await ddb.createTable(params);
      console.log(`Table '${TABLE_NAME}' created.`);
    } else {
      console.log(`Table '${TABLE_NAME}' already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

createTable();
