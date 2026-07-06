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
  textValue?: string;
}

/**
 * Convert Nepali digits (०-९) to English digits (0-9).
 */
function nepaliToEnglishDigits(str: string): string {
  if (!str) return "";
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return str.replace(/[०-९]/g, (match) => {
    return nepaliDigits.indexOf(match).toString();
  });
}

/**
 * Convert English digits (0-9) to Nepali/Devanagari digits (०-९).
 * The DoNIDCR portal fields with `nepalify` class expect Devanagari numerals.
 * Setting English digits directly bypasses the nepalify library and causes
 * validation errors like "year range should be in 1970-2099 BS".
 */
function englishToNepaliDigits(str: string): string {
  if (!str) return "";
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return str.replace(/[0-9]/g, (match) => {
    return nepaliDigits[parseInt(match, 10)];
  });
}

/**
 * Format a date string to strictly YYYY-MM-DD.
 * Converts from DD-MM-YYYY if necessary.
 */
function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  
  // Clean separators
  let cleanDate = dateStr.replace(/[\/\.]/g, '-');
  
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // DD-MM-YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    } else if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  return cleanDate;
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
  // BS date fields have `nepalify` class — must use Devanagari digits
  const dobBS_NP = englishToNepaliDigits(formatDateForInput(nepaliToEnglishDigits(data.dobBS)));
  const issueDateBS_NP = englishToNepaliDigits(formatDateForInput(nepaliToEnglishDigits(data.issueDateBS)));

  // Build an array of field assignments as JS statements
  const lines: string[] = [];

  lines.push(`// ═══════════════════════════════════════════════════════`);
  lines.push(`// Smart NID Nepal — DoNIDCR Auto-Fill Script`);
  lines.push(`// Generated at: ${new Date().toISOString()}`);
  lines.push(`// ═══════════════════════════════════════════════════════`);
  lines.push(``);
  lines.push(`(async function() {`);
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
  lines.push(`    `);
  lines.push(`    const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;`);
  lines.push(`    `);
  lines.push(`    // First try setting by exact value (ID)`);
  lines.push(`    nativeSelectValueSetter.call(el, value);`);
  lines.push(`    `);
  lines.push(`    // If that didn't work, try fuzzy matching by option text`);
  lines.push(`    if (el.value !== value) {`);
  lines.push(`      const lowerVal = value.toString().toLowerCase();`);
  lines.push(`      const options = Array.from(el.options);`);
  lines.push(`      `);
  lines.push(`      // 1. Exact text match`);
  lines.push(`      let match = options.find(opt => opt.text.toLowerCase() === lowerVal);`);
  lines.push(`      `);
  lines.push(`      // 2. Contains match`);
  lines.push(`      if (!match) {`);
  lines.push(`        match = options.find(opt => opt.text.toLowerCase().includes(lowerVal));`);
  lines.push(`      }`);
  lines.push(`      `);
  lines.push(`      if (match) {`);
  lines.push(`        nativeSelectValueSetter.call(el, match.value);`);
  lines.push(`      }`);
  lines.push(`    }`);
  lines.push(`    `);
  lines.push(`    el.dispatchEvent(new Event('change', { bubbles: true }));`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  // Helper: set a dependent select dropdown asynchronously (waits for options to load)`);
  lines.push(`  async function setSelectAsync(id, value) {`);
  lines.push(`    if (!value) return;`);
  lines.push(`    const el = document.getElementById(id);`);
  lines.push(`    if (!el) { console.warn('⚠️ Select not found:', id); return; }`);
  lines.push(``);
  lines.push(`    // Wait until the dropdown is populated by the portal's AJAX (at least 2 options: placeholder + data)`);
  lines.push(`    let attempts = 0;`);
  lines.push(`    while (el.options.length <= 1 && attempts < 20) {`);
  lines.push(`      await new Promise(r => setTimeout(r, 100));`);
  lines.push(`      attempts++;`);
  lines.push(`    }`);
  lines.push(``);
  lines.push(`    setSelect(id, value);`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  // Helper: set a date input`);
  lines.push(`  function setDate(id, value) {`);
  lines.push(`    if (!value) return;`);
  lines.push(`    const el = document.getElementById(id);`);
  lines.push(`    if (!el) { console.warn('⚠️ Date field not found:', id); return; }`);
  lines.push(`    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;`);
  lines.push(`    nativeInputValueSetter.call(el, value);`);
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
  lines.push(`  setText('dobLoc', ${JSON.stringify(dobBS_NP)});`);
  lines.push(`  setDate('dob', ${JSON.stringify(dobAD)});`);

  if (birthDistrictVal) lines.push(`  setSelect('birthDistrictPlace', ${JSON.stringify(birthDistrictVal)});`);
  lines.push(`  setSelect('ccType', ${JSON.stringify(additional.ccType || '1')});`);
  lines.push(`  setText('ccNumberLoc', ${JSON.stringify(data.citizenshipNo)});`);
  if (issuingDistrictVal) lines.push(`  setSelect('ccIssuingDistrict', ${JSON.stringify(issuingDistrictVal)});`);
  lines.push(`  setText('ccIssuingDateLoc', ${JSON.stringify(issueDateBS_NP)});`);
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
  lines.push(`  setText('mobilePhone', ${JSON.stringify(additional.mobileNo)});`);
  lines.push(`  setText('telephone', ${JSON.stringify(additional.phoneNo)});`);
  
  lines.push(`  setSelect('permState', ${JSON.stringify(data.permanentAddress.province)});`);
  if (permanentDistrictVal) lines.push(`  await setSelectAsync('permDistrict', ${JSON.stringify(permanentDistrictVal)});`);
  else lines.push(`  await setSelectAsync('permDistrict', ${JSON.stringify(data.permanentAddress.district)});`);
  lines.push(`  await setSelectAsync('permRurMun', ${JSON.stringify(data.permanentAddress.localLevel)});`);
  lines.push(`  setText('permWardLoc', ${JSON.stringify(data.permanentAddress.wardNo)});`);
  lines.push(`  setText('permVillageTolLoc', ${JSON.stringify(data.permanentAddress.villageToleNp)});`);
  lines.push(`  setText('permVillageTol', ${JSON.stringify(data.permanentAddress.villageToleEn)});`);

  // Handle "Same as Permanent Address" Checkbox Robustly
  lines.push(`  let pSame = document.getElementById('tempAddressCopy');`);
  lines.push(`  if (!pSame) {`);
  lines.push(`    const labels = Array.from(document.querySelectorAll('label, span, div'));`);
  lines.push(`    const copyLabel = labels.find(l => l.innerText && l.innerText.includes('Copy Permanent Address'));`);
  lines.push(`    if (copyLabel) pSame = copyLabel.querySelector('input[type="checkbox"]') || copyLabel.parentElement?.querySelector('input[type="checkbox"]');`);
  lines.push(`  }`);
  lines.push(`  if (!pSame) pSame = document.querySelector('input[type="checkbox"]');`);
  lines.push(`  if (pSame) {`);
  if (additional.temporaryAddressSameAsPermanent) {
    lines.push(`    if (!pSame.checked) {`);
    lines.push(`      pSame.click();`);
    lines.push(`    }`);
  } else {
    lines.push(`    if (pSame.checked) {`);
    lines.push(`      pSame.click();`);
    lines.push(`    }`);
    lines.push(`    setSelect('tempState', ${JSON.stringify(additional.temporaryAddress.province)});`);
    lines.push(`    await setSelectAsync('tempDistrict', ${JSON.stringify(tempDistrictVal || additional.temporaryAddress.district)});`);
    lines.push(`    await setSelectAsync('tempRurMun', ${JSON.stringify(additional.temporaryAddress.localLevel)});`);
    lines.push(`    setText('tempWardLoc', ${JSON.stringify(additional.temporaryAddress.wardNo)});`);
    lines.push(`    setText('tempVillageTolLoc', ${JSON.stringify(additional.temporaryAddress.villageToleNp)});`);
    lines.push(`    setText('tempVillageTol', ${JSON.stringify(additional.temporaryAddress.villageToleEn)});`);
  }
  lines.push(`  }`);

  lines.push(``);

  // ── Tab 3: Family Details ──
  lines.push(`  // ── Tab 3: Family Details ──`);
  // Father
  const fatherNpParts = splitName(data.fatherName.nepali);
  const fatherEnParts = splitName(data.fatherName.english);
  lines.push(`  setText('fatherFirstNameLoc', ${JSON.stringify(fatherNpParts.first)});`);
  lines.push(`  setText('fatherMiddleNameLoc', ${JSON.stringify(fatherNpParts.middle)});`);
  lines.push(`  setText('fatherLastNameLoc', ${JSON.stringify(fatherNpParts.last)});`);
  lines.push(`  setText('fatherFirstName', ${JSON.stringify(fatherEnParts.first)});`);
  lines.push(`  setText('fatherMiddleName', ${JSON.stringify(fatherEnParts.middle)});`);
  lines.push(`  setText('fatherLastName', ${JSON.stringify(fatherEnParts.last)});`);

  // Mother
  const motherNpParts = splitName(data.motherName.nepali);
  const motherEnParts = splitName(data.motherName.english);
  lines.push(`  setText('motherFirstNameLoc', ${JSON.stringify(motherNpParts.first)});`);
  lines.push(`  setText('motherMiddleNameLoc', ${JSON.stringify(motherNpParts.middle)});`);
  lines.push(`  setText('motherLastNameLoc', ${JSON.stringify(motherNpParts.last)});`);
  lines.push(`  setText('motherFirstName', ${JSON.stringify(motherEnParts.first)});`);
  lines.push(`  setText('motherMiddleName', ${JSON.stringify(motherEnParts.middle)});`);
  lines.push(`  setText('motherLastName', ${JSON.stringify(motherEnParts.last)});`);

  // Grandfather
  const gfNpParts = splitName(data.grandfatherName.nepali);
  const gfEnParts = splitName(data.grandfatherName.english);
  lines.push(`  setText('grandFatherFirstNameLoc', ${JSON.stringify(gfNpParts.first)});`);
  lines.push(`  setText('grandFatherMiddleNameLoc', ${JSON.stringify(gfNpParts.middle)});`);
  lines.push(`  setText('grandFatherLastNameLoc', ${JSON.stringify(gfNpParts.last)});`);
  lines.push(`  setText('grandFatherFirstName', ${JSON.stringify(gfEnParts.first)});`);
  lines.push(`  setText('grandFatherMiddleName', ${JSON.stringify(gfEnParts.middle)});`);
  lines.push(`  setText('grandFatherLastName', ${JSON.stringify(gfEnParts.last)});`);

  // Grandmother
  const gmNpParts = splitName(additional.grandmotherName.nepali);
  const gmEnParts = splitName(additional.grandmotherName.english);
  lines.push(`  setText('grandMotherFirstNameLoc', ${JSON.stringify(gmNpParts.first)});`);
  lines.push(`  setText('grandMotherMiddleNameLoc', ${JSON.stringify(gmNpParts.middle)});`);
  lines.push(`  setText('grandMotherLastNameLoc', ${JSON.stringify(gmNpParts.last)});`);
  lines.push(`  setText('grandMotherFirstName', ${JSON.stringify(gmEnParts.first)});`);
  lines.push(`  setText('grandMotherMiddleName', ${JSON.stringify(gmEnParts.middle)});`);
  lines.push(`  setText('grandMotherLastName', ${JSON.stringify(gmEnParts.last)});`);

  // Spouse (if married)
  if (additional.maritalStatus === "1") {
    lines.push(`  setText('spouseFirstNameLoc', ${JSON.stringify(additional.spouseFirstName.nepali)});`);
    lines.push(`  setText('spouseMiddleNameLoc', ${JSON.stringify(additional.spouseMiddleName.nepali)});`);
    lines.push(`  setText('spouseLastNameLoc', ${JSON.stringify(additional.spouseLastName.nepali)});`);
    lines.push(`  setText('spouseFirstName', ${JSON.stringify(additional.spouseFirstName.english)});`);
    lines.push(`  setText('spouseMiddleName', ${JSON.stringify(additional.spouseMiddleName.english)});`);
    lines.push(`  setText('spouseLastName', ${JSON.stringify(additional.spouseLastName.english)});`);
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
  const pushSelect = (id: string, value: string | undefined, textValue?: string) => {
    if (value || textValue) instructions.push({ id, type: 'select', value: value || "", textValue });
  };
  const pushDate = (id: string, value: string | undefined) => {
    if (value) instructions.push({ id, type: 'date', value });
  };

  const birthDistrictVal = findDistrictValue(data.birthPlace);
  const issuingDistrictVal = findDistrictValue(data.issuingDistrict);
  const permanentDistrictVal = findDistrictValue(data.permanentAddress.district);
  const pProvinceVal = data.permanentAddress.province || getProvinceFromDistrictId(permanentDistrictVal);
  const pLocalLevel = data.permanentAddress.localLevel;
  
  const tempDistrictVal = additional.temporaryAddressSameAsPermanent
    ? permanentDistrictVal
    : findDistrictValue(additional.temporaryAddress.district);
  
  const tProvinceVal = additional.temporaryAddressSameAsPermanent
    ? pProvinceVal
    : (additional.temporaryAddress.province || getProvinceFromDistrictId(tempDistrictVal));
    
  const tLocalLevel = additional.temporaryAddressSameAsPermanent
    ? pLocalLevel
    : additional.temporaryAddress.localLevel;
  
  const genderVal = mapGender(data.gender);
  const dobAD = formatDateForInput(data.dobAD);
  // BS date fields have `nepalify` class — must use Devanagari digits
  const dobBS_NP = englishToNepaliDigits(formatDateForInput(nepaliToEnglishDigits(data.dobBS)));
  const issueDateBS_NP = englishToNepaliDigits(formatDateForInput(nepaliToEnglishDigits(data.issueDateBS)));

  pushText('firstNameLoc', data.firstName.nepali);
  pushText('firstName', data.firstName.english);
  pushText('middleNameLoc', data.middleName.nepali);
  pushText('middleName', data.middleName.english);
  pushText('lastNameLoc', data.lastName.nepali);
  pushText('lastName', data.lastName.english);
  pushText('dobLoc', dobBS_NP);
  pushDate('dob', dobAD);

  pushSelect('birthDistrictPlace', birthDistrictVal);
  pushSelect('ccType', additional.ccType || '1');
  pushText('ccNumberLoc', data.citizenshipNo);
  pushSelect('ccIssuingDistrict', issuingDistrictVal);
  pushText('ccIssuingDateLoc', issueDateBS_NP);
  pushSelect('gender', genderVal);

  pushSelect('maritalStatus', additional.maritalStatus);
  pushSelect('educationLevel', additional.educationLevel);
  pushSelect('profession', additional.profession);
  pushSelect('caste', additional.caste);
  pushSelect('religion', additional.religion);
  pushSelect('fatherStatus', '1');

  pushText('mobilePhone', additional.mobileNo);
  pushText('telephone', additional.phoneNo);
  
  pushSelect('permState', pProvinceVal);
  pushSelect('permDistrict', permanentDistrictVal);
  
  // Try common DoNIDCR Local Level dropdown IDs by text matching
  if (pLocalLevel) {
    pushSelect('permRurMun', "", pLocalLevel);
  }
  
  pushText('permWardLoc', data.permanentAddress.wardNo);
  pushText('permVillageTolLoc', data.permanentAddress.villageToleNp);
  pushText('permVillageTol', data.permanentAddress.villageToleEn);

  if (!additional.temporaryAddressSameAsPermanent) {
    pushSelect('tempState', tProvinceVal);
    pushSelect('tempDistrict', tempDistrictVal);
    
    if (tLocalLevel) {
      pushSelect('tempRurMun', "", tLocalLevel);
    }
    
    pushText('tempWardLoc', additional.temporaryAddress.wardNo);
    pushText('tempVillageTolLoc', additional.temporaryAddress.villageToleNp);
    pushText('tempVillageTol', additional.temporaryAddress.villageToleEn);
  }

  const fatherNpParts = splitName(data.fatherName.nepali);
  const fatherEnParts = splitName(data.fatherName.english);
  pushText('fatherFirstNameLoc', fatherNpParts.first);
  pushText('fatherMiddleNameLoc', fatherNpParts.middle);
  pushText('fatherLastNameLoc', fatherNpParts.last);
  pushText('fatherFirstName', fatherEnParts.first);
  pushText('fatherMiddleName', fatherEnParts.middle);
  pushText('fatherLastName', fatherEnParts.last);

  const motherNpParts = splitName(data.motherName.nepali);
  const motherEnParts = splitName(data.motherName.english);
  pushText('motherFirstNameLoc', motherNpParts.first);
  pushText('motherMiddleNameLoc', motherNpParts.middle);
  pushText('motherLastNameLoc', motherNpParts.last);
  pushText('motherFirstName', motherEnParts.first);
  pushText('motherMiddleName', motherEnParts.middle);
  pushText('motherLastName', motherEnParts.last);

  const gfNpParts = splitName(data.grandfatherName.nepali);
  const gfEnParts = splitName(data.grandfatherName.english);
  pushText('grandFatherFirstNameLoc', gfNpParts.first);
  pushText('grandFatherMiddleNameLoc', gfNpParts.middle);
  pushText('grandFatherLastNameLoc', gfNpParts.last);
  pushText('grandFatherFirstName', gfEnParts.first);
  pushText('grandFatherMiddleName', gfEnParts.middle);
  pushText('grandFatherLastName', gfEnParts.last);

  const gmNpParts = splitName(additional.grandmotherName.nepali);
  const gmEnParts = splitName(additional.grandmotherName.english);
  pushText('grandMotherFirstNameLoc', gmNpParts.first);
  pushText('grandMotherMiddleNameLoc', gmNpParts.middle);
  pushText('grandMotherLastNameLoc', gmNpParts.last);
  pushText('grandMotherFirstName', gmEnParts.first);
  pushText('grandMotherMiddleName', gmEnParts.middle);
  pushText('grandMotherLastName', gmEnParts.last);

  if (additional.maritalStatus === "1") {
    pushText('spouseFirstNameLoc', additional.spouseFirstName.nepali);
    pushText('spouseMiddleNameLoc', additional.spouseMiddleName.nepali);
    pushText('spouseLastNameLoc', additional.spouseLastName.nepali);
    pushText('spouseFirstName', additional.spouseFirstName.english);
    pushText('spouseMiddleName', additional.spouseMiddleName.english);
    pushText('spouseLastName', additional.spouseLastName.english);
  }

  return instructions;
}
