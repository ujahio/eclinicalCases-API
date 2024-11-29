import { SESv2Client } from "@aws-sdk/client-sesv2";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import useCaseHelpers from "./useCaseHelpers";
import persistenceMethods from "./persistenceMethods";
import gatewayMethods from "./gatewayMethods";

const region = "me-south-1"; // need to find a better place to save this constant

const client = new DynamoDBClient({ region });
const dbClient = DynamoDBDocumentClient.from(client);

const createApplicationContext = () => ({
	getLoginAddress: () => "https://eccs-online.com/login",
	getMessageGateway: () => gatewayMethods,
	getMessagingClient: () => new SESv2Client({ region }),
	getUserManagementClient: () =>
		new CognitoIdentityProviderClient({
			region,
		}),
	getDBClient: () => dbClient,
	getUseCaseHelpers: () => useCaseHelpers,
	getPersistenceGateway: () => persistenceMethods,
});

const applicationContext = createApplicationContext();

export default applicationContext;
export type ApplicationContext = ReturnType<typeof createApplicationContext>;
