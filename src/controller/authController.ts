import { Request, Response } from "express";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import {
  ILoginUser,
  IRegisterUser,
  IResetPassword,
} from "../utility/types/auth.types";
import {
  VLoginUser,
  VRegisterUser,
  VResetPassword,
  VResetPasswordLink,
} from "../utility/validations/authValidation";
import { AuthServices } from "../services/authService";
import { httpStatusCodes } from "../utility/statusCodes";

const authObj = new AuthServices();

export const addNewUser = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role)
      throw new HTTPError("Missing required fields", 412);

    const data: IRegisterUser = {
      fullName,
      email,
      password,
      role,
    };

    Helpers.validateWithZod(VRegisterUser, data);
    const registerUser = await authObj.RegisterNewUser(data);
    const code = registerUser.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, registerUser));
  } catch (err) {
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const { email, password, role } = req.body;
    if (!email || !password || !role)
      throw new HTTPError("Missing required fields", 412);

    const data: ILoginUser = {
      email,
      password,
      role,
    };

    Helpers.validateWithZod(VLoginUser, data);
    const registerUser = await authObj.LoginUser(data);
    const code = registerUser.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, registerUser));
  } catch (err) {
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

export const userGoogleSuccess = async (req: Request, res: Response) => {
  try {
    const reqData: any = req.user;
    // console.log(
    //   "\n==============\nCALLBACK: Req.user\n================\n",
    //   req.user
    // );

    const registerGoogleUser = await authObj.loginGoogleUser(reqData);
    const code = registerGoogleUser.success ? 200 : 400;
    if (code === 200) {
      const encodedData = JSON.stringify(registerGoogleUser.data);
      console.log("ENCODED DATA:::", encodedData);
      res.redirect(`http://localhost:5173/google-callback?data=${encodedData}`);
    } else {
      res
        .status(httpStatusCodes[code].code)
        .json(
          Helpers.formResponse(httpStatusCodes[code].code, registerGoogleUser)
        );
    }
  } catch (err) {
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

export const userRrefreshToken = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const { refreshToken } = req.body;
    if (!refreshToken) throw new HTTPError("Missing required fields", 412);

    const generateRefreshToken = await authObj.refreshToken(refreshToken);
    const code = generateRefreshToken.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(
        Helpers.formResponse(httpStatusCodes[code].code, generateRefreshToken)
      );
  } catch (err) {
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

export const userLogout = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) throw new HTTPError("Unauthorised", 401);

    const logoutResponse = await authObj.logoutUser(
      (user as { email: string }).email
    );
    const code = logoutResponse.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, logoutResponse));
  } catch (err) {
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

export const resetPasswordLink = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const { email } = req.body;
    if (!email) throw new HTTPError("Missing required fields", 412);

    Helpers.validateWithZod(VResetPasswordLink, { email });
    const resetLinkresponse = await authObj.sendResetPasswordLink(email);
    const code = resetLinkresponse.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(
        Helpers.formResponse(httpStatusCodes[code].code, resetLinkresponse)
      );
  } catch (err) {
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

export const resetPasswordUser = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      throw new HTTPError("Missing required fields", 412);

    const data: IResetPassword = {
      token,
      newPassword,
    };

    Helpers.validateWithZod(VResetPassword, data);
    const resetPassword = await authObj.resetPassword(data);
    const code = resetPassword.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, resetPassword));
  } catch (err) {
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
