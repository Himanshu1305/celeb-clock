/**
 * B18 — types for the regional-language packs (Tamil, Telugu, Bengali, Marathi, Gujarati,
 * Kannada, Malayalam, Punjabi). A language is DATA: one vocabulary + narration file per
 * language (src/lib/lang/vocab/<code>.js, Worker/Node-safe) and one page-copy file
 * (src/lib/lang/copy/<code>.ts). The generic composers (./daily.ts, ./year.ts) and the
 * pages under src/pages/lang/ only read these shapes, so adding a language is adding two
 * files and one registry row. src/lib/lang/__tests__/vocab.test.ts checks every key is
 * present in every language.
 *
 * Every number, date and timing comes from the engine; the packs only supply words.
 */

export type LangCode = 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa';
export type T3 = 'good' | 'mixed' | 'care';
export type Tone = 'favourable' | 'mixed' | 'challenging';
export type Graha = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';
export type ColourKey = 'red' | 'white' | 'green' | 'silverWhite' | 'gold' | 'yellow' | 'blue' | 'copperRed' | 'darkBlue' | 'smokyGrey' | 'grey';
export type KootaKey = 'varna' | 'vashya' | 'tara' | 'yoni' | 'graha_maitri' | 'gana' | 'bhakoot' | 'nadi';
export type DoshaKey = 'manglik' | 'nadi' | 'bhakoot' | 'gana' | 'sadeSati' | 'dhaiya' | 'kaalSarp';

export interface FaqQA { q: string; a: string }

/** Everything the daily rashifal narration needs for one (date, rashi). */
export interface DailyCtx {
  date: string;
  /** "22 நவம்பர் 2026" */
  dateText: string;
  rashiName: string;
  /** Moon's house from the rashi (1..12) and the classical Moon tone of that house. */
  moonHouse: number;
  moonTone: T3;
  /** native rashi name the Moon is transiting, and the Moon's nakshatra */
  moonRashi: string;
  nak: string;
  /** first Moon sign change of the India day: clock + house after/before */
  moonChange?: { at: string; house: number; before: boolean };
  /** next nakshatra change later today */
  nakChange?: { at: string; to: string };
  venus: { house: number; tone: T3 };
  mercury: { house: number; tone: T3 };
  mars: { house: number; tone: T3 };
  jupiter: { house: number; tone: T3 };
  rahu: { house: number; tone: T3 };
  saturn: { house: number; tone: T3; sadeSati: '' | 'rising' | 'peak' | 'setting'; dhaiya: boolean };
  taras: Array<{ nak: string; tara: number; tone: T3 }>;
  /** best Choghadiya window (New Delhi) avoiding Rahu Kaal */
  best: { name: string; start: string; end: string } | null;
  rahuKaal: { start: string; end: string };
  city: string;
  colour: string;
  numbers: number[];
  /** deterministic variant pick seeded by (date, rashi, key) */
  pick: (options: readonly string[], key: string) => string;
}

export interface DailyNarration {
  title: (c: DailyCtx) => string;
  description: (c: DailyCtx) => string;
  h1: (c: DailyCtx) => string;
  headline: Record<T3, readonly string[]>;
  answer: (c: DailyCtx, headline: string, slowAnswer: string) => string;
  overview: (c: DailyCtx) => string;
  love: (c: DailyCtx) => string;
  career: (c: DailyCtx) => string;
  health: (c: DailyCtx) => string;
  slow: (c: DailyCtx) => { label: string; text: string; answer: string };
  chandrabala: (c: DailyCtx) => { label: string; text: string };
  tarabala: (c: DailyCtx) => { label: string; text: string };
  lucky: (c: DailyCtx) => Array<{ label: string; value: string; note?: string }>;
  headings: { overview: string; love: string; career: string; health: string; lucky: string };
  faq: (c: DailyCtx, answer: string) => FaqQA[];
}

export interface PanchangCtx {
  city: string;
  index: boolean;
  dateText: string;
  longDate: string;
  sunrise: string;
  sunset: string;
  tithi: string; tithiEnd: string;
  nak: string; nakEnd: string;
  yoga: string; yogaEnd: string;
  karana: string; karanaEnd: string;
  vara: string;
  rahu: string; gulika: string; yama: string;
  abhijit: string | null;
  brahma: string;
  amrit: string; durmuhurtam: string; varjyam: string;
}

