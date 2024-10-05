import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { TABLES } from "../services/dbTables.js";
import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import { extrapolateFormData } from "../utils/api_utils.js";
import { verifyToken } from "./case.controller.js"; // todo: move utils function to util fild/folder

export const addDraftCase = async (event) => {
	const draftCaseData = await extrapolateFormData(event);
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const teacherID = userInfo.id;

	// TODO: evaluate required fields for draft cases
	if (!teacherID || !draftCaseData.caseClue) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing required fields",
			}),
		};
	}

	// possible use coginito authorizer
	if (userInfo.roles !== "teacher") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Unauthorized user",
			}),
		};
	}

	// TODO: save case materials to S3 bucket and store the file paths in the case item
	// const caseMaterials = caseData.caseMaterials.map((file) => ({
	// 	filename: file.originalname,
	// 	filePath: file.location,
	// }));

	const caseItem = {
		id: uuidv4(),
		teacherId: teacherID,
		createdAt: Date.now(),
		caseStatus: "draft",
		caseClue: draftCaseData.caseClue || undefined,
		caseDescription: draftCaseData.caseDescription || undefined,
		caseTopic: draftCaseData.caseTopic || undefined,
		caseExplanation: draftCaseData.caseExplanation || undefined,
		caseDeadline: draftCaseData.caseDeadline
			? new Date(draftCaseData.caseDeadline).toISOString()
			: undefined,
		caseQuestions: draftCaseData.caseQuestions
			? JSON.parse(draftCaseData.caseQuestions)
			: undefined,
		caseMaterials: draftCaseData.caseMaterials || undefined,
	};

	const params = {
		TableName: TABLES.TEACHER_CASE_STUDIES,
		Item: caseItem,
	};

	try {
		const command = new PutCommand(params);
		const result = await dbClient.send(command);
		console.log("Draft Case added successfully", result);
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Draft Case added successfully.",
				data: result,
			}),
		};
	} catch (error) {
		console.error("Error adding a draft case: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not create a draft case: ${error}`,
			}),
		};
	}
};

export const getDraftCases = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const teacherID = userInfo.id;

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
		const params = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			IndexName: "TeacherStatusIndex",
			KeyConditionExpression:
				"teacherId = :teacherId AND caseStatus = :caseStatus",
			ExpressionAttributeValues: {
				":teacherId": teacherID,
				":caseStatus": "draft",
			},
		};

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		const draftCasesResult = result.Items;
		console.log("Draft Cases retrieved successfully", draftCasesResult);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Draft Cases retrieved successfully!",
				draftCasesInfo: draftCasesResult,
			}),
		};
	} catch (error) {
		console.error("Error retrieving draft cases:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not retrieve draft cases: ${error.message}`,
			}),
		};
	}
};

export const deleteDraftCase = async (event) => {
	try {
		const caseID = event.pathParameters.caseID;
		const userToken = event.headers.authorization.split(" ")[1];
		const { id: teacherId } = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

		// Validate caseID
		if (!caseID) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Missing case ID in the request URL." }),
			};
		}

		// Query the case to check if it's a draft and belongs to the teacher
		const caseSearchParams = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			Key: { id: caseID }, // Use the primary key to get the case directly
		};

		const getCaseCommand = new GetCommand(caseSearchParams);
		const result = await dbClient.send(getCaseCommand);
		const draftCaseResult = result.Item;

		// Check if case exists and is a draft case
		if (
			!draftCaseResult ||
			draftCaseResult.teacherId !== teacherId ||
			draftCaseResult.caseStatus !== "draft"
		) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: "No draft case found or unauthorized.",
				}),
			};
		}

		// Delete the case if it meets the criteria
		const deleteParams = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			Key: {
				id: caseID,
			},
			ConditionExpression:
				"teacherId = :teacherId AND caseStatus = :caseStatus", // Ensures only draft cases are deleted
			ExpressionAttributeValues: {
				":teacherId": teacherId,
				":caseStatus": "draft",
			},
		};
		const deleteCommand = new DeleteCommand(deleteParams);
		await dbClient.send(deleteCommand);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Draft case deleted successfully!" }),
		};
	} catch (error) {
		console.error("Error deleting case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error deleting case: " + error.message }),
		};
	}
};
