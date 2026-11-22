/**
 * B18 — plain-language yearly outlook from a computed Varshphal (src/lib/vedic/varshphal.ts).
 *
 * Every sentence is driven by a computed factor (Varshesh and its strength/house, Muntha
 * house, house lords, Sahams, Tajik Ithasala/Ishrafa, Mudda dasha periods). Impact first →
 * reason → what to do. House themes follow the standard Bhava significations (BPHS); the
 * Muntha-house grouping (9/10/11 best, 1/2/3/5 good, 4/6/7/8/12 needs care) is the classical
 * Tajik rule (AIFAS "Varshaphal"). The 0–20 strength bands (≥ 12 strong, 8–12 moderate,
 * < 8 weak) are BornClock's reading scale for Pancha-vargiya bala, not a classical cut-off.
 *
 * Content rules (site-wide): no death/disease/certainty wording; marriage only as windows;
 * health = practical caution; remedies free first, no fear, nothing sold.
 */
import type { VarshphalResult, Planet7 } from './varshphal';
import { SIGN_LORDS } from './varshphal';
import { type Lang, type Tone, pName, sName, ord, HOUSE_THEME, toneLabel, T } from './varshphalLabels';
export { pName, sName, ord, HOUSE_THEME, toneLabel };

export type { Lang, Tone } from './varshphalLabels';
export interface OutlookBlock { key: 'overall' | 'career' | 'money' | 'relationships' | 'health'; title: string; tone: Tone; impact: string; reason: string; todo: string }
export interface MonthBlock { lord: string; start: string; end: string; house: number; tone: Tone; impact: string; reason: string; todo: string }
export interface Window { lord: string; start: string; end: string; goodFor: string }
export interface RemedyPick { planet: string; why: string }
export interface Outlook { headline: string; blocks: OutlookBlock[]; months: MonthBlock[]; bestWindows: Window[]; relationshipWindows: Window[]; remedies: RemedyPick[] }

const MALEFIC = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);
type Strength = 'strong' | 'moderate' | 'weak';
function strengthOf(r: VarshphalResult, p: string): Strength {
  const v = (r.panchaVargiya as Record<string, { vimshopaka: number }>)[p]?.vimshopaka;
  if (v === undefined) return 'moderate'; // Rahu/Ketu: no Pancha-vargiya bala
  return v >= 12 ? 'strong' : v >= 8 ? 'moderate' : 'weak';
}
const houseOf = (r: VarshphalResult, p: string) => r.planets.find(x => x.name === p)!.house;
const lordOfHouse = (r: VarshphalResult, h: number) => SIGN_LORDS[(r.lagna.sign + h - 1) % 12] as Planet7;

/** Tone of a planet's period/placement from its house and strength. */
export function placementTone(p: string, house: number, s: Strength): Tone {
  const mal = MALEFIC.has(p);
  if ([6, 8, 12].includes(house)) return mal && house === 6 ? 'supportive' : (s === 'strong' && house !== 8 ? 'mixed' : 'careful');
  if (house === 3 || house === 11) return mal || s !== 'weak' ? 'supportive' : 'mixed';
  if (s === 'weak') return 'mixed';
  if (s === 'moderate' && mal) return 'mixed';
  return 'supportive';
}
const munthaGroup = (h: number): 'best' | 'good' | 'care' => ([9, 10, 11].includes(h) ? 'best' : [1, 2, 3, 5].includes(h) ? 'good' : 'care');

function ithasalaBetween(r: VarshphalResult, a: string, b: string): 'ithasala' | 'ishrafa' | null {
  if (a === b) return null;
  const y = r.yogas.find(x => (x.kind === 'ithasala' || x.kind === 'ishrafa') && x.planets.includes(a as Planet7) && x.planets.includes(b as Planet7));
  return y ? (y.kind as 'ithasala' | 'ishrafa') : null;
}



