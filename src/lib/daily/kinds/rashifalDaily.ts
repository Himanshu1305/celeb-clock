/**
 * W1 — Daily Vedic Rashifal (English + Hindi), computed from that India date's real
 * sidereal sky (./vedicSky.ts) and read by a fixed rules table. Counted from the
 * Moon sign (rashi), the Vedic convention:
 *
 *  • Chandrabala — the Moon's house from the rashi. Supportive in 1, 3, 6, 7, 10, 11;
 *    care in 4, 8 (Chandrashtama), 12; mixed in 2, 5, 9. This is the same classical
 *    gochar table the weekly/monthly/yearly rashifal uses (gocharTone in
 *    src/lib/vedic/rashifal.ts), so all periods read the sky the same way.
 *  • Tarabala — count from a birth nakshatra to the day's Moon nakshatra, in 9s
 *    (taraNum + TARA_NAMES in src/lib/vedic/nakshatraAttributes.ts; 3/5/7 = care).
 *    A rashi spans 2–3 nakshatras, so it is shown for each of them.
 *  • Slow planets — Saturn (Sade Sati: 12th/1st/2nd from the Moon; Dhaiya: 4th/8th),
 *    Jupiter, Rahu/Ketu by house from the Moon (same gochar table).
 *  • Venus (love), Mercury (paperwork/talks), Mars (pace/energy) by house from the Moon.
 *  • Lucky time — the day's best Choghadiya for New Delhi that avoids Rahu Kaal
 *    (computeDayPanchang). Lucky colour/numbers are the rashi's traditional ones
 *    (RASHIS in src/lib/vedic/rashifal.ts), labelled as traditional.
 *
 * Deterministic: the same (date, rashi) always gives the same text; phrasing variants
 * are chosen by a hash of (date, rashi, section), and the facts change daily.
 * Tone rules: calm, practical, never fear; health is care only.
 */
import type { DailyEntry, DailySection, DailyTone, DailyWhy, DailyFaq } from '../types';
import { RASHIS, gocharTone, type PlanetName, type Tone } from '../../vedic/rashifal';
import { TARA_NAMES, taraNum } from '../../vedic/nakshatraAttributes';
import { formatDateEn, formatDateHi, formatLongDateEn, formatLongDateHi, clock12 } from '../dates';
import { RASHI_SLUGS, RASHI_SLUGS_HI } from '../registry';
import { vedicSky, houseFrom, nakshatrasInRashi, bestChoghadiya, DEFAULT_CITY, type VedicSky, type MoonChange } from './vedicSky';
import { pick, ORD_EN, ORD_HI } from './pick';

const NAK_EN = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const NAK_HI = ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपदा', 'उत्तराभाद्रपदा', 'रेवती'];
const TARA_HI = ['—', 'जन्म', 'संपत', 'विपत', 'क्षेम', 'प्रत्यरि', 'साधक', 'वध', 'मित्र', 'परम मित्र'];
const CHOGH_HI: Record<string, string> = { Amrit: 'अमृत', Shubh: 'शुभ', Labh: 'लाभ' };

/** Display name people search for ("Mesh rashifal") — the slug, capitalised. */
const SEARCH_NAME = RASHI_SLUGS.map(s => s.charAt(0).toUpperCase() + s.slice(1));

type T3 = 'good' | 'mixed' | 'care';
const toT3 = (t: Tone): T3 => (t === 'favourable' ? 'good' : t === 'challenging' ? 'care' : 'mixed');

/** Life area per house from the Moon. */
const AREA_EN = ['', 'yourself, your health and how you come across', 'money, family and speech', 'effort, courage, siblings and short trips', 'home, mother and peace of mind', 'children, romance, creativity and study', 'work, daily routine and competition', 'your partner, marriage and dealings with others', 'change, shared money and private matters', 'luck, elders, teachers, long journeys and faith', 'career, status and reputation', 'income, gains, friends and wishes', 'expenses, rest, sleep and faraway places'];
const AREA_HI = ['', 'स्वयं, स्वास्थ्य और व्यक्तित्व', 'धन, परिवार और वाणी', 'पराक्रम, भाई-बहन और छोटी यात्राएँ', 'घर, माता और मन की शांति', 'संतान, प्रेम, रचनात्मकता और पढ़ाई', 'काम, दिनचर्या और प्रतिस्पर्धा', 'जीवनसाथी, विवाह और साझेदारी', 'बदलाव, साझा धन और निजी मामले', 'भाग्य, बड़े-बुज़ुर्ग, गुरु, लंबी यात्रा और आस्था', 'करियर, पद और मान-सम्मान', 'आय, लाभ, मित्र और इच्छाएँ', 'ख़र्च, विश्राम, नींद और दूर के स्थान'];

