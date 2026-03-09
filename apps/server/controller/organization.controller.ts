import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import cloudinaryService from "../service/Cloudinary.service";
import prismaClient from "../utils/prisma";
import type { updateOrganization, updateInterviewer, createInterviewer } from "../utils/type";

class OrganizationController {
  async OrgProfilePicUpdate(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) throw new Error("No file found");
      const userId = req.user?.id;
      if (!userId) throw new Error("UserId is required");

      const uniqueFileName = `${file.originalname}-Profile-Picture-${Date.now()}`;
      const fileLink = await cloudinaryService.uploadFile(file, "Profile-Picture", uniqueFileName);

      if (!fileLink) throw new Error("Upload Failed");

      const updatedProfilePic = await prismaClient.organization.update({
        where: {
          id: userId,
        },
        data: {
          profileUrl: fileLink,
        }
      });

      if (!updatedProfilePic) throw new Error("Unable to update Profile Picture");

      return res.status(200).json(
        apiResponse(200, "Updated Profile Picture", updatedProfilePic),
      )
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async OrgProfileBannerUpdate(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) throw new Error("No file found");
      const userId = req.user?.id;

      if (!userId) throw new Error("User id not found");

      const uniqueFileName = `${file.originalname}-Banner-${Date.now()}`;
      const fileLink = await cloudinaryService.uploadFile(file, "Banner", uniqueFileName);
      if (!fileLink) throw new Error("Upload failed");

      const updatedOrgBanner = await prismaClient.organization.update({
        where: {
          id: userId,
        },
        data: {
          bannerUrl: fileLink,
        }
      });
      if (!updatedOrgBanner) throw new Error("Unable to Update banner");

      return res.status(200).json(
        apiResponse(200, "Updated banner", updatedOrgBanner),
      );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async updateOrganizationInfo(req: Request, res: Response) {
    try {
      const data = req.body as updateOrganization;
      const userId = req.user?.id;
      if (!userId) throw new Error("UserId is required");

      const name =
        typeof data.name === "string" ? data.name.trim() : undefined;
      const tagline =
        typeof data.tagline === "string" ? data.tagline.trim() : undefined;

      if (!name && !tagline) {
        throw new Error("At least one non-empty field is required");
      }

      const dbOrganization = await prismaClient.organization.findFirst({
        where: { id: userId },
      });

      if (!dbOrganization) throw new Error("Organization not found");

      await prismaClient.organization.update({
        where: { id: userId },
        data: {
          name: name ?? dbOrganization.name,
          tagline: tagline ?? dbOrganization.tagline,
        },
      });

      return res
        .status(200)
        .json(apiResponse(200, "Updated Organization!", null));
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json(apiResponse(500, error.message, null));
    }
  }
  async addInterviewer(req: Request, res: Response) {
    try {
      const data = req.body as createInterviewer;
      const userId = req.user?.id;

      if (!userId) throw new Error("UserId is required");

      const name =
        typeof data.name === "string" ? data.name.trim() : "";
      const username =
        typeof data.username === "string" ? data.username.trim() : "";
      const email =
        typeof data.email === "string" ? data.email.trim() : "";
      const password =
        typeof data.password === "string" ? data.password.trim() : "";

      if (!name || !username || !email || !password) {
        throw new Error("All fields are required and cannot be empty");
      }

      const newInterviewer = await prismaClient.interviewer.create({
        data: {
          name,
          username,
          email,
          password,
          orgId: userId,
        },
      });

      if (!newInterviewer) throw new Error("Unable to create interviewer");

      return res.status(200).json(
        apiResponse(200, "Created Interviewer", newInterviewer)
      );
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(
        apiResponse(500, error.message, null)
      );
    }
  }
  async updateInterviewerDetail(req: Request, res: Response) {
    try {
      const data = req.body as updateInterviewer;
      const userId = req.user?.id;

      if (!userId) throw new Error("UserId is required");

      const name =
        typeof data.name === "string" ? data.name.trim() : undefined;
      const headline =
        typeof data.headline === "string" ? data.headline.trim() : undefined;
      const userInfo =
        typeof data.userInfo === "string" ? data.userInfo.trim() : undefined;

      if (!name && !headline && !userInfo) {
        throw new Error("At least one non-empty field is required");
      }

      const db_Interviewer = await prismaClient.interviewer.findFirst({
        where: {
          orgId: userId,
        },
      });

      if (!db_Interviewer) throw new Error("Db interviewer not found");

      const updatedInterviewer = await prismaClient.interviewer.update({
        where: {
          id: db_Interviewer.id,
        },
        data: {
          name: name ?? db_Interviewer.name,
          headline: headline ?? db_Interviewer.headline,
          userInfo: userInfo ?? db_Interviewer.userInfo,
        },
      });

      if (!updatedInterviewer) {
        throw new Error("Unable to update Interviewer");
      }

      return res.status(200).json(
        apiResponse(200, "Updated Interviewer", updatedInterviewer)
      );
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(
        apiResponse(500, error.message, null)
      );
    }
  }
  async removeInterviewer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("userId is required");

