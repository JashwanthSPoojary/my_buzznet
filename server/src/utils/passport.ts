import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStratergy } from "passport-google-oauth20";
import {
  CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
} from "./config";
import { PrismaClient } from "@prisma/client";

const pgClient = new PrismaClient();

passport.use(
  new GoogleStratergy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email === null) return done(null, false);
        let user = await pgClient.users.findUnique({
          where: {
            email: email,
          },
        });
        if (!user) {
          user = await pgClient.users.create({
            data: {
              username: profile.displayName,
              email: email,
              password_hash: "none",
            },
          });
        }
        if (!JWT_SECRET) return done(null, false);
        const token = await jwt.sign(
          {
            user_id: user.id,
          },
          JWT_SECRET
        );
        return done(null, { token });
      } catch (error) {
        return done(null,{error:"Database error"});
      }
    }
  )
);
