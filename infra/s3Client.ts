import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.NEXT_PUBLIC_REGION });

export default s3Client;
