import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";
import { Resource } from "sst";

export const checkDuplicateUsernameOrEmail = async (event) => {
	// TODO: expand check to make sure we are using pertinnent fields info to check for duplication
	const { email } = JSON.parse(event.body);

	try {
		const params = {
			TableName: Resource.ECCSUsers.name,
			FilterExpression: "email = :email",
			ExpressionAttributeValues: {
				":email": email,
			},
		};

		const command = new ScanCommand(params);
		const result = await dbClient.send(command);

		const user = result.Items[0];

		if (user) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Username or email already exists",
					error: "Username or email already exists",
				}),
			};
		}

		return null;
	} catch (error) {
		console.error("Error checking for duplicate user", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error checking for duplicate user: ${error.message}`,
				message: `Error checking for duplicate user.`,
			}),
		};
	}
};
