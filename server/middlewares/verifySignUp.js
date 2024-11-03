import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";
import { Resource } from "sst";

// THIS MAY NOT BE NECESSARY ANYMORE AS COGNITO HANDLES THIS!
// export const checkDuplicateUsernameOrEmail = async (email) => {
// 	try {
// 		const params = {
// 			TableName: TABLES.USER,
// 			FilterExpression: "email = :email",
// 			ExpressionAttributeValues: {
// 				":email": email,
// 			},
// 		};

// 		const command = new ScanCommand(params);
// 		const result = await dbClient.send(command);

// 		const user = result.Items[0];

// 		if (user) {
// 			return {
// 				statusCode: 400,
// 				body: JSON.stringify({
// 					message: "Username or email already exists",
// 					error: "Username or email already exists",
// 				}),
// 			};
// 		}

// 		return null;
// 	} catch (error) {
// 		console.error("Error checking for duplicate user", error);
// 		return {
// 			statusCode: 500,
// 			body: JSON.stringify({
// 				error: `Error checking for duplicate user: ${error.message}`,
// 				message: `Error checking for duplicate user.`,
// 			}),
// 		};
// 	}
// };
