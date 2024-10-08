import { v4 as uuidv4 } from "uuid";
import {
	PutCommand,
	QueryCommand,
	GetCommand,
	UpdateCommand,
	DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

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

	// possible use coginito authorizer
	if (!userInfo && userInfo.user_role !== "teacher") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Not authorized to use this resource",
			}),
		};
	}

	// TODO: evaluate required fields for draft cases
	if (!teacherID || !draftCaseData.caseClue) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Invalid input: missing required fields",
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
	const caseId = event.pathParameters?.caseId;
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const teacherID = userInfo.id;

	if (!userInfo && !(roles === "teacher")) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Not authorized to use this resource",
			}),
		};
	}

	try {
		let params;

		if (caseId) {
			// Query for a single draft case by caseId

			params = {
				TableName: TABLES.TEACHER_CASE_STUDIES,
				KeyConditionExpression: "id = :caseId", // Primary key query
				ExpressionAttributeValues: {
					":caseId": caseId,
				},
			};
		} else {
			// Query for all draft cases for the teacher
			params = {
				TableName: TABLES.TEACHER_CASE_STUDIES,
				IndexName: "TeacherStatusIndex",
				KeyConditionExpression:
					"teacherId = :teacherId AND caseStatus = :caseStatus",
				ExpressionAttributeValues: {
					":teacherId": teacherID,
					":caseStatus": "draft",
				},
			};
		}

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);

		const draftCasesResult = result.Items;
		console.log("Draft Cases retrieved successfully", draftCasesResult);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Draft case(s) retrieved successfully!",
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
		const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
		const { id: teacherId } = userInfo;

		if (!userInfo && !(roles === "teacher")) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Not authorized to use this resource",
				}),
			};
		}

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

export const updateDraftCase = async (event) => {
	const caseData = await extrapolateFormData(event);
	const caseID = event.pathParameters.caseID;
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const { id: userId, roles } = userInfo;

	// Possible use of Cognito authorizer
	if (!userInfo && !(roles === "teacher")) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Not authorized to use this resource",
			}),
		};
	}

	// Validate that caseID is present
	if (!caseID) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: "Missing case ID in the request URL." }),
		};
	}

	const getCaseParams = {
		TableName: TABLES.TEACHER_CASE_STUDIES,
		Key: { id: caseID },
	};

	try {
		// Fetch the case by ID
		const command = new GetCommand(getCaseParams);
		const result = await dbClient.send(command);
		const caseItem = result.Item;

		if (!caseItem) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: "Case not found" }),
			};
		}

		// Check if the case belongs to the current user (teacher)
		if (caseItem.teacherId !== userId) {
			return {
				statusCode: 403,
				body: JSON.stringify({
					error: "You do not have permission to update this case.",
				}),
			};
		}

		// Prepare caseDeadline and caseMaterials if provided
		const caseDeadline = caseData.caseDeadline
			? new Date(caseData.caseDeadline).toISOString()
			: undefined;
		const caseMaterials = event.files
			? event.files.map((file) => ({
					filename: file.originalname,
					filePath: file.location,
			  }))
			: [];

		// Prepare the update expression and dynamic attributes
		let updateExpression = "SET ";
		let expressionAttributeValues = {};
		let expressionAttributeNames = {};

		// List of fields that can be updated
		const updatableFields = [
			"caseClue",
			"caseDescription",
			"caseTopic",
			"caseExplanation",
			"caseQuestions",
		];

		// Loop through updatable fields and build the update expression
		updatableFields.forEach((field) => {
			if (caseData[field] !== undefined) {
				const attributeName = `#${field}`;
				const attributeValue = `:${field}`;

				updateExpression += `${attributeName} = ${attributeValue}, `;
				expressionAttributeNames[attributeName] = field;
				expressionAttributeValues[attributeValue] =
					field === "caseQuestions"
						? JSON.parse(caseData[field])
						: caseData[field];
			}
		});

		// If case materials are provided, update them
		if (caseMaterials.length > 0) {
			const existingCaseMaterials = caseItem.caseMaterials || [];
			const updatedCaseMaterials = [...existingCaseMaterials, ...caseMaterials];
			updateExpression += "#caseMaterials = :caseMaterials, ";
			expressionAttributeNames["#caseMaterials"] = "caseMaterials";
			expressionAttributeValues[":caseMaterials"] = updatedCaseMaterials;
		}

		// If caseDeadline is provided, update it
		if (caseDeadline) {
			updateExpression += "#caseDeadline = :caseDeadline, ";
			expressionAttributeNames["#caseDeadline"] = "caseDeadline";
			expressionAttributeValues[":caseDeadline"] = caseDeadline;
		}

		// Remove trailing comma and space from updateExpression
		updateExpression = updateExpression.slice(0, -2);

		// Construct the update command for DynamoDB
		const updateParams = {
			TableName: TABLES.TEACHER_CASE_STUDIES, // Corrected table reference
			Key: { id: caseID },
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
			ReturnValues: "UPDATED_NEW", // Return only updated attributes
		};

		// Send update command to DynamoDB
		const updateCommand = new UpdateCommand(updateParams);
		const updateResult = await dbClient.send(updateCommand);

		// Return success response with updated attributes
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case updated successfully.",
				data: updateResult.Attributes,
			}),
		};
	} catch (error) {
		// Catch and log errors, return a 500 status code with error details
		console.error("Error updating case: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not update case: ${error.message}`,
			}),
		};
	}
};
