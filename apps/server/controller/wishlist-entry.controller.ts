import type { Request, Response } from "express";
import type { createWishlistEntry, updateWishlistEntry } from "../utils/type";
import prismaClient from "../utils/prisma";
import apiResponse from "../utils/apiResponse";
import {
  getCacheSafe,
  invalidateManyCacheKeysSafe,
  setCacheSafe,
} from "../utils/cache";

const getWishlistEntriesCacheKey = (wishlistId: string) =>
  `/wishlists/${wishlistId}:entries`;
const getWishlistEntryCacheKey = (entryId: string) =>
  `/wishlists/entries/${entryId}`;
const getWishlistCacheKey = (userId: string) => `/wishlists/${userId}:wishlist`;
const getWishlistDetailCacheKey = (userId: string, wishlistId: string) =>
  `/wishlists/${userId}:wishlist:${wishlistId}`;

const invalidateWishlistEntryRelatedCaches = async ({
  userId,
  wishlistId,
  entryId,
}: {
  userId?: string;
  wishlistId?: string;
  entryId?: string;
}): Promise<void> => {
  const keys: string[] = [];

  if (wishlistId) {
    keys.push(getWishlistEntriesCacheKey(wishlistId));
  }

  if (entryId) {
    keys.push(getWishlistEntryCacheKey(entryId));
  }

  if (userId && wishlistId) {
    keys.push(getWishlistCacheKey(userId));
    keys.push(getWishlistDetailCacheKey(userId, wishlistId));
  }

  if (keys.length > 0) {
    await invalidateManyCacheKeysSafe(keys);
  }
};
class WishlistController {
  async removeUserFromWishlist(req: Request, res: Response) {
    return this.deleteWishlistEntry(req, res);
  }

