import { v4 as uuidv4 } from "uuid";
import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import dbClient from "../services/dbClient.js";
import { extrapolateRequestBody } from "../utils/api_utils.js";
import { getDetailsOfStudentsFeedbackAndResponses } from "../utils/api_utils.js";
import getUserInfo from "../persistence/getUserInfo.js";
import decodeToken from "../utils/decodeToken.js";
import applicationContext from "../../appContext/applicationContext.js";

const validateInputs = ({
	caseDescription,
	caseTopic,
	caseExplanation,
	caseDeadline,
	caseQuestions,
	caseTeaching,
}) => {
	const checkedCaseQuestions = JSON.parse(caseQuestions);

	if (checkedCaseQuestions.length === 0) {
		throw { message: "Missing CME Questions" };
	}

	checkedCaseQuestions.forEach((questionInfo, index) => {
		const questionNumber = index + 1;
		if (questionInfo.question === "") {
			throw {
				message: `Please add a question statement for CME Question ${questionNumber}`,
			};
		}
		if (questionInfo.options.length === 0) {
			throw {
				message: `Please add options for CME Question ${questionNumber}`,
			};
		}
	});

	// Validate case study explanation
	// check for caseDescription is a hack check for when editor is empty due to user deleting the items
	// structure needs to be fixed!!
	if (!caseDescription || caseDescription === "undefined") {
		throw { message: "Missing case study description." };
	} else {
		// Parse the caseExplanation to check for text in the blocks
		let descriptionParsed;
		try {
			descriptionParsed = JSON.parse(caseDescription);
		} catch (error) {
			throw { message: "Missing case study description." };
		}

		const hasTextInBlocks = descriptionParsed.blocks.some(
			(block) => block.text.trim().length > 0
		);

		if (!hasTextInBlocks) {
			throw { message: "Missing case study description." };
		}
	}

	if (!caseTopic) {
		throw { message: "Missing case topic" };
	}

	// Validate case study explanation
	// check for caseExplanation is a hack check for when editor is empty due to user deleting the items
	// structure needs to be fixed!!
	if (!caseExplanation || caseExplanation === "undefined") {
		throw {
			message: "Missing case study explanations.",
		};
	} else {
		// Parse the caseExplanation to check for text in the blocks
		let explanationParsed;
		try {
			explanationParsed = JSON.parse(caseExplanation);
		} catch (error) {
			throw { message: "Missing case study explanations." };
		}

		// Adjusted logic to ensure accurate validation of non-empty text in blocks
		const hasTextInExplanationBlocks = explanationParsed.blocks.some(
			(block) => {
				return block.text.trim().length > 0;
			}
		);

		if (!hasTextInExplanationBlocks) {
			throw { message: "Missing case study explanation" };
		}
	}

	// Validate case study teaching
	// check for caseTeaching is a hack check for when editor is empty due to user deleting the items
	// structure needs to be fixed!!
	if (!caseTeaching || caseTeaching === "undefined") {
		throw {
			message: "Missing case teaching.",
		};
	} else {
		// Parse the caseExplanation to check for text in the blocks
		let teachingParsed;
		try {
			teachingParsed = JSON.parse(caseExplanation);
		} catch (error) {
			throw { message: "Missing case study teaching." };
		}

		// Adjusted logic to ensure accurate validation of non-empty text in blocks
		const hasTextInTeachingBlocks = teachingParsed.blocks.some((block) => {
			return block.text.trim().length > 0;
		});

		if (!hasTextInTeachingBlocks) {
			throw { message: "Missing case teaching" };
		}
	}

	if (!caseDeadline) {
		throw { message: "Missing case deadline" };
	}
};

