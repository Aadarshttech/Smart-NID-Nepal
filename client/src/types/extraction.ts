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

export interface FamilyMemberDetails {
  ccNumber: string;
  nin: string;
  nationality: string;
  addressSameAsApplicant?: boolean;
  address?: AddressField;
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
  issueDateBS: string;
  issuingAuthority: string;
  confidence: number;
}

/** ── User-Entered Fields (NOT on citizenship certificate) ── */
export interface AdditionalFields {
  // Applicant Data — Additional Information
  appointmentLocation: string;
  appointmentDate: string;
  appointmentTimeSlot: string;
  maritalStatus: string;        // DoNIDCR: "1"=Married, "2"=Single, etc.
  educationLevel: string;       // DoNIDCR: "1"=Primary ... "9"=PhD
  profession: string;           // DoNIDCR: "1"=Other ... "16"=Social Worker
  caste: string;                // DoNIDCR: "1"=Other ... "100+"
  religion: string;             // DoNIDCR: "1"=Hindu ... "10"=Other
  ccType: string;               // DoNIDCR: "1"=Descent, "2"=Naturalized, etc.
  ccPrevNatCountry: string;
  ccPrevNatRevocationDate: string;

  // Contact Details
  phoneNo: string;
  mobileNo: string;
  temporaryAddressSameAsPermanent: boolean;
  temporaryAddress: AddressField;

  // Family — Status and Details
  fatherStatus: string;         // "1"=Alive, "2"=Death, "3"=Unknown
  fatherDetails: FamilyMemberDetails;
  
  motherStatus: string;         // "1"=Alive, "2"=Death, "3"=Unknown
  motherDetails: FamilyMemberDetails;

  grandfatherDetails: FamilyMemberDetails;

  // Family — Grandmother (not on citizenship)
  grandmotherFirstName: NameField;
  grandmotherMiddleName: NameField;
  grandmotherLastName: NameField;
  grandmotherDetails: FamilyMemberDetails;

  // Family — Spouse (if married)
  spouseFirstName: NameField;
  spouseMiddleName: NameField;
  spouseLastName: NameField;
  spouseDetails: FamilyMemberDetails;

  // Guardian
  guardianName: NameField;
  guardianDetails: FamilyMemberDetails;
  guardianAddress: AddressField;
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
  "fatherFirstName",
  "motherFirstName",
  "grandfatherFirstName",
  "issuingDistrict",
  "issueDateBS",
];

/* ── Dropdown Options (matching DoNIDCR values exactly) ─────── */

export const MARITAL_STATUS_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Married/विवाहित" },
  { val: "2", text: "Single/अविवाहित" },
  { val: "3", text: "Widowed/एकल महिला" },
  { val: "4", text: "Divorced/सम्बन्ध विच्छेद" },
  { val: "5", text: "Widower/विदुर" }
];

export const EDUCATION_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Primary/प्राथमिक तह" },
  { val: "2", text: "Lower Secondary/निम्न माध्यामिक तह" },
  { val: "3", text: "Secondary/माध्यामिक तह" },
  { val: "4", text: "Higher Secondary/उच्च माध्यामिक तह" },
  { val: "5", text: "Intermediate/प्रमाणपत्र तह" },
  { val: "6", text: "Bachelor's Degree/स्नातक तह" },
  { val: "7", text: "Master's Degree/स्नाकोत्तर तह" },
  { val: "8", text: "Master of Philosophy/दर्शनशास्त्रमा स्नाकोत्तर" },
  { val: "9", text: "Doctor of Philosophy/विद्यावारिधी" }
];

export const PROFESSION_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Other" },
  { val: "2", text: "Farmer/कृषक" },
  { val: "3", text: "Teacher/शिक्षक" },
  { val: "4", text: "Government Service/सरकारी सेवा" },
  { val: "5", text: "Professor/प्राध्यापक" },
  { val: "6", text: "Student/विद्यार्थी" },
  { val: "7", text: "Foreign Employment/वैदेशिक रोजगार" },
  { val: "8", text: "Service/जागिर" },
  { val: "9", text: "Lawyer/वकिल" },
  { val: "10", text: "Journalist/पत्रकार" },
  { val: "11", text: "Charter Accountant/चार्टर एकाउन्टेन्ट" },
  { val: "12", text: "Businessman/व्यवसायी" },
  { val: "13", text: "Engineer/इन्जिनियर" },
  { val: "14", text: "Doctor/डाक्टर" },
  { val: "15", text: "Pilot/विमान चालक" },
  { val: "16", text: "Social Worker/समाजसेवी" }
];

