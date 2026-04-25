"use client";

import { useColors } from "@/components/General/(Color Manager)/useColors";
import type { UIEvent } from "react";

type Project = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  skills: string[];
  githubLink?: string;
  liveLink?: string;
};

type Props = {
  projects: Project[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

export default function SuggestedProjects({
  projects,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}: Props) {
  const Colors = useColors();

  const onProjectsScroll = (event: UIEvent<HTMLDivElement>) => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    const node = event.currentTarget;
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;

    if (remaining < 160) {
      onLoadMore();
    }
  };

  return (
    <div
      className={`
        rounded-2xl p-3 sm:p-4
        ${Colors.background.secondary}
        ${Colors.border.defaultThin}
      `}
    >
      <h2 className={`text-base sm:text-lg font-semibold mb-3 ${Colors.text.primary}`}>
        Suggested Projects
      </h2>

      {loading ? (
        <p className={`text-sm ${Colors.text.secondary}`}>Loading suggestions...</p>
      ) : projects.length === 0 ? (
        <p className={`text-sm ${Colors.text.secondary}`}>No recommendations found</p>
      ) : (
        <div
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1"
          onScroll={onProjectsScroll}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className={`
                group rounded-xl shadow-sm overflow-hidden
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:shadow-xl
                ${Colors.background.primary}
                ${Colors.border.defaultThin}
              `}
            >
              <div className={`h-40 w-full overflow-hidden ${Colors.background.accent}`}>
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={`${project.title} cover`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-sm ${Colors.text.secondary}`}>
                    No cover image
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className={`text-lg font-bold line-clamp-1 transition-colors duration-300 ${Colors.text.primary}`}>
                  {project.title}
                </h3>

                <p className={`mt-2 text-sm line-clamp-3 transition-opacity duration-300 ${Colors.text.secondary}`}>
                  {project.description?.trim() || "No description available."}
                </p>

                {project.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.skills.slice(0, 6).map((skill) => (
                      <span
                        key={`${project.id}-${skill}`}
                        className={`px-2.5 py-1 rounded-full text-xs cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 ${Colors.background.accent} ${Colors.text.inverted} ${Colors.border.defaultThin}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-3 flex-wrap">
                {project.githubLink && (
                    <span
                      className={`
                      text-sm px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:scale-105
                      ${Colors.border.defaultThin}
                      ${Colors.text.primary}
                    `}
                  >
                    GitHub
                    </span>
                )}

                {project.liveLink && (
                    <span
                      className={`
                      text-sm px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:scale-105
                      ${Colors.background.special}
                      ${Colors.text.inverted}
                    `}
                  >
                    Live
                    </span>
                )}
                </div>
              </div>
            </div>
          ))}

          {loadingMore && (
            <div className={`xl:col-span-2 text-center text-sm py-2 ${Colors.text.secondary}`}>
              Loading more projects...
            </div>
          )}

          {!hasMore && (
            <div className={`xl:col-span-2 text-center text-sm py-2 ${Colors.text.secondary}`}>
              End of project suggestions.
            </div>
          )}
        </div>
      )}
    </div>
  );
}