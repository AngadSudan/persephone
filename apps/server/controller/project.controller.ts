import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import prismaClient from "../utils/prisma";
import type { projectPayload } from "../utils/type";
import cloudinaryService from "../service/Cloudinary.service";
import graphService from "../service/graph.service";
import cacheClient from "../utils/redis";

const getProjectsListCacheKey = (userId: string) => `/projects/${userId}:projects`;
const getProjectDetailCacheKey = (userId: string, projectId: string) =>
  `/projects/${userId}:project:${projectId}`;

const parseCachedValue = <T>(cachedValue: unknown): T | null => {
  if (cachedValue === null || cachedValue === undefined) {
    return null;
  }

  if (typeof cachedValue === "string") {
    try {
      return JSON.parse(cachedValue) as T;
    } catch {
      return null;
    }
  }

  return cachedValue as T;
};

const getCacheSafe = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedValue = await cacheClient.getCache(key);
    return parseCachedValue<T>(cachedValue);
  } catch (error: any) {
    console.error(`Cache read failed for key ${key}:`, error?.message || error);
    return null;
  }
};

const setCacheSafe = async (key: string, value: unknown): Promise<void> => {
  try {
    await cacheClient.setCache(key, value);
  } catch (error: any) {
    console.error(`Cache write failed for key ${key}:`, error?.message || error);
  }
};

const invalidateCacheSafe = async (key: string): Promise<void> => {
  try {
    await cacheClient.invalidateCache(key);
  } catch (error: any) {
    console.error(
      `Cache invalidation failed for key ${key}:`,
      error?.message || error,
    );
  }
};

const invalidateProjectCaches = async (
  userId: string,
  projectId?: string,
): Promise<void> => {
  const keysToInvalidate = [getProjectsListCacheKey(userId)];

  if (projectId) {
    keysToInvalidate.push(getProjectDetailCacheKey(userId, projectId));
  }

  await Promise.all(keysToInvalidate.map((key) => invalidateCacheSafe(key)));
};

