/**
 * Text for the per-rashi Sade Sati pages (/sade-sati/:rashi, /hi/sade-sati/:rashi).
 * Pure — the page, the FAQ JSON-LD and the tests all use these builders. Titles here are
 * mirrored in scripts/prerender-titles.mjs (checked by sadeSatiRashi.test.ts).
 *
 * Tone (standing rules): calm, practical, no fear — "a period of responsibility and
 * steady effort", never a prediction of harm. Every date comes from the precomputed
 * engine table (src/lib/vedic/sadeSatiRashi.ts); nothing here is invented.
 * Sources for the fixed wording: phase themes follow the site's house significations
 * (src/lib/vedic/planetPlacements.ts HOUSES: 12th Vyaya = expenditure/sleep/foreign,
 * 2nd Dhana = savings/family/speech); Saturn's yearly retrograde lasts 133–142 days
 * (2000–2060, Swiss Ephemeris speed sign check, run 29 Oct 2026) ≈ 4½ months; remedies
 * mirror the sourced catalogue (src/lib/vedic/remedies/catalog.ts, sadeSati entry).
 */
import { RASHIS } from './rashifal';
import { RASHI_SLUGS_HI } from '../daily/registry';
import { periodsFor, type RashiStatus, type SaturnPeriod } from './sadeSatiRashi';

export type Lang = 'en' | 'hi';
export const SS_EN_SLUGS = RASHIS.map(r => r.slug);
export const SS_HI_SLUGS = [...RASHI_SLUGS_HI];
export const ssPath = (idx: number, lang: Lang) => lang === 'hi' ? `/hi/sade-sati/${SS_HI_SLUGS[idx]}` : `/sade-sati/${SS_EN_SLUGS[idx]}`;
export function ssIndexFromSlug(slug: string | undefined, lang: Lang): number {
  if (!slug) return -1;
  return (lang === 'hi' ? SS_HI_SLUGS : SS_EN_SLUGS).indexOf(slug as never);
}

/** Rashi name as shown: "Mesha" / "मेष". */
export const rashiName = (idx: number, lang: Lang) => lang === 'hi' ? RASHIS[idx].hindi : RASHIS[idx].sanskrit;

export function ssPageMeta(idx: number, lang: Lang): { title: string; description: string; h1: string } {
  const r = RASHIS[idx];
  if (lang === 'hi') return {
    title: `${r.hindi} राशि साढ़ेसाती — शुरू और खत्म होने की तारीख | BornClock`,
    description: `${r.hindi} राशि (${r.english}) की साढ़ेसाती और शनि ढैया कब शुरू और कब खत्म होती है? 1950–2060 की हर अवधि, शनि के राशि-परिवर्तन की सटीक तारीखें, वक्री वापसी, तीनों चरण और सरल उपाय।`,
    h1: `${r.hindi} राशि साढ़ेसाती — शुरू और खत्म होने की तारीख`,
  };
  return {
    title: `${r.sanskrit} Rashi Sade Sati Start and End Dates | BornClock`,
    description: `When does Sade Sati start and end for ${r.sanskrit} (${r.english}) Moon sign? Every Sade Sati and Shani Dhaiya period 1950–2060 with exact Saturn transit dates, retrograde re-entries, the three phases and simple remedies.`,
    h1: `${r.sanskrit} Rashi Sade Sati — Start and End Dates`,
  };
}

const IST = 'Asia/Kolkata';
export function fmtDate(iso: string, lang: Lang, month: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month, year: 'numeric', timeZone: IST }).format(new Date(iso));
}
export const signName = (sign: number, lang: Lang) => lang === 'hi' ? RASHIS[sign].hindi : RASHIS[sign].sanskrit;

const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const ORD_HI = ['', 'पहली', 'दूसरी', 'तीसरी', 'चौथी', 'पाँचवीं', 'छठी', 'सातवीं', 'आठवीं', 'नौवीं', 'दसवीं', 'ग्यारहवीं', 'बारहवीं'];
export const houseOrd = (h: number, lang: Lang) => lang === 'hi' ? ORD_HI[h] : ORD_EN[h];

