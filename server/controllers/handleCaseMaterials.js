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
		// Extract the documentKeys and fileNames from the request body
		const { documentKeys, fileNames } = await extrapolateRequestBody(event);
		console.log({ documentKeys, fileNames });

		// Validate input: Ensure both documentKeys and fileNames are arrays and have matching lengths
		if (
			!Array.isArray(documentKeys) ||
			!Array.isArray(fileNames) ||
			documentKeys.length === 0 ||
			documentKeys.length !== fileNames.length
		) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error:
						"Invalid input: documentKeys and fileNames must be non-empty arrays of equal length",
				}),
			};
		}

		// Generate pre-signed URLs for each documentKey and attach the corresponding file name
		const signedUrls = await Promise.all(
			documentKeys.map(async (documentKey, index) => {
				const { pdfUrl } = await getSignedUrlForFetchingFromS3(documentKey);
				const fileName = fileNames[index]; // Get the corresponding file name
				return { documentKey, pdfUrl, fileName }; // Include both documentKey, signed URL, and fileName
			})
		);

		// Return the array of signed URLs and file names
		return {
			statusCode: 200,
			body: JSON.stringify({
				signedUrls, // An array of { documentKey, pdfUrl, fileName } for each document
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
