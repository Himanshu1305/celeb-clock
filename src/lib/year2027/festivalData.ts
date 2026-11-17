/**
 * B14 — computed data for the dated festival pages (/festivals/2027/:slug and Hindi).
 *
 * Every date and time comes from the festival engine (src/lib/vedic/festivals.ts): the date
 * from festivalDetails / computeFestivalCalendar / tithiDays (the same functions the /festivals
 * calendar uses — src/lib/year2027/__tests__/festivals2027.test.ts checks the dates match),
 * tithi start / end from tithiSpan, and the puja window from the kala rule the date uses,
 * for New Delhi (sunrise / sunset / moonrise from the engine). Nothing is typed by hand.
 */
import {
  computeFestivalCalendar, festivalDetails, tithiDays, sankrantiInstants, delhiSunTimes, kalaWindowDelhi,
  type FestivalDetail, type Kala,
} from '../vedic/festivals';
import { FESTIVALS_2027 } from './meta.js';
import type { Lang } from './text';

export const TITHI_EN = ['', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
export const TITHI_HI = ['', 'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी'];
export const LUNAR_MONTH_HI: Record<string, string> = {
  Chaitra: 'चैत्र', Vaishakha: 'वैशाख', Jyeshtha: 'ज्येष्ठ', Ashadha: 'आषाढ़', Shravana: 'श्रावण', Bhadrapada: 'भाद्रपद',
  Ashwina: 'आश्विन', Kartika: 'कार्तिक', Margashirsha: 'मार्गशीर्ष', Pausha: 'पौष', Magha: 'माघ', Phalguna: 'फाल्गुन',
};
const PAKSHA_HI = { Shukla: 'शुक्ल', Krishna: 'कृष्ण' } as const;

export const KALA_LABEL: Record<Lang, Record<Kala, string>> = {
  en: {
    udaya: 'sunrise', arunodaya: 'Arunodaya (the pre-dawn hour and a half)', pratah: 'Pratah kaal (the first third of the day)',
    purvahna: 'Purvahna (forenoon)', madhyahna: 'Madhyahna (midday)', aparahna: 'Aparahna (afternoon)', sayahna: 'Sayahna (late afternoon to sunset)',
    pradosh: 'Pradosh kaal (the evening after sunset)', nishita: 'Nishita kaal (midnight)', moonrise: 'moonrise',
  },
  hi: {
    udaya: 'सूर्योदय', arunodaya: 'अरुणोदय (सूर्योदय से पहले का समय)', pratah: 'प्रातः काल (दिन का पहला तिहाई भाग)',
    purvahna: 'पूर्वाह्न', madhyahna: 'मध्याह्न', aparahna: 'अपराह्न', sayahna: 'सायाह्न (सूर्यास्त तक)',
    pradosh: 'प्रदोष काल (सूर्यास्त के बाद)', nishita: 'निशीथ काल (मध्यरात्रि)', moonrise: 'चंद्रोदय',
  },
};

const IST = 5.5 * 3600_000;
/** "21:15" (IST) */
export const istTime = (ms: number): string => new Date(ms + IST).toISOString().slice(11, 16);
/** "2027-03-21" (IST) */
export const istDay = (ms: number): string => new Date(ms + IST).toISOString().slice(0, 10);
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const MONTH_EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DOW_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

/** "21:15, 21 Mar" / "21:15, 21 मार्च" */
export function stamp(ms: number, lang: Lang): string {
  const d = istDay(ms);
  const day = Number(d.slice(8, 10)), m = Number(d.slice(5, 7)) - 1;
  return `${istTime(ms)}, ${day} ${lang === 'en' ? MON_EN[m] : MON_HI[m]}`;
}
/** "Monday, 22 March 2027" / "सोमवार, 22 मार्च 2027" */
export function dayLabel(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return lang === 'en' ? `${DOW_EN[dow]}, ${d} ${MONTH_EN_LONG[m - 1]} ${y}` : `${DOW_HI[dow]}, ${d} ${MON_HI[m - 1]} ${y}`;
}
export const weekday = (iso: string, lang: Lang): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return lang === 'en' ? DOW_EN[dow] : DOW_HI[dow];
};

export interface TimingRow { label: string; value: string }

