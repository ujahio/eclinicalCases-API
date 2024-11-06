import { Resource } from "sst";
import {
	deleteCaseMaterialFromS3,
	getSignedUrlForFetchingFromS3,
	getSignedUrlToUploadToS3,
} from "../services/bucket.js";
import { extrapolateRequestBody } from "../utils/api_utils.js";
import getUserInfo from "../persistence.helpers/getUserInfo.js";
import decodeToken from "../utils/decodeToken.js";

export const getSignedUrlsToFetchForCaseMaterials = async (event) => {
	const decodedToken = decodeToken(event);
	const username = decodedToken.username;
	const userInfo = await getUserInfo(username);

	if (!userInfo || !userInfo.id) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: "Unauthorized" }),
		};
	}

	try {
		const { documentKeys } = await extrapolateRequestBody(event);

		// Validate input: Ensure both documentKeys and fileNames are arrays and have matching lengths
		if (!Array.isArray(documentKeys) || documentKeys.length === 0) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Invalid input: No document keys provided",
					message: "Error fetching files.",
				}),
			};
		}

		// Generate pre-signed URLs for each documentKey and attach the corresponding file name
		const signedUrls = await Promise.all(
			documentKeys.map(async (documentKey) => {
				const { pdfUrl, expiryTimestamp } = await getSignedUrlForFetchingFromS3(
					documentKey
				);
				return { documentKey, pdfUrl, expiryTimestamp }; // Include both documentKey, signed URL, and fileName
			})
		);

		return {
			statusCode: 200,
			body: JSON.stringify({
				signedUrls,
				message: "Pre-signed URLs for downloading generated successfully!",
			}),
		};
	} catch (error) {
		console.error("Error fetching files:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error fetching files: ${error.message}`,
				message: "Error fetching files.",
			}),
		};
	}
};

export const getSignedUrlToUploadForCaseMaterials = async () => {
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
				error: `Error uploading file: ${error.message}`,
				message: "Error uploading file.",
			}),
		};
	}
};

export const deleteCaseMaterial = async (event) => {
	const { fileKey } = await extrapolateRequestBody(event);
	if (!fileKey) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Error deleting file.",
				error: "Missing required parameters: fileKey",
			}),
		};
	}
	try {
		await deleteCaseMaterialFromS3(fileKey);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `File with key ${fileKey} deleted successfully.`,
			}),
		};
	} catch (error) {
		console.error(`Error deleting file with key ${fileKey} from S3:`, error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error deleting file with key ${fileKey} from S3: ${error.message}`,
				message: "Error deleting case material.",
			}),
		};
	}
};
