import { v4 as uuidv4 } from "uuid";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { TABLES } from "../services/dbTables.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import {
	parseLogToObject,
	extrapolateRequestBody,
	getDetailsOfStudentsFeedbackAndResponses,
	verifyToken,
} from "../utils/api_utils.js";

export const getCaseForStudentsResponse = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	const params = {
		TableName: TABLES.TEACHER_CASE_STUDIES,
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
			TableName: TABLES.CASE,
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
			TableName: TABLES.CASE,
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
	const userToken = event.headers.authorization.split(" ")[1];
	const extrapolatedFormData = await extrapolateRequestBody(event);
	const { caseID, feedback } = parseLogToObject(extrapolatedFormData);
	const { id: studentID } = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	if (!caseID || !feedback) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Missing caseID or feedback in the request.",
			}),
		};
	}

	const params = {
		TableName: TABLES.FEEDBACK,
		Item: {
			feedbackID: uuidv4(),
			caseID,
			studentID,
			feedback,
			createdAt: Date.now(),
		},
	};

	try {
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

export const getCaseFeedback = async (event) => {
	const caseID = event.pathParameters.caseID;

	if (!caseID) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Missing case ID in the request.",
				message: "Error getting feedback.",
			}),
		};
	}

	const params = {
		TableName: TABLES.FEEDBACK,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
	};

	try {
		const command = new QueryCommand(params);
		const feedbackResult = await dbClient.send(command);

		// Fetch details of each student
		const studentDetailsPromises = feedbackResult.Items.map(
			async (feedback) => {
				const userParams = {
					TableName: TABLES.USER,
					IndexName: "IDIndex",
					KeyConditionExpression: "id = :id",
					ExpressionAttributeValues: {
						":id": feedback.studentID,
					},
				};

				const userCommand = new QueryCommand(userParams);
				const userResult = await dbClient.send(userCommand);
				if (userResult.Items.length > 0) {
					const user = userResult.Items[0];
					return {
						student: {
							firstName: user.firstname,
							lastName: user.lastname,
						},
						...feedback,
					};
				} else {
					throw new Error(`User with ID ${feedback.studentID} not found`);
				}
			}
		);

		const detailedFeedbacks = await Promise.all(studentDetailsPromises);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Feedback retrieved successfully.",
				data: detailedFeedbacks,
			}),
		};
	} catch (error) {
		console.error("Error fetching feedback: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error fetching feedback: ${error.message}`,
				message: "Error fetching feedback.",
			}),
		};
	}
};
export const getCaseAnswers = async (event) => {
	const caseID = event.pathParameters.caseID;

	const answersParams = {
		TableName: TABLES.STUDENT_RESPONSES,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
	};

	try {
		const answersCommand = new QueryCommand(answersParams);
		const answersResult = await dbClient.send(answersCommand);

		// Fetch details of each student
		const studentDetailsPromises = answersResult.Items.map(async (answer) => {
			const userParams = {
				TableName: TABLES.USER,
				IndexName: "IDIndex",
				KeyConditionExpression: "id = :id",
				ExpressionAttributeValues: {
					":id": answer.studentID,
				},
			};

			const userCommand = new QueryCommand(userParams);
			const userResult = await dbClient.send(userCommand);
			if (userResult.Items.length > 0) {
				const user = userResult.Items[0];
				return {
					student: {
						firstName: user.firstname,
						lastName: user.lastname,
					},
					...answer,
				};
			} else {
				throw new Error(`User with id ${answer.studentID} not found`);
			}
		});

		const detailedAnswers = await Promise.all(studentDetailsPromises);

		return {
			statusCode: 200,
			body: JSON.stringify({ answers: detailedAnswers }),
		};
	} catch (error) {
		console.error("Error fetching responses", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error fetching responses: ${error.message}`,
				message: "Error fetching responses.",
			}),
		};
	}
};

export const getCaseData = async (event) => {
	const caseID = event.pathParameters.caseID;

	try {
		const getCaseParams = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
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
