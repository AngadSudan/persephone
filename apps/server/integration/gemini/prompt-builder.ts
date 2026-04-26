export function buildResumeParsingPrompt(resumeText: string): string {
  return `
You are a high-accuracy resume data extraction engine.

Your task is to extract structured information from the resume text and return ONLY valid YAML.
Do NOT include any explanation, markdown, or extra text.

If a value is truly not present anywhere in the resume, use "" or [].
However, you MUST extract all relevant information even if formatting is inconsistent.

Extract the following fields:

---
name: ""
email: ""
phone: ""
headline: ""
linkedinUrl: ""
portfolioUrl: ""
githubUrl: ""

education:
  - degree: ""
    institution: ""
    fieldOfStudy: ""
    startYear: ""
    endYear: ""
    grade: ""
    isOngoing: false
    description: ""

experience:
  - companyName: ""
    jobTitle: ""
    startDate: ""
    endDate: ""
    description: ""
    jobType: "OFFLINE"

projects:
  - title: ""
    description: ""
    techStack: []
    projectUrl: ""
    repositoryUrl: ""

skills:
  - category: ""
    items: []
---

Rules:

- Output ONLY the YAML block above. No extra text.
- Do NOT use markdown fences.

- Extract ALL relevant information present in the resume, even if:
  - formatting is inconsistent
  - sections are not clearly labeled
  - information is spread across bullet points

- Section detection guidance:
  - Experience may appear under: "Experience", "Work History", "Internships"
  - Projects may appear under: "Projects", "Personal Work", "Academic Projects"
  - Skills may appear under: "Skills", "Technologies", "Tech Stack", or inside project/experience descriptions

- Skills extraction:
  - Extract ALL skills mentioned anywhere in the resume
  - Include technologies found in projects and experience descriptions
  - Group them into meaningful categories (e.g., Languages, Backend, Frontend, Tools)

- Projects extraction:
  - Extract ALL projects listed
  - Infer techStack from description if explicitly mentioned

- Experience extraction:
  - Extract ALL roles, including internships and freelance work

- Dates:
  - Use format YYYY or YYYY-MM or YYYY-MM-DD
  - NEVER use "Present" or "Current"
  - If ongoing, leave endDate as ""

- isOngoing:
  - true only if clearly ongoing
  - otherwise false

- Descriptions:
  - Keep concise (2–4 lines)
  - Do NOT hallucinate
  - You MAY summarize slightly for clarity

- Only leave a field empty if it is absolutely not present anywhere in the resume.

Resume text:
"""
${resumeText}
"""
`.trim();
}