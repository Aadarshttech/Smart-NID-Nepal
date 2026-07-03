/**
 * Shared types for citizenship certificate extraction data
 * AND additional DoNIDCR enrollment fields.
 *
 * Fields are split into two categories:
 * - AI-extracted: Populated automatically from citizenship certificate OCR
 * - User-entered: Must be filled manually by the user (not on citizenship)
 */

export interface NameField {
  nepali: string;
  english: string;
}

export interface AddressField {
  province: string;
  district: string;
  localLevel: string;
  wardNo: string;
  villageToleNp: string;
  villageToleEn: string;
}

/** ── AI-Extracted Fields (from citizenship certificate) ── */
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

/** ── User-Entered Fields (NOT on citizenship certificate) ── */
export interface AdditionalFields {
  // Applicant Data — Additional Information
  maritalStatus: string;        // DoNIDCR: "1"=Married, "2"=Single, etc.
  educationLevel: string;       // DoNIDCR: "1"=Primary ... "9"=PhD
  profession: string;           // DoNIDCR: "1"=Other ... "16"=Social Worker
  caste: string;                // DoNIDCR: "1"=Other ... "100+"
  religion: string;             // DoNIDCR: "1"=Hindu ... "10"=Other
  ccType: string;               // DoNIDCR: "1"=Descent, "2"=Naturalized, etc.

  // Contact Details
  phoneNo: string;
  mobileNo: string;
  temporaryAddressSameAsPermanent: boolean;
  temporaryAddress: AddressField;

  // Family — Grandmother (not on citizenship)
  grandmotherName: NameField;

  // Family — Spouse (if married)
  spouseFirstName: NameField;
  spouseMiddleName: NameField;
  spouseLastName: NameField;
}

/** Combined payload: AI-extracted + user-entered */
export interface FullEnrollmentData extends ExtractionResult {
  additional: AdditionalFields;
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

/* ── Dropdown Options (matching DoNIDCR values exactly) ─────── */

export const MARITAL_STATUS_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Married / विवाहित" },
  { val: "2", text: "Single / अविवाहित" },
  { val: "3", text: "Widowed / एकल महिला" },
  { val: "4", text: "Divorced / सम्बन्ध विच्छेद" },
  { val: "5", text: "Widower / विदुर" },
];

export const EDUCATION_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Primary / प्राथमिक तह" },
  { val: "2", text: "Lower Secondary / निम्न माध्यामिक तह" },
  { val: "3", text: "Secondary / माध्यामिक तह" },
  { val: "4", text: "Higher Secondary / उच्च माध्यामिक तह" },
  { val: "5", text: "Intermediate / प्रमाणपत्र तह" },
  { val: "6", text: "Bachelor's Degree / स्नातक तह" },
  { val: "7", text: "Master's Degree / स्नाकोत्तर तह" },
  { val: "8", text: "Master of Philosophy / दर्शनशास्त्रमा स्नाकोत्तर" },
  { val: "9", text: "Doctor of Philosophy / विद्यावारिधी" },
];

export const PROFESSION_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Other" },
  { val: "2", text: "Farmer / कृषक" },
  { val: "3", text: "Teacher / शिक्षक" },
  { val: "4", text: "Government Service / सरकारी सेवा" },
  { val: "5", text: "Professor / प्राध्यापक" },
  { val: "6", text: "Student / विद्यार्थी" },
  { val: "7", text: "Foreign Employment / वैदेशिक रोजगार" },
  { val: "8", text: "Service / जागिर" },
  { val: "9", text: "Lawyer / वकिल" },
  { val: "10", text: "Journalist / पत्रकार" },
  { val: "11", text: "Charter Accountant / चार्टर एकाउन्टेन्ट" },
  { val: "12", text: "Businessman / व्यवसायी" },
  { val: "13", text: "Engineer / इन्जिनियर" },
  { val: "14", text: "Doctor / डाक्टर" },
  { val: "15", text: "Pilot / विमान चालक" },
  { val: "16", text: "Social Worker / समाजसेवी" },
];

export const CC_TYPE_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Citizenship by Descent / वंशज" },
  { val: "2", text: "Naturalized Citizenship / अङ्गिकृत" },
  { val: "3", text: "Naturalized by Marriage / वैवाहिक अङ्गिकृत" },
  { val: "4", text: "Citizenship by Birth / जन्मको आधारमा" },
  { val: "5", text: "Citizenship at Birth / जन्मसिद्ध" },
  { val: "6", text: "Honorary Citizenship / सम्मानार्थ" },
];

export const PROVINCE_OPTIONS = [
  { val: "", text: "-- Select Province / प्रदेश छान्नुहोस् --" },
  { val: "1", text: "Koshi Province / कोशी प्रदेश" },
  { val: "2", text: "Madhesh Province / मधेश प्रदेश" },
  { val: "3", text: "Bagmati Province / बागमती प्रदेश" },
  { val: "4", text: "Gandaki Province / गण्डकी प्रदेश" },
  { val: "5", text: "Lumbini Province / लुम्बिनी प्रदेश" },
  { val: "6", text: "Karnali Province / कर्णाली प्रदेश" },
  { val: "7", text: "Sudurpashchim Province / सुदूरपश्चिम प्रदेश" },
];

export const RELIGION_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Other / अन्य" },
  { val: "2", text: "Hindu / हिन्दु" },
  { val: "3", text: "Buddhist / बौद्ध" },
  { val: "4", text: "Islam / इस्लाम" },
  { val: "5", text: "Kirat / किराँत" },
  { val: "6", text: "Christian / ईसाई" },
  { val: "7", text: "Prakriti / प्रकृति" },
  { val: "8", text: "Bon / बोन" },
  { val: "9", text: "Jain / जैन" },
  { val: "10", text: "Bahai / बहाई" },
];

export const CASTE_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Other" },
  { val: "2", text: "Chhetree / क्षेत्री" },
  { val: "3", text: "Brahman Hill / ब्राम्हण पहाडी" },
  { val: "4", text: "Brahman / ब्राम्हण" },
  { val: "5", text: "Magar / मगर" },
  { val: "6", text: "Tharu / थारु" },
  { val: "7", text: "Tamang / तामाङ" },
  { val: "8", text: "Newar / नेवार" },
  { val: "9", text: "Musalman / मुसलमान" },
  { val: "10", text: "Bishwakarma / विश्‍वकर्मा" },
  { val: "11", text: "Yadav / यादव" },
  { val: "12", text: "Rai / राई" },
  { val: "13", text: "Gurung / गुरुङ" },
  { val: "14", text: "Pariyar / परियार" },
  { val: "16", text: "Limbu / लिम्बु" },
  { val: "17", text: "Thakuri / ठकुरी" },
  { val: "33", text: "Sherpa / शेर्पा" },
  { val: "36", text: "Brahman Tarai / ब्राम्हण तराइ" },
  { val: "46", text: "Rajbansi / राजवंशी" },
  { val: "47", text: "Sunuwar / सुनुवार" },
  { val: "54", text: "Majhi / माझी" },
  { val: "61", text: "Rajput / राजपुत" },
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
  additional: AdditionalFields;
  appointment: AppointmentPreferences;
}