export const CC_TYPE_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Citizenship by Descent/वंशज" },
  { val: "2", text: "Naturalized Citizenship/अङ्गिकृत" },
  { val: "3", text: "Naturalized Citizenship by Marriage/वैवाहिक अङ्गिकृत" },
  { val: "4", text: "Citizenship by Birth/जन्मको आधारमा" },
  { val: "5", text: "Citizenship at Birth/जन्मसिद्ध" },
  { val: "6", text: "Honorary Citizenship/सम्मानार्थ" }
];

export const PROVINCE_OPTIONS = [
  { val: "", text: "-- Select Province / प्रदेश छान्नुहोस् --" },
  { val: "1", text: "Koshi/कोशी" },
  { val: "2", text: "Madhesh/मधेश" },
  { val: "3", text: "Bagmati/बागमती" },
  { val: "4", text: "Gandaki/गण्डकी" },
  { val: "5", text: "Lumbini/लुम्बिनी" },
  { val: "6", text: "Karnali/कर्णाली" },
  { val: "7", text: "Sudurpashchim/सुदूरपश्चिम" }
];

export const DISTRICT_OPTIONS = [
  { val: "", text: "-- Select District / जिल्ला छान्नुहोस् --" },
  { val: "1", text: "Taplejung/ताप्लेजुङ" },
  { val: "2", text: "Panchthar/पाँचथर" },
  { val: "3", text: "Ilam/इलाम" },
  { val: "4", text: "Sankhuwasabha/संखुवासभा" },
  { val: "5", text: "Tehrathum/तेह्रथुम" },
  { val: "6", text: "Dhankuta/धनकुटा" },
  { val: "7", text: "Bhojpur/भोजपुर" },
  { val: "8", text: "Khotang/खोटाङ" },
  { val: "9", text: "Solukhumbu/सोलुखुम्बु" },
  { val: "10", text: "Okhaldhunga/ओखलढुङ्गा" },
  { val: "11", text: "Udayapur/उदयपुर" },
  { val: "12", text: "Jhapa/झापा" },
  { val: "13", text: "Morang/मोरङ" },
  { val: "14", text: "Sunsari/सुनसरी" },
  { val: "15", text: "Saptari/सप्तरी" },
  { val: "16", text: "Siraha/सिराहा" },
  { val: "17", text: "Dhanusha/धनुषा" },
  { val: "18", text: "Mahottari/महोत्तरी" },
  { val: "19", text: "Sarlahi/सर्लाही" },
  { val: "20", text: "Rautahat/रौतहट" },
  { val: "21", text: "Bara/बारा" },
  { val: "22", text: "Parsa/पर्सा" },
  { val: "23", text: "Dolakha/दोलखा" },
  { val: "24", text: "Ramechhap/रामेछाप" },
  { val: "25", text: "Sindhuli/सिन्धुली" },
  { val: "26", text: "Kavrepalanchock/काभ्रेपलाञ्चोक" },
  { val: "27", text: "Sindhupalchowk/सिन्धुपाल्चोक" },
  { val: "28", text: "Rasuwa/रसुवा" },
  { val: "29", text: "Nuwakot/नुवाकोट" },
  { val: "30", text: "Dhading/धादिङ" },
  { val: "31", text: "Chitwan/चितवन" },
  { val: "32", text: "Makawanpur/मकवानपुर" },
  { val: "33", text: "Bhaktapur/भक्तपुर" },
  { val: "34", text: "Lalitpur/ललितपुर" },
  { val: "35", text: "Kathmandu/काठमाडौं" },
  { val: "36", text: "Gorkha/गोरखा" },
  { val: "37", text: "Lamjung/लमजुङ" },
  { val: "38", text: "Tanahun/तनहुँ" },
  { val: "39", text: "Kaski/कास्की" },
  { val: "40", text: "Manang/मनाङ" },
  { val: "41", text: "Mustang/मुस्ताङ" },
  { val: "42", text: "Parbat/पर्वत" },
  { val: "43", text: "Syangja/स्याङ्जा" },
  { val: "44", text: "Myagdi/म्याग्दी" },
  { val: "45", text: "Baglung/बागलुङ" },
  { val: "46", text: "Nawalparasi (East of Bardaghat Susta)/नवलपरासी (बर्दघाट सुस्ता पूर्व)" },
  { val: "47", text: "Nawalparasi (West of Bardaghat Susta)/ नवलपरासी (बर्दघाट सुस्ता पश्चिम)" },
  { val: "48", text: "Rupandehi/रुपन्देही" },
  { val: "49", text: "Kapilvastu/कपिलवस्तु" },
  { val: "50", text: "Palpa/पाल्पा" },
  { val: "51", text: "Arghakhanchi/अर्घाखाँची" },
  { val: "52", text: "Gulmi/गुल्मी" },
  { val: "53", text: "Rukum (Eastern Part)/ रुकुम (पूर्वी भाग)" },
  { val: "54", text: "Rolpa/रोल्पा" },
  { val: "55", text: "Pyuthan/प्युठान" },
  { val: "56", text: "Dang/दाङ" },
  { val: "57", text: "Banke/बाँके" },
  { val: "58", text: "Bardiya/बर्दिया" },
  { val: "59", text: "Rukum (Western Part)/रुकुम (पश्चिम भाग)" },
  { val: "60", text: "Salyan/सल्यान" },
  { val: "61", text: "Dolpa/डोल्पा" },
  { val: "62", text: "Jumla/जुम्ला" },
  { val: "63", text: "Mugu/मुगु" },
  { val: "64", text: "Humla/हुम्ला" },
  { val: "65", text: "Kalikot/कालिकोट" },
  { val: "66", text: "Jajarkot/जाजरकोट" },
  { val: "67", text: "Dailekh/दैलेख" },
  { val: "68", text: "Surkhet/सुर्खेत" },
  { val: "69", text: "Bajura/बाजुरा" },
  { val: "70", text: "Bajhang/बझाङ" },
  { val: "71", text: "Doti/डोटी" },
  { val: "72", text: "Achham/अछाम" },
  { val: "73", text: "Darchula/दार्चुला" },
  { val: "74", text: "Baitadi/बैतडी" },
  { val: "75", text: "Dadeldhura/डडेल्धुरा" },
  { val: "76", text: "Kanchanpur/कञ्चनपुर" },
  { val: "77", text: "Kailali/कैलाली" }
];

