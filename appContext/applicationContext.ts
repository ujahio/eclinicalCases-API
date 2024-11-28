import { SESv2Client } from "@aws-sdk/client-sesv2";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import useCaseHelpers from "./useCaseHelpers";
import persistenceMethods from "./persistenceMethods";
import gatewayMethods from "./gatewayMethods";

const region = "me-south-1";

const applicationContext = {
	getMessageGateway: () => gatewayMethods,
	getMessagingClient: () => new SESv2Client({ region }),
	getUserManagementClient: () =>
		new CognitoIdentityProviderClient({
			region,
		}),
	getUseCaseHelpers: () => useCaseHelpers,
	getPersistenceGateway: () => persistenceMethods,
};

export default applicationContext;