/** The day's practical tip for the Moon's house (each house has one classical Moon tone). */
const MOON_TIP_EN: string[][] = [[],
  ['Your energy and presence are on your side — lead with your own plans.', 'A good day to start something for yourself and be seen at your best.'],
  ['Keep spending purposeful and speak kindly at home.', 'Money and family matters move, but think before you speak or spend.'],
  ['Back your own initiative — calls, messages and short trips go well.', 'Effort pays today; take the first step on something you have been putting off.'],
  ['Keep the day simple, spend time at home and protect your peace of mind.', 'Moods may run high at home — rest well and avoid taking on too much.'],
  ['Make time for creative work or study, but keep risky bets small.', 'A day for learning and light-hearted time; avoid speculative money moves.'],
  ['Clear pending work and tidy your routine — you will stay ahead of competition.', 'Good for steady work, healthy habits and settling small disputes.'],
  ['Meetings, partnerships and one-to-one talks go smoothly — meet people halfway.', 'A good day for time with your partner and for agreements made in good faith.'],
  ['This is Chandrashtama, the Moon in the 8th from your sign — postpone big decisions where you can and keep plans flexible.', 'The Moon is in the 8th from your sign (Chandrashtama) — keep a low profile, avoid new joint money commitments and rest early.'],
  ['Listen to elders and mentors, and plan any travel carefully.', 'Learning and faith bring comfort; don’t rely on luck alone for results.'],
  ['Put your best work where it will be seen — effort at work gets noticed.', 'A good day for career steps, meetings with seniors and public work.'],
  ['Follow up on income, contacts and long-held wishes.', 'Friends and contacts help today — ask for what you need.'],
  ['Watch expenses, guard your sleep and give yourself some quiet time.', 'Spend wisely and keep the evening restful; good for prayer or reflection.'],
];
const MOON_TIP_HI: string[][] = [[],
  ['ऊर्जा और आत्मविश्वास आपके साथ हैं — अपनी योजनाओं को आगे बढ़ाएँ।', 'अपने लिए कुछ नया शुरू करने और अपनी अच्छी छवि रखने का दिन है।'],
  ['ख़र्च सोच-समझकर करें और घर में मीठा बोलें।', 'धन और परिवार के काम आगे बढ़ेंगे, पर बोलने और ख़र्च करने से पहले सोचें।'],
  ['अपनी पहल पर भरोसा रखें — फ़ोन, संदेश और छोटी यात्राएँ अच्छी रहेंगी।', 'मेहनत का फल मिलेगा; जो काम टल रहा था, उसकी शुरुआत करें।'],
  ['दिन सरल रखें, घर पर समय बिताएँ और मन की शांति बनाए रखें।', 'घर में भावनाएँ तेज़ हो सकती हैं — आराम करें और ज़्यादा काम न लें।'],
  ['पढ़ाई या रचनात्मक काम के लिए समय निकालें, पर जोखिम वाले दाँव छोटे रखें।', 'सीखने और हल्के-फुल्के समय का दिन है; सट्टे जैसे फ़ैसलों से बचें।'],
  ['रुके हुए काम निपटाएँ और दिनचर्या ठीक रखें — प्रतिस्पर्धा में आगे रहेंगे।', 'नियमित काम, अच्छी आदतों और छोटे विवाद सुलझाने के लिए अच्छा दिन।'],
  ['मुलाक़ातें, साझेदारी और आमने-सामने की बातचीत अच्छी रहेगी — बीच का रास्ता अपनाएँ।', 'जीवनसाथी के साथ समय और भरोसे से किए गए समझौतों के लिए अच्छा दिन।'],
  ['आज चंद्राष्टम है (चंद्रमा आपकी राशि से आठवें भाव में) — बड़े फ़ैसले हो सके तो टालें और योजनाओं में लचीलापन रखें।', 'चंद्रमा आपकी राशि से आठवें भाव में है (चंद्राष्टम) — शांत रहें, साझा धन की नई ज़िम्मेदारी न लें और जल्दी आराम करें।'],
  ['बड़ों और गुरुजनों की सलाह सुनें, यात्रा की योजना सावधानी से बनाएँ।', 'पढ़ाई और आस्था से मन को सुकून मिलेगा; केवल भाग्य के भरोसे न रहें।'],
  ['अपना सबसे अच्छा काम सामने रखें — कार्यक्षेत्र में मेहनत पर ध्यान जाएगा।', 'करियर के क़दम, वरिष्ठों से मुलाक़ात और सार्वजनिक काम के लिए अच्छा दिन।'],
  ['आय, संपर्कों और पुरानी इच्छाओं पर ध्यान दें।', 'मित्र और जान-पहचान वाले आज मदद करेंगे — जो चाहिए, माँग लें।'],
  ['ख़र्च पर नज़र रखें, नींद पूरी करें और कुछ समय शांति में बिताएँ।', 'सोच-समझकर ख़र्च करें और शाम शांत रखें; पूजा या चिंतन के लिए अच्छा समय।'],
];

const HEADLINE_EN: Record<T3, string[]> = {
  good: ['a supportive day', 'a day that tends to flow well', 'a favourable, productive day'],
  mixed: ['a mixed but steady day', 'an ordinary day that rewards steady effort', 'a day of small ups and downs that evens out'],
  care: ['a day to go gently', 'a quieter day — keep plans simple', 'a day to slow down and look after yourself'],
};
const HEADLINE_HI: Record<T3, string[]> = {
  good: ['अनुकूल दिन', 'अच्छा और उपयोगी दिन', 'साथ देने वाला दिन'],
  mixed: ['मिला-जुला दिन', 'सामान्य, स्थिर दिन', 'छोटे उतार-चढ़ाव वाला, पर संभला हुआ दिन'],
  care: ['सँभलकर चलने का दिन', 'शांत रहकर काम करने का दिन', 'धीमे चलने और अपना ध्यान रखने का दिन'],
};
const TONE_WORD_EN: Record<T3, string> = { good: 'supportive', mixed: 'mixed', care: 'a call to go gently' };
const TONE_WORD_HI: Record<T3, string> = { good: 'अनुकूल', mixed: 'मिश्रित', care: 'सावधानी का संकेत' };

