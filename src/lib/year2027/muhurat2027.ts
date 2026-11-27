/**
 * B20 — Holi and Diwali 2027 muhurats, for New Delhi and nine more cities.
 *
 * Every time is computed: tithis from the festival engine (Moon–Sun angle), sunrise/sunset from
 * panchangDay.sunriseSunset for each city, the rising sign (lagna) from vedicEngine.calculateLagna
 * (true Lahiri). Conventions, checked against Drik Panchang 2027 (Holika Dahan, Dhanteras pages)
 * and AstroSage 2027 (Lakshmi Puja) — see __tests__/golden/holiDiwali2027Ref.json:
 *  - Pradosh kaal = sunset to sunset + one fifth of the night (the three evening muhurtas).
 *  - Bhadra on Purnima = the first half of the tithi by angle (Vishti karana).
 *  - Bhadra Punchha / Mukha (Shukla Purnima): Bhadra split into 30 equal ghatis; Punchha is the
 *    last 3 ghatis of the third quarter (19.5–22.5), Mukha the first 5 of the fourth (22.5–27.5).
 *  - Holika Dahan: Pradosh after Bhadra while Purnima lasts. If Bhadra covers Pradosh but ends
 *    before midnight, after Bhadra ends. If Bhadra runs past midnight, in Bhadra Punchha when it
 *    falls in Pradosh, otherwise in Pradosh (never in Bhadra Mukha); the alternative is after
 *    Bhadra ends, before sunrise (Drik Panchang, Holika Dahan rules).
 *  - Lakshmi Puja = Pradosh ∩ Vrishabha (fixed) lagna ∩ Amavasya. Mahanishita = the midnight
 *    muhurta (night mid-point ± one thirtieth of the night) with Simha lagna.
 *  - Dhanteras = Pradosh ∩ Vrishabha lagna ∩ Trayodashi.
 */
import { sunriseSunset } from '../vedic/panchangDay';
import { calculateLagna } from '../vedic/engine/vedicEngine';
import { festivalDetails, tithiFractionInstant } from '../vedic/festivals';
import { CITIES, type City, type Win } from './muhuratFormat';
export { CITIES, hm, istDate, icsEvent, type City, type Win } from './muhuratFormat';

export const DELHI = CITIES[0];

const MIN = 60_000;
const IST_H = 5.5;

export function citySun(iso: string, c: City): { rise: number; set: number; nextRise: number } {
  const [y, m, d] = iso.split('-').map(Number);
  const r = sunriseSunset(new Date(Date.UTC(y, m - 1, d)), c.lat, c.lon, IST_H);
  return { rise: r.rise.getTime(), set: r.set.getTime(), nextRise: r.nextRise.getTime() };
}
export function pradosh(iso: string, c: City): Win {
  const s = citySun(iso, c);
  return [s.set, s.set + (s.nextRise - s.set) / 5];
}
export function nishita(iso: string, c: City): Win {
  const s = citySun(iso, c); const len = s.nextRise - s.set, mid = s.set + len / 2;
  return [mid - len / 30, mid + len / 30];
}
export const intersect = (...ws: Array<Win | null>): Win | null => {
  if (ws.some(w => !w)) return null;
  const a = Math.max(...ws.map(w => w![0])), b = Math.min(...ws.map(w => w![1]));
  return b > a ? [a, b] : null;
};

const signAt = (t: number, c: City) => Math.floor(calculateLagna(new Date(t), c.lat, c.lon).ascSidereal / 30);
/** The first window inside [from, to] when the rising sign is `sign` (0 = Mesha), to the second. */
export function lagnaWindow(sign: number, from: number, to: number, c: City): Win | null {
  const step = 4 * MIN;
  let start: number | null = null;
  const edge = (a: number, b: number, inside: boolean) => {
    // bisect the boundary between a (state !inside) and b (state inside), or the reverse
    for (let i = 0; i < 20; i++) { const m = (a + b) / 2; if ((signAt(m, c) === sign) === inside) b = m; else a = m; }
    return b;
  };
  let prevIn = signAt(from, c) === sign;
  if (prevIn) start = from;
  for (let t = from + step; t <= to + step; t += step) {
    const tt = Math.min(t, to), isIn = signAt(tt, c) === sign;
    if (!prevIn && isIn) start = edge(tt - step, tt, true);
    if (prevIn && !isIn && start !== null) return [start, edge(tt - step, tt, false)];
    prevIn = isIn;
    if (tt === to) break;
  }
  return start !== null ? [start, to] : null;
}

const detail = (name: string) => {
  const d = festivalDetails(2027).find(x => x.name === name);
  if (!d) throw new Error(`festival engine has no ${name} in 2027`);
  return d;
};

