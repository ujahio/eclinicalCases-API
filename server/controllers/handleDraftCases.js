import { v4 as uuidv4 } from "uuid";
import {
	PutCommand,
	QueryCommand,
	GetCommand,
	UpdateCommand,
	DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { sortBy, isEqual } from "lodash";

import { TABLES } from "../services/dbTables.js";
// import uploadFileToBucket from "../services/bucket.js";
import dbClient from "../services/dbClient.js";
import SECRETS from "../services/secrets.js";
import { extrapolateRequestBody, verifyToken } from "../utils/api_utils.js";

export const addDraftCase = async (event) => {
	// TODO: MODIFY extrapolateRequestBody to return original data types
	const draftCaseData = await extrapolateRequestBody(event);
	console.log("draftCaseData ADDITION", draftCaseData);
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const teacherID = userInfo.id;

	// possible use coginito authorizer
	if (!userInfo || !userInfo.id || userInfo.user_role !== "teacher") {
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
			? // ? JSON.parse(draftCaseData.caseQuestions)
			  draftCaseData.caseQuestions
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
		if (!draftCaseResult || draftCaseResult.caseStatus !== "draft") {
			return {
				statusCode: 404,
				body: JSON.stringify({
					error: "No draft case found.",
				}),
			};
		}

		if (draftCaseResult.teacherId !== teacherId) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Not authorized to delete this resource",
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
				"teacherId = :teacherId AND caseStatus = :caseStatus",
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

// Helper function to prepare update expressions for DynamoDB
const prepareUpdateExpressions = (caseData) => {
	console.log("caseData", caseData);
	let updateExpression = "SET ";
	let expressionAttributeValues = {};
	let expressionAttributeNames = {};

	// Prepare and add caseDeadline if it exists
	if (caseData.caseDeadline) {
		const caseDeadline = new Date(caseData.caseDeadline).toISOString();
		updateExpression += "#caseDeadline = :caseDeadline, ";
		expressionAttributeNames["#caseDeadline"] = "caseDeadline";
		expressionAttributeValues[":caseDeadline"] = caseDeadline;
	}

	// Directly add caseMaterials if it exists
	if (caseData.caseMaterials && caseData.caseMaterials.length > 0) {
		const caseMaterialsToProcess = JSON.parse(caseData.caseMaterials);
		updateExpression += "#caseMaterials = :caseMaterials, ";
		expressionAttributeNames["#caseMaterials"] = "caseMaterials";
		expressionAttributeValues[":caseMaterials"] = JSON.stringify(
			caseMaterialsToProcess
		);
	}

	// Explicitly add each other field in caseData if it exists
	if (caseData.caseClue) {
		updateExpression += "#caseClue = :caseClue, ";
		expressionAttributeNames["#caseClue"] = "caseClue";
		expressionAttributeValues[":caseClue"] = caseData.caseClue;
	}

	if (caseData.caseDescription) {
		updateExpression += "#caseDescription = :caseDescription, ";
		expressionAttributeNames["#caseDescription"] = "caseDescription";
		expressionAttributeValues[":caseDescription"] = caseData.caseDescription;
	}

	if (caseData.caseTopic) {
		updateExpression += "#caseTopic = :caseTopic, ";
		expressionAttributeNames["#caseTopic"] = "caseTopic";
		expressionAttributeValues[":caseTopic"] = caseData.caseTopic;
	}

	if (caseData.caseExplanation) {
		updateExpression += "#caseExplanation = :caseExplanation, ";
		expressionAttributeNames["#caseExplanation"] = "caseExplanation";
		expressionAttributeValues[":caseExplanation"] = caseData.caseExplanation;
	}

	if (caseData.caseQuestions) {
		updateExpression += "#caseQuestions = :caseQuestions, ";
		expressionAttributeNames["#caseQuestions"] = "caseQuestions";
		expressionAttributeValues[":caseQuestions"] = caseData.caseQuestions;

		// expressionAttributeValues[":caseQuestions"] = JSON.parse(
		// 	caseData.caseQuestions
		// );
	}

	// Remove trailing comma and space from updateExpression
	updateExpression = updateExpression.slice(0, -2);

	return {
		updateExpression,
		expressionAttributeValues,
		expressionAttributeNames,
	};
};

export const updateDraftCase = async (event) => {
	const caseData = await extrapolateRequestBody(event);
	const caseID = event.pathParameters.caseID;
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const { id: userId, roles } = userInfo;

	// Authorization and ID checks
	if (!userInfo && !(roles === "teacher")) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Not authorized to use this resource",
			}),
		};
	}

	if (!caseID) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: "Missing case ID in the request URL." }),
		};
	}

	try {
		const getCaseParams = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			Key: { id: caseID },
		};

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

		// Use the helper function to prepare the update expressions
		const {
			updateExpression,
			expressionAttributeValues,
			expressionAttributeNames,
		} = prepareUpdateExpressions(caseData);

		// Construct the update command for DynamoDB
		const updateParams = {
			TableName: TABLES.TEACHER_CASE_STUDIES,
			Key: { id: caseID },
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
			ReturnValues: "UPDATED_NEW",
		};

		// Send update command to DynamoDB
		const updateCommand = new UpdateCommand(updateParams);
		const updateResult = await dbClient.send(updateCommand);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case updated successfully.",
				data: updateResult.Attributes,
			}),
		};
	} catch (error) {
		console.error("Error updating case: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not update case: ${error.message}`,
			}),
		};
	}
};

// const areArraysEqualRegardlessOfOrder = (array1, array2, key) => {
// 	const sortedArray1 = sortBy(array1, [key]);
// 	const sortedArray2 = sortBy(array2, [key]);
// 	return isEqual(sortedArray1, sortedArray2);
// };

