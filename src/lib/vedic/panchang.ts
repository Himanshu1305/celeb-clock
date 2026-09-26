/**
 * Panchang + Muhurat finder (Part I.9).
 *
 * Reuses the engine's validated sidereal Sun/Moon longitudes (getSiderealLongitude)
 * — the five Panchang limbs (Tithi, Nakshatra, Yoga, Karana, Vara) are pure
 * derivations from those, plus Rahu Kalam from the weekday. Classical Muhurat basis
 * (multi-source: Brihat Samhita, drikpanchang, nityapanchangam, astroccult):
 *  • Favourable Tithis: Dwitiya(2), Tritiya(3), Panchami(5), Saptami(7),
 *    Dashami(10), Ekadashi(11), Trayodashi(13). Avoid Rikta (4,9,14) & Amavasya(30).
 *  • Pushya is the supreme Nakshatra for commerce (Guru-Pushya on a Thursday best);
 *    a standard "auspicious for most works" Nakshatra set is used per purpose.
 *  • Vara: Wednesday best for trade, Thursday for advisory; a lighter avoid on
 *    Tuesday/Saturday for new ventures.
 *  • Rahu Kalam (a ~90-min inauspicious daily window) is reported to avoid within
 *    the day. Scope (documented): Panchang is evaluated at local sunrise-ish
 *    (06:00 local), and Rahu Kalam assumes a ~06:00–18:00 day — a useful first
 *    version, not full sunrise/sunset astronomy.
 *
 * `sunMoon` is injected so the finder is unit-testable without the ephemeris.
 */
export type SunMoonFn = (d: Date) => { sun: number; moon: number };

const TITHI_NAMES = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'];
const NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const YOGA = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Which 1-based part of the (8-part) day holds Rahu Kalam, by weekday (Sun..Sat).
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const INAUSPICIOUS_YOGAS = new Set(['Vyatipata', 'Vaidhriti', 'Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Parigha', 'Vajra']);

export interface Panchang {
  date: string; weekday: string;
  tithi: number; tithiName: string; paksha: 'Shukla' | 'Krishna';
  nakshatra: string; nakshatraIndex: number;
  yoga: string; karana: number;
  rahuKalam: { start: string; end: string };
}

function norm(x: number) { return ((x % 360) + 360) % 360; }

/** Compute the five limbs at a given instant (default: evaluate the day at 06:00 local). */
export function computePanchang(date: Date, sunMoon: SunMoonFn, tzOffsetHours = 5.5): Panchang {
  const { sun, moon } = sunMoon(date);
  const diff = norm(moon - sun);
  const tithiIdx = Math.floor(diff / 12); // 0..29
  const paksha = tithiIdx < 15 ? 'Shukla' : 'Krishna';
  const within = tithiIdx % 15; // 0..14
  const tithiName = within === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : TITHI_NAMES[within];
  const nakIdx = Math.floor(norm(moon) / (360 / 27));
  const yogaIdx = Math.floor(norm(sun + moon) / (360 / 27));
  const karana = Math.floor(diff / 6); // 0..59 (half-tithis)

  // Rahu Kalam: split the 06:00–18:00 local day into 8 parts; pick this weekday's part.
  const wd = date.getUTCDay(); // date is treated as the local day's reference
  const part = RAHU_PART[wd];
  const dayStartH = 6, partLen = 1.5; // (18-6)/8
  const rkStart = dayStartH + (part - 1) * partLen;
  const rkEnd = rkStart + partLen;
  const hhmm = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

  return {
    date: date.toISOString().slice(0, 10), weekday: WEEKDAY[wd],
    tithi: within + 1, tithiName, paksha,
    nakshatra: NAK[nakIdx], nakshatraIndex: nakIdx,
    yoga: YOGA[yogaIdx], karana: karana + 1,
    rahuKalam: { start: hhmm(rkStart), end: hhmm(rkEnd) },
    // tzOffsetHours reserved for future true-sunrise refinement
  } as Panchang;
}

