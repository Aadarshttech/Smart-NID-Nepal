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
 * Extract citizenship certificate data from an image using Gemini Vision
 *
 * @param imageBuffer - Raw image buffer (JPEG/PNG/WEBP)
 * @param mimeType - MIME type of the image
 * @returns Parsed ExtractionResult
 */
export async function extractCitizenship(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!isSupportedMimeType(mimeType)) {
    throw new Error(
      `Unsupported image type: ${mimeType}. Supported: ${SUPPORTED_MIME_TYPES.join(", ")}`
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,   // Low temperature for accurate OCR
      maxOutputTokens: 2048,
    },
  });

  const base64Image = imageBuffer.toString("base64");

  const result = await model.generateContent([
    EXTRACT_CITIZENSHIP_PROMPT,
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    },
  ]);

  const response = result.response;
  const text = response.text();

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
