import { SESv2Client } from "@aws-sdk/client-sesv2";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import useCaseHelpers from "./useCaseHelpers";
import persistenceMethods from "./persistenceMethods";
import gatewayMethods from "./gatewayMethods";

// TODO: need to find a better place to save this constants
// NOTE: process.env is not working
const loginAddress = "https://eccs-online.xyz/login";

const client = new DynamoDBClient();
const dbClient = DynamoDBDocumentClient.from(client);

const createApplicationContext = () => ({
	getLoginAddress: () => loginAddress,
	getMessageGateway: () => gatewayMethods,
	getMessagingClient: () => new SESv2Client(),
	getUserManagementClient: () => new CognitoIdentityProviderClient(),
	getDBClient: () => dbClient,
	getUseCaseHelpers: () => useCaseHelpers,
	getPersistenceGateway: () => persistenceMethods,
});

const applicationContext = createApplicationContext();

export default applicationContext;
export type ApplicationContext = ReturnType<typeof createApplicationContext>;
