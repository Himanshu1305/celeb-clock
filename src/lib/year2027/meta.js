// @ts-check
/**
 * B14 — the 2027 pages: slugs, routes and static titles / descriptions / H1s.
 *
 * Plain ES module with no imports (like src/lib/muhuratYearMeta.js) so the app, vitest,
 * the Cloudflare Worker (functions/_worker.ts route validation) and the Node prerender /
 * sitemap scripts (scripts/prerender-routes.mjs, scripts/prerender-titles.mjs) all read
 * ONE list. src/lib/year2027/__tests__/routes.test.ts checks App.tsx, the Worker, the
 * prerender list and the titles stay in sync with it.
 *
 * Titles lead with the search phrase and stay within 60 characters.
 */

export const Y2027 = 2027;
/** Published / last content update of the 2027 pages (Article schema datePublished / dateModified). */
export const Y2027_PUBLISHED = '2026-11-17';
export const Y2027_UPDATED = '2026-11-17';

/** English (worker-validated) rashi slugs, Mesha = 0 … Meena = 11. */
export const RASHI_SLUGS_2027 = ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'];
/** Legacy Hindi rashi slugs (= RASHI_SLUGS_HI in src/lib/daily/registry.ts). */
export const RASHI_SLUGS_HI_2027 = ['mesha', 'vrisha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'];
export const RASHI_NAME_EN = ['Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya', 'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbh', 'Meen'];
export const RASHI_NAME_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
export const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_SLUGS_2027 = SIGN_EN.map(s => s.toLowerCase());

/**
 * Festival pages /festivals/2027/:slug. `engine` is the festival's name in the festival
 * engine (src/lib/vedic/festivals.ts — festivalDetails / computeFestivalCalendar /
 * tithiDays); the page date always comes from there.
 * @type {Array<{ slug: string; en: string; hi: string; engine: string; hiPage?: boolean }>}
 */
export const FESTIVALS_2027 = [
  { slug: 'lohri', en: 'Lohri', hi: 'लोहड़ी', engine: 'Lohri' },
  { slug: 'makar-sankranti', en: 'Makar Sankranti', hi: 'मकर संक्रांति', engine: 'Makar Sankranti (Uttarayana)', hiPage: true },
  { slug: 'vasant-panchami', en: 'Vasant Panchami', hi: 'वसंत पंचमी', engine: 'Vasant Panchami' },
  { slug: 'mahashivratri', en: 'Mahashivratri', hi: 'महाशिवरात्रि', engine: 'Maha Shivratri', hiPage: true },
  { slug: 'holika-dahan', en: 'Holika Dahan', hi: 'होलिका दहन', engine: 'Holika Dahan' },
  { slug: 'holi', en: 'Holi', hi: 'होली', engine: 'Holi', hiPage: true },
  { slug: 'ugadi-gudi-padwa', en: 'Ugadi & Gudi Padwa', hi: 'उगादी और गुड़ी पड़वा', engine: 'Ugadi / Gudi Padwa' },
  { slug: 'chaitra-navratri', en: 'Chaitra Navratri', hi: 'चैत्र नवरात्रि', engine: 'Chaitra Navratri begins (Ghatasthapana)' },
  { slug: 'ram-navami', en: 'Ram Navami', hi: 'राम नवमी', engine: 'Ram Navami' },
  { slug: 'hanuman-jayanti', en: 'Hanuman Jayanti', hi: 'हनुमान जयंती', engine: 'Hanuman Jayanti' },
  { slug: 'akshaya-tritiya', en: 'Akshaya Tritiya', hi: 'अक्षय तृतीया', engine: 'Akshaya Tritiya' },
  { slug: 'guru-purnima', en: 'Guru Purnima', hi: 'गुरु पूर्णिमा', engine: 'Guru Purnima' },
  { slug: 'nag-panchami', en: 'Nag Panchami', hi: 'नाग पंचमी', engine: 'Nag Panchami' },
  { slug: 'raksha-bandhan', en: 'Raksha Bandhan', hi: 'रक्षाबंधन', engine: 'Raksha Bandhan', hiPage: true },
  { slug: 'janmashtami', en: 'Janmashtami', hi: 'जन्माष्टमी', engine: 'Krishna Janmashtami', hiPage: true },
  { slug: 'ganesh-chaturthi', en: 'Ganesh Chaturthi', hi: 'गणेश चतुर्थी', engine: 'Ganesh Chaturthi' },
  { slug: 'navratri', en: 'Navratri', hi: 'नवरात्रि', engine: 'Navratri begins (Ghatasthapana)', hiPage: true },
  { slug: 'maha-navami', en: 'Maha Navami', hi: 'महानवमी', engine: 'Maha Navami' },
  { slug: 'dussehra', en: 'Dussehra', hi: 'दशहरा', engine: 'Dussehra (Vijayadashami)' },
  { slug: 'karwa-chauth', en: 'Karwa Chauth', hi: 'करवा चौथ', engine: 'Karwa Chauth', hiPage: true },
  { slug: 'dhanteras', en: 'Dhanteras', hi: 'धनतेरस', engine: 'Dhanteras', hiPage: true },
  { slug: 'diwali', en: 'Diwali', hi: 'दिवाली', engine: 'Diwali (Lakshmi Puja)', hiPage: true },
  { slug: 'govardhan-puja', en: 'Govardhan Puja', hi: 'गोवर्धन पूजा', engine: 'Govardhan Puja' },
  { slug: 'bhai-dooj', en: 'Bhai Dooj', hi: 'भाई दूज', engine: 'Bhai Dooj' },
  { slug: 'chhath-puja', en: 'Chhath Puja', hi: 'छठ पूजा', engine: 'Chhath Puja', hiPage: true },
  { slug: 'dev-uthani-ekadashi', en: 'Dev Uthani Ekadashi', hi: 'देवउठनी एकादशी', engine: 'Devutthana Ekadashi' },
];
export const FESTIVAL_SLUGS_2027 = FESTIVALS_2027.map(f => f.slug);
export const HI_FESTIVAL_SLUGS_2027 = FESTIVALS_2027.filter(f => f.hiPage).map(f => f.slug);

