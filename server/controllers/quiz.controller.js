import dbClient from "../services/dbClient.js";
import { v4 as uuidv4 } from "uuid";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { generateCertificate } from "../utils/certificate.js";
// import { s3Client } from "../middlewares/uploadFile.js";
import { TABLES } from "../services/dbTables.js";
import SECRETS from "../services/secrets.js";
import { extrapolateFormData } from "../utils/api_utils.js";
import { verifyToken } from "../controllers/case.controller.js";

const submitCaseAnswers = async (event) => {
	const caseInfo = await extrapolateFormData(event);
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	const { firstname, lastname, id: studentID } = userInfo;
	const fullName = `${firstname} ${lastname}`;

	const params = {
		TableName: TABLES.ANSWER,
		Item: {
			answerID: uuidv4(),
			studentID,
			caseID: caseInfo.caseID,
			answers: extractAnswers(caseInfo),
			caseTopicAnswer: caseInfo.caseTopicAnswer,
			caseExplanation: caseInfo.caseExplanation,
			submittedAt: Date.now(),
		},
	};

	try {
		// 	const command = new PutCommand(params);
		// 	await dbClient.send(command);
		// 	Call grading function and get the result
		const gradedQuizResult = await gradeQuiz({
			caseID: caseInfo.caseID,
			studentAnswers: extractAnswers(caseInfo),
		});

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Answers submitted successfully.",
				passed: gradedQuizResult.passed,
				messageToDisplay: gradedQuizResult.messageToDisplay,
			}),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not submit answers: ${error.message}`,
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

const getStudentsAnswers = async (event) => {
	const caseID = event.pathParameters.caseID;

	const params = {
		TableName: TABLES.ANSWER,
		IndexName: "CaseIDIndex",
		KeyConditionExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
	};

	try {
		const command = new QueryCommand(params);
		const result = await dbClient.send(command);

		return {
			statusCode: 200,
			body: JSON.stringify({ answers: result.Items }),
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

const gradeQuiz = async ({ caseID, studentAnswers }) => {
	const caseParams = {
		TableName: TABLES.CASE,
		Key: { id: caseID },
	};

	try {
		const caseCommand = new GetCommand(caseParams);
		const caseResult = await dbClient.send(caseCommand);
		const teachersQuestions = caseResult?.Item?.caseQuestions;

		if (!teachersQuestions) {
			throw new Error(`caseQuestions are not found`);
		}

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
				parseInt(studentAnswer.correctAnswer) !== teacherQuestion.correctAnswer
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
			result.messageToDisplay = `You scored ${scorePercentage}%. You got all questions correct.`;
		}

		return result;
	} catch (error) {
		console.error("Error grading quiz: ", error);
		throw new Error("Could not grade quiz: " + error.message);
	}
};

export { submitCaseAnswers, getStudentsAnswers };
