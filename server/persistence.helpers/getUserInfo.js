import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";
import { verifyTokenFromCognito } from "../utils/verifyToken.js";
import cognitoClient from "../services/cognitoClient.js";

const getUserInfo = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const verifiedUserTokenDetails = await verifyTokenFromCognito(userToken);

	if (!verifiedUserTokenDetails || !verifiedUserTokenDetails.decoded) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				error: "Unauthorized",
				message: "Invalid token",
			}),
		};
	}

	const username = verifiedUserTokenDetails.decoded.username;
	try {
		const command = new AdminGetUserCommand({
			UserPoolId: Resource.eccslabs.id,
			Username: username,
		});
		const response = await cognitoClient.send(command);

		const userAttributes = {};
		response.UserAttributes.forEach((attribute) => {
			userAttributes[attribute.Name] = attribute.Value;
		});

		return {
			id: username,
			user_role: userAttributes["custom:user_role"],
			...(userAttributes["custom:user_role"] === "student" && {
				teacherId: userAttributes["custom:teacherId"],
			}),
		};
	} catch (error) {
		console.error("Error fetching user attributes from Cognito:", error);
		return null;
	}
};

export default getUserInfo;