export const TITHI_LIST_SLUGS_2027 = ['ekadashi-2027', 'purnima-2027', 'amavasya-2027'];

/** Paths (no trailing slash). */
export const p2027 = {
  rashifalHub: '/rashifal-2027',
  rashifalHubHi: '/hi/rashifal-2027',
  horoscopeHub: '/horoscope-2027',
  /** @param {number} i */ rashifal: i => `/rashifal/${RASHI_SLUGS_2027[i]}/2027`,
  /** @param {number} i */ rashifalHi: i => `/hi/rashifal/${RASHI_SLUGS_HI_2027[i]}/2027`,
  /** @param {number} i */ horoscope: i => `/horoscope/${SIGN_SLUGS_2027[i]}/2027`,
  /** @param {string} slug */ festival: slug => `/festivals/2027/${slug}`,
  /** @param {string} slug */ festivalHi: slug => `/hi/festivals/2027/${slug}`,
  hinduCalendar: '/hindu-calendar-2027',
  numerology: '/numerology-2027',
  chinese: '/chinese-horoscope-2027',
};

/** Every 2027 route (prerender list + sitemap). */
export function year2027Routes() {
  return [
    p2027.rashifalHub, ...RASHI_SLUGS_2027.map((_, i) => p2027.rashifal(i)),
    p2027.rashifalHubHi, ...RASHI_SLUGS_HI_2027.map((_, i) => p2027.rashifalHi(i)),
    p2027.horoscopeHub, ...SIGN_SLUGS_2027.map((_, i) => p2027.horoscope(i)),
    p2027.hinduCalendar, ...TITHI_LIST_SLUGS_2027.map(s => `/${s}`),
    ...FESTIVAL_SLUGS_2027.map(p2027.festival),
    ...HI_FESTIVAL_SLUGS_2027.map(p2027.festivalHi),
    p2027.numerology, p2027.chinese,
  ];
}

