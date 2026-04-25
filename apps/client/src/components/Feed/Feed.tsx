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
    owner?: {
        id: string;
        name: string;
        username?: string;
        profileUrl?: string;
        githubAvatar?: string;
    };
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

type FeedProjectRecord = {
    id?: string;
    title?: string;
    description?: string;
    coverImage?: string;
    skills?: string[];
    repositoryUrl?: string;
    projectUrl?: string;
    githubLink?: string;
    liveLink?: string;
    owner?: {
        id?: string;
        name?: string;
        username?: string;
        profileUrl?: string;
        githubAvatar?: string;
    };
};

type FeedUserRecord = {
    id?: string;
    name?: string;
    tagline?: string;
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

const normalizeProject = (project: FeedProjectRecord): Project | null => {
    if (!project?.id) {
        return null;
    }

    return {
        id: project.id,
        title: project.title ?? "Untitled Project",
        description: project.description ?? "",
        coverImage: project.coverImage,
        skills: Array.isArray(project.skills) ? project.skills : [],
        githubLink: project.repositoryUrl ?? project.githubLink,
        liveLink: project.projectUrl ?? project.liveLink,
        owner: project.owner?.id
            ? {
                id: project.owner.id,
                name: project.owner.name ?? "Unknown User",
                username: project.owner.username,
                profileUrl: project.owner.profileUrl,
                githubAvatar: project.owner.githubAvatar,
            }
            : undefined,
    };
};

const normalizeUser = (
    profile: FeedUserRecord | null | undefined,
    baseUser?: User,
): EnrichedUser => ({
    id: profile?.id ?? baseUser?.id ?? "",
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
});

const Feed = () => {
    const Colors = useColors();
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);
    const [page, setPage] = useState(1);

    const fetchFallbackProjects = useCallback(async () => {
        const res = await axiosInstance.get("/api/v1/projects/feed-projects");
        const result = res.data;
        const fallbackProjects: FeedProjectRecord[] = Array.isArray(result.data)
            ? result.data
            : [];

        return fallbackProjects
            .map((project) => normalizeProject(project))
            .filter((project): project is Project => project !== null);
    }, []);

    const fetchFallbackUsers = useCallback(async () => {
        const res = await axiosInstance.get("/api/v1/users/feed-users");
        const result = res.data;
        const fallbackUsers: FeedUserRecord[] = Array.isArray(result.data)
            ? result.data
            : [];

        return fallbackUsers.map((profile) => normalizeUser(profile));
    }, []);

    // 🔹 Fetch Users
    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const res = await axiosInstance.get(
                `/api/v1/recommendations/recommend-user?page=1`
            );

            const result = res.data;
            const recommendedUsers = Array.isArray(result.data)
                ? result.data.slice(0, 5)
                : [];

            if (recommendedUsers.length === 0) {
                const fallbackUsers = await fetchFallbackUsers();
                setUsers([]);
                setEnrichedUsers(fallbackUsers);
                return;
            }

            setUsers(recommendedUsers);
        } catch (err) {
            console.error(err);
            try {
                const fallbackUsers = await fetchFallbackUsers();
                setUsers([]);
                setEnrichedUsers(fallbackUsers);
            } catch (fallbackError) {
                console.error(fallbackError);
            }
        } finally {
            setUsersLoading(false);
        }
    }, [fetchFallbackUsers]);

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
                if (pageNumber === 1) {
                    const fallbackProjects = await fetchFallbackProjects();
                    setProjects(fallbackProjects);
                }
                setHasMoreProjects(false);
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

                const normalizedProject = normalizeProject(detail);

                return normalizedProject ? [normalizedProject] : [];
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
                try {
                    const fallbackProjects = await fetchFallbackProjects();
                    setProjects(fallbackProjects);
                    setHasMoreProjects(false);
                } catch (fallbackError) {
                    console.error(fallbackError);
                    setProjects([]);
                }
            }
        } finally {
            setProjectsLoading(false);
            setLoadingMoreProjects(false);
        }
    }, [fetchFallbackProjects]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchProjects(page);
    }, [page, fetchProjects]);

    const [enrichedUsers, setEnrichedUsers] = useState<EnrichedUser[]>([]);


    // Fetched user data
    const fetchUserData = useCallback(async (usersList: User[]) => {
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
            const fullUsers = responses.map((profile, index) =>
                normalizeUser(profile, usersList[index])
            );

            setEnrichedUsers(fullUsers);
        } catch (error) {
            console.error("Error fetching full user data", error);
        }
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            fetchUserData(users);
        }
    }, [fetchUserData, users]);

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
        <div className={`w-full overflow-x-hidden ${Colors.background.primary} ${Colors.text.primary}`}>
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 lg:gap-6">
                <div className="hidden lg:block">
                    <div
                        className={`rounded-2xl mt-4 min-h-[80vh] shadow-sm ${Colors.border.defaultThin} ${Colors.background.secondary}`}
                    >
                        {/* Placeholder for future universal navbar */}
                    </div>
                </div>

                <div className="min-w-0 w-full pr-1 pt-4 pb-8 space-y-5 sm:space-y-6">
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