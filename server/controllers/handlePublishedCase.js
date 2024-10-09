import { v4 as uuidv4 } from "uuid";
import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { TABLES } from "../services/dbTables.js";
import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import { extrapolateFormData } from "../utils/api_utils.js";
import { verifyToken } from "./case.controller.js"; // todo: move utils function to util fild/folder
import { getCountOfStudentsFeedbacksAndResponses } from "../utils/api_utils.js";

export const publishCase = async (event) => {
	const {
		caseId,
		caseClue,
		caseDescription,
		caseTopic,
		caseExplanation,
		caseDeadline,
		caseQuestions,
	} = await extrapolateFormData(event);

	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	const { id: teacherId, roles } = userInfo;

	// Possible use of Cognito authorizer
	if (!userInfo && !(roles === "teacher")) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Not authorized to use this resource",
			}),
		};
	}

	// TODO: evaluate required fields for published cases

	if (
		!caseClue ||
		!caseDescription ||
		!caseTopic ||
		!caseExplanation ||
		!teacherId ||
		!caseQuestions
	) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing required fields",
			}),
		};
	}

	const newCaseId = caseId || uuidv4();
	const todaysDate = new Date().toISOString();

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
        publishedDate = :publishedDate,
        createdAt = :createdAt,
        teacherId = :teacherId
        `,
			ExpressionAttributeValues: {
				":caseStatus": "published",
				":publishedDate": todaysDate,
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

export const getPublishedCase = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	// Check for valid user roles and authentication
	if (
		!userInfo &&
		!(userInfo.user_role === "teacher" || userInfo.user_role === "student")
	) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Not authorized to view this resource",
			}),
		};
	}

	if (!userInfo.id) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing required fields",
			}),
		};
	}

	try {
		const params = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			IndexName: "TeacherStatusIndex",
			KeyConditionExpression:
				"teacherId = :teacherId AND caseStatus = :caseStatus",
			ExpressionAttributeValues: {
				":teacherId": userInfo.id,
				":caseStatus": "published",
			},
		};

		// If the user is a student, adjust the query to use their teacher's ID
		if (userInfo.user_role === "student") {
			params.ExpressionAttributeValues[":teacherId"] = userInfo.teacherId;
		}

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		const activeCaseResult = result.Items[0];

		// If no active cases found, return a message
		if (!activeCaseResult) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "There are no ongoing cases at the moment.",
				}),
			};
		}

		// Prepare case info to be sent
		const caseInfo = {
			id: activeCaseResult.id,
			caseTopic: activeCaseResult.caseTopic,
			createdAt: activeCaseResult.createdAt,
			caseDeadline: activeCaseResult.caseDeadline,
			caseStatus: activeCaseResult.caseStatus,
		};

		// Teacher flow - unchanged
		if (userInfo.user_role === "teacher") {
			const countOfStudentsFeedbackAndResponses =
				await getCountOfStudentsFeedbacksAndResponses(activeCaseResult.id);

			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Ongoing case retrieved successfully!",
					caseInfo: {
						...caseInfo,
						feedbackCount: countOfStudentsFeedbackAndResponses.feedbackCount,
						totalResponses: countOfStudentsFeedbackAndResponses.totalResponses,
					},
				}),
			};
		}

		// Student flow: Check if the student has responded to the active case
		if (userInfo.user_role === "student") {
			const answerParams = {
				TableName: TABLES.ANSWER,
				IndexName: "StudentIDIndex", // Using the index to query answers by studentID
				KeyConditionExpression: "studentID = :studentID",
				ExpressionAttributeValues: {
					":studentID": userInfo.id,
				},
				FilterExpression: "caseID = :caseID", // Filter results by caseID
				ExpressionAttributeValues: {
					":studentID": userInfo.id,
					":caseID": activeCaseResult.id,
				},
			};

			// Query the Answers table to check for existing responses
			const answerCommand = new QueryCommand(answerParams);
			const answerResult = await dbClient.send(answerCommand);

			// If the student hasn't responded to the case, return the active case
			if (answerResult.Items.length === 0) {
				return {
					statusCode: 200,
					body: JSON.stringify({
						message: "You have not responded to this case yet.",
						caseInfo,
					}),
				};
			}

			// If the student has already responded, return a different message
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "You have already responded to this case.",
				}),
			};
		}
	} catch (error) {
		console.error("Error retrieving ongoing case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not retrieve ongoing cases: ${error.message}`,
			}),
		};
	}
};
