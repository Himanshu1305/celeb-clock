/**
 * Client-side Kundali service. The heavy sidereal computation runs server-side
 * (`/api/kundali`, Node + astronomy-engine, Lahiri sidereal); this wrapper fetches it
 * and builds a plain-language interpretation. ProKerala is a fallback only.
 */
import { NAKSHATRA_MEANINGS } from '@/lib/vedic/nakshatraMeanings';
import { glossInline } from '@/lib/vedic/termDefinitions';

export interface KundaliPlanet { name: string; sign: string; signIndex: number; house: number; longitude: number; retrograde: boolean }
export interface KundaliData {
  lagna: { sign: string; signIndex: number; degrees: number };
  planets: KundaliPlanet[];
  nakshatra: { nakshatra: string; nakshatra_devanagari: string; pada: number; confidence: string; is_boundary: boolean };
  rashi: string | null;
  rashi_devanagari: string | null;
  dasha: { mahadasha: string; antardasha: string } | null;
  /** Full-lifetime Vimshottari timeline (Maha level + nested Antar), from the engine.
   *  Used by DashaDeepDive to compute the deeper levels (Pratyantar/Sookshma/Prana) on demand. */
  dashaTimeline?: Array<{ lord: string; start: string; end: string; antardashas?: Array<{ lord: string; start: string; end: string }> }>;
  requires_birth_time: boolean;
}

export const hasProkeralaKey = (): boolean =>
  !!(import.meta as any)?.env?.VITE_PROKERALA_CLIENT_ID && !!(import.meta as any)?.env?.VITE_PROKERALA_CLIENT_SECRET;

export async function fetchKundali(
  dob: string, time: string, loc: { lat: number; lon: number; tz: number }
): Promise<KundaliData> {
  const [y, m, d] = dob.split('-');
  const [h, min] = time.split(':');
  const params = new URLSearchParams({ y, m, d, h, min, lat: String(loc.lat), lon: String(loc.lon), tz: String(loc.tz) });
  const res = await fetch(`/api/kundali?${params.toString()}`);
  if (!res.ok) throw new Error('Kundali service unavailable');
  const data = await res.json();
  if (!data?.lagna?.sign) throw new Error('Incomplete Kundali data');
  return data as KundaliData;
}

// ── Canonical reference layers (Part O Item 1.1) ─────────────────────────────
// These are standard classical definitions — the "what it is / why it matters"
// dimensions the four-dimension structure needs. Every PERSON-SPECIFIC statement
// below stays tied to the real computed placement; only these general definitions
// are reference data. Sign names are the engine's Sanskrit Rashi names.
const SIGN_NATURE: Record<string, { element: string; mode: string; gist: string }> = {
  Mesha:     { element: 'fire',  mode: 'cardinal', gist: 'initiating, direct and energetic' },
  Vrishabha: { element: 'earth', mode: 'fixed',    gist: 'steady, sensual and security-seeking' },
  Mithuna:   { element: 'air',   mode: 'dual',     gist: 'curious, communicative and adaptable' },
  Karka:     { element: 'water', mode: 'cardinal', gist: 'nurturing, protective and emotionally attuned' },
  Simha:     { element: 'fire',  mode: 'fixed',    gist: 'warm, expressive and naturally leading' },
  Kanya:     { element: 'earth', mode: 'dual',     gist: 'analytical, precise and service-minded' },
  Tula:      { element: 'air',   mode: 'cardinal', gist: 'relational, fair-minded and harmony-seeking' },
  Vrischika: { element: 'water', mode: 'fixed',    gist: 'intense, private and deeply transformative' },
  Dhanu:     { element: 'fire',  mode: 'dual',     gist: 'philosophical, optimistic and freedom-loving' },
  Makara:    { element: 'earth', mode: 'cardinal', gist: 'disciplined, ambitious and enduring' },
  Kumbha:    { element: 'air',   mode: 'fixed',    gist: 'independent, humanitarian and unconventional' },
  Meena:     { element: 'water', mode: 'dual',     gist: 'compassionate, imaginative and boundary-dissolving' },
};
const HOUSE_THEME: Record<number, string> = {
  1: 'the self, body and life direction', 2: 'wealth, speech and family values',
  3: 'courage, effort and siblings', 4: 'home, mother and inner emotional security',
  5: 'creativity, intellect and children', 6: 'health, daily work and overcoming obstacles',
  7: 'partnership, marriage and one-to-one relationships', 8: 'depth, transformation and shared resources',
  9: 'fortune, higher learning and life philosophy', 10: 'career, status and public standing',
  11: 'gains, goals and networks', 12: 'retreat, letting-go and the inner/spiritual life',
};
const PLANET_KARAKA: Record<string, string> = {
  Sun: 'vitality, core identity and authority', Moon: 'the mind, emotions and instinct',
  Mars: 'energy, drive and courage', Mercury: 'intellect, communication and commerce',
  Jupiter: 'wisdom, growth, fortune and guidance', Venus: 'love, comfort, art and relationships',
  Saturn: 'discipline, patience, responsibility and time', Rahu: 'ambition and worldly desire',
  Ketu: 'detachment, insight and spiritual release',
};

export interface InterpretationBlock { title: string; body: string }

