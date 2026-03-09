import type { Request, Response } from "express";
import type { createWishListBody, updateWishlistBody } from "../utils/type"
import prismaClient from "../utils/prisma";
import apiResponse from "../utils/apiResponse";
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
            const allWishlists = await prismaClient.wishlist.findMany({
                where: { creatorId: userId as string }
            });
            console.log(allWishlists)
            console.log(user)
            if (!allWishlists) throw new Error("No such wishlists exists");
            return res.status(200).json(apiResponse(200, "All wishlist by user fetched", allWishlists));
        } catch (error: any) {
            return res.status(200).json(apiResponse(error.statusCode, error.message, null));
        }

    }
}
export default new WishlistController();
