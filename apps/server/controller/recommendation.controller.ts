import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";
import graphService from "../service/graph.service";

class RecommendationController{
    async projectRecommendations(req: Request, res: Response){
        try {
            const userId =  req.user?.id;
            const pageNumber = Number(req.query.page) || 1;

            if(!userId) throw new Error("User not found");

            const projects = await graphService.getProjectRecommendation(pageNumber,userId);
            // if(!projects || projects.length === 0) throw new Error("Unable to fetch projects");

            return res.status(200).json(
                apiResponse(200,"Projects Fetched!",projects),
            )
        } catch (error: any) {
            return res.status(200).json(
                apiResponse(200,error.message, error)
            )
        }
    }

    async jobRecommendations(req: Request, res: Response){
        try {
            const userId = req.user?.id;
            const pageNumber = Number(req.query.page) || 1;
            if(!userId) throw new Error("User not found");     
            
            const jobs = await graphService.getJobRecommendation(pageNumber, userId);

            return res.status(200).json(
                apiResponse(200,"Jobs Fetched!",jobs),
            )
        } catch (error: any) {
            return res.status(200).json(
                apiResponse(200,error.message, error)
            )
        }
    }

    async userRecommendations(req: Request, res: Response){
        try {
            const userId = req.user?.id;
            const pageNumber = Number(req.query.page) || 1;
            if(!userId) throw new Error("User not found");     
            
            const users = await graphService.getUserRecommendation(pageNumber, userId);

            return res.status(200).json(
                apiResponse(200,"Users Fetched!",users),
            )
        } catch (error: any) {
            return res.status(200).json(
                apiResponse(200,error.message, error)
            )
        }
    }
}