class ProjectController {
  async createProject(req: Request<{}, {}, projectPayload>, res: Response) {
    try {
      const data = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const title = data.title?.trim();
      const description = data.description?.trim();
      const projectUrl = data.projectUrl?.trim();
      const repositoryUrl = data.repositoryUrl?.trim();

      if (!title || !description) {
        return res
          .status(400)
          .json(apiResponse(400, "Title and description are required", null));
      }

      const skills = data.skills?.map((skill) => skill.trim());
      // TODO: Upload file to cloudinary.
      let coverImageUrl = "";
      
      const newProject = await prismaClient.projects.create({
        data: {
          title,
          description,
          projectUrl,
          coverImage: coverImageUrl,
          repositoryUrl,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(),
          isOngoing: data.isOngoing,
          visibility: data.visibility,
          publishStatus: data.publishStatus,
          publishTime: data.publishTime
          ? new Date(data.publishTime)
          : new Date(),
          skills,
          ownerId: userId,
        },
      });
      
      await graphService.addUserProject(newProject.id,userId,skills,title,projectUrl,repositoryUrl);

      await invalidateProjectCaches(userId);

      return res
        .status(201)
        .json(apiResponse(201, "Project Created!!", newProject));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async updateProject(req: Request<{ id: string }, {}, projectPayload>, res: Response,) {
    try {
      const id = req.params.id.trim();
      const data = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const existingProject = await prismaClient.projects.findUnique({
        where: { id },
      });

      if (!existingProject) {
        return res
          .status(404)
          .json(apiResponse(404, "Project not found", null));
      }

      if (existingProject.ownerId !== userId) {
        return res.status(403).json(apiResponse(403, "Forbidden", null));
      }

      const updatedProject = await prismaClient.projects.update({
        where: { id },
        data: {
          title: data.title?.trim() ?? existingProject.title,
          description: data.description?.trim() ?? existingProject.description,
          projectUrl: data.projectUrl?.trim() ?? existingProject.projectUrl,
          repositoryUrl:
            data.repositoryUrl?.trim() ?? existingProject.repositoryUrl,
          startDate: data.startDate
            ? new Date(data.startDate)
            : existingProject.startDate,
          endDate: data.endDate
            ? new Date(data.endDate)
            : existingProject.endDate,
          isOngoing: data.isOngoing ?? existingProject.isOngoing,
          visibility: data.visibility ?? existingProject.visibility,
          publishStatus: data.publishStatus ?? existingProject.publishStatus,
          publishTime: data.publishTime
            ? new Date(data.publishTime)
            : existingProject.publishTime,
          skills: data.skills
            ? data.skills.map((s) => s.trim())
            : existingProject.skills,
        },
      });

      await invalidateProjectCaches(userId, id);

      return res
        .status(200)
        .json(apiResponse(200, "Project Updated!!", updatedProject));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

    async updateCoverImage(req: Request<{ id: string }>, res: Response) {
    try {
      const file = req.file;
      if(!file) throw new Error("No file found");
      const userId = req.user?.id;
      if(!userId) throw new Error("User id not found");
      const projectId = req.params.id.trim();

      // Verify project ownership
      const existingProject = await prismaClient.projects.findUnique({
        where: { id: projectId },
      });

      if (!existingProject) {
        return res.status(404).json(apiResponse(404, "Project not found", null));
      }

      if (existingProject.ownerId !== userId) {
        return res.status(403).json(apiResponse(403, "Forbidden", null));
      }

      const uniqueFileName = `${file.originalname}-Cover-${Date.now()}`;
      const fileLink = await cloudinaryService.uploadFile(file, "Cover-Image", uniqueFileName);

      if(!fileLink) throw new Error("Upload failed");

      const updatedCover = await prismaClient.projects.update({
        where:{
          id: projectId,
        },
        data:{
          coverImage: fileLink,
        }
      });

      if(!updatedCover) throw new Error("Unable to update Cover Image");

      await invalidateProjectCaches(userId, projectId);

      return res.status(200).json(
        apiResponse(200, "Updated Cover Image", updatedCover),
      );
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async updateProjectMedia(req: Request<{ id: string }>, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new Error("No files found");
    }

    const userId = req.user?.id;
    if (!userId) throw new Error("User id not found");

    const projectId = req.params.id.trim();

    // Verify project ownership
    const existingProject = await prismaClient.projects.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return res.status(404).json(apiResponse(404, "Project not found", null));
    }

    if (existingProject.ownerId !== userId) {
      return res.status(403).json(apiResponse(403, "Forbidden", null));
    }

    // Upload all files & prepare DB records
    const uploadedMedias = await Promise.all(
      files.map(async (file) => {
        const uniqueFileName = `${file.originalname}-Media-${Date.now()}`;

        const fileLink = await cloudinaryService.uploadFile(
          file,
          "Project-Media",
          uniqueFileName
        );

        if (!fileLink) throw new Error("Upload failed");

        // Detect file type
        let mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" = "IMAGE";

        if (file.mimetype.startsWith("video")) {
          mediaType = "VIDEO";
        } else if (
          file.mimetype === "application/pdf" ||
          file.mimetype.includes("document") ||
          file.mimetype.includes("msword")
        ) {
          mediaType = "DOCUMENT";
        }

        return {
          projectId,
          type: mediaType,
          url: fileLink,
        };
      })
    );

    // Store as multiple ProjectMedia entries
    const createdMedias = await prismaClient.projectMedia.createMany({
      data: uploadedMedias,
    });

    await invalidateProjectCaches(userId, projectId);

    return res.status(200).json(
      apiResponse(200, "Project media updated successfully", createdMedias)
    );
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
}

  async deleteProjectMedia(
    req: Request<{ id: string; mediaId: string }>,
    res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const projectId = req.params.id.trim();
      const mediaId = req.params.mediaId.trim();

      const project = await prismaClient.projects.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return res.status(404).json(apiResponse(404, "Project not found", null));
      }

      if (project.ownerId !== userId) {
        return res.status(403).json(apiResponse(403, "Forbidden", null));
      }

      const media = await prismaClient.projectMedia.findFirst({
        where: {
          id: mediaId,
          projectId,
        },
      });

      if (!media) {
        return res
          .status(404)
          .json(apiResponse(404, "Project media not found", null));
      }

      if (media.url) {
        await cloudinaryService.deleteFile(media.url);
      }

      await prismaClient.projectMedia.delete({
        where: { id: mediaId },
      });

      await invalidateProjectCaches(userId, projectId);

      return res
        .status(200)
        .json(apiResponse(200, "Project media deleted successfully", null));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async deleteProject(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id.trim();
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const project = await prismaClient.projects.findUnique({
        where: { id },
        include: { projectMedias: true, tags: true },
      });

      if (!project) {
        return res
          .status(404)
          .json(apiResponse(404, "Project not found", null));
      }

      if (project.ownerId !== userId) {
        return res.status(403).json(apiResponse(403, "Forbidden", null));
      }

      await prismaClient.projects.delete({
        where: { id },
      });

      await invalidateProjectCaches(userId, id);

      return res
        .status(200)
        .json(apiResponse(200, "Project Deleted Successfully", null));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async getProjectById(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id.trim();
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const projectCacheKey = getProjectDetailCacheKey(userId, id);
      const cacheProject = await getCacheSafe(projectCacheKey);
 
      if (cacheProject !== null) {
        console.log('Project Fetched from cache');
        return res
        .status(200)
        .json(apiResponse(200,"Project Fetched (Cache) !",cacheProject));
      }

      const project = await prismaClient.projects.findFirst({
        where: { id, ownerId: userId },
        include: { projectMedias: true },
      });

      if (!project) {
        return res
          .status(404)
          .json(apiResponse(404, "Project not found", null));
      }

      await setCacheSafe(projectCacheKey, project);
      console.log('Project Set in cache');

      return res.status(200).json(apiResponse(200, "Success", project));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async getAllUserProjects(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(apiResponse(401, "Unauthorized", null));
      }

      const projectsListCacheKey = getProjectsListCacheKey(userId);
      const cacheProjects = await getCacheSafe(projectsListCacheKey);
 
      if (cacheProjects !== null) {
        return res
        .status(200)
        .json(apiResponse(200,"Projects Fetched (Cache) !",cacheProjects));
      }

      const projects = await prismaClient.projects.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
        include: { projectMedias: true },
      });

      await setCacheSafe(projectsListCacheKey, projects)

      return res.status(200).json(apiResponse(200, "Success", projects));
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(apiResponse(500, error.message, null));
    }
  }

  async getUserProjectsByBatch(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(apiResponse(401, "Unauthorized", null));
    }

    // Parse query params
    const offset = parseInt(req.query.offset as string) || 0;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 10, 50);

    const projects = await prismaClient.projects.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: pageSize,
      include: { projectMedias: true },
    });

    return res.status(200).json(apiResponse(200, "Success", projects));
  } catch (error: any) {
    console.error(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
}
}

export default new ProjectController();
