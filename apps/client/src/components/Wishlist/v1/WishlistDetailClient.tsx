"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { getWishlistById } from "@/api/wishlist/get-wishlist-by-id";
import { updateWishlist } from "@/api/wishlist/update-wishlist";
import { removeUserFromWishlist } from "@/api/wishlist/remove-user-from-wishlist";
import type { WishlistDetails } from "@/api/wishlist/types";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import WishlistHeader from "./WishlistHeader";
import WishlistUsersTable from "./WishlistUsersTable";
import RenameWishlistModal from "./RenameWishlistModal";

type WishlistDetailClientProps = {
    wishlistId: string;
};

export default function WishlistDetailClient({
    wishlistId,
}: WishlistDetailClientProps) {
    const Colors = useColors();
    const [wishlist, setWishlist] = useState<WishlistDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [openRename, setOpenRename] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await getWishlistById(wishlistId);
            setWishlist(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load wishlist details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [wishlistId]);

    const handleRename = async (name: string) => {
        try {
            await updateWishlist(wishlistId, { name });
            toast.success("Wishlist name updated.");
            await fetchWishlist();
        } catch (error) {
            console.error(error);
            toast.error("Could not update wishlist name.");
            throw error;
        }
    };

    const handleRemoveUser = async (entryId: string) => {
        try {
            setRemovingId(entryId);
            await removeUserFromWishlist(entryId);
            toast.success("User removed from wishlist.");
            setWishlist((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    wishlistEntries: prev.wishlistEntries.filter((entry) => entry.id !== entryId),
                };
            });
        } catch (error) {
            console.error(error);
            toast.error("Could not remove user.");
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <WishlistHeader
                title={wishlist?.name || "Wishlist Details"}
                subtitle={wishlist?.description || "View users in this wishlist"}
            />

            <div className="flex justify-end">
                <button
                    onClick={() => setOpenRename(true)}
                    disabled={!wishlist}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${Colors.border.defaultThin} ${Colors.text.primary} ${Colors.properties.interactiveButton} disabled:opacity-50`}
                >
                    <Pencil size={15} />
                    Edit Wishlist Name
                </button>
            </div>

            {loading ? (
                <div className={`rounded-2xl p-8 ${Colors.background.primary} ${Colors.border.specialThin}`}>
                    <p className={`text-sm ${Colors.text.secondary}`}>Loading users...</p>
                </div>
            ) : (
                <WishlistUsersTable
                    entries={wishlist?.wishlistEntries || []}
                    onRemove={handleRemoveUser}
                    removingId={removingId}
                />
            )}

            <RenameWishlistModal
                open={openRename && !!wishlist}
                initialName={wishlist?.name || ""}
                onClose={() => setOpenRename(false)}
                onSave={handleRename}
            />
        </div>
    );
}