const TITHI_LIST = {
  'ekadashi-2027': { title: 'Ekadashi 2027 Dates: Full List with Tithi Times | BornClock', h1: 'Ekadashi 2027 — all dates with tithi start and end times', description: 'Every Ekadashi of 2027 with its traditional name, date and the exact Ekadashi tithi start and end times (IST, New Delhi) — computed from real Sun and Moon positions.' },
  'purnima-2027': { title: 'Purnima 2027 Dates: Full List with Tithi Times | BornClock', h1: 'Purnima 2027 — all full moon dates with tithi times', description: 'Every Purnima (full moon) of 2027 with the lunar month, the observance date and the exact Purnima tithi start and end times (IST, New Delhi), computed from real Moon positions.' },
  'amavasya-2027': { title: 'Amavasya 2027 Dates: Full List with Tithi Times | BornClock', h1: 'Amavasya 2027 — all new moon dates with tithi times', description: 'Every Amavasya (new moon) of 2027 with both month names, the observance date and the exact Amavasya tithi start and end times (IST, New Delhi), computed from real Moon positions.' },
};

/** @param {string} name */
function festivalTitle(name) {
  const long = `${name} 2027: Date, Time & Muhurat | BornClock`;
  return long.length <= 60 ? long : `${name} 2027 Date & Time | BornClock`;
}

/**
 * Static title / description / H1 of a 2027 route, or null when it is not one.
 * @param {string} route path without trailing slash
 * @returns {{ title: string; description: string; h1: string } | null}
 */
