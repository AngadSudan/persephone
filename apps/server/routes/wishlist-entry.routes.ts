import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import wishlistController from "../controller/wishlist-entry.controller"
const wishlistEntryRouter = Router();
wishlistEntryRouter.post(
    "/create-wishlist-entry",
    authMiddleware,
    wishlistController.createWishlistEntry
);
wishlistEntryRouter.put(
    "/update-wishlist-entry/:id",
    authMiddleware,
    wishlistController.updateWishlistEntry
);
wishlistEntryRouter.delete(
    "/delete-wishlist-entry/:id",
    authMiddleware,
    wishlistController.deleteWishlistEntry
);
wishlistEntryRouter.get(
    "/get-wishlist-entry-by-id/:id",
    authMiddleware,
    wishlistController.getWishlistEntryById
);
wishlistEntryRouter.get(
    "/get-all-entries-by-wishlist/:id",
    authMiddleware,
    wishlistController.getAllEntriesByWishlist
);

// Backend declaration route for Wishlist UI workflow.
// wishlistEntryRouter.delete(
//     "/:id/remove-user",
//     authMiddleware,
//     wishlistController.removeUserFromWishlist
// );
export default wishlistEntryRouter;
