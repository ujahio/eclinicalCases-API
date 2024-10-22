import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Resource } from "sst";
import s3Client from "./s3Client";

export const getSignedUrlForFetchingFromS3 = async (documentKey) => {
	const expiresIn = 3600; // URL valid for 1 hour (3600 seconds)

	try {
		const params = {
			Bucket: Resource.CaseMaterials.name,
			Key: documentKey, // Use the documentKey to fetch the correct file
		};

		const command = new GetObjectCommand(params);
		const pdfUrl = await getSignedUrl(s3Client, command, { expiresIn }); // Pre-signed URL valid for 1 hour
		const expiryTimestamp = Date.now() + expiresIn * 1000; // Calculate expiry as current time + expiresIn (milliseconds)

		return { pdfUrl, expiryTimestamp };
	} catch (error) {
		console.error("Error generating pre-signed URL for fetch:", error);
		throw new Error("Failed to generate pre-signed URL for fetch");
	}
};

export const getSignedUrlToUploadToS3 = async () => {
	try {
		const key = crypto.randomUUID();

		const params = {
			Bucket: Resource.CaseMaterials.name,
			Key: key,
			ContentType: "application/pdf",
		};

		const command = new PutObjectCommand(params);
		const pdfUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

		return { pdfUrl, documentKey: key };
	} catch (error) {
		console.error("Error generating pre-signed URL: ", error);
		throw new Error("Failed to generate pre-signed URL");
	}
};

export const deleteCaseMaterialFromS3 = async (fileKey) => {
	try {
		const deleteParams = {
			Bucket: Resource.CaseMaterials.name,
			Key: fileKey,
		};

		const deleteCommand = new DeleteObjectCommand(deleteParams);
		await s3Client.send(deleteCommand);

		console.log("File successfully deleted from S3:", fileKey);
	} catch (error) {
		console.error("Error deleting file from S3:", error);
		throw new Error("Failed to delete file from S3");
	}
};
