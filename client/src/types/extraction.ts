/**
 * Shared types for citizenship certificate extraction data.
 * Mirrors the server types to maintain type safety across the stack.
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
  dobBS: string;
  dobAD: string;
  birthPlace: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  fatherName: NameField;
  motherName: NameField;
  grandfatherName: NameField;
  permanentAddress: AddressField;
  issuingDistrict: string;
  issueDateBS: string;
  issuingAuthority: string;
  confidence: number;
}

export interface ExtractResponse {
  success: boolean;
  data?: ExtractionResult;
  error?: string;
}

/** Mandatory fields that must be filled for the enrollment */
export const MANDATORY_FIELDS: (keyof ExtractionResult)[] = [
  "citizenshipNo",
  "firstName",
  "lastName",
  "dobBS",
  "dobAD",
  "birthPlace",
  "gender",
  "fatherName",
  "motherName",
  "grandfatherName",
  "issuingDistrict",
  "issueDateBS",
];

/* ── Phase 2: Appointment & Enrollment types ─────────────── */

export interface TimeSlot {
  date: string;        // e.g. "2026-07-07"
  time: string;        // e.g. "10:00 AM – 12:00 PM"
  label: string;       // e.g. "Morning"
  capacity: number;    // remaining slots
}

export interface DAOOffice {
  id: string;
  name: string;
  nameNp: string;
  district: string;
  districtNp: string;
  province: string;
  address: string;
  availableSlots: TimeSlot[];
}

export interface AppointmentPreferences {
  district: string;
  officeId: string;
  officeName: string;
  selectedDate: string;
  selectedSlot: string;
}

/** Combined payload for the full enrollment submission */
export interface EnrollmentPayload {
  personalData: ExtractionResult;
  appointment: AppointmentPreferences;
}