// Part AI — expanded occasion set. Classical Nakshatra/Vara preferences per
// occasion (Brihat Samhita / Muhurta Chintamani tradition). Existing ids
// (business/travel/general) preserved so the API and older links keep working.
export type MuhuratPurpose =
  | 'business' | 'travel' | 'general'
  | 'marriage' | 'engagement' | 'griha-pravesh' | 'naming' | 'vehicle' | 'vidyarambh';

/** Human labels for the occasion dropdown (source of truth for UI too). */
export const MUHURAT_OCCASIONS: Array<{ id: MuhuratPurpose; label: string }> = [
  { id: 'marriage', label: 'Marriage (Vivah)' },
  { id: 'engagement', label: 'Engagement (Sagai / Roka)' },
  { id: 'griha-pravesh', label: 'House-warming (Griha Pravesh)' },
  { id: 'business', label: 'Start a business / venture' },
  { id: 'vehicle', label: 'Buy a vehicle' },
  { id: 'naming', label: 'Naming ceremony (Namakaran)' },
  { id: 'vidyarambh', label: 'Start of education (Vidyarambh)' },
  { id: 'travel', label: 'Travel / journey' },
  { id: 'general', label: 'General auspicious start' },
];
export const MUHURAT_PURPOSE_IDS = MUHURAT_OCCASIONS.map(o => o.id);

