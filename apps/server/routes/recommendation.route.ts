import { Router } from "express";
import recommendationController from "../controller/recommendation.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const recommendationRouter = Router();

recommendationRouter.get(
  "/recommend-user",
  authMiddleware,
  recommendationController.userRecommendations,
);

recommendationRouter.get(
  "/recommend-project",
  authMiddleware,
  recommendationController.projectRecommendations,
)

export default recommendationRouter;