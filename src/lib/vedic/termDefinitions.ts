/**
 * Shared Vedic/astrology term-definition layer (Part AI, Part 1).
 *
 * Generalizes the single-purpose NAKSHATRA_MEANINGS pattern into ONE reusable, keyed
 * dictionary of plain-language term definitions, so every page can explain jargon the
 * same way instead of writing bespoke prose per page.
 *
 * WRITING METHOD — impact-first (decided after real user testing):
 *   impact  → what it means for YOU, in plain language (stated FIRST)
 *   why     → the reasoning / what it technically is (second)
 *   guidance→ practical "so what" (third, optional)
 *
 * Two consumption modes, both reading from this one source:
 *   1. <TermTip id="..."> (src/components/vedic/TermTip.tsx) — a hover-card for JSX pages.
 *   2. glossInline(id)    — a short parenthetical string for prose/string-generated copy
 *      (kundaliService, panchang, gemstones, careerReport, etc.) that can't embed JSX.
 */

export interface TermDef {
  /** Canonical display term. */
  term: string;
  /** Plain-language impact — what it means for the reader. Stated first. */
  impact: string;
  /** The reasoning / what it technically is. */
  why?: string;
  /** Practical guidance / "so what". */
  guidance?: string;
  /** Optional short parenthetical override for inline prose use. */
  inline?: string;
}

