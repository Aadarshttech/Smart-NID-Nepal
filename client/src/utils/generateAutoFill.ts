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

import type { ExtractionResult, AdditionalFields } from "../types/extraction";
import { findDistrictValue, mapGender, getProvinceFromDistrictId } from "./districtMap";

export interface AutoFillInstruction {
  id: string;
  type: 'text' | 'select' | 'date';
  value: string;
}

/**
 * Convert Nepali digits (०-९) to English digits (0-9).
 * Used for date fields on the DoNIDCR portal, which expects standard digits.
 */
function nepaliToEnglishDigits(str: string): string {
  if (!str) return "";
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return str.replace(/[०-९]/g, (match) => {
    return nepaliDigits.indexOf(match).toString();
  });
}

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
 * @param additional - The user-entered additional fields
 * @returns A self-contained JavaScript string ready to paste into the console
 */
export function generateAutoFillScript(data: ExtractionResult, additional: AdditionalFields): string {
  const birthDistrictVal = findDistrictValue(data.birthPlace);
  const issuingDistrictVal = findDistrictValue(data.issuingDistrict);
  const permanentDistrictVal = findDistrictValue(data.permanentAddress.district);
  const tempDistrictVal = additional.temporaryAddressSameAsPermanent
    ? permanentDistrictVal
    : findDistrictValue(additional.temporaryAddress.district);
  
  const genderVal = mapGender(data.gender);
  const dobAD = formatDateForInput(data.dobAD);
  const dobBS_EN = nepaliToEnglishDigits(data.dobBS);
  const issueDateBS_EN = nepaliToEnglishDigits(data.issueDateBS);

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
  lines.push(`    if (!value) return;`);
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
  lines.push(`    if (!value) return;`);
  lines.push(`    const el = document.getElementById(id);`);
  lines.push(`    if (!el) { console.warn('⚠️ Select not found:', id); return; }`);
  lines.push(`    el.value = value;`);
  lines.push(`    el.dispatchEvent(new Event('change', { bubbles: true }));`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  // Helper: set a date input`);
  lines.push(`  function setDate(id, value) {`);
  lines.push(`    if (!value) return;`);
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
  lines.push(`  setText('dobLoc', ${JSON.stringify(dobBS_EN)});`);
  lines.push(`  setDate('dob', ${JSON.stringify(dobAD)});`);

  if (birthDistrictVal) lines.push(`  setSelect('birthDistrictPlace', ${JSON.stringify(birthDistrictVal)});`);
  lines.push(`  setSelect('ccType', ${JSON.stringify(additional.ccType || '1')});`);
  lines.push(`  setText('ccNumberLoc', ${JSON.stringify(data.citizenshipNo)});`);
  if (issuingDistrictVal) lines.push(`  setSelect('ccIssuingDistrict', ${JSON.stringify(issuingDistrictVal)});`);
  lines.push(`  setText('ccIssuingDateLoc', ${JSON.stringify(issueDateBS_EN)});`);
  if (genderVal) lines.push(`  setSelect('gender', ${JSON.stringify(genderVal)});`);

  // Additional Applicant Fields
  lines.push(`  setSelect('maritalStatus', ${JSON.stringify(additional.maritalStatus)});`);
  lines.push(`  setSelect('educationLevel', ${JSON.stringify(additional.educationLevel)});`);
  lines.push(`  setSelect('profession', ${JSON.stringify(additional.profession)});`);
  lines.push(`  setSelect('caste', ${JSON.stringify(additional.caste)});`);
  lines.push(`  setSelect('religion', ${JSON.stringify(additional.religion)});`);

  // Default father status to KNOWN
  lines.push(`  setSelect('fatherStatus', '1');`);

  lines.push(``);

  // ── Tab 2: Contact Details (Permanent Address) ──
  lines.push(`  // ── Tab 2: Contact Details ──`);
  lines.push(`  setText('mobileNo', ${JSON.stringify(additional.mobileNo)});`);
  lines.push(`  setText('phoneNo', ${JSON.stringify(additional.phoneNo)});`);
  
  if (permanentDistrictVal) lines.push(`  setSelect('pDistrict', ${JSON.stringify(permanentDistrictVal)});`);
  lines.push(`  setText('pWardNo', ${JSON.stringify(data.permanentAddress.wardNo)});`);
  lines.push(`  setText('pToleLoc', ${JSON.stringify(data.permanentAddress.villageToleNp)});`);
  lines.push(`  setText('pTole', ${JSON.stringify(data.permanentAddress.villageToleEn)});`);

  if (additional.temporaryAddressSameAsPermanent) {
    lines.push(`  const pSame = document.getElementById('pSameAsTemp');`);
    lines.push(`  if (pSame && !pSame.checked) { pSame.click(); }`);
  } else {
    if (tempDistrictVal) lines.push(`  setSelect('tDistrict', ${JSON.stringify(tempDistrictVal)});`);
    lines.push(`  setText('tWardNo', ${JSON.stringify(additional.temporaryAddress.wardNo)});`);
    lines.push(`  setText('tToleLoc', ${JSON.stringify(additional.temporaryAddress.villageToleNp)});`);
    lines.push(`  setText('tTole', ${JSON.stringify(additional.temporaryAddress.villageToleEn)});`);
  }

  lines.push(``);

  // ── Tab 3: Family Details ──
  lines.push(`  // ── Tab 3: Family Details ──`);
  // Father
  const fatherNpParts = splitName(data.fatherName.nepali);
  const fatherEnParts = splitName(data.fatherName.english);
  lines.push(`  setText('fFnLoc', ${JSON.stringify(fatherNpParts.first)});`);
  lines.push(`  setText('fMnLoc', ${JSON.stringify(fatherNpParts.middle)});`);
  lines.push(`  setText('fLnLoc', ${JSON.stringify(fatherNpParts.last)});`);
  lines.push(`  setText('fFn', ${JSON.stringify(fatherEnParts.first)});`);
  lines.push(`  setText('fMn', ${JSON.stringify(fatherEnParts.middle)});`);
  lines.push(`  setText('fLn', ${JSON.stringify(fatherEnParts.last)});`);

  // Mother
  const motherNpParts = splitName(data.motherName.nepali);
  const motherEnParts = splitName(data.motherName.english);
  lines.push(`  setText('mFnLoc', ${JSON.stringify(motherNpParts.first)});`);
  lines.push(`  setText('mMnLoc', ${JSON.stringify(motherNpParts.middle)});`);
  lines.push(`  setText('mLnLoc', ${JSON.stringify(motherNpParts.last)});`);
  lines.push(`  setText('mFn', ${JSON.stringify(motherEnParts.first)});`);
  lines.push(`  setText('mMn', ${JSON.stringify(motherEnParts.middle)});`);
  lines.push(`  setText('mLn', ${JSON.stringify(motherEnParts.last)});`);

  // Grandfather
  const gfNpParts = splitName(data.grandfatherName.nepali);
  const gfEnParts = splitName(data.grandfatherName.english);
  lines.push(`  setText('gfFnLoc', ${JSON.stringify(gfNpParts.first)});`);
  lines.push(`  setText('gfMnLoc', ${JSON.stringify(gfNpParts.middle)});`);
  lines.push(`  setText('gfLnLoc', ${JSON.stringify(gfNpParts.last)});`);
  lines.push(`  setText('gfFn', ${JSON.stringify(gfEnParts.first)});`);
  lines.push(`  setText('gfMn', ${JSON.stringify(gfEnParts.middle)});`);
  lines.push(`  setText('gfLn', ${JSON.stringify(gfEnParts.last)});`);

  // Grandmother
  const gmNpParts = splitName(additional.grandmotherName.nepali);
  const gmEnParts = splitName(additional.grandmotherName.english);
  lines.push(`  setText('gmFnLoc', ${JSON.stringify(gmNpParts.first)});`);
  lines.push(`  setText('gmMnLoc', ${JSON.stringify(gmNpParts.middle)});`);
  lines.push(`  setText('gmLnLoc', ${JSON.stringify(gmNpParts.last)});`);
  lines.push(`  setText('gmFn', ${JSON.stringify(gmEnParts.first)});`);
  lines.push(`  setText('gmMn', ${JSON.stringify(gmEnParts.middle)});`);
  lines.push(`  setText('gmLn', ${JSON.stringify(gmEnParts.last)});`);

  // Spouse (if married)
  if (additional.maritalStatus === "1") {
    lines.push(`  setText('sFnLoc', ${JSON.stringify(additional.spouseFirstName.nepali)});`);
    lines.push(`  setText('sMnLoc', ${JSON.stringify(additional.spouseMiddleName.nepali)});`);
    lines.push(`  setText('sLnLoc', ${JSON.stringify(additional.spouseLastName.nepali)});`);
    lines.push(`  setText('sFn', ${JSON.stringify(additional.spouseFirstName.english)});`);
    lines.push(`  setText('sMn', ${JSON.stringify(additional.spouseMiddleName.english)});`);
    lines.push(`  setText('sLn', ${JSON.stringify(additional.spouseLastName.english)});`);
  }

  lines.push(``);
  lines.push(`  console.log('✅ Smart NID Nepal: All available fields filled successfully!');`);
  lines.push(`  alert('✅ Smart NID Nepal Auto-Fill Complete!\\n\\nNote: For cascading dropdowns like Local Level, you may need to re-select the Province/District manually to load the municipalities.\\nPlease review each tab before submitting.');`);
  lines.push(`})();`);

  return lines.join("\n");
}

/**
 * Split a full name string into first/middle/last parts.
 */
function splitName(fullName: string): { first: string; middle: string; last: string } {
  if (!fullName) return { first: "", middle: "", last: "" };
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

export function generateAutoFillInstructions(data: ExtractionResult, additional: AdditionalFields): AutoFillInstruction[] {
  const instructions: AutoFillInstruction[] = [];
  
  const pushText = (id: string, value: string | undefined) => {
    if (value) instructions.push({ id, type: 'text', value });
  };
  const pushSelect = (id: string, value: string | undefined) => {
    if (value) instructions.push({ id, type: 'select', value });
  };
  const pushDate = (id: string, value: string | undefined) => {
    if (value) instructions.push({ id, type: 'date', value });
  };

  const birthDistrictVal = findDistrictValue(data.birthPlace);
  const issuingDistrictVal = findDistrictValue(data.issuingDistrict);
  const permanentDistrictVal = findDistrictValue(data.permanentAddress.district);
  const pProvinceVal = data.permanentAddress.province || getProvinceFromDistrictId(permanentDistrictVal);
  
  const tempDistrictVal = additional.temporaryAddressSameAsPermanent
    ? permanentDistrictVal
    : findDistrictValue(additional.temporaryAddress.district);
  
  const tProvinceVal = additional.temporaryAddressSameAsPermanent
    ? pProvinceVal
    : (additional.temporaryAddress.province || getProvinceFromDistrictId(tempDistrictVal));
  
  const genderVal = mapGender(data.gender);
  const dobAD = formatDateForInput(data.dobAD);
  const dobBS_EN = nepaliToEnglishDigits(data.dobBS);
  const issueDateBS_EN = nepaliToEnglishDigits(data.issueDateBS);

  pushText('firstNameLoc', data.firstName.nepali);
  pushText('firstName', data.firstName.english);
  pushText('middleNameLoc', data.middleName.nepali);
  pushText('middleName', data.middleName.english);
  pushText('lastNameLoc', data.lastName.nepali);
  pushText('lastName', data.lastName.english);
  pushText('dobLoc', dobBS_EN);
  pushDate('dob', dobAD);

  pushSelect('birthDistrictPlace', birthDistrictVal);
  pushSelect('ccType', additional.ccType || '1');
  pushText('ccNumberLoc', data.citizenshipNo);
  pushSelect('ccIssuingDistrict', issuingDistrictVal);
  pushText('ccIssuingDateLoc', issueDateBS_EN);
  pushSelect('gender', genderVal);

  pushSelect('maritalStatus', additional.maritalStatus);
  pushSelect('educationLevel', additional.educationLevel);
  pushSelect('profession', additional.profession);
  pushSelect('caste', additional.caste);
  pushSelect('religion', additional.religion);
  pushSelect('fatherStatus', '1');

  pushText('mobileNo', additional.mobileNo);
  pushText('phoneNo', additional.phoneNo);
  
  pushSelect('pProvince', pProvinceVal);
  pushSelect('pDistrict', permanentDistrictVal);
  pushText('pWardNo', data.permanentAddress.wardNo);
  pushText('pToleLoc', data.permanentAddress.villageToleNp);
  pushText('pTole', data.permanentAddress.villageToleEn);

  if (!additional.temporaryAddressSameAsPermanent) {
    pushSelect('tProvince', tProvinceVal);
    pushSelect('tDistrict', tempDistrictVal);
    pushText('tWardNo', additional.temporaryAddress.wardNo);
    pushText('tToleLoc', additional.temporaryAddress.villageToleNp);
    pushText('tTole', additional.temporaryAddress.villageToleEn);
  }

  const fatherNpParts = splitName(data.fatherName.nepali);
  const fatherEnParts = splitName(data.fatherName.english);
  pushText('fFnLoc', fatherNpParts.first);
  pushText('fMnLoc', fatherNpParts.middle);
  pushText('fLnLoc', fatherNpParts.last);
  pushText('fFn', fatherEnParts.first);
  pushText('fMn', fatherEnParts.middle);
  pushText('fLn', fatherEnParts.last);

  const motherNpParts = splitName(data.motherName.nepali);
  const motherEnParts = splitName(data.motherName.english);
  pushText('mFnLoc', motherNpParts.first);
  pushText('mMnLoc', motherNpParts.middle);
  pushText('mLnLoc', motherNpParts.last);
  pushText('mFn', motherEnParts.first);
  pushText('mMn', motherEnParts.middle);
  pushText('mLn', motherEnParts.last);

  const gfNpParts = splitName(data.grandfatherName.nepali);
  const gfEnParts = splitName(data.grandfatherName.english);
  pushText('gfFnLoc', gfNpParts.first);
  pushText('gfMnLoc', gfNpParts.middle);
  pushText('gfLnLoc', gfNpParts.last);
  pushText('gfFn', gfEnParts.first);
  pushText('gfMn', gfEnParts.middle);
  pushText('gfLn', gfEnParts.last);

  const gmNpParts = splitName(additional.grandmotherName.nepali);
  const gmEnParts = splitName(additional.grandmotherName.english);
  pushText('gmFnLoc', gmNpParts.first);
  pushText('gmMnLoc', gmNpParts.middle);
  pushText('gmLnLoc', gmNpParts.last);
  pushText('gmFn', gmEnParts.first);
  pushText('gmMn', gmEnParts.middle);
  pushText('gmLn', gmEnParts.last);

  if (additional.maritalStatus === "1") {
    pushText('sFnLoc', additional.spouseFirstName.nepali);
    pushText('sMnLoc', additional.spouseMiddleName.nepali);
    pushText('sLnLoc', additional.spouseLastName.nepali);
    pushText('sFn', additional.spouseFirstName.english);
    pushText('sMn', additional.spouseMiddleName.english);
    pushText('sLn', additional.spouseLastName.english);
  }

  return instructions;
}
