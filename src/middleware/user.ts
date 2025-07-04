import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyOptions } from "jsonwebtoken";
import * as dotenv from "dotenv";
import { promisify } from "util";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import { httpStatusCodes } from "../utility/statusCodes";
import { ITokenData } from "../utility/types/auth.types";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: ITokenData;
      expiredToken?: {
        accessToken: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Normal token validation
    // 1. Extract and Validate Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HTTPError("Invalid authorization header format.", 401);
    }

    const parsedToken = authHeader.split(" ")[1];
    if (!parsedToken) {
      throw new HTTPError("No Token provided.", 401);
    }

    // Promisify jwt.verify with an options object for compatibility
    const verifyToken = promisify(jwt.verify) as (
      token: string,
      secretOrPublicKey: string,
      options?: VerifyOptions
    ) => Promise<JwtPayload>;

    let decoded: JwtPayload;

    try {
      // Attempt to verify the token
      decoded = await verifyToken(
        parsedToken,
        process.env.ACCESS_TOKEN_SECRET as string
      );
    } catch (err) {
      throw new HTTPError(
        "Session expired. Refresh token using /auth/refresh-token",
        498
      );
    }
    if (!decoded) throw new HTTPError("Could not verify token.", 401);

    req.user = decoded;

    next();
  } catch (err) {
    console.log("Middleware Error->", err);
    console.log("Error=>", err);
    if (err instanceof HTTPError) {
      const errorData = err.details || err.message;
      res
        .status(httpStatusCodes[err.code].code)
        .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
    } else {
      res
        .status(httpStatusCodes[500].code)
        .json(
          Helpers.formResponse(
            httpStatusCodes[500].code,
            "Internal server error"
          )
        );
    }
  }
};
