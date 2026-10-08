/**
 * Divisional (Varga) chart explainers — Growth P1 (content gap: D7/D4/D24).
 *
 * Each divisional chart (varga) subdivides a 30° sign into smaller parts and
 * re-maps planets, zooming into one area of life. These are descriptive
 * explainer pages. `computedByBornClock` is set ONLY for the vargas our Kundli
 * engine actually computes today (D1, D9, D10, D60) — the others are explained
 * conceptually and honestly labelled as not yet computed here, so we never
 * imply a calculation we don't ship.
 */
export interface VargaChart {
  slug: string;
  dNumber: number;          // the divisor (1, 9, 10, …)
  name: string;             // Sanskrit name
  label: string;            // "D9 (Navamsa)"
  lifeArea: string;         // the domain it zooms into
  whatItShows: string;
  howComputed: string;      // the subdivision rule, in brief
  howToRead: string;
  computedByBornClock: boolean;
}

export const VARGAS: VargaChart[] = [
  {
    slug: 'd1-rashi', dNumber: 1, name: 'Rashi', label: 'D1 (Rashi / Lagna chart)',
    lifeArea: 'the whole life — body, self and broad themes',
    whatItShows: 'The main birth chart: the sign and house of every planet, the Ascendant, and the overall shape of your life. Every other divisional chart is read against it.',
    howComputed: 'The full 30° sign — no subdivision. It is the planets’ actual sidereal positions.',
    howToRead: 'Read the D1 first for the big picture; use a divisional chart to zoom into a specific area, and only trust a divisional result if the D1 agrees.',
    computedByBornClock: true,
  },
  {
    slug: 'd2-hora', dNumber: 2, name: 'Hora', label: 'D2 (Hora)',
    lifeArea: 'wealth and resources',
    whatItShows: 'Capacity to earn and hold wealth. Planets fall into either the Sun’s Hora or the Moon’s Hora, which is read for prosperity.',
    howComputed: 'Each sign is split into two 15° halves (horas), assigned to the Sun or the Moon.',
    howToRead: 'A supportive Hora placement of wealth-giving planets reinforces a Dhana Yoga in the D1; read the two together.',
    computedByBornClock: false,
  },
  {
    slug: 'd3-drekkana', dNumber: 3, name: 'Drekkana', label: 'D3 (Drekkana)',
    lifeArea: 'siblings, courage and initiative',
    whatItShows: 'Relationships with brothers and sisters, drive, and the energy you bring to effort — the themes of the 3rd house, examined closely.',
    howComputed: 'Each sign is split into three 10° parts (drekkanas).',
    howToRead: 'Use it to refine 3rd-house matters (siblings, courage, short journeys) seen in the D1.',
    computedByBornClock: false,
  },
  {
    slug: 'd4-chaturthamsha', dNumber: 4, name: 'Chaturthamsha', label: 'D4 (Chaturthamsha / Turyamsha)',
    lifeArea: 'property, home and inner happiness',
    whatItShows: 'Fixed assets — land, house and vehicles — and the sense of security and contentment they bring. It details the promise of the 4th house.',
    howComputed: 'Each sign is split into four 7°30′ parts.',
    howToRead: 'Check it when the 4th house or its lord is prominent in the D1 — it shows whether property and domestic comfort actually materialise, and when (by the ruling planet’s Dasha).',
    computedByBornClock: false,
  },
  {
    slug: 'd7-saptamsha', dNumber: 7, name: 'Saptamsha', label: 'D7 (Saptamsha)',
    lifeArea: 'children and progeny',
    whatItShows: 'Matters of children — the possibility, timing and relationship with offspring — read from the 5th house and its lord in this chart.',
    howComputed: 'Each sign is split into seven equal parts (~4°17′ each).',
    howToRead: 'Read alongside the 5th house of the D1. Because it concerns children, keep the reading gentle and general — it describes tendencies and favourable periods, never a medical outcome or a guarantee.',
    computedByBornClock: false,
  },
  {
    slug: 'd9-navamsa', dNumber: 9, name: 'Navamsa', label: 'D9 (Navamsa)',
    lifeArea: 'marriage, spouse, dharma — and the real strength of every planet',
    whatItShows: 'The single most important divisional chart after the D1. It shows the marriage and spouse, your dharma (life purpose), and — crucially — the underlying strength of each planet. A planet strong in the D1 but weak in the Navamsa delivers less than it promises; one strong in both is powerful.',
    howComputed: 'Each sign is split into nine equal parts (3°20′ each), the span of one Nakshatra pada.',
    howToRead: 'Always cross-check the D1 with the Navamsa. A planet that holds dignity in both (Vargottama) is especially strong; marriage matters are read from the Navamsa Lagna and its 7th house.',
    computedByBornClock: true,
  },
  {
    slug: 'd10-dasamsa', dNumber: 10, name: 'Dasamsa', label: 'D10 (Dasamsa)',
    lifeArea: 'career, profession and public status',
    whatItShows: 'The detail of your working life — the field you rise in, your standing and achievements, and the planets that drive your profession. It expands on the 10th house.',
    howComputed: 'Each sign is split into ten 3° parts.',
    howToRead: 'Read the D10 together with the 10th house and its lord in the D1. BornClock’s career report uses the Dasamsa to rank suitable fields.',
    computedByBornClock: true,
  },
  {
    slug: 'd12-dwadashamsha', dNumber: 12, name: 'Dwadashamsha', label: 'D12 (Dwadashamsha)',
    lifeArea: 'parents and ancestry',
    whatItShows: 'The relationship with and legacy of your parents, and inherited tendencies — the 4th (mother) and 9th (father) examined closely.',
    howComputed: 'Each sign is split into twelve 2°30′ parts.',
    howToRead: 'Use it to detail parental matters and inherited strengths seen in the D1.',
    computedByBornClock: false,
  },
  {
    slug: 'd16-shodashamsha', dNumber: 16, name: 'Shodashamsha', label: 'D16 (Shodashamsha)',
    lifeArea: 'vehicles, luxuries and general comforts',
    whatItShows: 'Material comforts, conveyances and the pleasures (and troubles) that come with them, plus general happiness.',
    howComputed: 'Each sign is split into sixteen parts (1°52′30″ each).',
    howToRead: 'A supportive D16 confirms comfort and vehicle matters hinted at by a strong 4th house.',
    computedByBornClock: false,
  },
  {
    slug: 'd20-vimshamsha', dNumber: 20, name: 'Vimshamsha', label: 'D20 (Vimshamsha)',
    lifeArea: 'spiritual practice and progress',
    whatItShows: 'Devotion, spiritual discipline (sadhana) and progress on the inner path.',
    howComputed: 'Each sign is split into twenty 1°30′ parts.',
    howToRead: 'Read it when spirituality, worship or a contemplative life is a theme in the D1 (e.g. a strong 9th or 12th house, or Ketu/Jupiter prominence).',
    computedByBornClock: false,
  },
  {
    slug: 'd24-chaturvimshamsha', dNumber: 24, name: 'Chaturvimshamsha', label: 'D24 (Chaturvimshamsha / Siddhamsha)',
    lifeArea: 'education and learning',
    whatItShows: 'Academic success, higher learning, skill and the capacity to acquire knowledge — the promise of the 4th and 5th houses for study, examined closely.',
    howComputed: 'Each sign is split into twenty-four parts (1°15′ each).',
    howToRead: 'Read alongside Mercury, Jupiter and the 4th/5th houses in the D1 to judge academic strengths and the periods that favour study.',
    computedByBornClock: false,
  },
  {
    slug: 'd27-bhamsha', dNumber: 27, name: 'Bhamsha', label: 'D27 (Bhamsha / Nakshatramsha)',
    lifeArea: 'strengths, weaknesses and stamina',
    whatItShows: 'Overall physical and mental strength and resilience — where you are robust and where you tire.',
    howComputed: 'Each sign is split into twenty-seven parts (1°06′40″ each).',
    howToRead: 'A supportive D27 adds endurance to otherwise strong planets.',
    computedByBornClock: false,
  },
  {
    slug: 'd30-trimshamsha', dNumber: 30, name: 'Trimshamsha', label: 'D30 (Trimshamsha)',
    lifeArea: 'difficulties and character tests',
    whatItShows: 'Areas of trouble, vulnerability and the flaws to work on — read calmly as areas to strengthen, never as a doom.',
    howComputed: 'Each sign is divided into five unequal parts ruled by the five non-luminary planets (Mars, Saturn, Jupiter, Mercury, Venus).',
    howToRead: 'Treat it as a map of where to put effort and care, in the context of the whole chart — not a prediction of misfortune.',
    computedByBornClock: false,
  },
  {
    slug: 'd60-shashtiamsha', dNumber: 60, name: 'Shashtiamsha', label: 'D60 (Shashtiamsha)',
    lifeArea: 'fine-grained karma and the finest tuning of the chart',
    whatItShows: 'The most detailed subdivision — classically weighted heavily by Parashara for past-life karma and the subtle final verdict on a planet. Because it divides a sign into sixty tiny parts, it is extremely sensitive to the exact birth time.',
    howComputed: 'Each sign is split into sixty 0°30′ parts. Several classical schools assign them differently.',
    howToRead: 'Use only with a very accurate birth time, and treat it as one interpretation — BornClock shows the method it uses and a disclaimer, because schools differ.',
    computedByBornClock: true,
  },
];

export function vargaBySlug(slug: string): VargaChart | undefined {
  return VARGAS.find(v => v.slug === slug);
}
export const VARGA_SLUGS = VARGAS.map(v => v.slug);
