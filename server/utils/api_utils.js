import {
	UpdateCommand,
	GetCommand,
	ScanCommand,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import crypto from "crypto";
import busboy from "busboy";
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import dbClient from "../services/dbClient.js";
import cognitoClient from "../services/cognitoClient.js";

function generateOtp() {
	return Math.floor(100000 + Math.random() * 900000);
}

// async function storeOtpInDb(email, otp) {
// 	const params = {
// 		TableName: Resource.ECCSUsers.name,
// 		Key: {
// 			email: email,
// 		},
// 		UpdateExpression: "set otp = :otp",
// 		ExpressionAttributeValues: {
// 			":otp": otp,
// 		},
// 	};

// 	const command = new UpdateCommand(params);
// 	await dbClient.send(command);
// }

// async function getOtpFromDb(email) {
// 	const params = {
// 		TableName: Resource.ECCSUsers.name,
// 		Key: {
// 			email: email,
// 		},
// 		ProjectionExpression: "otp",
// 	};

// 	const command = new GetCommand(params);
// 	const result = await dbClient.send(command);
// 	return result.Item.otp;
// }

// async function updateUserPassword(email, newPassword) {
// 	const params = {
// 		TableName: Resource.ECCSUsers.name,
// 		Key: {
// 			email: email,
// 		},
// 		UpdateExpression: "set password = :newPassword",
// 		ExpressionAttributeValues: {
// 			":newPassword": newPassword,
// 		},
// 	};
// 	const command = new UpdateCommand(params);
// 	const result = await dbClient.send(command);
// 	return result.Attributes;
// }

// async function getUserByEmail(email) {
// 	try {
// 		const params = {
// 			TableName: Resource.ECCSUsers.name,
// 			FilterExpression: "email = :email",
// 			ExpressionAttributeValues: {
// 				":email": email,
// 			},
// 		};

// 		const command = new ScanCommand(params);
// 		const result = await dbClient.send(command);
// 		return result.Items[0];
// 	} catch (error) {
// 		console.error(error);
// 		throw error;
// 	}
// }

function encryptPassword(password, NEXT_PUBLIC_PASS_SECRET_KEY) {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		Buffer.from(NEXT_PUBLIC_PASS_SECRET_KEY, "hex"),
		iv
	);
	let encrypted = cipher.update(password, "utf8", "hex");
	encrypted += cipher.final("hex");
	return iv.toString("hex") + ":" + encrypted;
}

function decryptPassword(encryptedPassword, NEXT_PUBLIC_PASS_SECRET_KEY) {
	const textParts = encryptedPassword.split(":");
	const iv = Buffer.from(textParts.shift(), "hex");
	const encryptedText = Buffer.from(textParts.join(":"), "hex");
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(NEXT_PUBLIC_PASS_SECRET_KEY, "hex"),
		iv
	);
	let decrypted = decipher.update(encryptedText, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}

function parseLogToObject(log) {
	const caseData = {}; // Initialize the final object
	const feedback = []; // Initialize feedback array
	const feedbackMap = {}; // Temporary object to map feedback indices

	// Loop through each property in the log object
	for (const [key, value] of Object.entries(log)) {
		// Detect if the key belongs to feedback
		const feedbackMatch = key.match(/feedback\[(\d+)\]\[(question|response)\]/);

		if (feedbackMatch) {
			const index = parseInt(feedbackMatch[1]);
			const type = feedbackMatch[2];

			// Initialize feedback object for the index if not exists
			if (!feedbackMap[index]) {
				feedbackMap[index] = {};
			}

			// Add the question or response to the respective feedback object
			feedbackMap[index][type] = value;
		} else {
			// Otherwise, it's a regular key-value pair (like caseID)
			caseData[key] = value;
		}
	}

	// Convert feedback map to an array
	for (const index in feedbackMap) {
		feedback.push(feedbackMap[index]);
	}

	// Add feedback array to the final object
	caseData.feedback = feedback;

	return caseData;
}

