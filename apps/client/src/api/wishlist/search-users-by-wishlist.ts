import axiosInstance from "@/utils/axiosInstance";
import type { WishlistUser } from "./types";

export const searchUsersByWishlist = async (
  wishlistId: string,
  query: string,
) => {
  const res = await axiosInstance.get(
    `/api/v1/interviewer/wishlistEntry/search-users-by-wishlist/${wishlistId}`,
    {
      params: {
        query,
      },
    },
  );

  return res.data?.data as WishlistUser[];
};
