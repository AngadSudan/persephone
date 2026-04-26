import { buildResumeParsingPrompt } from "./prompt-builder";

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30_000;

interface GeminiCandidate {
  content: { parts: { text: string }[] };
  finishReason: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message: string; code: number };
}

// ── Main entry point ─────────────────────────────────────────
export async function callGeminiForResumeParsing(
  resumeText: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const prompt = buildResumeParsingPrompt(resumeText);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const yamlText = await callGeminiAPI(prompt, apiKey);
      return yamlText;
    } catch (err: any) {
      const isRetryable = isRetryableError(err);
      const isLastAttempt = attempt === MAX_RETRIES;

      if (!isRetryable || isLastAttempt) {
        throw new Error(`Gemini API failed after ${attempt} attempt(s): ${err.message}`);
      }

      const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.warn(`[Gemini] Attempt ${attempt} failed (${err.message}). Retrying in ${delayMs}ms…`);
      await sleep(delayMs);
    }
  }

  // TypeScript: unreachable, but keeps the compiler happy
  throw new Error('Gemini: exhausted all retries.');
}

// ── Raw API call ──────────────────────────────────────────────
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.0,       // ZERO temperature → deterministic, no hallucination
          topP: 1,
          maxOutputTokens: 4096,
          // No responseMimeType: Gemini will return plain text per our prompt
        },
        safetySettings: [
          // Disable safety blocks that may wrongly flag resume content
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const rawData: unknown = await response.json();
  const data = rawData as GeminiResponse;

  // HTTP-level error
  if (!response.ok) {
    const msg = data.error?.message ?? `HTTP ${response.status}`;
    throw Object.assign(new Error(msg), { status: response.status });
  }

  // Gemini returned an error block inside a 200
  if (data.error) {
    throw Object.assign(new Error(data.error.message), { status: data.error.code });
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error('Gemini returned no candidates.');
  }

  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Gemini blocked the response for safety reasons.');
  }

  const text = candidate.content?.parts?.[0]?.text ?? '';
  if (!text.trim()) {
    throw new Error('Gemini returned an empty text response.');
  }

  // Strip accidental markdown fences if the model ignored our instruction
  return stripMarkdownFences(text);
}

// ── Helpers ───────────────────────────────────────────────────
function isRetryableError(err: any): boolean {
  // 429 = rate limit, 503 = overloaded, AbortError = timeout
  const status = err?.status as number | undefined;
  return status === 429 || status === 503 || err?.name === 'AbortError';
}

function stripMarkdownFences(text: string): string {
  // Handles ```yaml ... ``` or ``` ... ```
  return text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}