export const extrapolateRequestBody = async (event) => {
	const contentType =
		event.headers["content-type"] || event.headers["Content-Type"];
	const formData = {};

	if (event.body && contentType.startsWith("multipart/form-data")) {
		const bb = busboy({
			headers: event.headers,
		});

		return new Promise((resolve, reject) => {
			// Initialize arrays to hold document keys and file names
			formData.documentKeys = [];
			formData.fileNames = [];

			bb.on("field", (fieldname, value) => {
				// Check if the fieldname starts with 'documentKey' to gather all document keys
				if (fieldname.startsWith("documentKey")) {
					formData.documentKeys.push(value); // Accumulate document keys
				} else {
					formData[fieldname] = value; // Regular field processing for other fields
				}
			});

			bb.on("finish", () => {
				resolve(formData);
			});

			bb.on("error", (error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify({
						message: "Error extrapolating request body",
						error: `Error extrapolating request body: ${error.message}`,
					}),
				});
			});

			// Pass the decoded body to busboy
			bb.end(Buffer.from(event.body, "base64").toString("binary"));
		});
	} else {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: "Invalid content type" }),
		};
	}
};

export const getDetailsOfStudentsFeedbackAndResponses = async (
	caseID,
	details = false
) => {
	const selectOption = details ? "ALL_ATTRIBUTES" : "COUNT";

	// Parameters for fetching feedback
	const feedbackParams = {
		TableName: Resource.Feedback.name,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
		Select: selectOption,
	};

	// Parameters for fetching responses
	const responsesParams = {
		TableName: Resource.StudentsResponses.name,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
		Select: selectOption,
	};

	const feedbackCommand = new QueryCommand(feedbackParams);
	const feedbackResult = await dbClient.send(feedbackCommand);
	const feedbackItems = feedbackResult.Items || [];

	const responsesCommand = new QueryCommand(responsesParams);
	const totalResponsesResult = await dbClient.send(responsesCommand);
	const responseItems = totalResponsesResult.Items || [];

	const feedbackCount = feedbackResult.Count || 0;
	const totalResponses = totalResponsesResult.Count || 0;

	// If details are required, fetch user information from Cognito
	if (details) {
		const studentIDs = Array.from(
			new Set(responseItems.map((response) => response.studentID))
		);

		// Fetch user details from Cognito for each student
		const userPromises = studentIDs.map(async (studentID) => {
			try {
				const userCommand = new AdminGetUserCommand({
					UserPoolId: Resource.eccslabs.id,
					Username: studentID,
				});
				const userResponse = await cognitoClient.send(userCommand);

				// Extract required attributes from Cognito response
				const firstName =
					userResponse.UserAttributes.find(
						(attr) => attr.Name === "custom:firstName"
					)?.Value || "Unknown";
				const lastName =
					userResponse.UserAttributes.find(
						(attr) => attr.Name === "custom:lastName"
					)?.Value || "Unknown";

				return {
					id: studentID,
					firstName,
					lastName,
				};
			} catch (error) {
				console.error(`Error fetching user ${studentID}:`, error);
				return {
					id: studentID,
					firstName: "Unknown",
					lastName: "Unknown",
				};
			}
		});

		const users = await Promise.all(userPromises);

		// Create a map for quick lookup of user details by studentID
		const userMap = users.reduce((acc, user) => {
			acc[user.id] = user;
			return acc;
		}, {});

		// Merge user details with responses and feedback
		const responseWithUserDetails = responseItems.map((response) => {
			const user = userMap[response.studentID] || {
				firstName: "Unknown",
				lastName: "Unknown",
			};
			const feedbackForStudent = feedbackItems
				.filter((fb) => fb.studentID === response.studentID)
				.flatMap((fb) => fb.feedback);

			return {
				id: response.studentID,
				firstName: user.firstName,
				lastName: user.lastName,
				submittedAt: response.submittedAt || "N/A",
				caseExplanation: response.caseExplanation || "N/A",
				feedback: feedbackForStudent,
			};
		});

		return {
			responseItems: responseWithUserDetails,
			feedbackCount,
			totalResponses,
		};
	}

	// Return only counts if details are not requested
	return {
		feedbackCount,
		totalResponses,
	};
};

export {
	updateUserPassword,
	generateOtp,
	storeOtpInDb,
	getOtpFromDb,
	encryptPassword,
	decryptPassword,
	getUserByEmail,
	parseLogToObject,
};