export interface Festival2027 {
  slug: string;
  name: string;
  /** IST civil date the festival is observed (New Delhi) */
  dateISO: string;
  /** "Phalguna Shukla Purnima" style, both month systems where they differ */
  tithiLabel: string;
  /** rows for the timing table (tithi start / end, puja window, sunrise / moonrise …) */
  timings: TimingRow[];
  /** extra computed notes (Bhadra, Sankranti moment, the four Chhath days …) */
  notes: string[];
  /** engine detail when the festival is tithi-based */
  detail?: FestivalDetail;
  /** a second traditional date (Maha Navami in Bengal) */
  alt?: { dateISO: string; label: string };
}

const cache = new Map<string, Festival2027[]>();

function lunarLabel(month: string, monthP: string, paksha: 'Shukla' | 'Krishna', tithi: number, lang: Lang): string {
  const t = tithi === 15 ? (paksha === 'Shukla' ? (lang === 'en' ? 'Purnima' : 'पूर्णिमा') : (lang === 'en' ? 'Amavasya' : 'अमावस्या')) : (lang === 'en' ? TITHI_EN[tithi] : TITHI_HI[tithi]);
  if (lang === 'en') {
    return month === monthP ? `${month} ${paksha} ${t}` : `${monthP} ${paksha} ${t} (North Indian, purnimanta) — ${month} ${paksha} ${t} in the amanta calendar`;
  }
  const mh = LUNAR_MONTH_HI[month] ?? month, mph = LUNAR_MONTH_HI[monthP] ?? monthP;
  return month === monthP ? `${mh} ${PAKSHA_HI[paksha]} ${t}` : `${mph} ${PAKSHA_HI[paksha]} ${t} (पूर्णिमांत) — अमांत पंचांग में ${mh} ${PAKSHA_HI[paksha]} ${t}`;
}

/** The puja window: the kala window clipped to the tithi when they overlap (else the window itself). */
function pujaWindow(d: FestivalDetail): [number, number] | null {
  if (!d.window || !d.kala || d.window[0] === d.window[1]) return null;
  const a = Math.max(d.window[0], d.tithiStart), b = Math.min(d.window[1], d.tithiEnd);
  return b > a ? [a, b] : [d.window[0], d.window[1]];
}

