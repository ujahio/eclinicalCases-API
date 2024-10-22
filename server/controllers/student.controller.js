import dbClient from "../services/dbClient.js";
import { v4 as uuidv4 } from "uuid";
import {
	QueryCommand,
	ScanCommand,
	GetCommand,
	PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { TABLES } from "../services/dbTables.js";
// import { uploadFileToBucket } from "../services/bucket.js";
import SECRETS from "../services/secrets.js";
import { generateCertificate } from "../utils/certificate.js";
import { extrapolateRequestBody, verifyToken } from "../utils/api_utils.js";

export const getStudentsResponses = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const caseFilter = event.pathParameters?.caseFilter;

	if (!userInfo || userInfo.user_role !== "student") {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Not authorized to view this resource",
			}),
		};
	}

	const { id: studentID } = userInfo;

	const params = {
		TableName: TABLES.STUDENT_RESPONSES,
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

	try {
		const command = new QueryCommand(params);
		const result = await dbClient.send(command);

		if (result.Items.length === 0) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: "No responses found for this student.",
				}),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Responses retrieved successfully.",
				data: result.Items,
			}),
		};
	} catch (error) {
		console.error("Error fetching recent responses: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not fetch responses: ${error.message}`,
			}),
		};
	}
};

export const submitStudentResponse = async (event) => {
	const caseInfo = await extrapolateRequestBody(event);
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	const { firstname, lastname, id: studentID } = userInfo;
	const fullName = `${firstname} ${lastname}`;

	const params = {
		TableName: TABLES.STUDENT_RESPONSES,
		Item: {
			answerID: uuidv4(),
			studentID,
			caseID: caseInfo.id,
			caseTopicAnswer: caseInfo.studentCaseTopicResponse,
			caseExplanation: caseInfo.studentCaseExplanation,
			submittedAt: Date.now(),
		},
	};

	try {
		// 	Call grading function and get the result
		const gradedQuizResult = await gradeQuiz({
			caseID: caseInfo.id,
			studentAnswers: extractAnswers(caseInfo),
		});

		if (gradedQuizResult.passed) {
			const command = new PutCommand(params);
			await dbClient.send(command);
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

const gradeQuiz = async ({ caseID, studentAnswers }) => {
	const caseParams = {
		TableName: TABLES.TEACHER_CASE_STUDIES,
		Key: { id: caseID },
	};

	try {
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

export const getStudentCertificates = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const { id: studentID } = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	const params = {
		TableName: TABLES.CERTIFICATES,
		IndexName: "StudentIDIndex",
		KeyConditionExpression: "studentID = :studentID",
		ExpressionAttributeValues: {
			":studentID": studentID,
		},
	};

	try {
		const command = new QueryCommand(params);
		const result = await dbClient.send(command);

		if (result.Items.length === 0) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: "No certificates found for this student.",
				}),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Certificates retrieved successfully.",
				data: result.Items,
			}),
		};
	} catch (error) {
		console.error("Error fetching certificates: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not fetch certificates: ${error.message}`,
			}),
		};
	}
};

export const getCertificateByCaseID = async (event) => {
	const caseID = event.pathParameters.caseID;

	const params = {
		TableName: TABLES.CERTIFICATES,
		FilterExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await dbClient.send(command);

		if (result.Items.length === 0) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: "No certificate found for this case.",
				}),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Certificate retrieved successfully.",
				data: result.Items[0],
			}),
		};
	} catch (error) {
		console.error("Error fetching certificate by case ID: ", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not fetch certificate: ${error.message}`,
			}),
		};
	}
};

export const generatePassingCertificate = async (event) => {
	const certificateInfo = await extrapolateRequestBody(event);
	console.log("certificateInfo", certificateInfo);
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const { firstname, lastname, id: studentID } = userInfo;
	const fullName = `${firstname} ${lastname}`;

	// // Upload certificate to S3
	// // Generate certificate
	let pdfURL = "";
	// let pngURL = "";
	const certificateID = uuidv4();
	const { pdfBuffer, certificateKey } = await generateCertificate(
		fullName,
		certificateInfo.caseTopic
	);

	console.log("pdfBuffer", pdfBuffer);
	console.log("certificateKey", certificateKey);

	// TODO: save the certificateKey as part of the students response
	// const params = {
	// 	TableName: TABLES.STUDENT_RESPONSES,
	// 	Item: {
	// 		answerID: uuidv4(),
	// 		studentID,
	// 		caseID: caseInfo.id,
	// 		caseTopicAnswer: caseInfo.studentCaseTopicResponse,
	// 		caseExplanation: caseInfo.studentCaseExplanation,
	// 		submittedAt: Date.now(),
	// 	},
	// };

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: "Certificate generated successfully.",
			// pdfURL,
			// pngURL,
		}),
	};
	// // // Upload PDF to S3
	// const pdfUploadParams = {
	// 	// Bucket: "local-bucket",
	// 	originalName: `certificates/${certificateID}.pdf`,
	// 	buffer: pdfBuffer,
	// 	// ACL: "public-read",
	// 	// ContentType: "application/pdf",
	// };
	// pdfURL = await uploadFileToBucket(pdfUploadParams);
	// // // Upload PNG to S3
	// const pngFile = {
	// 	originalname: `${certificateID}.png`,
	// 	buffer: pngBuffer,
	// };
	// pngURL = await uploadFileToBucket(pngFile);
	// // // Save certificate record in DynamoDB
	// const certificateRecord = {
	// 	certificateID,
	// 	studentID,
	// 	caseID,
	// 	pdfURL,
	// 	pngURL,
	// 	generatedAt: new Date().toISOString(),
	// };
	// const putCommand = new PutCommand({
	// 	TableName: TABLES.CERTIFICATES,
	// 	Item: certificateRecord,
	// });
	// await dbClient.send(putCommand);
};
