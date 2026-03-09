import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";
import type { UpdateInterviewer, } from "../utils/type";
import cloudinaryService from "../service/Cloudinary.service";
import { parse } from "yaml";

class InterviewerController {
    async updateUserInfo(req: Request, res: Response) {
        try {
            const data = req.body as UpdateInterviewer;
            const interviewerId = req.user?.id;

            if (!interviewerId) {
                throw new Error("User Id is required");
            }

            // Check for existing user
            const dbInterviewer = await prismaClient.user.findUnique({
                where: {
                    id: interviewerId,
                },
            });

            if (!dbInterviewer) throw new Error("Db user not found");

            // Update data using trimmed values
            const updatedInterviewer = await prismaClient.interviewer.update({
                where: {
                    id: dbInterviewer.id,
                },
                data: {
                    name: (data.name?.trim() || undefined) ?? dbInterviewer.name,
                    userInfo: (data.userInfo?.trim() || undefined) ?? dbInterviewer.userInfo,
                    headline: (data.headline?.trim() || undefined) ?? dbInterviewer.headline,
                },
            });
            if (!updatedInterviewer) throw new Error("Failed User Updation");

            return res
                .status(200)
                .json(apiResponse(200, "Interviewer data updated", updatedInterviewer));
        } catch (error: any) {
            console.error(error);
            return res.status(500).json(apiResponse(500, error.message, null));
        }
    }
    async handleProfilePicUpdate(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) throw new Error("No file found");
            const interviewerId = req.user?.id;
            if (!interviewerId) throw new Error("Interviewer id not found");

            const uniqueFileName = `${file.originalname}-Profile-Picture-${Date.now()}`;
            const fileLink = await cloudinaryService.uploadFile(
                file,
                "ProfilePic",
                uniqueFileName,
            );
            if (!fileLink) throw new Error("Upload failed");

            const updatedProfilePic = await prismaClient.interviewer.update({
                where: {
                    id: interviewerId,
                },
                data: {
                    profileUrl: fileLink,
                },
            });

            if (!updatedProfilePic)
                throw new Error("Unable to  update profile picture");

            return res
                .status(200)
                .json(apiResponse(200, "Updated Profile Picture", updatedProfilePic));
        } catch (error: any) {
            console.log(error);
            return res.status(200).json(apiResponse(500, error.message, null));
        }
    }
    async handleProfileBannerUpdate(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) throw new Error("No file found");
            const interviewerId = req.user?.id;
            if (!interviewerId) throw new Error("Interviewer id not found");

            const uniqueFileName = `${file.originalname}-Banner-${Date.now()}`;
            const fileLink = await cloudinaryService.uploadFile(
                file,
                "Profile-Banner",
                uniqueFileName,
            );

            if (!fileLink) throw new Error("Upload failed");

            const updatedBanner = await prismaClient.interviewer.update({
                where: {
                    id: interviewerId,
                },
                data: {
                    bannerUrl: fileLink,
                },
            });

            if (!updatedBanner) throw new Error("Unable to update Banner");

            return res
                .status(200)
                .json(apiResponse(200, "Updated Banner", updatedBanner));
        } catch (error: any) {
            console.log(error);
            return res.status(200).json(apiResponse(500, error.message, null));
        }
    }
    async getFullProfile(req: Request, res: Response) {
        try {
            const interviewerId = req.user?.id;
            if (!interviewerId) throw new Error("Interviewer id is required");

            const interviewerData = await prismaClient.interviewer.findFirst({
                where: {
                    id: interviewerId,
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    profileUrl: true,
                    bannerUrl: true,
                    headline: true,
                    userInfo: true,
                    orgId: true,
                    wishlists: true,
                    jobListings: true,
                },
            });

            if (!interviewerData) throw new Error("Unable to fetch interviewer data");

            return res
                .status(200)
                .json(apiResponse(200, "Interviewer data found", interviewerData));
        } catch (error: any) {
            console.log(error);
            return res.status(200).json(apiResponse(500, error.message, null));
        }
    }
}

export default new InterviewerController();
