import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "me-south-1" });
const dbClient = DynamoDBDocumentClient.from(client);

export default dbClient;