  async createWishlistEntry(req: Request, res: Response) {
    try {
      /*
            payload
              wishlistId
              candidateId
            */
      const data: createWishlistEntry = req.body;
      if (!data) throw new Error("Please Provide all required fields");
      if (!req.user) throw new Error("user is Not Authorized");
      const userId = (req.user as any).id;
      const user = await prismaClient.interviewer.findFirst({
        where: { id: userId },
      });
      if (!user) throw new Error("Not Authorized");
      const wishlistId = data.wishlistId;
      const wishlist = await prismaClient.wishlist.findFirst({
        where: {
          id: wishlistId,
          creatorId: userId,
        },
      });
      if (!wishlist) throw new Error("Wishlist with this id does not exists");
      const existingEntry = await prismaClient.wishlistEntry.findFirst({
        where: {
          wishlistId,
          candidateId: data.candidateId,
        },
      });
      if (existingEntry) {
        throw new Error("User is already in this wishlist");
      }
      const createdWishlistEntry = await prismaClient.wishlistEntry.create({
        data: {
          wishlistId: wishlistId,
          candidateId: data.candidateId,
        },
      });

      await invalidateWishlistEntryRelatedCaches({
        userId,
        wishlistId,
      });

      return res
        .status(200)
        .json(
          apiResponse(
            200,
            "Wishlist entry created Successfully",
            createdWishlistEntry,
          ),
        );
    } catch (error: any) {
      return res
        .status(200)
        .json(apiResponse(error.statusCode || 400, error.message, null));
    }
  }
  async updateWishlistEntry(req: Request, res: Response) {
    try {
      /*
            payload
              wishlistID?
              candidateId?
            */
      const data: updateWishlistEntry = req.body;
      if (!data) throw new Error("Please Provide all required fields");
      if (!req.user) throw new Error("user is Not Authorized");
      const userId = (req.user as any).id;
      const user = await prismaClient.interviewer.findFirst({
        where: { id: userId },
      });
      if (!user) throw new Error("Not Authorized");
      const wishlistEntryId = req.params.id;
      const existingEntry = await prismaClient.wishlistEntry.findFirst({
        where: { id: wishlistEntryId as string },
      });
      if (!existingEntry) throw new Error("No such wishlist Entry Exists");
      const updatedWishlistEntry = await prismaClient.wishlistEntry.update({
        where: { id: wishlistEntryId as string },
        data: {
          wishlistId: data.wishlistId || existingEntry.wishlistId,
          candidateId: data.candidateId || existingEntry.candidateId,
        },
      });

      await invalidateWishlistEntryRelatedCaches({
        userId,
        wishlistId: updatedWishlistEntry.wishlistId,
        entryId: updatedWishlistEntry.id,
      });

      return res
        .status(200)
        .json(
          apiResponse(
            200,
            "Wishlist entry updated Successfully",
            updatedWishlistEntry,
          ),
        );
    } catch (error: any) {
      return res
        .status(200)
        .json(apiResponse(error.statusCode, error.message, null));
    }
  }
  async deleteWishlistEntry(req: Request, res: Response) {
    try {
      /*
            payload
              wishlistEntryId: params
            */
      const data = req.body;
      if (!data) throw new Error("Please Provide all required fields");
      if (!req.user) throw new Error("user is Not Authorized");
      const userId = (req.user as any).id;
      const wishlistEntryId = String(req.params.id);
      const existingEntry = await prismaClient.wishlistEntry.findFirst({
        where: {
          id: wishlistEntryId as string,
          wishlist: {
            creatorId: userId,
          },
        },
      });
      if (!existingEntry) throw new Error("No such wishlist exists");
      const deletedWishlistEntry = await prismaClient.wishlistEntry.delete({
        where: { id: wishlistEntryId as string },
      });

      await invalidateWishlistEntryRelatedCaches({
        userId,
        wishlistId: existingEntry.wishlistId,
        entryId: wishlistEntryId,
      });

      return res
        .status(200)
        .json(
          apiResponse(
            200,
            "Wishlist entry Deleted Successfully",
            deletedWishlistEntry,
          ),
        );
    } catch (error: any) {
      return res
        .status(200)
        .json(apiResponse(error.statusCode || 400, error.message, null));
    }
  }
  async searchUsersByWishlist(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("user is Not Authorized");

      const userId = (req.user as any).id;
      const wishlistId = String(req.params.id);
      const query = String(req.query.query || "").trim();

      const wishlist = await prismaClient.wishlist.findFirst({
        where: {
          id: wishlistId,
          creatorId: userId,
        },
      });
      if (!wishlist) throw new Error("Wishlist with this id does not exists");

      const existingEntries = await prismaClient.wishlistEntry.findMany({
        where: { wishlistId },
        select: { candidateId: true },
      });

      const candidateIds = existingEntries.map((entry) => entry.candidateId);

      const users = await prismaClient.user.findMany({
        where: {
          id: { notIn: candidateIds },
          ...(query
            ? {
                OR: [
                  {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    username: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          profileUrl: true,
        },
        take: 20,
        orderBy: {
          name: "asc",
        },
      });

      return res
        .status(200)
        .json(apiResponse(200, "Users fetched successfully", users));
    } catch (error: any) {
      return res
        .status(200)
        .json(apiResponse(error.statusCode || 400, error.message, null));
    }
  }
  async getWishlistEntryById(req: Request, res: Response) {
    try {
      /*
           payload
             wishlistEntryId: params
           */
      const data = req.body;
      if (!data) throw new Error("Please Provide all required fields");
      if (!req.user) throw new Error("user is Not Authorized");
      const wishlistEntryId = req.params.id;

      const cacheKey = getWishlistEntryCacheKey(wishlistEntryId as string);
      const cachedEntry = await getCacheSafe(cacheKey);

      if (cachedEntry !== null) {
        return res
          .status(200)
          .json(
            apiResponse(
              200,
              "Wishlist Fetched Successfully (Cache)",
              cachedEntry,
            ),
          );
      }

      const existingEntry = await prismaClient.wishlistEntry.findFirst({
        where: { id: wishlistEntryId as string },
      });
      if (!existingEntry) throw new Error("No such wishlist entry exists");

      await setCacheSafe(cacheKey, existingEntry);

      return res
        .status(200)
        .json(apiResponse(200, "Wishlist Fetched Successfully", existingEntry));
    } catch (error: any) {
      return res
        .status(200)
        .json(apiResponse(error.statusCode, error.message, null));
    }
  }
  async getAllEntriesByWishlist(req: Request, res: Response) {
    try {
      /*
           payload
             wishlistId
           */
      const data = req.body;
      if (!data) throw new Error("Please Provide all required fields");
      if (!req.user) throw new Error("user is Not Authorized");
      const wishlistId = data.wishlistId;

      const entriesCacheKey = getWishlistEntriesCacheKey(wishlistId);
      const cachedEntries = await getCacheSafe(entriesCacheKey);

      if (cachedEntries !== null) {
        return res
          .status(200)
          .json(
            apiResponse(
              200,
              "All wishlist entries fetched (Cache)",
              cachedEntries,
            ),
          );
      }

      const allEntries = await prismaClient.wishlistEntry.findMany({
        where: { wishlistId: wishlistId },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              profileUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (!allEntries) throw new Error("No such wishlist entries exists");

      await setCacheSafe(entriesCacheKey, allEntries);

      return res
        .status(200)
        .json(apiResponse(200, "All wishlist entries fetched", allEntries));
    } catch (error: any) {
      return res
        .status(200)
        .json(apiResponse(error.statusCode, error.message, null));
    }
  }
}
export default new WishlistController();