export const publishCase = async (event) => {
	const decodedToken = decodeToken(event);
	const username = decodedToken.username;
	const userInfo = await getUserInfo(username);
	const { id: teacherId } = userInfo;

	if (!userInfo || userInfo.user_role !== "teacher") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Not authorized to use this resource",
				message: "Error publishing case case.",
			}),
		};
	}

	const {
		caseId,
		caseDescription,
		caseTopic,
		caseExplanation,
		caseDeadline,
		caseQuestions,
		caseMaterials,
		caseTeaching,
	} = await extrapolateRequestBody(event);

	try {
		validateInputs({
			caseDescription,
			caseTopic,
			caseExplanation,
			caseDeadline,
			caseQuestions,
			caseTeaching,
		});
	} catch (error) {
		console.error("Error publishing case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error publishing case: ${error.message}`,
				message: error.message,
			}),
		};
	}

	try {
		// Step 1: Check if the teacher already has an active published case
		const activeCase = await dbClient.send(
			new QueryCommand({
				TableName: Resource.TeacherCaseStudies.name,
				IndexName: "TeacherStatusIndex",
				KeyConditionExpression:
					"teacherId = :teacherId AND caseStatus = :caseStatus",
				ExpressionAttributeValues: {
					":teacherId": teacherId,
					":caseStatus": "published",
				},
			})
		);

		// If there is already a published case, block the action
		if (activeCase.Items && activeCase.Items.length > 0) {
			console.log(`Teacher ${teacherId} already has an active published case.`);
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Error publishing case",
					message:
						"You already have an active published case. Please archive or wait for it to expire before publishing another case.",
				}),
			};
		}
	} catch (error) {
		console.error("Error checking for published case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error checking for published case: ${error.message}`,
				message: "Error checking for published case.",
			}),
		};
	}

	try {
		const newCaseId = caseId || uuidv4();
		const todaysDate = new Date().toISOString();
		let updateExpression = `
		SET caseStatus = :caseStatus,
		    caseDeadline = :caseDeadline,
		    caseDescription = :caseDescription,
		    caseTopic = :caseTopic,
		    caseExplanation = :caseExplanation,
        caseTeaching = :caseTeaching,
		    caseQuestions = :caseQuestions,
        publishedDate = :publishedDate,
        createdAt = :createdAt,
        teacherId = :teacherId
    `;

		const expressionAttributeValues = {
			":caseStatus": "published",
			":publishedDate": todaysDate,
			":caseDeadline": new Date(caseDeadline).toISOString(),
			":caseDescription": caseDescription,
			":caseTopic": caseTopic,
			":caseExplanation": caseExplanation,
			":caseTeaching": caseTeaching,
			":caseQuestions": caseQuestions,
			":createdAt": todaysDate,
			":teacherId": teacherId,
		};

		// Conditionally add the caseMaterials field if it exists
		if (caseMaterials) {
			updateExpression += ", caseMaterials = :caseMaterials";
			expressionAttributeValues[":caseMaterials"] = caseMaterials;
		}

		const updateParams = new UpdateCommand({
			TableName: Resource.TeacherCaseStudies.name,
			Key: { id: newCaseId },
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ReturnValues: "ALL_NEW",
		});

		const updatedCase = await dbClient.send(updateParams);
		console.log(
			`Case ${newCaseId} successfully published for teacher ${teacherId}`
		);
		await applicationContext
			.getUseCaseHelpers()
			.sendNewCaseNotificationEmailToRegisteredStudents();
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Case published successfully.",
				case: updatedCase.Attributes,
			}),
		};
	} catch (error) {
		// Log error
		console.error("Error publishing case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error publishing case: ${error.message}`,
				message: `Error publishing new case`,
			}),
		};
	}
};

export const getPublishedCase = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);

		if (
			!userInfo ||
			!(userInfo.user_role === "teacher" || userInfo.user_role === "student")
		) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Not authorized to view this resource",
					message: "Error getting published case",
				}),
			};
		}

		if (!userInfo.id) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Invalid input: missing required fields",
					message: "Error getting published case",
				}),
			};
		}

		const params = {
			TableName: Resource.TeacherCaseStudies.name,
			IndexName: "TeacherStatusIndex",
			KeyConditionExpression:
				"teacherId = :teacherId AND caseStatus = :caseStatus",
			ExpressionAttributeValues: {
				":teacherId": userInfo.id,
				":caseStatus": "published",
			},
		};

		// If the user is a student, adjust the query to use their teacher's ID
		if (userInfo.user_role === "student") {
			params.ExpressionAttributeValues[":teacherId"] = userInfo.teacherId;
		}

		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		const activeCaseResult = result.Items[0];

		// If no active cases found, return a message
		if (!activeCaseResult) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "There are no ongoing cases at the moment.",
				}),
			};
		}

		// Prepare case info to be sent
		const caseInfo = {
			id: activeCaseResult.id,
			caseTopic: activeCaseResult.caseTopic,
			createdAt: activeCaseResult.createdAt,
			caseDeadline: activeCaseResult.caseDeadline,
			caseStatus: activeCaseResult.caseStatus,
		};

		// Teacher flow - unchanged
		if (userInfo.user_role === "teacher") {
			const countOfStudentsFeedbackAndResponses =
				await getDetailsOfStudentsFeedbackAndResponses(activeCaseResult.id);

			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Ongoing case retrieved successfully!",
					caseInfo: {
						...caseInfo,
						feedbackCount: countOfStudentsFeedbackAndResponses.feedbackCount,
						totalResponses: countOfStudentsFeedbackAndResponses.totalResponses,
					},
				}),
			};
		}

		// Student flow: Check if the student has responded to the active case
		if (userInfo.user_role === "student") {
			const answerParams = {
				TableName: Resource.StudentsResponses.name,
				IndexName: "StudentIDIndex", // Using the index to query answers by studentID
				KeyConditionExpression: "studentID = :studentID",
				ExpressionAttributeValues: {
					":studentID": userInfo.id,
				},
				FilterExpression: "caseID = :caseID", // Filter results by caseID
				ExpressionAttributeValues: {
					":studentID": userInfo.id,
					":caseID": activeCaseResult.id,
				},
			};

			// Query the Answers table to check for existing responses
			const answerCommand = new QueryCommand(answerParams);
			const answerResult = await dbClient.send(answerCommand);

			// If the student hasn't responded to the case, return the active case
			if (answerResult.Items.length === 0) {
				return {
					statusCode: 200,
					body: JSON.stringify({
						message: "You have not responded to this case yet.",
						caseInfo,
					}),
				};
			}

			// If the student has already responded, return a different message
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "You have already responded to this case.",
				}),
			};
		}
	} catch (error) {
		console.error("Error retrieving published case:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error retrieving published case: ${error.message}`,
				message: `Error retrieving published case.`,
			}),
		};
	}
};
