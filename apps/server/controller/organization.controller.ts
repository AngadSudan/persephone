import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import cloudinaryService from "../service/Cloudinary.service";
import prismaClient from "../utils/prisma";
import type { updateOrganization, updateInterviewer, createInterviewer } from "../utils/type";
import { generatePassword } from "../utils/nodemailer/GeneratePass";
import { handleSendMail } from "../utils/nodemailer/mailHandler";
import { hashPassword } from "../utils/password";
import {
  getCacheSafe,
  invalidateManyCacheKeysSafe,
  setCacheSafe,
} from "../utils/cache";

const getOrganizationProfileCacheKey = (orgId: string) =>
  `/organizations/${orgId}:profile`;
const getOrganizationInterviewersCacheKey = (orgId: string) =>
  `/organizations/${orgId}:interviewers`;

const invalidateOrganizationCaches = async (orgId: string): Promise<void> => {
  await invalidateManyCacheKeysSafe([
    getOrganizationProfileCacheKey(orgId),
    getOrganizationInterviewersCacheKey(orgId),
  ]);
};

const getAuthUser = (req: Request) => req.user as { id?: string; type?: string } | undefined;

class OrganizationController {
  async OrgProfilePicUpdate(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) throw new Error("No file found");
      const userId = getAuthUser(req)?.id;
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

      await invalidateOrganizationCaches(userId);

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
      const userId = getAuthUser(req)?.id;

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

      await invalidateOrganizationCaches(userId);

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
      const userId = getAuthUser(req)?.id;
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

      await invalidateOrganizationCaches(userId);

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
      const userId = getAuthUser(req)?.id;

      if (!userId) throw new Error("UserId is required");

      const name =
        typeof data.name === "string" ? data.name.trim() : "";
      const username =
        typeof data.username === "string" ? data.username.trim() : "";
      const email =
        typeof data.email === "string" ? data.email.trim() : "";

      if (!name || !username || !email) {
        throw new Error("Name, username, and email are required and cannot be empty");
      }

      const existingInterviewer = await prismaClient.interviewer.findUnique({
        where: { email },
      });

      if (existingInterviewer) {
        throw new Error("Interviewer with this mail already exists");
      }

      const generatedPassword = generatePassword();
      const hashedPassword = await hashPassword(generatedPassword);