export const PHASE_NAME: Record<Lang, Record<1 | 2 | 3, string>> = {
  en: { 1: 'Phase 1 — Rising', 2: 'Phase 2 — Peak', 3: 'Phase 3 — Setting' },
  hi: { 1: 'पहला चरण — उदय', 2: 'दूसरा चरण — शिखर', 3: 'तीसरा चरण — अस्त' },
};
export const DHAIYA_NAME: Record<Lang, Record<'kantaka' | 'ashtama', string>> = {
  en: { kantaka: 'Kantaka Shani (Saturn 4th from the Moon)', ashtama: 'Ashtama Shani (Saturn 8th from the Moon)' },
  hi: { kantaka: 'कंटक शनि (चंद्र से चौथी राशि)', ashtama: 'अष्टम शनि (चंद्र से आठवीं राशि)' },
};

/** Plain explanation of the three phases for this rashi (sign names filled in). */
export function phaseExplainers(idx: number, lang: Lang): Array<{ name: string; text: string }> {
  const s12 = signName((idx + 11) % 12, lang), s1 = signName(idx, lang), s2 = signName((idx + 1) % 12, lang);
  const me = rashiName(idx, lang);
  if (lang === 'hi') return [
    { name: PHASE_NAME.hi[1], text: `शनि ${s12} में — ${me} से बारहवीं राशि। परंपरा में इसे ख़र्च, दूरी और नई व्यवस्था बनाने का समय माना जाता है: बजट पर ध्यान, नींद और दिनचर्या ठीक रखना, और ज़िम्मेदारियाँ धीरे-धीरे संभालना।` },
    { name: PHASE_NAME.hi[2], text: `शनि ${s1} में — आपकी अपनी चंद्र राशि पर। इसे सबसे ज़्यादा मेहनत माँगने वाला, पर सबसे ज़्यादा परिपक्वता देने वाला चरण माना जाता है: धैर्य, अनुशासन और काम को पूरा करना यहाँ सबसे काम आते हैं।` },
    { name: PHASE_NAME.hi[3], text: `शनि ${s2} में — ${me} से दूसरी राशि। परंपरा में यह परिवार, बचत और वाणी से जुड़ा चरण है; पहले की मेहनत का फल यहीं से दिखने लगता है। सोच-समझकर बोलना और बचत बनाए रखना अच्छा माना जाता है।` },
  ];
  return [
    { name: PHASE_NAME.en[1], text: `Saturn in ${s12}, the 12th sign from ${me}. Traditionally read as a time of expenses, distance and setting up new structures: keep an eye on the budget, protect sleep and routine, and take on responsibilities one step at a time.` },
    { name: PHASE_NAME.en[2], text: `Saturn in ${s1}, on your own Moon sign. Traditionally the most demanding stretch and also the one that builds the most maturity: patience, discipline and finishing what you start matter most here.` },
    { name: PHASE_NAME.en[3], text: `Saturn in ${s2}, the 2nd sign from ${me}. Traditionally linked to family, savings and speech; earlier effort starts to show results. Measured words and steady saving are the classical advice.` },
  ];
}

/** "about 4.2 years" / "लगभग 4.2 वर्ष". */
export function yearsAway(iso: string, nowMs: number, lang: Lang): string {
  const y = Math.max(0, Math.round(((Date.parse(iso) - nowMs) / (365.25 * 864e5)) * 10) / 10);
  return lang === 'hi' ? `लगभग ${y} वर्ष` : `about ${y} year${y === 1 ? '' : 's'}`;
}

