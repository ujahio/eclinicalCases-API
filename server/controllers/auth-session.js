import { Resource } from "sst";
import { AdminUserGlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import applicationContext from "../../appContext/applicationContext.js";
import decodeToken from "../utils/decodeToken.js";

const cognitoClient = applicationContext.getUserManagementClient();

export const destroySession = async (event) => {
	try {
		const decodedToken = decodeToken(event);

		if (decodedToken.statusCode) {
			return decodedToken;
		}

		const command = new AdminUserGlobalSignOutCommand({
			UserPoolId: Resource.eccslabs.id,
			Username: decodedToken.username,
		});

		await cognitoClient.send(command);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Session destroyed successfully",
			}),
		};
	} catch (error) {
		console.error("Error destroying session:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error destroying session: ${error.message}`,
				message: "Failed to destroy session.",
			}),
		};
	}
};
