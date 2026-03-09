// import axiosInstance from "@/utils/axiosInstance";


// const WISHLIST_ROUTES = {
//     getInterviewerWishlists: (interviewerId: string) =>
//         `/api/v1/interviewer/wishlist/interviewer/${interviewerId}/wishlists`,
//     createWishlist: () => `/api/v1/interviewer/wishlist/create-wishlist`,
//     getWishlistUsers: (wishlistId: string) =>
//         `/api/v1/interviewer/wishlist/get-wishlist-by-id/${wishlistId}`,
//     updateWishlist: (wishlistId: string) =>
//         `/api/v1/interviewer/wishlist/update-wishlist/${wishlistId}`,
//     removeUserFromWishlist: (wishlistEntryId: string) =>
//         `/api/v1/interviewer/wishlistEntry/${wishlistEntryId}/remove-user`,
// };

// export type Wishlist = {
//     id: string;
//     name: string;
//     description?: string | null;
//     creatorId: string;
//     createdAt?: string;
//     updatedAt?: string;
// };

// export type WishlistUser = {
//     id: string;
//     name?: string;
//     username?: string;
//     email?: string;
// };

// export type WishlistEntry = {
//     id: string;
//     wishlistId: string;
//     candidateId: string;
//     candidate?: WishlistUser;
//     createdAt?: string;
//     updatedAt?: string;
// };

// export type WishlistDetails = Wishlist & {
//     wishlistEntries: WishlistEntry[];
// };

// export const getInterviewerWishlists = async (interviewerId: string) => {
//     // TODO(BE): API call placeholder - fetch all wishlists by interviewer.
//     const res = await axiosInstance.get(
//         WISHLIST_ROUTES.getInterviewerWishlists(interviewerId),
//     );

//     // TODO(BE): Adjust response mapping if your backend wraps data differently.
//     // Example expected: { statusCode: 200, data: Wishlist[] }

//     return (res.data?.data ?? []) as Wishlist[];
// };

// export const createWishlist = async (payload: {
//     name: string;
//     description?: string;
// }) => {
//     // TODO(BE): API call placeholder - create wishlist.
//     // Example payload expected: { name, description? }
//     const res = await axiosInstance.post(WISHLIST_ROUTES.createWishlist(), payload);

//     // TODO(BE): Adjust response mapping if needed.
//     // Example expected: { statusCode: 200, data: Wishlist }

//     return res.data?.data as Wishlist;
// };

// export const getWishlistById = async (wishlistId: string) => {
//     // TODO(BE): API call placeholder - get wishlist + users/entries.
//     const res = await axiosInstance.get(WISHLIST_ROUTES.getWishlistUsers(wishlistId));

//     // TODO(BE): Ensure backend returns wishlistEntries with candidate details.
//     // Example expected: { id, name, description, wishlistEntries: [{ id, candidateId, candidate }] }

//     return res.data?.data as WishlistDetails;
// };

// export const updateWishlist = async (wishlistId: string, name: string) => {
//     // TODO(BE): API call placeholder - rename wishlist by id.
//     // Example payload expected: { name }
//     const res = await axiosInstance.patch(WISHLIST_ROUTES.updateWishlist(wishlistId), { name });

//     // TODO(BE): Adjust response mapping if needed.

//     return res.data?.data as Wishlist;
// };

// export const removeUserFromWishlist = async (wishlistEntryId: string) => {
//     // TODO(BE): API call placeholder - remove user from wishlist by wishlistEntry id.
//     const res = await axiosInstance.delete(
//         WISHLIST_ROUTES.removeUserFromWishlist(wishlistEntryId),
//     );

//     // TODO(BE): Adjust response mapping if needed.

//     return res.data?.data as WishlistEntry;
// };
