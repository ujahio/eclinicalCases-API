import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { TABLES } from "../services/dbTables.js";
import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import { verifyToken } from "./case.controller.js"; // todo: move utils function to util fild/folder
import { getCountOfStudentsFeedbacksAndResponses } from "../utils/api_utils.js";

export const getActiveCase = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	if (
		!userInfo &&
		!(userInfo.roles === "teacher" || userInfo.roles === "student")
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

	// TODO: if you are a student, you have to your respective teacher id to get the active case

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

		if (userInfo.roles === "teacher") {
			const countOfStudentsFeedbackAndResponses =
				await getCountOfStudentsFeedbacksAndResponses(activeCaseResult.id);

			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Ongoing case retrieved successfully!",
					caseInfo: {
						caseTopic: activeCaseResult.caseTopic,
						createdAt: activeCaseResult.createdAt,
						caseDeadline: activeCaseResult.caseDeadline,
						caseStatus: activeCaseResult.caseStatus,
						feedbackCount: countOfStudentsFeedbackAndResponses.feedbackCount,
						totalResponses: countOfStudentsFeedbackAndResponses.totalResponses,
					},
				}),
			};
		} else {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Ongoing case retrieved successfully!",
					caseInfo: {
						caseTopic: activeCaseResult.caseTopic,
						createdAt: activeCaseResult.createdAt,
						caseDeadline: activeCaseResult.caseDeadline,
						caseStatus: activeCaseResult.caseStatus,
					},
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
