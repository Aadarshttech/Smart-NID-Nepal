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
  // Convert slashes or dots to hyphens
  let cleanDate = val.replace(/[\/\.]/g, '-');
  
  // Try to parse parts if it's separated by hyphens
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    let year = parts[0];
    let month = parts[1];
    let day = parts[2];

    // If day is first (e.g. DD-MM-YYYY), swap it
    if (year.length <= 2 && parts[2].length === 4) {
      year = parts[2];
      day = parts[0];
    }

    // Zero pad month and day
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // If there are no separators and it's 8 digits long (e.g., 20550504)
  const digitsOnly = cleanDate.replace(/\D/g, '');
  if (digitsOnly.length === 8) {
    return `${digitsOnly.substring(0, 4)}-${digitsOnly.substring(4, 6)}-${digitsOnly.substring(6, 8)}`;
  }

  // Fallback to the original cleaned string if we couldn't parse it cleanly
  return cleanDate;
}
