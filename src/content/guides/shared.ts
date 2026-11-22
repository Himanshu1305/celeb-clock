/**
 * B14 — shared lookups and internal links for the astrology guides.
 */
import type { GuideLink } from '@/components/guide/Guide';

export const RASHI_ORDER = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
export const RASHI_WESTERN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const RASHI_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];

/** "Simha (Leo)" for an engine sign name. */
export const signEn = (s: string) => { const i = RASHI_ORDER.indexOf(s); return i >= 0 ? `${s} (${RASHI_WESTERN[i]})` : s; };
export const signHi = (s: string) => { const i = RASHI_ORDER.indexOf(s); return i >= 0 ? RASHI_HI[i] : s; };
export const signIdx = (s: string) => RASHI_ORDER.indexOf(s);

export const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};
export const KOOTA_HI: Record<string, string> = {
  varna: 'वर्ण', vashya: 'वश्य', tara: 'तारा', yoni: 'योनि', graha_maitri: 'ग्रह मैत्री', gana: 'गण', bhakoot: 'भकूट', nadi: 'नाड़ी',
};
export const COMPAT_HI: Record<string, string> = { Excellent: 'उत्तम', Good: 'अच्छा', Acceptable: 'स्वीकार्य', Challenging: 'चुनौतीपूर्ण' };

/** Every tool the guides link to, by key. */
export const TOOLS: Record<string, GuideLink> = {
  kundali: { to: '/kundali/', label: 'Free Kundli (Janam Kundali)', note: 'Your full birth chart, planets and Dasha.' },
  match: { to: '/kundali-match/', label: 'Kundli Matching (Guna Milan)', note: '36-guna Ashtakoota with both birth charts.' },
  nameMatch: { to: '/kundli-milan-by-name/', label: 'Kundli Milan by Name', note: 'A quick, approximate score from two names.' },
  hiMatch: { to: '/hi/kundli-milan/', label: 'कुंडली मिलान (हिंदी)', note: 'जन्म विवरण से 36 गुण मिलान।' },
  sadeSati: { to: '/sade-sati/', label: 'Sade Sati Calculator', note: 'Is Shani’s 7.5-year transit active for you?' },
  manglik: { to: '/manglik/', label: 'Manglik Dosh Check', note: 'Mars from the Lagna and from the Moon.' },
  kaalSarp: { to: '/kaal-sarp-dosha/', label: 'Kaal Sarp Dosh Check', note: 'All seven planets between Rahu and Ketu?' },
  dasha: { to: '/dasha-calculator/', label: 'Dasha Calculator', note: 'Mahadasha and Antardasha with dates.' },
  varshphal: { to: '/varshphal/', label: 'Varshphal (Annual Horoscope)', note: 'Your Tajik annual chart and month-by-month outlook.' },
  nakshatra: { to: '/nakshatra/', label: 'The 27 Nakshatras', note: 'Every birth star, its lord and name sounds.' },
  moonSign: { to: '/moon-sign/', label: 'Moon Sign Calculator', note: 'Your Vedic Rashi from your date of birth.' },
  rashiDob: { to: '/rashifal-by-date-of-birth/', label: 'Rashi by Date of Birth (हिंदी)', note: 'जन्म तिथि से अपनी राशि।' },
  child: { to: '/child-kundli/', label: 'Child Kundli (Bal Kundli)', note: 'A gentle reading for parents.' },
  rashifal: { to: '/rashifal/', label: 'Rashifal (Daily Horoscope)', note: 'Today, week, month and year by Moon sign.' },
  hiRashifal: { to: '/hi/rashifal/', label: 'आज का राशिफल (हिंदी)', note: 'सभी 12 राशियों का दैनिक राशिफल।' },
  panchang: { to: '/panchang/', label: 'Today’s Panchang', note: 'Tithi, Nakshatra, Rahu Kaal for your city.' },
  vedic: { to: '/vedic-astrology/', label: 'Vedic Astrology hub', note: 'Every Vedic tool in one place.' },
  remedies: { to: '/remedies/', label: 'Remedies (Upay)', note: 'Free-first traditional practices.' },
  glossary: { to: '/glossary/', label: 'Astrology Glossary', note: 'Every term in plain language.' },
};

/** The 2027 yearly hubs — linked from every guide. */
export const HUBS_2027: GuideLink[] = [
  { to: '/rashifal-2027/', label: 'Rashifal 2027', note: 'The year ahead for all 12 Moon signs.' },
  { to: '/horoscope-2027/', label: 'Horoscope 2027', note: 'Your 2027 yearly horoscope.' },
  { to: '/hi/rashifal-2027/', label: 'राशिफल 2027 (हिंदी)', note: 'सभी 12 राशियों का वार्षिक राशिफल।' },
];

export const related = (keys: Array<keyof typeof TOOLS>): GuideLink[] => [...keys.map(k => TOOLS[k]), ...HUBS_2027];
