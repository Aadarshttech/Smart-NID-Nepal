/**
 * Shared types for citizenship certificate extraction data
 */

export interface NameField {
  nepali: string;
  english: string;
}

export interface AddressField {
  district: string;
  localLevel: string;
  wardNo: string;
}

export interface ExtractionResult {
  citizenshipNo: string;
  firstName: NameField;
  middleName: NameField;
  lastName: NameField;
  dobBS: string;          // "YYYY-MM-DD" in BS
  dobAD: string;          // "YYYY-MM-DD" in AD (converted from BS)
  birthPlace: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  fatherFirstName: NameField;
  fatherMiddleName: NameField;
  fatherLastName: NameField;
  motherFirstName: NameField;
  motherMiddleName: NameField;
  motherLastName: NameField;
  grandfatherFirstName: NameField;
  grandfatherMiddleName: NameField;
  grandfatherLastName: NameField;
  permanentAddress: AddressField;
  issuingDistrict: string;
  issueDateBS: string;    // "YYYY-MM-DD" in BS
  issuingAuthority: string;
  confidence: number;     // 0.0–1.0 overall extraction confidence
}

/** API response wrapper */
export interface ExtractResponse {
  success: boolean;
  data?: ExtractionResult;
  error?: string;
}
