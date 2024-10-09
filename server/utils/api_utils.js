import {
	UpdateCommand,
	GetCommand,
	ScanCommand,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";
import crypto from "crypto";
import { TABLES } from "../services/dbTables.js";
import busboy from "busboy";

function generateOtp() {
	return Math.floor(100000 + Math.random() * 900000);
}

async function storeOtpInDb(email, otp) {
	const params = {
		TableName: TABLES.USER,
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
		TableName: TABLES.USER,
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
		TableName: TABLES.USER,
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
			TableName: TABLES.USER,
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

export const extrapolateFormData = async (event) => {
	const contentType =
		event.headers["content-type"] || event.headers["Content-Type"];
	const formData = {};

	if (event.body && contentType.startsWith("multipart/form-data")) {
		const bb = busboy({
			headers: event.headers,
		});

		return new Promise((resolve, reject) => {
			// Parse each part of the formData
			bb.on("file", (fieldname, file, filename, encoding, mimetype) => {
				file.on("data", (data) => {
					formData[fieldname] = data.toString();
				});
			});

			bb.on("field", (fieldname, value) => {
				formData[fieldname] = value;
			});

			bb.on("finish", () => {
				resolve(formData);
			});

			bb.on("error", (error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify({ message: "Error parsing form data", error }),
				});
			});

			// Pass the decoded body to busboy
			bb.end(Buffer.from(event.body, "base64").toString("binary"));
		});
	} else {
		return {
			statusCode: 400,
			body: JSON.stringify({ message: "Invalid content type" }),
		};
	}
};

export const getCountOfStudentsFeedbacksAndResponses = async (caseID) => {
	const feedbackParams = {
		TableName: TABLES.FEEDBACK,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
		Select: "COUNT", // Only count the number of items
	};

	const responsesParams = {
		TableName: TABLES.STUDENT_RESPONSES,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
		Select: "COUNT", // Only count the number of items
	};

	// Get the count of feedback items
	const feedbackCommand = new QueryCommand(feedbackParams);
	const feedbackResult = await dbClient.send(feedbackCommand);
	const feedbackCount = feedbackResult.Count || 0;

	// Get the count of answers items
	const responsesCommand = new QueryCommand(responsesParams);
	const totalResponsesResult = await dbClient.send(responsesCommand);
	const totalResponses = totalResponsesResult.Count || 0;

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
