"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useInterviewer } from "@/store/interviewer-store";
import { createWishlist } from "@/api/wishlist/create-wishlist";
import { getWishlistsByUser } from "@/api/wishlist/get-wishlists-by-user";
import type { Wishlist } from "@/api/wishlist/types";
import WishlistHeader from "./WishlistHeader";
import WishlistList from "./WishlistList";
import CreateWishlistModal from "./CreateWishlistModal";

export default function WishlistPageClient() {
    const { info, hasHydrated } = useInterviewer();
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);

    const fetchWishlists = async () => {
        if (!info?.id) {
            setWishlists([]);
            setLoading(false);
            return;
        }
        console.log("Calling APIIIIIIIIiiii")
        try {
            setLoading(true);
            const data = await getWishlistsByUser(info?.id as string);
            console.log(data, "dataaaaaaaaaaa")
            setWishlists(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load wishlists.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!info?.id) return;
        fetchWishlists();
    }, [hasHydrated, info?.id]);

    const handleCreateWishlist = async (payload: {
        name: string;
        description?: string;
    }) => {
        try {
            await createWishlist(payload);
            toast.success("Wishlist created successfully.");
            await fetchWishlists();
        } catch (error) {
            console.error(error);
            toast.error("Could not create wishlist.");
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            <WishlistHeader
                title="Wishlist"
                subtitle="Create and manage candidate wishlists"
                buttonLabel="Create Wishlist"
                onCreateClick={() => setOpenCreate(true)}
            />

            <WishlistList wishlists={wishlists} loading={loading} />

            <CreateWishlistModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreate={handleCreateWishlist}
            />
        </div>
    );
}
