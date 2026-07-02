/**
 * DoNIDCR Auto-Fill Script Generator
 *
 * Generates a self-contained JavaScript snippet that, when pasted into the
 * browser console on enrollment.donidcr.gov.np, automatically fills all
 * form fields with the extracted citizenship data.
 *
 * The generated script handles:
 * - Text inputs with proper event dispatching
 * - Select dropdowns with change event triggering
 * - Date inputs
 * - Fuzzy district matching
 */

import type { ExtractionResult } from "../types/extraction";
import { findDistrictValue, mapGender } from "./districtMap";

/**
 * Convert a DOB from YYYY-MM-DD to MM/DD/YYYY for the AD date input.
 * DoNIDCR date input expects the native HTML date format (YYYY-MM-DD).
 */
function formatDateForInput(dateStr: string): string {
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return dateStr;
}

/**
 * Generate the auto-fill JavaScript snippet for DoNIDCR.
 *
 * @param data - The extracted (or user-edited draft) citizenship data
 * @returns A self-contained JavaScript string ready to paste into the console
 */
export function generateAutoFillScript(data: ExtractionResult): string {
  const birthDistrictVal = findDistrictValue(data.birthPlace);
  const issuingDistrictVal = findDistrictValue(data.issuingDistrict);
  const permanentDistrictVal = findDistrictValue(data.permanentAddress.district);
  const genderVal = mapGender(data.gender);
  const dobAD = formatDateForInput(data.dobAD);

  // Build an array of field assignments as JS statements
  const lines: string[] = [];

  lines.push(`// ═══════════════════════════════════════════════════════`);
  lines.push(`// Smart NID Nepal — DoNIDCR Auto-Fill Script`);
  lines.push(`// Generated at: ${new Date().toISOString()}`);
  lines.push(`// ═══════════════════════════════════════════════════════`);
  lines.push(``);
  lines.push(`(function() {`);
  lines.push(`  'use strict';`);
  lines.push(``);
  lines.push(`  // Helper: set a text input value and dispatch events`);
  lines.push(`  function setText(id, value) {`);
  lines.push(`    const el = document.getElementById(id);`);
  lines.push(`    if (!el) { console.warn('⚠️ Field not found:', id); return; }`);
  lines.push(`    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;`);
  lines.push(`    nativeInputValueSetter.call(el, value);`);
  lines.push(`    el.dispatchEvent(new Event('input', { bubbles: true }));`);
  lines.push(`    el.dispatchEvent(new Event('change', { bubbles: true }));`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  // Helper: set a select dropdown value and dispatch events`);
  lines.push(`  function setSelect(id, value) {`);
  lines.push(`    const el = document.getElementById(id);`);
  lines.push(`    if (!el) { console.warn('⚠️ Select not found:', id); return; }`);
  lines.push(`    el.value = value;`);
  lines.push(`    el.dispatchEvent(new Event('change', { bubbles: true }));`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  // Helper: set a date input`);
  lines.push(`  function setDate(id, value) {`);
  lines.push(`    const el = document.getElementById(id);`);
  lines.push(`    if (!el) { console.warn('⚠️ Date field not found:', id); return; }`);
  lines.push(`    el.value = value;`);
  lines.push(`    el.dispatchEvent(new Event('input', { bubbles: true }));`);
  lines.push(`    el.dispatchEvent(new Event('change', { bubbles: true }));`);
  lines.push(`  }`);
  lines.push(``);

  // ── Tab 1: Applicant Data ──
  lines.push(`  // ── Tab 1: Applicant Data ──`);
  lines.push(`  setText('firstNameLoc', ${JSON.stringify(data.firstName.nepali)});`);
  lines.push(`  setText('firstName', ${JSON.stringify(data.firstName.english)});`);
  lines.push(`  setText('middleNameLoc', ${JSON.stringify(data.middleName.nepali)});`);
  lines.push(`  setText('middleName', ${JSON.stringify(data.middleName.english)});`);
  lines.push(`  setText('lastNameLoc', ${JSON.stringify(data.lastName.nepali)});`);
  lines.push(`  setText('lastName', ${JSON.stringify(data.lastName.english)});`);
  lines.push(`  setText('dobLoc', ${JSON.stringify(data.dobBS)});`);
  lines.push(`  setDate('dob', ${JSON.stringify(dobAD)});`);

  if (birthDistrictVal) {
    lines.push(`  setSelect('birthDistrictPlace', ${JSON.stringify(birthDistrictVal)});`);
  }

  // Default CC Type to "Citizenship by Descent" (val=1) — most common
  lines.push(`  setSelect('ccType', '1');`);

  lines.push(`  setText('ccNumberLoc', ${JSON.stringify(data.citizenshipNo)});`);

  if (issuingDistrictVal) {
    lines.push(`  setSelect('ccIssuingDistrict', ${JSON.stringify(issuingDistrictVal)});`);
  }

  lines.push(`  setText('ccIssuingDateLoc', ${JSON.stringify(data.issueDateBS)});`);

  if (genderVal) {
    lines.push(`  setSelect('gender', ${JSON.stringify(genderVal)});`);
  }

  // Default father status to KNOWN
  lines.push(`  setSelect('fatherStatus', '1');`);

  lines.push(``);

  // ── Tab 3: Family Details ──
  // Father's name — split into first/middle/last
  lines.push(`  // ── Tab 3: Family Details ──`);
  const fatherNpParts = splitName(data.fatherName.nepali);
  const fatherEnParts = splitName(data.fatherName.english);
  lines.push(`  setText('fFnLoc', ${JSON.stringify(fatherNpParts.first)});`);
  lines.push(`  setText('fMnLoc', ${JSON.stringify(fatherNpParts.middle)});`);
  lines.push(`  setText('fLnLoc', ${JSON.stringify(fatherNpParts.last)});`);
  lines.push(`  setText('fFn', ${JSON.stringify(fatherEnParts.first)});`);
  lines.push(`  setText('fMn', ${JSON.stringify(fatherEnParts.middle)});`);
  lines.push(`  setText('fLn', ${JSON.stringify(fatherEnParts.last)});`);

  // Mother's name
  const motherNpParts = splitName(data.motherName.nepali);
  const motherEnParts = splitName(data.motherName.english);
  lines.push(`  setText('mFnLoc', ${JSON.stringify(motherNpParts.first)});`);
  lines.push(`  setText('mMnLoc', ${JSON.stringify(motherNpParts.middle)});`);
  lines.push(`  setText('mLnLoc', ${JSON.stringify(motherNpParts.last)});`);
  lines.push(`  setText('mFn', ${JSON.stringify(motherEnParts.first)});`);
  lines.push(`  setText('mMn', ${JSON.stringify(motherEnParts.middle)});`);
  lines.push(`  setText('mLn', ${JSON.stringify(motherEnParts.last)});`);

  // Grandfather's name
  const gfNpParts = splitName(data.grandfatherName.nepali);
  const gfEnParts = splitName(data.grandfatherName.english);
  lines.push(`  setText('gfFnLoc', ${JSON.stringify(gfNpParts.first)});`);
  lines.push(`  setText('gfMnLoc', ${JSON.stringify(gfNpParts.middle)});`);
  lines.push(`  setText('gfLnLoc', ${JSON.stringify(gfNpParts.last)});`);
  lines.push(`  setText('gfFn', ${JSON.stringify(gfEnParts.first)});`);
  lines.push(`  setText('gfMn', ${JSON.stringify(gfEnParts.middle)});`);
  lines.push(`  setText('gfLn', ${JSON.stringify(gfEnParts.last)});`);

  lines.push(``);

  // ── Tab 2: Contact Details (Permanent Address) ──
  if (permanentDistrictVal) {
    lines.push(`  // ── Tab 2: Contact Details (Permanent Address) ──`);
    lines.push(`  // Note: District dropdown may need province to be set first.`);
    lines.push(`  // The script attempts to set the district; if the municipality`);
    lines.push(`  // dropdown doesn't populate, set the province manually first.`);
    lines.push(`  setSelect('pDistrict', ${JSON.stringify(permanentDistrictVal)});`);
  }
  if (data.permanentAddress.wardNo) {
    lines.push(`  setText('pWardNo', ${JSON.stringify(data.permanentAddress.wardNo)});`);
  }

  lines.push(``);
  lines.push(`  console.log('✅ Smart NID Nepal: All available fields filled successfully!');`);
  lines.push(`  console.log('📋 Please review each tab and fill any remaining fields manually.');`);
  lines.push(`  alert('✅ Smart NID Nepal Auto-Fill Complete!\\n\\nPlease review each tab and fill remaining fields (marital status, education, profession, caste, religion, etc.) manually.');`);
  lines.push(`})();`);

  return lines.join("\n");
}

/**
 * Split a full name string into first/middle/last parts.
 * Assumes format: "FirstName MiddleName LastName" or "FirstName LastName"
 */
function splitName(fullName: string): { first: string; middle: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(" "),
    last: parts[parts.length - 1],
  };
}
