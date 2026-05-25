"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useColors } from "@/components/General/(Color Manager)/useColors";

export default function Wishlists() {
  const Colors = useColors();
  const router = useRouter();
  const [totalWishlists, setTotalWishlists] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchWishlistsCount() {
      try {
        const res = await axiosInstance.get("/api/v1/interviewers/get-profile");
        if (mounted) {
          const wishlists = Array.isArray(res.data?.data?.wishlists)
            ? res.data.data.wishlists
            : [];
          setTotalWishlists(wishlists.length);
        }
      } catch (error) {
        console.error("Failed to fetch wishlists count", error);
        if (mounted) {
          setTotalWishlists(0);
        }
      }
    }

    fetchWishlistsCount();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <button
      onClick={() => router.push("/interviewer-dashboard/wishlist")}
      type="button"
      className={`
      group
      cursor-pointer
      rounded-xl
      border ${Colors.border.fadedThin}
      ${Colors.background.secondary}
      p-4
      h-full
      w-full
      flex flex-col justify-between
      text-left
      transition-all duration-200
      hover:border-white/20
      hover:bg-white/6
      hover:-translate-y-0.5 font-mono
    `}
    >
      <div className="flex items-start justify-between gap-3 font-mono">
        <div>
          <p
            className={`text-xs uppercase tracking-[0.2em] ${Colors.text.secondary}`}
          >
            Total Wishlists
          </p>
          <h2 className={`mt-2 text-3xl font-semibold ${Colors.text.primary}`}>
            {totalWishlists === null ? "--" : totalWishlists}
          </h2>
        </div>

        <div
          className={`rounded-full border border-white/10 px-3 py-1 text-xs ${Colors.text.secondary}`}
        >
          View all
        </div>
      </div>

      <div className="mt-4">
        <p className={`text-sm ${Colors.text.primary} font-medium`}>
          Wishlists
        </p>
        <p className={`text-sm ${Colors.text.secondary} mt-1`}>
          View and manage Wishlists.
        </p>
      </div>
    </button>
  );
}
