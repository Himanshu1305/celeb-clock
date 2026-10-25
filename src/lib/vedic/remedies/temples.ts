/**
 * Temples traditionally associated with each remedy (Batch 5, goal d).
 *
 * VERIFICATION RULE: every entry below was checked on 24 Oct 2026 via WebFetch
 * against the page(s) listed in `verifiedFrom` — name, town, district, state and
 * the stated association all come from those pages. Nothing here is from memory.
 * Temples that could not be verified (e.g. Kukke Subramanya for sarpa dosha — the
 * Wikipedia article does not mention it, and the official site could not be
 * fetched) are deliberately LEFT OUT. No official-website links are given because
 * none of the temple sites themselves could be fetched to confirm them.
 *
 * BornClock does not book or sell pujas. Visiting is optional; the free remedies
 * come first.
 */
import type { L10n } from './types';

export interface Temple {
  id: string;
  name: L10n;
  town: string;
  district: string;
  state: string;
  /** What the temple is traditionally associated with — as stated by the source. */
  association: L10n;
  /** Pages this entry was checked against (WebFetch, 24 Oct 2026). */
  verifiedFrom: string[];
}

const WIKI_NAVAGRAHA = 'https://en.wikipedia.org/wiki/Navagraha_temples';
const WIKI_NAVAGRAHA_TN = 'https://en.wikipedia.org/wiki/Navagraha_temples_in_Tamil_Nadu';

