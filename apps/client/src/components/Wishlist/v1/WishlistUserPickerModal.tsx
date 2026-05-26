"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { createWishlistEntry } from "@/api/wishlist/create-wishlist-entry";
import { searchUsersByWishlist } from "@/api/wishlist/search-users-by-wishlist";
import type { WishlistUser } from "@/api/wishlist/types";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type WishlistUserPickerModalProps = {
  open: boolean;
  wishlistId: string;
  onClose: () => void;
  onAdded?: () => Promise<void> | void;
};

export default function WishlistUserPickerModal({
  open,
  wishlistId,
  onClose,
  onAdded,
}: WishlistUserPickerModalProps) {
  const Colors = useColors();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<WishlistUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setUsers([]);
      setLoading(false);
      setAddingId(null);
      return;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(
      async () => {
        try {
          setLoading(true);
          const data = await searchUsersByWishlist(wishlistId, query.trim());
          if (isActive) {
            setUsers(data);
          }
        } catch (error) {
          console.error(error);
          if (isActive) {
            setUsers([]);
            toast.error("Failed to search users.");
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      },
      query.trim() ? 250 : 0,
    );

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [open, wishlistId, query]);

  const handleAddUser = async (user: WishlistUser) => {
    try {
      setAddingId(user.id);
      await createWishlistEntry({
        wishlistId,
        candidateId: user.id,
      });
      toast.success("User added to wishlist.");
      await onAdded?.();
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not add user to wishlist.");
    } finally {
      setAddingId(null);
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-3xl rounded-2xl border p-6 shadow-2xl ${Colors.background.primary} ${Colors.border.specialThin}`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-semibold ${Colors.text.primary}`}>
              Add users to wishlist
            </h2>
            <p className={`mt-1 text-sm ${Colors.text.secondary}`}>
              Search by name or username, then add the user to this wishlist.
            </p>
          </div>

          <button
            className={`${Colors.text.secondary} ${Colors.properties.interactiveButton}`}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${Colors.background.secondary} ${Colors.border.defaultThin}`}
        >
          <Search size={16} className={Colors.text.secondary} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users by name or username"
            className={`w-full bg-transparent outline-none ${Colors.text.primary}`}
          />
        </div>

        <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <div
              className={`flex items-center gap-3 rounded-2xl p-4 ${Colors.background.secondary} ${Colors.border.defaultThin}`}
            >
              <Loader2 size={18} className="animate-spin" />
              <span className={`text-sm ${Colors.text.secondary}`}>
                Searching users...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div
              className={`rounded-2xl p-8 text-center ${Colors.background.secondary} ${Colors.border.defaultThin}`}
            >
              <UserPlus
                className={`mx-auto mb-3 ${Colors.text.special}`}
                size={28}
              />
              <p className={`text-sm ${Colors.text.secondary}`}>
                No users match your search.
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between gap-4 rounded-2xl p-4 ${Colors.background.secondary} ${Colors.border.defaultThin}`}
              >
                <div className="min-w-0">
                  <p className={`font-medium ${Colors.text.primary}`}>
                    {user.name || user.username || "Unknown User"}
                  </p>
                  <p className={`truncate text-sm ${Colors.text.secondary}`}>
                    @{user.username || user.id}{" "}
                    {user.email ? `• ${user.email}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => handleAddUser(user)}
                  disabled={addingId === user.id}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${Colors.background.special} ${Colors.text.inverted} disabled:opacity-60 ${Colors.properties.interactiveButton}`}
                >
                  {addingId === user.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