      const newInterviewer = await prismaClient.interviewer.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          orgId: userId,
        },
      });

      if (!newInterviewer) throw new Error("Unable to create interviewer");

      await handleSendMail(email, generatedPassword);

      await invalidateOrganizationCaches(userId);

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
      const authUser = getAuthUser(req);
      const userId = authUser?.id;

      if (!userId) throw new Error("UserId is required");

      const interviewerId = typeof req.params.id === "string" ? req.params.id.trim() : "";

      if (interviewerId) {
        if (authUser?.type !== "ORGANIZATION") {
          return res
            .status(403)
            .json(apiResponse(403, "Only organizations can edit interviewers", null));
        }

        const data = req.body as {
          name?: string;
          username?: string;
          email?: string;
        };

        const name = typeof data.name === "string" ? data.name.trim() : "";
        const username = typeof data.username === "string" ? data.username.trim() : "";
        const email = typeof data.email === "string" ? data.email.trim() : "";

        if (!name && !username && !email) {
          throw new Error("At least one non-empty field is required");
        }

        const dbInterviewer = await prismaClient.interviewer.findFirst({
          where: {
            id: interviewerId,
            orgId: userId,
          },
        });

        if (!dbInterviewer) throw new Error("Interviewer not found");

        if (username) {
          const existingUsername = await prismaClient.interviewer.findFirst({
            where: {
              username,
              NOT: { id: interviewerId },
            },
          });

          if (existingUsername) {
            throw new Error("Interviewer with this username already exists");
          }
        }

        if (email) {
          const existingEmail = await prismaClient.interviewer.findFirst({
            where: {
              email,
              NOT: { id: interviewerId },
            },
          });

          if (existingEmail) {
            throw new Error("Interviewer with this email already exists");
          }
        }

        const updatedInterviewer = await prismaClient.interviewer.update({
          where: {
            id: dbInterviewer.id,
          },
          data: {
            name: name || dbInterviewer.name,
            username: username || dbInterviewer.username,
            email: email || dbInterviewer.email,
          },
        });

        await invalidateOrganizationCaches(userId);

        return res.status(200).json(
          apiResponse(200, "Updated Interviewer", updatedInterviewer)
        );
      }

      const data = req.body as updateInterviewer;

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

      await invalidateOrganizationCaches(userId);

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
      const authUser = getAuthUser(req);
      const userId = authUser?.id;
      if (!userId) throw new Error("userId is required");

      const interviewerId =
        typeof req.params.id === "string" && req.params.id.trim()
          ? req.params.id.trim()
          : typeof req.body?.id === "string" && req.body.id.trim()
            ? req.body.id.trim()
            : "";

      if (!interviewerId) {
        throw new Error("Interviewer id is required");
      }

      if (authUser?.type !== "ORGANIZATION") {
        return res
          .status(403)
          .json(apiResponse(403, "Only organizations can delete interviewers", null));
      }

      const dbInterviewer = await prismaClient.interviewer.findFirst({
        where: {
          id: interviewerId,
          orgId: userId,
        },
      });

      if (!dbInterviewer) throw new Error("Interviewer not found");

      const deletedInterviewer = await prismaClient.interviewer.delete({
        where: {
          id: dbInterviewer.id,
        }
      });
      if (!deletedInterviewer) throw new Error("Unable to delete");

      await invalidateOrganizationCaches(userId);

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
      const userId = getAuthUser(req)?.id;
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

      await invalidateOrganizationCaches(userId);

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
      const userId = getAuthUser(req)?.id;
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

      await invalidateOrganizationCaches(userId);

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
      const authUser = getAuthUser(req);

      if (authUser?.type !== "ORGANIZATION") {
        return res
          .status(403)
          .json(apiResponse(403, "Only organizations can access this", null));
      }

      const orgId = authUser?.id;
      if (!orgId) throw new Error("Organization id not found");

      const orgProfileCacheKey = getOrganizationProfileCacheKey(orgId);
      const cachedOrg = await getCacheSafe(orgProfileCacheKey);

      if (cachedOrg !== null) {
        return res.status(200).json(apiResponse(200, "Organization fetched (Cache)", cachedOrg));
      }

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

      await setCacheSafe(orgProfileCacheKey, org);

      return res.status(200).json(apiResponse(200, "Organization fetched", org));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async listMyInterviewers(req: Request, res: Response) {
    try {
      const authUser = getAuthUser(req);
      console.log(authUser?.type);
      console.log(authUser?.id);
      // @ts-ignore
      if (authUser?.type !== "ORGANIZATION") {
        return res
          .status(200)
          .json(apiResponse(403, "Only organizations can access this", null));
      }

      const orgId = authUser?.id;
      if (!orgId) throw new Error("Organization id not found");

      const interviewersCacheKey = getOrganizationInterviewersCacheKey(orgId);
      const cachedInterviewers = await getCacheSafe(interviewersCacheKey);

      if (cachedInterviewers !== null) {
        return res
          .status(200)
          .json(apiResponse(200, "Interviewers fetched (Cache)", cachedInterviewers));
      }

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

      await setCacheSafe(interviewersCacheKey, interviewers);

      return res
        .status(200)
        .json(apiResponse(200, "Interviewers fetched", interviewers));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }

  async getInterviewersCount(req: Request, res: Response) {
    try {
      const authUser = getAuthUser(req);

      if (authUser?.type !== "ORGANIZATION") {
        return res
          .status(403)
          .json(apiResponse(403, "Only organizations can access this", null));
      }

      const orgId = authUser?.id;
      if (!orgId) throw new Error("Organization id not found");

      const totalInterviewers = await prismaClient.interviewer.count({
        where: { orgId },
      });

      return res
        .status(200)
        .json(apiResponse(200, "Interviewers Count Fetched Successfully !", { totalInterviewers }));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
}
export default new OrganizationController();
