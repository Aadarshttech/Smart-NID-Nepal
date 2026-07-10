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
  type: 'text' | 'select' | 'date' | 'checkbox';
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
 * Format a date string to strictly YYYY-MM-DD (Used for BS Dates which expect YYYY-MM-DD).
 * Converts from DD-MM-YYYY or handles 2-digit/3-digit years like '062' -> '2062'.
 */
function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  
  let cleanDate = dateStr.replace(/[\/\.]/g, '-');
  const parts = cleanDate.split('-');
  
  if (parts.length === 3) {
    let year = parts[0];
    let month = parts[1].padStart(2, '0');
    let day = parts[2];
    
    // Identify year vs day based on length or value
    if (parts[2].length === 4 || (parts[2].length <= 3 && parseInt(parts[2], 10) > 32)) {
      year = parts[2];
      day = parts[0];
    } else if (parts[0].length === 4 || (parts[0].length <= 3 && parseInt(parts[0], 10) > 32)) {
      year = parts[0];
      day = parts[2];
    } else {
      // Ambiguous fallback: assume YYYY-MM-DD format was intended
      year = parts[0];
      day = parts[2];
    }

    // Fix <4 digit BS years (e.g. 62, 062). Assume 20XX since 1999 BS is 100+ years old
    let yNum = parseInt(year, 10);
    if (yNum < 100) {
      year = yNum > 95 ? `19${yNum.toString().padStart(2, '0')}` : `20${yNum.toString().padStart(2, '0')}`;
    }
    
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }
  return cleanDate;
}

/**
 * Format a date string strictly to DD/MM/YYYY for DoNIDCR AD date inputs.
 * Converts <4 digit AD years automatically based on current century.
 */
function formatADDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  
  let cleanDate = dateStr.replace(/[\/\.-]/g, '/');
  const parts = cleanDate.split('/');
  
  if (parts.length === 3) {
    let year = parts[0];
    let month = parts[1].padStart(2, '0');
    let day = parts[2];
    
    if (parts[2].length === 4 || (parts[2].length <= 3 && parseInt(parts[2], 10) > 31)) {
      year = parts[2];
      day = parts[0];
    } else if (parts[0].length === 4 || (parts[0].length <= 3 && parseInt(parts[0], 10) > 31)) {
      year = parts[0];
      day = parts[2];
    } else {
      // Ambiguous fallback: assume DD/MM/YYYY for AD dates
      year = parts[2];
      day = parts[0];
    }

    let yNum = parseInt(year, 10);
    if (yNum < 100) {
      const currentYY = new Date().getFullYear() % 100;
      year = yNum > currentYY ? `19${yNum.toString().padStart(2, '0')}` : `20${yNum.toString().padStart(2, '0')}`;
    }
    
    return `${day.padStart(2, '0')}/${month}/${year}`;
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
  const dobAD = formatADDateForInput(data.dobAD);
  // BS date fields have `nepalify` class — must use Devanagari digits in YYYY-MM-DD
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
  lines.push(`  setText('fatherFirstNameLoc', ${JSON.stringify(data.fatherFirstName?.nepali || "")});`);
  lines.push(`  setText('fatherMiddleNameLoc', ${JSON.stringify(data.fatherMiddleName?.nepali || "")});`);
  lines.push(`  setText('fatherLastNameLoc', ${JSON.stringify(data.fatherLastName?.nepali || "")});`);
  lines.push(`  setText('fatherFirstName', ${JSON.stringify(data.fatherFirstName?.english || "")});`);
  lines.push(`  setText('fatherMiddleName', ${JSON.stringify(data.fatherMiddleName?.english || "")});`);
  lines.push(`  setText('fatherLastName', ${JSON.stringify(data.fatherLastName?.english || "")});`);
  lines.push(`  setText('fatherNinLoc', ${JSON.stringify(additional.fatherDetails?.nin || "")});`);

  // Mother
  lines.push(`  setText('motherFirstNameLoc', ${JSON.stringify(data.motherFirstName?.nepali || "")});`);
  lines.push(`  setText('motherMiddleNameLoc', ${JSON.stringify(data.motherMiddleName?.nepali || "")});`);
  lines.push(`  setText('motherLastNameLoc', ${JSON.stringify(data.motherLastName?.nepali || "")});`);
  lines.push(`  setText('motherFirstName', ${JSON.stringify(data.motherFirstName?.english || "")});`);
  lines.push(`  setText('motherMiddleName', ${JSON.stringify(data.motherMiddleName?.english || "")});`);
  lines.push(`  setText('motherLastName', ${JSON.stringify(data.motherLastName?.english || "")});`);
  lines.push(`  setText('motherNinLoc', ${JSON.stringify(additional.motherDetails?.nin || "")});`);

  // Grandfather
  lines.push(`  setText('grandFatherFirstNameLoc', ${JSON.stringify(data.grandfatherFirstName?.nepali || "")});`);
  lines.push(`  setText('grandFatherMiddleNameLoc', ${JSON.stringify(data.grandfatherMiddleName?.nepali || "")});`);
  lines.push(`  setText('grandFatherLastNameLoc', ${JSON.stringify(data.grandfatherLastName?.nepali || "")});`);
  lines.push(`  setText('grandFatherFirstName', ${JSON.stringify(data.grandfatherFirstName?.english || "")});`);
  lines.push(`  setText('grandFatherMiddleName', ${JSON.stringify(data.grandfatherMiddleName?.english || "")});`);
  lines.push(`  setText('grandFatherLastName', ${JSON.stringify(data.grandfatherLastName?.english || "")});`);
  lines.push(`  setText('grandFatherNinLoc', ${JSON.stringify(additional.grandfatherDetails?.nin || "")});`);

  // Grandmother
  lines.push(`  setText('grandMotherFirstNameLoc', ${JSON.stringify(additional.grandmotherFirstName?.nepali || "")});`);
  lines.push(`  setText('grandMotherMiddleNameLoc', ${JSON.stringify(additional.grandmotherMiddleName?.nepali || "")});`);
  lines.push(`  setText('grandMotherLastNameLoc', ${JSON.stringify(additional.grandmotherLastName?.nepali || "")});`);
  lines.push(`  setText('grandMotherFirstName', ${JSON.stringify(additional.grandmotherFirstName?.english || "")});`);
  lines.push(`  setText('grandMotherMiddleName', ${JSON.stringify(additional.grandmotherMiddleName?.english || "")});`);
  lines.push(`  setText('grandMotherLastName', ${JSON.stringify(additional.grandmotherLastName?.english || "")});`);
  lines.push(`  setText('grandMotherNinLoc', ${JSON.stringify(additional.grandmotherDetails?.nin || "")});`);

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



export function generateAutoFillInstructions(data: ExtractionResult, additional: AdditionalFields): AutoFillInstruction[] {
  const instructions: AutoFillInstruction[] = [];
  
  const pushText = (id: string, value: string | undefined) => {
    if (value && value.trim()) instructions.push({ id, type: 'text', value: value.trim() });
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
  const dobAD = formatADDateForInput(data.dobAD);
  // BS date fields have `nepalify` class — must use Devanagari digits
  const dobBS_NP = englishToNepaliDigits(formatDateForInput(nepaliToEnglishDigits(data.dobBS)));
  const issueDateBS_NP = englishToNepaliDigits(formatDateForInput(nepaliToEnglishDigits(data.issueDateBS)));

  pushText('firstNameLoc', data.firstName.nepali);
  pushText('firstName', data.firstName.english?.toUpperCase());
  pushText('middleNameLoc', data.middleName.nepali);
  pushText('middleName', data.middleName.english?.toUpperCase());
  pushText('lastNameLoc', data.lastName.nepali);
  pushText('lastName', data.lastName.english?.toUpperCase());
  pushText('dobLoc', dobBS_NP);
  pushText('dob', dobAD); // Note: pushText allows string DD/MM/YYYY without native browser date picker overriding it

  pushSelect('birthDistrictPlace', birthDistrictVal);
  pushSelect('ccType', additional.ccType || '1');
  
  if (additional.ccType === "2" || additional.ccType === "3") {
    pushText('ccPrevNatCountry', additional.ccPrevNatCountry);
    pushText('ccPrevNatRevocationDate', additional.ccPrevNatRevocationDate);
  }
  
  pushText('ccNumberLoc', data.citizenshipNo);
  pushSelect('ccIssuingDistrict', issuingDistrictVal);
  pushText('ccIssuingDateLoc', issueDateBS_NP);
  pushSelect('gender', genderVal);

  pushSelect('maritalStatus', additional.maritalStatus);
  pushSelect('educationLevel', additional.educationLevel);
  pushSelect('profession', additional.profession);
  pushSelect('caste', additional.caste);
  pushSelect('religion', additional.religion);

  pushText('mobilePhone', additional.mobileNo);
  pushText('telephone', additional.phoneNo);
  
  pushSelect('permState', pProvinceVal, data.permanentAddress.province);
  pushSelect('permDistrict', permanentDistrictVal, data.permanentAddress.district);
  
  // Try common DoNIDCR Local Level dropdown IDs by text matching
  if (pLocalLevel) {
    pushSelect('permRurMun', "", pLocalLevel);
  }
  
  pushText('permWardLoc', data.permanentAddress.wardNo);
  pushText('permVillageTolLoc', data.permanentAddress.villageToleNp);
  pushText('permVillageTol', data.permanentAddress.villageToleEn?.toUpperCase());

  if (additional.temporaryAddressSameAsPermanent) {
    instructions.push({ id: 'tempAddressCopy', type: 'checkbox', value: 'true' });
  } else {
    instructions.push({ id: 'tempAddressCopy', type: 'checkbox', value: 'false' });
    pushSelect('tempState', tProvinceVal, additional.temporaryAddress.province);
    pushSelect('tempDistrict', tempDistrictVal, additional.temporaryAddress.district);
    
    if (tLocalLevel) {
      pushSelect('tempRurMun', "", tLocalLevel);
    }
    
    pushText('tempWardLoc', additional.temporaryAddress.wardNo);
    pushText('tempVillageTolLoc', additional.temporaryAddress.villageToleNp);
    pushText('tempVillageTol', additional.temporaryAddress.villageToleEn?.toUpperCase());
  }

  // Father Address
  const fatherCopy = additional.fatherDetails?.addressSameAsApplicant ?? true;
  instructions.push({ id: 'fatherAddressCopy', type: 'checkbox', value: fatherCopy.toString() });
  if (!fatherCopy) {
    pushText('fatherState', additional.fatherDetails?.address?.province);
    pushText('fatherDistrict', additional.fatherDetails?.address?.district);
    pushText('fatherRurMun', additional.fatherDetails?.address?.localLevel);
    pushText('fatherWardLoc', additional.fatherDetails?.address?.wardNo);
    pushText('fatherVillageTolLoc', additional.fatherDetails?.address?.villageToleNp);
  }

  // Mother Address
  const motherCopy = additional.motherDetails?.addressSameAsApplicant ?? true;
  instructions.push({ id: 'motherAddressCopy', type: 'checkbox', value: motherCopy.toString() });
  if (!motherCopy) {
    pushText('motherState', additional.motherDetails?.address?.province);
    pushText('motherDistrict', additional.motherDetails?.address?.district);
    pushText('motherRurMun', additional.motherDetails?.address?.localLevel);
    pushText('motherWardLoc', additional.motherDetails?.address?.wardNo);
    pushText('motherVillageTolLoc', additional.motherDetails?.address?.villageToleNp);
  }

  // Grandparents default to true
  instructions.push({ id: 'grandFatherAddressCopy', type: 'checkbox', value: 'true' });
  instructions.push({ id: 'grandMotherAddressCopy', type: 'checkbox', value: 'true' });

  pushText('fatherFirstNameLoc', data.fatherFirstName?.nepali);
  pushText('fatherMiddleNameLoc', data.fatherMiddleName?.nepali);
  pushText('fatherLastNameLoc', data.fatherLastName?.nepali);
  pushText('fatherFirstName', data.fatherFirstName?.english?.toUpperCase());
  pushText('fatherMiddleName', data.fatherMiddleName?.english?.toUpperCase());
  pushText('fatherLastName', data.fatherLastName?.english?.toUpperCase());
  pushText('fatherNinLoc', additional.fatherDetails?.nin);
  pushText('fatherNationalityLoc', additional.fatherDetails?.nationality === 'NEPALESE' ? 'नेपाली' : additional.fatherDetails?.nationality);
  pushText('fatherNationality', additional.fatherDetails?.nationality || 'NEPALESE');

  pushText('motherFirstNameLoc', data.motherFirstName?.nepali);
  pushText('motherMiddleNameLoc', data.motherMiddleName?.nepali);
  pushText('motherLastNameLoc', data.motherLastName?.nepali);
  pushText('motherFirstName', data.motherFirstName?.english?.toUpperCase());
  pushText('motherMiddleName', data.motherMiddleName?.english?.toUpperCase());
  pushText('motherLastName', data.motherLastName?.english?.toUpperCase());
  pushText('motherNinLoc', additional.motherDetails?.nin);
  pushText('motherNationalityLoc', additional.motherDetails?.nationality === 'NEPALESE' ? 'नेपाली' : additional.motherDetails?.nationality);
  pushText('motherNationality', additional.motherDetails?.nationality || 'NEPALESE');

  pushText('grandFatherFirstNameLoc', data.grandfatherFirstName?.nepali);
  pushText('grandFatherMiddleNameLoc', data.grandfatherMiddleName?.nepali);
  pushText('grandFatherLastNameLoc', data.grandfatherLastName?.nepali);
  pushText('grandFatherFirstName', data.grandfatherFirstName?.english?.toUpperCase());
  pushText('grandFatherMiddleName', data.grandfatherMiddleName?.english?.toUpperCase());
  pushText('grandFatherLastName', data.grandfatherLastName?.english?.toUpperCase());
  pushText('grandFatherNinLoc', additional.grandfatherDetails?.nin);
  pushText('grandFatherNationalityLoc', additional.grandfatherDetails?.nationality === 'NEPALESE' ? 'नेपाली' : additional.grandfatherDetails?.nationality);
  pushText('grandFatherNationality', additional.grandfatherDetails?.nationality || 'NEPALESE');

  pushText('grandMotherFirstNameLoc', additional.grandmotherFirstName?.nepali);
  pushText('grandMotherMiddleNameLoc', additional.grandmotherMiddleName?.nepali);
  pushText('grandMotherLastNameLoc', additional.grandmotherLastName?.nepali);
  pushText('grandMotherFirstName', additional.grandmotherFirstName?.english?.toUpperCase());
  pushText('grandMotherMiddleName', additional.grandmotherMiddleName?.english?.toUpperCase());
  pushText('grandMotherLastName', additional.grandmotherLastName?.english?.toUpperCase());
  pushText('grandMotherNinLoc', additional.grandmotherDetails?.nin);
  pushText('grandMotherNationalityLoc', additional.grandmotherDetails?.nationality === 'NEPALESE' ? 'नेपाली' : additional.grandmotherDetails?.nationality);
  pushText('grandMotherNationality', additional.grandmotherDetails?.nationality || 'NEPALESE');

  if (additional.maritalStatus === "1") {
    pushText('spouseFirstNameLoc', additional.spouseFirstName.nepali);
    pushText('spouseMiddleNameLoc', additional.spouseMiddleName.nepali);
    pushText('spouseLastNameLoc', additional.spouseLastName.nepali);
    pushText('spouseFirstName', additional.spouseFirstName.english?.toUpperCase());
    pushText('spouseMiddleName', additional.spouseMiddleName.english?.toUpperCase());
    pushText('spouseLastName', additional.spouseLastName.english?.toUpperCase());
    pushText('spouseNinLoc', additional.spouseDetails?.nin);
    pushText('spouseNationalityLoc', additional.spouseDetails?.nationality === 'NEPALESE' ? 'नेपाली' : additional.spouseDetails?.nationality);
    pushText('spouseNationality', additional.spouseDetails?.nationality || 'NEPALESE');
    
    // Spouse Address
    const spouseCopy = additional.spouseDetails?.addressSameAsApplicant ?? true;
    instructions.push({ id: 'spouseAddressCopy', type: 'checkbox', value: spouseCopy.toString() });
    if (!spouseCopy) {
      pushText('spouseState', additional.spouseDetails?.address?.province);
      pushText('spouseDistrict', additional.spouseDetails?.address?.district);
      pushText('spouseRurMun', additional.spouseDetails?.address?.localLevel);
      pushText('spouseWardLoc', additional.spouseDetails?.address?.wardNo);
      pushText('spouseVillageTolLoc', additional.spouseDetails?.address?.villageToleNp);
    }
  }

  // Appointment Location
  if (additional.appointmentLocation) {
    instructions.push({ id: 'appointmentLocation', type: 'select', value: additional.appointmentLocation });
  }

  return instructions;
}
