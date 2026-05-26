import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import graphService from "../service/graph.service";
import prismaClient from "../utils/prisma";
class RecommendationController {
  async projectRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const pageNumber = Number(req.query.page) || 1;

      if (!userId) throw new Error("User not found");

      let projects = await graphService.getProjectRecommendation(
        pageNumber,
        userId,
      );
      if (!projects || projects.length === 0) {
        const fallbackProjects = await prismaClient.projects.findMany({
          take: 10,
          select: {
            id: true,
            title: true,
            projectUrl: true,
            repositoryUrl: true,
          },
        });

        projects = fallbackProjects.map((project) => ({
          id: project.id,
          name: project.title,
          liveLink: project.projectUrl,
          githubLink: project.repositoryUrl,
        }));
      }
      return res
        .status(200)
        .json(apiResponse(200, "Projects Fetched!", projects));
    } catch (error: any) {
      return res.status(200).json(apiResponse(200, error.message, error));
    }
  }

  async jobRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const pageNumber = Number(req.query.page) || 1;
      if (!userId) throw new Error("User not found");

      const jobs = await graphService.getJobRecommendation(pageNumber, userId);

      return res.status(200).json(apiResponse(200, "Jobs Fetched!", jobs));
    } catch (error: any) {
      return res.status(200).json(apiResponse(200, error.message, error));
    }
  }

  async userRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const pageNumber = Number(req.query.page) || 1;
      if (!userId) throw new Error("User not found");

      const users = await graphService.getUserRecommendation(
        pageNumber,
        userId,
      );

      return res.status(200).json(apiResponse(200, "Users Fetched!", users));
    } catch (error: any) {
      return res.status(200).json(apiResponse(200, error.message, error));
    }
  }
}

export default new RecommendationController();
