import { v4 as uuidv4 } from "uuid";
import { Resource } from "sst";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";
import {
	parseLogToObject,
	extrapolateRequestBody,
	getDetailsOfStudentsFeedbackAndResponses,
} from "../utils/api_utils.js";
import getUserInfo from "../persistence.helpers/getUserInfo.js";
import decodeToken from "../utils/decodeToken.js";

export const getCaseForStudentsResponse = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);

		const params = {
			TableName: Resource.TeacherCaseStudies.name,
			IndexName: "TeacherStatusIndex",
			KeyConditionExpression:
				"teacherId = :teacherId AND caseStatus = :caseStatus",
			ExpressionAttributeValues: {
				":teacherId": userInfo.teacherId,
				":caseStatus": "published",
			},
		};

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		const publishedCaseResult = result.Items[0];

		if (!publishedCaseResult) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "There is currently no published case.",
				}),
			};
		}

		const caseInfo = {
			id: publishedCaseResult.id,
			caseTopic: publishedCaseResult.caseTopic,
			caseDeadline: publishedCaseResult.caseDeadline,
			caseStatus: publishedCaseResult.caseStatus,
			caseDescription: publishedCaseResult.caseDescription,
			caseQuestions: publishedCaseResult.caseQuestions,
			caseExplanation: publishedCaseResult.caseExplanation,
			caseMaterials: publishedCaseResult.caseMaterials,
		};

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case details retrieved successfully!",
				caseInfo,
			}),
		};
	} catch (error) {
		console.error("Error retrieving students responses:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error retrieving students responses: ${error.message}`,
				message: "Error retrieving students responses.",
			}),
		};
	}
};

export const duplicateCase = async (event) => {
	const { caseID } = JSON.parse(event.body);

	try {
		if (!caseID) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Missing case ID in the request body.",
				}),
			};
		}

		const singleItemParams = {
			TableName: Resource.TeacherCaseStudies.name,
			Key: {
				id: caseID,
			},
		};

		const getCommand = new GetCommand(singleItemParams);
		const originalCase = await dbClient.send(getCommand);

		if (!originalCase.Item) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Case does not exist" }),
			};
		}

		const duplicateCase = {
			...originalCase.Item,
			id: uuidv4(),
			caseClue: originalCase.Item.caseClue + " duplicate",
			createdAt: Date.now().toString(),
		};
		const putParams = {
			TableName: Resource.TeacherCaseStudies.name,
			Item: duplicateCase,
		};

		const putCommand = new PutCommand(putParams);
		await dbClient.send(putCommand);

		return {
			statusCode: 201,
			body: JSON.stringify({
				message: "Case duplicated successfully!",
				data: duplicateCase,
			}),
		};
	} catch (error) {
		console.error("Error duplicating case:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error duplicating case: ${error.message}`,
				message: "Error duplicating case.",
			}),
		};
	}
};

export const addFeedback = async (event) => {
	const extrapolatedFormData = await extrapolateRequestBody(event);
	const { caseID, feedback } = parseLogToObject(extrapolatedFormData);

	if (!caseID || !feedback) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Missing caseID or feedback in the request.",
			}),
		};
	}

	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const { id: studentID } = await getUserInfo(username);

		const params = {
			TableName: Resource.Feedback.name,
			Item: {
				feedbackID: uuidv4(),
				caseID,
				studentID,
				feedback,
				createdAt: Date.now(),
			},
		};
		const command = new PutCommand(params);
		await dbClient.send(command);
		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Feedback submitted successfully." }),
		};
	} catch (error) {
		console.error("Error submitting feedback: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error submitting feedback: ${error.message}`,
				message: "Error submitting feedback.",
			}),
		};
	}
};

export const getCaseData = async (event) => {
	try {
		const caseID = event.pathParameters.caseID;
		const getCaseParams = {
			TableName: Resource.TeacherCaseStudies.name,
			Key: { id: caseID },
		};

		const caseCommand = new GetCommand(getCaseParams);
		const caseResult = await dbClient.send(caseCommand);
		const caseItem = caseResult.Item;

		const { responseItems, feedbackCount, totalResponses } =
			await getDetailsOfStudentsFeedbackAndResponses(caseID, true);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case data retrieved successfully.",
				responseItems,
				caseInfo: {
					caseTopic: caseItem.caseTopic,
					totalResponses,
					feedbackCount,
				},
			}),
		};
	} catch (error) {
		console.error("Error fetching case data", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error fetching case data: ${error.message}`,
				message: "Error fetching case data.",
			}),
		};
	}
};
