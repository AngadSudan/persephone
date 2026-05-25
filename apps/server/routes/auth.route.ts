import { Router } from "express";
import authController from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import passport from "passport";
import { setAccessTokenCookie } from "../utils/cookie";
const authRouter = Router();
authRouter.post("/register/interviewer",authController.CreateInterviewer);
authRouter.post("/login/interviewer", authController.InterviewerLogin);
authRouter.post("/register/user", authController.UserRegister);
authRouter.post("/login/user", authController.UserLogin);
authRouter.post("/register/org", authController.OrganizationRegister);
authRouter.post("/login/org", authController.OrganizationLogin);
authRouter.post("/forgot-password", authController.sendVerificationOTP);
authRouter.post("/verify-otp", authController.matchVerificationOTP);

authRouter.post("/reset-password", authController.resetPassword);

authRouter.get("/logout",authController.Logout);

// GitHub Login
authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);


// GitHub Callback
authRouter.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req: any, res) => {

    const { user, tokens } = req.user;

    setAccessTokenCookie(req, res, tokens.accessToken);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl.replace(/\/+$/, "")}/profile`);
  }
);

export default authRouter;
