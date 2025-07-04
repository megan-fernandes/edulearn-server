import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const region = process.env.AWS_REGION_DEV as string;
const accessKey = process.env.AWS_ACCESS_KEY_DEV as string;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY_DEV as string;

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});