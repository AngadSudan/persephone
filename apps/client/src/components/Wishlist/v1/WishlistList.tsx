"use client";

import Link from "next/link";
import { ChevronRight, ListChecks } from "lucide-react";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import type { Wishlist } from "@/api/wishlist/types";

type WishlistListProps = {
    wishlists: Wishlist[];
    loading?: boolean;
};

export default function WishlistList({
    wishlists,
    loading = false,
}: WishlistListProps) {
    const Colors = useColors();

    if (loading) {
        return (
            <div
                className={`rounded-2xl p-8 text-center ${Colors.background.primary} ${Colors.border.specialThin}`}
            >
                <p className={`text-sm ${Colors.text.secondary}`}>Loading wishlists...</p>
            </div>
        );
    }

    if (wishlists.length === 0) {
        return (
            <div
                className={`rounded-2xl p-8 text-center ${Colors.background.primary} ${Colors.border.specialThin}`}
            >
                <ListChecks className={`mx-auto mb-3 ${Colors.text.special}`} size={28} />
                <p className={`text-sm ${Colors.text.secondary}`}>
                    No wishlists yet. Create one to start organizing candidates.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {wishlists.map((wishlist) => (
                <Link
                    key={wishlist.id}
                    href={`/wishlist/${wishlist.id}`}
                    className={`group rounded-2xl p-5 ${Colors.background.primary} ${Colors.border.specialThin} ${Colors.properties.interactiveButton}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className={`text-lg font-semibold ${Colors.text.primary}`}>
                                {wishlist.name}
                            </h3>
                            <p className={`mt-2 line-clamp-2 text-sm ${Colors.text.secondary}`}>
                                {wishlist.description || "No description"}
                            </p>
                        </div>

                        <ChevronRight
                            size={16}
                            className={`mt-1 transition-transform group-hover:translate-x-1 ${Colors.text.special}`}
                        />
                    </div>
                </Link>
            ))}
        </div>
    );
}
