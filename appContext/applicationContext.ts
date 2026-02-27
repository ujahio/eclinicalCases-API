import { SESv2Client } from "@aws-sdk/client-sesv2";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import useCaseHelpers from "./useCaseHelpers";
import persistenceMethods from "./persistenceMethods";
import gatewayMethods from "./gatewayMethods";

// TODO: need to find a better place to save this constants
// NOTE: process.env is not working
const REGION = process.env.NEXT_PUBLIC_REGION || "us-east-1";
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;
// const loginAddress_ORIGINAL = "https://eccs-online.com/login";
const loginAddress = `https://${DOMAIN}/login`;

const client = new DynamoDBClient({ region: REGION });
const dbClient = DynamoDBDocumentClient.from(client);

const createApplicationContext = () => ({
	getLoginAddress: () => loginAddress,
	getMessageGateway: () => gatewayMethods,
	getMessagingClient: () => new SESv2Client({ region: REGION }),
	getUserManagementClient: () =>
		new CognitoIdentityProviderClient({
			region: REGION,
		}),
	getDBClient: () => dbClient,
	getUseCaseHelpers: () => useCaseHelpers,
	getPersistenceGateway: () => persistenceMethods,
});

const applicationContext = createApplicationContext();

export default applicationContext;
export type ApplicationContext = ReturnType<typeof createApplicationContext>;
