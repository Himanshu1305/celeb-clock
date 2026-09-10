/**
 * Classical Yoga detection engine (Part G.1-2). Detects named planetary
 * combinations from the already-validated chart (Part B) and GRADES each — a
 * formation condition being met does NOT mean the Yoga "delivers" at full
 * strength (delivery depends on planetary strength, house significance, Navamsa
 * confirmation, Dasha timing). Grading is required, not optional.
 *
 * Verified against multiple independent sources (see docs/part-g-touchpoints.md and
 * the Part G commit message). Genuine source disagreements are documented inline
 * and resolved either by majority or, if split, by the MORE CONSERVATIVE rule.
 *
 * Grade ladder: none < partial < moderate < strong < full. present = grade!=='none'.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { RASHI_NAMES } from './engine/vedicEngine';
import { SIGN_LORDS, OWN_SIGNS } from './engine/sthanaBala';

export type YogaGrade = 'none' | 'partial' | 'moderate' | 'strong' | 'full';

export interface YogaResult {
  name: string;
  present: boolean;
  grade: YogaGrade;
  summary: string;           // one line: what it is / what it promises
  conditions: string[];      // reasoning shown — met and not-met, for transparency
  planets: string[];
  houses: number[];
  note?: string;             // caveats (e.g. commonality), or documented judgment calls
}

// Exaltation sign index (0=Mesha). Debilitation = +6 (opposite).
const EXALT_SIGN: Record<string, number> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const DEBIL_SIGN: Record<string, number> = Object.fromEntries(Object.entries(EXALT_SIGN).map(([p, s]) => [p, (s + 6) % 12]));
const CLASSICAL = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const KENDRAS = [1, 4, 7, 10];
const TRIKONAS = [1, 5, 9];

// Special graha aspects (in houses counted forward, inclusive). All planets aspect 7.
const SPECIAL_ASPECTS: Record<string, number[]> = { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10] };
function aspectHouses(planet: string): number[] { return SPECIAL_ASPECTS[planet] || [7]; }

interface P { name: string; signIdx: number; house: number; navamsaIdx: number; combust: boolean; retro: boolean; shadbala?: number; }

function buildContext(chart: BirthChartResult) {
  const byName: Record<string, P> = {};
  for (const p of chart.planets) {
    byName[p.name] = {
      name: p.name, signIdx: p.signIndex - 1, house: p.house,
      navamsaIdx: Math.max(0, RASHI_NAMES.indexOf(p.navamsaSign)),
      combust: !!p.combust, retro: p.retrograde, shadbala: chart.shadbala?.[p.name]?.total,
    };
  }
  const lagnaIdx = chart.lagna.rashiIndex;
  const houseSignIdx = (h: number) => (lagnaIdx + (h - 1)) % 12;
  const houseLord = (h: number) => SIGN_LORDS[houseSignIdx(h)];
  // Which houses does a classical planet rule (for this Lagna)?
  const housesRuledBy = (planet: string) => [1,2,3,4,5,6,7,8,9,10,11,12].filter(h => houseLord(h) === planet);
  // Aspect: does A aspect B? (sign distance A→B, in houses, is in A's aspect set)
  const aspects = (a: P, b: P) => aspectHouses(a.name).includes(((b.signIdx - a.signIdx + 12) % 12) + 1);
  const mutualAspect = (a: P, b: P) => a.name !== b.name && aspects(a, b) && aspects(b, a);
  const conjunct = (a: P, b: P) => a.name !== b.name && a.signIdx === b.signIdx;
  // Parivartana between two planets: each sits in a sign the other rules.
  const parivartana = (a: P, b: P) => a.name !== b.name && SIGN_LORDS[a.signIdx] === b.name && SIGN_LORDS[b.signIdx] === a.name;
  const associated = (a: P, b: P) => conjunct(a, b) || mutualAspect(a, b) || parivartana(a, b);
  const assocType = (a: P, b: P) => conjunct(a, b) ? 'conjunction' : parivartana(a, b) ? 'sign exchange (Parivartana)' : mutualAspect(a, b) ? 'mutual aspect' : 'none';
  const REQ: Record<string, number> = { Sun: 300, Moon: 360, Mars: 300, Mercury: 420, Jupiter: 390, Venus: 330, Saturn: 300 };
  const strongSb = (planet: string) => { const t = byName[planet]?.shadbala, r = REQ[planet]; return t != null && r != null ? t >= r : undefined; };
  const houseFromMoon = (p: P) => { const m = byName['Moon']; return ((p.signIdx - m.signIdx + 12) % 12) + 1; };
  const isDebil = (planet: string) => byName[planet] != null && byName[planet].signIdx === DEBIL_SIGN[planet];
  return { byName, lagnaIdx, houseSignIdx, houseLord, housesRuledBy, aspects, mutualAspect, conjunct, parivartana, associated, assocType, strongSb, houseFromMoon, isDebil };
}

function ord(n: number): string { const s = ['th','st','nd','rd'], v = n % 100; return n + (s[(v-20)%10] || s[v] || s[0]); }

// ── 1.1 Raj Yoga + Yogakaraka ────────────────────────────────────────────────
function detectRajYoga(ctx: ReturnType<typeof buildContext>): YogaResult {
  const conditions: string[] = [];
  const planetsInvolved = new Set<string>();
  const houses = new Set<number>();

  // Yogakaraka: a planet ruling BOTH a kendra (4/7/10) AND a trikona (5/9).
  const yogakarakas = CLASSICAL.filter(pl => {
    const rules = ctx.housesRuledBy(pl);
    return rules.some(h => [4,7,10].includes(h)) && rules.some(h => [5,9].includes(h));
  });
  for (const yk of yogakarakas) {
    const rules = ctx.housesRuledBy(yk);
    conditions.push(`✓ ${yk} is a Yogakaraka — it rules both a Kendra and a Trikona (houses ${rules.join(', ')}) for this Lagna`);
    planetsInvolved.add(yk); ctx.housesRuledBy(yk).forEach(h => houses.add(h));
  }

  // General Raj Yoga: a Kendra lord and a (different) Trikona lord in association.
  const kendraLords = [...new Set(KENDRAS.map(ctx.houseLord))];
  const trikonaLords = [...new Set(TRIKONAS.map(ctx.houseLord))];
  const seen = new Set<string>();
  for (const kl of kendraLords) for (const tl of trikonaLords) {
    if (kl === tl) continue;
    const a = ctx.byName[kl], b = ctx.byName[tl];
    if (!a || !b || !ctx.associated(a, b)) continue;
    const key = [kl, tl].sort().join('-'); if (seen.has(key)) continue; seen.add(key);
    conditions.push(`✓ Kendra lord ${kl} and Trikona lord ${tl} are in ${ctx.assocType(a, b)}`);
    planetsInvolved.add(kl); planetsInvolved.add(tl);
  }

  const present = planetsInvolved.size > 0;
  // Grade: yogakaraka present (esp. strong) → strong/full; associations only → moderate; single weak → partial.
  let grade: YogaGrade = 'none';
  if (present) {
    const anyStrong = [...planetsInvolved].some(p => ctx.strongSb(p) === true);
    const involvesBest = [...planetsInvolved].some(p => ctx.housesRuledBy(p).some(h => [9,10].includes(h)));
    if (yogakarakas.length && anyStrong) grade = 'full';
    else if (yogakarakas.length || (conditions.length >= 2 && involvesBest)) grade = 'strong';
    else if (conditions.length >= 1 && involvesBest) grade = 'moderate';
    else grade = 'partial';
    // Delivery tempering: a DEBILITATED Yogakaraka (or all involved planets weak)
    // cannot deliver at full strength, even if the formation is textbook.
    const ykDebil = yogakarakas.filter(yk => ctx.isDebil(yk));
    if (ykDebil.length && grade === 'full') {
      grade = 'strong';
      conditions.push(`⚠ the Yogakaraka ${ykDebil.join('/')} is itself debilitated — this tempers delivery (check any Neecha Bhanga on it)`);
    }
  } else conditions.push('✗ No Kendra-lord / Trikona-lord association and no Yogakaraka');

  return {
    name: 'Raj Yoga', present, grade,
    summary: 'Authority, recognition and rise in status — a Kendra (angle) power joining a Trikona (fortune) power.',
    conditions, planets: [...planetsInvolved], houses: [...houses].sort((x,y)=>x-y),
    note: yogakarakas.length ? `Yogakaraka(s): ${yogakarakas.join(', ')} (a built-in, especially strong Raj Yoga).` : undefined,
  };
}

// ── 1.2 Dhana Yoga (wealth) ──────────────────────────────────────────────────
function detectDhanaYoga(ctx: ReturnType<typeof buildContext>): YogaResult {
  // Parasari: wealth houses 2,5,9,11 (2+11 core "earning/gains"; 5+9 "abodes of
  // Lakshmi" strengthen). Documented choice: implement all four, grade by count of
  // participating wealth-lords; 2+11 is the conservative minimum.
  const wealthHouses = [2, 5, 9, 11];
  const lords = new Map<string, number[]>();
  for (const h of wealthHouses) { const l = ctx.houseLord(h); if (!lords.has(l)) lords.set(l, []); lords.get(l)!.push(h); }
  const conditions: string[] = [];
  const participants = new Set<string>();
  const lordList = [...lords.keys()];
  for (let i = 0; i < lordList.length; i++) for (let j = i + 1; j < lordList.length; j++) {
    const a = ctx.byName[lordList[i]], b = ctx.byName[lordList[j]];
    if (a && b && ctx.associated(a, b)) {
      conditions.push(`✓ Wealth lord ${lordList[i]} (of ${lords.get(lordList[i])!.map(ord).join('/')}) and ${lordList[j]} (of ${lords.get(lordList[j])!.map(ord).join('/')}) are in ${ctx.assocType(a, b)}`);
      participants.add(lordList[i]); participants.add(lordList[j]);
    }
  }
  const present = participants.size > 0;
  const core211 = participants.size ? [...participants].some(p => lords.get(p)!.some(h => h===2)) && [...participants].some(p => lords.get(p)!.some(h => h===11)) : false;
  let grade: YogaGrade = 'none';
  if (present) grade = participants.size >= 4 ? 'full' : participants.size === 3 ? 'strong' : core211 ? 'moderate' : 'partial';
  // Delivery tempering: debilitated wealth-lords weaken the promise.
  const debilParts = [...participants].filter(p => ctx.isDebil(p));
  if (debilParts.length) {
    conditions.push(`⚠ wealth lord(s) ${debilParts.join('/')} debilitated — tempers delivery (check for Neecha Bhanga)`);
    if (grade === 'full') grade = 'strong'; else if (grade === 'strong') grade = 'moderate';
  }
  if (!present) conditions.push('✗ No association among the wealth-house lords (2nd/5th/9th/11th)');
  return {
    name: 'Dhana Yoga', present, grade,
    summary: 'Wealth and financial gain — a linking of the houses of earning, savings, fortune and gains.',
    conditions, planets: [...participants], houses: [...new Set([...participants].flatMap(p => lords.get(p)!))].sort((a,b)=>a-b),
    note: 'Graded by how many wealth-lords participate (more = stronger classical Dhana Yoga).',
  };
}

// ── 1.3 Gaja Kesari ──────────────────────────────────────────────────────────
function detectGajaKesari(ctx: ReturnType<typeof buildContext>): YogaResult {
  const jup = ctx.byName['Jupiter'], moon = ctx.byName['Moon'];
  if (!jup || !moon) return { name: 'Gaja Kesari Yoga', present: false, grade: 'none', summary: 'Wisdom, good reputation and respect.', conditions: ['✗ Jupiter or Moon not available'], planets: [], houses: [] };
  const hFromMoon = ctx.houseFromMoon(jup);
  const formed = KENDRAS.includes(hFromMoon);
  const conditions: string[] = [];
  if (formed) conditions.push(`✓ Jupiter is in a Kendra (${ord(hFromMoon)}) from the Moon`);
  else conditions.push(`✗ Jupiter is in the ${ord(hFromMoon)} from the Moon (not a Kendra) — Gaja Kesari not formed`);
  if (!formed) return { name: 'Gaja Kesari Yoga', present: false, grade: 'none', summary: 'Wisdom, good reputation and respect.', conditions, planets: [], houses: [] };

  // Delivery: not combust/debilitated; both reasonably strong; connect to 9/10/11.
  const jupClean = !jup.combust && jup.signIdx !== DEBIL_SIGN['Jupiter'];
  const moonClean = !moon.combust && moon.signIdx !== DEBIL_SIGN['Moon'];
  conditions.push(jupClean ? '✓ Jupiter is not combust or debilitated' : '✗ Jupiter is combust or debilitated (weakens delivery)');
  conditions.push(moonClean ? '✓ Moon is not combust or debilitated' : '✗ Moon is combust or debilitated (weakens delivery)');
  const connect911 = [jup, moon].some(p => [9,10,11].includes(p.house)) || [jup.name, moon.name].some(pl => ctx.housesRuledBy(pl).some(h => [9,10,11].includes(h)));
  conditions.push(connect911 ? '✓ Jupiter/Moon connect to a house of fortune/career/gains (9/10/11)' : '✗ Jupiter/Moon do not strongly connect to houses 9/10/11');
  const strong = ctx.strongSb('Jupiter') && ctx.strongSb('Moon');
  if (strong != null) conditions.push(strong ? '✓ Both Jupiter and Moon carry good indicative Shadbala strength' : '✗ Jupiter and/or Moon are not indicatively strong');

  let grade: YogaGrade = 'partial';
  const deliveryPoints = [jupClean, moonClean, connect911, strong === true].filter(Boolean).length;
  if (jupClean && moonClean && deliveryPoints >= 3) grade = 'strong';
  else if (jupClean && moonClean && deliveryPoints >= 2) grade = 'moderate';
  return {
    name: 'Gaja Kesari Yoga', present: true, grade,
    summary: 'Wisdom, lasting good reputation, respect and sound judgement.',
    conditions, planets: ['Jupiter', 'Moon'], houses: [jup.house, moon.house],
    note: 'Gaja Kesari is COMMON (Jupiter falls in a Kendra from the Moon in ~20-33% of charts), so basic formation alone is not remarkable — the grade reflects the real delivery conditions. Peak activation runs in Jupiter/Moon (or Moon/Jupiter) Dasha-Bhukti.',
  };
}

// ── 1.4 Pancha Mahapurusha Yogas (5) ─────────────────────────────────────────
const MAHAPURUSHA: Record<string, string> = { Mars: 'Ruchaka', Mercury: 'Bhadra', Jupiter: 'Hamsa', Venus: 'Malavya', Saturn: 'Sasa' };
const MAHAPURUSHA_GIVES: Record<string, string> = {
  Ruchaka: 'courage, command, leadership and physical vigour',
  Bhadra: 'sharp intelligence, eloquence and learning',
  Hamsa: 'wisdom, faith, integrity and a respected character',
  Malavya: 'grace, refinement, comfort and artistic taste',
  Sasa: 'discipline, endurance and earned authority',
};
function detectMahapurusha(ctx: ReturnType<typeof buildContext>): YogaResult[] {
  return Object.entries(MAHAPURUSHA).map(([planet, yoga]) => {
    const p = ctx.byName[planet];
    if (!p) return { name: `${yoga} Yoga (Pancha Mahapurusha)`, present: false, grade: 'none' as YogaGrade, summary: MAHAPURUSHA_GIVES[yoga], conditions: [`✗ ${planet} not available`], planets: [], houses: [] };
    const own = OWN_SIGNS[planet].includes(p.signIdx);
    const exalted = p.signIdx === EXALT_SIGN[planet];
    const inKendra = KENDRAS.includes(p.house); // from LAGNA (see note re: minority "or Moon" view)
    const dignified = own || exalted;
    const present = dignified && inKendra;
    const conditions = [
      dignified ? `✓ ${planet} is ${exalted ? 'exalted' : 'in its own sign'} (${RASHI_NAMES[p.signIdx]})` : `✗ ${planet} is neither exalted nor in its own sign (it is in ${RASHI_NAMES[p.signIdx]})`,
      inKendra ? `✓ ${planet} is in a Kendra (${ord(p.house)} house) from the Lagna` : `✗ ${planet} is in the ${ord(p.house)} house (not a Kendra from the Lagna)`,
    ];
    let grade: YogaGrade = 'none';
    if (present) {
      const strong = ctx.strongSb(planet);
      grade = exalted && strong === true ? 'full' : exalted || strong === true ? 'strong' : 'moderate';
    }
    return {
      name: `${yoga} Yoga (Pancha Mahapurusha)`, present, grade,
      summary: `${MAHAPURUSHA_GIVES[yoga]} — from a strong, dignified ${planet} in an angle.`,
      conditions, planets: [planet], houses: [p.house],
    } as YogaResult;
  });
}

// ── 1.5 Neecha Bhanga Raja Yoga (graded, per debilitated planet) ─────────────
function detectNeechaBhanga(ctx: ReturnType<typeof buildContext>): YogaResult[] {
  const out: YogaResult[] = [];
  const moon = ctx.byName['Moon'];
  for (const planet of CLASSICAL) {
    const p = ctx.byName[planet];
    if (!p || !moon || p.signIdx !== DEBIL_SIGN[planet]) continue; // only debilitated planets
    const dispositor = SIGN_LORDS[p.signIdx];            // lord of the debilitation sign
    const exaltLord = SIGN_LORDS[EXALT_SIGN[planet]];    // lord of the sign where planet is exalted
    const disp = ctx.byName[dispositor], exL = ctx.byName[exaltLord];
    const kendraFromLagna = (x: P) => KENDRAS.includes(x.house);
    const kendraFromMoon = (x: P) => KENDRAS.includes(((x.signIdx - moon.signIdx + 12) % 12) + 1);
    const conditions: string[] = [];
    let count = 0;
    const add = (ok: boolean, met: string, notmet: string) => { if (ok) { count++; conditions.push('✓ ' + met); } else conditions.push('✗ ' + notmet); };

    add(disp && (kendraFromLagna(disp) || kendraFromMoon(disp)), `dispositor ${dispositor} is in a Kendra from Lagna or Moon`, `dispositor ${dispositor} is not in a Kendra from Lagna or Moon`);
    add(exL && (kendraFromLagna(exL) || kendraFromMoon(exL)), `exaltation-lord ${exaltLord} is in a Kendra from Lagna or Moon`, `exaltation-lord ${exaltLord} is not in a Kendra from Lagna or Moon`);
    add(kendraFromLagna(p), `the debilitated ${planet} is itself in a Kendra`, `the debilitated ${planet} is not in a Kendra`);
    add(disp && (ctx.conjunct(p, disp) || ctx.mutualAspect(p, disp)), `${planet} is conjunct or in mutual aspect with its dispositor ${dispositor}`, `${planet} is not conjunct/aspected by its dispositor ${dispositor}`);
    add(disp && ctx.parivartana(p, disp), `sign exchange (Parivartana) between ${planet} and ${dispositor}`, `no sign exchange between ${planet} and ${dispositor}`);

    // Condition 6 — Navamsa cross-check (commonly, wrongly skipped): still debilitated in D9 negates.
    const debilInNavamsa = p.navamsaIdx === DEBIL_SIGN[planet];
    conditions.push(debilInNavamsa ? `⚠ ${planet} is ALSO debilitated in the Navamsa (D9) — this negates/severely weakens the cancellation` : `✓ ${planet} is not debilitated in the Navamsa (D9)`);
    // Condition 7 — is the cancelling planet itself weak/debilitated?
    const canceller = disp || exL;
    const cancellerWeak = canceller ? (canceller.signIdx === DEBIL_SIGN[canceller.name] || ctx.strongSb(canceller.name) === false) : true;
    if (count > 0) conditions.push(cancellerWeak ? `⚠ the cancelling planet (${canceller?.name}) is itself weak/debilitated — the correction carries little force` : `✓ the cancelling planet (${canceller?.name}) is itself reasonably strong`);

    // Grade per research tiers, honouring the negations.
    let grade: YogaGrade;
    if (count === 0) grade = 'none';
    else if (debilInNavamsa) grade = 'partial';       // negated by D9 regardless of Rashi conditions
    else if (count >= 4 && !cancellerWeak) grade = 'full';
    else if (count >= 2) grade = cancellerWeak ? 'moderate' : 'strong';
    else grade = 'partial';                            // 1 condition = weak/partial

    out.push({
      name: `Neecha Bhanga Raja Yoga (${planet})`, present: grade !== 'none', grade,
      summary: `A debilitated ${planet} whose weakness is (partly or fully) cancelled — difficulty turned into strength.`,
      conditions: [`${planet} is debilitated in ${RASHI_NAMES[p.signIdx]}. Conditions met: ${count}.`, ...conditions],
      planets: [planet, dispositor], houses: [p.house],
      note: 'Cancellation is GRADED (sources disagree whether one condition suffices; resolved by grading: 1=weak/partial, 2-3=strong, 4+=full — the conservative, transparent choice). The Navamsa cross-check (condition 6) is included because most readings wrongly skip it.',
    });
  }
  return out;
}

// ── 1.6 Budha-Aditya ─────────────────────────────────────────────────────────
function detectBudhaAditya(ctx: ReturnType<typeof buildContext>): YogaResult {
  const sun = ctx.byName['Sun'], merc = ctx.byName['Mercury'];
  if (!sun || !merc) return { name: 'Budha-Aditya Yoga', present: false, grade: 'none', summary: 'Intelligence and communication.', conditions: ['✗ Sun or Mercury not available'], planets: [], houses: [] };
  const present = sun.signIdx === merc.signIdx;
  const conditions = [present ? `✓ Sun and Mercury are together in ${RASHI_NAMES[sun.signIdx]} (${ord(sun.house)} house)` : '✗ Sun and Mercury are not in the same sign'];
  let grade: YogaGrade = 'none';
  if (present) {
    conditions.push(merc.combust ? '✗ Mercury is combust (too close to the Sun) — this dims the intellectual brightness the Yoga promises' : '✓ Mercury is not combust — its brightness is retained');
    grade = merc.combust ? 'partial' : 'moderate';
  }
  return {
    name: 'Budha-Aditya Yoga', present, grade,
    summary: 'Intelligence, clear thinking and communication skill.',
    conditions, planets: present ? ['Sun', 'Mercury'] : [], houses: present ? [sun.house] : [],
    note: 'Sun–Mercury conjunction is geometrically COMMON (Mercury is never more than ~28° from the Sun), so its presence alone is unremarkable; combustion — which this engine already computes — typically weakens it.',
  };
}

// ── 1.7 Chandra-Mangal ───────────────────────────────────────────────────────
function detectChandraMangal(ctx: ReturnType<typeof buildContext>): YogaResult {
  const moon = ctx.byName['Moon'], mars = ctx.byName['Mars'];
  if (!moon || !mars) return { name: 'Chandra-Mangal Yoga', present: false, grade: 'none', summary: 'Wealth through bold action.', conditions: ['✗ Moon or Mars not available'], planets: [], houses: [] };
  const conj = ctx.conjunct(moon, mars), asp = ctx.mutualAspect(moon, mars);
  const present = conj || asp;
  const conditions = [present ? `✓ Moon and Mars are in ${conj ? 'conjunction' : 'mutual aspect'}` : '✗ Moon and Mars are neither conjunct nor in mutual aspect'];
  return {
    name: 'Chandra-Mangal Yoga', present, grade: present ? (conj ? 'moderate' : 'partial') : 'none',
    summary: 'Wealth through bold, decisive action and business acumen.',
    conditions, planets: present ? ['Moon', 'Mars'] : [], houses: present ? [moon.house] : [],
  };
}

/** Detect all Yogas. Returns PRESENT yogas (with grade + reasoning). */
export function detectYogas(chart: BirthChartResult): YogaResult[] {
  const ctx = buildContext(chart);
  const all: YogaResult[] = [
    detectRajYoga(ctx),
    detectDhanaYoga(ctx),
    detectGajaKesari(ctx),
    ...detectMahapurusha(ctx),
    ...detectNeechaBhanga(ctx),
    detectBudhaAditya(ctx),
    detectChandraMangal(ctx),
  ];
  return all.filter(y => y.present);
}

/** Detect all Yogas INCLUDING absent ones (for the accuracy checker / advanced view / tests). */
export function detectAllYogas(chart: BirthChartResult): YogaResult[] {
  const ctx = buildContext(chart);
  // For Mahapurusha and Neecha Bhanga, absent ones are omitted by their detectors;
  // re-run the fixed-name ones so callers can see explicit not-present too.
  return [
    detectRajYoga(ctx), detectDhanaYoga(ctx), detectGajaKesari(ctx),
    ...detectMahapurusha(ctx), ...detectNeechaBhanga(ctx),
    detectBudhaAditya(ctx), detectChandraMangal(ctx),
  ];
}
