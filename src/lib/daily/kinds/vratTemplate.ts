/**
 * Batch 10 — pure templates for the vrat pages (/vrat, /vrat/:slug, /hi/vrat, /hi/vrat/:slug):
 * the "next date" block, built from the compact per-day data (data kind 'vrat-next',
 * computed at build time by src/lib/vedic/vrats/next.ts). Worker-safe: no engine imports.
 * Title, description and H1 stay the static ones (src/lib/vedic/vrats/meta.ts) so the
 * prerendered and live titles are identical; only the answer and the timings change.
 */
import type { DailyEntry, DailyItem, DailySection } from '../types';
import { formatLongDateEn, formatLongDateHi, formatDateEn, formatDateHi, weekdayOf } from '../dates';
import { VRAT_INDEX_SLUG, VRAT_NAMES, VRAT_SLUGS, vratMeta, type VratSlug } from '../../vedic/vrats/meta';
import type { VratNextData, VratOcc } from '../../vedic/vrats/next';

type Lang = 'en' | 'hi';

const MONTHS = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
const MONTH_HI: Record<string, string> = {
  Chaitra: 'चैत्र', Vaishakha: 'वैशाख', Jyeshtha: 'ज्येष्ठ', Ashadha: 'आषाढ़', Shravana: 'श्रावण', Bhadrapada: 'भाद्रपद',
  Ashwina: 'आश्विन', Kartika: 'कार्तिक', Margashirsha: 'मार्गशीर्ष', Pausha: 'पौष', Magha: 'माघ', Phalguna: 'फाल्गुन',
};
const monthHi = (m: string) => (m.startsWith('Adhik') ? `अधिक ${MONTH_HI[m.replace(/^Adhik\s*/, '')] ?? ''}`.trim() : MONTH_HI[m] ?? m);
const PAKSHA_HI = { Shukla: 'शुक्ल', Krishna: 'कृष्ण' } as const;

/** Ekadashi names in Hindi (names as in src/lib/vedic/festivals.ts EKADASHI_NAMES). */
export const EKADASHI_HI: Record<string, string> = {
  Kamada: 'कामदा', Varuthini: 'वरूथिनी', Mohini: 'मोहिनी', Apara: 'अपरा', Nirjala: 'निर्जला', Yogini: 'योगिनी',
  Devshayani: 'देवशयनी', Kamika: 'कामिका', 'Shravana Putrada': 'श्रावण पुत्रदा', Aja: 'अजा', Parsva: 'पार्श्व (परिवर्तिनी)',
  Indira: 'इंदिरा', Papankusha: 'पापांकुशा', Rama: 'रमा', Devutthana: 'देवउठनी (प्रबोधिनी)', Utpanna: 'उत्पन्ना',
  Mokshada: 'मोक्षदा', Saphala: 'सफला', 'Pausha Putrada': 'पौष पुत्रदा', Shattila: 'षटतिला', Jaya: 'जया', Vijaya: 'विजया',
  Amalaki: 'आमलकी', Papamochani: 'पापमोचनी', Padmini: 'पद्मिनी', Parama: 'परमा',
};

/**
 * Ganesha's form for each month's Sankashti, by AMANTA month — the table in Wikipedia's
 * "Sankashti Chaturthi" article (en.wikipedia.org/wiki/Sankashti_Chaturthi), whose
 * Phalguna = Bhalachandra matches Drik Panchang's amanta Phalguna "Bhalachandra Sankashti".
 */
