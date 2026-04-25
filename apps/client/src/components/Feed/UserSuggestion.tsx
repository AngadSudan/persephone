"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type User = {
  id: string;
  name: string;
  tagline: string;
};

export default function UserSuggestionsStrip() {
  const Colors = useColors();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${backendUrl}/api/v1/recommendations/recommend-user?page=1`,
        {
          credentials: "include",
        }
      );

      const result = await res.json();
      setUsers(result.data.slice(0, 5)); // only 5 suggestions
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const makeFriends = async (friendId: string) => {
    const toastId = toast.loading("Connecting...");

    try {
      const res = await fetch(
        `${backendUrl}/api/v1/users/friends`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ friendId }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast.success("Connected!", { id: toastId });

      // remove from suggestions
      setUsers((prev) => prev.filter((u) => u.id !== friendId));
    } catch (error) {
      toast.error("Failed to connect", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="text-sm opacity-50 font-mono">
        Loading suggestions...
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div
      className={`
        ${Colors.background.primary}
        ${Colors.border.defaultThin}
        rounded-xl p-4
        flex flex-col gap-3
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`${Colors.text.primary} font-semibold text-sm`}>
          Suggested Connections
        </h2>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {users.map((user) => (
          <div
            key={user.id}
            className={`
              min-w-[180px]
              ${Colors.background.secondary}
              ${Colors.border.defaultThin}
              rounded-xl p-3
              flex flex-col gap-2
            `}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm">
              {user.name?.charAt(0)}
            </div>

            {/* Info */}
            <div>
              <p className={`${Colors.text.primary} text-sm font-semibold`}>
                {user.name}
              </p>
              <p className={`${Colors.text.secondary} text-xs`}>
                {user.tagline || "No tagline"}
              </p>
            </div>

            {/* Button */}
            <button
              onClick={() => makeFriends(user.id)}
              className={`
                mt-1 flex items-center justify-center gap-1
                text-xs px-2 py-1 rounded-md
                ${Colors.background.special}
                ${Colors.text.inverted}
                ${Colors.properties.interactiveButton}
              `}
            >
              <UserPlus size={12} />
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}