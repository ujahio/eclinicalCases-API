import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import dbClient from "../services/dbClient.js";
import { getDetailsOfStudentsFeedbackAndResponses } from "../utils/api_utils.js";
import getUserInfo from "../persistence.helpers/getUserInfo.js";
import decodeToken from "../utils/decodeToken.js";

export const getArchivedCases = async (event) => {
	const decodedToken = decodeToken(event);
	const username = decodedToken.username;
	const userInfo = await getUserInfo(username);

	if (!userInfo || userInfo.user_role !== "teacher") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Not authorized to view this resource",
				message: "Error getting archived cases.",
			}),
		};
	}

	if (!userInfo.id) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Invalid input: missing required fields",
				message: "Error getting archived cases.",
			}),
		};
	}

	try {
		const caseFilter = event.queryStringParameters?.caseFilter;

		let params = {
			TableName: Resource.TeacherCaseStudies.name,
			IndexName: "TeacherPublishedDateIndex",
			KeyConditionExpression: "teacherId = :teacherId",
			FilterExpression: "caseStatus = :caseStatus",
			ExpressionAttributeValues: {
				":teacherId": userInfo.id,
				":caseStatus": "archived",
			},
			ScanIndexForward: false, // Sort in descending order (latest first)
		};

		if (caseFilter && caseFilter === "recent") {
			params.Limit = 3;
		}

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		const archivedCases = result.Items;

		const archivedCasesResults = await Promise.all(
			archivedCases.map(async (c) => {
				const caseID = c.id;
				const countResults = await getDetailsOfStudentsFeedbackAndResponses(
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
		console.error("Error retrieving archived cases:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error retrieving archived cases: ${error.message}`,
				message: "Error retrieving archived cases.",
			}),
		};
	}
};