export const TEMPLES: Record<string, Temple> = {
  trimbakeshwar: {
    id: 'trimbakeshwar',
    name: { en: 'Trimbakeshwar Jyotirlinga Temple', hi: 'त्र्यंबकेश्वर ज्योतिर्लिंग मंदिर' },
    town: 'Trimbak', district: 'Nashik', state: 'Maharashtra',
    association: {
      en: 'One of the twelve Jyotirlingas. Kalsarpa Shanti, Narayan Nagbali and Tripindi Vidhi are performed here; Narayan Bali is described as a rite for Pitru Dosha (ancestral affliction).',
      hi: 'बारह ज्योतिर्लिंगों में से एक। यहाँ कालसर्प शांति, नारायण नागबलि और त्रिपिंडी विधि की जाती है; नारायण बलि को पितृ दोष के लिए किया जाने वाला अनुष्ठान बताया गया है।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Trimbakeshwar_Shiva_Temple', 'https://en.wikipedia.org/wiki/Narayan_nagbali'],
  },
  srikalahasti: {
    id: 'srikalahasti',
    name: { en: 'Srikalahasteeswara Temple (Srikalahasti)', hi: 'श्रीकालहस्तीश्वर मंदिर (श्रीकालहस्ती)' },
    town: 'Srikalahasti', district: 'Tirupati', state: 'Andhra Pradesh',
    association: {
      en: 'Regarded as the Rahu–Ketu kshetra and famous for the Rahu–Ketu pooja; it stays open during solar and lunar eclipses.',
      hi: 'राहु–केतु क्षेत्र माना जाता है और राहु–केतु पूजा के लिए प्रसिद्ध है; सूर्य और चंद्र ग्रहण के समय भी खुला रहता है।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Srikalahasteeswara_Temple'],
  },
  mangalnath: {
    id: 'mangalnath',
    name: { en: 'Mangalnath Temple', hi: 'मंगलनाथ मंदिर' },
    town: 'Ujjain', district: 'Ujjain', state: 'Madhya Pradesh',
    association: {
      en: 'On the banks of the Shipra; regarded as the birthplace of Mars (Mangal) according to the Matsya Purana, and known for the Mangal-dosha Bhaat Puja.',
      hi: 'शिप्रा नदी के तट पर; मत्स्य पुराण के अनुसार मंगल ग्रह का जन्मस्थान माना जाता है और मंगल दोष निवारण की भात पूजा के लिए प्रसिद्ध है।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Mangalnath_Temple', 'https://www.mptourism.com/mangalnath-temple-ujjain.html', 'https://ujjain.nic.in/en/tourist-place/mangalnath/'],
  },
  shaniShingnapur: {
    id: 'shaniShingnapur',
    name: { en: 'Shani Shingnapur (Shani temple)', hi: 'शनि शिंगणापुर (शनि मंदिर)' },
    town: 'Shani Shingnapur (Nevasa taluka)', district: 'Ahilyanagar (Ahmednagar)', state: 'Maharashtra',
    association: {
      en: 'Known for its Shani (Saturn) shrine — a self-manifested (swayambhu) black stone.',
      hi: 'अपने शनि देव के स्थान के लिए प्रसिद्ध — स्वयंभू काले पत्थर के रूप में।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Shani_Shingnapur'],
  },
  thirunallar: {
    id: 'thirunallar',
    name: { en: 'Thirunallar Dharbaranyeswarar Temple (Saneeswaran)', hi: 'तिरुनल्लार दर्भारण्येश्वर मंदिर (शनीश्वरन)' },
    town: 'Thirunallar', district: 'Karaikal', state: 'Puducherry (UT)',
    association: {
      en: 'The Navagraha temple for Shani (Saturn). Its main Shani festival, Sanipeyarchi, is held when Saturn changes sign (about every 2.5 years).',
      hi: 'शनि का नवग्रह मंदिर। इसका प्रमुख उत्सव "सनिपेयर्ची" तब मनाया जाता है जब शनि राशि बदलते हैं (लगभग हर ढाई साल)।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Tirunallar_Dharbaranyeswarar_Temple', WIKI_NAVAGRAHA],
  },
  thirunageswaram: {
    id: 'thirunageswaram',
    name: { en: 'Thirunageswaram Naganathar Temple', hi: 'तिरुनागेश्वरम नागनाथर मंदिर' },
    town: 'Thirunageswaram (near Kumbakonam)', district: 'Thanjavur', state: 'Tamil Nadu',
    association: {
      en: 'The Navagraha temple for Rahu ("Rahu Stalam"), with a separate Rahu shrine.',
      hi: 'राहु का नवग्रह मंदिर ("राहु स्थलम"), जहाँ राहु का अलग मंदिर है।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Tirunageswaram_Naganathar_Temple', WIKI_NAVAGRAHA],
  },
  keezhaperumpallam: {
    id: 'keezhaperumpallam',
    name: { en: 'Keezhaperumpallam Naganathaswamy Temple', hi: 'कीळपेरुम्पल्लम नागनाथस्वामी मंदिर' },
    town: 'Keezhaperumpallam (near Poompuhar)', district: 'Mayiladuthurai', state: 'Tamil Nadu',
    association: {
      en: 'The Navagraha temple for Ketu — Ketu is the presiding deity here.',
      hi: 'केतु का नवग्रह मंदिर — यहाँ केतु प्रमुख देवता हैं।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Nagannathaswamy_Temple,_Keelaperumpallam', WIKI_NAVAGRAHA],
  },
  gayaVishnupad: {
    id: 'gayaVishnupad',
    name: { en: 'Vishnupad Temple, Gaya (with the Phalgu river and Akshayavat)', hi: 'विष्णुपद मंदिर, गया (फल्गु नदी और अक्षयवट सहित)' },
    town: 'Gaya', district: 'Gaya', state: 'Bihar',
    association: {
      en: 'The centre of Shraddha rites in Gaya. During Pitru Paksha (Bhadrapada Purnima to Ashwin Amavasya) pind daan and tarpan are offered for ancestors at Vishnupad, Akshayavat and the Phalgu river.',
      hi: 'गया में श्राद्ध कर्म का केंद्र। पितृ पक्ष (भाद्रपद पूर्णिमा से आश्विन अमावस्या) में विष्णुपद, अक्षयवट और फल्गु नदी पर पूर्वजों के लिए पिंडदान और तर्पण किया जाता है।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Vishnupad_Temple,_Gaya', 'https://tourism.bihar.gov.in/en/events/2025/pitripaksha'],
  },
  somnath: {
    id: 'somnath',
    name: { en: 'Somnath Temple', hi: 'सोमनाथ मंदिर' },
    town: 'Prabhas Patan, Veraval', district: 'Gir Somnath', state: 'Gujarat',
    association: {
      en: 'Linked by tradition to Soma, the Moon god, who is said to have regained his lustre here — hence the name Someshvara, "lord of the Moon".',
      hi: 'परंपरा के अनुसार सोम (चंद्र देव) से जुड़ा है, जिन्होंने यहाँ अपनी कांति फिर पाई — इसी से नाम सोमेश्वर, "चंद्रमा के स्वामी"।',
    },
    verifiedFrom: ['https://en.wikipedia.org/wiki/Somnath_temple', 'https://en.wikipedia.org/wiki/Veraval'],
  },
  // ── The nine Navagraha temples of the Kumbakonam circuit (Wikipedia list) ──
  suryanarKovil: {
    id: 'suryanarKovil',
    name: { en: 'Suryanar Kovil', hi: 'सूर्यनार कोविल' },
    town: 'Suryanar Kovil', district: 'Thanjavur', state: 'Tamil Nadu',
    association: { en: 'The Navagraha temple for Surya (the Sun).', hi: 'सूर्य का नवग्रह मंदिर।' },
    verifiedFrom: [WIKI_NAVAGRAHA, WIKI_NAVAGRAHA_TN],
  },
  thingalur: {
    id: 'thingalur',
    name: { en: 'Thingalur Kailasanathar Temple', hi: 'तिंगलूर कैलासनाथर मंदिर' },
    town: 'Thingalur', district: 'Thanjavur', state: 'Tamil Nadu',
    association: { en: 'The Navagraha temple for Chandra (the Moon).', hi: 'चंद्र का नवग्रह मंदिर।' },
    verifiedFrom: [WIKI_NAVAGRAHA, WIKI_NAVAGRAHA_TN],
  },
  vaitheeswaran: {
    id: 'vaitheeswaran',
    name: { en: 'Vaitheeswaran Koil', hi: 'वैदीश्वरन कोइल' },
    town: 'Vaitheeswaran Koil', district: 'Mayiladuthurai', state: 'Tamil Nadu',
    association: { en: 'The Navagraha temple for Angaraka (Mars).', hi: 'अंगारक (मंगल) का नवग्रह मंदिर।' },
    verifiedFrom: [WIKI_NAVAGRAHA, WIKI_NAVAGRAHA_TN],
  },
  thiruvenkadu: {
    id: 'thiruvenkadu',
    name: { en: 'Thiruvenkadu Swetharanyeswarar Temple', hi: 'तिरुवेंकाडु श्वेतारण्येश्वर मंदिर' },
    town: 'Thiruvenkadu', district: 'Mayiladuthurai', state: 'Tamil Nadu',
    association: { en: 'The Navagraha temple for Budha (Mercury).', hi: 'बुध का नवग्रह मंदिर।' },
    verifiedFrom: [WIKI_NAVAGRAHA, WIKI_NAVAGRAHA_TN],
  },
  alangudi: {
    id: 'alangudi',
    name: { en: 'Alangudi Apatsahayesvarar Temple', hi: 'आलंगुडी आपत्सहायेश्वर मंदिर' },
    town: 'Alangudi', district: 'Thiruvarur', state: 'Tamil Nadu',
    association: { en: 'The Navagraha temple for Guru (Jupiter).', hi: 'गुरु (बृहस्पति) का नवग्रह मंदिर।' },
    verifiedFrom: [WIKI_NAVAGRAHA, WIKI_NAVAGRAHA_TN],
  },
  kanjanur: {
    id: 'kanjanur',
    name: { en: 'Kanjanur Agniswarar Temple', hi: 'कंजनूर अग्नीश्वर मंदिर' },
    town: 'Kanjanur', district: 'Thanjavur', state: 'Tamil Nadu',
    association: { en: 'The Navagraha temple for Shukra (Venus).', hi: 'शुक्र का नवग्रह मंदिर।' },
    verifiedFrom: [WIKI_NAVAGRAHA, WIKI_NAVAGRAHA_TN],
  },
};

export type TempleId = keyof typeof TEMPLES;
