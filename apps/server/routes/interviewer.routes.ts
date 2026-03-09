import { Router } from "express";
import InterviewerController from "../controller/interviewer.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/multer.middleware";
import userRouter from "./user.route";
const interviewerRouter = Router();

interviewerRouter.put(
    "/update-user-info",
    authMiddleware,
    InterviewerController.updateUserInfo,
);

interviewerRouter.put(
    "/update-ProfilePic",
    authMiddleware,
    upload.single("profilePic"),
    InterviewerController.handleProfilePicUpdate
);

interviewerRouter.put(
    "/update-banner",
    authMiddleware,
    upload.single("Banner"),
    InterviewerController.handleProfileBannerUpdate
);

interviewerRouter.get("/get-profile",
    authMiddleware,
    InterviewerController.getFullProfile
);


export default interviewerRouter;
