"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/store/user-store";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { ArrowRight, BookOpen, Github, ImageIcon } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import AddProjectModal from "@/components/Projects/V1/AddProjectModal";

export default function ShareProjectPrompt() {
  const Colors = useColors();
  const router = useRouter();
  const currentUser = useUserStore((state) => state.info);
  const [githubAvatar, setGithubAvatar] = useState<string>("");
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId) return;

    const loadUserAvatar = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/users/profile/${userId}?fresh=1`);
        setGithubAvatar(res?.data?.data?.githubAvatar || "");
      } catch {
        setGithubAvatar("");
      }
    };

    loadUserAvatar();
  }, [currentUser?.id]);

  const avatarUrl = useMemo(() => {
    if (currentUser?.profileUrl) {
      return currentUser.profileUrl;
    }

    if (githubAvatar) {
      return githubAvatar;
    }

    const safeName = encodeURIComponent(currentUser?.name || "User");
    return `https://ui-avatars.com/api/?name=${safeName}&background=random`;
  }, [currentUser?.name, currentUser?.profileUrl, githubAvatar]);

  return (
    <>
      <div
        onClick={() => setIsAddProjectOpen(true)}
        className={`
        rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer
        ${Colors.background.secondary}
        ${Colors.border.defaultThin}
      `}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              router.push("/profile");
            }}
            className={`
            w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-lg font-semibold cursor-pointer
            ${Colors.background.accent}
            ${Colors.text.secondary}
            ${Colors.border.defaultThin}
          `}
          >
            <img
              src={avatarUrl}
              alt={currentUser?.name || "Current user"}
              className="h-full w-full object-cover"
            />
          </button>

          <button
            type="button"
            className={`
            flex-1 px-4 py-3 rounded-full text-left text-sm sm:text-base shadow-sm cursor-pointer
            flex items-center justify-between
            ${Colors.background.primary}
            ${Colors.border.defaultThin}
            ${Colors.text.secondary}
            ${Colors.properties.interactiveButton}
          `}
          >
            <span>Share your project</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div
            className={`
            rounded-xl px-3 py-2 text-sm flex items-center gap-2 shadow-sm
            ${Colors.background.primary}
            ${Colors.border.defaultThin}
            ${Colors.text.secondary}
          `}
          >
            <ImageIcon size={16} />
            Snippets
          </div>

          <div
            className={`
            rounded-xl px-3 py-2 text-sm flex items-center gap-2 shadow-sm
            ${Colors.background.primary}
            ${Colors.border.defaultThin}
            ${Colors.text.secondary}
          `}
          >
            <Github size={16} />
            GitHub Repo
          </div>

          <div
            className={`
            rounded-xl px-3 py-2 text-sm flex items-center gap-2 shadow-sm
            ${Colors.background.primary}
            ${Colors.border.defaultThin}
            ${Colors.text.secondary}
          `}
          >
            <BookOpen size={16} />
            Case Study
          </div>
        </div>
      </div>
      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onSuccess={() => {}}
      />
    </>
  );
}
