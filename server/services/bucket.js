import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Resource } from "sst";

// const uploadFileToBucket = async (file) => {
//   const params = {
//     Bucket: Resource.MyBucket.name,
//     Key: file.originalname,
//     Body: file.buffer,
//   };
//   const command = new PutObjectCommand(params);
//   const s3Client = new S3Client({ region: "us-east-1" });
//   const signedUrl = await getSignedUrl(s3Client, command);
//   console.log("signedUrl: ", signedUrl);
//   return signedUrl;
// };

// export default uploadFileToBucket;

export const getSignedUrlFromS3 = async (pdfInfo, region = "us-east-1") => {
	console.log("pdfInfo", pdfInfo);
	try {
		// Create the S3 client
		const s3Client = new S3Client({ region });

		const { pdfFile: pdfRawFile, bucketName } = pdfInfo;

		// Define the S3 PutObjectCommand parameters
		const params = {
			Bucket: Resource[bucketName].name,

			// Key: fileContent.name,
			Key: crypto.randomUUID(),
			Body: Buffer.from(pdfRawFile, "base64"),
			ContentType: pdfInfo.type || "application/pdf", // Optional: Set the content type
		};

		console.log("params", params);

		// Create the PutObjectCommand
		const command = new PutObjectCommand(params);

		// Generate a pre-signed URL valid for 1 hour
		const signedUrl = await getSignedUrl(s3Client, command);

		console.log("Pre-signed URL generated: ", signedUrl);
		return signedUrl;
	} catch (error) {
		console.error("Error generating pre-signed URL: ", error);
		throw new Error("Failed to generate pre-signed URL");
	}
};

export const deleteFileFromS3 = async (
	fileKey,
	bucketName = "your-s3-bucket-name",
	region = "us-east-1"
) => {
	try {
		const s3Client = new S3Client({ region });
		const deleteParams = {
			Bucket: bucketName,
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
