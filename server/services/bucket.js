import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Resource } from "sst";

export const getSignedUrlFromS3 = async (region = "us-east-1") => {
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
		const pdfUrl = await getSignedUrl(s3Client, command);

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