// export const updateDraftCase = async (event) => {
// 	const caseData = await extrapolateRequestBody(event);
// 	const caseID = event.pathParameters.caseID;
// 	const userToken = event.headers.authorization.split(" ")[1];
// 	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
// 	const { id: userId, roles } = userInfo;

// 	// Possible use of Cognito authorizer
// 	if (!userInfo && !(roles === "teacher")) {
// 		return {
// 			statusCode: 400,
// 			body: JSON.stringify({
// 				message: "Not authorized to use this resource",
// 			}),
// 		};
// 	}

// 	// Validate that caseID is present
// 	if (!caseID) {
// 		return {
// 			statusCode: 400,
// 			body: JSON.stringify({ error: "Missing case ID in the request URL." }),
// 		};
// 	}

// 	try {
// 		const getCaseParams = {
// 			TableName: TABLES.TEACHER_CASE_STUDIES,
// 			Key: { id: caseID },
// 		};

// 		const command = new GetCommand(getCaseParams);
// 		const result = await dbClient.send(command);
// 		const caseItem = result.Item;

// 		if (!caseItem) {
// 			return {
// 				statusCode: 404,
// 				body: JSON.stringify({ error: "Case not found" }),
// 			};
// 		}

// 		// Check if the case belongs to the current user (teacher)
// 		if (caseItem.teacherId !== userId) {
// 			return {
// 				statusCode: 403,
// 				body: JSON.stringify({
// 					error: "You do not have permission to update this case.",
// 				}),
// 			};
// 		}

// 		// Prepare caseDeadline if provided
// 		const caseDeadline = caseData.caseDeadline
// 			? new Date(caseData.caseDeadline).toISOString()
// 			: undefined;

// 		const caseMaterialsToProcess =
// 			caseData.caseMaterials && caseData.caseMaterials.length > 0
// 				? JSON.parse(caseData.caseMaterials)
// 				: [];

// 		// Prepare the update expression and dynamic attributes
// 		let updateExpression = "SET ";
// 		let expressionAttributeValues = {};
// 		let expressionAttributeNames = {};

// 		// List of fields that can be updated
// 		const updatableFields = [
// 			"caseClue",
// 			"caseDescription",
// 			"caseTopic",
// 			"caseExplanation",
// 			"caseQuestions",
// 		];

// 		console.log("caseData", caseData);

// 		updatableFields.forEach((field) => {
// 			const fieldValue = caseData[field];
// 			console.log("fieldValue", fieldValue);
// 			// Only process fields that are defined and not null/empty
// 			if (fieldValue) {
// 				const attributeName = `#${field}`;
// 				const attributeValue = `:${field}`;

// 				updateExpression += `${attributeName} = ${attributeValue}, `;
// 				expressionAttributeNames[attributeName] = field;
// 				expressionAttributeValues[attributeValue] =
// 					field === "caseQuestions" ? JSON.parse(fieldValue) : fieldValue;

// 				console.log(
// 					"expressionAttributeValues ON UDPATE",
// 					expressionAttributeValues
// 				);
// 				console.log(
// 					"expressionAttributeNames ON UDPATE",
// 					expressionAttributeNames
// 				);
// 			}
// 		});

// 		// is it neccessary to check if caseMaterials was previously updated
// 		// why can't we just update it if it's provided and override what's in db?
// 		const hasCaseMaterialsBeenUpdated = areArraysEqualRegardlessOfOrder(
// 			caseMaterialsToProcess,
// 			caseItem.caseMaterials,
// 			"documentKey"
// 		);

// 		// If case materials are provided, update them
// 		if (!hasCaseMaterialsBeenUpdated) {
// 			updateExpression += "#caseMaterials = :caseMaterials, ";
// 			expressionAttributeNames["#caseMaterials"] = "caseMaterials";
// 			expressionAttributeValues[":caseMaterials"] = JSON.stringify(
// 				caseMaterialsToProcess
// 			);
// 		}

// 		// If caseDeadline is provided, update it
// 		if (caseDeadline) {
// 			updateExpression += "#caseDeadline = :caseDeadline, ";
// 			expressionAttributeNames["#caseDeadline"] = "caseDeadline";
// 			expressionAttributeValues[":caseDeadline"] = caseDeadline;
// 		}

// 		// Remove trailing comma and space from updateExpression
// 		updateExpression = updateExpression.slice(0, -2);
// 		console.log("expressionAttributeValues AFTER", expressionAttributeValues);
// 		console.log("expressionAttributeNames AFTER", expressionAttributeNames);

// 		// Construct the update command for DynamoDB
// 		const updateParams = {
// 			TableName: TABLES.TEACHER_CASE_STUDIES, // Corrected table reference
// 			Key: { id: caseID },
// 			UpdateExpression: updateExpression,
// 			ExpressionAttributeValues: expressionAttributeValues,
// 			ExpressionAttributeNames: expressionAttributeNames,
// 			ReturnValues: "UPDATED_NEW", // Return only updated attributes
// 		};

// 		// Send update command to DynamoDB
// 		const updateCommand = new UpdateCommand(updateParams);
// 		const updateResult = await dbClient.send(updateCommand);

// 		// Return success response with updated attributes
// 		return {
// 			statusCode: 200,
// 			body: JSON.stringify({
// 				message: "Case updated successfully.",
// 				data: updateResult.Attributes,
// 			}),
// 		};
// 	} catch (error) {
// 		// Catch and log errors, return a 500 status code with error details
// 		console.error("Error updating case: ", error);
// 		return {
// 			statusCode: 500,
// 			body: JSON.stringify({
// 				error: `Could not update case: ${error.message}`,
// 			}),
// 		};
// 	}
// };