export function buildOutlook(r: VarshphalResult, lang: Lang): Outlook {
  const hi = lang === 'hi';
  const P = (p: string) => pName(p, lang);
  const st = (p: string) => T[lang].strength[strengthOf(r, p)];
  const theme = (h: number) => HOUSE_THEME[lang][h];
  const vy = r.varshesh.planet;
  const vyH = houseOf(r, vy), vyS = strengthOf(r, vy);
  const ll = r.lagna.lord, llS = strengthOf(r, ll), llH = houseOf(r, ll);
  const mg = munthaGroup(r.muntha.house);

  // ── Overall ──
  let score = 0;
  score += vyS === 'strong' ? 1 : vyS === 'weak' ? -1 : 0;
  score += [6, 8, 12].includes(vyH) ? -1 : [1, 4, 5, 7, 9, 10, 11].includes(vyH) ? 1 : 0;
  score += mg === 'best' ? 1 : mg === 'care' ? -1 : 0;
  score += llS === 'strong' ? 1 : llS === 'weak' ? -1 : 0;
  const overallTone: Tone = score >= 2 ? 'supportive' : score >= 0 ? 'mixed' : 'careful';
  const blocks: OutlookBlock[] = [];
  blocks.push({
    key: 'overall', title: hi ? 'पूरा वर्ष' : 'The year overall', tone: overallTone,
    impact: hi
      ? (overallTone === 'supportive' ? 'यह वर्ष आपके प्रयासों का साथ देता है — योजनाएँ आगे बढ़ाने के लिए अच्छा समय।' : overallTone === 'mixed' ? 'मिला-जुला वर्ष — जो काम धैर्य और नियमितता से करेंगे, वही सबसे अच्छा फल देंगे।' : 'धीरे-धीरे और सोच-समझकर बनाने का वर्ष — बड़े जोखिम से पहले तैयारी मज़बूत करें।')
      : (overallTone === 'supportive' ? 'This year backs your efforts — a good time to move plans forward.' : overallTone === 'mixed' ? 'A mixed year: what you do patiently and regularly gives the best results.' : 'A year to build slowly and carefully — make sure the groundwork is solid before taking big risks.'),
    reason: hi
      ? `वर्षेश (वर्ष का स्वामी) ${P(vy)} है — ${st(vy)}, ${ord(vyH, lang)} भाव (${theme(vyH)}) में। मुंथा ${ord(r.muntha.house, lang)} भाव में है (${mg === 'best' ? 'शास्त्रीय रूप से सबसे शुभ भावों में' : mg === 'good' ? 'शुभ भावों में' : 'ऐसे भाव में जहाँ अधिक ध्यान चाहिए'})। वर्ष लग्न ${sName(r.lagna.sign, lang)} है, इसका स्वामी ${P(ll)} ${st(ll)} है।`
      : `The lord of the year (Varshesh) is ${P(vy)} — ${st(vy)}, in your ${ord(vyH, lang)} house (${theme(vyH)}). Muntha falls in the ${ord(r.muntha.house, lang)} house (${mg === 'best' ? 'classically one of the best houses' : mg === 'good' ? 'a classically good house' : 'a house that asks for extra care'}). The year’s ascendant is ${sName(r.lagna.sign, lang)}, and its lord ${P(ll)} is ${st(ll)}.`,
    todo: hi
      ? `${theme(vyH)} — इस वर्ष यही क्षेत्र सबसे अधिक ध्यान माँगता है। ${theme(r.muntha.house)} से जुड़े काम सोच-समझकर आगे बढ़ाएँ।`
      : `Put your energy where the year points: ${theme(vyH)}. Give steady attention to ${theme(r.muntha.house)} (the Muntha house).`,
  });

  // ── Career (10th) ──
  const l10 = lordOfHouse(r, 10), l10S = strengthOf(r, l10), l10H = houseOf(r, l10);
  const in10 = r.planets.filter(p => p.house === 10).map(p => p.name);
  const ks = r.sahams.find(s => s.key === 'karyasiddhi')!;
  const ith10 = ithasalaBetween(r, ll, l10);
  const c = (l10S === 'strong' ? 1 : l10S === 'weak' ? -1 : 0) + ([6, 8, 12].includes(l10H) ? -1 : 1) + ([10, 11].includes(r.muntha.house) ? 1 : 0)
    + ([6, 8, 12].includes(ks.house) ? -1 : 0) + (ith10 === 'ithasala' ? 1 : 0);
  const careerTone: Tone = c >= 2 ? 'supportive' : c >= 0 ? 'mixed' : 'careful';
  blocks.push({
    key: 'career', title: hi ? 'करियर और काम' : 'Career and work', tone: careerTone,
    impact: hi
      ? (careerTone === 'supportive' ? 'काम में प्रगति, पहचान या नई ज़िम्मेदारी के अच्छे अवसर।' : careerTone === 'mixed' ? 'काम में प्रगति संभव है, पर यह लगातार मेहनत और धैर्य से आएगी।' : 'काम में दबाव या धीमापन संभव — बदलाव से पहले योजना और बैकअप तैयार रखें।')
      : (careerTone === 'supportive' ? 'Good openings for progress, recognition or a new responsibility at work.' : careerTone === 'mixed' ? 'Progress at work is possible, but it comes through consistent effort rather than quick jumps.' : 'Work may feel slow or pressured — plan carefully and keep a fallback before any switch.'),
    reason: hi
      ? `दशम (करियर) भाव का स्वामी ${P(l10)} ${st(l10)} है और ${ord(l10H, lang)} भाव में है।${in10.length ? ` दशम भाव में ${in10.map(P).join(', ')} हैं।` : ''} कार्य-सिद्धि सहम ${ord(ks.house, lang)} भाव में है।${ith10 === 'ithasala' ? ` लग्नेश ${P(ll)} और दशमेश ${P(l10)} में इत्थशाल योग है — काम पूरे होने का संकेत।` : ith10 === 'ishrafa' ? ` लग्नेश और दशमेश में ईशराफ योग है — कोई अवसर पीछे छूट चुका हो सकता है, दोबारा प्रयास करें।` : ''}`
      : `Your 10th-house (career) lord ${P(l10)} is ${st(l10)} and sits in the ${ord(l10H, lang)} house.${in10.length ? ` ${in10.map(P).join(', ')} ${in10.length > 1 ? 'are' : 'is'} in the 10th house.` : ''} The Karya-siddhi Saham (success in work) falls in the ${ord(ks.house, lang)} house.${ith10 === 'ithasala' ? ` The year’s Lagna lord ${P(ll)} and the 10th lord ${P(l10)} form an Ithasala — work matters tend to reach completion.` : ith10 === 'ishrafa' ? ` The Lagna lord and the 10th lord form an Ishrafa — an opening may have passed; restart it deliberately.` : ''}`,
    todo: hi
      ? (careerTone === 'careful' ? 'नौकरी बदलने से पहले नया प्रस्ताव लिखित में ले लें; कौशल बढ़ाने पर ध्यान दें।' : 'अपने काम का रिकॉर्ड रखें और नीचे दी गई अनुकूल अवधियों में बड़ी बातचीत या आवेदन करें।')
      : (careerTone === 'careful' ? 'Confirm any new offer in writing before leaving a role; invest in skills this year.' : 'Keep a record of your results and time big conversations or applications for the supportive windows below.'),
  });

  // ── Money (2nd/11th) ──
  const l2 = lordOfHouse(r, 2), l11 = lordOfHouse(r, 11);
  const punya = r.sahams.find(s => s.key === 'punya')!;
  const ith11 = ithasalaBetween(r, ll, l11) ?? ithasalaBetween(r, ll, l2);
  const m = (strengthOf(r, l11) === 'strong' ? 1 : strengthOf(r, l11) === 'weak' ? -1 : 0) + (strengthOf(r, l2) === 'weak' ? -1 : 0)
    + ([6, 8, 12].includes(houseOf(r, l11)) ? -1 : 1) + (strengthOf(r, 'Jupiter') === 'strong' ? 1 : 0) + (ith11 === 'ithasala' ? 1 : 0)
    + ([6, 8, 12].includes(punya.house) ? -1 : 0);
  const moneyTone: Tone = m >= 2 ? 'supportive' : m >= 0 ? 'mixed' : 'careful';
  blocks.push({
    key: 'money', title: hi ? 'धन' : 'Money', tone: moneyTone,
    impact: hi
      ? (moneyTone === 'supportive' ? 'आय बढ़ाने और बचत जोड़ने के अच्छे अवसर।' : moneyTone === 'mixed' ? 'आय स्थिर रह सकती है; बचत अनुशासन से बढ़ेगी।' : 'खर्च आय से आगे निकल सकते हैं — बजट और आपात-निधि को प्राथमिकता दें।')
      : (moneyTone === 'supportive' ? 'Good chances to raise income and add to savings.' : moneyTone === 'mixed' ? 'Income may hold steady; savings grow through discipline rather than windfalls.' : 'Spending may run ahead of income — make a budget and an emergency fund the priority.'),
    reason: hi
      ? `लाभ (11वें) भाव का स्वामी ${P(l11)} ${st(l11)} है (${ord(houseOf(r, l11), lang)} भाव में); धन (दूसरे) भाव का स्वामी ${P(l2)} ${st(l2)} है। गुरु ${st('Jupiter')} है। पुण्य सहम ${ord(punya.house, lang)} भाव में है।${ith11 === 'ithasala' ? ' लग्नेश का धन/लाभ भाव के स्वामी से इत्थशाल है — धन से जुड़े काम पूरे होने का संकेत।' : ''}`
      : `Your 11th-house (gains) lord ${P(l11)} is ${st(l11)} (in the ${ord(houseOf(r, l11), lang)} house); the 2nd-house (savings) lord ${P(l2)} is ${st(l2)}. Jupiter is ${st('Jupiter')}. The Punya Saham (merit and good fortune) falls in the ${ord(punya.house, lang)} house.${ith11 === 'ithasala' ? ' The Lagna lord makes an Ithasala with a wealth-house lord — money matters tend to come through.' : ''}`,
    todo: hi
      ? 'बड़े निवेश या उधार से पहले दो बार जाँचें; अनुकूल अवधियों में ही बड़े वित्तीय निर्णय लें।'
      : 'Double-check big investments or loans, and make major money decisions in the supportive windows.',
  });

  // ── Relationships (7th) ──
  const l7 = lordOfHouse(r, 7);
  const viv = r.sahams.find(s => s.key === 'vivaha')!;
  const ith7 = ithasalaBetween(r, ll, l7);
  const rl = (strengthOf(r, l7) === 'strong' ? 1 : strengthOf(r, l7) === 'weak' ? -1 : 0) + (strengthOf(r, 'Venus') === 'strong' ? 1 : strengthOf(r, 'Venus') === 'weak' ? -1 : 0)
    + ([6, 8, 12].includes(viv.house) ? -1 : 0) + (ith7 === 'ithasala' ? 1 : 0) + ([6, 8, 12].includes(houseOf(r, l7)) ? -1 : 0);
  const relTone: Tone = rl >= 1 ? 'supportive' : rl >= -1 ? 'mixed' : 'careful';
  blocks.push({
    key: 'relationships', title: hi ? 'रिश्ते' : 'Relationships', tone: relTone,
    impact: hi
      ? (relTone === 'supportive' ? 'रिश्तों में गर्माहट और आपसी समझ बढ़ाने के अच्छे अवसर; अविवाहित हों तो रिश्ते की बातचीत के लिए अनुकूल अवधियाँ नीचे हैं।' : relTone === 'mixed' ? 'रिश्ते स्थिर रह सकते हैं; खुली बातचीत और साथ बिताया समय सबसे ज़्यादा मदद करेगा।' : 'रिश्तों में ग़लतफ़हमी जल्दी हो सकती है — धैर्य रखें और बड़े फ़ैसले जल्दबाज़ी में न लें।')
      : (relTone === 'supportive' ? 'Good chances to deepen warmth and understanding; if you are single, the windows below suit relationship steps.' : relTone === 'mixed' ? 'Relationships can stay steady; open conversation and time together help most.' : 'Misunderstandings may come up more easily — be patient and avoid rushing big decisions.'),
    reason: hi
      ? `सप्तम (साझेदारी) भाव का स्वामी ${P(l7)} ${st(l7)} है (${ord(houseOf(r, l7), lang)} भाव में); शुक्र ${st('Venus')} है। विवाह सहम ${ord(viv.house, lang)} भाव में है (स्वामी ${P(viv.lord)})।${ith7 === 'ithasala' ? ' लग्नेश और सप्तमेश में इत्थशाल है — साझेदारी के विषय आगे बढ़ते हैं।' : ''}`
      : `Your 7th-house (partnership) lord ${P(l7)} is ${st(l7)} (in the ${ord(houseOf(r, l7), lang)} house); Venus is ${st('Venus')}. The Vivaha Saham (marriage point) falls in the ${ord(viv.house, lang)} house, ruled by ${P(viv.lord)}.${ith7 === 'ithasala' ? ' The Lagna lord and the 7th lord form an Ithasala — partnership matters tend to move forward.' : ''}`,
    todo: hi
      ? 'कोई भी कुंडली विवाह की तारीख़ नहीं बताती — नीचे दी गई अवधियाँ केवल अहम बातचीत, परिवारों के मिलने या प्रतिबद्धता के लिए अनुकूल समय-खिड़कियाँ हैं।'
      : 'No chart fixes a marriage date — the windows below are simply better times for important conversations, family meetings or commitments.',
  });

  // ── Health (practical caution only) ──
  const malIn = r.planets.filter(p => MALEFIC.has(p.name) && [1, 6, 8].includes(p.house)).map(p => p.name);
  const h = (llS === 'strong' ? 1 : llS === 'weak' ? -1 : 0) - (malIn.length > 1 ? 1 : 0) - ([6, 8, 12].includes(r.muntha.house) ? 1 : 0) - ([6, 8, 12].includes(llH) ? 1 : 0);
  const healthTone: Tone = h >= 1 ? 'supportive' : h >= -1 ? 'mixed' : 'careful';
  blocks.push({
    key: 'health', title: hi ? 'सेहत और ऊर्जा' : 'Health and energy', tone: healthTone,
    impact: hi
      ? (healthTone === 'supportive' ? 'ऊर्जा अच्छी रहने की संभावना — अच्छी आदतें शुरू करने का सही समय।' : healthTone === 'mixed' ? 'ऊर्जा ऊपर-नीचे हो सकती है — दिनचर्या और नींद पर ध्यान दें।' : 'इस वर्ष थकान जल्दी हो सकती है — अपनी गति संभालें और नियमित जाँच न टालें।')
      : (healthTone === 'supportive' ? 'Energy is likely to be good — a fine year to start healthy habits.' : healthTone === 'mixed' ? 'Energy may go up and down — protect your routine and sleep.' : 'You may tire more easily this year — pace yourself and don’t skip routine check-ups.'),
    reason: hi
      ? `वर्ष लग्न का स्वामी ${P(ll)} ${st(ll)} है (${ord(llH, lang)} भाव में)।${malIn.length ? ` ${malIn.map(P).join(', ')} पहले/छठे/आठवें भाव में हैं।` : ''}`
      : `The year’s Lagna lord ${P(ll)} is ${st(ll)} (in the ${ord(llH, lang)} house).${malIn.length ? ` ${malIn.map(P).join(', ')} ${malIn.length > 1 ? 'are' : 'is'} in the 1st, 6th or 8th house.` : ''}`,
    todo: hi
      ? 'नियमित नींद, हल्का रोज़ का व्यायाम, यात्रा और वाहन चलाते समय सावधानी, और समय पर स्वास्थ्य जाँच। कोई भी चिंता हो तो डॉक्टर से मिलें — ज्योतिष चिकित्सा सलाह नहीं है।'
      : 'Regular sleep, light daily exercise, extra care while travelling and driving, and routine check-ups on time. For any concern, see a doctor — astrology is not medical advice.',
  });

  // ── Month by month (Mudda dasha) ──
  const months: MonthBlock[] = r.mudda.map(md => {
    const house = houseOf(r, md.lord);
    const s = strengthOf(r, md.lord);
    const tone = placementTone(md.lord, house, s);
    const ruled = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(x => lordOfHouse(r, x) === md.lord);
    return {
      lord: md.lord, start: md.start, end: md.end, house, tone,
      impact: hi
        ? (tone === 'supportive' ? `${theme(house)} — इन विषयों में आगे बढ़ने का अच्छा समय।` : tone === 'mixed' ? `${theme(house)} — प्रगति संभव, पर धैर्य से।` : `${theme(house)} — धीमे चलें, जल्दबाज़ी के फ़ैसले टालें।`)
        : (tone === 'supportive' ? `A good stretch for ${theme(house)}.` : tone === 'mixed' ? `Progress on ${theme(house)} is possible, with patience.` : `Go slowly with ${theme(house)}; avoid hasty decisions.`),
      reason: hi
        ? `मुद्दा दशा ${P(md.lord)} की — यह ग्रह वर्ष कुंडली के ${ord(house, lang)} भाव में ${st(md.lord)} है${ruled.length ? ` और ${ruled.map(x => ord(x, lang)).join(', ')} भाव का स्वामी है` : ''}।`
        : `${P(md.lord)} Mudda period — ${P(md.lord)} is ${st(md.lord)} in the ${ord(house, lang)} house of the annual chart${ruled.length ? ` and rules the ${ruled.map(x => ord(x, lang)).join(' and ')} house${ruled.length > 1 ? 's' : ''}` : ''}.`,
      todo: hi
        ? (tone === 'careful' ? 'नए बड़े काम इस अवधि के बाद रखें; जो चल रहा है उसे संभालें।' : tone === 'mixed' ? 'योजना बनाकर छोटे-छोटे कदम उठाएँ।' : 'ज़रूरी शुरुआत, बातचीत या आवेदन इसी अवधि में करें।')
        : (tone === 'careful' ? 'Keep new big starts for after this period; look after what is already running.' : tone === 'mixed' ? 'Plan, then move in small steps.' : 'Use it for important starts, talks or applications.'),
    };
  });

  const goodFor = (lord: string) => {
    const hs = [houseOf(r, lord), ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(x => lordOfHouse(r, x) === lord)];
    return [...new Set(hs)].slice(0, 2).map(theme).join('; ');
  };
  const rank = (lord: string) => (lord === vy ? 2 : 0) + (strengthOf(r, lord) === 'strong' ? 1 : 0);
  const bestWindows: Window[] = months.filter(mo => mo.tone === 'supportive')
    .sort((a, b) => rank(b.lord) - rank(a.lord) || Date.parse(a.start) - Date.parse(b.start))
    .slice(0, 3).sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .map(mo => ({ lord: mo.lord, start: mo.start, end: mo.end, goodFor: goodFor(mo.lord) }));
  const relLords = new Set<string>(['Venus', l7, viv.lord]);
  const relationshipWindows: Window[] = months.filter(mo => relLords.has(mo.lord) && mo.tone !== 'careful')
    .map(mo => ({ lord: mo.lord, start: mo.start, end: mo.end, goodFor: hi ? 'रिश्तों से जुड़े अहम कदम' : 'relationship steps' }));

  // ── Remedies (free first) for weak key planets ──
  const keys: Array<[string, string]> = [
    [vy, hi ? 'वर्षेश (वर्ष का स्वामी)' : 'lord of the year (Varshesh)'],
    [ll, hi ? 'वर्ष लग्न का स्वामी' : 'lord of the year’s ascendant'],
    [r.muntha.lord, hi ? 'मुंथा का स्वामी' : 'Muntha lord'],
    [l10, hi ? 'करियर भाव का स्वामी' : 'career (10th) lord'],
    [l7, hi ? 'साझेदारी भाव का स्वामी' : 'partnership (7th) lord'],
  ];
  const remedies: RemedyPick[] = [];
  for (const [p, role] of keys) {
    if (strengthOf(r, p) !== 'weak' || remedies.some(x => x.planet === p)) continue;
    remedies.push({ planet: p, why: hi ? `${P(p)} — ${role} — इस वर्ष कमज़ोर है। नीचे के सरल, मुफ़्त उपाय पहले आज़माएँ।` : `${P(p)} — the ${role} — is weak this year. Start with the simple, free practices below.` });
  }

  const headline = hi
    ? `${r.year} का वर्षफल: ${toneLabel(overallTone, lang)} वर्ष — वर्षेश ${P(vy)}, मुंथा ${ord(r.muntha.house, lang)} भाव में`
    : `Your ${r.year} Varshphal: a ${overallTone === 'supportive' ? 'supportive' : overallTone === 'mixed' ? 'mixed, effort-rewarding' : 'build-carefully'} year — lord of the year ${P(vy)}, Muntha in the ${ord(r.muntha.house, lang)} house`;
  return { headline, blocks, months, bestWindows, relationshipWindows, remedies };
}
