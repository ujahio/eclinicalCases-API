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
	if (userInfo.roles === "student") {
		await getOngoingCaseForStudent(event);
	} else {
		return await getOngoingCaseForTeacher(userInfo);
	}
};

const getOngoingCaseForStudent = async (event) => {};

const getOngoingCaseForTeacher = async (userInfo) => {
	const teacherID = userInfo.id;

	try {
		const params = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			IndexName: "TeacherStatusIndex",
			KeyConditionExpression:
				"teacherId = :teacherId AND caseStatus = :caseStatus",
			ExpressionAttributeValues: {
				":teacherId": teacherID,
				":caseStatus": "published",
			},
		};

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		const onGoingCase = result.Items[0];

		// If no active cases found, return a message
		if (!onGoingCase) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "There are no ongoing cases at the moment.",
				}),
			};
		}

		const countOfStudentsFeedbackAndResponses =
			await getCountOfStudentsFeedbacksAndResponses(onGoingCase.id);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Ongoing case retrieved successfully!",
				caseInfo: {
					caseTopic: onGoingCase.caseTopic,
					createdAt: onGoingCase.createdAt,
					caseDeadline: onGoingCase.caseDeadline,
					caseStatus: onGoingCase.caseStatus,
					feedbackCount: countOfStudentsFeedbackAndResponses.feedbackCount,
					totalResponses: countOfStudentsFeedbackAndResponses.totalResponses,
				},
			}),
		};
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