/**
 * Deterministic "Your chart, interpreted" summary (Part O Item 1.1). Each concept is
 * explained across four dimensions — WHAT it is, WHY it matters, what it means for
 * THIS chart (real computed placement), and HOW it connects to another placement —
 * rather than a single naming sentence. 100% deterministic, so accuracy is guaranteed
 * by construction. Reuses Part G's Nakshatra meanings for the birth-star depth.
 */
export function buildInterpretationBlocks(k: KundaliData): InterpretationBlock[] {
  const blocks: InterpretationBlock[] = [];
  const an = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a') + ' ' + w; // "an air", "a fire"
  const moon = k.planets.find(p => p.name === 'Moon');
  const sun = k.planets.find(p => p.name === 'Sun');
  const lagNat = SIGN_NATURE[k.lagna.sign];
  const rashiNat = k.rashi ? SIGN_NATURE[k.rashi] : undefined;

  // 1) Lagna (rising sign) — and its connection to the Moon sign (outer vs inner self).
  blocks.push({
    title: `Lagna (rising sign): ${k.lagna.sign}`,
    body: `The Lagna is the sign that was rising on the eastern horizon at your birth; it governs your outward personality, physical presence and overall approach to life — the "you" the world meets first. Yours is ${k.lagna.sign}, ${lagNat ? `${an(lagNat.element)} sign of ${lagNat.mode} temperament, so your outer style tends to be ${lagNat.gist}` : 'which colours how you present yourself'}.${k.rashi ? ` Read this together with your Moon sign (${k.rashi}): the Lagna is your outer self and life-approach, while the Moon is your inner, emotional self — the two are meant to be read as a pair, and any contrast between them (${k.lagna.sign} outward, ${k.rashi} within) is part of your particular balance.` : ''}`,
  });

  // 2) Rashi + Nakshatra (the Moon) — reuse Part G nakshatra meanings.
  if (k.rashi) {
    const nak = k.nakshatra?.nakshatra ? NAKSHATRA_MEANINGS[k.nakshatra.nakshatra] : undefined;
    let body = `Your Moon sign (Rashi) is where the Moon sits, and it shapes your emotional nature, instincts and inner life — in Vedic astrology the Moon-sign matters at least as much as the Sun-sign. Yours is ${k.rashi}${rashiNat ? `, ${an(rashiNat.element)} sign that inclines your inner world to be ${rashiNat.gist}` : ''}.`;
    if (k.nakshatra?.nakshatra) {
      body += ` Within ${k.rashi}, the Moon occupies the ${k.nakshatra.nakshatra} Nakshatra (lunar mansion), pada ${k.nakshatra.pada}.`;
      if (nak) body += ` ${k.nakshatra.nakshatra}'s presiding deity is ${nak.deity} and its classical "shakti" (special power) is ${nak.shakti} — ${nak.meaning}`;
    }
    blocks.push({ title: `Moon sign & birth star: ${k.rashi}${k.nakshatra?.nakshatra ? ` · ${k.nakshatra.nakshatra}` : ''}`, body });
  }

  // 3) Sun placement — identity/vitality by house.
  if (sun) {
    blocks.push({
      title: `The Sun — house ${sun.house}`,
      body: `The Sun is the significator of ${PLANET_KARAKA.Sun}. In your chart it sits in house ${sun.house}${sun.sign ? ` (in ${sun.sign})` : ''}, which governs ${HOUSE_THEME[sun.house] || 'a specific area of life'} — so this is the arena where your core identity and vitality most naturally seek to express and be recognised.`,
    });
  }

  // 4) Moon placement by house — where you are emotionally invested.
  if (moon) {
    blocks.push({
      title: `The Moon — house ${moon.house}`,
      body: `Beyond its sign, the Moon's house placement shows where you invest emotionally. Yours falls in house ${moon.house}, the area of ${HOUSE_THEME[moon.house] || 'a specific part of life'} — this tends to be where your feelings, comfort and sense of belonging are most engaged.`,
    });
  }

  // 5) Dasha — the active period, with the WHY (which planet, what it governs).
  if (k.dasha?.mahadasha && k.dasha?.antardasha) {
    const mahaK = PLANET_KARAKA[k.dasha.mahadasha];
    const antarK = PLANET_KARAKA[k.dasha.antardasha];
    blocks.push({
      title: `Current period (Vimshottari Dasha): ${k.dasha.mahadasha} / ${k.dasha.antardasha}`,
      body: `The Vimshottari Dasha is the timing system that divides life into planetary periods, each colouring the chapter it rules. You are in your ${k.dasha.mahadasha} Mahadasha (the broad chapter)${mahaK ? `, so themes of ${mahaK} are the background current of this era of your life` : ''}, with a ${k.dasha.antardasha} Antardasha (the sub-chapter within it)${antarK ? ` bringing ${antarK} more sharply into focus right now` : ''}. What a period tends to bring follows from what its planet governs and where that planet sits in your chart.`,
    });
  }

  blocks.push({
    title: 'How to read this',
    body: `This is a computed sidereal (Lahiri ayanamsa) reading — ${glossInline('ayanamsa')}. These layers are meant to be read together — Lagna with Moon sign, planets with the houses they occupy, and all of it through the lens of your current Dasha. A full consultation would additionally weigh aspects, Yogas and the divisional charts shown in your personal reading below.`,
  });

  return blocks;
}

/** Back-compat: the flat single-string interpretation (kept for any string consumer). */
export function buildInterpretation(k: KundaliData): string {
  return buildInterpretationBlocks(k).map(b => b.body).join(' ');
}
