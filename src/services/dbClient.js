import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  // region: process.env.AWS_REGION,
  endpoint: "http://localhost:8000",
});
const dbClient = DynamoDBDocumentClient.from(client);

export default dbClient;