const SANKASHTI_FORM: Record<string, { en: string; hi: string }> = {
  Chaitra: { en: 'Vikata', hi: 'विकट' }, Vaishakha: { en: 'Chakraraja Ekadanta', hi: 'चक्रराज एकदंत' },
  Jyeshtha: { en: 'Krishna Pingala', hi: 'कृष्ण पिंगल' }, Ashadha: { en: 'Gajanana', hi: 'गजानन' },
  Shravana: { en: 'Heramba', hi: 'हेरंब' }, Bhadrapada: { en: 'Vighnaraja', hi: 'विघ्नराज' },
  Ashwina: { en: 'Vakratunda', hi: 'वक्रतुंड' }, Kartika: { en: 'Ganadhipa', hi: 'गणाधिप' },
  Margashirsha: { en: 'Akhuratha', hi: 'आखुरथ' }, Pausha: { en: 'Lambodara', hi: 'लंबोदर' },
  Magha: { en: 'Dwijapriya', hi: 'द्विजप्रिय' }, Phalguna: { en: 'Bhalachandra', hi: 'भालचंद्र' },
};
/** Purnimanta Krishna month → amanta (one month earlier). */
const amantaOfKrishna = (purn: string) => { const i = MONTHS.indexOf(purn); return i < 0 ? purn : MONTHS[(i + 11) % 12]; };

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
const clock = (stamp?: string) => (stamp ? stamp.slice(11, 16) : '');
/** "HH:MM" plus the date when it is not the occurrence day. */
function at(stamp: string | undefined, day: string, lang: Lang): string {
  if (!stamp) return '';
  const d = stamp.slice(0, 10);
  if (d === day) return clock(stamp);
  return lang === 'hi' ? `${clock(stamp)} (${formatDateHi(d)})` : `${clock(stamp)} (${formatDateEn(d)})`;
}
const span = (a: string | undefined, b: string | undefined, day: string, lang: Lang) =>
  a && b ? `${at(a, day, lang)} – ${at(b, day, lang)}` : '';

/** The occurrence's own name, e.g. "Rama Ekadashi", "Kartika Purnima", "Sharad Navratri". */
export function occName(slug: VratSlug, o: VratOcc, lang: Lang): string {
  const n = VRAT_NAMES[slug];
  if (slug === 'ekadashi' && o.ek) return lang === 'hi' ? `${EKADASHI_HI[o.ek] ?? o.ek} एकादशी` : `${o.ek} Ekadashi`;
  if (slug === 'satyanarayan-katha' && o.mo) return lang === 'hi' ? `${monthHi(o.mo)} पूर्णिमा` : `${o.mo} Purnima`;
  if (slug === 'pradosh-vrat') {
    const w = weekdayOf(o.d);
    const special = w === 1 ? ['Soma Pradosh', 'सोम प्रदोष'] : w === 2 ? ['Bhauma Pradosh', 'भौम प्रदोष'] : w === 6 ? ['Shani Pradosh', 'शनि प्रदोष'] : null;
    const pk = o.pk ? (lang === 'hi' ? `${PAKSHA_HI[o.pk]} पक्ष` : `${o.pk} paksha`) : '';
    if (special) return lang === 'hi' ? `${special[1]} (${pk})` : `${special[0]} (${pk})`;
    return lang === 'hi' ? `प्रदोष व्रत (${pk})` : `Pradosh Vrat (${pk})`;
  }
  if (slug === 'sankashti-chaturthi' && o.mo) {
    const f = SANKASHTI_FORM[amantaOfKrishna(o.mo)];
    const ang = weekdayOf(o.d) === 2;
    if (lang === 'hi') return `${ang ? 'अंगारकी ' : ''}संकष्टी चतुर्थी${f ? ` (${f.hi})` : ''}`;
    return `${ang ? 'Angaraki ' : ''}Sankashti Chaturthi${f ? ` (${f.en} Ganapati)` : ''}`;
  }
  if (slug === 'navratri' && o.nv) return lang === 'hi' ? (o.nv === 'Chaitra' ? 'चैत्र नवरात्रि' : 'शारदीय नवरात्रि') : `${o.nv} Navratri`;
  return n[lang === 'hi' ? 'hi' : 'en'].replace(/ \(.*\)$/, '');
}

