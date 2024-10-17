import dbClient from "../services/dbClient.js";
import { v4 as uuidv4 } from "uuid";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { TABLES } from "../services/dbTables.js";
// import { uploadFileToBucket } from "../services/bucket.js";
import SECRETS from "../services/secrets.js";
import { generateCertificate } from "../utils/certificate.js";
import { extrapolateRequestBody, verifyToken } from "../utils/api_utils.js";

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

// export const generatePassingCertificate = async (event) => {
// 	const certificateInfo = await extrapolateRequestBody(event);
// 	console.log("certificateInfo", certificateInfo);
// 	const userToken = event.headers.authorization.split(" ")[1];
// 	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
// 	const { firstname, lastname, id: studentID } = userInfo;
// 	const fullName = `${firstname} ${lastname}`;

// 	// // Upload certificate to S3
// 	// // Generate certificate
// 	let pdfURL = "";
// 	let pngURL = "";
// 	const certificateID = uuidv4();
// 	const { pdfBuffer, pngBuffer } = await generateCertificate(
// 		fullName,
// 		certificateInfo.caseTopic
// 	);
// 	// // Upload PDF to S3
// 	const pdfUploadParams = {
// 		// Bucket: "local-bucket",
// 		originalName: `certificates/${certificateID}.pdf`,
// 		buffer: pdfBuffer,
// 		// ACL: "public-read",
// 		// ContentType: "application/pdf",
// 	};
// 	pdfURL = await uploadFileToBucket(pdfUploadParams);
// 	// // Upload PNG to S3
// 	const pngFile = {
// 		originalname: `${certificateID}.png`,
// 		buffer: pngBuffer,
// 	};
// 	pngURL = await uploadFileToBucket(pngFile);
// 	// // Save certificate record in DynamoDB
// 	const certificateRecord = {
// 		certificateID,
// 		studentID,
// 		caseID,
// 		pdfURL,
// 		pngURL,
// 		generatedAt: new Date().toISOString(),
// 	};
// 	const putCommand = new PutCommand({
// 		TableName: TABLES.CERTIFICATES,
// 		Item: certificateRecord,
// 	});
// 	await dbClient.send(putCommand);

// 	return {
// 		statusCode: 200,
// 		body: JSON.stringify({
// 			message: "Certificate generated successfully.",
// 			pdfURL,
// 			pngURL,
// 		}),
// 	};
// };

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
