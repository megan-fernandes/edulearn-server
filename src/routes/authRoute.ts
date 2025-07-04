import express from "express";
import {
  addNewUser,
  loginUser,
  resetPasswordLink,
  resetPasswordUser,
  userGoogleSuccess,
  userLogout,
  userRrefreshToken,
} from "../controller/authController";
import passport from "passport";
import { authenticateUser } from "../middleware/user";
require("../middleware/passport");

const router = express();

//register - email + password
router.post("/auth/register", addNewUser);

//login - email + password
router.post("/auth/login", loginUser);

//google - auth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/success",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    session: false,
  }),
  userGoogleSuccess
);

//refresh Token
router.post("/auth/refresh-token", userRrefreshToken);

//logout
router.get("/auth/logout", authenticateUser, userLogout);

//reset-password : Send link to emailId
router.post("/auth/link/password-reset", resetPasswordLink);

router.post("/auth/password-reset", resetPasswordUser);

export default router;
