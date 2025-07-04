import { resetPasswordLinkExp, Role, salt } from "../constants";
import { User } from "../models/user";
import { catchError } from "../utility/catchBlock";
import { UserRoleMapping } from "../utility/helpers";
import HTTPError from "../utility/httpError";
import { generateAccessToken, generateRefreshToken } from "../utility/tokens";
import {
  IGoogleUserData,
  ILoginUser,
  IRegisterUser,
  IResetPassword,
  ITokenData,
} from "../utility/types/auth.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { resetPassword } from "../utility/templates/resetPassword";
import { emailingService } from "../utility/emailingService";

export class AuthServices {
  public async RegisterNewUser(data: IRegisterUser) {
    try {
      const { fullName, email, password, role } = data;
      //find if email exists already
      const findExistingEmail = await User.exists({ email });
      if (findExistingEmail)
        throw new HTTPError("User with same email already exists", 400);

      //hash password
      const hashedPassword = bcrypt.hashSync(password, salt);

      //add user in database
      const addUser = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role,
      });
      if (!addUser) throw new HTTPError("Could not register user", 400);

      //generate AT and RT
      const tokenData = {
        email,
        fullName,
        role,
        id: addUser._id.toString(),
      };

      const accessToken = generateAccessToken(tokenData);
      const refreshToken = generateRefreshToken(tokenData);

      //save refreshToken
      addUser.refreshToken = refreshToken;
      await addUser.save();

      return {
        success: true,
        data: {
          userData: { ...tokenData },
          refreshToken,
          accessToken,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }
  
  public async LoginUser(data: ILoginUser) {
    try {
      const { email, password, role } = data;
      //find if email exists already
      const findUser = await User.findOne({ email, role });
      if (!findUser)
        throw new HTTPError("User with email and role does not exist", 404);

      if (findUser.googleId) throw new HTTPError("Invalid Credentials", 401);

      //compare password
      const isMatch = await bcrypt.compare(password, findUser.password ?? "");
      if (!isMatch) throw new HTTPError("Invalid Credentials", 401);

      //generate AT and RT
      const tokenData = {
        email,
        fullName: findUser.fullName,
        role,
        id: findUser._id.toString(),
      };

      const accessToken = generateAccessToken(tokenData);
      const refreshToken = generateRefreshToken(tokenData);

      //save refreshToken
      findUser.refreshToken = refreshToken;
      await findUser.save();

      return {
        success: true,
        data: {
          userData: {
            ...tokenData,
            profile: findUser.profile,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async loginGoogleUser(ReqData: any) {
    try {
      const user: IGoogleUserData = ReqData._json;
      if (!user || !user.email_verified)
        throw new HTTPError("Not authorised", 403);

      const { email } = user;
      const findUser = await User.findOne({
        email,
        role: UserRoleMapping.student,
      });
      if (!findUser)
        throw new HTTPError("User with email and role does not exist", 404);

      //generate AT and RT
      const tokenData = {
        email,
        fullName: findUser.fullName,
        role: Role["student"],
        id: findUser._id.toString(),
      };

      const accessToken = generateAccessToken(tokenData);
      const refreshToken = generateRefreshToken(tokenData);

      //save refreshToken
      findUser.refreshToken = refreshToken;
      await findUser.save();

      return {
        success: true,
        data: {
          ...findUser,
          accessToken,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async refreshToken(refreshToken: string) {
    try {
      const storedToken = await User.findOne({ refreshToken });

      if (!storedToken) {
        throw new HTTPError("Refresh token not found", 401);
      }

      // Verify the refresh token
      let decoded;
      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET as string
        ) as ITokenData;
      } catch (err) {
        // Logout user and throw error if token is expired or invalid
        storedToken.refreshToken = undefined;
        storedToken.save();

        throw new HTTPError("Refresh Token expired. Login Again", 498);
      }

      // Generate a new access token
      const accessToken = generateAccessToken({
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role,
        id: decoded.id,
      });

      //return response
      return {
        success: true,
        data: { accessToken: accessToken },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async logoutUser(email: string) {
    try {
      //find if email exists already
      const findUser = await User.findOne({ email });
      if (!findUser) throw new HTTPError("User Not found", 404);

      //Logout user
      findUser.refreshToken = undefined;
      await findUser.save();

      return {
        success: true,
        message: "User logged out successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async sendResetPasswordLink(email: string) {
    try {
      //find if email exists already
      const findUser = await User.findOne({ email });
      if (!findUser) throw new HTTPError("User Not found", 404);

      //generate Token and token expiry and save it under the user
      const token = crypto.randomBytes(32).toString("hex");

      findUser.resetPasswordData = {
        resetToken: token,
        resetTokenExp: resetPasswordLinkExp,
      };
      await findUser.save();

      const data = {
        fullName: findUser.fullName,
        resetLink: `http://localhost:3000/api/v1/auth/password-reset/${token}`, //TODO: Change this to front end link
      };

      //generate link and send
      const response = await emailingService({
        email_id: email,
        data,
        template: resetPassword,
        subject: "EduLearn : Password Reset",
        choice: "reset_password",
      });
      if (!response) throw new HTTPError("Invalid Email Address", 500);

      return {
        success: true,
        data: {
          resetLink: data.resetLink,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async resetPassword(data: IResetPassword) {
    try {
      const { token, newPassword } = data;
      //find if email exists already
      const findUser = await User.findOne({
        "resetPasswordData.resetToken": token,
      });
      if (!findUser) throw new HTTPError("User Not found", 404);

      console.log("stored::", findUser?.resetPasswordData?.resetTokenExp);
      console.log("now::", Date.now());

      if (
        findUser.resetPasswordData?.resetTokenExp !== undefined &&
        findUser.resetPasswordData?.resetTokenExp !== null &&
        findUser.resetPasswordData.resetTokenExp < Date.now()
      )
        throw new HTTPError(
          "Reset Link Expired. Please generate a new link",
          400
        );
      //hash password
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      //save updated data of user in database
      findUser.password = hashedPassword;
      findUser.resetPasswordData = undefined;
      await findUser.save();

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }
}
