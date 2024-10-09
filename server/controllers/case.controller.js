import { v4 as uuidv4 } from "uuid";
import {
	GetCommand,
	PutCommand,
	ScanCommand,
	DeleteCommand,
	UpdateCommand,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

import { readSingleItem } from "../services/dbOps.js";
import { TABLES } from "../services/dbTables.js";
import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import { parseLogToObject, extrapolateFormData } from "../utils/api_utils.js";
// TODO: move to a utility function

// todo: move to utility function
export const verifyToken = (token, secretKey) => {
	try {
		// Verify the token using the secret key
		const decoded = jwt.verify(token, secretKey);
		// Token is valid; return the decoded token data
		return decoded;
	} catch (err) {
		// Handle different types of JWT errors
		if (err.name === "TokenExpiredError") {
			console.error("Token has expired");
		} else if (err.name === "JsonWebTokenError") {
			console.error("Invalid token");
		} else {
			console.error("Could not verify token", err.message);
		}
		// Return null or an appropriate error response
		return null;
	}
};

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
		caseClue: publishedCaseResult.caseClue,
		caseExplanation: publishedCaseResult.caseExplanation,
	};

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: "Case details retrieved successfully!",
			caseInfo,
		}),
	};
};

const deleteAllCases = async () => {
	try {
		const params = {
			TableName: TABLES.CASE,
		};
		const scanCommand = new ScanCommand(params);
		const result = await dbClient.send(scanCommand);
		const cases = result.Items;
		const deletePromises = cases.map((caseItem) => {
			const deleteParams = {
				TableName: TABLES.CASE,
				Key: {
					id: caseItem.id,
				},
			};
			const deleteCommand = new DeleteCommand(deleteParams);
			return dbClient.send(deleteCommand);
		});
		await Promise.all(deletePromises);
		return {
			statusCode: 200,
			body: JSON.stringify({ message: "All cases deleted successfully!" }),
		};
	} catch (error) {
		console.error("Error deleting cases:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Could not delete cases: " + error.message,
			}),
		};
	}
};

const duplicateCase = async (event) => {
	const { caseID } = JSON.parse(event.body);

	try {
		if (!caseID) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Missing case ID in the request body." }),
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
				error: "Could not duplicate case: " + error.message,
			}),
		};
	}
};

const addFeedback = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const extrapolatedFormData = await extrapolateFormData(event);
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
				error: `Could not submit feedback: ${error.message}`,
			}),
		};
	}
};

const getCaseFeedback = async (event) => {
	const caseID = event.pathParameters.caseID;

	if (!caseID) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: "Missing case ID in the request." }),
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
				error: `Could not fetch feedback: ${error.message}`,
			}),
		};
	}
};
const getCaseAnswers = async (event) => {
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
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not fetch answers: ${error.message}`,
			}),
		};
	}
};

const getCaseAttemptsByStudent = async (event) => {
	const studentID = event.pathParameters.studentID;

	const params = {
		TableName: TABLES.STUDENTCASEATTEMPTS,
		IndexName: "StudentIDIndex",
		KeyConditionExpression: "studentID = :studentID",
		ExpressionAttributeValues: {
			":studentID": studentID,
		},
	};

	try {
		const command = new QueryCommand(params);
		const result = await dbClient.send(command);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case attempts retrieved successfully.",
				data: result.Items,
			}),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not fetch case attempts: ${error.message}`,
			}),
		};
	}
};

const getCaseData = async (event) => {
	const caseID = event.pathParameters.caseID;

	const feedbackParams = {
		TableName: TABLES.FEEDBACK,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
	};

	const answersParams = {
		TableName: TABLES.STUDENT_RESPONSES,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
	};

	try {
		const feedbackCommand = new QueryCommand(feedbackParams);
		const feedbackResult = await dbClient.send(feedbackCommand);

		const answersCommand = new QueryCommand(answersParams);
		const answersResult = await dbClient.send(answersCommand);

		// Combine feedback and answers by studentID
		const combinedData = {};

		feedbackResult.Items.forEach((feedback) => {
			if (!combinedData[feedback.studentID]) {
				combinedData[feedback.studentID] = {
					student: {},
					feedback: [],
					answers: [],
				};
			}
			combinedData[feedback.studentID].feedback.push(feedback);
		});

		answersResult.Items.forEach((answer) => {
			if (!combinedData[answer.studentID]) {
				combinedData[answer.studentID] = {
					student: {},
					feedback: [],
					answers: [],
				};
			}
			combinedData[answer.studentID].answers.push(answer);
		});

		// Fetch details of each student
		const studentDetailsPromises = Object.keys(combinedData).map(
			async (studentID) => {
				const userParams = {
					TableName: TABLES.USER,
					IndexName: "IDIndex",
					KeyConditionExpression: "id = :id",
					ExpressionAttributeValues: {
						":id": studentID,
					},
				};

				const userCommand = new QueryCommand(userParams);
				const userResult = await dbClient.send(userCommand);
				if (userResult.Items.length > 0) {
					const user = userResult.Items[0];
					combinedData[studentID].student = {
						firstName: user.firstname,
						lastName: user.lastname,
					};
				} else {
					throw new Error(`User with id ${studentID} not found`);
				}
			}
		);

		await Promise.all(studentDetailsPromises);

		const responseData = Object.values(combinedData);

		return {
			statusCode: 200,
			body: JSON.stringify(responseData),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: `Could not fetch data: ${error.message}` }),
		};
	}
};

export {
	// addCase,

	deleteAllCases,
	duplicateCase,
	addFeedback,
	getCaseFeedback,
	getCaseAnswers,
	getCaseAttemptsByStudent,
	getCaseData,
};