export const RELIGION_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Other" },
  { val: "2", text: "Hindu/हिन्दु" },
  { val: "3", text: "Bouddha/बौद्ध" },
  { val: "4", text: "Islam/ईस्लाम" },
  { val: "5", text: "Kirat/किरात" },
  { val: "6", text: "Jain/जैन" },
  { val: "7", text: "Christian/क्रिश्चियन" },
  { val: "8", text: "Shikha/शिख" },
  { val: "9", text: "Bahai/बहाई" }
];

export const CASTE_OPTIONS = [
  { val: "", text: "-- Select / छान्नुहोस् --" },
  { val: "1", text: "Other" },
  { val: "2", text: "Chhetree/क्षेत्री" },
  { val: "3", text: "Brahman Hill/ब्राम्हण पहाडी" },
  { val: "4", text: "Brahman/ब्राम्हण" },
  { val: "5", text: "Magar/मगर" },
  { val: "6", text: "Tharu/थारु" },
  { val: "7", text: "Tamang/तामाङ" },
  { val: "8", text: "Newar/नेवार" },
  { val: "9", text: "Musalman/मुसलमान" },
  { val: "10", text: "Bishwakarma/विश्वकर्मा" },
  { val: "11", text: "Yadav/यादव" },
  { val: "12", text: "Rai/राई" },
  { val: "13", text: "Gurung/गुरुङ" },
  { val: "14", text: "Pariyar/परियार" },
  { val: "15", text: "Dholi/ढोली" },
  { val: "16", text: "Limbu/लिम्बु" },
  { val: "17", text: "Thakuri/ठकुरी" },
  { val: "18", text: "Mijar/मिजार" },
  { val: "19", text: "Teli/तेली" },
  { val: "20", text: "Chamar/चamar" },
  { val: "21", text: "Harijan/हरिजन" },
  { val: "22", text: "Ram/राम" },
  { val: "23", text: "Koiri/कोइरी" },
  { val: "24", text: "Kushwaha/कुशवाहा" },
  { val: "25", text: "Kurmi/कुर्मी" },
  { val: "26", text: "Sanyasi/सन्यासी" },
  { val: "27", text: "Dasnami/दशनामी" },
  { val: "28", text: "Dhanuk/धानुक" },
  { val: "29", text: "Musahar/मुसहर" },
  { val: "30", text: "Dusadh/दुसाध" },
  { val: "31", text: "Pasawan/पासवान" },
  { val: "32", text: "Pasi/पासी" },
  { val: "33", text: "Sherpa/शेर्पा" },
  { val: "34", text: "Sonar/सोनार" },
  { val: "35", text: "Kewat/केवट" },
  { val: "36", text: "Brahman Tarai/ब्राम्हण तराइ" },
  { val: "37", text: "Kathabaniyan/कथवनीया" },
  { val: "38", text: "Gharti/घर्ती" },
  { val: "39", text: "Bhujel/भुजेल" },
  { val: "40", text: "Mallaha/मल्लाह" },
  { val: "41", text: "Kalwar/कलवार" },
  { val: "42", text: "Kumal/कुमाल" },
  { val: "43", text: "Hajam/हजाम" },
  { val: "44", text: "Thakur/ठाकुर" },
  { val: "45", text: "Kanu/कानु" },
  { val: "46", text: "Rajbansi/राजवंशी" },
  { val: "47", text: "Sunuwar/सुनुवार" },
  { val: "48", text: "Sudhi/सुढी" },
  { val: "49", text: "Lohar/लोहार" },
  { val: "50", text: "Tatma/तत्मा" },
  { val: "51", text: "Tatwa/तत्वा" },
  { val: "52", text: "Khatwe/खत्वे" },
  { val: "53", text: "Dhobi/धोवी" },
  { val: "54", text: "Majhi/माझी" },
  { val: "55", text: "Nuniya/नुनीया" },
  { val: "56", text: "Kumhar/कम्हार" },
  { val: "57", text: "Danuwar/दनुवार" },
  { val: "58", text: "Chepang/चेपाङ" },
  { val: "59", text: "Praja/प्रजा" },
  { val: "60", text: "Halwai/हलुवाइ" },
  { val: "61", text: "Rajput/राजपुत" },
  { val: "62", text: "Kayastha/कायस्थ" },
  { val: "63", text: "Badhaee/बढई" },
  { val: "64", text: "Marwadi/मारवाडी" },
  { val: "65", text: "Satar/सतार" },
  { val: "66", text: "Santhal/सन्थाल" },
  { val: "67", text: "Jhangad/झाँगड" },
  { val: "68", text: "Dhagar/धागर" },
  { val: "69", text: "Bantar/बाँतर" },
  { val: "70", text: "Sardar/सरदार" },
  { val: "71", text: "Baraee/बरई" },
  { val: "72", text: "Kahar/कहर" },
  { val: "73", text: "Gangai/गनगाई" },
  { val: "74", text: "Lodh/लोध" },
  { val: "75", text: "Rajbhar/राजभर" },
  { val: "76", text: "Thami/थामी" },
  { val: "77", text: "Dhimal/धिमाल" },
  { val: "78", text: "Bhote/भोटे" },
  { val: "79", text: "Bin/बिन" },
  { val: "80", text: "Gaderi/गडेरी" },
  { val: "81", text: "Bhedihar/सरदार" },
  { val: "82", text: "Nurang/नुराङ" },
  { val: "83", text: "Yakkha/याक्खा" },
  { val: "84", text: "Darai/दराइ" },
  { val: "85", text: "Tajpuriya/ताजपुरीया" },
  { val: "86", text: "Thakali/थकाली" },
  { val: "87", text: "Chidimar/चिडिमार" },
  { val: "88", text: "Pahari/पहरी" },
  { val: "89", text: "Mali/माली" },
  { val: "90", text: "Bangali/बंगाली" },
  { val: "91", text: "Chhantyal/छन्त्याल" },
  { val: "92", text: "Dom/डोम" },
  { val: "93", text: "Kamar/कमर" },
  { val: "94", text: "Bote/बोटे" },
  { val: "95", text: "Brahmu/ब्रम्हु" },
  { val: "96", text: "Baramo/बरामो" },
  { val: "97", text: "Gandharva/गन्धर्व" },
  { val: "98", text: "Jirel/जिरेल" },
  { val: "99", text: "Dura/दुरा" },
  { val: "100", text: "Badi/बादी" },
  { val: "101", text: "Meche/मेचे" },
  { val: "102", text: "Lepcha/लेप्चा" },
  { val: "103", text: "Halkhor/हलखोर" },
  { val: "104", text: "Punjabi/पंजाबी" },
  { val: "105", text: "Sikh/सिख" },
  { val: "106", text: "Kisan/किसान" },
  { val: "107", text: "Raji/राजी" },
  { val: "108", text: "Byasi/व्यासी" },
  { val: "109", text: "Sauka/सिख" },
  { val: "110", text: "Hayu/हायु" },
  { val: "111", text: "Koche/कोचे" },
  { val: "112", text: "Dhunia/धुनीया" },
  { val: "113", text: "Walung/वालुङ" },
  { val: "114", text: "Munda/मुण्डा" },
  { val: "115", text: "Raute/राउटे" },
  { val: "116", text: "Hyolmo/ह्योल्मो" },
  { val: "117", text: "Pattharkatta/पथरकट्टा" },
  { val: "118", text: "Kushwadiya/सिख" },
  { val: "119", text: "Kusunda/कुसुन्डा" },
  { val: "120", text: "Lhomi/ल्होमी" },
  { val: "121", text: "Kalar/कलार" },
  { val: "122", text: "Natuwa/नटुवा" },
  { val: "123", text: "Dhandi/ढाँडी" },
  { val: "124", text: "Dhankar/धन्कार" },
  { val: "125", text: "Dharikar/धरिकार" },
  { val: "126", text: "Kulung/कुलुङ" },
  { val: "127", text: "Ghale/घले" },
  { val: "128", text: "Khawas/खवास" },
  { val: "129", text: "Rajdhob/राजधोव" },
  { val: "130", text: "Kori/कोरी" },
  { val: "131", text: "Nachhiring/नाछिरिङ" },
  { val: "132", text: "Yamphu/याम्फु" },
  { val: "133", text: "Chamling/चाम्लिङ" },
  { val: "134", text: "Aathpariya/आठपहरिया" },
  { val: "135", text: "Sarbaria/सरवरिया" },
  { val: "136", text: "Bantaba/बान्तवा" },
  { val: "137", text: "Dolpo/डोल्पो" },
  { val: "138", text: "Amat/अमात" },
  { val: "139", text: "Thulung/थुलुङ" },
  { val: "140", text: "Mewahang Bala/मेवाहाङ वाला" },
  { val: "141", text: "Bahing/बाहिङ" },
  { val: "142", text: "Lhopa/ल्होपा" },
  { val: "143", text: "Dev/देव" },
  { val: "144", text: "Samgpang/साङपाङ" },
  { val: "145", text: "Khaling/खालिङ" },
  { val: "146", text: "Topkegola/तोप्केगोला" },
  { val: "147", text: "Loharung/लोहोरुङ" },
  { val: "148", text: "Dalit Others/अन्य दलित" },
  { val: "149", text: "Janajati Others/अन्य जनजाति" },
  { val: "150", text: "Terai Others/अन्य तराइ" },
  { val: "151", text: "Undefined Others/अन्य उल्लेख नभएको" },
  { val: "152", text: "Foreigner/विदेशी" },
  { val: "153", text: "Pun/पुन" }
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
