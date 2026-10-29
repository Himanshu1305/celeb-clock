/**
 * Batch 10 — plain-language sentences for the Bhava Chalit, KP and Jaimini sections.
 * Impact first, then the reason; calm wording; no predictions of events or dates.
 */
import { ordinal, signName, SIGN_EN } from './angles';
import type { BhavaChalit } from './bhavaChalit';
import type { KpTables } from './kp';
import type { JaiminiResult, KarakaCode } from './jaimini';

/** Short life-area label for each house (standard house significations, as on the rest of the Kundali page). */
export const HOUSE_TOPIC: Record<number, string> = {
  1: 'self, health and life direction', 2: 'money, speech and family', 3: 'courage, effort and siblings',
  4: 'home, mother and inner peace', 5: 'children, creativity and learning', 6: 'daily work, health habits and overcoming obstacles',
  7: 'marriage and partnerships', 8: 'shared money, research and life changes', 9: 'luck, teachers, faith and long journeys',
  10: 'career and reputation', 11: 'gains, friends and goals', 12: 'expenses, rest, foreign places and spiritual life',
};

export const planetLabel = (p: string, start = false) =>
  p === 'Sun' || p === 'Moon' ? `${start ? 'The' : 'the'} ${p}` : p;

// ── Bhava Chalit ────────────────────────────────────────────────────────────────
export function chalitSummary(c: BhavaChalit): { headline: string; lines: string[] } {
  const shifted = c.planets.filter(p => p.shifted);
  if (shifted.length === 0) {
    return {
      headline: 'All nine planets work through the same houses as in your Rashi chart — your main chart can be read as it is.',
      lines: [],
    };
  }
  const n = shifted.length;
  const headline = `${n === 1 ? 'One planet works' : `${n} planets work`} through a different house than the sign ${n === 1 ? 'it sits' : 'they sit'} in. ${n === 1 ? 'Its' : 'Their'} results are read from the Chalit house below.`;
  const lines = shifted.map(p =>
    `${planetLabel(p.name, true)} sits in the ${ordinal(p.rashiHouse)} sign from your Lagna but works through your ${ordinal(p.bhava)} house — read its results mainly for ${HOUSE_TOPIC[p.bhava]}, rather than ${HOUSE_TOPIC[p.rashiHouse]}.`
    + (p.timeSensitive ? ' This shift depends on your exact birth time: 5 minutes either way would change it.' : ''),
  );
  return { headline, lines };
}

// ── KP ──────────────────────────────────────────────────────────────────────────
/** Houses each planet signifies at any of the four levels, ascending. */
export function housesSignified(kp: KpTables): Record<string, number[]> {
  const out: Record<string, Set<number>> = {};
  for (const s of kp.significators) {
    for (const p of [...s.L1, ...s.L2, ...s.L3, ...s.L4]) (out[p] ??= new Set()).add(s.house);
  }
  return Object.fromEntries(Object.entries(out).map(([p, h]) => [p, [...h].sort((a, b) => a - b)]));
}

export function kpSummary(kp: KpTables, mahadasha?: string | null): string[] {
  const c = (h: number) => kp.cusps[h - 1];
  const lines = [
    `In KP, the sub lord of each house cusp decides how that house's matters unfold. Yours: 7th cusp (marriage and partnerships) — ${c(7).sub}; 10th cusp (career) — ${c(10).sub}; 11th cusp (gains) — ${c(11).sub}.`,
  ];
  if (mahadasha) {
    const houses = housesSignified(kp)[mahadasha] ?? [];
    if (houses.length) {
      const areas = houses.slice(0, 4).map(h => HOUSE_TOPIC[h].split(',')[0].replace(/ and .*/, ''));
      const areaText = houses.length > 4 ? `${areas.join(', ')} and more` : areas.length > 1 ? `${areas.slice(0, -1).join(', ')} and ${areas[areas.length - 1]}` : areas[0];
      lines.push(`Your current Mahadasha lord, ${planetLabel(mahadasha)}, is a significator of houses ${houses.join(', ')} — in KP terms this period tends to bring forward ${areaText}.`);
    }
  }
  return lines;
}

// ── Jaimini ─────────────────────────────────────────────────────────────────────
/** Role of each karaka (Jaimini Sutras / BPHS ch. 32; plain wording after jagannathhora.com's karaka guide, opened 29 Oct 2026). */
export const KARAKA_META: Record<KarakaCode, { name: string; role: string }> = {
  AK: { name: 'Atmakaraka', role: 'you yourself — the soul planet, the theme your life keeps returning to' },
  AmK: { name: 'Amatyakaraka', role: 'career, livelihood and the working mind' },
  BK: { name: 'Bhratrikaraka', role: 'siblings, courage and mentors' },
  MK: { name: 'Matrikaraka', role: 'mother, home and emotional grounding' },
  PK: { name: 'Putrakaraka', role: 'children, students and creative work' },
  GK: { name: 'Gnatikaraka', role: 'rivals, debts and obstacles that build resilience' },
  DK: { name: 'Darakaraka', role: 'spouse and close partnerships' },
};
/** Natural significations of the seven planets (as in the Kundali interpretation, kundaliService PLANET_KARAKA). */
export const PLANET_THEME: Record<string, string> = {
  Sun: 'confidence, authority and purpose', Moon: 'feelings, care and the mind', Mars: 'energy, courage and drive',
  Mercury: 'learning, speech and skill', Jupiter: 'wisdom, guidance and growth', Venus: 'love, beauty and harmony',
  Saturn: 'patience, duty and hard-won mastery',
};

export function jaiminiHeadline(j: JaiminiResult): string {
  const ak = j.karakas[0], amk = j.karakas[1], dk = j.karakas[6];
  return `Your Atmakaraka (soul planet) is ${planetLabel(ak.planet)}: Jaimini astrology reads ${PLANET_THEME[ak.planet]} as the thread running through your life. `
    + `${planetLabel(amk.planet, true)} as Amatyakaraka colours your work, and ${planetLabel(dk.planet)} as Darakaraka describes what you seek in a partner.`;
}

export function karakamshaLine(j: JaiminiResult): string {
  return `Your Karakamsha is ${signName(j.karakamshaSignIndex)} — the sign your soul planet (${planetLabel(j.karakas[0].planet)}) occupies in the Navamsa (D9). Jaimini astrologers treat it as a second Lagna for reading your deeper calling; the 12th sign from it (${SIGN_EN[(j.karakamshaSignIndex + 11) % 12]}) is traditionally read for spiritual inclination.`;
}

/** The running Chara Dasha period for a date, or null outside the first cycle. */
export function currentCharaPeriod(j: JaiminiResult, now: Date) {
  const t = now.getTime();
  return j.charaDasha.find(p => t >= Date.parse(p.start) && t < Date.parse(p.end)) ?? null;
}

export function charaHouseFromLagna(signIndex: number, lagnaSignIndex: number) {
  return ((signIndex - lagnaSignIndex + 12) % 12) + 1;
}
