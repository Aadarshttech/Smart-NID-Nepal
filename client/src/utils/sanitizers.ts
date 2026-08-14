/**
 * Data Sanitization & Formatting Utils
 * Used to strictly enforce DoNIDCR optimal payload standards.
 */

/**
 * Sanitizes an English name:
 * 1. Removes all spaces (e.g., "s udarshan" -> "sudarshan")
 * 2. Converts to UPPERCASE
 */
export function sanitizeEnglishName(name?: string): string {
  if (!name) return "";
  return name.replace(/\s/g, '').toUpperCase();
}

/**
 * Sanitizes a Nepali name:
 * 1. Removes all spaces (first/last names usually don't have spaces)
 */
export function sanitizeNepaliName(name?: string): string {
  if (!name) return "";
  return name.replace(/\s/g, '');
}

/**
 * Sanitizes mobile number to exactly 10 digits.
 */
export function sanitizeMobileNo(val?: string): string {
  if (!val) return "";
  let clean = val.replace(/\D/g, '');
  if (clean.length > 10 && (clean.startsWith('977') || clean.startsWith('0977'))) {
    clean = clean.replace(/^(0?977)/, '');
  }
  return clean.substring(0, 10);
}

/**
 * Sanitizes telephone number to max 9 digits.
 */
export function sanitizeTelephoneNo(val?: string): string {
  if (!val) return "";
  let clean = val.replace(/\D/g, '');
  if (clean.length > 9 && (clean.startsWith('977') || clean.startsWith('0977'))) {
    clean = clean.replace(/^(0?977)/, '');
  }
  return clean.substring(0, 9);
}

/**
 * Formats BS date string to YYYY-MM-DD
 */
export function formatBSDate(val?: string): string {
  if (!val) return "";
  let cleanDate = val.replace(/[\/\.]/g, '-');
  return cleanDate; // More robust formatting happens during export, but we can do basic replace here
}
