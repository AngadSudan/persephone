"use client";

import { UserPlus, Github, Linkedin } from "lucide-react";
import toast from "react-hot-toast";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type Project = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  tagline?: string;
  userInfo?: string;

  username?: string;
  profileUrl?: string;
  bannerUrl?: string;
  headline?: string;

  githubUrl?: string;
  linkedinUrl?: string;

  projects?: Project[];
};

type Props = {
  users: User[];
  loading: boolean;
  onRemoveUser: (id: string) => void;
};

export default function UserSuggestionsStrip({
  users,
  loading,
  onRemoveUser,
}: Props) {
  const Colors = useColors();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
      onRemoveUser(friendId);
    } catch (error) {
      toast.error("Failed to connect", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className={`text-sm opacity-60 font-mono ${Colors.text.secondary}`}>
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
        rounded-xl p-3 flex flex-col gap-3
      `}
    >
      <h2 className={`${Colors.text.primary} font-semibold text-sm`}>
        Suggested Connections
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {users.map((user) => (
          <div
            key={user.id}
            className={`
              min-w-[228px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col
              ${Colors.background.secondary}
              ${Colors.border.defaultThin}
            `}
          >
            {/* 🔹 Banner */}
            <div className={`h-12 w-full relative ${Colors.background.accent}`}>
              {user.bannerUrl && (
                <img
                  src={user.bannerUrl}
                  alt="banner"
                  className="h-full w-full object-cover"
                />
              )}

              {/* Avatar */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <div className={`w-20 h-20 rounded-full border-[3px] border-[var(--bg-secondary)] overflow-hidden ${Colors.background.accent} flex items-center justify-center text-xl font-semibold ${Colors.text.secondary}`}>
                  {user.profileUrl ? (
                    <img
                      src={user.profileUrl}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0)
                  )}
                </div>
              </div>
            </div>

            {/* 🔹 Content */}
            <div className="pt-14 px-3 pb-3 flex flex-col gap-1.5 text-center">
              <p className={`font-semibold text-[13px] leading-5 uppercase tracking-[0.2px] ${Colors.text.primary}`}>
                {user.name}
              </p>

              {!!user.username && (
                <p className={`text-[12px] -mt-0.5 ${Colors.text.secondary}`}>
                  @{user.username}
                </p>
              )}

              {/* Headline */}
              <p className={`text-[12px] leading-5 min-h-[38px] line-clamp-2 px-1 ${Colors.text.secondary}`}>
                {user.headline?.trim() || "No professional headline added yet"}
              </p>

              {/* CTA */}
              <button
                onClick={() => makeFriends(user.id)}
                className={`
                  mt-2 flex items-center justify-center gap-1.5 text-[13px] font-semibold py-1.5 rounded-full
                  ${Colors.background.special}
                  ${Colors.text.inverted}
                  ${Colors.properties.interactiveButton}
                `}
              >
                <UserPlus size={14} />
                Connect
              </button>

              {(user.githubUrl || user.linkedinUrl) && (
                <div className="mt-1 flex items-center justify-center gap-2">
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 rounded-md ${Colors.text.secondary} ${Colors.hover.textSpecial}`}
                      aria-label="GitHub profile"
                    >
                      <Github size={14} />
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 rounded-md ${Colors.text.secondary} ${Colors.hover.textSpecial}`}
                      aria-label="LinkedIn profile"
                    >
                      <Linkedin size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}