import { v4 as uuidv4 } from "uuid";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { TABLES } from "../services/dbTables.js";
import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import { extrapolateFormData } from "../utils/api_utils.js";
import { verifyToken } from "./case.controller.js"; // todo: move utils function to util fild/folder
import { getCountOfStudentsFeedbacksAndResponses } from "../utils/api_utils.js";

export const getArchivedCases = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const teacherID = userInfo.id;
	const caseFilter = event.queryStringParameters?.caseFilter;

	// TODO: evaluate required fields for draft cases
	if (!teacherID) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing required fields",
			}),
		};
	}

	try {
		let params = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			IndexName: "TeacherPublishedDateIndex",
			KeyConditionExpression: "teacherId = :teacherId",
			FilterExpression: "caseStatus = :caseStatus", // Filter for archived cases only
			ExpressionAttributeValues: {
				":teacherId": teacherID,
				":caseStatus": "archived",
			},
			ScanIndexForward: false, // Sort in descending order (latest first)
		};

		if (caseFilter && caseFilter === "recent") {
			params.Limit = 3;
		}

		console.log("params***", params);

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		const archivedCases = result.Items;

		console.log("archivedCases***", archivedCases);

		const archivedCasesResults = await Promise.all(
			archivedCases.map(async (c) => {
				const caseID = c.id;
				const countResults = await getCountOfStudentsFeedbacksAndResponses(
					caseID
				);
				return {
					id: c.id,
					caseDescription: c.caseDescription,
					caseTopic: c.caseTopic,
					createdAt: c.createdAt,
					caseDeadline: c.caseDeadline,
					feedbackCount: countResults.feedbackCount,
					totalResponses: countResults.totalResponses,
				};
			})
		);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Cases retrieved successfully!",
				archivedCasesInfo: archivedCasesResults,
			}),
		};
	} catch (error) {
		console.error("Error retrieving cases:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not retrieve cases: ${error.message}`,
			}),
		};
	}
};
