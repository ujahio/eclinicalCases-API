const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
    // region: process.env.AWS_REGION,
    endpoint: "http://localhost:8000",
});
const dbClient = DynamoDBDocumentClient.from(client);

module.exports = dbClient;