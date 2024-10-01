import dbClient from "../services/dbClient.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
	GetCommand,
	PutCommand,
	ScanCommand,
	DeleteCommand,
	UpdateCommand,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { readSingleItem } from "../services/dbOps.js";
import { TABLES } from "../services/dbTables.js";
import uploadFileToBucket from "../services/bucket.js";

const addCase = async (event) => {
	const buffer = Buffer.from(event.body, "base64");
	console.log("buffer: ", buffer);
	console.log("event: ", event);
	console.log("event.files: ", event.files);
	const userID = event.requestContext.authorizer.claims.sub;
	const caseData = JSON.parse(event.body);
	const draft = caseData.draft === "true";

	console.log("event.files: ", event.files);
	const caseMaterials = event.files.map((file) => ({
		filename: file.originalname,
		filePath: file.location,
	}));

	const caseItem = {
		id: uuidv4(),
		createdBy: userID,
		createdAt: Date.now(),
		caseStatus: draft ? "draft" : "active",
		caseMaterials,
	};

	if (caseData.caseClue) caseItem.caseClue = caseData.caseClue;
	if (caseData.caseDescription)
		caseItem.caseDescription = caseData.caseDescription;
	if (caseData.caseTopic) caseItem.caseTopic = caseData.caseTopic;
	if (caseData.caseExplanation)
		caseItem.caseExplanation = caseData.caseExplanation;
	if (caseData.caseDeadline)
		caseItem.caseDeadline = new Date(caseData.caseDeadline).toISOString();
	if (caseData.caseQuestions)
		caseItem.caseQuestions = JSON.parse(caseData.caseQuestions);

	if (!draft) {
		const activeCaseParams = {
			TableName: TABLES.CASE,
			FilterExpression: "#caseStatus = :caseStatus",
			ExpressionAttributeNames: {
				"#caseStatus": "caseStatus",
			},
			ExpressionAttributeValues: {
				":caseStatus": "active",
			},
		};

		try {
			const activeCaseCommand = new ScanCommand(activeCaseParams);
			const activeCaseResult = await dbClient.send(activeCaseCommand);
			const activeCase = activeCaseResult.Items[0];

			if (activeCase) {
				return {
					statusCode: 400,
					body: JSON.stringify({ error: "Case is already published" }),
				};
			}
		} catch (error) {
			console.error("Error scanning active cases: ", error);
			return {
				statusCode: 500,
				body: JSON.stringify({ error: "Could not check active cases" }),
			};
		}
	}

	const params = {
		TableName: TABLES.CASE,
		Item: caseItem,
	};

	try {
		const command = new PutCommand(params);
		const result = await dbClient.send(command);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case added successfully.",
				data: result,
			}),
		};
	} catch (error) {
		console.error("Error adding case: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: `Could not create case: ${error}` }),
		};
	}
};

const updateCase = async (event) => {
	const caseData = JSON.parse(event.body);
	const caseID = event.pathParameters.caseID;
	const userId = event.requestContext.authorizer.claims.sub;

	if (!caseID) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: "Missing case ID in the request URL." }),
		};
	}

	const caseParams = {
		TableName: TABLES.CASE,
		Key: { id: caseID },
		ConditionExpression: "createdBy = :createdBy",
		ExpressionAttributeValues: { ":createdBy": userId },
	};

	try {
		const command = new GetCommand(caseParams);
		const result = await dbClient.send(command);
		const caseItem = result.Item;

		if (!caseItem) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: "Case not found" }),
			};
		}

		const caseDeadline = caseData.caseDeadline
			? new Date(caseData.caseDeadline).toISOString()
			: undefined;
		const caseMaterials = event.files
			? event.files.map((file) => ({
					filename: file.originalname,
					filePath: file.location,
			  }))
			: [];

		let updateExpression = "SET ";
		let expressionAttributeValues = {};
		let expressionAttributeNames = {};

		const updatableFields = [
			"caseClue",
			"caseDescription",
			"caseTopic",
			"caseExplanation",
			"caseQuestions",
		];

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

		if (caseMaterials.length > 0) {
			const existingCaseMaterials = caseItem.caseMaterials || [];
			const updatedCaseMaterials = [...existingCaseMaterials, ...caseMaterials];
			updateExpression += "#caseMaterials = :caseMaterials, ";
			expressionAttributeNames["#caseMaterials"] = "caseMaterials";
			expressionAttributeValues[":caseMaterials"] = updatedCaseMaterials;
		}

		if (caseDeadline) {
			updateExpression += "#caseDeadline = :caseDeadline, ";
			expressionAttributeNames["#caseDeadline"] = "caseDeadline";
			expressionAttributeValues[":caseDeadline"] = caseDeadline;
		}

		// Remove trailing comma and space from updateExpression
		updateExpression = updateExpression.slice(0, -2);

		const updateParams = {
			TableName: TABLES.CASE,
			Key: { id: caseID },
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
			ReturnValues: "UPDATED_NEW",
		};

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
			body: JSON.stringify({ error: `Could not update case: ${error}` }),
		};
	}
};

