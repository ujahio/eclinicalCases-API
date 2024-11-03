import { v4 as uuidv4 } from "uuid";
import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
// import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import { extrapolateRequestBody, verifyToken } from "../utils/api_utils.js";
import { getDetailsOfStudentsFeedbackAndResponses } from "../utils/api_utils.js";

export const publishCase = async (event) => {
	const {
		caseId,
		caseClue,
		caseDescription,
		caseTopic,
		caseExplanation,
		caseDeadline,
		caseQuestions,
		caseMaterials,
	} = await extrapolateRequestBody(event);

	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, Resource.NEXT_JWT_SECRET.value);

	const { id: teacherId } = userInfo;

	// Possible use of Cognito authorizer
	if (!userInfo || userInfo.user_role !== "teacher") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Not authorized to use this resource",
				message: "Error publishing case case.",
			}),
		};
	}

	if (!caseClue) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing case topic clue",
			}),
		};
	}

	if (!caseDescription) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing case description",
			}),
		};
	}

	if (!caseTopic) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing case topic",
			}),
		};
	}

	if (!caseExplanation) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing case study explanation",
			}),
		};
	}

	if (!caseDeadline) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing case deadline",
			}),
		};
	}

	// TODO: Add validation for caseQuestions and caseMaterials

	try {
		// Step 1: Check if the teacher already has an active published case
		const activeCase = await dbClient.send(
			new QueryCommand({
				TableName: Resource.TeacherCaseStudies.name,
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
					error: "Error publishing case",
					message:
						"You already have an active published case. Please archive or wait for it to expire before publishing another case.",
				}),
			};
		}
	} catch (error) {
		console.error("Error checking for published case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error checking for published case: ${error.message}`,
				message: "Error checking for published case.",
			}),
		};
	}

	const newCaseId = caseId || uuidv4();
	const todaysDate = new Date().toISOString();

	try {
		let updateExpression = `
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
    `;

		const expressionAttributeValues = {
			":caseStatus": "published",
			":publishedDate": todaysDate,
			":caseDeadline": new Date(caseDeadline).toISOString(),
			":caseClue": caseClue,
			":caseDescription": caseDescription,
			":caseTopic": caseTopic,
			":caseExplanation": caseExplanation,
			":caseQuestions": caseQuestions,
			":createdAt": todaysDate,
			":teacherId": teacherId,
		};
		// Conditionally add the caseMaterials field if it exists
		if (caseMaterials) {
			updateExpression += ", caseMaterials = :caseMaterials";
			expressionAttributeValues[":caseMaterials"] = caseMaterials;
		}

		const updateParams = new UpdateCommand({
			TableName: Resource.TeacherCaseStudies.name,
			Key: { id: newCaseId },
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
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
				error: `Error publishing case ${newCaseId} for teacher ${teacherId}: ${error.message}`,
				message: `Error publishing new case`,
			}),
		};
	}
};

export const getPublishedCase = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, Resource.NEXT_JWT_SECRET.value);

	// Check for valid user roles and authentication
	if (
		!userInfo &&
		!(userInfo.user_role === "teacher" || userInfo.user_role === "student")
	) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Not authorized to view this resource",
				message: "Error getting publishing case",
			}),
		};
	}

	if (!userInfo.id) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Invalid input: missing required fields",
				message: "Error getting publishing case",
			}),
		};
	}

	try {
		const params = {
			TableName: Resource.TeacherCaseStudies.name,
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
				await getDetailsOfStudentsFeedbackAndResponses(activeCaseResult.id);

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
				TableName: Resource.StudentsResponses.name,
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
		console.error("Error retrieving published case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error retrieving published case: ${error.message}`,
				message: `Error retrieving published case.`,
			}),
		};
	}
};
