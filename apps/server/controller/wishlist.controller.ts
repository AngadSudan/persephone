import type { Request, Response } from "express";
import type { createWishListBody, updateWishlistBody } from "../utils/type"
import prismaClient from "../utils/prisma";
import apiResponse from "../utils/apiResponse";
import cacheClient from "../utils/redis";

const getWishlistCacheKey = (userId: string) => `/wishlists/${userId}:wishlist`;
const getWishlistDetailCacheKey = (userId: string, wishlistId: string) =>
  `/wishlists/${userId}:wishlist:${wishlistId}`;

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

const invalidateWishlistCaches = async (
    userId: string,
    wishlistId?: string,
): Promise<void> => {
    const keysToInvalidate = [getWishlistCacheKey(userId)];

    if (wishlistId) {
        keysToInvalidate.push(getWishlistDetailCacheKey(userId, wishlistId));
    }

    await Promise.all(keysToInvalidate.map((key) => invalidateCacheSafe(key)));
};

class WishlistController {
    async createWishlist(req: Request, res: Response) {
        try {
            /*
            payload
              name
              description  
            */
            const data: createWishListBody = req.body;
            if (!data) throw new Error("Please Provide all required fields");
            if (!req.user) throw new Error("user is Not Authorized");
            const userId = req.user.id;
            const user = await prismaClient.interviewer.findFirst({
                where: { id: userId }
            });
            if (!user) throw new Error("Not Authorized");
            const existingWishlist = await prismaClient.wishlist.findFirst({
                where: {
                    id: userId,
                    name: data.name
                }
            })
            if (existingWishlist) throw new Error("Wishlist with this name already exists");
            const createdWishlist = await prismaClient.wishlist.create({
                data: {
                    name: data.name,
                    description: data.description,
                    creatorId: req.user.id,
                }
            })

            await invalidateWishlistCaches(userId);

            return res.status(200).json(apiResponse(200, "Wishlist Created Successfully", createdWishlist));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));

        }

    }
    async updateWishlist(req: Request, res: Response) {
        try {
            /*
            payload
              name?
              description?
            */
            const data: updateWishlistBody = req.body;
            if (!data) throw new Error("Please Provide all required fields");
            if (!req.user) throw new Error("user is Not Authorized");
            const userId = req.user.id;
            const user = await prismaClient.interviewer.findFirst({
                where: { id: userId }
            });
            if (!user) throw new Error("Not Authorized");
            const wishlistId = req.params.id;
            const existingList = await prismaClient.wishlist.findFirst({
                where: { id: wishlistId as string }
            });
            if (!existingList) throw new Error("No such wishlist exists");
            const existingWishlistName = await prismaClient.wishlist.findFirst({
                where: {
                    id: userId,
                    name: data.name
                }
            })
            if (existingWishlistName) throw new Error("Wishlist with this name already exists");
            const updatedWishlist = await prismaClient.wishlist.update({
                where: { id: wishlistId as string },
                data: {
                    name: data.name || existingList.name,
                    description: data.description || existingList.description,
                }
            })

            await invalidateWishlistCaches(userId, wishlistId as string);

            return res.status(200).json(apiResponse(200, "Wishlist Updated Successfully", updatedWishlist));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));

        }
    }
    async deleteWishlist(req: Request, res: Response) {
        try {
            /*
            payload
              params: wishlistId
            */
            const data = req.body;
            if (!data) throw new Error("Please Provide all required fields");
            if (!req.user) throw new Error("user is Not Authorized");
            const userId = req.user.id;
            const wishlistId = req.params.id;
            const user = await prismaClient.interviewer.findFirst({
                where: { id: userId }
            });
            if (!user) throw new Error("Not Authorized");
            const existingList = await prismaClient.wishlist.findFirst({
                where: { id: wishlistId as string }
            });
            if (!existingList) throw new Error("No such wishlist exists");
            const deletedWishlist = await prismaClient.wishlist.delete({
                where: { id: wishlistId as string },
            });

            await invalidateWishlistCaches(userId, wishlistId as string);

            return res.status(200).json(apiResponse(200, "Wishlist Deleted Successfully", deletedWishlist));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));
        }

    }
    async getWishlistById(req: Request, res: Response) {
        try {
            /*
            payload
              params: wishlistId
            */
            const data = req.body;
            if (!data) throw new Error("Please Provide all required fields");
            if (!req.user) throw new Error("user is Not Authorized");

            const userId = req.user.id;
            const user = await prismaClient.interviewer.findFirst({
                where: { id: userId }
            });
            if (!user) throw new Error("Not Authorized");
            const wishlistId = req.params.id;
            
            const wishlistCacheKey = getWishlistDetailCacheKey(userId, wishlistId as string);
            const cacheWishlist = await getCacheSafe(wishlistCacheKey);

            if (cacheWishlist !== null) {
                console.log('Wishlist Fetched from cache');
                return res
                .status(200)
                .json(apiResponse(200,"Wishlist Fetched (Cache) !",cacheWishlist));
            }
            
            const existingList = await prismaClient.wishlist.findFirst({
                where: { id: wishlistId as string },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    creatorId: true,
                    wishlistEntries: true
                }
            });
            if (!existingList) throw new Error("No such wishlist exists");

            await setCacheSafe(wishlistCacheKey, existingList);

            return res.status(200).json(apiResponse(200, "Wishlist Fetched Successfully", existingList));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));
        }

    }
    async getAllWishlistByUser(req: Request, res: Response) {
        try {
            /*
            payload
              none
            */
            if (!req.user) throw new Error("user is Not Authorized");
            const userId = req.user.id;
            const user = await prismaClient.interviewer.findFirst({
                where: { id: userId }
            });
            if (!user) throw new Error("Not Authorized");

            const wishlistCacheKey = getWishlistCacheKey(userId);
            const cacheWishlist = await getCacheSafe(wishlistCacheKey);

            if (cacheWishlist !== null) {
                console.log('Wishlist Fetched from cache');
                return res
                .status(200)
                .json(apiResponse(200,"Wishlist Fetched (Cache) !",cacheWishlist));
            }

            const allWishlists = await prismaClient.wishlist.findMany({
                where: { creatorId: userId as string }
            });
            console.log(allWishlists)
            console.log(user)
            if (!allWishlists) throw new Error("No such wishlists exists");

            await setCacheSafe(wishlistCacheKey, allWishlists);

            return res.status(200).json(apiResponse(200, "All wishlist by user fetched", allWishlists));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));
        }

    }
}
export default new WishlistController();