function changeClauseEn(changes: MoonChange[], moonSign: number, rashi: number): string {
  if (!changes.length) return '';
  const c = changes[0];
  if (c.beforeRef) return ` (since ${c.at} IST; before that it was in your ${ORD_EN[houseFrom((c.to + 11) % 12, rashi)]})`;
  return ` until ${c.at} IST, when it moves into your ${ORD_EN[houseFrom(c.to, rashi)]} house`;
}
function changeClauseHi(changes: MoonChange[], rashi: number): string {
  if (!changes.length) return '';
  const c = changes[0];
  if (c.beforeRef) return ` (${c.at} बजे से; उससे पहले ${ORD_HI[houseFrom((c.to + 11) % 12, rashi)]} भाव में)`;
  return `, ${c.at} बजे के बाद ${ORD_HI[houseFrom(c.to, rashi)]} भाव में`;
}
function nakClauseEn(sky: VedicSky): string {
  const c = sky.moonNakChanges.find(x => !x.beforeRef);
  return c ? ` (until ${c.at} IST, then ${NAK_EN[c.to]})` : '';
}
function nakClauseHi(sky: VedicSky): string {
  const c = sky.moonNakChanges.find(x => !x.beforeRef);
  return c ? ` (${c.at} बजे तक, फिर ${NAK_HI[c.to]})` : '';
}

interface Factors {
  rashi: number;
  moonHouse: number;
  moonTone: T3;
  venus: { house: number; tone: T3 };
  mercury: { house: number; tone: T3 };
  mars: { house: number; tone: T3 };
  jupiter: { house: number; tone: T3 };
  saturn: { house: number; tone: T3; sadeSati: '' | 'rising' | 'peak' | 'setting'; dhaiya: boolean };
  rahu: { house: number; tone: T3 };
  taras: { nak: number; tara: number; tone: T3 }[];
}

function factors(sky: VedicSky, rashi: number): Factors {
  const h = (p: PlanetName) => houseFrom(sky.sign[p], rashi);
  const t = (p: PlanetName) => toT3(gocharTone(p, h(p)));
  const sh = h('Saturn');
  const taras = nakshatrasInRashi(rashi).map(nak => {
    const tara = taraNum(nak, sky.moonNak);
    const tone: T3 = [3, 5, 7].includes(tara) ? 'care' : tara === 1 ? 'mixed' : 'good';
    return { nak, tara, tone };
  });
  return {
    rashi,
    moonHouse: h('Moon'),
    moonTone: t('Moon'),
    venus: { house: h('Venus'), tone: t('Venus') },
    mercury: { house: h('Mercury'), tone: t('Mercury') },
    mars: { house: h('Mars'), tone: t('Mars') },
    jupiter: { house: h('Jupiter'), tone: t('Jupiter') },
    saturn: { house: sh, tone: t('Saturn'), sadeSati: sh === 12 ? 'rising' : sh === 1 ? 'peak' : sh === 2 ? 'setting' : '', dhaiya: sh === 4 || sh === 8 },
    rahu: { house: h('Rahu'), tone: t('Rahu') },
    taras,
  };
}

const TARA_TONE_EN: Record<T3, string> = { good: 'supportive', mixed: 'neutral', care: 'go gently' };
const TARA_TONE_HI: Record<T3, string> = { good: 'अनुकूल', mixed: 'सामान्य', care: 'सावधानी' };

// ── English ────────────────────────────────────────────────────────────────────

function slowLineEn(f: Factors): { label: string; text: string; answer: string } {
  const s = f.saturn;
  if (s.sadeSati) {
    return {
      label: `Sade Sati — Saturn in your ${ORD_EN[s.house]} house`,
      text: `Saturn is in the ${ORD_EN[s.house]} from your Moon sign, so the ${s.sadeSati} phase of Sade Sati is running. Sade Sati is the roughly 7½ years Saturn takes to pass the sign before, on and after your Moon sign — a slow, maturing stretch in which steady, honest effort is rewarded.`,
      answer: `In the background, Sade Sati (${s.sadeSati} phase) asks for patience and steady effort.`,
    };
  }
  if (s.dhaiya) {
    return {
      label: `Shani Dhaiya — Saturn in your ${ORD_EN[s.house]} house`,
      text: `Saturn in the ${ORD_EN[s.house]} from your Moon sign is the 2½-year Dhaiya (${s.house === 4 ? 'Kantaka' : 'Ashtama'} Shani): responsibilities feel heavier, so keep routines steady and be patient with delays.`,
      answer: `In the background, Shani Dhaiya asks you to keep routines steady and be patient with delays.`,
    };
  }
  const j = f.jupiter;
  const jText = j.tone === 'good'
    ? 'a long-running support for growth, good advice and opportunities'
    : j.tone === 'care' ? 'a reminder not to over-commit — growth comes slowly right now' : 'a mixed, slow-moving influence — real progress, but not overnight';
  return {
    label: `Jupiter in your ${ORD_EN[j.house]} house`,
    text: `Jupiter, the slow planet of growth and wisdom, is in the ${ORD_EN[j.house]} from your Moon sign — ${jText}. It stays in a sign for about a year, so this sets the longer backdrop rather than today alone.`,
    answer: j.tone === 'good'
      ? `In the background, Jupiter in your ${ORD_EN[j.house]} house is a steady support.`
      : `In the background, Jupiter in your ${ORD_EN[j.house]} house asks for patience with bigger plans.`,
  };
}

