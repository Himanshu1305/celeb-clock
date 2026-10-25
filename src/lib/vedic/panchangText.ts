/**
 * Plain-language text for the Panchang / Rahu Kaal / Choghadiya city pages (batch 7, W7).
 *
 * Pure functions of a computed DayPanchang, so the same sentences can be produced at
 * build time (for the shared daily-page precompute) and in the browser — server and
 * client always read the same words. No engine calls here.
 */
import type { DayPanchang, TimeWindow } from './panchangDay';
import { karanaName } from './panchang';

export type PanchangPageKind = 'panchang' | 'rahu-kaal' | 'choghadiya';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "25 October 2026" from "2026-10-25". */
export function dateLong(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
/** "Sunday, 25 October 2026" from "2026-10-25". */
export function dateWithWeekday(key: string): string {
  const wd = new Date(key + 'T12:00:00Z').getUTCDay();
  return `${WEEKDAYS[wd]}, ${dateLong(key)}`;
}

/** "16:18–17:42", marking clock times that fall after midnight. */
export function windowText(w: TimeWindow): string {
  // A window that ends after midnight (whether or not it starts after it) gets one
  // "(next day)" at the end: "23:30–00:40 (next day)", "02:33–04:00 (next day)".
  return `${w.start}–${w.end}${w.endNextDay ? ' (next day)' : ''}`;
}
export function windowsText(ws: TimeWindow[]): string {
  return ws.length ? ws.map(windowText).join(' and ') : 'none today';
}

const hm = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;

/** Best (Amrit / Shubh / Labh) daytime Choghadiya slots, in order. */
export function goodDaySlots(p: DayPanchang): TimeWindow[] {
  return p.dayChoghadiya.filter(c => c.quality === 'good');
}

/** The 2–3 sentence direct answer shown first on each page (answer-first layout). */
export function pageAnswer(kind: PanchangPageKind, p: DayPanchang, place: string): string {
  const day = dateWithWeekday(p.date);
  if (kind === 'rahu-kaal') {
    return `Rahu Kaal in ${place} on ${day} is ${windowText(p.rahuKaal)}. `
      + `Gulika Kaal is ${windowText(p.gulikaKaal)} and Yamaganda is ${windowText(p.yamaganda)}, `
      + `worked out from today's sunrise (${p.sunrise}) and sunset (${p.sunset}) in ${place}.`;
  }
  if (kind === 'choghadiya') {
    const good = goodDaySlots(p).map(c => `${c.name} ${c.start}–${c.end}`).join(', ');
    return `The day Choghadiya in ${place} on ${day} starts with ${p.dayChoghadiya[0].name} at sunrise (${p.sunrise}) and the night Choghadiya with ${p.nightChoghadiya[0].name} at sunset (${p.sunset}). `
      + (good ? `The good daytime slots are ${good}.` : 'There is no Amrit, Shubh or Labh slot in the daytime today.');
  }
  return `On ${day} in ${place}, sunrise is at ${p.sunrise} and sunset at ${p.sunset}. `
    + `The Tithi at sunrise is ${p.paksha} ${p.tithiName} (till ${p.tithiEnd}) and the Nakshatra is ${p.nakshatra} (till ${p.nakshatraEnd}). `
    + `Rahu Kaal is ${windowText(p.rahuKaal)}; ` + (p.abhijitApplies ? `Abhijit Muhurta is ${windowText(p.abhijit)}.` : 'Abhijit Muhurta is not used on a Wednesday.');
}

/** Title / description / H1 for a page kind. `dated` adds the date (for the daily precompute). */
export function pageMeta(kind: PanchangPageKind, place: string, p?: DayPanchang): { title: string; description: string; h1: string } {
  const d = p ? dateLong(p.date) : '';
  if (kind === 'rahu-kaal') {
    return {
      title: p ? `Rahu Kaal Today in ${place} (${d}) | BornClock` : `Rahu Kaal Today in ${place} — Gulika & Yamaganda | BornClock`,
      description: p
        ? `Rahu Kaal in ${place} on ${d}: ${windowText(p.rahuKaal)}. Gulika ${windowText(p.gulikaKaal)}, Yamaganda ${windowText(p.yamaganda)}, Dur Muhurtam and Varjyam — from real sunrise and sunset.`
        : `Today's Rahu Kaal for ${place}, with Gulika Kaal, Yamaganda, Dur Muhurtam and Varjyam — worked out from the real sunrise and sunset in ${place}, plus the week ahead.`,
      h1: `Rahu Kaal Today — ${place}`,
    };
  }
  if (kind === 'choghadiya') {
    return {
      title: p ? `Choghadiya Today in ${place} (${d}) | BornClock` : `Choghadiya Today in ${place} — Day & Night | BornClock`,
      description: p
        ? `Day and night Choghadiya for ${place} on ${d}: ${p.dayChoghadiya[0].name} from sunrise ${p.sunrise}, ${p.nightChoghadiya[0].name} from sunset ${p.sunset}. Amrit, Shubh and Labh slots shown.`
        : `Today's day and night Choghadiya for ${place} — Amrit, Shubh, Labh, Char, Udveg, Kaal and Rog slots from the real sunrise and sunset in ${place}.`,
      h1: `Choghadiya Today — ${place}`,
    };
  }
  return {
    title: p ? `Panchang Today in ${place} (${d}) | BornClock` : `Panchang for ${place} — Tithi, Nakshatra & Rahu Kaal | BornClock`,
    description: p
      ? `Panchang for ${place} on ${d}: ${p.paksha} ${p.tithiName}, ${p.nakshatra} Nakshatra, ${p.yoga} Yoga, ${karanaName(p.karana)} Karana. Sunrise ${p.sunrise}, Rahu Kaal ${windowText(p.rahuKaal)}.`
      : `Today's Panchang for ${place}: Tithi, Nakshatra, Yoga, Karana, sunrise, sunset, Rahu Kaal, Brahma Muhurta, Amrit Kalam, Varjyam and Choghadiya — from real sunrise/sunset.`,
    h1: `Today's Panchang — ${place}`,
  };
}

/** Title / description / H1 for the three index pages (/panchang, /rahu-kaal, /choghadiya). */
export function indexMeta(kind: PanchangPageKind): { title: string; description: string; h1: string } {
  if (kind === 'rahu-kaal') return {
    title: 'Rahu Kaal Today — Any City, Any Date | BornClock',
    description: "Today's Rahu Kaal, Gulika Kaal and Yamaganda for 50 Indian cities or any place you search — worked out from real sunrise and sunset, with the week ahead and any date.",
    h1: 'Rahu Kaal Today',
  };
  if (kind === 'choghadiya') return {
    title: 'Choghadiya Today — Day & Night, Any City | BornClock',
    description: "Today's day and night Choghadiya — Amrit, Shubh, Labh, Char, Udveg, Kaal and Rog — for 50 Indian cities or any place you search, from real sunrise and sunset, for any date.",
    h1: 'Choghadiya Today',
  };
  return {
    title: "Today's Panchang — Tithi, Nakshatra & Rahu Kaal | BornClock",
    description: "Today's Panchang: Tithi, Nakshatra, Yoga, Karana, sunrise, sunset, Rahu Kaal, Brahma Muhurta, Amrit Kalam, Varjyam and the day & night Choghadiya — for any city and any date.",
    h1: "Today's Panchang",
  };
}

/**
 * What makes this city's timings its own: daylight length and how its sunrise and
 * sunset compare with Delhi's on the same date (all from the engine).
 */
export function cityContrast(place: string, p: { sunrise: string; sunset: string; dayLengthMin: number }, delhi: { sunrise: string; sunset: string } | null): string {
  const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  let s = `${place} gets ${hm(p.dayLengthMin)} of daylight on this date.`;
  if (delhi && place !== 'Delhi') {
    const dr = toMin(p.sunrise) - toMin(delhi.sunrise);
    const ds = toMin(p.sunset) - toMin(delhi.sunset);
    const rel = (n: number) => n === 0 ? 'at the same minute as' : `${Math.abs(n)} min ${n < 0 ? 'earlier than' : 'later than'}`;
    s += ` Sunrise here is ${rel(dr)} Delhi and sunset ${rel(ds)} Delhi, so every window on this page shifts accordingly.`;
  }
  return s;
}
