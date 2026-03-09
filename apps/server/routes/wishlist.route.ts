import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import wishlistController from "../controller/wishlist.controller";
const wishlistRouter = Router();
wishlistRouter.post(
    "/create-wishlist",
    authMiddleware,
    wishlistController.createWishlist
);
wishlistRouter.put(
    "/update-wishlist/:id",
    authMiddleware,
    wishlistController.updateWishlist
);
wishlistRouter.delete(
    "/delete-wishlist/:id",
    authMiddleware,
    wishlistController.deleteWishlist
);
wishlistRouter.get(
    "/get-wishlist-by-id/:id",
    authMiddleware,
    wishlistController.getWishlistById
);
wishlistRouter.get(
    "/get-user-wishlists/:id",
    authMiddleware,
    wishlistController.getAllWishlistByUser
);

// Backend declaration routes for Wishlist UI workflow.
// wishlistRouter.get(
//     "/interviewer/:interviewerId/wishlists",
//     authMiddleware,
//     wishlistController.getInterviewerWishlists
// );
// wishlistRouter.get(
//     "/:id/users",
//     authMiddleware,
//     wishlistController.getWishlistUsers
// );
// wishlistRouter.patch(
//     "/:id/name",
//     authMiddleware,
//     wishlistController.renameWishlistName
// );
export default wishlistRouter;
