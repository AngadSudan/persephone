import axiosInstance from "@/utils/axiosInstance";
import type { Wishlist } from "./types";

export const createWishlist = async (payload: {
    name: string;
    description?: string;
}) => {
    const res = await axiosInstance.post(
        "/api/v1/interviewer/wishlist/create-wishlist",
        payload,
    );

    return res.data?.data as Wishlist;
};