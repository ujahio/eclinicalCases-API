import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";
import { TABLES } from "../services/dbTables.js";

export const checkDuplicateUsernameOrEmail = async (event) => {
	const { email } = JSON.parse(event.body);

	try {
		const params = {
			TableName: TABLES.USER,
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
				body: JSON.stringify({ error: "Username or email already exists" }),
			};
		}

		return null;
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Error checking for duplicate username or email",
			}),
		};
	}
};