function when(day: string, date: string, lang: Lang): string {
  const n = dayDiff(date, day);
  if (lang === 'hi') return n === 0 ? 'आज' : n === 1 ? 'कल' : `${n} दिन बाद`;
  return n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`;
}
const long = (d: string, lang: Lang) => (lang === 'hi' ? formatLongDateHi(d) : formatLongDateEn(d));

/** Timing items for the next occurrence (all New Delhi, from our Panchang engine). */
function timingItems(slug: VratSlug, o: VratOcc, lang: Lang): DailyItem[] {
  const t = o.t ?? {};
  const d = o.d;
  const hi = lang === 'hi';
  const it = (en: string, hiL: string, value: string, noteEn?: string, noteHi?: string): DailyItem | null =>
    value ? { label: hi ? hiL : en, value, ...(noteEn ? { note: hi ? noteHi : noteEn } : {}) } : null;
  const rows: Array<DailyItem | null> = [it('Date', 'तिथि (दिनांक)', long(d, lang))];
  switch (slug) {
    case 'ekadashi':
      rows.push(
        it('Sunrise (fast begins)', 'सूर्योदय (व्रत आरंभ)', at(t.rise, d, lang)),
        it('Ekadashi tithi', 'एकादशी तिथि', span(t.ts, t.te, d, lang)),
        it('Parana (breaking the fast) — after sunrise', 'पारण (व्रत खोलना) — सूर्योदय के बाद', at(t.pr, d, lang), 'Break the fast after this sunrise and before Dwadashi ends; avoid the first quarter of Dwadashi (Hari Vasara).', 'इस सूर्योदय के बाद और द्वादशी समाप्त होने से पहले पारण करें; द्वादशी का पहला चौथाई भाग (हरि वासर) छोड़ दें।'),
        it('Dwadashi ends', 'द्वादशी समाप्त', at(t.dw, d, lang)),
      );
      break;
    case 'satyanarayan-katha':
      rows.push(
        it('Purnima tithi', 'पूर्णिमा तिथि', span(t.ts, t.te, d, lang)),
        it('Sunset (evening puja)', 'सूर्यास्त (संध्या पूजा)', at(t.set, d, lang), 'The puja can be done morning or evening; the evening is often preferred so the fast can be broken with the prasad.', 'पूजा सुबह या शाम कभी भी हो सकती है; शाम को अधिक उपयुक्त माना जाता है ताकि प्रसाद से व्रत खोला जा सके।'),
      );
      break;
    case 'pradosh-vrat':
      rows.push(
        it('Trayodashi tithi', 'त्रयोदशी तिथि', span(t.ts, t.te, d, lang)),
        it('Pradosh puja time', 'प्रदोष पूजा का समय', span(t.ws, t.we, d, lang), 'From sunset, for the first fifth of the night, while Trayodashi lasts.', 'सूर्यास्त से रात के पहले पाँचवें भाग तक, जब तक त्रयोदशी रहे।'),
      );
      break;
    case 'sankashti-chaturthi':
    case 'karwa-chauth':
      rows.push(
        it('Sunrise (fast begins)', 'सूर्योदय (व्रत आरंभ)', at(t.rise, d, lang)),
        it('Moonrise', 'चंद्रोदय', at(t.moon, d, lang), 'The fast is broken after seeing the Moon. Clouds or a different city can shift this by some minutes — go by your own sighting.', 'चंद्र दर्शन के बाद व्रत खोला जाता है। बादल या दूसरा शहर होने पर समय कुछ मिनट बदल सकता है — अपने यहाँ के चंद्र दर्शन को मानें।'),
        it('Chaturthi tithi', 'चतुर्थी तिथि', span(t.ts, t.te, d, lang)),
      );
      break;
    case 'navratri':
      rows.push(
        it('Pratipada tithi', 'प्रतिपदा तिथि', span(t.ts, t.te, d, lang)),
        it('Ghatasthapana — first third of the day', 'घटस्थापना — दिन का पहला तिहाई भाग', span(t.ws, t.we, d, lang), 'The rule as Drik Panchang states it: the first third of daytime while Pratipada lasts (otherwise Abhijit muhurta), never at night. Many Panchangs give a shorter muhurta inside this window.', 'द्रिक पंचांग के अनुसार नियम: प्रतिपदा रहते दिन का पहला तिहाई भाग (न मिले तो अभिजित मुहूर्त), रात में कभी नहीं। कई पंचांग इसी के भीतर छोटा मुहूर्त देते हैं।'),
      );
      break;
    case 'mahashivratri':
      rows.push(
        it('Chaturdashi tithi', 'चतुर्दशी तिथि', span(t.ts, t.te, d, lang)),
        it('Nishita (midnight) puja', 'निशीथ काल पूजा', span(t.ws, t.we, d, lang)),
        ...(t.ph && t.ph.length === 5
          ? [0, 1, 2, 3].map(i => it(`Night prahar ${i + 1}`, `रात्रि का ${['पहला', 'दूसरा', 'तीसरा', 'चौथा'][i]} प्रहर`, span(t.ph![i], t.ph![i + 1], d, lang)))
          : []),
        it('Parana — after sunrise', 'पारण — सूर्योदय के बाद', at(t.pr, d, lang), 'Break the fast after sunrise, ideally before Chaturdashi ends.', 'सूर्योदय के बाद, अच्छा हो कि चतुर्दशी समाप्त होने से पहले, व्रत खोलें।'),
      );
      break;
    case 'janmashtami':
      rows.push(
        it('Ashtami tithi', 'अष्टमी तिथि', span(t.ts, t.te, d, lang)),
        it('Nishita (midnight) puja', 'निशीथ काल पूजा', span(t.ws, t.we, d, lang), 'The midnight hour, when Krishna’s birth is celebrated.', 'आधी रात का समय, जब श्रीकृष्ण का जन्मोत्सव मनाया जाता है।'),
      );
      break;
    case 'somvar-vrat':
    case 'mangalvar-vrat':
      rows.push(it('Sunrise', 'सूर्योदय', at(t.rise, d, lang)), it('Sunset', 'सूर्यास्त', at(t.set, d, lang)));
      break;
  }
  return rows.filter((x): x is DailyItem => !!x);
}

function answerFor(slug: VratSlug, o: VratOcc, date: string, lang: Lang): string {
  const name = occName(slug, o, lang);
  const t = o.t ?? {};
  const w = when(o.d, date, lang);
  const isToday = o.d === date;
  if (lang === 'hi') {
    let s = isToday ? `आज ${long(o.d, lang)} को ${name} है।` : `${name} की अगली तिथि ${long(o.d, lang)} है (${w})।`;
    if (slug === 'ekadashi' && t.pr) s += ` व्रत सूर्योदय (${clock(t.rise)}) से शुरू होता है और पारण अगले दिन सूर्योदय (${clock(t.pr)}) के बाद होता है।`;
    if ((slug === 'sankashti-chaturthi' || slug === 'karwa-chauth') && t.moon) s += ` चंद्रोदय लगभग ${clock(t.moon)} पर है।`;
    if (slug === 'pradosh-vrat' && t.ws) s += ` प्रदोष पूजा ${span(t.ws, t.we, o.d, lang)} के बीच।`;
    if ((slug === 'mahashivratri' || slug === 'janmashtami') && t.ws) s += ` निशीथ काल पूजा ${span(t.ws, t.we, o.d, lang)}।`;
    if (slug === 'navratri' && t.ws) s += ` घटस्थापना दिन के पहले तिहाई भाग (${span(t.ws, t.we, o.d, lang)}) में।`;
    if (slug === 'satyanarayan-katha') s += ` पूर्णिमा पर सत्यनारायण पूजा विशेष शुभ मानी जाती है।`;
    return s + ' सभी समय नई दिल्ली के हैं; आपके शहर में कुछ मिनट का अंतर हो सकता है।';
  }
  let s = isToday ? `Today, ${long(o.d, lang)}, is ${name}.` : `The next ${name} is on ${long(o.d, lang)} (${w}).`;
  if (slug === 'ekadashi' && t.pr) s += ` The fast runs from sunrise (${clock(t.rise)}) and is broken after the next sunrise (${clock(t.pr)}).`;
  if ((slug === 'sankashti-chaturthi' || slug === 'karwa-chauth') && t.moon) s += ` Moonrise is around ${clock(t.moon)}.`;
  if (slug === 'pradosh-vrat' && t.ws) s += ` The pradosh puja time is ${span(t.ws, t.we, o.d, lang)}.`;
  if ((slug === 'mahashivratri' || slug === 'janmashtami') && t.ws) s += ` The Nishita (midnight) puja is ${span(t.ws, t.we, o.d, lang)}.`;
  if (slug === 'navratri' && t.ws) s += ` Ghatasthapana is done in the first third of the day (${span(t.ws, t.we, o.d, lang)}).`;
  if (slug === 'satyanarayan-katha') s += ' Purnima is considered an especially good day for the Satyanarayan puja.';
  return s + ' All times are for New Delhi; your city can differ by a few minutes.';
}

/** Entry for one vrat page or the hub. `data` is the stored VratNextData for `date`. */
export function renderVratEntry(slug: string, date: string, data: VratNextData, lang: Lang): DailyEntry {
  const meta = vratMeta(slug, lang);
  const hi = lang === 'hi';
  const base = { date, lang, title: meta.title, description: meta.description, h1: meta.h1, dateLabel: hi ? `अद्यतन: ${formatLongDateHi(date)}` : `Updated ${formatLongDateEn(date)}`, faq: [] };
  if (slug === VRAT_INDEX_SLUG) {
    const rows = VRAT_SLUGS.map(s => ({ s, o: data[s]?.[0] })).filter((x): x is { s: VratSlug; o: VratOcc } => !!x.o).sort((a, b) => (a.o.d < b.o.d ? -1 : a.o.d > b.o.d ? 1 : 0));
    const first = rows[0];
    const todays = rows.filter(r => r.o.d === date).map(r => occName(r.s, r.o, lang));
    const answer = hi
      ? (todays.length ? `आज (${formatLongDateHi(date)}) ${todays.join(', ')} है।` : `आने वाला पहला व्रत: ${first ? `${occName(first.s, first.o, lang)} — ${long(first.o.d, lang)} (${when(first.o.d, date, lang)})` : ''}।`) + ' नीचे हर व्रत की अगली तिथि है; पूरी कथा और पूजा विधि उसके पृष्ठ पर है। तिथियाँ नई दिल्ली के लिए हमारे पंचांग से निकाली गई हैं।'
      : (todays.length ? `Today (${formatLongDateEn(date)}) is ${todays.join(', ')}.` : `The next vrat is ${first ? `${occName(first.s, first.o, lang)} on ${long(first.o.d, lang)} (${when(first.o.d, date, lang)})` : ''}.`) + ' Below is the next date of each vrat; the full katha and puja vidhi are on its page. Dates are computed by our Panchang for New Delhi.';
    const sections: DailySection[] = [{
      id: 'next-dates', heading: hi ? 'हर व्रत की अगली तिथि' : 'Next date of each vrat',
      items: rows.map(r => ({ label: VRAT_NAMES[r.s][hi ? 'hi' : 'en'], value: `${occName(r.s, r.o, lang)} — ${long(r.o.d, lang)}`, note: when(r.o.d, date, lang) })),
    }];
    return { ...base, answer, why: [], sections, labels: { answer: hi ? 'आने वाले व्रत' : 'Coming up' } };
  }
  const s = slug as VratSlug;
  const occ = data[s] ?? [];
  const o = occ[0];
  if (!o) return { ...base, answer: hi ? 'अगली तिथि उपलब्ध नहीं है।' : 'The next date is not available.', why: [], sections: [] };
  const sections: DailySection[] = [
    { id: 'timings', heading: hi ? `${occName(s, o, lang)} — समय (नई दिल्ली)` : `${occName(s, o, lang)} — timings (New Delhi)`, items: timingItems(s, o, lang) },
  ];
  if (occ.length > 1) {
    sections.push({
      id: 'upcoming', heading: hi ? 'आगे की तिथियाँ' : 'Upcoming dates',
      items: occ.map(x => ({ label: long(x.d, lang), value: occName(s, x, lang), note: when(x.d, date, lang) })),
    });
  }
  const why = [{
    label: hi ? 'तिथि कैसे तय हुई' : 'How the date is found',
    text: hi
      ? 'हमारे पंचांग इंजन ने सूर्य-चंद्रमा की वास्तविक स्थिति से तिथि निकाली और व्रत के पारंपरिक नियम (जैसे सूर्योदय, प्रदोष, चंद्रोदय या मध्यरात्रि में तिथि का होना) नई दिल्ली के सूर्योदय-सूर्यास्त पर लगाया। ये तिथियाँ द्रिक पंचांग के नई दिल्ली कैलेंडर से जाँची गई हैं।'
      : 'Our Panchang engine finds the tithi from the real Sun and Moon and applies the vrat’s classical rule (the tithi at sunrise, at pradosh, at moonrise or at midnight) against New Delhi’s sunrise and sunset. These dates are checked against Drik Panchang’s New Delhi calendar.',
  }];
  return { ...base, answer: answerFor(s, o, date, lang), why, sections, labels: { answer: hi ? 'अगली तिथि' : 'Next date', why: hi ? 'गणना' : 'How we work it out' } };
}

export const vratTemplate = (lang: Lang) => (date: string, slug: string, data: unknown): DailyEntry =>
  renderVratEntry(slug, date, data as VratNextData, lang);
