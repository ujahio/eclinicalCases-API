import { v4 as uuidv4 } from "uuid";
import {
	PutCommand,
	QueryCommand,
	GetCommand,
	UpdateCommand,
	DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { sortBy, isEqual } from "lodash";
import { Resource } from "sst";
import { extrapolateRequestBody } from "../utils/api_utils.js";
import getUserInfo from "../persistence/getUserInfo.js";
import decodeToken from "../utils/decodeToken.js";
import applicationContext from "../../appContext/applicationContext.js";

const dbClient = applicationContext.getDBClient();

const areArraysEqualRegardlessOfOrder = (array1, array2, key) => {
	const sortedArray1 = sortBy(array1, [key]);
	const sortedArray2 = sortBy(array2, [key]);
	return isEqual(sortedArray1, sortedArray2);
};

export const addDraftCase = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);

		// possible use coginito authorizer
		if (!userInfo || !userInfo.id || userInfo.user_role !== "teacher") {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Not authorized to use this resource",
					message: "Error adding a draft case.",
				}),
			};
		}

		const draftCaseData = await extrapolateRequestBody(event);

		// TODO: evaluate required fields for draft cases
		if (!userInfo.id) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Invalid input: missing required fields",
					message: "Error adding a draft case.",
				}),
			};
		}

		const teacherID = userInfo.id;

		const caseItem = {
			id: uuidv4(),
			teacherId: teacherID,
			createdAt: Date.now(),
			caseStatus: "draft",
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
			TableName: Resource.TeacherCaseStudies.name,
			Item: caseItem,
		};

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
				error: `Error adding a draft case: ${error.message}`,
				message: "Error adding a draft case.",
			}),
		};
	}
};

export const getDraftCases = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);
		let params;

		if (!userInfo || userInfo.user_role !== "teacher") {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Not authorized to use this resource",
					message: "Error retrieving draft cases.",
				}),
			};
		}

		const teacherID = userInfo.id;
		const caseId = event.pathParameters?.caseId;

		if (caseId) {
			params = {
				TableName: Resource.TeacherCaseStudies.name,
				KeyConditionExpression: "id = :caseId",
				ExpressionAttributeValues: {
					":caseId": caseId,
				},
			};
		} else {
			params = {
				TableName: Resource.TeacherCaseStudies.name,
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
				error: `Error retrieving draft cases: ${error.message}`,
				message: "Error retrieving draft cases.",
			}),
		};
	}
};

export const deleteDraftCase = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);
		const caseID = event.pathParameters.caseID;

		// Validate caseID
		if (!caseID) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Missing case ID in the request URL.",
					message: "Error deleting draft case.",
				}),
			};
		}

		if (!userInfo || userInfo.user_role !== "teacher") {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Not authorized to use this resource",
					message: "Error deleting draft case.",
				}),
			};
		}

		const { id: teacherId } = userInfo;

		// Query the case to check if it's a draft and belongs to the teacher
		const caseSearchParams = {
			TableName: Resource.TeacherCaseStudies.name,
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
					message: "Error deleting draft case.",
				}),
			};
		}

		if (draftCaseResult.teacherId !== teacherId) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Error deleting draft case.",
					error: "Not authorized to delete this resource",
				}),
			};
		}

		const deleteParams = {
			TableName: Resource.TeacherCaseStudies.name,
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
		console.error("Error deleting draft case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error deleting draft case: ${error.message}`,
				message: "Error deleting draft case.",
			}),
		};
	}
};

export const updateDraftCase = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);
		const caseID = event.pathParameters.caseID;

		if (!userInfo || userInfo.user_role !== "teacher") {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Not authorized to use this resource",
					message: "Error updating draft case.",
				}),
			};
		}

		// Validate that caseID is present
		if (!caseID) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Missing case ID in the request URL.",
					message: "Error updating draft case.",
				}),
			};
		}

		const caseData = await extrapolateRequestBody(event);
		const { id: userId } = userInfo;

		const getCaseParams = {
			TableName: Resource.TeacherCaseStudies.name,
			Key: { id: caseID },
		};

		const command = new GetCommand(getCaseParams);
		const result = await dbClient.send(command);
		const caseItem = result.Item;

		if (!caseItem) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					error: "Case not found",
					message: "Error updating draft case.",
				}),
			};
		}

		// Check if the case belongs to the current user (teacher)
		if (caseItem.teacherId !== userId) {
			return {
				statusCode: 403,
				body: JSON.stringify({
					error: "You do not have permission to update this case.",
					message: "Error updating draft case.",
				}),
			};
		}

		// Prepare caseDeadline if provided
		const caseDeadline = caseData.caseDeadline
			? new Date(caseData.caseDeadline).toISOString()
			: undefined;

		const caseMaterialsToProcess =
			caseData.caseMaterials && caseData.caseMaterials.length > 0
				? JSON.parse(caseData.caseMaterials)
				: [];

		// Prepare the update expression and dynamic attributes
		let updateExpression = "SET ";
		let expressionAttributeValues = {};
		let expressionAttributeNames = {};

		// List of fields that can be updated
		const updatableFields = [
			"caseDescription",
			"caseTopic",
			"caseExplanation",
			"caseQuestions",
			"caseTeaching",
		];

		updatableFields.forEach((field) => {
			const fieldValue = caseData[field];

			// Only process fields that are defined and not null/empty
			if (fieldValue) {
				const attributeName = `#${field}`;
				const attributeValue = `:${field}`;

				updateExpression += `${attributeName} = ${attributeValue}, `;
				expressionAttributeNames[attributeName] = field;
				expressionAttributeValues[attributeValue] =
					field === "caseQuestions" ? JSON.parse(fieldValue) : fieldValue;
			}
		});

		const hasCaseMaterialsBeenUpdated = areArraysEqualRegardlessOfOrder(
			caseMaterialsToProcess,
			caseItem.caseMaterials,
			"documentKey"
		);

		// If case materials are provided, update them
		if (!hasCaseMaterialsBeenUpdated) {
			updateExpression += "#caseMaterials = :caseMaterials, ";
			expressionAttributeNames["#caseMaterials"] = "caseMaterials";
			expressionAttributeValues[":caseMaterials"] = JSON.stringify(
				caseMaterialsToProcess
			);
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
			TableName: Resource.TeacherCaseStudies.name, // Corrected table reference
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
		console.error("Error updating draft case: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error updating draft case: ${error.message}`,
				message: "Error updating draft case.",
			}),
		};
	}
};
