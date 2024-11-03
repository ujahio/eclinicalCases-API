import {
	UpdateCommand,
	GetCommand,
	ScanCommand,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import crypto from "crypto";
import busboy from "busboy";
import jwt from "jsonwebtoken";
import dbClient from "../services/dbClient.js";

function generateOtp() {
	return Math.floor(100000 + Math.random() * 900000);
}

async function storeOtpInDb(email, otp) {
	const params = {
		TableName: Resource.ECCSUsers.name,
		Key: {
			email: email,
		},
		UpdateExpression: "set otp = :otp",
		ExpressionAttributeValues: {
			":otp": otp,
		},
	};

	const command = new UpdateCommand(params);
	await dbClient.send(command);
}

async function getOtpFromDb(email) {
	const params = {
		TableName: Resource.ECCSUsers.name,
		Key: {
			email: email,
		},
		ProjectionExpression: "otp",
	};

	const command = new GetCommand(params);
	const result = await dbClient.send(command);
	return result.Item.otp;
}

async function updateUserPassword(email, newPassword) {
	const params = {
		TableName: Resource.ECCSUsers.name,
		Key: {
			email: email,
		},
		UpdateExpression: "set password = :newPassword",
		ExpressionAttributeValues: {
			":newPassword": newPassword,
		},
	};
	const command = new UpdateCommand(params);
	const result = await dbClient.send(command);
	return result.Attributes;
}

async function getUserByEmail(email) {
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
		return result.Items[0];
	} catch (error) {
		console.error(error);
		throw error;
	}
}

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
		Select: selectOption, // Conditional selection based on details flag
	};

	// Parameters for fetching responses
	const responsesParams = {
		TableName: Resource.StudentsResponses.name,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
		Select: selectOption, // Conditional selection based on details flag
	};

	const feedbackCommand = new QueryCommand(feedbackParams);
	const feedbackResult = await dbClient.send(feedbackCommand);
	const feedbackItems = feedbackResult.Items || []; // Full details if details flag is true

	const responsesCommand = new QueryCommand(responsesParams);
	const totalResponsesResult = await dbClient.send(responsesCommand);
	const responseItems = totalResponsesResult.Items || []; // Full details if details flag is true

	// Return only the counts if details are not requested
	const feedbackCount = feedbackResult.Count || 0; // Count if details flag is false
	const totalResponses = totalResponsesResult.Count || 0; // Count if details flag is false

	// If details are required, proceed to fetch user information for each response
	if (details) {
		// Map studentID to their corresponding response and feedback
		const studentIDs = responseItems.map((response) => response.studentID);

		// Fetch user details from the USERS table
		const userPromises = studentIDs.map(async (studentID) => {
			const userParams = {
				TableName: Resource.ECCSUsers.name,
				IndexName: "IDIndex",
				KeyConditionExpression: "id = :id",
				ExpressionAttributeValues: {
					":id": studentID,
				},
			};

			const userCommand = new QueryCommand(userParams);
			const userResult = await dbClient.send(userCommand);
			return userResult.Items[0] || null; // Return null if user not found
		});

		// Wait for all user queries to complete
		const users = await Promise.all(userPromises);

		// Merge the user information with responses and feedback
		const responseWithUserDetails = responseItems.map((response) => {
			const user = users.find((u) => u && u.id === response.studentID);
			const feedbackMap = feedbackItems.filter(
				(fb) => fb.studentID === response.studentID
			);

			// Flatten the feedback array of objects for each student
			const flattenedFeedback = feedbackMap.length
				? feedbackMap.flatMap((fb) => fb.feedback) // Flattening the array of feedback objects
				: [];

			// Return only the necessary fields
			return {
				id: user ? user.id : "",
				firstName: user ? user.firstName : "Unknown",
				lastName: user ? user.lastName : "Unknown",
				submittedAt: response.submittedAt || "N/A", // Assuming submittedAt exists in the response
				caseExplanation: response.caseExplanation || "N/A", // Assuming caseExplanation exists in the response
				feedback: flattenedFeedback, // Flattened array of feedback objects
			};
		});

		return {
			responseItems: responseWithUserDetails, // Full response details with required fields
			feedbackCount,
			totalResponses,
		};
	}

	return {
		feedbackCount,
		totalResponses,
	};
};

export const verifyToken = (token, secretKey) => {
	try {
		if (!token) {
			return { statusCode: 403, error: "No token provided!" };
		}
		// Verify the token using the secret key
		const decoded = jwt.verify(token, secretKey);
		// Token is valid; return the decoded token data
		return decoded;
	} catch (err) {
		// Handle different types of JWT errors
		if (err.name === "TokenExpiredError") {
			console.error("Token has expired");
		} else if (err.name === "JsonWebTokenError") {
			console.error("Invalid token");
		} else {
			console.error("Could not verify token", err.message);
		}
		// Return null or an appropriate error response
		return null;
	}
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
