import axiosInstance from "@/utils/axiosInstance";
import type { Wishlist } from "./types";

export const getWishlistsByUser = async (userId: string) => {
    console.log("USEr id")
    console.log(userId);
    const res = await axiosInstance.get(
        `/api/v1/interviewer/wishlist/get-user-wishlists/${userId}`,
    );
    console.log(res.data);
    console.log("data inside func")
    if (res.data?.statusCode && res.data.statusCode !== 200) {
        throw new Error(res.data?.message || "Failed to fetch wishlists");
    }

    return (res.data?.data ?? []) as Wishlist[];
};