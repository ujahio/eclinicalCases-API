import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

import SECRETS from "../services/secrets.js";
import { TABLES } from "../services/dbTables.js";
import dbClient from "../services/dbClient.js";
import { verifyToken } from "../utils/api_utils.js";
import s3Client from "../services/s3Client.js";

// Helper function to convert a stream to base64
const streamToBase64 = async (stream) => {
	return new Promise((resolve, reject) => {
		const chunks = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("error", (err) => reject(err));
		stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
	});
};

export const getStudentCertificates = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const { id: studentID } = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	const params = {
		TableName: TABLES.STUDENT_RESPONSES,
		IndexName: "StudentIDIndex",
		KeyConditionExpression: "studentID = :studentID",
		ExpressionAttributeValues: {
			":studentID": studentID,
		},
	};

	try {
		// Fetch certificates from DynamoDB
		const command = new QueryCommand(params);
		const result = await dbClient.send(command);
		let processedCertificates = [];

		if (result.Items.length > 0) {
			// Process certificates to get signed URLs and base64 data
			processedCertificates = await Promise.all(
				result.Items.map(async ({ certificateID }) => {
					try {
						// Get signed URL from S3
						const signedUrl = await getSignedUrl(
							s3Client,
							new GetObjectCommand({
								Bucket: Resource.ECCSUsersCertificates.name,
								Key: certificateID,
							}),
							{ expiresIn: 3600 } // URL expires in 1 hour
						);

						// Fetch the base64 content of the certificate PDF from S3
						const pdfObject = await s3Client.send(
							new GetObjectCommand({
								Bucket: Resource.ECCSUsersCertificates.name,
								Key: certificateID,
							})
						);

						const base64Pdf = await streamToBase64(pdfObject.Body);

						// Return only the required fields
						return {
							signedUrl, // Include the signed URL
							base64Pdf: `data:application/pdf;base64,${base64Pdf}`, // Include the base64 content of the PDF
							certificateID,
						};
					} catch (error) {
						console.error(
							`Error retrieving certificateID: ${certificateID}: ${error}`
						);
						throw new Error(
							`Error retrieving certificateID: ${certificateID}: ${error}`
						);
					}
				})
			);
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Certificates retrieved successfully.",
				processedCertificates,
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
