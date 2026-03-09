import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import prismaClient from "./prisma";
import authController from "../controller/auth.controller";

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_OAUTH_CLIENTID!,
      clientSecret: process.env.GITHUB_OAUTH_SECRET!,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:8000/api/v1/auth/github/callback",
      scope: ["user:email"],
      passReqToCallback: true,
    },
    async function (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) {
      try {
        const githubId = profile.id;
        const username = profile.username || profile._json.login;
        const email = profile.emails?.[0]?.value;
        const avatar = profile._json.avatar_url;
        let name = profile._json.name;

        if (!email) throw new Error("Email not provided by GitHub");

        const dbUser = await prismaClient.user.findUnique({
          where: { email },
        });

        let result;

        if (dbUser) {
          result = await authController.OAuthLogin(
            email,
            githubId,
            accessToken,
            avatar
          );
        } else {
          if (!name) name = username;

          result = await authController.OAuthRegister(
            githubId,
            username,
            email,
            accessToken,
            name,
            avatar
          );
        }

        return done(null, result);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
