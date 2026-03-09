import axiosInstance from "@/utils/axiosInstance";
import type { WishlistEntry } from "./types";

export const removeUserFromWishlist = async (wishlistEntryId: string) => {
  const res = await axiosInstance.delete(
    `/api/v1/interviewer/wishlistEntry/delete-wishlist-entry/${wishlistEntryId}`,
  );

  return res.data?.data as WishlistEntry;
};
