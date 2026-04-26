import prisma from '@codex/prisma';
import { extractTextFromBuffer } from './text-extractor.service';
import { callGeminiForResumeParsing } from '../integration/gemini/gemini.service';
import { parseAndValidateYAML } from '../utils/yaml-parser';
import {
  mapUserUpdate,
  mapExperiences,
  mapProjects,
} from './resume-mapper.service';
import type { ResumeParseResult } from '../utils/type';

export async function parseAndStoreResume(
  userId: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<ResumeParseResult> {
  const allWarnings: string[] = [];

  console.log(`[ResumeParser] Extracting text for user ${userId}`);
  const { text } = await extractTextFromBuffer(fileBuffer, mimeType);

  console.log('[ResumeParser] Sending to Gemini…');
  const rawYaml = await callGeminiForResumeParsing(text);

  console.log('[ResumeParser] Parsing YAML response…');
  const { parsed, warnings: parseWarnings } = parseAndValidateYAML(rawYaml);
  allWarnings.push(...parseWarnings);

  // ── STEP 4: Fetch existing data for dedup checks ─────────
  console.log('[ResumeParser] Fetching existing user data for dedup…');

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      headline: true,
      linkedinUrl: true,
      portfolioUrl: true,
      githubUrl: true,
      userExperiences: {
        select: { companyName: true, startDate: true },
      },
      projects: {
        select: { title: true },
      },
    },
  });

  if (!existingUser) {
    throw new Error(`User ${userId} not found. Cannot store parsed resume.`);
  }

  const userUpdate = mapUserUpdate(parsed, existingUser, allWarnings);

  const experienceInputs = mapExperiences(
    parsed.experience,
    userId,
    existingUser.userExperiences,
    allWarnings,
  );

  const projectInputs = mapProjects(
    parsed.projects,
    userId,
    existingUser.projects.map((p) => p.title),
    allWarnings,
  );

  // ── STEP 6: Persist in a transaction ─────────────────────
  console.log('[ResumeParser] Persisting to database…');

  await prisma.$transaction(async (tx) => {
    // Update user basic info
    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userUpdate,
      });
    }

    // Bulk-insert experiences
    if (experienceInputs.length > 0) {
      await tx.userExperience.createMany({
        data: experienceInputs,
      });
    }

    // Bulk-insert projects
    if (projectInputs.length > 0) {
      await tx.projects.createMany({
        data: projectInputs,
      });
    }
  });

  console.log('[ResumeParser] Done.');

  return {
    success: true,
    userId,
    parsed,
    saved: {
      userUpdated: Object.keys(userUpdate).length > 0,
      experiencesCreated: experienceInputs.length,
      projectsCreated: projectInputs.length,
    },
    warnings: allWarnings,
  };
}