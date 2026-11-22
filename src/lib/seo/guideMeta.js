// @ts-check
/**
 * B14 — titles, meta descriptions and H1s for the main astrology landing pages.
 * Plain ES module so the pages AND scripts/prerender-titles.mjs share one copy (the
 * prerendered <title> must equal the live one). Titles carry the high-volume spelling
 * variants people actually search (kundli / kundali, milan / matching, dosh / dosha).
 * Limits checked by src/lib/seo/__tests__/guideMeta.test.ts: title ≤ 60 characters,
 * description ≤ 155.
 */

/** @type {Record<string, { title: string, description: string, h1: string }>} */
export const GUIDE_META = {
  '/kundali': {
    title: 'Free Kundli & Janam Kundali by Date of Birth | BornClock',
    description: 'Free Janam Kundli (Kundali) from your date, time and place of birth: Lagna, Rashi, Nakshatra, all 9 planets and your Vimshottari Dasha — Lahiri sidereal.',
    h1: 'Free Kundli (Kundali) — Janam Kundli by Date of Birth',
  },
  '/kundali-match': {
    title: 'Kundli Matching — Kundali Milan, 36 Gunas | BornClock',
    description: 'Free kundli matching by date of birth: 36-guna Ashtakoota milan with all 8 kootas, Nadi and Bhakoot dosha, and a Manglik check for both charts.',
    h1: 'Kundli Matching — Kundali Milan by Date of Birth',
  },
  '/kundli-milan-by-name': {
    title: 'Kundli Milan by Name — Guna Milan Without DOB | BornClock',
    description: 'Kundli milan by name: each name’s first syllable gives a nakshatra, then the 36 gunas are added up. A quick guide — birth details are more accurate.',
    h1: 'Kundli milan by name',
  },
  '/hi/kundli-milan': {
    title: 'कुंडली मिलान हिंदी में — 36 गुण मिलान व मांगलिक | BornClock',
    description: 'कुंडली मिलान हिंदी में: जन्म तिथि, समय और स्थान से 36 गुणों का अष्टकूट मिलान, नाड़ी-भकूट दोष, मांगलिक जाँच और सरल उपाय — मुफ़्त।',
    h1: 'कुंडली मिलान (गुण मिलान)',
  },
  // B18: Lal Kitab Kundli (English + Hindi).
  '/lal-kitab': {
    title: 'Lal Kitab Kundli — Free Chart & Remedies | BornClock',
    description: 'Free Lal Kitab Kundli: your Lal Kitab chart, pakka ghar, sleeping planets, Rin (debts), this year’s Varshphal and simple, free Lal Kitab remedies.',
    h1: 'Lal Kitab Kundli — Free Lal Kitab Chart & Remedies',
  },
  '/hi/lal-kitab': {
    title: 'लाल किताब कुंडली — मुफ़्त चार्ट व उपाय | BornClock',
    description: 'मुफ़्त लाल किताब कुंडली: लाल किताब चार्ट, पक्का घर, सोये ग्रह, पितृ ऋण आदि ऋण, इस साल का वर्षफल और सरल, मुफ़्त लाल किताब उपाय।',
    h1: 'लाल किताब कुंडली — मुफ़्त चार्ट और उपाय',
  },
  '/sade-sati': {
    title: 'Sade Sati Calculator — Shani Sade Sati Dates | BornClock',
    description: 'Free Sade Sati calculator: is Shani’s 7.5-year Sade Sati or the 2.5-year Dhaiya active for your Moon sign, which phase, and the real start and end dates.',
    h1: 'Sade Sati Calculator — Shani Sade Sati Dates',
  },
  '/manglik': {
    title: 'Manglik Dosh Calculator — Mangal Dosha Check | BornClock',
    description: 'Free Manglik dosh calculator: is your Kundli Manglik, High or Low, from the Lagna and the Moon — with the classical cancellations explained calmly.',
    h1: 'Manglik Dosh Calculator — Mangal Dosha Check',
  },
  '/kaal-sarp-dosha': {
    title: 'Kaal Sarp Dosh Calculator — Check Your Kundli | BornClock',
    description: 'Free Kaal Sarp dosh check: are all seven planets between Rahu and Ketu in your Kundli, by exact degree? Type, direction and calm, free-first guidance.',
    h1: 'Kaal Sarp Dosh Calculator — Check Your Kundli',
  },
  '/dasha-calculator': {
    title: 'Dasha Calculator — Mahadasha & Antardasha Dates | BornClock',
    description: 'Free Vimshottari dasha calculator: your Mahadasha, Antardasha and deeper periods with real start and end dates, worked out from your birth Moon.',
    h1: 'Dasha Calculator — Mahadasha & Antardasha',
  },
  '/nakshatra': {
    title: 'Nakshatra Finder — The 27 Nakshatras Explained | BornClock',
    description: 'Find your Nakshatra (birth star) and learn all 27: ruling planet, deity, Gana, Yoni, Nadi and name sounds — plus how your birth star is calculated.',
    h1: 'Nakshatra Finder — The 27 Nakshatras',
  },
  '/moon-sign': {
    title: 'Moon Sign Calculator — Vedic Rashi by Birth Date | BornClock',
    description: 'Free moon sign calculator: your Vedic Moon sign (Rashi) and Nakshatra from your date of birth, with a clear note when the Moon changed sign that day.',
    h1: 'Moon Sign Calculator',
  },
  '/rashifal-by-date-of-birth': {
    title: 'Rashi by Date of Birth — जन्म तिथि से राशि | BornClock',
    description: 'जन्म तिथि से अपनी राशि जानें: चंद्र राशि (Moon sign) और सूर्य राशि का अंतर, जन्म समय क्यों ज़रूरी है, और राशि से राशिफल कैसे पढ़ें।',
    h1: 'अपनी राशि जानें — Rashi by Date of Birth',
  },
  '/child-kundli': {
    title: 'Child Kundli (Bal Kundli) — Free Baby Horoscope | BornClock',
    description: 'A free, gentle Child (Bal) Kundli from your child’s birth chart: temperament, learning style, talents, name sounds and calm wellbeing guidance.',
    h1: 'Child Kundli (Bal Kundli)',
  },
  '/hi/rashifal': {
    title: 'राशिफल — आज का राशिफल, सभी 12 राशियाँ | BornClock',
    description: 'आज का राशिफल हिंदी में — मेष से मीन तक सभी 12 चंद्र राशियों के लिए, ग्रहों की वास्तविक चाल (गोचर) से रोज़ गणना किया गया। अपनी राशि चुनें।',
    h1: 'राशिफल — आज का राशिफल',
  },
  '/rashifal': {
    title: 'Rashifal — Daily, Weekly & Yearly Horoscope | BornClock',
    description: 'Free Vedic rashifal for all 12 Moon signs — today, tomorrow, week, month and year — computed from the real sidereal transits, not a template.',
    h1: 'Rashifal — horoscope by your Moon sign',
  },
};

/** Meta for a route, or null. */
export function guideMetaFor(route) {
  return GUIDE_META[route] ?? null;
}
