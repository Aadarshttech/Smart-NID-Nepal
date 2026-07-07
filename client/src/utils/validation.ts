/**
 * Utility functions for form validation.
 */

/**
 * Checks if a string contains any English alphabet characters.
 * @param str The string to check
 * @returns true if English characters are found, false otherwise
 */
export function containsEnglishChars(str: string): boolean {
  if (!str) return false;
  return /[a-zA-Z]/.test(str);
}
