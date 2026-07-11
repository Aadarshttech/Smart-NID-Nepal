/**
 * AI extraction function — calls Google Gemini with a citizenship
 * certificate image and returns structured extraction data.
 *
 * Security: The image buffer is used only for the API call and
 * is never logged, stored, or persisted.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXTRACT_CITIZENSHIP_PROMPT } from "../prompts/extractCitizenship.js";
import type { ExtractionResult } from "../types/extraction.js";

// Keep track of which key to use next (Round-Robin)
let currentKeyIndex = 0;

const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

function isSupportedMimeType(mime: string): mime is SupportedMimeType {
  return SUPPORTED_MIME_TYPES.includes(mime as SupportedMimeType);
}

/**
 * Extract citizenship certificate data from images using Gemini Vision
 *
 * @param frontBuffer - Raw image buffer of front side
 * @param frontMimeType - MIME type of front image
 * @param backBuffer - Raw image buffer of back side
 * @param backMimeType - MIME type of back image
 * @returns Parsed ExtractionResult
 */
export async function extractCitizenship(
  frontBuffer: Buffer,
  frontMimeType: string,
  backBuffer: Buffer,
  backMimeType: string
): Promise<ExtractionResult> {
  const envKeys = process.env.GEMINI_API_KEY;
  if (!envKeys) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const apiKeys = envKeys.split(',').map(k => k.trim()).filter(Boolean);
  if (apiKeys.length === 0) {
    throw new Error("No valid API keys found in GEMINI_API_KEY");
  }

  if (!isSupportedMimeType(frontMimeType) || !isSupportedMimeType(backMimeType)) {
    throw new Error(
      `Unsupported image type. Supported: ${SUPPORTED_MIME_TYPES.join(", ")}`
    );
  }

  const frontBase64 = frontBuffer.toString("base64");
  const backBase64 = backBuffer.toString("base64");

  let lastError: any;
  let text = "";

  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const key = apiKeys[currentKeyIndex];
    
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent([
        EXTRACT_CITIZENSHIP_PROMPT,
        {
          inlineData: {
            mimeType: frontMimeType,
            data: frontBase64,
          },
        },
        {
          inlineData: {
            mimeType: backMimeType,
            data: backBase64,
          },
        },
      ]);
      
      text = result.response.text();
      // If we succeed, we break out of the loop and keep the currentKeyIndex
      break;
      
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err.status === 429 || (err.message && (err.message.includes('429') || err.message.includes('quota')));
      const isAuthError = err.status === 401 || err.status === 403 || (err.message && err.message.includes('API_KEY_INVALID'));

      if (isRateLimit || isAuthError) {
        console.warn(`[extract] API Key at index ${currentKeyIndex} failed (${isRateLimit ? 'Rate Limit/Quota' : 'Auth Error'}). Switching to next key.`);
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        continue;
      }
      
      // If it's a generic bad request (like bad image formatting), fail immediately
      throw err;
    }
  }

  if (!text) {
    throw new Error(`All configured API keys failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }



  // Clean the response — remove any markdown code fences if present
  const cleanedText = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let parsed: ExtractionResult;
  try {
    parsed = JSON.parse(cleanedText) as ExtractionResult;
  } catch (err) {
    console.error("[extract] ❌ Failed to parse JSON. Raw AI response was:");
    console.error("--- RAW TEXT START ---");
    console.error(text);
    console.error("--- RAW TEXT END ---");
    console.error("--- CLEANED TEXT START ---");
    console.error(cleanedText);
    console.error("--- CLEANED TEXT END ---");
    throw new Error(
      "AI returned invalid JSON. The image may not be a citizenship certificate."
    );
  }

  // Ensure confidence is a valid number between 0 and 1
  if (typeof parsed.confidence !== "number" || isNaN(parsed.confidence)) {
    parsed.confidence = 0.5;
  }
  parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

  return parsed;
}
