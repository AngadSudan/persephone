import { Router } from "express";
import authController from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import passport from "passport";
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

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:3000/profile");
  }
);

export default authRouter;
