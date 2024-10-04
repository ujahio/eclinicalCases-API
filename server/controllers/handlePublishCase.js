import { v4 as uuidv4 } from "uuid";
import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { TABLES } from "../services/dbTables.js";
import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import { extrapolateFormData } from "../utils/api_utils.js";
import { verifyToken } from "./case.controller.js"; // todo: move utils function to util fild/folder

export const publishCase = async (event) => {
	const {
		caseId,
		caseClue,
		caseDescription,
		caseTopic,
		caseExplanation,
		caseDeadline, // Now passed directly from the front end
		caseQuestions,
	} = await extrapolateFormData(event);

	const newCaseId = caseId || uuidv4();
	const todaysDate = new Date().toISOString();

	const userToken = event.headers.authorization.split(" ")[1];
	const { id: teacherId, roles } = verifyToken(
		userToken,
		SECRETS.NEXT_JWT_SECRET
	);

	// TODO: evaluate required fields for published cases
	if (!teacherId || !caseClue) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing required fields",
			}),
		};
	}

	// Possible use of Cognito authorizer
	if (roles !== "teacher") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Unauthorized user",
			}),
		};
	}

	console.log(
		`Publishing case for teacher ${teacherId}, case ID: ${newCaseId}`
	);

	try {
		// Step 1: Check if the teacher already has an active published case
		const activeCase = await dbClient.send(
			new QueryCommand({
				TableName: TABLES.TEACHER_CASE_STUDIES,
				IndexName: "TeacherStatusIndex",
				KeyConditionExpression:
					"teacherId = :teacherId AND caseStatus = :caseStatus",
				ExpressionAttributeValues: {
					":teacherId": teacherId,
					":caseStatus": "published",
				},
			})
		);

		// If there is already a published case, block the action
		if (activeCase.Items && activeCase.Items.length > 0) {
			console.log(`Teacher ${teacherId} already has an active published case.`);
			return {
				statusCode: 400,
				body: JSON.stringify({
					message:
						"You already have an active published case. Please archive or wait for it to expire before publishing another case.",
				}),
			};
		}
	} catch (error) {
		// Log error
		console.error(
			`Error checking for published case ${newCaseId} for teacher ${teacherId}:`,
			error
		);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Error checking for published case.",
				error: error.message,
			}),
		};
	}

	try {
		const updateParams = new UpdateCommand({
			TableName: TABLES.TEACHER_CASE_STUDIES,
			Key: { id: newCaseId },
			UpdateExpression: `
		SET caseStatus = :caseStatus,
		    caseDeadline = :caseDeadline,
		    caseClue = :caseClue,
		    caseDescription = :caseDescription,
		    caseTopic = :caseTopic,
		    caseExplanation = :caseExplanation,
		    caseQuestions = :caseQuestions,
        publishedAt = :publishedAt,
        createdAt = :createdAt,
        teacherId = :teacherId
        `,
			ExpressionAttributeValues: {
				":caseStatus": "published",
				":publishedAt": todaysDate,
				":caseDeadline": caseDeadline,
				":caseClue": caseClue,
				":caseDescription": caseDescription,
				":caseTopic": caseTopic,
				":caseExplanation": caseExplanation,
				":caseQuestions": caseQuestions,
				":createdAt": todaysDate,
				":teacherId": teacherId,
			},
			ReturnValues: "ALL_NEW",
		});

		const updatedCase = await dbClient.send(updateParams);
		console.log(
			`Case ${newCaseId} successfully published for teacher ${teacherId}`
		);
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case published successfully.",
				case: updatedCase.Attributes,
			}),
		};
	} catch (error) {
		// Log error
		console.error(
			`Error publishing case ${newCaseId} for teacher ${teacherId}:`,
			error
		);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Error publishing case.",
				error: error.message,
			}),
		};
	}
};
