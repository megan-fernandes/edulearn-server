import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../../config/awsConfig";
import dotenv from "dotenv";
dotenv.config();

export const deleteFile = async (filePath: string) => {
  const deleteParams = {
    Bucket: `${process.env.AWS_BUCKET_DEV}`,
    Key: `${filePath}`,
  };
  const command = new DeleteObjectCommand(deleteParams);
  await s3.send(command);

  return true;
};
