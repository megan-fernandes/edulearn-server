import { s3 } from "../../../config/awsConfig";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const uploadFile = async (file: Express.Multer.File, folder: string) => {
  try {
    const fileStream = fs.createReadStream(file.path);

    const key = file.filename;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_DEV,
      Body: fileStream,
      Key: `${folder}/${key}`,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    return {
      success: true,
      key,
    };
  } catch (err) {
    return { error: err };
  }
};

export const uploadImageBase64 = async (imageName: string, folder: string) => {
  let response: any = null;

  //add new profile
  const base64Data = Buffer.from(
    imageName.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  let type = imageName.split(";")[0].split("/")[1];
  switch (type) {
    case "svg+xml": {
      type = "svg";
      break;
    }
    default:
      type = imageName.split(";")[0].split("/")[1];
  }
  const key = `${Date.now()}_${uuidv4()}.${type}`; //datenow is used to prevent overriding of file

  const params = {
    Bucket: `${process.env.AWS_BUCKET_DEV}`,
    Key: `${folder}/${key}`,
    Body: response ? response.res : base64Data,
    ContentEncoding: "base64",
    ContentType: `image/${type}`,
    CacheControl: "no-cache",
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return {
    success: true,
    key,
  };
};
