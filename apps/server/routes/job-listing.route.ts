import { Router } from "express";
import jobListingController from "../controller/job-listing.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const jobListingRouter = Router();

jobListingRouter.post("/create-job-listing",authMiddleware,jobListingController.createJobListing);

jobListingRouter.put("/update-job-listing/:jobListId",authMiddleware,jobListingController.updateJobListing);

jobListingRouter.delete("/delete-job-listing/:jobListId",authMiddleware,jobListingController.deleteJobListing);

jobListingRouter.get("/get-job-applications/:jobListId",authMiddleware,jobListingController.viewApplications);

jobListingRouter.get("/get-all-job-listing",authMiddleware,jobListingController.getAllJobListings);

jobListingRouter.get("/get-job-listing-by-id/:jobId",authMiddleware,jobListingController.getJobListingById);

jobListingRouter.put("/apply-to-job/:jobId",authMiddleware,jobListingController.applyToJob);

export default jobListingRouter;
