import stratergy from "passport-google-oauth20";
import passport from "passport";
import dotenv from "dotenv";
import { User } from "../models/user";
dotenv.config();

const GoogleStrategy = stratergy.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
      callbackURL: process.env.CALLBACK_URL as string,
      scope: ["email", "profile"],
    },
    async function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      callback: Function
    ) {
      console.log(accessToken, refreshToken);
      try {
        const email = profile.emails[0].value;
        const existingUser = await User.findOne({ email });

        if (existingUser) return callback(null, existingUser);

        // Default Role of "student"
        const user = await User.create({
          fullName: profile.displayName,
          email,
          googleId: profile.id,
          role: "student",
          profile: profile.photos?.[0]?.value,
        });

        callback(null, user);
      } catch (err) {
        return callback(err, null);
      }
    }
  )
);

passport.serializeUser((user: object, done: Function) => {
  done(null, user);
});

passport.deserializeUser((user: object, done: Function) => {
  done(null, user);
});