/** Headline + explanation for a status on a given date. Calm wording in every case. */
export function statusText(idx: number, st: RashiStatus, lang: Lang): { headline: string; detail: string } {
  const me = rashiName(idx, lang), sat = signName(st.sign, lang);
  const h = ((st.sign - idx + 12) % 12) + 1;
  const d = (iso: string) => fmtDate(iso, lang);
  const span = (p: SaturnPeriod) => `${d(p.start)} – ${d(p.end)}`;
  if (lang === 'hi') {
    switch (st.kind) {
      case 'sadeSati': return { headline: `${me} राशि पर साढ़ेसाती चल रही है — ${PHASE_NAME.hi[st.phase]}`, detail: `शनि ${sat} में हैं (${me} से ${houseOrd(h, 'hi')} राशि) — ${d(st.since)} से ${d(st.until)} तक। पूरी साढ़ेसाती: ${span(st.period)}। यह ज़िम्मेदारी और लगातार प्रयास का समय है, डरने की कोई बात नहीं।` };
      case 'sadeSatiPaused': return { headline: `${me} राशि की साढ़ेसाती अभी कुछ समय के लिए रुकी है`, detail: `शनि वक्री होकर ${sat} में हैं (${me} से ${houseOrd(h, 'hi')} राशि) — ${d(st.since)} से ${d(st.until)} तक, यानी तीनों राशियों से थोड़े समय के लिए बाहर। ${d(st.until)} को साढ़ेसाती फिर आगे बढ़ती है। पूरी साढ़ेसाती: ${span(st.period)}।` };
      case 'dhaiya': return { headline: `${me} राशि पर शनि ढैया चल रही है — ${DHAIYA_NAME.hi[st.type]}`, detail: `शनि ${sat} में हैं — ${d(st.since)} से ${d(st.until)} तक। पूरी ढैया: ${span(st.period)}। यह एक दौर है जिसमें धैर्य और नियमितता काम आते हैं।` };
      case 'dhaiyaPaused': return { headline: `${me} राशि की ढैया अभी कुछ समय के लिए रुकी है`, detail: `शनि वक्री चाल से ${sat} में हैं — ${d(st.since)} से ${d(st.until)} तक। पूरी ढैया: ${span(st.period)}।` };
      default: return { headline: `${me} राशि पर अभी न साढ़ेसाती है, न ढैया`, detail: `शनि ${sat} में हैं (${me} से ${houseOrd(h, 'hi')} राशि) — ${d(st.until)} तक।` };
    }
  }
  switch (st.kind) {
    case 'sadeSati': return { headline: `${me} is in Sade Sati — ${PHASE_NAME.en[st.phase]}`, detail: `Saturn is in ${sat}, the ${houseOrd(h, 'en')} sign from ${me}, from ${d(st.since)} until ${d(st.until)}. The whole Sade Sati runs ${span(st.period)}. It is a period of responsibility and steady effort — nothing to fear.` };
    case 'sadeSatiPaused': return { headline: `${me}'s Sade Sati is paused for a few months`, detail: `Saturn's retrograde motion has taken it back into ${sat}, the ${houseOrd(h, 'en')} sign from ${me}, from ${d(st.since)} until ${d(st.until)} — briefly outside the three Sade Sati signs. It moves back on ${d(st.until)} and the cycle continues. The whole Sade Sati runs ${span(st.period)}.` };
    case 'dhaiya': return { headline: `${me} is in Shani Dhaiya — ${DHAIYA_NAME.en[st.type]}`, detail: `Saturn is in ${sat} from ${d(st.since)} until ${d(st.until)}. The whole Dhaiya runs ${span(st.period)}. A season that rewards patience and routine — not a sentence.` };
    case 'dhaiyaPaused': return { headline: `${me}'s Dhaiya is paused for a few months`, detail: `Saturn's retrograde motion has it in ${sat} from ${d(st.since)} until ${d(st.until)}. The whole Dhaiya runs ${span(st.period)}.` };
    default: return { headline: `${me} is not in Sade Sati or Dhaiya`, detail: `Saturn is in ${sat}, the ${houseOrd(h, 'en')} sign from ${me}, until ${d(st.until)}.` };
  }
}

