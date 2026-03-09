"use client";

import { Trash2, Users } from "lucide-react";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import type { WishlistEntry } from "@/api/wishlist/types";

type WishlistUsersTableProps = {
    entries: WishlistEntry[];
    onRemove: (entryId: string) => Promise<void>;
    removingId?: string | null;
};

export default function WishlistUsersTable({
    entries,
    onRemove,
    removingId,
}: WishlistUsersTableProps) {
    const Colors = useColors();

    if (entries.length === 0) {
        return (
            <div
                className={`rounded-2xl p-8 text-center ${Colors.background.primary} ${Colors.border.specialThin}`}
            >
                <Users className={`mx-auto mb-3 ${Colors.text.special}`} size={28} />
                <p className={`text-sm ${Colors.text.secondary}`}>
                    No users added in this wishlist yet.
                </p>
            </div>
        );
    }

    return (
        <div className={`overflow-hidden rounded-2xl ${Colors.background.primary} ${Colors.border.specialThin}`}>
            <div className={`grid grid-cols-12 px-4 py-3 text-xs uppercase ${Colors.text.secondary} ${Colors.border.defaultThinBottom}`}>
                <span className="col-span-4">Name</span>
                <span className="col-span-4">Email</span>
                <span className="col-span-3">Username</span>
                <span className="col-span-1 text-right">Action</span>
            </div>

            <div>
                {entries.map((entry, idx) => (
                    <div
                        key={entry.id}
                        className={`grid grid-cols-12 items-center px-4 py-3 ${idx < entries.length - 1 ? Colors.border.defaultThinBottom : ""}`}
                    >
                        <span className={`col-span-4 text-sm ${Colors.text.primary}`}>
                            {entry.candidate?.name || "Unknown User"}
                        </span>
                        <span className={`col-span-4 truncate text-sm ${Colors.text.secondary}`}>
                            {entry.candidate?.email || "-"}
                        </span>
                        <span className={`col-span-3 text-sm ${Colors.text.secondary}`}>
                            {entry.candidate?.username || entry.candidateId}
                        </span>
                        <div className="col-span-1 flex justify-end">
                            <button
                                onClick={() => onRemove(entry.id)}
                                disabled={removingId === entry.id}
                                className={`rounded-md p-2 ${Colors.properties.interactiveButton} ${Colors.text.secondary} ${Colors.hover.textSpecial} disabled:opacity-50`}
                                title="Remove from wishlist"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
