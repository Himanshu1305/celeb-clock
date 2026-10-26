/**
 * The sixteen Parashari divisional charts (Shodashvarga) — what each is read for, in one
 * plain line, with its classical source. Used by the Kundali's "Divisional charts" section.
 *
 * Sources (all opened 25 Oct 2026):
 *  - What each varga shows: Brihat Parashara Hora Shastra (BPHS) ch. 7 "Divisional
 *    Considerations" — "The physique from Lagna, wealth from Hora, happiness through co-born
 *    from Drekkana, fortunes from Chaturthamsha, sons and grandsons from Saptamsha, spouse from
 *    Navamsha, power (and position) from Dashamsha, parents from Dwadashamsha, benefits and
 *    adversities through conveyances from Shodashamsha, worship from Vimshamsha, learning from
 *    Chaturvimshamsha, strength and weakness from Saptavimshamsha, evil effects from
 *    Trimshamsha, auspicious and inauspicious effects from Khavedamsha, all indications from
 *    both Akshavedamsha and Shashtyamsha" — archive.org/stream/ParasharaHoraSastra
 *    (BrihatParasharaHoraSastraVedicAstrologyEbook_djvu.txt). Verse numbers follow the Sanskrit
 *    at enjoylearningsanskrit.com/scriptures/parashara/chapter-7/verse-1 … verse-6.
 *  - How each varga is built: BPHS ch. 6 (same archive.org text), verse ranges below.
 *  - "Often read for …" add-ons (D4 property, D9 dharma, D45 character, D60 past karma) are the
 *    modern reading summarised at en.wikipedia.org/wiki/Varga_(astrology); they are labelled as
 *    "often read for", not as Parashara's words.
 */
export interface ShodashvargaMeta {
  key: string;            // 'D9'
  name: string;           // 'Navamsha'
  meaning: string;        // one plain line
  /** Classical source shown under the chart. */
  source: string;
  /** Explainer page, when one exists. */
  slug?: string;
  /** D27 and above: a small birth-time error can change the chart. */
  needsExactTime: boolean;
}

export const SHODASHVARGA_META: ShodashvargaMeta[] = [
  { key: 'D1', name: 'Rashi', meaning: 'Your main chart — you as a person, your body and your life as a whole.', source: 'BPHS 7.1 (physique from the Lagna chart)', slug: 'd1-rashi', needsExactTime: false },
  { key: 'D2', name: 'Hora', meaning: 'Wealth — earning, saving and resources.', source: 'BPHS 6.5–6.6 (Parashari Hora) · 7.1 (wealth)', slug: 'd2-hora', needsExactTime: false },
  { key: 'D3', name: 'Drekkana', meaning: 'Brothers and sisters, and the happiness that comes through them.', source: 'BPHS 6.7–6.8 (Parashari Drekkana) · 7.2 (co-born)', slug: 'd3-drekkana', needsExactTime: false },
  { key: 'D4', name: 'Chaturthamsha', meaning: 'Fortune and luck (often read for home and property).', source: 'BPHS 6.9 · 7.2 (fortune)', slug: 'd4-chaturthamsha', needsExactTime: false },
  { key: 'D7', name: 'Saptamsha', meaning: 'Children and grandchildren.', source: 'BPHS 6.10–6.11 · 7.2 (sons and grandsons)', slug: 'd7-saptamsha', needsExactTime: false },
  { key: 'D9', name: 'Navamsha', meaning: 'Marriage and spouse (often also read for dharma and each planet’s inner strength).', source: 'BPHS 6.12 · 7.3 (spouse)', slug: 'd9-navamsa', needsExactTime: false },
  { key: 'D10', name: 'Dashamsha', meaning: 'Career — power, position and achievement in public life.', source: 'BPHS 6.13–6.14 · 7.3 (power and position)', slug: 'd10-dasamsa', needsExactTime: false },
  { key: 'D12', name: 'Dwadashamsha', meaning: 'Parents.', source: 'BPHS 6.15 · 7.3 (parents)', slug: 'd12-dwadashamsha', needsExactTime: false },
  { key: 'D16', name: 'Shodashamsha', meaning: 'Vehicles and comforts — the ease and the troubles that come with them.', source: 'BPHS 6.16 · 7.3–7.4 (conveyances, happiness and unhappiness)', slug: 'd16-shodashamsha', needsExactTime: false },
  { key: 'D20', name: 'Vimshamsha', meaning: 'Worship and spiritual practice.', source: 'BPHS 6.17–6.21 · 7.4 (worship)', slug: 'd20-vimshamsha', needsExactTime: false },
  { key: 'D24', name: 'Chaturvimshamsha', meaning: 'Learning and education.', source: 'BPHS 6.22–6.23 · 7.5 (learning)', slug: 'd24-chaturvimshamsha', needsExactTime: false },
  { key: 'D27', name: 'Saptavimshamsha (Bhamsha)', meaning: 'Strengths and weaknesses.', source: 'BPHS 6.24–6.26 · 7.5 (strength and weakness)', slug: 'd27-bhamsha', needsExactTime: true },
  { key: 'D30', name: 'Trimshamsha', meaning: 'Life’s tests — the areas that ask for extra care and effort.', source: 'BPHS 6.27–6.28 · 7.5 (difficulties)', slug: 'd30-trimshamsha', needsExactTime: true },
  { key: 'D40', name: 'Khavedamsha', meaning: 'The overall good and not-so-good tendencies in life.', source: 'BPHS 6.29–6.30 · 7.5 (auspicious and inauspicious effects)', needsExactTime: true },
  { key: 'D45', name: 'Akshavedamsha', meaning: 'All general matters (often read for character and conduct).', source: 'BPHS 6.31–6.32 · 7.6 (all indications)', needsExactTime: true },
  { key: 'D60', name: 'Shashtyamsha', meaning: 'All matters, in the finest detail (often linked to past karma).', source: 'BPHS 6.33–6.41 · 7.6 (all indications)', slug: 'd60-shashtiamsha', needsExactTime: true },
];

/** Glossary term id per varga (TermTip). */
export const VARGA_TERM: Record<string, string> = {
  D1: 'd1', D2: 'horaChart', D3: 'drekkana', D4: 'chaturthamsha', D7: 'saptamsha', D9: 'navamsa', D10: 'dasamsa', D12: 'dwadashamsha',
  D16: 'shodashamsha', D20: 'vimshamsha', D24: 'chaturvimshamsha', D27: 'bhamsha', D30: 'trimshamsha', D40: 'khavedamsha', D45: 'akshavedamsha', D60: 'shashtiamsa',
};

export const D60_NOTE =
  'The Shashtyamsha (D60) is calculated using one of several classical traditions (BPHS’s “degrees × 2” method); other schools compute it differently, so treat it as one interpretation rather than a settled result.';