export interface PanchangNarration {
  title: (c: PanchangCtx) => string;
  description: (c: PanchangCtx) => string;
  answer: (c: PanchangCtx) => string;
  why: (c: PanchangCtx) => Array<{ label: string; text: string }>;
  labels: {
    limbs: string; tithi: string; nakshatra: string; yoga: string; karana: string; vara: string; until: (t: string) => string;
    sun: (city: string) => string; sunrise: string; sunset: string;
    good: string; brahma: string; brahmaNote: string; abhijit: string; abhijitNote: string; noAbhijit: string; amrit: string; amritNote: string;
    avoid: string; avoidNote: string; rahu: string; gulika: string; yama: string; durmuhurtam: string; varjyam: string;
    choghDay: (rise: string, set: string) => string; choghNight: string;
    none: string; and: string; nextDay: string;
  };
  faq: (c: PanchangCtx) => FaqQA[];
}

/** Static titles / descriptions / H1s (prerender + SEO). */
export interface MetaText { title: string; description: string; h1: string }
export interface LangMeta {
  landing: MetaText;
  rashifalHub: MetaText;
  rashifal: (rashi: string) => MetaText;
  yearHub: MetaText;
  year: (rashi: string) => MetaText;
  panchang: (city: string, index: boolean) => MetaText;
  kundali: MetaText;
}

export interface LangVocab {
  code: LangCode;
  rashis: readonly string[];
  nakshatras: readonly string[];
  grahas: Record<Graha, string>;
  /** '' + "Nth house" (nominative) for 1..12 */
  houses: readonly string[];
  /** '' + "in the Nth house" (locative) for 1..12 */
  housesIn: readonly string[];
  /** '' + life areas of the houses from the Moon sign */
  houseAreas: readonly string[];
  tithis: Record<string, string>;
  paksha: { Shukla: string; Krishna: string };
  /** Sunday first */
  varas: readonly string[];
  yogas: readonly string[];
  /** Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti, Shakuni, Chatushpada, Naga, Kimstughna */
  karanas: readonly string[];
  choghadiya: Record<'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Udveg' | 'Kaal' | 'Rog', string>;
  /** Gregorian month names */
  months: readonly string[];
  /** the region's own traditional month names (solar or lunar, in the region's order) */
  regionalMonths: readonly string[];
  doshas: Record<DoshaKey, string>;
  kootas: Record<KootaKey, string>;
  /** '—' + the nine taras */
  taras: readonly string[];
  colours: Record<ColourKey, string>;
  toneWord: Record<T3, string>;
  cities: Record<string, string>;
  ui: {
    home: string; rashifal: string; today: string; rashifal2027: string; panchang: string; kundali: string;
    landing: string; readIn: string; chooseRashi: string; otherRashis: string; freeKundli: string; freeKundliCta: string;
    englishVersion: string; note: string; tellUs: string; cities: string; allLanguages: string;
    dailyLabels: { answer: string; why: string; faq: string };
  };
  meta: LangMeta;
  daily: DailyNarration;
  panchangText: PanchangNarration;
}

