import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const version = process.env.VERSION || "v1"; // Default to v1 if VERSION is not set
export const baseRoute = `/api/${version}`;
export const port = process.env.PORT ?? 3000;

export const courseBasePath = "/course/:courseId";
export const chapterBasePath = "/chapter/:chapterId";

export enum Role {
  admin,
  instructor,
  student,
}

export enum courseLevels {
  beginner,
  intermediate,
  expert,
  all,
}

export enum lectureType {
  video,
  pdf,
  article,
  url,
}

export const salt = bcrypt.genSaltSync(10);

export const refreshTokenExpiry = "30d";

export const accessTokenExpiry = "1h";

export const resetPasswordLinkExp = Date.now() + 3600000; //now + 1h(3600000 ms)

export const image_max_file_size: number = 2 * 1024 * 1024; //2 MB

export const max_file_size: number = 10 * 1024 * 1024; //10 MB

export const validFileFormat: string[] = [
  "pdf",
  "odt",
  "docx",
  "pptx",
  "odp",
  "png",
  "jpeg",
  "jpg",
  "mp4",
  "mov",
  "avi",
  "webm",
  "hevc",
];

export const validImageFormat: Array<string> = [
  "png",
  "jpeg",
  "jpg",
  "heif",
  "heic",
  "raw",
  "svg+xml",
  "svg",
  "webp",
];

export const bucketUrl = process.env.BUCKET_URL as string;

//CORS config
export const allowedOrigins: string[] = [
  `http://localhost:3000`,
  `http://localhost:5173`,
  `http://172.30.232.130:3000`,
  `http://192.168.127.180:3000`,
  "https://api.stripe.com",
  "https://d537cc23bf71.ngrok-free.app",
];

//endpoint secrets stripe

export const paymentSuccessKey = process.env
  .PAYMENT_SUCCESS_WEBHOOK_SECRET as string;

// export const RABBIT_URL = `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`;
