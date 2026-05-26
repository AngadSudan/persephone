import axiosInstance from "@/utils/axiosInstance";
import type { WishlistEntry } from "./types";

export const createWishlistEntry = async (payload: {
  wishlistId: string;
  candidateId: string;
}) => {
  const res = await axiosInstance.post(
    "/api/v1/interviewer/wishlistEntry/create-wishlist-entry",
    payload,
  );

  return res.data?.data as WishlistEntry;
};
