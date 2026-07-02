/**
 * District name → DoNIDCR numeric value lookup map.
 *
 * The DoNIDCR website uses numeric IDs (1–77) for district dropdowns
 * (birthDistrictPlace, ccIssuingDistrict, permanent address district, etc.).
 *
 * This map allows fuzzy matching from extracted district names (English or
 * Nepali) to the correct numeric value.
 */

export interface DistrictEntry {
  val: string;
  english: string;
  nepali: string;
}

/** All 77 districts of Nepal with their DoNIDCR dropdown values */
export const DISTRICTS: DistrictEntry[] = [
  { val: "1", english: "Taplejung", nepali: "ताप्लेजुङ" },
  { val: "2", english: "Panchthar", nepali: "पाँचथर" },
  { val: "3", english: "Ilam", nepali: "इलाम" },
  { val: "4", english: "Sankhuwasabha", nepali: "संखुवासभा" },
  { val: "5", english: "Tehrathum", nepali: "तेह्रथुम" },
  { val: "6", english: "Dhankuta", nepali: "धनकुटा" },
  { val: "7", english: "Bhojpur", nepali: "भोजपुर" },
  { val: "8", english: "Khotang", nepali: "खोटाङ" },
  { val: "9", english: "Solukhumbu", nepali: "सोलुखुम्बु" },
  { val: "10", english: "Okhaldhunga", nepali: "ओखलढुङ्गा" },
  { val: "11", english: "Udayapur", nepali: "उदयपुर" },
  { val: "12", english: "Jhapa", nepali: "झापा" },
  { val: "13", english: "Morang", nepali: "मोरङ" },
  { val: "14", english: "Sunsari", nepali: "सुनसरी" },
  { val: "15", english: "Saptari", nepali: "सप्तरी" },
  { val: "16", english: "Siraha", nepali: "सिराहा" },
  { val: "17", english: "Dhanusha", nepali: "धनुषा" },
  { val: "18", english: "Mahottari", nepali: "महोत्तरी" },
  { val: "19", english: "Sarlahi", nepali: "सर्लाही" },
  { val: "20", english: "Rautahat", nepali: "रौतहट" },
  { val: "21", english: "Bara", nepali: "बारा" },
  { val: "22", english: "Parsa", nepali: "पर्सा" },
  { val: "23", english: "Dolakha", nepali: "दोलखा" },
  { val: "24", english: "Ramechhap", nepali: "रामेछाप" },
  { val: "25", english: "Sindhuli", nepali: "सिन्धुली" },
  { val: "26", english: "Kavrepalanchock", nepali: "काभ्रेपलाञ्चोक" },
  { val: "27", english: "Sindhupalchowk", nepali: "सिन्धुपाल्चोक" },
  { val: "28", english: "Rasuwa", nepali: "रसुवा" },
  { val: "29", english: "Nuwakot", nepali: "नुवाकोट" },
  { val: "30", english: "Dhading", nepali: "धादिङ" },
  { val: "31", english: "Chitwan", nepali: "चितवन" },
  { val: "32", english: "Makawanpur", nepali: "मकवानपुर" },
  { val: "33", english: "Bhaktapur", nepali: "भक्तपुर" },
  { val: "34", english: "Lalitpur", nepali: "ललितपुर" },
  { val: "35", english: "Kathmandu", nepali: "काठमाडौं" },
  { val: "36", english: "Gorkha", nepali: "गोरखा" },
  { val: "37", english: "Lamjung", nepali: "लमजुङ" },
  { val: "38", english: "Tanahun", nepali: "तनहुँ" },
  { val: "39", english: "Kaski", nepali: "कास्की" },
  { val: "40", english: "Manang", nepali: "मनाङ" },
  { val: "41", english: "Mustang", nepali: "मुस्ताङ" },
  { val: "42", english: "Parbat", nepali: "पर्वत" },
  { val: "43", english: "Syangja", nepali: "स्याङ्जा" },
  { val: "44", english: "Myagdi", nepali: "म्याग्दी" },
  { val: "45", english: "Baglung", nepali: "बागलुङ" },
  { val: "46", english: "Nawalparasi (East of Bardaghat Susta)", nepali: "नवलपरासी (बर्दघाट सुस्ता पूर्व)" },
  { val: "47", english: "Nawalparasi (West of Bardaghat Susta)", nepali: "नवलपरासी (बर्दघाट सुस्ता पश्चिम)" },
  { val: "48", english: "Rupandehi", nepali: "रुपन्देही" },
  { val: "49", english: "Kapilvastu", nepali: "कपिलवस्तु" },
  { val: "50", english: "Palpa", nepali: "पाल्पा" },
  { val: "51", english: "Arghakhanchi", nepali: "अर्घाखाँची" },
  { val: "52", english: "Gulmi", nepali: "गुल्मी" },
  { val: "53", english: "Rukum (Eastern Part)", nepali: "रुकुम (पूर्वी भाग)" },
  { val: "54", english: "Rolpa", nepali: "रोल्पा" },
  { val: "55", english: "Pyuthan", nepali: "प्युठान" },
  { val: "56", english: "Dang", nepali: "दाङ" },
  { val: "57", english: "Banke", nepali: "बाँके" },
  { val: "58", english: "Bardiya", nepali: "बर्दिया" },
  { val: "59", english: "Rukum (Western Part)", nepali: "रुकुम (पश्चिम भाग)" },
  { val: "60", english: "Salyan", nepali: "सल्यान" },
  { val: "61", english: "Dolpa", nepali: "डोल्पा" },
  { val: "62", english: "Jumla", nepali: "जुम्ला" },
  { val: "63", english: "Mugu", nepali: "मुगु" },
  { val: "64", english: "Humla", nepali: "हुम्ला" },
  { val: "65", english: "Kalikot", nepali: "कालिकोट" },
  { val: "66", english: "Jajarkot", nepali: "जाजरकोट" },
  { val: "67", english: "Dailekh", nepali: "दैलेख" },
  { val: "68", english: "Surkhet", nepali: "सुर्खेत" },
  { val: "69", english: "Bajura", nepali: "बाजुरा" },
  { val: "70", english: "Bajhang", nepali: "बझाङ" },
  { val: "71", english: "Doti", nepali: "डोटी" },
  { val: "72", english: "Achham", nepali: "अछाम" },
  { val: "73", english: "Darchula", nepali: "दार्चुला" },
  { val: "74", english: "Baitadi", nepali: "बैतडी" },
  { val: "75", english: "Dadeldhura", nepali: "डडेल्धुरा" },
  { val: "76", english: "Kanchanpur", nepali: "कञ्चनपुर" },
  { val: "77", english: "Kailali", nepali: "कैलाली" },
];

