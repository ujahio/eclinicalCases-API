import {
	deleteCaseMaterialFromS3,
	getSignedUrlForFetchingFromS3,
	getSignedUrlToUploadToS3,
} from "../services/bucket.js";
import { extrapolateRequestBody, verifyToken } from "../utils/api_utils.js";
import SECRETS from "../services/secrets.js";

export const getSignedUrlsToFetchForCaseMaterials = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);

	if (!userInfo || !userInfo.id) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: "Unauthorized" }),
		};
	}

	try {
		// Extract the documentKeys from the request body
		const { documentKeys } = await extrapolateRequestBody(event);

		// Validate input: Ensure it's an array of documentKeys
		if (!Array.isArray(documentKeys) || documentKeys.length === 0) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "documentKeys must be a non-empty array",
				}),
			};
		}

		// Generate pre-signed URLs for each documentKey
		const signedUrls = await Promise.all(
			documentKeys.map(async (documentKey) => {
				const { pdfUrl } = await getSignedUrlForFetchingFromS3(documentKey);
				return { documentKey, pdfUrl }; // Return both the documentKey and its signed URL
			})
		);

		// Return the array of signed URLs
		return {
			statusCode: 200,
			body: JSON.stringify({
				signedUrls, // An array of { documentKey, pdfUrl } for each document
				message: "Pre-signed URLs for downloading generated successfully!",
			}),
		};
	} catch (error) {
		console.error("Error fetching files:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Could not fetch files: " + error.message,
			}),
		};
	}
};

export const getSignedUrlToUploadForCaseMaterials = async (event) => {
	const userToken = event.headers.authorization.split(" ")[1];
	const userInfo = verifyToken(userToken, SECRETS.NEXT_JWT_SECRET);
	const { id: teacherID } = userInfo;

	if (!userInfo || !teacherID) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: "Unauthorized" }),
		};
	}

	try {
		const { pdfUrl, documentKey } = await getSignedUrlToUploadToS3();

		return {
			statusCode: 200,
			body: JSON.stringify({
				pdfUrl,
				documentKey,
				message: "PDF uploaded successfully!",
			}),
		};
	} catch (error) {
		console.error("Error uploading file:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Could not upload file: " + error.message,
			}),
		};
	}
};

export const deleteCaseMaterial = async (event) => {
	const { fileKey } = await extrapolateRequestBody(event);
	try {
		if (!fileKey) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Missing required parameters: fileKey",
				}),
			};
		}

		await deleteCaseMaterialFromS3(fileKey);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `File with key ${fileKey} deleted successfully.`,
			}),
		};
	} catch (error) {
		console.error("Error deleting file from S3:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Error deleting file from S3",
				error: error.message,
			}),
		};
	}
};
