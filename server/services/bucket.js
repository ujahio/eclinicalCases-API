import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const uploadFileToBucket = async (file) => {
  const params = {
    Bucket: Resource.MyBucket.name,
    Key: file.originalname,
    Body: file.buffer,
  };
  const command = new PutObjectCommand(params);
  const s3Client = new S3Client({ region: "us-east-1" });
  const signedUrl = await getSignedUrl(s3Client, command);
  console.log("signedUrl: ", signedUrl);
  return signedUrl;
};

export default uploadFileToBucket;