      const deletedInterviewer = await prismaClient.interviewer.delete({
        where: {
          id: userId,
        }
      });
      if (!deletedInterviewer) throw new Error("Unable to delete");

      return res.status(200).json(
        apiResponse(200, "Deleted Interviewer", deletedInterviewer),
      );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async InterviewerProfilePicUpdate(req: Request, res: Response) {
    try {
      const file = req.file;
      const userId = req.user?.id;
      if (!userId) throw new Error("userId is required");

      const uniqueFileName = `${file?.originalname}-Profile-Picture-${Date.now()}`;
      const fileLink = await cloudinaryService.uploadFile(file, "Profile-Picture", uniqueFileName);
      if (!fileLink) throw new Error("Unable to upload file");

      const updatedProfilePic = await prismaClient.interviewer.update({
        where: {
          id: userId,
        },
        data: {
          profileUrl: fileLink,
        }
      });

      if (!updatedProfilePic) throw new Error("Unable to update Profile Picture");

      return res.status(200).json(
        apiResponse(200, "Updated Profile Picture", updatedProfilePic),
      );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async InterviewerProfileBannerUpdate(req: Request, res: Response) {
    try {
      const file = req.file;
      const userId = req.user?.id;
      if (!userId) throw new Error("userId is required");

      const uniqueFileName = `${file?.originalname}-Banner-${Date.now()}`;
      const fileLink = await cloudinaryService.uploadFile(file, "Banner", uniqueFileName);
      if (!fileLink) throw new Error("Unable to upload file");

      const updatedBanner = await prismaClient.interviewer.update({
        where: {
          id: userId,
        },
        data: {
          bannerUrl: fileLink,
        }
      });

      if (!updatedBanner) throw new Error("Unable to update Banner");

      return res.status(200).json(
        apiResponse(200, "Updated banner", updatedBanner),
      );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }

  async getMyOrganization(req: Request, res: Response) {
    try {
      if (req.user?.type !== "ORGANIZATION") {
        return res
          .status(403)
          .json(apiResponse(403, "Only organizations can access this", null));
      }

      const orgId = req.user?.id;
      if (!orgId) throw new Error("Organization id not found");

      const org = await prismaClient.organization.findUnique({
        where: { id: orgId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          tagline: true,
          profileUrl: true,
          bannerUrl: true,
        },
      });

      if (!org) {
        return res.status(404).json(apiResponse(404, "Organization not found", null));
      }

      return res.status(200).json(apiResponse(200, "Organization fetched", org));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async listMyInterviewers(req: Request, res: Response) {
    try {
      console.log(req.user?.type);
      console.log(req.user?.id);
      // @ts-ignore
      if (req.user?.type !== "ORGANIZATION") {
        return res
          .status(200)
          .json(apiResponse(403, "Only organizations can access this", null));
      }

      const orgId = req.user?.id;
      if (!orgId) throw new Error("Organization id not found");

      const interviewers = await prismaClient.interviewer.findMany({
        where: { orgId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res
        .status(200)
        .json(apiResponse(200, "Interviewers fetched", interviewers));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
}
export default new OrganizationController();
