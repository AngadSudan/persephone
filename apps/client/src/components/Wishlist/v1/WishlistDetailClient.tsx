"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getWishlistById } from "@/api/wishlist/get-wishlist-by-id";
import { removeUserFromWishlist } from "@/api/wishlist/remove-user-from-wishlist";
import type { WishlistDetails } from "@/api/wishlist/types";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import WishlistHeader from "./WishlistHeader";
import WishlistUsersTable from "./WishlistUsersTable";
import WishlistUserPickerModal from "./WishlistUserPickerModal";

type WishlistDetailClientProps = {
  wishlistId: string;
};

export default function WishlistDetailClient({
  wishlistId,
}: WishlistDetailClientProps) {
  const Colors = useColors();
  const [wishlist, setWishlist] = useState<WishlistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAddUsers, setOpenAddUsers] = useState(false);
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

  const handleRemoveUser = async (entryId: string) => {
    try {
      setRemovingId(entryId);
      await removeUserFromWishlist(entryId);
      toast.success("User removed from wishlist.");
      setWishlist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          wishlistEntries: prev.wishlistEntries.filter(
            (entry) => entry.id !== entryId,
          ),
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
    <div className={`relative space-y-6 p-4 ${Colors.background.primary}`}>
      <WishlistHeader
        title={wishlist?.name || "Wishlist Users"}
        subtitle="Search, add, and remove users from this wishlist."
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => setOpenAddUsers(true)}
          disabled={!wishlist}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${Colors.background.special} ${Colors.text.inverted} disabled:opacity-50 ${Colors.properties.interactiveButton}`}
        >
          Add Users
        </button>
      </div>

      {loading ? (
        <div
          className={`rounded-2xl p-8 ${Colors.background.primary} ${Colors.border.specialThin}`}
        >
          <p className={`text-sm ${Colors.text.secondary}`}>Loading users...</p>
        </div>
      ) : (
        <WishlistUsersTable
          entries={wishlist?.wishlistEntries || []}
          onRemove={handleRemoveUser}
          removingId={removingId}
        />
      )}

      <WishlistUserPickerModal
        open={openAddUsers && !!wishlist}
        wishlistId={wishlistId}
        onClose={() => setOpenAddUsers(false)}
        onAdded={fetchWishlist}
      />
    </div>
  );
}