const getCases = async (event) => {
	const caseStatus = event.pathParameters?.caseStatus;
	console.log("caseStatus****: ", caseStatus);
	try {
		let params = {
			TableName: TABLES.CASE,
			IndexName: "CreatedAtIndex",
			ScanIndexForward: false, // Descending order
			ExpressionAttributeNames: {
				"#caseStatus": "caseStatus",
			},
		};

		if (caseStatus && caseStatus === "recent") {
			params = {
				...params,
				FilterExpression: "#caseStatus = :caseStatus",
				ExpressionAttributeValues: {
					":caseStatus": "active",
				},
				Limit: 4,
			};
		} else {
			params = {
				...params,
				FilterExpression: "#caseStatus IN (:active, :draft)",
				ExpressionAttributeValues: {
					":active": "active",
					":draft": "draft",
				},
			};
		}
		const command = new ScanCommand(params);
		const result = await dbClient.send(command);
		const cases = result.Items;

		// Fetch total number of answers and feedbacks for each case
		const detailedCasesPromises = cases.map(async (caseItem) => {
			const caseID = caseItem.id;

			// Count answers
			const answersParams = {
				TableName: TABLES.ANSWER,
				IndexName: "CaseIDIndex",
				KeyConditionExpression: "caseID = :caseID",
				ExpressionAttributeValues: {
					":caseID": caseID,
				},
				Select: "COUNT",
			};
			const answersCommand = new QueryCommand(answersParams);
			const answersResult = await dbClient.send(answersCommand);
			const totalAnswers = answersResult.Count;

			// Count feedbacks
			const feedbackParams = {
				TableName: TABLES.FEEDBACK,
				IndexName: "CaseIDIndex",
				KeyConditionExpression: "caseID = :caseID",
				ExpressionAttributeValues: {
					":caseID": caseID,
				},
				Select: "COUNT",
			};
			const feedbackCommand = new QueryCommand(feedbackParams);
			const feedbackResult = await dbClient.send(feedbackCommand);
			const totalFeedbacks = feedbackResult.Count;

			return {
				...caseItem,
				totalResponses: totalAnswers,
				totalFeedbacks,
			};
		});

		const detailedCases = await Promise.all(detailedCasesPromises);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Cases retrieved successfully!",
				data: detailedCases,
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

const getCase = async (event) => {
	const caseID = event.pathParameters.caseID;

	if (!caseID) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: "Missing case ID in the request URL." }),
		};
	}

	try {
		const params = {
			TableName: TABLES.CASE,
			Key: {
				id: caseID,
			},
		};

		const command = new GetCommand(params);
		const result = await dbClient.send(command);
		const caseData = result.Item;

		if (!caseData) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: "Case not found.",
					data: {},
				}),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case retrieved successfully!",
				data: caseData,
			}),
		};
	} catch (error) {
		console.error("Error retrieving case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not retrieve case: ${error.message}`,
			}),
		};
	}
};