function loveEn(f: Factors, date: string, slug: string): { text: string; tone: DailyTone } {
  const v = f.venus;
  const base = v.tone === 'good'
    ? pick([
        `Venus in your ${ORD_EN[v.house]} house from the Moon supports warmth and harmony — a good day for kind words, time together or a small gesture.`,
        `Venus, the planet of love, sits well for you in your ${ORD_EN[v.house]} house — relationships feel easier when you make the first friendly move.`,
      ], date, slug, 'love')
    : pick([
        `Venus in your ${ORD_EN[v.house]} house can bring small misunderstandings — listen first and keep expectations gentle.`,
        `With Venus in your ${ORD_EN[v.house]} house, affection needs a little more patience — say what you feel simply and kindly.`,
      ], date, slug, 'love');
  const moon = f.moonHouse === 7 ? ' With the Moon in your 7th, your partner’s mood matters more than usual today.'
    : f.moonHouse === 5 ? ' The Moon in your 5th favours romance, fun and time with children.'
    : [4, 8, 12].includes(f.moonHouse) ? ' If feelings run high, give each other a little space.' : '';
  const tone: DailyTone = v.tone === 'good' && f.moonTone !== 'care' ? 'good' : v.tone === 'care' && f.moonTone === 'care' ? 'care' : 'mixed';
  return { text: base + moon, tone };
}

function careerEn(f: Factors, date: string, slug: string): { text: string; tone: DailyTone } {
  const focus: Record<number, string> = {
    10: 'Career is in focus with the Moon in your 10th — a good day to show your work.',
    11: 'The Moon in your 11th favours income, follow-ups and help from contacts.',
    6: 'The Moon in your 6th helps you clear pending tasks and handle competition calmly.',
    2: 'The Moon in your 2nd puts money and savings in focus — keep spending purposeful.',
    3: 'The Moon in your 3rd rewards initiative — send the proposal or make the call.',
    12: 'The Moon in your 12th can raise expenses — check bills and avoid impulse spending.',
    8: 'The Moon in your 8th is better for quiet, behind-the-scenes work than big launches.',
  };
  const s1 = focus[f.moonHouse] ?? pick([
    'Work moves at a normal pace today — finish what is already on your plate.',
    'An ordinary day at work; steady effort counts for more than bold moves.',
  ], date, slug, 'career1');
  const m = f.mercury;
  const s2 = m.tone === 'good'
    ? `Mercury in your ${ORD_EN[m.house]} house helps paperwork, calls and trade.`
    : `Mercury in your ${ORD_EN[m.house]} house asks you to double-check figures, messages and documents before you send them.`;
  const j = f.jupiter;
  const s3 = j.tone === 'good' ? `Jupiter in your ${ORD_EN[j.house]} keeps longer-term money matters on a supportive footing.` : '';
  const tone: DailyTone = f.moonTone === 'good' && m.tone === 'good' ? 'good' : f.moonTone === 'care' && m.tone !== 'good' ? 'care' : 'mixed';
  return { text: [s1, s2, s3].filter(Boolean).join(' '), tone };
}

function healthEn(f: Factors, date: string, slug: string): { text: string; tone: DailyTone } {
  const s1 = f.moonTone === 'good'
    ? pick(['Energy is steady — keep up exercise, regular meals and good sleep.', 'A good day to keep healthy routines going.'], date, slug, 'h1')
    : f.moonTone === 'care'
      ? pick(['Energy may dip — rest, drink enough water and don’t overload the day.', 'Go easy on yourself today: early night, light meals, fewer commitments.'], date, slug, 'h1')
      : pick(['Keep a balanced routine and take short breaks.', 'Pace yourself — a steady routine helps more than extremes.'], date, slug, 'h1');
  const ma = f.mars;
  const s2 = ma.tone === 'good'
    ? `Mars in your ${ORD_EN[ma.house]} house gives drive — put it into exercise or physical work.`
    : ma.tone === 'care'
      ? `Mars in your ${ORD_EN[ma.house]} house can make you hasty — slow down and take extra care on the road.`
      : `Mars in your ${ORD_EN[ma.house]} house brings mixed energy — channel it, don’t rush.`;
  const tone: DailyTone = f.moonTone === 'care' || ma.tone === 'care' ? 'care' : f.moonTone === 'good' ? 'good' : 'mixed';
  return { text: `${s1} ${s2} This is general guidance, not medical advice.`, tone };
}

