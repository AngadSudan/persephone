import type { Request, Response } from "express";
import prismaClient from "../utils/prisma";
import apiResponse from "../utils/apiResponse";
import type { JobListing } from "../utils/type";
import type { JobApplication } from "../utils/type";
import cloudinaryService from "../service/Cloudinary.service";

import graphService from "../service/graph.service";

import {
  getCacheSafe,
  invalidateCacheSafe,
  setCacheSafe,
} from "../utils/cache";
import prisma from "@codex/prisma";

const getOrgJobListingsCacheKey = (orgId: string) => `/jobListing/org/${orgId}`;
const getJobListingByIdCacheKey = (jobId: string) => `/jobListing/id/${jobId}`;
const getJobApplicationsCacheKey = (jobId: string) =>
  `/jobApplication/${jobId}`;
const getInterviewSuiteApplicationsPageZeroCacheKey = (jobId: string) =>
  `/job-listing/${jobId}/application?pageNumber=0`;

class JobListingController {
  async createJobListing(req: Request, res: Response) {
    try {
      const orgId = (req.user as any)?.id;
      const data: JobListing = req.body;

      if (!orgId) {
        return res
          .status(400)
          .json(apiResponse(400, "Organization ID not Found!", null));
      }

      let jobListing = {};
      if (req.user.type === "ORGANIZATION") {
        jobListing = await prismaClient.jobListing.create({
          data: {
            jobDescription: data.jobDescription,
            jobRole: data.jobRole,
            jobType: data.jobType,
            startDate: data.startDate,
            endDate: data.endDate,
            payment: data.payment,
            organizationId: orgId,
          },
        });
      } else {
        let dbUser = await prismaClient.interviewer.findUnique({
          where: { id: req.user.id },
        });
        if (!dbUser?.orgId) throw new Error("no userId Found");

        jobListing = await prismaClient.jobListing.create({
          data: {
            jobDescription: data.jobDescription,
            jobRole: data.jobRole,
            jobType: data.jobType,
            startDate: data.startDate,
            endDate: data.endDate,
            payment: data.payment,
            organizationId: dbUser.orgId,
          },
        });
      }

      await invalidateCacheSafe(getOrgJobListingsCacheKey(orgId));
      await invalidateCacheSafe("/jobListing/all");
      const listingData = data as any;
      await graphService.addJobListing(
        orgId,
        listingData.skills ?? [],
        jobListing.id,
        orgId,
        listingData.name ?? data.jobRole,
        listingData.stipend ?? data.payment,
      );
      return res
        .status(201)
        .json(
          apiResponse(201, "Job Listing Created SuccessFully !", jobListing),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async updateJobListing(req: Request, res: Response) {
    try {
      const jobListId = String(req.params.jobListId);
      const organization = req.user as any;
      const data = req.body;

      if (organization?.type !== "ORGANIZATION") {
        throw new Error(
          "Not Authorized ! Only Organizations can update Job Listing",
        );
      }

      if (!req.params.jobListId) {
        return res
          .status(400)
          .json(apiResponse(400, "Job Listing ID is Required", null));
      }

      const job = await prismaClient.jobListing.findUnique({
        where: {
          id: jobListId as string,
        },
      });

      if (!job || job.organizationId !== organization.id) {
        return res.status(403).json(apiResponse(403, "Not Authorized !", null));
      }

      const updateJobList = await prismaClient.jobListing.update({
        where: {
          id: jobListId as string,
        },
        data: {
          jobDescription: data.jobDescription,
          jobRole: data.jobRole,
          jobType: data.jobType,
          startDate: data.startDate,
          endDate: data.endDate,
          payment: data.payment,
        },
      });

      await invalidateCacheSafe(getOrgJobListingsCacheKey(organization.id));
      await invalidateCacheSafe("/jobListing/all");

      await invalidateCacheSafe(getJobListingByIdCacheKey(jobListId));

      return res
        .status(200)
        .json(
          apiResponse(200, "Job Listing Updated SuccessFully !", updateJobList),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async deleteJobListing(req: Request, res: Response) {
    try {
      const jobListId = String(req.params.jobListId);
      const organization = req.user as any;
      const resumeFile = req.file;

      if (organization?.type !== "ORGANIZATION")
        throw new Error("Only Organizations can Delete Job Listing");

      if (!req.params.jobListId) {
        return res
          .status(400)
          .json(apiResponse(400, "Job List ID Missing", null));
      }

      await invalidateCacheSafe(getOrgJobListingsCacheKey(organization.id));
      await invalidateCacheSafe("/jobListing/all");
      await invalidateCacheSafe(getJobListingByIdCacheKey(jobListId));

      const job = await prismaClient.jobListing.findUnique({
        where: {
          id: jobListId as string,
        },
      });

      if (!job || job.organizationId !== organization.id) {
        return res.status(403).json(apiResponse(403, "Not Authorized !", null));
      }

      const deleteJobList = await prismaClient.jobListing.delete({
        where: {
          id: jobListId as string,
        },
      });

      return res
        .status(200)
        .json(
          apiResponse(200, "Job Listing Deleted SuccessFully", deleteJobList),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async viewApplications(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const jobListId = String(req.params.jobListId);

      if (!req.params.jobListId) {
        return res
          .status(400)
          .json(apiResponse(400, "Job Listing ID is Required !", null));
      }

      if (user?.type !== "INTERVIEWER" && user?.type !== "ORGANIZATION") {
        return res
          .status(403)
          .json(apiResponse(403, "User not Authorized !", null));
      }

      const job = await prismaClient.jobListing.findUnique({
        where: {
          id: jobListId as string,
        },
      });

      if (!job) {
        return res.status(404).json(apiResponse(404, "Job Not Found !", null));
      }

      if (user.type === "ORGANIZATION" && job.organizationId !== user.id) {
        return res
          .status(403)
          .json(apiResponse(403, "Not your Job Listing", null));
      }

      const cacheJobApplication = await getCacheSafe(
        getJobApplicationsCacheKey(jobListId),
      );

      if (cacheJobApplication !== null) {
        return res
          .status(200)
          .json(
            apiResponse(
              200,
              "Job Applications Fetched (Cache) !",
              cacheJobApplication,
            ),
          );
      }

      const jobApplications = await prismaClient.jobApplication.findMany({
        where: {
          jobListingId: jobListId as string,
        },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              resume: true,
            },
          },
        },
      });

      await setCacheSafe(
        getJobApplicationsCacheKey(jobListId),
        jobApplications,
      );

      return res
        .status(200)
        .json(
          apiResponse(
            200,
            "Job Applications for Job Listing Fetched SuccessFully !",
            jobApplications,
          ),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getAllJobListings(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const requesterId = user?.id;
      const requesterType = user?.type;

      if (!requesterId) {
        return res
          .status(400)
          .json(apiResponse(400, "User ID not Found !", null));
      }

      const cacheKey =
        requesterType === "ORGANIZATION"
          ? getOrgJobListingsCacheKey(requesterId)
          : "/jobListing/all";

      const cacheJobApplication = await getCacheSafe(cacheKey);

      if (cacheJobApplication !== null) {
        return res
          .status(200)
          .json(
            apiResponse(
              200,
              "Job Applications Fetched (Cache) !",
              cacheJobApplication,
            ),
          );
      }

      let allJobListing: any[] = [];
      if (requesterType === "ORGANIZATION") {
        allJobListing = await prismaClient.jobListing.findMany({
          where: {
            organizationId: requesterId,
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                profileUrl: true,
              },
            },
            interviewer: {
              select: {
                name: true,
                headline: true,
              },
            },
            interviewSuites: true,
            _count: {
              select: {
                jobApplications: true,
              },
            },
          },
        });
      } else {
        const dbUser = await prismaClient.interviewer.findUnique({
          where: { id: requesterId },
        });

        allJobListing = await prismaClient.jobListing.findMany({
          where: {
            organizationId: dbUser?.orgId,
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                profileUrl: true,
              },
            },
            interviewer: {
              select: {
                name: true,
                headline: true,
              },
            },
            interviewSuites: true,
            _count: {
              select: {
                jobApplications: true,
              },
            },
          },
        });
      }

      const formattedJobs = allJobListing.map((job) => ({
        id: job.id,
        jobRole: job.jobRole,
        jobDescription: job.jobDescription,
        jobType: job.jobType,
        payment: job.payment,
        startDate: job.startDate,
        endDate: job.endDate,
        createdAt: job.createdAt,
        interviewSuites: job.interviewSuites,
        organization: {
          id: job.organization.id,
          name: job.organization.name,
          logo: job.organization.profileUrl,
        },

        interviewer: job.interviewer
          ? {
              name: job.interviewer.name,
              headline: job.interviewer.headline,
            }
          : undefined,

        totalApplicants: job._count.jobApplications,
      }));

      await setCacheSafe(cacheKey, formattedJobs);

      return res
        .status(200)
        .json(apiResponse(200, "All Job Listings", formattedJobs));
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(400, error.message, null));
    }
  }

  async getJobListingsCount(req: Request, res: Response) {
    try {
      const totalListings = await prismaClient.jobListing.count();

      return res.status(200).json(
        apiResponse(200, "Job Listings Count Fetched Successfully !", {
          totalListings,
        }),
      );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }

  async getJobListingById(req: Request, res: Response) {
    try {
      const jobId = String(req.params.jobId);

      if (!req.params.jobId) {
        return res
          .status(400)
          .json(apiResponse(400, "Job ID is Missing !", null));
      }

      const cacheJobListing = await getCacheSafe(
        getJobListingByIdCacheKey(jobId),
      );

      if (cacheJobListing !== null) {
        return res
          .status(200)
          .json(apiResponse(200, "Job Listing By Id (Cache)", cacheJobListing));
      }

      const jobListing = await prismaClient.jobListing.findUnique({
        where: {
          id: jobId as string,
        },
        select: {
          jobDescription: true,
          jobRole: true,
          jobType: true,
          startDate: true,
          endDate: true,
          payment: true,
        },
      });

      if (!jobListing) {
        return res
          .status(404)
          .json(apiResponse(404, "Job Listing Not Found !", null));
      }

      await setCacheSafe(getJobListingByIdCacheKey(jobId), jobListing);

      return res
        .status(200)
        .json(
          apiResponse(200, "Job Listing Fetched SuccessFully !", jobListing),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async applyToJob(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const jobId = String(req.params.jobId);
      const data: JobApplication = req.body;
      const resumeFile = req.file;

      if (user?.type !== "USER") {
        return res
          .status(403)
          .json(apiResponse(403, "Only Users can Apply !", null));
      }

      if (!resumeFile) {
        return res
          .status(400)
          .json(apiResponse(400, "Resume is Required !", null));
      }

      if (!req.params.jobId) {
        return res
          .status(400)
          .json(apiResponse(400, "Job ID not Found !", null));
      }

      const job = await prismaClient.jobListing.findUnique({
        where: {
          id: jobId as string,
        },
      });

      if (!job) {
        return res.status(404).json(apiResponse(404, "Job Not Found !", null));
      }
      // TODO: CHECK FOR ALREADY EXISTING APPLICATION IF ANY
      const dbApplication = await prismaClient.jobApplication.findFirst({
        where: {
          candidateId: user.id,
          jobListingId: jobId as string,
        },
      });

      if (dbApplication) {
        return res
          .status(409)
          .json(apiResponse(409, "Application Already Applied !", null));
      }

      const resume = await cloudinaryService.uploadFile(
        resumeFile,
        `${resumeFile?.originalname}_Resume_${Date.now()}`,
        "Resume",
      );

      if (!resume) {
        throw new Error("Resume Upload Failed !");
      }

      const jobApplication = await prismaClient.jobApplication.create({
        data: {
          resume: resume, // would be a file
          candidateId: user.id,
          jobListingId: jobId as string,
        },
      });

      await invalidateCacheSafe(getJobApplicationsCacheKey(jobId));
      await invalidateCacheSafe(
        getInterviewSuiteApplicationsPageZeroCacheKey(jobId),
      );

      return res
        .status(201)
        .json(
          apiResponse(201, "Applied to Job SuccessFully !", jobApplication),
        );
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
}

export default new JobListingController();