const getOngoingCase = async () => {
	try {
		const params = {
			TableName: TABLES.CASE,
			FilterExpression: "#caseStatus = :caseStatus",
			ExpressionAttributeNames: {
				"#caseStatus": "caseStatus",
			},
			ExpressionAttributeValues: {
				":caseStatus": "active",
			},
		};

		const command = new ScanCommand(params);
		const result = await dbClient.send(command);
		const cases = result.Items;

		// Fetch the total number of answers and feedbacks for each case
		const detailedCasesPromises = cases.map(async (caseItem) => {
			const caseID = caseItem.id;

			// Count answers
			const answersParams = {
				TableName: TABLES.ANSWER,
				IndexName: "CaseIDIndex",
				KeyConditionExpression: "caseID = :caseID",
				ExpressionAttributeValues: {
					":caseID": caseID,
				},
				Select: "COUNT",
			};
			const answersCommand = new QueryCommand(answersParams);
			const answersResult = await dbClient.send(answersCommand);
			const totalAnswers = answersResult.Count;

			// Count feedbacks
			const feedbackParams = {
				TableName: TABLES.FEEDBACK,
				IndexName: "CaseIDIndex",
				KeyConditionExpression: "caseID = :caseID",
				ExpressionAttributeValues: {
					":caseID": caseID,
				},
				Select: "COUNT",
			};
			const feedbackCommand = new QueryCommand(feedbackParams);
			const feedbackResult = await dbClient.send(feedbackCommand);
			const totalFeedbacks = feedbackResult.Count;

			return {
				...caseItem,
				totalResponses: totalAnswers,
				totalFeedbacks,
			};
		});

		const detailedCases = await Promise.all(detailedCasesPromises);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Ongoing case retrieved successfully!",
				data: detailedCases,
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

const deleteCase = async (event) => {
	try {
		const caseID = event.pathParameters.caseID;
		const userId = event.requestContext.authorizer.claims.sub;

		if (!caseID) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Missing case ID in the request URL." }),
			};
		}

		const params = {
			TableName: TABLES.CASE,
			Key: {
				id: caseID,
			},
			ConditionExpression: "createdBy = :createdBy",
			ExpressionAttributeValues: {
				":createdBy": userId,
			},
		};
		const deleteCommand = new DeleteCommand(params);
		await dbClient.send(deleteCommand);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Case deleted successfully!" }),
		};
	} catch (error) {
		console.error("Error deleting case:", error);

		return {
			statusCode: 404,
			body: JSON.stringify({ error: "Case not found: " + error.message }),
		};
	}
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

const publishCase = async (event) => {
	const { caseID } = JSON.parse(event.body);

	if (!caseID) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "CaseID not found.",
			}),
		};
	}

	const singleItemParams = {
		TableName: TABLES.CASE,
		Key: {
			id: caseID,
		},
	};

	try {
		const originalCase = await readSingleItem(singleItemParams);
		console.log("originalCase: ", originalCase);
		if (!originalCase) {
			return res.status(400).json({ error: "Case does not exist" });
		}

		const params = {
			TableName: TABLES.CASE,
			Key: {
				id: caseID,
			},
			UpdateExpression: "set caseStatus = :active",
			ExpressionAttributeValues: {
				":active": "active",
			},
		};

		const command = new UpdateCommand(params);
		const result = await dbClient.send(command);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case activated successfully.",
				data: result,
			}),
		};
	} catch (error) {
		console.error("Error activating case: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not activate case: ${error.message}`,
			}),
		};
	}
};

const addFeedback = async (event) => {
	const { caseID, feedback } = JSON.parse(event.body);
	const studentID = event.requestContext.authorizer.claims.sub;

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
		TableName: TABLES.ANSWER,
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
		TableName: TABLES.ANSWER,
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
	addCase,
	updateCase,
	getCases,
	getCase,
	getOngoingCase,
	deleteCase,
	deleteAllCases,
	duplicateCase,
	publishCase,
	addFeedback,
	getCaseFeedback,
	getCaseAnswers,
	getCaseAttemptsByStudent,
	getCaseData,
};
