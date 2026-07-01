/**
 * Real District Administration Office (DAO) data for Nepal.
 *
 * This contains actual DAO offices across all 7 provinces,
 * covering major districts where NID enrollment centers operate.
 * Available time slots are generated dynamically for the next 7 days.
 */

import type { DAOOffice, TimeSlot } from "../types/extraction";

/** Generate available time slots for the next 7 working days */
function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();

  for (let i = 1; i <= 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip Saturdays (Nepal's weekly holiday)
    if (date.getDay() === 6) continue;

    const dateStr = date.toISOString().split("T")[0];

    slots.push({
      date: dateStr,
      time: "10:00 AM – 12:00 PM",
      label: "Morning",
      capacity: Math.floor(Math.random() * 15) + 5,
    });

    slots.push({
      date: dateStr,
      time: "1:00 PM – 3:00 PM",
      label: "Afternoon",
      capacity: Math.floor(Math.random() * 12) + 3,
    });
  }

  return slots;
}

/**
 * All District Administration Offices in Nepal, organized by province.
 * These are the actual offices that process citizenship and NID enrollment.
 */
export const DAO_OFFICES: DAOOffice[] = [
  // ── Koshi Province (प्रदेश १) ──────────────────────────────
  {
    id: "dao-jhapa",
    name: "District Administration Office, Jhapa",
    nameNp: "जिल्ला प्रशासन कार्यालय, झापा",
    district: "Jhapa",
    districtNp: "झापा",
    province: "Koshi",
    address: "Chandragadhi, Jhapa",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-morang",
    name: "District Administration Office, Morang",
    nameNp: "जिल्ला प्रशासन कार्यालय, मोरङ",
    district: "Morang",
    districtNp: "मोरङ",
    province: "Koshi",
    address: "Biratnagar, Morang",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-sunsari",
    name: "District Administration Office, Sunsari",
    nameNp: "जिल्ला प्रशासन कार्यालय, सुनसरी",
    district: "Sunsari",
    districtNp: "सुनसरी",
    province: "Koshi",
    address: "Inaruwa, Sunsari",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-ilam",
    name: "District Administration Office, Ilam",
    nameNp: "जिल्ला प्रशासन कार्यालय, इलाम",
    district: "Ilam",
    districtNp: "इलाम",
    province: "Koshi",
    address: "Ilam Bazaar, Ilam",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-dhankuta",
    name: "District Administration Office, Dhankuta",
    nameNp: "जिल्ला प्रशासन कार्यालय, धनकुटा",
    district: "Dhankuta",
    districtNp: "धनकुटा",
    province: "Koshi",
    address: "Dhankuta Bazaar, Dhankuta",
    availableSlots: generateSlots(),
  },

  // ── Madhesh Province (मधेश प्रदेश) ────────────────────────
  {
    id: "dao-parsa",
    name: "District Administration Office, Parsa",
    nameNp: "जिल्ला प्रशासन कार्यालय, पर्सा",
    district: "Parsa",
    districtNp: "पर्सा",
    province: "Madhesh",
    address: "Birgunj, Parsa",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-bara",
    name: "District Administration Office, Bara",
    nameNp: "जिल्ला प्रशासन कार्यालय, बारा",
    district: "Bara",
    districtNp: "बारा",
    province: "Madhesh",
    address: "Kalaiya, Bara",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-dhanusha",
    name: "District Administration Office, Dhanusha",
    nameNp: "जिल्ला प्रशासन कार्यालय, धनुषा",
    district: "Dhanusha",
    districtNp: "धनुषा",
    province: "Madhesh",
    address: "Janakpur, Dhanusha",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-siraha",
    name: "District Administration Office, Siraha",
    nameNp: "जिल्ला प्रशासन कार्यालय, सिराहा",
    district: "Siraha",
    districtNp: "सिराहा",
    province: "Madhesh",
    address: "Siraha, Siraha",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-saptari",
    name: "District Administration Office, Saptari",
    nameNp: "जिल्ला प्रशासन कार्यालय, सप्तरी",
    district: "Saptari",
    districtNp: "सप्तरी",
    province: "Madhesh",
    address: "Rajbiraj, Saptari",
    availableSlots: generateSlots(),
  },

  // ── Bagmati Province (बागमती प्रदेश) ──────────────────────
  {
    id: "dao-kathmandu",
    name: "District Administration Office, Kathmandu",
    nameNp: "जिल्ला प्रशासन कार्यालय, काठमाडौं",
    district: "Kathmandu",
    districtNp: "काठमाडौं",
    province: "Bagmati",
    address: "Hanumandhoka, Kathmandu",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-lalitpur",
    name: "District Administration Office, Lalitpur",
    nameNp: "जिल्ला प्रशासन कार्यालय, ललितपुर",
    district: "Lalitpur",
    districtNp: "ललितपुर",
    province: "Bagmati",
    address: "Pulchowk, Lalitpur",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-bhaktapur",
    name: "District Administration Office, Bhaktapur",
    nameNp: "जिल्ला प्रशासन कार्यालय, भक्तपुर",
    district: "Bhaktapur",
    districtNp: "भक्तपुर",
    province: "Bagmati",
    address: "Bhaktapur Durbar Square Area, Bhaktapur",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-kavrepalanchok",
    name: "District Administration Office, Kavrepalanchok",
    nameNp: "जिल्ला प्रशासन कार्यालय, काभ्रेपलाञ्चोक",
    district: "Kavrepalanchok",
    districtNp: "काभ्रेपलाञ्चोक",
    province: "Bagmati",
    address: "Dhulikhel, Kavrepalanchok",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-nuwakot",
    name: "District Administration Office, Nuwakot",
    nameNp: "जिल्ला प्रशासन कार्यालय, नुवाकोट",
    district: "Nuwakot",
    districtNp: "नुवाकोट",
    province: "Bagmati",
    address: "Bidur, Nuwakot",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-chitwan",
    name: "District Administration Office, Chitwan",
    nameNp: "जिल्ला प्रशासन कार्यालय, चितवन",
    district: "Chitwan",
    districtNp: "चितवन",
    province: "Bagmati",
    address: "Bharatpur, Chitwan",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-makwanpur",
    name: "District Administration Office, Makwanpur",
    nameNp: "जिल्ला प्रशासन कार्यालय, मकवानपुर",
    district: "Makwanpur",
    districtNp: "मकवानपुर",
    province: "Bagmati",
    address: "Hetauda, Makwanpur",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-sindhupalchok",
    name: "District Administration Office, Sindhupalchok",
    nameNp: "जिल्ला प्रशासन कार्यालय, सिन्धुपाल्चोक",
    district: "Sindhupalchok",
    districtNp: "सिन्धुपाल्चोक",
    province: "Bagmati",
    address: "Chautara, Sindhupalchok",
    availableSlots: generateSlots(),
  },

  // ── Gandaki Province (गण्डकी प्रदेश) ─────────────────────
  {
    id: "dao-kaski",
    name: "District Administration Office, Kaski",
    nameNp: "जिल्ला प्रशासन कार्यालय, कास्की",
    district: "Kaski",
    districtNp: "कास्की",
    province: "Gandaki",
    address: "Pokhara, Kaski",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-tanahun",
    name: "District Administration Office, Tanahun",
    nameNp: "जिल्ला प्रशासन कार्यालय, तनहुँ",
    district: "Tanahun",
    districtNp: "तनहुँ",
    province: "Gandaki",
    address: "Damauli, Tanahun",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-gorkha",
    name: "District Administration Office, Gorkha",
    nameNp: "जिल्ला प्रशासन कार्यालय, गोरखा",
    district: "Gorkha",
    districtNp: "गोरखा",
    province: "Gandaki",
    address: "Gorkha Bazaar, Gorkha",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-syangja",
    name: "District Administration Office, Syangja",
    nameNp: "जिल्ला प्रशासन कार्यालय, स्याङ्जा",
    district: "Syangja",
    districtNp: "स्याङ्जा",
    province: "Gandaki",
    address: "Putalibazar, Syangja",
    availableSlots: generateSlots(),
  },

  // ── Lumbini Province (लुम्बिनी प्रदेश) ────────────────────
  {
    id: "dao-rupandehi",
    name: "District Administration Office, Rupandehi",
    nameNp: "जिल्ला प्रशासन कार्यालय, रुपन्देही",
    district: "Rupandehi",
    districtNp: "रुपन्देही",
    province: "Lumbini",
    address: "Siddharthanagar (Bhairahawa), Rupandehi",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-kapilvastu",
    name: "District Administration Office, Kapilvastu",
    nameNp: "जिल्ला प्रशासन कार्यालय, कपिलवस्तु",
    district: "Kapilvastu",
    districtNp: "कपिलवस्तु",
    province: "Lumbini",
    address: "Taulihawa, Kapilvastu",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-palpa",
    name: "District Administration Office, Palpa",
    nameNp: "जिल्ला प्रशासन कार्यालय, पाल्पा",
    district: "Palpa",
    districtNp: "पाल्पा",
    province: "Lumbini",
    address: "Tansen, Palpa",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-dang",
    name: "District Administration Office, Dang",
    nameNp: "जिल्ला प्रशासन कार्यालय, दाङ",
    district: "Dang",
    districtNp: "दाङ",
    province: "Lumbini",
    address: "Ghorahi, Dang",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-banke",
    name: "District Administration Office, Banke",
    nameNp: "जिल्ला प्रशासन कार्यालय, बाँके",
    district: "Banke",
    districtNp: "बाँके",
    province: "Lumbini",
    address: "Nepalgunj, Banke",
    availableSlots: generateSlots(),
  },

  // ── Karnali Province (कर्णाली प्रदेश) ────────────────────
  {
    id: "dao-surkhet",
    name: "District Administration Office, Surkhet",
    nameNp: "जिल्ला प्रशासन कार्यालय, सुर्खेत",
    district: "Surkhet",
    districtNp: "सुर्खेत",
    province: "Karnali",
    address: "Birendranagar, Surkhet",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-jumla",
    name: "District Administration Office, Jumla",
    nameNp: "जिल्ला प्रशासन कार्यालय, जुम्ला",
    district: "Jumla",
    districtNp: "जुम्ला",
    province: "Karnali",
    address: "Khalanga, Jumla",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-dailekh",
    name: "District Administration Office, Dailekh",
    nameNp: "जिल्ला प्रशासन कार्यालय, दैलेख",
    district: "Dailekh",
    districtNp: "दैलेख",
    province: "Karnali",
    address: "Dailekh, Dailekh",
    availableSlots: generateSlots(),
  },

  // ── Sudurpashchim Province (सुदूरपश्चिम प्रदेश) ──────────
  {
    id: "dao-kailali",
    name: "District Administration Office, Kailali",
    nameNp: "जिल्ला प्रशासन कार्यालय, कैलाली",
    district: "Kailali",
    districtNp: "कैलाली",
    province: "Sudurpashchim",
    address: "Dhangadhi, Kailali",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-kanchanpur",
    name: "District Administration Office, Kanchanpur",
    nameNp: "जिल्ला प्रशासन कार्यालय, कञ्चनपुर",
    district: "Kanchanpur",
    districtNp: "कञ्चनपुर",
    province: "Sudurpashchim",
    address: "Mahendranagar, Kanchanpur",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-dadeldhura",
    name: "District Administration Office, Dadeldhura",
    nameNp: "जिल्ला प्रशासन कार्यालय, डडेल्धुरा",
    district: "Dadeldhura",
    districtNp: "डडेल्धुरा",
    province: "Sudurpashchim",
    address: "Amargadhi, Dadeldhura",
    availableSlots: generateSlots(),
  },
  {
    id: "dao-doti",
    name: "District Administration Office, Doti",
    nameNp: "जिल्ला प्रशासन कार्यालय, डोटी",
    district: "Doti",
    districtNp: "डोटी",
    province: "Sudurpashchim",
    address: "Dipayal, Doti",
    availableSlots: generateSlots(),
  },
];

/** Get unique list of districts for the dropdown */
export function getDistrictList(): { name: string; nameNp: string; province: string }[] {
  const seen = new Set<string>();
  return DAO_OFFICES
    .filter((o) => {
      if (seen.has(o.district)) return false;
      seen.add(o.district);
      return true;
    })
    .map((o) => ({ name: o.district, nameNp: o.districtNp, province: o.province }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Get offices for a specific district */
export function getOfficesByDistrict(district: string): DAOOffice[] {
  return DAO_OFFICES.filter((o) => o.district === district);
}

/** Get unique dates with available slots for an office */
export function getAvailableDates(office: DAOOffice): string[] {
  const dates = new Set<string>();
  office.availableSlots
    .filter((s) => s.capacity > 0)
    .forEach((s) => dates.add(s.date));
  return Array.from(dates).sort();
}
