import { DynamoDB } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDB({ endpoint: "http://localhost:8000" });

const deleteTables = async () => {
  try {
    const existingTables = await ddb.listTables();
    const tableNames = existingTables.TableNames as string[];
    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      console.log(`Deleting table: ${tableName}`);
      await ddb.deleteTable({ TableName: tableName });
      console.log(`Table deleted: ${tableName}`);
    }
  } catch (error) {
    console.error("Error deleting tables:", error);
  }
};

deleteTables();
