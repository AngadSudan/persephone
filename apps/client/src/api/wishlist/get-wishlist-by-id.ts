import axiosInstance from "@/utils/axiosInstance";
import type { WishlistDetails } from "./types";

export const getWishlistById = async (wishlistId: string) => {
    const res = await axiosInstance.get(
        `/api/v1/interviewer/wishlist/get-wishlist-by-id/${wishlistId}`,
    );

    return res.data?.data as WishlistDetails;
};