export interface HolikaCity { city: City; pradosh: Win; muhurat: Win | null; via: 'pradosh' | 'after-bhadra' | 'punchha'; alternative: Win | null }
export interface Holika2027 {
  dahanDate: string; holiDate: string; purnima: Win; bhadra: Win; punchha: Win; mukha: Win;
  cities: HolikaCity[];
}
let holikaMemo: Holika2027 | null = null;
export function holika2027(): Holika2027 {
  if (holikaMemo) return holikaMemo;
  const d = detail('Holika Dahan'), holi = detail('Holi');
  const purnima: Win = [d.tithiStart, d.tithiEnd];
  const bhadraEnd = tithiFractionInstant(2027, d.month, 'Shukla', 15, 0.5);
  const bhadra: Win = [d.tithiStart, bhadraEnd];
  const g = (bhadraEnd - bhadra[0]) / 30;
  const punchha: Win = [bhadra[0] + 19.5 * g, bhadra[0] + 22.5 * g];
  const mukha: Win = [bhadra[0] + 22.5 * g, bhadra[0] + 27.5 * g];
  const cities = CITIES.map((c): HolikaCity => {
    const pd = pradosh(d.dateISO, c), sun = citySun(d.dateISO, c);
    const midnight = sun.set + (sun.nextRise - sun.set) / 2;
    const p = intersect(pd, purnima);
    let muhurat: Win | null, via: HolikaCity['via'];
    if (bhadraEnd <= pd[0]) { muhurat = p; via = 'pradosh'; }
    else if (bhadraEnd < midnight) { muhurat = intersect([bhadraEnd, midnight], purnima); via = 'after-bhadra'; }
    else if (intersect(punchha, pd)) { muhurat = intersect(punchha, pd); via = 'punchha'; }
    else { muhurat = p; via = 'pradosh'; }
    const alternative = bhadraEnd >= midnight ? intersect([bhadraEnd, sun.nextRise], purnima) : null;
    return { city: c, pradosh: pd, muhurat, via, alternative };
  });
  holikaMemo = { dahanDate: d.dateISO, holiDate: holi.dateISO, purnima, bhadra, punchha, mukha, cities };
  return holikaMemo;
}

export interface DiwaliCity { city: City; pradosh: Win; vrishabha: Win | null; lakshmi: Win | null; nishita: Win; simha: Win | null; mahanishita: Win | null }
export interface DayRow { slug: string; en: string; hi: string; dateISO: string; tithi: Win }
export interface Diwali2027 {
  days: DayRow[]; amavasya: Win; cities: DiwaliCity[];
  dhanteras: { dateISO: string; trayodashi: Win; pradosh: Win; vrishabha: Win | null; muhurat: Win | null; cities: Array<{ city: City; muhurat: Win | null }> };
}
let diwaliMemo: Diwali2027 | null = null;
export function diwali2027(): Diwali2027 {
  if (diwaliMemo) return diwaliMemo;
  const names: Array<[string, string, string, string]> = [
    ['dhanteras', 'Dhanteras', 'धनतेरस', 'Dhanteras'],
    ['narak-chaturdashi', 'Narak Chaturdashi (Choti Diwali)', 'नरक चतुर्दशी (छोटी दिवाली)', 'Narak Chaturdashi'],
    ['diwali', 'Diwali — Lakshmi Puja', 'दिवाली — लक्ष्मी पूजा', 'Diwali (Lakshmi Puja)'],
    ['govardhan-puja', 'Govardhan Puja', 'गोवर्धन पूजा', 'Govardhan Puja'],
    ['bhai-dooj', 'Bhai Dooj', 'भाई दूज', 'Bhai Dooj'],
  ];
  const days = names.map(([slug, en, hi, eng]) => { const x = detail(eng); return { slug, en, hi, dateISO: x.dateISO, tithi: [x.tithiStart, x.tithiEnd] as Win }; });
  const dw = detail('Diwali (Lakshmi Puja)');
  const amavasya: Win = [dw.tithiStart, dw.tithiEnd];
  const cities = CITIES.map((c): DiwaliCity => {
    const pd = pradosh(dw.dateISO, c), sun = citySun(dw.dateISO, c);
    const vr = lagnaWindow(1, sun.set - 90 * MIN, sun.set + 5 * 3600_000, c);
    const ni = nishita(dw.dateISO, c);
    const si = lagnaWindow(4, ni[0] - 2 * 3600_000, sun.nextRise, c);
    return { city: c, pradosh: pd, vrishabha: vr, lakshmi: intersect(pd, vr, amavasya), nishita: ni, simha: si, mahanishita: intersect(ni, si, amavasya) };
  });
  const dh = detail('Dhanteras');
  const tray: Win = [dh.tithiStart, dh.tithiEnd];
  const dhCity = (c: City) => {
    const pd = pradosh(dh.dateISO, c), sun = citySun(dh.dateISO, c);
    const vr = lagnaWindow(1, sun.set - 90 * MIN, sun.set + 5 * 3600_000, c);
    return { pd, vr, m: intersect(pd, vr, tray) };
  };
  const dd = dhCity(DELHI);
  diwaliMemo = {
    days, amavasya, cities,
    dhanteras: { dateISO: dh.dateISO, trayodashi: tray, pradosh: dd.pd, vrishabha: dd.vr, muhurat: dd.m, cities: CITIES.map(c => ({ city: c, muhurat: dhCity(c).m })) },
  };
  return diwaliMemo;
}

/** Plain-JSON form (cities by id) for the precomputed data file. */
export function serialiseMuhurat2027() {
  const h = holika2027(), w = diwali2027();
  const cid = <T extends { city: City }>(x: T) => ({ ...x, city: x.city.id });
  return {
    holika: { ...h, cities: h.cities.map(cid) },
    diwali: { ...w, cities: w.cities.map(cid), dhanteras: { ...w.dhanteras, cities: w.dhanteras.cities.map(cid) } },
  };
}
