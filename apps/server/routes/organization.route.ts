import { Router } from "express";
import organizationController from "../controller/organization.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/multer.middleware";
const organizationRouter = Router();

organizationRouter.put(
    "/update-org-profilePic",
    authMiddleware,
    upload.single("Org-Profile-Pic"),
    organizationController.OrgProfilePicUpdate,
);

organizationRouter.put(
    "/update-org-profileBanner",
    authMiddleware,
    upload.single("Org-Profile-Banner"),
    organizationController.OrgProfileBannerUpdate,
);

organizationRouter.put(
    "/update-organization",
    authMiddleware,
    organizationController.updateOrganizationInfo,
);

organizationRouter.post(
    "/create-interviewer",
    authMiddleware,
    organizationController.addInterviewer,
);

organizationRouter.put(
    "/update-interviewer",
    authMiddleware,
    organizationController.updateInterviewerDetail,
);

organizationRouter.delete(
    "/delete-interviewer",
    authMiddleware,
    organizationController.removeInterviewer,
);

organizationRouter.put(
    "/update-interviewer-profilePic",
    authMiddleware,
    upload.single("Interviewer-Profile-Pic"),
    organizationController.InterviewerProfilePicUpdate,
);


organizationRouter.put(
    "/update-interviewer-banner",
    authMiddleware,
    upload.single("Interviewer-Profile-Banner"),
    organizationController.InterviewerProfileBannerUpdate,
);

// Org dashboard helpers
organizationRouter.get("/me", authMiddleware, organizationController.getMyOrganization);
organizationRouter.get(
  "/interviewers",
  authMiddleware,
  organizationController.listMyInterviewers,
);

export default organizationRouter;