export function composeRashifalEn(date: string, rashi: number, sky: VedicSky = vedicSky(date)): DailyEntry {
  const f = factors(sky, rashi);
  const meta = RASHIS[rashi];
  const name = SEARCH_NAME[rashi];
  const slug = RASHI_SLUGS[rashi];
  const dEn = formatDateEn(date);
  const area = AREA_EN[f.moonHouse];
  const headline = pick(HEADLINE_EN[f.moonTone], date, slug, 'headline');
  const tip = pick(MOON_TIP_EN[f.moonHouse], date, slug, 'tip');
  const slow = slowLineEn(f);
  const moonCl = changeClauseEn(sky.moonSignChanges, sky.sign.Moon, rashi);
  const best = bestChoghadiya(sky);

  const answer = `${name} (${meta.english}) rashifal for ${dEn}: ${headline}. The Moon is in your ${ORD_EN[f.moonHouse]} house — ${area}${moonCl} — which Vedic astrology reads as ${TONE_WORD_EN[f.moonTone]}. ${tip} ${slow.answer}`;

  const overviewText = `The Moon, which sets the mood of the day, is in ${RASHIS[sky.sign.Moon].sanskrit} — your ${ORD_EN[f.moonHouse]} house${moonCl} — in ${NAK_EN[sky.moonNak]} nakshatra${nakClauseEn(sky)}. ${tip}` +
    (f.rahu.tone === 'care' ? ` Rahu in your ${ORD_EN[f.rahu.house]} house is a long-running reminder to check facts before acting on rumours or shortcuts.` : '');

  const love = loveEn(f, date, slug);
  const career = careerEn(f, date, slug);
  const health = healthEn(f, date, slug);

  const luckyItems = [
    { label: 'Lucky colour (traditional)', value: meta.luckyColor },
    { label: 'Lucky numbers (traditional)', value: meta.luckyNumbers.join(', ') },
    ...(best ? [{ label: `Good time today (${DEFAULT_CITY.name})`, value: `${clock12(best.start)} – ${clock12(best.end)}`, note: `${best.name} Choghadiya. Times follow local sunrise, so they shift a little in other cities.` }] : []),
    { label: `Rahu Kaal (${DEFAULT_CITY.name})`, value: `${clock12(sky.rahuKaal.start)} – ${clock12(sky.rahuKaal.end)}`, note: 'Traditionally avoided for starting new work.' },
  ];

  const sections: DailySection[] = [
    { id: 'overview', heading: 'Overall', text: overviewText, tone: f.moonTone },
    { id: 'love', heading: 'Love & relationships', text: love.text, tone: love.tone },
    { id: 'career', heading: 'Career & money', text: career.text, tone: career.tone },
    { id: 'health', heading: 'Health & energy', text: health.text, tone: health.tone },
    { id: 'lucky', heading: 'Lucky colour, number & time', items: luckyItems },
  ];

  const taraLine = f.taras.map(t => `${NAK_EN[t.nak]}-born: ${TARA_NAMES[t.tara]} (${TARA_TONE_EN[t.tone]})`).join('; ');
  const why: DailyWhy[] = [
    {
      label: `Chandrabala — Moon in your ${ORD_EN[f.moonHouse]} house`,
      text: `${TONE_WORD_EN[f.moonTone].charAt(0).toUpperCase() + TONE_WORD_EN[f.moonTone].slice(1)} today. Chandrabala is the Moon’s support for you, judged by which house from your Moon sign it passes through; the 1st, 3rd, 6th, 7th, 10th and 11th are classically supportive.`,
    },
    {
      label: `Tarabala — Moon in ${NAK_EN[sky.moonNak]} nakshatra`,
      text: `${taraLine}. Tarabala counts from your birth nakshatra to today’s in groups of nine; your Kundli shows your birth nakshatra.`,
    },
    { label: slow.label, text: slow.text },
  ];

  const faq: DailyFaq[] = [
    { q: `What is the ${name} rashifal for today, ${dEn}?`, a: answer },
    {
      q: `What is the lucky time for ${name} today?`,
      a: (best ? `In ${DEFAULT_CITY.name}, the best window today is ${best.name} Choghadiya, ${clock12(best.start)} – ${clock12(best.end)}. ` : '') +
        `Rahu Kaal, traditionally avoided for new starts, is ${clock12(sky.rahuKaal.start)} – ${clock12(sky.rahuKaal.end)}. Times shift with local sunrise in other cities. The traditional lucky colour for ${meta.sanskrit} is ${meta.luckyColor.toLowerCase()} and the lucky numbers are ${meta.luckyNumbers.join(' and ')}.`,
    },
    {
      q: 'Is the rashifal read from my Moon sign or Sun sign?',
      a: 'Vedic rashifal is read from your Moon sign (rashi), not the Sun sign used in Western horoscopes. If you are not sure of your Moon sign, BornClock’s free Kundli shows it.',
    },
    {
      q: 'How is this daily rashifal calculated?',
      a: 'From the real sidereal (Lahiri) positions of the planets for this India date, using BornClock’s own engine: the Moon’s house from your rashi (Chandrabala), the Moon’s nakshatra (Tarabala), Saturn, Jupiter and Rahu by house, and Venus, Mercury and Mars for love, work and energy. The same date always gives the same reading. It is reflective guidance, not certainty.',
    },
  ];

  return {
    date,
    lang: 'en',
    title: `${name} Rashifal Today, ${dEn} — ${meta.sanskrit} (${meta.english}) Horoscope | BornClock`,
    description: `${name} rashifal for ${dEn}: ${headline}. Moon in your ${ORD_EN[f.moonHouse]} house in ${NAK_EN[sky.moonNak]} nakshatra — love, career, health and lucky time from the real sky.`,
    h1: `${name} Rashifal Today — ${dEn}`,
    dateLabel: formatLongDateEn(date),
    answer,
    why,
    sections,
    faq,
  };
}

// ── Hindi ──────────────────────────────────────────────────────────────────────

