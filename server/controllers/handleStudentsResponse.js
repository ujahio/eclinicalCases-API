import { v4 as uuidv4 } from "uuid";
import { QueryCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";
import { Resource } from "sst";
// import { uploadFileToBucket } from "../services/bucket.js";
import { generateCertificate } from "../utils/certificate.js";
import { extrapolateRequestBody } from "../utils/api_utils.js";
import getUserInfo from "../persistence/getUserInfo.js";
import decodeToken from "../utils/decodeToken.js";

export const getStudentsResponses = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);

		if (!userInfo || userInfo.user_role !== "student") {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Not authorized to view this resource",
					message: "Error getting students responses.",
				}),
			};
		}

		const caseFilter = event.pathParameters?.caseFilter;
		const { id: studentID } = userInfo;

		const params = {
			TableName: Resource.StudentsResponses.name,
			IndexName: "StudentIDIndex",
			KeyConditionExpression: "studentID = :studentID",
			ExpressionAttributeValues: {
				":studentID": studentID,
			},
			ScanIndexForward: false, // Sort in descending order (latest first)
		};

		if (caseFilter && caseFilter === "recent") {
			params.Limit = 3;
		}
		const command = new QueryCommand(params);
		const result = await dbClient.send(command);

		const responseItems = result.Items.map((item) => {
			return {
				answerID: item.answerID,
				certificateID: item.certificateID,
				submittedAt: item.submittedAt,
				caseTopic: item.caseTopic,
			};
		});

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Responses retrieved successfully.",
				data: responseItems,
			}),
		};
	} catch (error) {
		console.error("Error fetching recent responses: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error fetching recent responses: ${error.message}`,
				message: `Error fetching certificates.`,
			}),
		};
	}
};

export const submitStudentResponse = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);
		const caseInfo = await extrapolateRequestBody(event);

		const { firstName, lastName, id: studentID } = userInfo;
		const fullName = `${firstName} ${lastName}`;
		// 	Call grading function and get the result
		const gradedQuizResult = await gradeQuiz({
			caseID: caseInfo.id,
			studentAnswers: extractAnswers(caseInfo),
		});

		if (gradedQuizResult.passed) {
			// generate certificate
			const dateTimeStamp = new Date();
			const submittedAt = dateTimeStamp.toISOString();
			const { certificateID, certificateUrl, certificateBase64 } =
				await generateCertificate(fullName, caseInfo.caseTopic, dateTimeStamp);

			const params = {
				TableName: Resource.StudentsResponses.name,
				Item: {
					answerID: uuidv4(),
					studentID,
					certificateID,
					caseID: caseInfo.id,
					caseExplanation: caseInfo.studentCaseExplanation,
					submittedAt,
					caseTopic: caseInfo.caseTopic,
				},
			};

			const command = new PutCommand(params);
			await dbClient.send(command);

			return {
				statusCode: 200,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: "Answers submitted successfully.",
					passed: gradedQuizResult.passed,
					messageToDisplay: gradedQuizResult.messageToDisplay,
					certificateID,
					certificateUrl,
					certificateFile: `data:application/pdf;base64,${certificateBase64}`,
				}),
			};
		}
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Answers submitted successfully.",
				passed: gradedQuizResult.passed,
				messageToDisplay: gradedQuizResult.messageToDisplay,
			}),
		};
	} catch (error) {
		console.error("Error submitting students responses", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error submitting students responses: ${error.message}`,
				message: `Error submitting students responses.`,
			}),
		};
	}
};

const extractAnswers = (caseInfo) => {
	return Object.keys(caseInfo).reduce((acc, key) => {
		const match = key.match(/^answers\[(\d+)\]\[(\w+)\](?:\[(\d+)\])?$/);
		if (match) {
			const [, index, field, subIndex] = match;
			if (!acc[index]) {
				acc[index] = { options: [] };
			}
			if (field === "options" && subIndex !== undefined) {
				acc[index].options[subIndex] = caseInfo[key];
			} else {
				acc[index][field] = caseInfo[key];
			}
		}
		return acc;
	}, []);
};

const gradeQuiz = async ({ caseID, studentAnswers }) => {
	try {
		const caseParams = {
			TableName: Resource.TeacherCaseStudies.name,
			Key: { id: caseID },
		};
		const caseCommand = new GetCommand(caseParams);
		const caseResult = await dbClient.send(caseCommand);
		let teachersQuestions = caseResult?.Item?.caseQuestions;

		// Parse teachersQuestions string into an object if it's a JSON string
		if (typeof teachersQuestions === "string") {
			teachersQuestions = JSON.parse(teachersQuestions);
		}

		return gradeAnswers({ studentAnswers, teachersQuestions });
	} catch (error) {
		console.error("Error grading quiz: ", error);
		throw new Error("Could not grade quiz: " + error.message);
	}
};

const gradeAnswers = ({ studentAnswers, teachersQuestions }) => {
	let result = {
		passed: true,
		failedQuestions: [],
		messageToDisplay: "",
	};

	let correctCount = 0;

	studentAnswers.forEach((studentAnswer, index) => {
		const teacherQuestion = teachersQuestions[index];

		// Compare the student's selected answer with the teacher's correct answer
		if (
			parseInt(studentAnswer.studentAnswer) !== teacherQuestion.correctAnswer
		) {
			result.passed = false;
			result.failedQuestions.push(index + 1); // Adding question index (1-based)
		} else {
			correctCount++;
		}
	});

	// Calculate the percentage score
	const totalQuestions = studentAnswers.length;
	const scorePercentage = (correctCount / totalQuestions) * 100;

	// Generate the messageToDisplay for score and incorrect questions
	if (result.failedQuestions.length > 0) {
		result.messageToDisplay = `You scored ${scorePercentage}%. You got question(s) ${result.failedQuestions.join(
			" and "
		)} incorrect.`;
	} else {
		result.messageToDisplay = `Congrats, You scored ${scorePercentage}%.`;
	}

	return result;
};
