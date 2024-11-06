import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";
import cognitoClient from "../services/cognitoClient.js";

const getUserInfo = async (username) => {
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
			firstName: userAttributes["custom:firstName"],
			lastName: userAttributes["custom:lastName"],
			email: userAttributes["email"],
		};
	} catch (error) {
		console.error("Error fetching user attributes from Cognito:", error);
		throw new Error(error.message);
	}
};

export default getUserInfo;