function slowLineHi(f: Factors): { label: string; text: string; answer: string } {
  const s = f.saturn;
  const phaseHi = { rising: 'पहला (आरंभ)', peak: 'दूसरा (मध्य)', setting: 'तीसरा (अंतिम)' } as const;
  if (s.sadeSati) {
    return {
      label: `साढ़े साती — शनि ${ORD_HI[s.house]} भाव में`,
      text: `शनि आपकी चंद्र राशि से ${ORD_HI[s.house]} भाव में है, इसलिए साढ़े साती का ${phaseHi[s.sadeSati]} चरण चल रहा है। साढ़े साती लगभग साढ़े सात साल का समय है जब शनि आपकी चंद्र राशि से पहले, उसी में और उसके बाद वाली राशि से गुज़रता है — धीमा पर परिपक्व बनाने वाला समय, जिसमें ईमानदार और नियमित मेहनत का फल मिलता है।`,
      answer: 'पृष्ठभूमि में चल रही साढ़े साती धैर्य और नियमित मेहनत की माँग करती है।',
    };
  }
  if (s.dhaiya) {
    return {
      label: `शनि की ढैया — शनि ${ORD_HI[s.house]} भाव में`,
      text: `चंद्र राशि से ${ORD_HI[s.house]} भाव में शनि ढाई साल की ढैया (${s.house === 4 ? 'कंटक' : 'अष्टम'} शनि) है — ज़िम्मेदारियाँ भारी लग सकती हैं, इसलिए दिनचर्या स्थिर रखें और देरी में धैर्य रखें।`,
      answer: 'पृष्ठभूमि में शनि की ढैया दिनचर्या स्थिर रखने और धैर्य रखने को कहती है।',
    };
  }
  const j = f.jupiter;
  const jText = j.tone === 'good' ? 'प्रगति, अच्छी सलाह और अवसरों में लंबे समय का सहारा' : j.tone === 'care' ? 'ज़्यादा ज़िम्मेदारियाँ न लेने की सीख — अभी प्रगति धीरे होगी' : 'मिला-जुला, धीमा प्रभाव — प्रगति होगी, पर रातों-रात नहीं';
  return {
    label: `गुरु ${ORD_HI[j.house]} भाव में`,
    text: `विकास और ज्ञान का धीमा ग्रह गुरु (बृहस्पति) आपकी चंद्र राशि से ${ORD_HI[j.house]} भाव में है — ${jText}। गुरु एक राशि में लगभग एक साल रहता है, इसलिए यह केवल आज का नहीं, लंबे समय का माहौल है।`,
    answer: j.tone === 'good' ? `पृष्ठभूमि में ${ORD_HI[j.house]} भाव का गुरु आपका साथ दे रहा है।` : `पृष्ठभूमि में ${ORD_HI[j.house]} भाव का गुरु बड़ी योजनाओं में धैर्य रखने को कहता है।`,
  };
}

