export enum JOB_TYPE {
  REMOTE = "REMOTE",
  OFFLINE = "OFFLINE",
  HYBRID = "HYBRID",
  FREELANCE = "FREELANCE",
}

export enum JOB_TIMELINE {
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export enum PUBLISH_STATUS {
  PUBLISHED = "PUBLISHED",
  NOT_PUBLISHED = "NOT_PUBLISHED",
}

type UserUpdateInput = {
  name?: string;
  headline?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
};

type UserExperienceCreateInput = {
  userId: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  startDate: Date;
  endDate?: Date;
  isOngoing: JOB_TIMELINE;
  jobType: JOB_TYPE;
};

type ProjectCreateInput = {
  ownerId: string;
  title: string;
  description: string;
  projectUrl?: string | null;
  repositoryUrl?: string | null;
  skills: string[];
  publishStatus: PUBLISH_STATUS;
  visibility: "PUBLIC";
};

import type {
  ParsedResume,
  ParsedExperience,
  ParsedProject,
} from "../utils/type";

export function mapUserUpdate(
  parsed: ParsedResume,
  existingUser: {
    name: string;
    headline: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    githubUrl: string | null;
  },
  warnings: string[],
): UserUpdateInput {
  const update: UserUpdateInput = {};

  if (parsed.name && !existingUser.name) update.name = parsed.name;
  if (parsed.headline && !existingUser.headline) update.headline = parsed.headline;
  if (parsed.linkedinUrl && !existingUser.linkedinUrl) update.linkedinUrl = parsed.linkedinUrl;
  if (parsed.portfolioUrl && !existingUser.portfolioUrl) update.portfolioUrl = parsed.portfolioUrl;
  if (parsed.githubUrl && !existingUser.githubUrl) update.githubUrl = parsed.githubUrl;

  if (Object.keys(update).length === 0) {
    warnings.push("User record had no empty fields to update.");
  }

  return update;
}

export function mapExperiences(
  experiences: ParsedExperience[],
  userId: string,
  existingExperiences: { companyName: string; startDate: Date }[],
  warnings: string[],
): UserExperienceCreateInput[] {
  const results: UserExperienceCreateInput[] = [];

  for (const exp of experiences) {
    if (!exp.companyName || !exp.jobTitle) {
      warnings.push("Skipping experience with missing fields.");
      continue;
    }

    const startDate = parseFlexibleDate(exp.startDate, "startDate", warnings);
    if (!startDate) continue;

    const alreadyExists = existingExperiences.some(
      (e) =>
        e.companyName.toLowerCase() === exp.companyName.toLowerCase() &&
        isSameYearMonth(e.startDate, startDate),
    );

    if (alreadyExists) {
      warnings.push(`Duplicate experience: ${exp.companyName}`);
      continue;
    }

    const endDate = exp.endDate
      ? parseFlexibleDate(exp.endDate, "endDate", warnings)
      : null;

    results.push({
      userId,
      companyName: exp.companyName,
      jobTitle: exp.jobTitle,
      jobDescription: exp.description || "",
      startDate,
      endDate: endDate ?? undefined,
      isOngoing: endDate ? JOB_TIMELINE.COMPLETED : JOB_TIMELINE.ONGOING,
      jobType: mapJobType(exp.jobType),
    });
  }

  return results;
}

export function mapProjects(
  projects: ParsedProject[],
  userId: string,
  existingTitles: string[],
  warnings: string[],
): ProjectCreateInput[] {
  const results: ProjectCreateInput[] = [];

  for (const proj of projects) {
    if (!proj.title) {
      warnings.push("Skipping project with empty title.");
      continue;
    }

    const exists = existingTitles.some(
      (t) => t.toLowerCase() === proj.title.toLowerCase(),
    );

    if (exists) {
      warnings.push(`Duplicate project: ${proj.title}`);
      continue;
    }

    results.push({
      ownerId: userId,
      title: proj.title,
      description: proj.description || "",
      projectUrl: proj.projectUrl || null,
      repositoryUrl: proj.repositoryUrl || null,
      skills: proj.techStack,
      publishStatus: PUBLISH_STATUS.PUBLISHED,
      visibility: "PUBLIC",
    });
  }

  return results;
}

function parseFlexibleDate(
  raw: string,
  field: string,
  warnings: string[],
): Date | null {
  if (!raw) return null;

  const s = raw.trim();

  if (/^\d{4}$/.test(s)) return new Date(`${s}-01-01`);
  if (/^\d{4}-\d{2}$/.test(s)) return new Date(`${s}-01`);

  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  warnings.push(`${field}: invalid date "${raw}"`);
  return null;
}

function isSameYearMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth();
}

function mapJobType(raw?: string): JOB_TYPE {
  const map: Record<string, JOB_TYPE> = {
    REMOTE: JOB_TYPE.REMOTE,
    OFFLINE: JOB_TYPE.OFFLINE,
    HYBRID: JOB_TYPE.HYBRID,
    FREELANCE: JOB_TYPE.FREELANCE,
  };

  return map[raw?.toUpperCase() ?? ""] ?? JOB_TYPE.OFFLINE;
}