/** Long-form page copy (pages only — never bundled into the Worker). */
export interface IntroBlock { heading: string; paras: readonly string[] }
export interface YearCtxSeg { planet: string; house: number; span: string }
export interface YearNarration {
  headline: (name: string, tone: Tone) => string;
  briefSlow: (c: { name: string; jupiter: YearCtxSeg[]; saturn: YearCtxSeg[]; rahu: YearCtxSeg[]; ketu: YearCtxSeg[] }) => string;
  briefPlain: (c: { good: string[]; care: string[]; best?: string; hardest?: string }) => string;
  domain: Record<'love' | 'career' | 'money' | 'health', { title: string; text: Record<Tone, string> }>;
  monthVerdict: { best: string; good: string; mixed: string; care: string; hard: string };
  houseTip: readonly string[];
  ingress: (date: string, planet: string, house: number, tone: Tone) => string;
  retro: (date: string, planet: string, house: number, until: string) => string;
  direct: (date: string, planet: string, house: number) => string;
  eclipseEvent: (date: string, solar: boolean, house: number) => string;
  mainInfluence: (planet: string, house: number) => string;
  saturnLabel: { rising: string; peak: string; setting: string; kantaka: string; ashtama: string; none: (house: number) => string };
  saturnText: (c: { status: 'sadeSati' | 'dhaiya' | 'none'; rows: string; name: string; span?: string }) => string;
  eclipseName: (solar: boolean, type: string) => string;
  eclipseText: (house: number, angular: boolean, india: boolean) => string;
  luckyText: (c: { months: string; colour: string; numbers: string; helper: string; helperColour: string; helperNumber: number; lord: string; day: string }) => string;
  faq: (c: { name: string; headline: string; saturn: string; months: string; best: string; hard: string; career: string; money: string; love: string }) => FaqQA[];
  windowWhy: (bits: Array<{ planet: string; house: number }>) => string;
  ui: {
    eyebrow: string; brief: string; facts: string; transits: string; th: readonly string[]; areas: string; why: string;
    months: string; best: string; bestLead: string; hard: string; hardLead: string; love: string; loveLead: string;
    saturn: string; ecl: string; eclLead: string; eclTh: readonly string[]; lucky: string; luckyMonths: string; colours: string;
    numbers: string; day: string; rem: string; remLead: string; faq: (name: string) => string; method: string; methodText: string;
    others: string; moonSign: string; status: string; ssYes: string; dhYes: string; ssNo: string; bestStretch: string; careStretch: string;
    allYear: string; until: (d: string) => string; from: (d: string) => string; hubLead: string; hubPick: string;
  };
}
export interface KundaliNarration {
  boy: string; girl: string; boyTitle: string; girlTitle: string; name: string; dob: string; tob: string; pob: string; pobPlaceholder: string;
  calculate: string; calculating: string; direction: string; errInput: string; errService: string;
  total: string; points: string; koota: string; kootaLead: string; samePerson: string; minor: string;
  person: (rashi: string, nak: string, pada: number) => string;
  compat: Record<'Excellent' | 'Good' | 'Acceptable' | 'Challenging', string>;
  totalNote: (total: number) => string;
  kootaWhat: Record<KootaKey, string>;
  dosha: (key: 'nadi' | 'bhakoot' | 'gana', cancelled: boolean) => string;
  manglikTitle: string;
  manglikStatus: Record<'clear' | 'mutual' | 'cancelled' | 'one-sided', string>;
  manglikLine: (who: string, has: boolean, high: boolean, lagnaHouse: number, lagnaCounts: boolean, moonHouse: number, moonCounts: boolean) => string;
  remediesTitle: string;
  remedies: { nadi: string; bhakoot: string; gana: string; manglik: string; general: string };
  answer: string;
}
/** B19 — South-Indian (Tamil / Kerala) ten-porutham view, plus Kerala Papasamyam. */
export type PoruthamKey = 'dina' | 'gana' | 'mahendra' | 'stree-deergha' | 'yoni' | 'rasi' | 'rasyadhipathi' | 'vasya' | 'rajju' | 'vedha';
export interface PapaText {
  title: string; lead: string;
  refs: Record<'lagna' | 'moon' | 'venus', string>;
  total: (who: string, points: string) => string;
  hit: (planet: string, ref: string, house: number, points: string) => string;
  noHits: string;
  balanced: string; unbalanced: string; method: string;
}
export interface SouthMatchText {
  title: string; lead: string; essential: string; met: string; notMet: string;
  names: Record<PoruthamKey, string>;
  what: Record<PoruthamKey, string>;
  verdict: Record<'Excellent' | 'Good' | 'Average' | 'Challenging', string>;
  countNote: (met: number, essentialsMet: boolean) => string;
  method: string;
  gunaTitle: string;
  papa?: PapaText;
}
export interface LangCopy {
  landing: { lead: string; intro: readonly IntroBlock[]; faq: readonly FaqQA[]; cards: Record<'rashifal' | 'year' | 'panchang' | 'kundali', string> };
  rashifal: { intro: readonly IntroBlock[]; faq: readonly FaqQA[]; hubLead: string };
  year: { intro: readonly IntroBlock[]; faq: readonly FaqQA[] };
  panchang: { intro: readonly IntroBlock[] };
  kundali: { intro: readonly IntroBlock[]; faq: readonly FaqQA[] };
  /** free-first, optional, no-fear remedy note per demanding influence */
  remedies: Record<Graha | 'sadeSati' | 'dhaiya', string>;
  year2027: YearNarration;
  kundaliText: KundaliNarration;
  /** Ten-porutham block shown first on the matching page (ta, ml). */
  south?: SouthMatchText;
  faqTitle: string;
}
