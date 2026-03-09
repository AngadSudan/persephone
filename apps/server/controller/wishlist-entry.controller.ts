import type { Request, Response } from "express";
import type { createWishlistEntry, updateWishlistEntry } from "../utils/type"
import prismaClient from "../utils/prisma";
import apiResponse from "../utils/apiResponse";
class WishlistController {
    // TODO: Backend implementation pending.
    // Contract for frontend: remove user from wishlist using wishlist entry id param.
    async removeUserFromWishlist(req: Request, res: Response) {
        return res.status(501).json(
            apiResponse(501, "removeUserFromWishlist is not implemented", null)
        );
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
                where: { id: userId }
            });
            if (!user) throw new Error("Not Authorized");
            const wishlistId = data.wishlistId;
            const wishlist = await prismaClient.wishlist.findFirst({
                where: {
                    id: wishlistId,
                }
            })
            if (!wishlist) throw new Error("Wishlist with this id does not exists");
            const createdWishlistEntry = await prismaClient.wishlistEntry.create({
                data: {
                    wishlistId: wishlistId,
                    candidateId: data.candidateId
                }
            })
            return res.status(200).json(apiResponse(200, "Wishlist entry created Successfully", createdWishlistEntry));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));

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
                where: { id: userId }
            });
            if (!user) throw new Error("Not Authorized");
            const wishlistEntryId = req.params.id;
            const existingEntry = await prismaClient.wishlistEntry.findFirst({
                where: { id: wishlistEntryId as string },
            })
            if (!existingEntry) throw new Error("No such wishlist Entry Exists");
            const updatedWishlistEntry = await prismaClient.wishlistEntry.update({
                where: { id: wishlistEntryId as string },
                data: {
                    wishlistId: data.wishlistId || existingEntry.wishlistId,
                    candidateId: data.candidateId || existingEntry.candidateId,
                }
            })
            return res.status(200).json(apiResponse(200, "Wishlist entry updated Successfully", updatedWishlistEntry));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));

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
            const wishlistEntryId = req.params.id;
            const existingEntry = await prismaClient.wishlistEntry.findFirst({
                where: { id: wishlistEntryId as string }
            });
            if (!existingEntry) throw new Error("No such wishlist exists");
            const deletedWishlistEntry = await prismaClient.wishlistEntry.delete({
                where: { id: wishlistEntryId as string },
            });
            return res.status(200).json(apiResponse(200, "Wishlist entry Deleted Successfully", deletedWishlistEntry));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));
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
            const existingEntry = await prismaClient.wishlistEntry.findFirst({
                where: { id: wishlistEntryId as string }
            });
            if (!existingEntry) throw new Error("No such wishlist entry exists");
            return res.status(200).json(apiResponse(200, "Wishlist Fetched Successfully", existingEntry));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));
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
            const allEntries = await prismaClient.wishlistEntry.findMany({
                where: { wishlistId: wishlistId }
            });
            if (!allEntries) throw new Error("No such wishlist entries exists");
            return res.status(200).json(apiResponse(200, "All wishlist entries fetched", allEntries));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));
        }

    }
}
export default new WishlistController();
