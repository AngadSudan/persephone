"use client";

import { UserPlus, Github, Linkedin } from "lucide-react";
import toast from "react-hot-toast";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const openUserProfile = (user: User) => {
    const identifier = user.username || user.id;
    if (!identifier) return;
    router.push(`/u/${identifier}`);
  };

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
        w-full max-w-full overflow-hidden
        ${Colors.background.primary}
        ${Colors.border.defaultThin}
        rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm
      `}
    >
      <h2 className={`${Colors.text.primary} font-semibold text-sm sm:text-base`}>
        Suggested Connections
      </h2>

      <div className="w-full max-w-full flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide pb-1">
        {users.map((user) => (
          <div
            key={user.id}
            className={`
              min-w-59 shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col
              ${Colors.background.secondary}
              ${Colors.border.defaultThin}
            `}
          >
            {/* 🔹 Banner */}
            <button
              type="button"
              onClick={() => openUserProfile(user)}
              className={`h-12 w-full relative text-left cursor-pointer ${Colors.background.accent}`}
            >
              {user.bannerUrl && (
                <img
                  src={user.bannerUrl}
                  alt="banner"
                  className="h-full w-full object-cover"
                />
              )}

              {/* Avatar */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <div className={`w-20 h-20 rounded-full border-[3px] border-(--bg-secondary) overflow-hidden ${Colors.background.accent} flex items-center justify-center text-xl font-semibold ${Colors.text.secondary}`}>
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
            </button>

            {/* 🔹 Content */}
            <div className="pt-14 px-3 pb-3 flex flex-col gap-1.5 text-center">
              <button
                type="button"
                onClick={() => openUserProfile(user)}
                className={`font-semibold text-[13px] leading-5 uppercase tracking-[0.2px] cursor-pointer ${Colors.text.primary} ${Colors.hover.textSpecial}`}
              >
                {user.name}
              </button>

              {!!user.username && (
                <button
                  type="button"
                  onClick={() => openUserProfile(user)}
                  className={`text-[12px] -mt-0.5 cursor-pointer ${Colors.text.secondary} ${Colors.hover.textSpecial}`}
                >
                  @{user.username}
                </button>
              )}

              {/* Headline */}
              <p className={`text-[12px] leading-5 min-h-9.5 line-clamp-2 px-1 ${Colors.text.secondary}`}>
                {user.headline?.trim() || "No professional headline added yet"}
              </p>

              {/* CTA */}
              <button
                onClick={() => makeFriends(user.id)}
                className={`
                  mt-2 flex items-center justify-center gap-1.5 text-[13px] font-semibold py-1.5 rounded-full cursor-pointer
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
                      onClick={(event) => event.stopPropagation()}
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
                      onClick={(event) => event.stopPropagation()}
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