export const VEDIC_TERMS: Record<string, TermDef> = {
  ayanamsa: {
    term: 'Sidereal (Lahiri ayanamsa)',
    impact: 'This is why your Vedic sign can differ from your usual (Western) one.',
    why: 'Vedic astrology measures planets against the actual fixed stars ("sidereal"), while Western astrology uses the seasons ("tropical"). The two have drifted about 24° apart over the centuries; the correction for that gap is the "ayanamsa", and "Lahiri" is the standard version India uses.',
    guidance: 'It just means your chart is calculated the traditional Indian way — nothing you need to act on.',
    inline: 'the traditional Indian star-based calculation, which is why a Vedic sign can differ from a Western one',
  },
  lagna: {
    term: 'Lagna (Ascendant / rising sign)',
    impact: 'Your outward personality and how the world first meets you.',
    why: 'The Lagna is the zodiac sign that was rising on the eastern horizon at the exact moment and place you were born — the anchor the whole chart is read from.',
    guidance: 'Read it together with your Moon sign (your inner, emotional self).',
    inline: 'the sign rising at your birth — your outward self',
  },
  rashi: {
    term: 'Rashi (Moon sign)',
    impact: 'Your emotional nature, instincts and inner life.',
    why: 'The Rashi is the sign the Moon occupied at your birth. In Vedic astrology the Moon sign carries at least as much weight as the Sun sign.',
    inline: 'your Moon sign — your inner, emotional self',
  },
  nakshatra: {
    term: 'Nakshatra (birth star)',
    impact: 'A finer read on your temperament than the sign alone.',
    why: 'The 27 Nakshatras are lunar mansions — the sky divided into 27 segments the Moon travels through. Yours is the one the Moon sat in at birth, each with its own deity and "shakti" (special power).',
    inline: 'lunar mansion — a finer division of the sky than the 12 signs',
  },
  pada: {
    term: 'Pada (quarter)',
    impact: 'A more precise pinpoint within your birth star.',
    why: 'Each Nakshatra is split into four quarters called padas; your pada narrows down where exactly the Moon fell.',
    inline: 'one of the four quarters of a Nakshatra',
  },
  dasha: {
    term: 'Dasha (planetary period)',
    impact: 'Which planet is "running the show" in your life right now.',
    why: 'The Vimshottari Dasha system divides your life into planetary periods, each colouring the chapter it rules based on what that planet governs and where it sits in your chart.',
    inline: 'the planetary period currently colouring your life',
  },
  mahadasha: {
    term: 'Mahadasha (main period)',
    impact: 'The broad chapter of life you are in, lasting years.',
    why: 'The top-level Dasha period — the biggest brushstroke of the timing system.',
    inline: 'the broad, years-long main period',
  },
  antardasha: {
    term: 'Antardasha (sub-period)',
    impact: 'The shorter sub-chapter inside your main period, running now.',
    why: 'Each Mahadasha is divided into Antardashas — a finer layer of timing within the big chapter.',
    inline: 'the sub-period within the main period',
  },
  pratyantardasha: {
    term: 'Pratyantardasha (sub-sub-period)',
    impact: 'An even finer slice of timing — down to weeks and months.',
    why: 'The third level of the Dasha system: a sub-period within your Antardasha, sharpening the "what is active right now" picture.',
    inline: 'the third, finest Dasha level (weeks–months)',
  },
  sookshma: {
    term: 'Sookshma (subtle period)',
    impact: 'The fourth Dasha level — a fine window lasting roughly days.',
    why: 'Each Pratyantardasha divides again into nine Sookshma periods. Because these are so short, they are sensitive to the exact birth time.',
    guidance: 'Useful for fine timing, but only as reliable as your recorded birth time — treat it as indicative.',
    inline: 'the fourth Dasha level (about days)',
  },
  prana: {
    term: 'Prana (breath period)',
    impact: 'The fifth and finest Dasha level — a window lasting hours.',
    why: 'Each Sookshma divides once more into nine Prana periods, the subtlest layer of Vimshottari timing. At this scale even a few minutes of birth-time error matters.',
    guidance: 'Interesting for the finest timing, but highly birth-time-sensitive — never treat it as a precise prediction.',
    inline: 'the fifth, finest Dasha level (about hours)',
  },
  yoga: {
    term: 'Yoga (planetary combination)',
    impact: 'A special planetary pattern classically linked to a strength or theme in your life.',
    why: 'A "Yoga" is a specific combination of planets/houses the tradition names and reads as one unit — it indicates a tendency, never a guarantee.',
    inline: 'a named planetary combination indicating a tendency',
  },
  dosha: {
    term: 'Dosha (area to be mindful of)',
    impact: 'A classical pattern worth handling consciously — not a curse or a verdict.',
    why: 'A "dosha" flags a placement the tradition treats as needing awareness; many have classical cancellations that soften them.',
    inline: 'a classical pattern to be mindful of, not a verdict',
  },
  ashtakoota: {
    term: 'Ashtakoota (Guna Milan)',
    impact: 'The 36-point score behind a Vedic match.',
    why: 'Ashtakoota compares two charts across eight factors ("kootas"), each worth points toward a total of 36.',
    inline: 'the classical 36-point, 8-factor match score',
  },
  navamsa: {
    term: 'Navamsa (D9 chart)',
    impact: 'A second, "zoomed-in" chart used especially for marriage and inner strength.',
    why: 'The Navamsa (ninth divisional chart, D9) re-divides each sign into nine parts to reveal the deeper promise behind the main chart.',
    inline: 'the D9 divisional chart, read for marriage & deeper strength',
  },
  dasamsa: {
    term: 'Dasamsa (D10 chart)',
    impact: 'The dedicated career-and-public-life chart.',
    why: 'The Dasamsa (tenth divisional chart, D10) refines what the main chart shows about profession and status.',
    inline: 'the D10 divisional chart, read for career',
  },
  shashtiamsa: {
    term: 'Shashtiamsa (D60 chart)',
    impact: 'The most detailed divisional chart — treated as a fine-tuning layer, cautiously.',
    why: 'The D60 needs a very exact birth time, so it is weighed as nuance, not a headline.',
    inline: 'the D60 divisional chart — a cautious fine-tuning layer',
  },
  kendra: {
    term: 'Kendra (angle house)',
    impact: 'One of the four "power" houses of a chart.',
    why: 'The Kendras are the 1st, 4th, 7th and 10th houses — pillars of strength in the chart.',
    inline: 'an "angle" house (1st/4th/7th/10th) — a power position',
  },
  trikona: {
    term: 'Trikona (trine house)',
    impact: 'One of the most fortunate, supportive houses of a chart.',
    why: 'The Trikonas are the 1st, 5th and 9th houses — classically the luckiest, most benefic positions.',
    inline: 'a "trine" house (1st/5th/9th) — a fortunate position',
  },
  yogakaraka: {
    term: 'Yogakaraka',
    impact: 'The single most beneficial planet for your specific rising sign.',
    why: 'A Yogakaraka rules both a Kendra (angle) and a Trikona (trine) house for your Lagna, making it uniquely powerful to strengthen.',
    inline: 'your single most beneficial planet, ruling both an angle and a trine house',
  },
  shadbala: {
    term: 'Shadbala (planetary strength)',
    impact: 'How strong or weak each of your planets actually is — so you know which ones can deliver.',
    why: 'Shadbala ("six-fold strength") scores every planet on six real classical factors, in units called virupas. It is the traditional measure of planetary strength.',
    guidance: 'A strong planet delivers its promise more reliably; a weak one may need support.',
    inline: 'the classical six-fold measure of how strong each planet is',
  },
  kaalsarp: {
    term: 'Kaal Sarp Dosha',
    impact: 'A chart pattern some feel as extra effort before things click — held calmly, not feared.',
    why: 'It forms when all seven main planets sit on one side of the Rahu–Ketu axis. It is a permanent, structural feature (no start/end dates), traditionally felt most in Rahu/Ketu periods.',
    guidance: 'Treat it as a theme to work with consciously, not a disaster — many successful people have it.',
    inline: 'all planets on one side of the Rahu–Ketu axis — a structural theme, not a verdict',
  },
  manglik: {
    term: 'Manglik (Mangal / Kuja Dosha)',
    impact: 'A Mars placement that mainly matters for marriage matching — and is often cancelled.',
    why: 'Manglik ("Kuja Dosha") is Mars sitting in certain houses from the Lagna, Moon or Venus. It carries real marriage-market stigma but has many classical cancellations.',
    guidance: 'De-stigmatised here: it is one factor among many, not a barrier by itself.',
    inline: 'a Mars placement relevant to marriage matching, often cancelled',
  },
  panchang: {
    term: 'Panchang (the five limbs)',
    impact: 'The traditional Hindu almanac that decides whether a day is auspicious.',
    why: 'It combines five daily "limbs" — Tithi (lunar day), Nakshatra (star), Yoga, Karana and the weekday — into a verdict on the day.',
    inline: 'the Hindu almanac of five daily factors that rates a day',
  },
  tithi: {
    term: 'Tithi (lunar day)',
    impact: 'Which day of the Moon’s cycle it is — some are favoured for new starts, some avoided.',
    why: 'A Tithi is the lunar "date" (there are 30 per lunar month). The 4th, 9th and 14th ("Rikta") and the new-moon (Amavasya) are traditionally avoided for beginnings.',
    inline: 'the lunar day; certain ones favour new starts',
  },
  panchangYoga: {
    term: 'Yoga (Panchang limb)',
    impact: 'One of the five daily factors that grades a date — distinct from a birth-chart Yoga.',
    why: 'In the Panchang, "Yoga" is a specific Sun–Moon angular combination for the day (there are 27), separate from the planetary-combination Yogas in a birth chart.',
    inline: 'a daily Sun–Moon combination (one of the almanac’s five factors)',
  },
  rahuKalam: {
    term: 'Rahu Kalam',
    impact: 'A roughly 90-minute window each day traditionally avoided for anything important.',
    why: 'Rahu Kalam is a daily inauspicious segment whose timing shifts with local sunrise/sunset — so it genuinely depends on your city.',
    guidance: 'Simply schedule around it; it resets every day.',
    inline: 'a daily ~90-minute window traditionally avoided',
  },
  choghadiya: {
    term: 'Choghadiya',
    impact: 'A finer, hour-by-hour "good time / bad time" breakdown within a day.',
    why: 'Choghadiya splits daytime and night into eight slots each, labelled auspicious or not — used to pick a good hour once you have a good day.',
    inline: 'an hour-by-hour good/bad-time breakdown of a day',
  },
  hora: {
    term: 'Hora',
    impact: 'The planetary "hour" — which planet rules a given hour of the day.',
    why: 'Each hour is ruled by one of seven planets in a fixed cycle; a Hora matching your purpose sharpens timing further.',
    inline: 'the planetary ruler of an hour',
  },
  chandrashtama: {
    term: 'Chandrashtama',
    impact: 'Days when the Moon is in a spot that classically feels off for you personally.',
    why: 'Chandrashtama is when the transiting Moon is in the 8th sign from your birth Moon — a personal, chart-specific caution (needs your birth details).',
    inline: 'personal days when the Moon sits 8th from your birth Moon',
  },
  dhaiya: {
    term: 'Dhaiya (small Panoti)',
    impact: 'A shorter, lighter cousin of Sade Sati.',
    why: 'A 2.5-year Saturn transit through the 4th or 8th sign from your Moon — a milder version of Sade Sati’s themes.',
    inline: 'a 2.5-year, lighter Saturn phase (4th/8th from the Moon)',
  },
  sadeSati: {
    term: 'Sade Sati',
    impact: 'Saturn’s roughly 7.5-year passage many look back on as foundation-building.',
    why: 'It runs while Saturn transits the signs before, on, and after your Moon sign — themes of discipline, patience and long-term reward.',
    inline: 'Saturn’s ~7.5-year passage around your Moon sign',
  },
  ratna: {
    term: 'Ratna (gemstone remedy)',
    impact: 'A gemstone traditionally worn to strengthen a specific planet.',
    why: 'Each planet has an associated Ratna; the aim is to support a weak-but-important planet in your chart.',
    inline: 'a planet-strengthening gemstone',
  },
  malefic: {
    term: 'Malefic influence',
    impact: 'A planet or period that tends to bring friction — handled consciously, not feared.',
    why: 'In the tradition, some planets/placements are classed as "malefic" (challenging) and others "benefic" (supportive) — a description of tendency, not a curse.',
    inline: 'a challenging (vs supportive) planetary tendency',
  },
  navratna: {
    term: 'Navratna (the nine gems)',
    impact: 'The nine classical gemstones, one for each of the nine planets.',
    why: 'Navratna literally means "nine gems"; each is tied to a planet, and each Rashi’s stone is drawn from this set.',
    inline: 'the nine classical planetary gemstones',
  },
  cusp: {
    term: 'Cusp',
    impact: 'Being born within a day or two of where one sign changes to the next.',
    why: 'Sign boundaries shift by a day or so year to year, so births near a boundary ("on the cusp") can read as either sign — a precise birth time settles it.',
    inline: 'born right at the boundary between two signs',
  },
  risingSign: {
    term: 'Rising sign (Ascendant / Lagna)',
    impact: 'The "mask" you meet the world with — the third piece of your "Big Three".',
    why: 'The rising sign is the sign coming up on the horizon at your exact birth time and place. Unlike Sun and Moon signs, it needs an accurate birth time.',
    guidance: 'You can compute yours on the Kundli (birth chart) tool.',
    inline: 'the sign on the horizon at birth — your outward "mask"',
  },
  virupas: {
    term: 'Virupas',
    impact: 'Just the unit the planetary-strength score is measured in — a bigger number means a stronger planet.',
    why: 'Shadbala (six-fold strength) is totalled in a classical unit called the "virupa" (60 virupas = 1 "rupa"). The exact figure is shown for power users; the plain word next to it ("strong", "weak") is what actually matters.',
    inline: 'the classical unit planetary strength is scored in',
  },
  paksha: {
    term: 'Paksha (lunar fortnight)',
    impact: 'Whether the Moon was waxing (growing) or waning (shrinking) that day.',
    why: 'Each lunar month has two Pakshas: Shukla (the bright, waxing half, new Moon → full Moon) and Krishna (the dark, waning half, full Moon → new Moon). Many timings favour the waxing Shukla Paksha.',
    inline: 'the waxing (Shukla) or waning (Krishna) half of the lunar month',
  },
  varna: {
    term: 'Varna (1 point)',
    impact: 'Checks that the two people’s basic temperaments sit comfortably together.',
    why: 'The first of the eight kootas. It compares a spiritual/work-nature grouping drawn from each Moon sign; worth 1 of the 36 points.',
    inline: 'the temperament-compatibility koota (1 point)',
  },
  vashya: {
    term: 'Vashya (2 points)',
    impact: 'How naturally one partner draws and influences the other.',
    why: 'The second koota — mutual attraction and control, from sign groupings; worth 2 points.',
    inline: 'the mutual-attraction koota (2 points)',
  },
  tara: {
    term: 'Tara (3 points)',
    impact: 'Health, luck and wellbeing for the couple, read from their birth stars.',
    why: 'The third koota counts the distance between the two Nakshatras (birth stars) in both directions; worth 3 points.',
    inline: 'the birth-star fortune koota (3 points)',
  },
  yoni: {
    term: 'Yoni (4 points)',
    impact: 'Physical and instinctive compatibility.',
    why: 'The fourth koota assigns each Nakshatra an animal symbol and scores how well the two animals get along; worth 4 points.',
    inline: 'the physical-compatibility (animal-symbol) koota (4 points)',
  },
  grahaMaitri: {
    term: 'Graha Maitri (5 points)',
    impact: 'Mental and emotional friendship — how well your minds meet.',
    why: 'The fifth koota compares the friendship between the two Moon-sign lords (ruling planets); worth 5 points.',
    inline: 'the mental-friendship koota, from the sign lords (5 points)',
  },
  gana: {
    term: 'Gana (6 points)',
    impact: 'A broad temperament match (gentle / energetic / intense).',
    why: 'The sixth koota sorts each Nakshatra into one of three natures — Deva (gentle), Manushya (human), Rakshasa (intense) — and scores the pairing; worth 6 points.',
    inline: 'the temperament-nature koota (6 points)',
  },
  bhakoot: {
    term: 'Bhakoot (7 points)',
    impact: 'Overall harmony, prosperity and emotional flow in the relationship.',
    why: 'The seventh koota looks at the distance between the two Moon signs; certain distances (6/8, 5/9, 2/12) flag a "Bhakoot dosha", worth 7 points and weighted heavily.',
    inline: 'the Moon-sign harmony koota (7 points, heavily weighted)',
  },
  nadi: {
    term: 'Nadi (8 points)',
    impact: 'Traditionally the most important koota — tied to health and progeny.',
    why: 'The eighth koota groups each Nakshatra into one of three Nadis (Aadi/Madhya/Antya); the same Nadi for both flags a "Nadi dosha". It carries the most points (8) and the most weight.',
    inline: 'the health/progeny koota — the heaviest at 8 points',
  },
};

/** Look up a term definition by id (case-insensitive), or null. */
export function getTermDef(id: string): TermDef | null {
  if (!id) return null;
  if (VEDIC_TERMS[id]) return VEDIC_TERMS[id];
  const key = Object.keys(VEDIC_TERMS).find(k => k.toLowerCase() === id.toLowerCase());
  return key ? VEDIC_TERMS[key] : null;
}

/**
 * A short parenthetical gloss for use inside prose/string-generated copy that can't embed
 * JSX (e.g. kundaliService, panchang, gemstones, careerReport). Returns "" if unknown, so
 * callers can safely template it. Impact-first: uses the `inline` phrasing.
 */
export function glossInline(id: string): string {
  const d = getTermDef(id);
  if (!d) return '';
  return d.inline || d.impact;
}