/**
 * Fuzzy-match a district name (English or Nepali) to the DoNIDCR value.
 * Returns the numeric string value, or "" if no match found.
 *
 * Matching strategy:
 * 1. Exact match (case-insensitive) on English or Nepali name
 * 2. Substring match — if the input contains or is contained by a district name
 * 3. For Nawalparasi/Rukum, defaults to the first variant
 */
export function findDistrictValue(input: string): string {
  if (!input || !input.trim()) return "";

  const normalised = input.trim().toLowerCase();

  // 1. Exact match
  for (const d of DISTRICTS) {
    if (d.english.toLowerCase() === normalised || d.nepali === input.trim()) {
      return d.val;
    }
  }

  // 2. Substring match (English)
  for (const d of DISTRICTS) {
    const eng = d.english.toLowerCase();
    if (normalised.includes(eng) || eng.includes(normalised)) {
      return d.val;
    }
  }

  // 3. Substring match (Nepali)
  for (const d of DISTRICTS) {
    if (input.trim().includes(d.nepali) || d.nepali.includes(input.trim())) {
      return d.val;
    }
  }

  return "";
}

/**
 * Map gender from our extraction format to DoNIDCR select value.
 */
export function mapGender(gender: string): string {
  const g = gender.toUpperCase();
  if (g === "MALE") return "M";
  if (g === "FEMALE") return "F";
  if (g === "OTHER") return "O";
  return "";
}
