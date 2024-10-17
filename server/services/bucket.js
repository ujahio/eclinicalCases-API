import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Resource } from "sst";

export const getSignedUrlForFetchingFromS3 = async (
	documentKey,
	region = "us-east-1"
) => {
	try {
		const s3Client = new S3Client({ region });

		const params = {
			Bucket: Resource.CaseMaterials.name,
			Key: documentKey, // Use the documentKey to fetch the correct file
		};

		console.log("params", params);

		const command = new GetObjectCommand(params);
		const pdfUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Pre-signed URL valid for 1 hour

		return { pdfUrl };
	} catch (error) {
		console.error("Error generating pre-signed URL for fetch:", error);
		throw new Error("Failed to generate pre-signed URL for fetch");
	}
};

export const getSignedUrlToUploadToS3 = async (region = "us-east-1") => {
	try {
		const s3Client = new S3Client({ region });

		const key = crypto.randomUUID();

		const params = {
			Bucket: Resource.CaseMaterials.name,
			Key: key,
			ContentType: "application/pdf",
		};

		console.log("params", params);

		const command = new PutObjectCommand(params);
		const pdfUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

		return { pdfUrl, documentKey: key };
	} catch (error) {
		console.error("Error generating pre-signed URL: ", error);
		throw new Error("Failed to generate pre-signed URL");
	}
};

export const deleteCaseMaterialFromS3 = async (
	fileKey,
	region = "us-east-1"
) => {
	try {
		const s3Client = new S3Client({ region });
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
