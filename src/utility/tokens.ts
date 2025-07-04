import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { catchError } from "./catchBlock";
import { accessTokenExpiry, refreshTokenExpiry } from "../constants";
import { ITokenData } from "./types/auth.types";
dotenv.config();

export const generateAccessToken = (userData: ITokenData) => {
  try {
    const accessToken = jwt.sign(
      userData,
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: accessTokenExpiry,
        // expiresIn:"1h"
      }
    );
    return accessToken;
  } catch (error: unknown) {
    catchError(error);
  }
};

export const generateRefreshToken = (userData: ITokenData) => {
  try {
    const refreshToken = jwt.sign(
      userData,
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: refreshTokenExpiry,
        // expiresIn:"30d"
      }
    );
    return refreshToken;
  } catch (error: unknown) {
    catchError(error);
  }
};