export function year2027Meta(route) {
  const r = route.length > 1 ? route.replace(/\/+$/, '') : route;
  if (r === p2027.rashifalHub) return {
    title: 'Rashifal 2027: Yearly Horoscope, All 12 Rashis | BornClock',
    description: 'Rashifal 2027 for all 12 Moon signs, computed from the real 2027 transits of Saturn, Jupiter, Rahu–Ketu and the faster planets: month-by-month outlook, Sade Sati, eclipses and remedies.',
    h1: 'Rashifal 2027 — yearly horoscope for all 12 rashis',
  };
  if (r === p2027.rashifalHubHi) return {
    title: 'राशिफल 2027 — सभी 12 राशियों का वार्षिक भविष्यफल | BornClock',
    description: 'राशिफल 2027: सभी 12 राशियों का वार्षिक भविष्यफल — शनि, गुरु, राहु-केतु और अन्य ग्रहों के 2027 के वास्तविक गोचर से गणना, महीनेवार फल, साढ़ेसाती, ग्रहण और सरल उपाय।',
    h1: 'राशिफल 2027 — सभी 12 राशियों का वार्षिक भविष्यफल',
  };
  if (r === p2027.horoscopeHub) return {
    title: 'Horoscope 2027: Yearly Forecast for All 12 Signs | BornClock',
    description: 'Horoscope 2027 for Aries to Pisces, computed from the real 2027 positions of Jupiter, Saturn, Mars, Venus and Mercury: month-by-month outlook, best and challenging periods, eclipses.',
    h1: 'Horoscope 2027 — yearly forecast for all 12 zodiac signs',
  };
  if (r === p2027.hinduCalendar) return {
    title: 'Hindu Calendar 2027: Festivals & Tithis by Month | BornClock',
    description: 'Hindu calendar 2027 month by month: the lunar months, every major festival, Ekadashi, Purnima and Amavasya, Sankrantis and eclipses — computed for New Delhi from real Sun and Moon positions.',
    h1: 'Hindu calendar 2027 — month by month',
  };
  if (r === p2027.numerology) return {
    title: 'Numerology 2027: Personal Year 1–9 Forecast | BornClock',
    description: 'Numerology 2027: the universal year 2027 adds up to 11, a master number that reduces to 2. Find your personal year number for 2027 and a practical outlook for personal years 1 to 9.',
    h1: 'Numerology 2027 — universal year 11/2 and your personal year',
  };
  if (r === p2027.chinese) return {
    title: 'Chinese Horoscope 2027: Year of the Fire Goat | BornClock',
    description: 'Chinese horoscope 2027: the Year of the Fire Goat begins on 6 February 2027. How the Goat year relates to each of the 12 animals — allies, clash, Tai Sui — with career, money, love and health outlooks.',
    h1: 'Chinese horoscope 2027 — Year of the Fire Goat',
  };
  /** @type {RegExpMatchArray | null} */
  let m;
  if ((m = r.match(/^\/rashifal\/([a-z]+)\/2027$/))) {
    const i = RASHI_SLUGS_2027.indexOf(m[1]);
    if (i < 0) return null;
    return {
      title: `${RASHI_NAME_EN[i]} Rashifal 2027: Yearly Horoscope | BornClock`,
      description: `${RASHI_NAME_EN[i]} rashifal 2027 (${SIGN_EN[i]} Moon sign): computed from the real 2027 transits — Saturn, Jupiter, Rahu–Ketu, eclipses — with love, career, money, health, month-by-month dates, Sade Sati status and free remedies.`,
      h1: `${RASHI_NAME_EN[i]} Rashifal 2027 — ${SIGN_EN[i]} Moon sign yearly horoscope`,
    };
  }
  if ((m = r.match(/^\/hi\/rashifal\/([a-z]+)\/2027$/))) {
    const i = RASHI_SLUGS_HI_2027.indexOf(m[1]);
    if (i < 0) return null;
    return {
      title: `${RASHI_NAME_HI[i]} राशिफल 2027 — वार्षिक भविष्यफल | BornClock`,
      description: `${RASHI_NAME_HI[i]} राशिफल 2027: शनि, गुरु, राहु-केतु और ग्रहणों के 2027 के वास्तविक गोचर से गणना — प्रेम, करियर, धन, सेहत, महीनेवार फल, साढ़ेसाती की स्थिति और सरल उपाय।`,
      h1: `${RASHI_NAME_HI[i]} राशिफल 2027 — वार्षिक भविष्यफल`,
    };
  }
  if ((m = r.match(/^\/horoscope\/([a-z]+)\/2027$/))) {
    const i = SIGN_SLUGS_2027.indexOf(m[1]);
    if (i < 0) return null;
    return {
      title: `${SIGN_EN[i]} Horoscope 2027: Yearly Forecast | BornClock`,
      description: `${SIGN_EN[i]} horoscope 2027, computed from the real 2027 positions of the planets: love, career, money and health, month-by-month outlook, best and challenging periods and the eclipses that touch your chart.`,
      h1: `${SIGN_EN[i]} Horoscope 2027 — yearly forecast`,
    };
  }
  if ((m = r.match(/^\/(ekadashi|purnima|amavasya)-2027$/))) return TITHI_LIST[/** @type {'ekadashi-2027'} */ (`${m[1]}-2027`)];
  if ((m = r.match(/^\/festivals\/2027\/([a-z-]+)$/))) {
    const f = FESTIVALS_2027.find(x => x.slug === m?.[1]);
    if (!f) return null;
    return {
      title: festivalTitle(f.en),
      description: `${f.en} 2027 date for New Delhi, computed by our festival engine from real Sun and Moon positions: tithi start and end times, the puja window, what it is, how it is observed, regional names and FAQs.`,
      h1: `${f.en} 2027 — date, tithi and puja time`,
    };
  }
  if ((m = r.match(/^\/hi\/festivals\/2027\/([a-z-]+)$/))) {
    const f = FESTIVALS_2027.find(x => x.slug === m?.[1] && x.hiPage);
    if (!f) return null;
    return {
      title: `${f.hi} 2027 कब है — तिथि, मुहूर्त और पूजा | BornClock`,
      description: `${f.hi} 2027 की तारीख़ (नई दिल्ली) — हमारे पंचांग इंजन से गणना: तिथि का आरंभ व समाप्ति समय, पूजा का समय, पर्व का महत्व, पूजा विधि, क्षेत्रीय नाम और प्रश्नोत्तर।`,
      h1: `${f.hi} 2027 — तिथि, मुहूर्त और पूजा विधि`,
    };
  }
  return null;
}
