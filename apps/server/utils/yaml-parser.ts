import yaml from 'js-yaml';
import type { ParsedResume, ParsedEducation, ParsedExperience, ParsedProject, ParsedSkillGroup } from '../utils/type';

// ── Public entry point ────────────────────────────────────────
export function parseAndValidateYAML(rawYaml: string): {
  parsed: ParsedResume;
  warnings: string[];
} {
  let raw: unknown;

  try {
    raw = yaml.load(rawYaml);
  } catch (err: any) {
    throw new Error(`YAML parsing failed: ${err.message}`);
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('YAML did not produce a valid object. Gemini may have returned non-YAML content.');
  }

  return normaliseAndValidate(raw as Record<string, unknown>);
}

// ── Normalise + validate ──────────────────────────────────────
function normaliseAndValidate(raw: Record<string, unknown>): {
  parsed: ParsedResume;
  warnings: string[];
} {
  const warnings: string[] = [];

  const parsed: ParsedResume = {
    name:         safeString(raw.name,         'name',         warnings),
    email:        safeString(raw.email,        'email',        warnings),
    phone:        safeString(raw.phone,        'phone',        warnings),
    headline:     safeString(raw.headline,     'headline',     warnings),
    linkedinUrl:  safeString(raw.linkedinUrl,  'linkedinUrl',  warnings),
    portfolioUrl: safeString(raw.portfolioUrl, 'portfolioUrl', warnings),
    githubUrl:    safeString(raw.githubUrl,    'githubUrl',    warnings),
    education:    normaliseEducation(raw.education,   warnings),
    experience:   normaliseExperience(raw.experience, warnings),
    projects:     normaliseProjects(raw.projects,     warnings),
    skills:       normaliseSkills(raw.skills,         warnings),
  };

  // Required field check – email is critical for user lookup
  if (!parsed.email) {
    warnings.push('Email was not found in the resume. User mapping will require a manual email.');
  }

  return { parsed, warnings };
}

// ── Education 
function normaliseEducation(raw: unknown, warnings: string[]): ParsedEducation[] {
  if (!Array.isArray(raw)) {
    if (raw) warnings.push('education field was not an array – skipped.');
    return [];
  }

  return raw.map((item: any, i) => ({
    degree:       safeString(item?.degree,       `education[${i}].degree`,       warnings),
    institution:  safeString(item?.institution,  `education[${i}].institution`,  warnings),
    fieldOfStudy: safeString(item?.fieldOfStudy, `education[${i}].fieldOfStudy`, warnings),
    startYear:    safeString(item?.startYear,    `education[${i}].startYear`,    warnings),
    endYear:      safeString(item?.endYear,      `education[${i}].endYear`,      warnings),
    grade:        safeString(item?.grade,        `education[${i}].grade`,        warnings),
    description:  safeString(item?.description,  `education[${i}].description`,  warnings),
    isOngoing:    typeof item?.isOngoing === 'boolean' ? item.isOngoing : false,
  }));
}

// ── Experience 
function normaliseExperience(raw: unknown, warnings: string[]): ParsedExperience[] {
  if (!Array.isArray(raw)) {
    if (raw) warnings.push('experience field was not an array – skipped.');
    return [];
  }

  return raw.map((item: any, i) => {
    const jobType = normaliseJobType(item?.jobType, i, warnings);
    return {
      companyName:  safeString(item?.companyName, `experience[${i}].companyName`, warnings),
      jobTitle:     safeString(item?.jobTitle,    `experience[${i}].jobTitle`,    warnings),
      startDate:    safeString(item?.startDate,   `experience[${i}].startDate`,   warnings),
      endDate:      safeString(item?.endDate,     `experience[${i}].endDate`,     warnings),
      description:  safeString(item?.description, `experience[${i}].description`, warnings),
      jobType,
    };
  });
}

// ── Projects 
function normaliseProjects(raw: unknown, warnings: string[]): ParsedProject[] {
  if (!Array.isArray(raw)) {
    if (raw) warnings.push('projects field was not an array – skipped.');
    return [];
  }

  return raw.map((item: any, i) => ({
    title:         safeString(item?.title,         `projects[${i}].title`,         warnings),
    description:   safeString(item?.description,   `projects[${i}].description`,   warnings),
    techStack:     safeStringArray(item?.techStack, `projects[${i}].techStack`,     warnings),
    projectUrl:    safeString(item?.projectUrl,    `projects[${i}].projectUrl`,    warnings),
    repositoryUrl: safeString(item?.repositoryUrl, `projects[${i}].repositoryUrl`, warnings),
  }));
}

// ── Skills 
function normaliseSkills(raw: unknown, warnings: string[]): ParsedSkillGroup[] {
  if (!Array.isArray(raw)) {
    if (raw) warnings.push('skills field was not an array – skipped.');
    return [];
  }

  return raw.map((item: any, i) => ({
    category: safeString(item?.category, `skills[${i}].category`, warnings),
    items:    safeStringArray(item?.items, `skills[${i}].items`,  warnings),
  }));
}

// ── Micro-helpers 
function safeString(
  val: unknown,
  field: string,
  warnings: string[],
): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val); // year returned as integer
  warnings.push(`${field} had unexpected type "${typeof val}" – coerced to string.`);
  return String(val).trim();
}

function safeStringArray(
  val: unknown,
  field: string,
  warnings: string[],
): string[] {
  if (!Array.isArray(val)) {
    if (val) warnings.push(`${field} was not an array – skipped.`);
    return [];
  }
  return val
    .map((v, i) => safeString(v, `${field}[${i}]`, warnings))
    .filter(Boolean);
}

const VALID_JOB_TYPES = ['REMOTE', 'OFFLINE', 'HYBRID', 'FREELANCE'] as const;
function normaliseJobType(
  val: unknown,
  i: number,
  warnings: string[],
): ParsedExperience['jobType'] {
  const upper = String(val ?? '').toUpperCase();
  if (VALID_JOB_TYPES.includes(upper as any)) return upper as ParsedExperience['jobType'];
  warnings.push(`experience[${i}].jobType "${val}" is not valid – defaulting to OFFLINE.`);
  return 'OFFLINE';
}