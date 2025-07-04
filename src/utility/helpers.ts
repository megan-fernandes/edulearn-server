import { Response } from "express";
import z from "zod";
import { httpStatusCodes } from "./statusCodes";
import fs from "fs";
import utils from "util";
import HTTPError from "./httpError";

export const unlinkFile = utils.promisify(fs.unlink);

export class Helpers {
  static formResponse = (code: number, data: any) => {
    return {
      status_code: code,
      flag: httpStatusCodes[code].flag,
      message: data.message ?? httpStatusCodes[code].message,
      data: data?.success ? data?.data : data,
    };
  };

  fieldErrors = (data: { fieldname: string; message: string }[]) => {
    const fieldErrors: { fieldname: string; message: string }[] = [];

    data.map((err) =>
      fieldErrors.push({
        fieldname: err.fieldname,
        message: err.message,
      })
    );

    return JSON.parse(JSON.stringify(fieldErrors));
  };

  static sendResponse(
    code: number,
    payload: any,
    res: Response,
    message: string = ""
  ): void {
    try {
      const responseData = {
        status_code: code,
        flag: httpStatusCodes[code].flag,
        message: message ?? httpStatusCodes[code].message,
        data: payload,
      };
      res.status(code).send(Object.assign(responseData));
    } catch (err) {
      console.log("Response Error->", err);
    }
  }

  static validateWithZod<T>(schema: z.ZodSchema<T>, inputData: unknown): T {
    if (!schema || typeof schema.safeParse !== "function") {
      throw new Error("Invalid schema provided to validateWithZod");
    }
    const validationResponse = schema.safeParse(inputData);

    if (!validationResponse.success) {
      const errorObj = validationResponse.error.issues.map((issue) => {
        return { fieldname: issue.path[0], message: issue.message };
      });
      console.log("Zod validation failed:", errorObj);

      throw new HTTPError(JSON.parse(JSON.stringify(errorObj)), 400);
    }

    return validationResponse.data;
  }
}

export const UserRoleMapping = Object.freeze({
  admin: "admin",
  instructor: "instructor",
  student: "student",
});
