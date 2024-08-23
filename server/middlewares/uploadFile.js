import multer from "multer";
import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const bucketName = "local-bucket";
const s3Client = new S3Client({
  endpoint: "http://localhost:4599",
  forcePathStyle: true,
  credentials: {
    accessKeyId: "S3RVER",
    secretAccessKey: "S3RVER",
  },
});

// Ensure the bucket exists before using it
async function ensureBucketExists(bucketName) {
  try {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    console.log("Bucket created successfully");
  } catch (err) {
    if (err.name === "BucketAlreadyOwnedByYou") {
      console.log("Bucket already exists");
    } else {
      // console.log("Error creating bucket:", err);
    }
  }
}

ensureBucketExists(bucketName);

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

export { upload, s3Client };