export function composeRashifalHi(date: string, rashi: number, sky: VedicSky = vedicSky(date)): DailyEntry {
  const f = factors(sky, rashi);
  const meta = RASHIS[rashi];
  const slug = RASHI_SLUGS_HI[rashi];
  const dHi = formatDateHi(date);
  const headline = pick(HEADLINE_HI[f.moonTone], date, slug, 'headline');
  const tip = pick(MOON_TIP_HI[f.moonHouse], date, slug, 'tip');
  const slow = slowLineHi(f);
  const moonCl = changeClauseHi(sky.moonSignChanges, rashi);
  const best = bestChoghadiya(sky);
  const moonRashiHi = RASHIS[sky.sign.Moon].hindi;

  const answer = `${meta.hindi} राशिफल, ${dHi}: आज ${headline} है। चंद्रमा आपकी राशि से ${ORD_HI[f.moonHouse]} भाव (${AREA_HI[f.moonHouse]}) में है${moonCl} — वैदिक ज्योतिष में यह ${TONE_WORD_HI[f.moonTone]} माना जाता है। ${tip} ${slow.answer}`;

  const overviewText = `दिन का मूड तय करने वाला चंद्रमा आज ${moonRashiHi} राशि में, यानी आपकी राशि से ${ORD_HI[f.moonHouse]} भाव में है${moonCl}, और ${NAK_HI[sky.moonNak]} नक्षत्र में है${nakClauseHi(sky)}। ${tip}` +
    (f.rahu.tone === 'care' ? ` ${ORD_HI[f.rahu.house]} भाव का राहु याद दिलाता है कि अफ़वाहों या शॉर्टकट पर चलने से पहले तथ्य जाँच लें।` : '');

  const v = f.venus;
  const loveBase = v.tone === 'good'
    ? pick([`चंद्र राशि से ${ORD_HI[v.house]} भाव में शुक्र रिश्तों में मिठास लाता है — प्यार भरे शब्द, साथ बिताया समय या छोटा-सा उपहार अच्छा रहेगा।`, `प्रेम का ग्रह शुक्र ${ORD_HI[v.house]} भाव में आपके अनुकूल है — पहले आप प्यार से बात शुरू करें, रिश्ते सहज लगेंगे।`], date, slug, 'love')
    : pick([`${ORD_HI[v.house]} भाव में शुक्र छोटी-मोटी ग़लतफ़हमियाँ ला सकता है — पहले सुनें और उम्मीदें नरम रखें।`, `शुक्र ${ORD_HI[v.house]} भाव में है, इसलिए रिश्तों में थोड़ा धैर्य चाहिए — अपनी बात सरलता और प्यार से कहें।`], date, slug, 'love');
  const loveMoon = f.moonHouse === 7 ? ' सातवें भाव में चंद्रमा होने से आज जीवनसाथी के मन का ध्यान रखना ख़ास ज़रूरी है।'
    : f.moonHouse === 5 ? ' पाँचवें भाव का चंद्रमा प्रेम, मनोरंजन और बच्चों के साथ समय के लिए अच्छा है।'
    : [4, 8, 12].includes(f.moonHouse) ? ' भावनाएँ तेज़ हों तो एक-दूसरे को थोड़ा समय और जगह दें।' : '';
  const loveEnT = loveEn(f, date, RASHI_SLUGS[rashi]).tone;

  const careerFocus: Record<number, string> = {
    10: 'दसवें भाव में चंद्रमा से करियर पर ध्यान रहेगा — अपना काम सामने रखने का अच्छा दिन।',
    11: 'ग्यारहवें भाव का चंद्रमा आय, फ़ॉलो-अप और संपर्कों से मदद के लिए अच्छा है।',
    6: 'छठे भाव का चंद्रमा रुके काम निपटाने और प्रतिस्पर्धा को शांति से सँभालने में मदद करता है।',
    2: 'दूसरे भाव में चंद्रमा से धन और बचत पर ध्यान रहेगा — ख़र्च सोच-समझकर करें।',
    3: 'तीसरे भाव का चंद्रमा पहल का फल देता है — प्रस्ताव भेजें या ज़रूरी फ़ोन कर लें।',
    12: 'बारहवें भाव का चंद्रमा ख़र्च बढ़ा सकता है — बिल जाँचें और बिना सोचे ख़रीदारी से बचें।',
    8: 'आठवें भाव का चंद्रमा बड़े काम शुरू करने से ज़्यादा शांत, पर्दे के पीछे के काम के लिए ठीक है।',
  };
  const c1 = careerFocus[f.moonHouse] ?? pick(['आज काम सामान्य गति से चलेगा — जो हाथ में है, उसे पूरा करें।', 'कार्यक्षेत्र में सामान्य दिन; बड़े क़दमों से ज़्यादा नियमित मेहनत काम आएगी।'], date, slug, 'career1');
  const m = f.mercury;
  const c2 = m.tone === 'good' ? `${ORD_HI[m.house]} भाव का बुध काग़ज़ी काम, बातचीत और व्यापार में मदद करता है।` : `${ORD_HI[m.house]} भाव का बुध कहता है कि हिसाब, संदेश और दस्तावेज़ भेजने से पहले दोबारा जाँच लें।`;
  const c3 = f.jupiter.tone === 'good' ? `${ORD_HI[f.jupiter.house]} भाव का गुरु लंबे समय के धन-मामलों में सहारा देता है।` : '';
  const careerT = careerEn(f, date, RASHI_SLUGS[rashi]).tone;

  const h1 = f.moonTone === 'good'
    ? pick(['ऊर्जा स्थिर है — व्यायाम, समय पर भोजन और अच्छी नींद बनाए रखें।', 'सेहत की अच्छी आदतें जारी रखने का अच्छा दिन।'], date, slug, 'h1')
    : f.moonTone === 'care'
      ? pick(['ऊर्जा कुछ कम रह सकती है — आराम करें, पानी पीते रहें और दिन में बहुत ज़्यादा काम न भरें।', 'आज अपने साथ नरमी रखें: जल्दी सोएँ, हल्का भोजन लें, ज़िम्मेदारियाँ कम रखें।'], date, slug, 'h1')
      : pick(['दिनचर्या संतुलित रखें और बीच-बीच में थोड़ा आराम करें।', 'अपनी गति सँभालकर चलें — अति से ज़्यादा नियमितता काम आएगी।'], date, slug, 'h1');
  const ma = f.mars;
  const h2 = ma.tone === 'good' ? `${ORD_HI[ma.house]} भाव का मंगल जोश देता है — इसे व्यायाम या शारीरिक काम में लगाएँ।`
    : ma.tone === 'care' ? `${ORD_HI[ma.house]} भाव का मंगल जल्दबाज़ी करा सकता है — धीरे चलें और सड़क पर ख़ास सावधानी रखें।`
    : `${ORD_HI[ma.house]} भाव का मंगल मिली-जुली ऊर्जा देता है — उसे सही दिशा दें, जल्दबाज़ी न करें।`;
  const healthT = healthEn(f, date, RASHI_SLUGS[rashi]).tone;

  const luckyItems = [
    { label: 'शुभ रंग (पारंपरिक)', value: meta.luckyColorHindi },
    { label: 'शुभ अंक (पारंपरिक)', value: meta.luckyNumbers.join(', ') },
    ...(best ? [{ label: `आज का शुभ समय (${DEFAULT_CITY.nameHi})`, value: `${best.start} – ${best.end}`, note: `${CHOGH_HI[best.name] ?? best.name} चौघड़िया। समय स्थानीय सूर्योदय पर निर्भर है, इसलिए दूसरे शहरों में थोड़ा बदलता है।` }] : []),
    { label: `राहु काल (${DEFAULT_CITY.nameHi})`, value: `${sky.rahuKaal.start} – ${sky.rahuKaal.end}`, note: 'परंपरा से इस समय नया काम शुरू नहीं किया जाता।' },
  ];

  const sections: DailySection[] = [
    { id: 'overview', heading: 'आज का दिन', text: overviewText, tone: f.moonTone },
    { id: 'love', heading: 'प्रेम व संबंध', text: loveBase + loveMoon, tone: loveEnT },
    { id: 'career', heading: 'करियर व धन', text: [c1, c2, c3].filter(Boolean).join(' '), tone: careerT },
    { id: 'health', heading: 'स्वास्थ्य व ऊर्जा', text: `${h1} ${h2} यह सामान्य मार्गदर्शन है, चिकित्सा सलाह नहीं।`, tone: healthT },
    { id: 'lucky', heading: 'शुभ रंग, अंक और समय', items: luckyItems },
  ];

  const taraLine = f.taras.map(t => `${NAK_HI[t.nak]} में जन्मे: ${TARA_HI[t.tara]} तारा (${TARA_TONE_HI[t.tone]})`).join('; ');
  const why: DailyWhy[] = [
    {
      label: `चंद्र बल — चंद्रमा ${ORD_HI[f.moonHouse]} भाव में`,
      text: `आज यह ${TONE_WORD_HI[f.moonTone]} है। चंद्र बल का अर्थ है चंद्रमा का आपको मिलने वाला साथ — यह इस बात से देखा जाता है कि चंद्रमा आपकी राशि से किस भाव में है; पहला, तीसरा, छठा, सातवाँ, दसवाँ और ग्यारहवाँ भाव शुभ माने जाते हैं।`,
    },
    {
      label: `तारा बल — चंद्रमा ${NAK_HI[sky.moonNak]} नक्षत्र में`,
      text: `${taraLine}। तारा बल आपके जन्म नक्षत्र से आज के नक्षत्र तक नौ-नौ के क्रम में गिना जाता है; आपका जन्म नक्षत्र आपकी कुंडली में दिखता है।`,
    },
    { label: slow.label, text: slow.text },
  ];

  const faq: DailyFaq[] = [
    { q: `आज ${dHi} का ${meta.hindi} राशिफल क्या है?`, a: answer },
    {
      q: `आज ${meta.hindi} राशि के लिए शुभ समय कौन-सा है?`,
      a: (best ? `${DEFAULT_CITY.nameHi} में आज का सबसे अच्छा समय ${CHOGH_HI[best.name] ?? best.name} चौघड़िया, ${best.start} से ${best.end} तक है। ` : '') +
        `राहु काल ${sky.rahuKaal.start} से ${sky.rahuKaal.end} तक है — परंपरा से इसमें नया काम शुरू नहीं किया जाता। दूसरे शहरों में समय स्थानीय सूर्योदय के अनुसार थोड़ा बदलता है। ${meta.hindi} राशि का पारंपरिक शुभ रंग ${meta.luckyColorHindi} और शुभ अंक ${meta.luckyNumbers.join(' व ')} हैं।`,
    },
    {
      q: 'राशिफल चंद्र राशि से देखा जाता है या सूर्य राशि से?',
      a: 'वैदिक राशिफल चंद्र राशि से देखा जाता है, सूर्य राशि से नहीं (सूर्य राशि पश्चिमी ज्योतिष में इस्तेमाल होती है)। अपनी चंद्र राशि नहीं पता तो BornClock की मुफ़्त कुंडली में देख लें।',
    },
    {
      q: 'यह दैनिक राशिफल कैसे बनता है?',
      a: 'इस भारतीय तारीख़ के लिए ग्रहों की वास्तविक सिडरियल (लाहिड़ी) स्थिति से, BornClock के अपने इंजन द्वारा: आपकी राशि से चंद्रमा का भाव (चंद्र बल), चंद्रमा का नक्षत्र (तारा बल), शनि, गुरु और राहु का भाव, और प्रेम, काम व ऊर्जा के लिए शुक्र, बुध और मंगल। एक ही तारीख़ पर हमेशा एक ही फल आता है। यह मार्गदर्शन है, निश्चित भविष्यवाणी नहीं।',
    },
  ];

  return {
    date,
    lang: 'hi',
    title: `${meta.hindi} राशिफल आज, ${dHi} — आज का राशिफल (${meta.english}) | BornClock`,
    description: `${meta.hindi} राशिफल ${dHi}: आज ${headline}। चंद्रमा ${ORD_HI[f.moonHouse]} भाव में, ${NAK_HI[sky.moonNak]} नक्षत्र — प्रेम, करियर, स्वास्थ्य और शुभ समय, ग्रहों की वास्तविक स्थिति से।`,
    h1: `${meta.hindi} राशिफल आज — ${dHi}`,
    dateLabel: formatLongDateHi(date),
    answer,
    why,
    sections,
    faq,
  };
}

