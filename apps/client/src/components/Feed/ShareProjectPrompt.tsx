"use client";

import { useColors } from "@/components/General/(Color Manager)/useColors";
import { ArrowRight, BookOpen, Github, ImageIcon } from "lucide-react";

export default function ShareProjectPrompt() {
  const Colors = useColors();

  return (
    <div
      className={`
        rounded-2xl p-4 sm:p-5
        ${Colors.background.secondary}
        ${Colors.border.defaultThin}
      `}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
            ${Colors.background.accent}
            ${Colors.text.secondary}
            ${Colors.border.defaultThin}
          `}
        >
          U
        </div>

        <button
          type="button"
          className={`
            flex-1 px-4 py-3 rounded-full text-left text-sm sm:text-base
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
            rounded-xl px-3 py-2 text-sm flex items-center gap-2
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
            rounded-xl px-3 py-2 text-sm flex items-center gap-2
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
            rounded-xl px-3 py-2 text-sm flex items-center gap-2
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
  );
}
