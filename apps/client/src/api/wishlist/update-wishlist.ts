import axiosInstance from "@/utils/axiosInstance";
import type { Wishlist } from "./types";

export const updateWishlist = async (
    wishlistId: string,
    payload: {
        name?: string;
        description?: string;
    },
) => {
    const res = await axiosInstance.put(
        `/api/v1/interviewer/wishlist/update-wishlist/${wishlistId}`,
        payload,
    );

    return res.data?.data as Wishlist;
};