/** FAQ — static facts only (date ranges), so it can never go stale between deploys. */
export function ssFaq(idx: number, lang: Lang): Array<{ question: string; answer: string }> {
  const me = rashiName(idx, lang);
  const d = (iso: string) => fmtDate(iso, lang, 'long');
  const list = (ps: SaturnPeriod[]) => ps.map(p => `${d(p.start)} – ${d(p.end)}`).join(lang === 'hi' ? '; ' : '; ');
  const ss = periodsFor(idx, 'sadeSati'), ka = periodsFor(idx, 'kantaka'), as = periodsFor(idx, 'ashtama');
  const s12 = signName((idx + 11) % 12, lang), s2 = signName((idx + 1) % 12, lang);
  if (lang === 'hi') return [
    { question: `${me} राशि की साढ़ेसाती कब शुरू और कब खत्म होती है?`, answer: `1950 से 2060 के बीच ${me} राशि की साढ़ेसाती: ${list(ss)}। हर अवधि शनि के ${s12} में पहले प्रवेश से शुरू होकर ${s2} से अंतिम निकास पर खत्म होती है (भारतीय मानक समय)।` },
    { question: `${me} राशि पर शनि ढैया कब होती है?`, answer: `कंटक शनि (चौथी राशि): ${list(ka)}। अष्टम शनि (आठवीं राशि): ${list(as)}।` },
    { question: 'साढ़ेसाती के तीन चरण क्या हैं?', answer: `पहला चरण (उदय) — शनि ${s12} में; दूसरा चरण (शिखर) — शनि ${me} में; तीसरा चरण (अस्त) — शनि ${s2} में। हर चरण लगभग ढाई वर्ष का होता है।` },
    { question: 'तालिका में शनि बीच में बाहर जाकर वापस क्यों आते हैं?', answer: 'शनि हर वर्ष लगभग साढ़े चार महीने वक्री (उल्टी चाल में दिखते) रहते हैं। राशि की सीमा के पास वक्री होने पर वे कुछ महीनों के लिए पिछली राशि में लौट जाते हैं और फिर आगे बढ़ते हैं — इसलिए एक ही अवधि में प्रवेश, निकास और दोबारा प्रवेश की अलग-अलग तारीखें दिखती हैं।' },
    { question: 'क्या साढ़ेसाती हमेशा बुरी होती है?', answer: 'नहीं। हर व्यक्ति के जीवन में यह लगभग हर 30 वर्ष में आती है। यह ज़िम्मेदारी, अनुशासन और लगातार प्रयास का समय है; बहुत से लोग इसे वह दौर मानते हैं जिसने उनकी सबसे मज़बूत नींव बनाई। असर आपकी पूरी कुंडली और दशा पर भी निर्भर करता है।' },
    { question: 'साढ़ेसाती में क्या उपाय करें?', answer: 'सबसे पहले बिना ख़र्च वाले उपाय: शनि मंत्र या हनुमान चालीसा का पाठ, शनिवार को सेवा और ज़रूरतमंदों की मदद, नियमित दिनचर्या और ईमानदार मेहनत। कोई उपाय अनिवार्य नहीं है और कोई भी परिणाम की गारंटी नहीं देता। रत्न केवल योग्य ज्योतिषी से पूरी कुंडली जँचवाने के बाद।' },
  ];
  return [
    { question: `When does Sade Sati start and end for ${me} rashi?`, answer: `${me} Moon sign's Sade Sati periods between 1950 and 2060: ${list(ss)}. Each runs from Saturn's first entry into ${s12} to its final exit from ${s2} (dates in Indian Standard Time).` },
    { question: `When is Shani Dhaiya for ${me} rashi?`, answer: `Kantaka Shani (4th sign from the Moon): ${list(ka)}. Ashtama Shani (8th sign from the Moon): ${list(as)}.` },
    { question: 'What are the three phases of Sade Sati?', answer: `Phase 1 (Rising) — Saturn in ${s12}; Phase 2 (Peak) — Saturn in ${me}; Phase 3 (Setting) — Saturn in ${s2}. Each phase lasts about two and a half years.` },
    { question: 'Why does Saturn leave and come back in the table?', answer: 'Saturn appears to move backwards (retrograde) for about four and a half months every year. When that happens near the edge of a sign, it steps back into the previous sign for a few months and then moves on again — so one period can have an entry, an exit and a re-entry date.' },
    { question: 'Is Sade Sati always bad?', answer: 'No. Everyone meets it roughly every 30 years. It is a period of responsibility, discipline and steady effort, and many people look back on it as the time that built their strongest foundations. How it feels also depends on your full birth chart and running Dasha.' },
    { question: 'What remedies help during Sade Sati?', answer: 'Free practices first: a Shani mantra or the Hanuman Chalisa, service and help to people in need on Saturdays, a steady routine and honest hard work. No remedy is required and none guarantees a result. Gemstones only after a qualified astrologer has checked the full chart.' },
  ];
}
