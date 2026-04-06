"use client";

import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import UserSuggestionsStrip from "./UserSuggestion";
import SuggestedProjects from "./ProjectSuggestions";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import ShareProjectPrompt from "@/components/Feed/ShareProjectPrompt";

type User = {
    id: string;
    name: string;
    tagline: string;
};

type Project = {
    id: string;
    title: string;
    description?: string;
    coverImage?: string;
    skills: string[];
    githubLink?: string;
    liveLink?: string;
};

type RecommendedProject = {
    id: string;
};

type EnrichedUser = {
    id: string;
    name: string;
    tagline: string;

    username?: string;
    profileUrl?: string;
    bannerUrl?: string;
    headline?: string;
    userInfo?: string;
    githubAvatar?: string;

    githubUrl?: string;
    linkedinUrl?: string;

    projects?: any[];
};

const Feed = () => {
    const Colors = useColors();
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);
    const [page, setPage] = useState(1);

    // 🔹 Fetch Users
    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await axiosInstance.get(
                `/api/v1/recommendations/recommend-user?page=1`
            );

            const result = res.data;
            setUsers(result.data?.slice(0, 5) || []);
        } catch (err) {
            console.error(err);
        } finally {
            setUsersLoading(false);
        }
    };

    // 🔹 Fetch Projects
    const fetchProjects = useCallback(async (pageNumber: number) => {
        if (pageNumber === 1) {
            setProjectsLoading(true);
        } else {
            setLoadingMoreProjects(true);
        }

        try {
            const res = await axiosInstance.get(
                `/api/v1/recommendations/recommend-project?page=${pageNumber}`
            );

            const result = res.data;
            const recommendedProjects: RecommendedProject[] = Array.isArray(result.data)
                ? result.data
                : [];
            const recommendedProjectIds = recommendedProjects
                .map((project) => project?.id)
                .filter((id): id is string => typeof id === "string" && id.length > 0);

            console.groupCollapsed(`[Feed] recommend-project page=${pageNumber}`);
            console.log("Raw recommend-project response:", result);
            console.log("Recommended projects list:", recommendedProjects);
            console.log("Recommended project IDs:", recommendedProjectIds);
            console.groupEnd();

            if (recommendedProjectIds.length === 0) {
                setHasMoreProjects(false);
                if (pageNumber === 1) {
                    setProjects([]);
                }
                return;
            }

            const detailResponses = await Promise.allSettled(
                recommendedProjectIds.map((projectId) =>
                    axiosInstance.get(`/api/v1/projects/get-project/${projectId}`)
                )
            );

            detailResponses.forEach((response, index) => {
                const projectId = recommendedProjectIds[index];

                if (response.status === "fulfilled") {
                    console.groupCollapsed(`[Feed] get-project success id=${projectId}`);
                    console.log("Status:", response.value.status);
                    console.log("Payload:", response.value.data);
                    console.groupEnd();
                    return;
                }

                const reason = response.reason as {
                    message?: string;
                    response?: {
                        status?: number;
                        data?: unknown;
                    };
                };

                console.groupCollapsed(`[Feed] get-project failed id=${projectId}`);
                console.log("Error message:", reason?.message);
                console.log("Status:", reason?.response?.status);
                console.log("Error payload:", reason?.response?.data);
                console.groupEnd();
            });

            const incomingProjects: Project[] = detailResponses.flatMap((response) => {
                const detail = response.status === "fulfilled"
                    ? response.value?.data?.data
                    : null;

                if (!detail?.id) {
                    return [];
                }

                return [{
                    id: detail.id,
                    title: detail.title ?? "Untitled Project",
                    description: detail.description ?? "",
                    coverImage: detail?.coverImage,
                    skills: Array.isArray(detail?.skills) ? detail.skills : [],
                    githubLink: detail?.repositoryUrl,
                    liveLink: detail?.projectUrl,
                }];
            });

            if (incomingProjects.length === 0) {
                setHasMoreProjects(false);
                if (pageNumber === 1) {
                    setProjects([]);
                }
                return;
            }

            setHasMoreProjects(true);
            setProjects((prev) => {
                if (pageNumber === 1) {
                    return incomingProjects;
                }

                const existingIds = new Set(prev.map((item) => item.id));
                const dedupedIncoming = incomingProjects.filter(
                    (item: Project) => !existingIds.has(item.id)
                );

                return [...prev, ...dedupedIncoming];
            });
        } catch (err) {
            console.error(err);
            if (pageNumber === 1) {
                setProjects([]);
            }
        } finally {
            setProjectsLoading(false);
            setLoadingMoreProjects(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchProjects(page);
    }, [page, fetchProjects]);

    const [enrichedUsers, setEnrichedUsers] = useState<EnrichedUser[]>([]);


    // Fetched user data
    const fetchUserData = async (usersList: User[]) => {
        try {
            const responses = await Promise.all(
                usersList.map(async (user) => {
                    try {
                        const primary = await axiosInstance.get(
                            `/api/v1/users/profile/${user.id}?fresh=1`
                        );

                        if (primary?.data?.data) {
                            return primary.data.data;
                        }
                    } catch {
                        // Continue to fallback lookup below.
                    }

                    const fallbackIdentifier = user.name?.trim();
                    if (!fallbackIdentifier) return null;

                    try {
                        const fallback = await axiosInstance.get(
                            `/api/v1/users/profile/${encodeURIComponent(
                                fallbackIdentifier
                            )}?fresh=1`
                        );
                        return fallback?.data?.data ?? null;
                    } catch {
                        return null;
                    }
                })
            );

            // Keep feed suggestions visible even if some profile lookups fail or return null.
            const fullUsers = responses.map((profile, index) => {
                const baseUser = usersList[index];

                return {
                    id: profile?.id ?? baseUser?.id,
                    name: profile?.name ?? baseUser?.name ?? "Unknown User",
                    tagline: profile?.tagline ?? baseUser?.tagline ?? "",

                    username: profile?.username,
                    profileUrl: profile?.profileUrl ?? profile?.githubAvatar,
                    bannerUrl: profile?.bannerUrl,
                    headline: profile?.headline,
                    userInfo:
                        typeof profile?.userInfo === "string"
                            ? profile.userInfo
                            : undefined,
                    githubAvatar: profile?.githubAvatar,

                    githubUrl: profile?.githubUrl,
                    linkedinUrl: profile?.linkedinUrl,

                    projects: profile?.projects,
                };
            });

            setEnrichedUsers(fullUsers);
        } catch (error) {
            console.error("Error fetching full user data", error);
        }
    };

    useEffect(() => {
        if (users.length > 0) {
            fetchUserData(users);
        }
    }, [users]);

    // 🔹 Remove user after connect
    const removeUser = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    const loadMoreProjects = useCallback(() => {
        if (projectsLoading || loadingMoreProjects || !hasMoreProjects) {
            return;
        }

        setPage((prev) => prev + 1);
    }, [projectsLoading, loadingMoreProjects, hasMoreProjects]);

    return (
        <div className={`w-full ${Colors.background.primary} ${Colors.text.primary}`}>
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
                <div className="hidden lg:block">
                    <div
                        className={`h-[calc(100vh-2rem)] rounded-2xl ${Colors.border.defaultThin} ${Colors.background.secondary}`}
                    >
                        {/* Placeholder for future universal navbar */}
                    </div>
                </div>

                <div className="h-[calc(100vh-2rem)] overflow-y-auto pr-1 space-y-4">
                    <ShareProjectPrompt />

                    <UserSuggestionsStrip
                        users={enrichedUsers}
                        loading={usersLoading}
                        onRemoveUser={removeUser}
                    />

                    <SuggestedProjects
                        projects={projects}
                        loading={projectsLoading}
                        loadingMore={loadingMoreProjects}
                        hasMore={hasMoreProjects}
                        onLoadMore={loadMoreProjects}
                    />
                </div>
            </div>
        </div>
    );
};

export default Feed;