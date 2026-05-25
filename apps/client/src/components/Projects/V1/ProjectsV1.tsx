"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useColors } from "../../General/(Color Manager)/useColors";
import ProjectCard from "./ProjectCard";
import Spinner from "@/components/General/Spinner";
import AddProjectModal from "./AddProjectModal";
import type { Project } from "@/../server/utils/type";
import { ArrowLeftIcon, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/General/Sidebar";

const PAGE_SIZE = 6;

export default function ProjectsV1() {
  const Colors = useColors();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const router = useRouter();

  // Add a ref to track if initial load is done
  const isInitialLoad = useRef(true);
  
  // Track current request to prevent stale responses
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track request ID to ignore stale responses from previous requests
  const requestIdRef = useRef(0);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const getUserProjectsByBatch = useCallback(
    async (currentOffset: number) => {
      if (loading || !hasMore) return;

      // Cancel previous request if still in flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Increment request ID to track this specific request
      const currentRequestId = ++requestIdRef.current;

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          offset: currentOffset.toString(),
          pageSize: PAGE_SIZE.toString(),
        }).toString();

        const res = await fetch(
          `${backendUrl}/api/v1/projects/get-projects-by-batch?${queryParams}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            signal: abortController.signal,  // Pass abort signal
          },
        );

        // Ignore response if this is a stale request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch projects");

        const result = await res.json();
        const newProjects = result.data;

        // Double-check this is still the current request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (newProjects.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setProjects((prev) => [...prev, ...newProjects]);
        // Update offset based on the currentOffset we fetched, not diff
        setOffset(currentOffset + PAGE_SIZE);
      } catch (error: any) {
        // Ignore abort errors (expected when canceling requests)
        if (error.name === "AbortError") {
          return;
        }
        console.error("Error fetching project batch:", error);
      } finally {
        // Only update loading if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [loading, hasMore, backendUrl],
  );

  // Cleanup: Cancel requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initial Load
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      getUserProjectsByBatch(0);
    }
  }, [getUserProjectsByBatch]);

  // Intersection Observer
  useEffect(() => {
    // Don't set up observer until after initial load
    if (isInitialLoad.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          getUserProjectsByBatch(offset);
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [offset, hasMore, loading, getUserProjectsByBatch]); // Keep getUserProjectsByBatch out of deps

  const handleRefresh = () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Reset request ID
    requestIdRef.current++;
    
    setProjects([]);
    setOffset(0);
    setHasMore(true);
    isInitialLoad.current = true;
    getUserProjectsByBatch(0);
  };

  return (
    <div
      className={`${Colors.text.primary} ${Colors.background.primary} min-h-screen w-full overflow-hidden font-mono tracking-tight`}
    >
      <div className="grid h-[calc(100vh-2.5rem)] min-h-0 w-full grid-cols-1 gap-4 p-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:p-6">
        <aside className="min-h-0 h-full">
          <Sidebar />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          <div
            className={`${Colors.background.secondary} flex items-center justify-between rounded-xl p-4`}
          >
            <div className="flex items-center gap-3">
              <button
                className={`${Colors.text.primary} ${Colors.background.primary} ${Colors.properties.interactiveButton} rounded-md p-2 font-semibold`}
                onClick={() => router.back()}
              >
                <ArrowLeftIcon size={26} />
              </button>
              <h1 className="text-2xl font-semibold">Projects</h1>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className={`${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} rounded-lg px-4 py-2 font-semibold`}
            >
              Add New Project
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {projects.length === 0 && !loading ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={`group mt-12 mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors ${Colors.border.specialThick} ${Colors.properties.interactiveButton}`}
                aria-label="Add a new project"
              >
                <div className={`rounded-full p-4 ${Colors.background.secondary}`}>
                  <FolderPlus size={36} className={`${Colors.text.special} opacity-80 transition-opacity group-hover:opacity-100`} />
                </div>
                <p className="text-base font-semibold">Start your first project</p>
                <p className={`${Colors.text.secondary} text-sm`}>
                  Click to open the add project modal.
                </p>
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project: Project, index) => (
                  <ProjectCard key={`${project.id}-${index}`} project={project} />
                ))}
              </div>
            )}

            <div
              ref={observerRef}
              className="flex min-h-10 w-full justify-center py-8"
            >
              {loading && <Spinner />}
            </div>
          </div>
        </main>
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