/** All 2027 festival pages' computed data, in one pass (memoised). */
export function festivals2027(lang: Lang): Festival2027[] {
  const key = lang;
  const hit = cache.get(key);
  if (hit) return hit;
  const en = lang === 'en';
  const details = festivalDetails(2027);
  const cal = computeFestivalCalendar(2027).festivals;
  const tdays = tithiDays(2027);
  const sk = sankrantiInstants(2027);
  const out: Festival2027[] = [];
  for (const f of FESTIVALS_2027) {
    const name = en ? f.en : f.hi;
    const timings: TimingRow[] = [];
    const notes: string[] = [];
    const d = details.find(x => x.name === f.engine);
    if (d) {
      const tl = lunarLabel(d.month, d.monthPurnimanta, d.paksha, d.tithi, lang);
      const tname = d.tithi === 15 ? (d.paksha === 'Shukla' ? (en ? 'Purnima' : 'पूर्णिमा') : (en ? 'Amavasya' : 'अमावस्या')) : (en ? TITHI_EN[d.tithi] : TITHI_HI[d.tithi]);
      timings.push({ label: en ? `${tname} tithi begins` : `${tname} तिथि आरंभ`, value: stamp(d.tithiStart, lang) });
      timings.push({ label: en ? `${tname} tithi ends` : `${tname} तिथि समाप्त`, value: stamp(d.tithiEnd, lang) });
      const sun = delhiSunTimes(d.dateISO);
      const w = pujaWindow(d);
      if (f.slug === 'holi') {
        notes.push(en ? 'Holi (Dhulandi) is played on the morning after the Holika Dahan bonfire, so it has no separate tithi muhurat.' : 'होली (धुलंडी) होलिका दहन के अगले दिन सुबह खेली जाती है, इसलिए इसका अलग तिथि-मुहूर्त नहीं होता।');
      } else if (f.slug === 'holika-dahan' || f.slug === 'raksha-bandhan') {
        // Bhadra (Vishti karana) = the first half of Purnima.
        const bhadraEnd = (d.tithiStart + d.tithiEnd) / 2;
        timings.push({ label: en ? 'Bhadra (first half of Purnima) ends' : 'भद्रा (पूर्णिमा का पहला आधा भाग) समाप्त', value: stamp(bhadraEnd, lang) });
        if (f.slug === 'raksha-bandhan') {
          const a = Math.max(bhadraEnd, sun.rise), b = d.tithiEnd;
          if (b > a) timings.push({ label: en ? 'Rakhi time (after Bhadra, while Purnima lasts)' : 'राखी बाँधने का समय (भद्रा के बाद, पूर्णिमा रहते)', value: `${istTime(a)} – ${istTime(b)}` });
        } else if (w) {
          const pd = kalaWindowDelhi(d.dateISO, 'pradosh');
          timings.push({ label: en ? 'Pradosh kaal (evening)' : 'प्रदोष काल (शाम)', value: `${istTime(pd[0])} – ${istTime(pd[1])}` });
          if (bhadraEnd > pd[0]) notes.push(en
            ? `In 2027 Bhadra lasts until ${stamp(bhadraEnd, 'en')}, so it covers the whole evening of ${dayLabel(d.dateISO, 'en')}. The tradition avoids the bonfire during Bhadra; when Bhadra covers the evening, Panchangs give a special time (often the tail of Bhadra, "Bhadra Puchha") — follow your local Panchang or temple for the exact minute.`
            : `2027 में भद्रा ${stamp(bhadraEnd, 'hi')} तक है, यानी ${dayLabel(d.dateISO, 'hi')} की पूरी शाम भद्रा रहेगी। परंपरा में भद्रा में होलिका दहन नहीं किया जाता; ऐसे वर्षों में पंचांग विशेष समय (अक्सर "भद्रा पुच्छ") बताते हैं — सटीक मिनट के लिए स्थानीय पंचांग या मंदिर की सूचना देखें।`);
        }
      } else if (d.kala === 'moonrise' && d.window) {
        timings.push({ label: en ? 'Moonrise in New Delhi (fast ends)' : 'नई दिल्ली में चंद्रोदय (व्रत खोलने का समय)', value: istTime(d.window[0]) });
        timings.push({ label: en ? 'Sunset (evening puja after this)' : 'सूर्यास्त (इसके बाद शाम की पूजा)', value: istTime(sun.set) });
      } else if (d.kala === 'sayahna') {
        timings.push({ label: en ? 'Sandhya Arghya — sunset in New Delhi' : 'संध्या अर्घ्य — नई दिल्ली में सूर्यास्त', value: istTime(sun.set) });
        const next = delhiSunTimes(addDays(d.dateISO, 1));
        timings.push({ label: en ? `Usha Arghya — sunrise on ${dayLabel(addDays(d.dateISO, 1), 'en')}` : `उषा अर्घ्य — ${dayLabel(addDays(d.dateISO, 1), 'hi')} का सूर्योदय`, value: istTime(next.rise) });
        notes.push(en
          ? `The four days of Chhath in 2027: Nahay Khay on ${dayLabel(addDays(d.dateISO, -2), 'en')}, Kharna on ${dayLabel(addDays(d.dateISO, -1), 'en')}, Sandhya Arghya (the main evening offering) on ${dayLabel(d.dateISO, 'en')} and Usha Arghya at sunrise on ${dayLabel(addDays(d.dateISO, 1), 'en')}.`
          : `2027 में छठ के चार दिन: नहाय-खाय ${dayLabel(addDays(d.dateISO, -2), 'hi')}, खरना ${dayLabel(addDays(d.dateISO, -1), 'hi')}, संध्या अर्घ्य (मुख्य शाम का अर्घ्य) ${dayLabel(d.dateISO, 'hi')} और उषा अर्घ्य ${dayLabel(addDays(d.dateISO, 1), 'hi')} की सुबह।`);
      } else if (w && d.kala) {
        timings.push({ label: en ? `Puja window — ${KALA_LABEL.en[d.kala]}` : `पूजा का समय — ${KALA_LABEL.hi[d.kala]}`, value: `${istTime(w[0])} – ${istTime(w[1])}${istDay(w[0]) !== d.dateISO ? (en ? ` (night of ${dayLabel(d.dateISO, 'en').split(',')[1].trim()})` : ` (${dayLabel(d.dateISO, 'hi').split(',')[1].trim()} की रात)`) : ''}` });
      } else {
        timings.push({ label: en ? 'Sunrise in New Delhi' : 'नई दिल्ली में सूर्योदय', value: istTime(sun.rise) });
      }
      out.push({ slug: f.slug, name, dateISO: d.dateISO, tithiLabel: tl, timings, notes, detail: d, ...(d.alt ? { alt: { dateISO: d.alt.dateISO, label: en ? 'Bengal (Para-Viddha rule)' : 'बंगाल (पर-विद्धा नियम)' } } : {}) });
      continue;
    }
    if (f.slug === 'dev-uthani-ekadashi') {
      const t = tdays.find(x => x.name === f.engine)!;
      const tl = lunarLabel(t.month, t.monthPurnimanta, t.paksha, 11, lang);
      timings.push({ label: en ? 'Ekadashi tithi begins' : 'एकादशी तिथि आरंभ', value: stamp(t.tithiStart, lang) });
      timings.push({ label: en ? 'Ekadashi tithi ends' : 'एकादशी तिथि समाप्त', value: stamp(t.tithiEnd, lang) });
      timings.push({ label: en ? 'Sunrise in New Delhi' : 'नई दिल्ली में सूर्योदय', value: istTime(delhiSunTimes(t.dateISO).rise) });
      notes.push(en ? `The fast is broken (parana) on the next morning, ${dayLabel(addDays(t.dateISO, 1), 'en')}, during Dwadashi; check a local Panchang for the exact parana minutes.` : `व्रत का पारण अगली सुबह, ${dayLabel(addDays(t.dateISO, 1), 'hi')} को द्वादशी में किया जाता है; पारण का सटीक समय स्थानीय पंचांग में देखें।`);
      out.push({ slug: f.slug, name, dateISO: t.dateISO, tithiLabel: tl, timings, notes });
      continue;
    }
    if (f.slug === 'makar-sankranti' || f.slug === 'lohri') {
      const makar = sk.find(s => s.sign === 9)!;
      const row = cal.find(x => x.name === f.engine)!;
      const sun = delhiSunTimes(row.dateISO);
      if (f.slug === 'makar-sankranti') {
        timings.push({ label: en ? 'Sankranti moment (Sun enters sidereal Capricorn)' : 'संक्रांति का क्षण (सूर्य का मकर राशि में प्रवेश)', value: stamp(makar.instant, lang) });
        timings.push({ label: en ? 'Sunrise in New Delhi on the festival day' : 'पर्व के दिन नई दिल्ली में सूर्योदय', value: istTime(sun.rise) });
        if (istDay(makar.instant) !== row.dateISO) notes.push(en
          ? `The Sun enters Capricorn after sunset on ${dayLabel(istDay(makar.instant), 'en')}, so by the classical rule the festival and its punya kaal (holy bath and daan) move to the next morning, ${dayLabel(row.dateISO, 'en')}.`
          : `सूर्य ${dayLabel(istDay(makar.instant), 'hi')} को सूर्यास्त के बाद मकर राशि में प्रवेश करते हैं, इसलिए शास्त्रीय नियम से पर्व और पुण्य काल (स्नान व दान) अगली सुबह, ${dayLabel(row.dateISO, 'hi')} को होते हैं।`);
        out.push({ slug: f.slug, name, dateISO: row.dateISO, tithiLabel: en ? 'Solar festival — the Sun’s entry into Makara (sidereal Capricorn)' : 'सौर पर्व — सूर्य का मकर राशि में प्रवेश', timings, notes });
      } else {
        timings.push({ label: en ? 'Sunset in New Delhi (bonfire after this)' : 'नई दिल्ली में सूर्यास्त (इसके बाद अलाव)', value: istTime(sun.set) });
        timings.push({ label: en ? 'Makar Sankranti moment' : 'मकर संक्रांति का क्षण', value: stamp(makar.instant, lang) });
        out.push({ slug: f.slug, name, dateISO: row.dateISO, tithiLabel: en ? 'The evening before Makar Sankranti (solar)' : 'मकर संक्रांति से पहले की शाम (सौर)', timings, notes });
      }
      continue;
    }
    throw new Error(`festival ${f.slug}: "${f.engine}" not found in the engine`);
  }
  out.sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
  cache.set(key, out);
  return out;
}

export function festival2027(slug: string, lang: Lang): Festival2027 | undefined {
  return festivals2027(lang).find(f => f.slug === slug);
}

function addDays(iso: string, n: number): string {
  return new Date(Date.parse(iso + 'T00:00:00Z') + n * 86400_000).toISOString().slice(0, 10);
}