const AUSPICIOUS_TITHI = new Set([2, 3, 5, 7, 10, 11, 13]);
const RIKTA_TITHI = new Set([4, 9, 14]);
const PURPOSE_NAK: Record<MuhuratPurpose, string[]> = {
  business: ['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Revati'],
  travel: ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Anuradha', 'Shravana', 'Dhanishtha', 'Revati'],
  general: ['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Dhanishtha', 'Revati', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada'],
  // Classical marriage stars (sthira/mridu/chara mix used for Vivah).
  marriage: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
  engagement: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
  // Griha Pravesh favours the "fixed" (sthira) and gentle stars.
  'griha-pravesh': ['Rohini', 'Mrigashira', 'Chitra', 'Anuradha', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Dhanishtha', 'Shatabhisha', 'Swati', 'Revati'],
  vehicle: ['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Anuradha', 'Shravana', 'Dhanishtha', 'Revati'],
  naming: ['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Revati'],
  vidyarambh: ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Dhanishtha', 'Revati'],
};
// Weekdays to gently avoid for each occasion.
const AVOID_VARA: Record<MuhuratPurpose, Set<string>> = {
  business: new Set(['Tuesday', 'Saturday']), travel: new Set(['Tuesday']), general: new Set(),
  marriage: new Set(['Tuesday', 'Sunday']), engagement: new Set(['Tuesday', 'Sunday']),
  'griha-pravesh': new Set(['Tuesday', 'Saturday', 'Sunday']), vehicle: new Set(['Saturday']),
  naming: new Set(['Tuesday', 'Saturday']), vidyarambh: new Set(['Tuesday', 'Saturday']),
};
// Weekdays classically favoured for each occasion (small positive nudge).
const FAVOUR_VARA: Record<MuhuratPurpose, Set<string>> = {
  business: new Set(['Wednesday']), travel: new Set(['Monday', 'Wednesday', 'Thursday', 'Friday']), general: new Set(['Wednesday', 'Thursday', 'Friday']),
  marriage: new Set(['Monday', 'Wednesday', 'Thursday', 'Friday']), engagement: new Set(['Monday', 'Wednesday', 'Thursday', 'Friday']),
  'griha-pravesh': new Set(['Monday', 'Wednesday', 'Thursday', 'Friday']), vehicle: new Set(['Monday', 'Wednesday', 'Thursday', 'Friday']),
  naming: new Set(['Monday', 'Wednesday', 'Thursday', 'Friday']), vidyarambh: new Set(['Wednesday', 'Thursday']),
};

export interface MuhuratDay extends Panchang { score: number; reasons: string[]; auspicious: boolean }

/** Plain-language "what we checked" note for the Muhurat results (Item 2). */
const PURPOSE_FOCUS: Record<MuhuratPurpose, string> = {
  business: 'starting a venture (favouring Wednesday for commerce, and the Pushya star)',
  travel: 'travel (favouring the mobile, gentle travel Nakshatras)',
  general: 'a general auspicious start',
  marriage: 'marriage (favouring the classical Vivah stars and gentle weekdays, avoiding Tuesday/Sunday)',
  engagement: 'an engagement (the same gentle basis as marriage)',
  'griha-pravesh': 'a house-warming (favouring the "fixed" stars for settling into a home)',
  vehicle: 'buying a vehicle (favouring swift, gentle stars and avoiding Saturday)',
  naming: 'a naming ceremony (favouring gentle, benefic stars)',
  vidyarambh: 'starting education (favouring Mercury/Jupiter weekdays and learning stars)',
};

export function muhuratMethodology(purpose: MuhuratPurpose): string {
  const focus = PURPOSE_FOCUS[purpose] ?? PURPOSE_FOCUS.general;
  return `How each date is chosen: we compute that day's Panchang — the five classical "limbs" — and score it for ${focus}. Specifically we check the Tithi (lunar day: favouring Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi and Trayodashi; avoiding the "Rikta" days 4/9/14 and Amavasya), the Nakshatra (birth star of the day: Pushya is the supreme one for beginnings), the Yoga, and the weekday — then we flag the Rahu Kalam window to avoid within the day. A date is only shown as auspicious when it scores well across these; each date below lists the specific reasons it qualified. This is a general Panchang selection, not a personalised chart Muhurta — for marriage especially, a qualified astrologer also matches the couple's charts.`;
}

/** Score one day's Panchang for a purpose. Higher = more auspicious. */
export function scoreMuhurat(p: Panchang, purpose: MuhuratPurpose): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const goodNak = PURPOSE_NAK[purpose].includes(p.nakshatra);
  if (p.nakshatra === 'Pushya') { score += 3; reasons.push('Pushya — the supreme Nakshatra for auspicious beginnings'); }
  else if (goodNak) { score += 2; reasons.push(`${p.nakshatra} is an auspicious Nakshatra for this`); }
  else { score -= 1; reasons.push(`${p.nakshatra} is not among the preferred Nakshatras`); }

  if (AUSPICIOUS_TITHI.has(p.tithi)) { score += 2; reasons.push(`${p.tithiName} is a favourable Tithi`); }
  else if (RIKTA_TITHI.has(p.tithi) || p.tithiName === 'Amavasya') { score -= 2; reasons.push(`${p.tithiName} is an inauspicious (Rikta/Amavasya) Tithi`); }

  if (purpose === 'business' && p.weekday === 'Wednesday') { score += 1; reasons.push('Wednesday favours trade & commerce'); }
  else if (FAVOUR_VARA[purpose]?.has(p.weekday)) { score += 1; reasons.push(`${p.weekday} is a favourable weekday for this`); }
  if (p.weekday === 'Thursday' && p.nakshatra === 'Pushya') { score += 2; reasons.push('Guru-Pushya (Pushya on Thursday) — the most prized combination'); }
  if (AVOID_VARA[purpose].has(p.weekday)) { score -= 1; reasons.push(`${p.weekday} is gently avoided for this`); }

  if (INAUSPICIOUS_YOGAS.has(p.yoga)) { score -= 2; reasons.push(`${p.yoga} Yoga is inauspicious`); }

  return { score, reasons };
}

/** Find auspicious days for a purpose in the next `days` starting from `from`. */
export function findMuhurats(purpose: MuhuratPurpose, from: Date, days: number, sunMoon: SunMoonFn, tzOffsetHours = 5.5): MuhuratDay[] {
  const out: MuhuratDay[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + i, 6 - tzOffsetHours, 0, 0)); // ~06:00 local
    const p = computePanchang(d, sunMoon, tzOffsetHours);
    const { score, reasons } = scoreMuhurat(p, purpose);
    out.push({ ...p, score, reasons, auspicious: score >= 3 });
  }
  return out;
}