/** Exposed for tests: the raw factors behind a day's reading. */
export function rashifalFactors(date: string, rashi: number) {
  const sky = vedicSky(date);
  return { sky, ...factors(sky, rashi) };
}

export function computeRashifalDaily(date: string, slug: string): DailyEntry {
  const i = (RASHI_SLUGS as readonly string[]).indexOf(slug);
  if (i < 0) throw new Error(`unknown rashi slug ${slug}`);
  return composeRashifalEn(date, i);
}

export function computeRashifalDailyHi(date: string, slug: string): DailyEntry {
  const i = (RASHI_SLUGS_HI as readonly string[]).indexOf(slug);
  if (i < 0) throw new Error(`unknown Hindi rashi slug ${slug}`);
  return composeRashifalHi(date, i);
}

/**
 * Batch 7 "data + render": the day's sky (data kind 'vedic-sky', one file for all 12
 * rashis and both languages) → the finished reading. Pure: no engine call when `sky`
 * comes from the precomputed JSON (the Worker and the browser both use this).
 */
export const reviveVedicSky = (data: unknown): VedicSky => {
  const d = data as VedicSky & { ref: string | Date };
  return { ...d, ref: new Date(d.ref) };
};
export function rashifalFromSky(date: string, slug: string, data: unknown): DailyEntry {
  const i = (RASHI_SLUGS as readonly string[]).indexOf(slug);
  if (i < 0) throw new Error(`unknown rashi slug ${slug}`);
  return composeRashifalEn(date, i, reviveVedicSky(data));
}
export function rashifalHiFromSky(date: string, slug: string, data: unknown): DailyEntry {
  const i = (RASHI_SLUGS_HI as readonly string[]).indexOf(slug);
  if (i < 0) throw new Error(`unknown Hindi rashi slug ${slug}`);
  return composeRashifalHi(date, i, reviveVedicSky(data));
}
