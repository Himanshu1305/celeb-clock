/**
 * Batch 8 — the evidence behind /accuracy ("How we check our accuracy").
 *
 * EVERY number here comes from a real, repeatable test — nothing is estimated. The
 * page (src/pages/AccuracyPage.tsx) renders only what is in this file, and
 * src/lib/accuracy/__tests__/accuracyEvidence.test.ts re-checks the numbers against
 * the reference fixtures on every test run, so the page cannot quietly go stale.
 *
 * Sources (all opened / run while writing this, 26 Oct 2026):
 *  - KUNDALI: /api/kundali on the 20 golden births + 2 extra couple births in
 *    src/lib/vedic/__tests__/golden/goldenCharts.json, compared with the fixture's Swiss
 *    Ephemeris values (pyswisseph 2.10.03). Run: scratchpad b8acc/bc.mts + cmp_charts.py
 *    (copies of strategy2/compute/*, pointed at this branch). Result: Lagna + 9 grahas,
 *    220/220 within 1 arc-minute (largest 32″, P7 Rahu); signs 220/220; nakshatra + pada
 *    22/22; current Mahadasha + Antardasha 22/22; Antardasha start within 7.9 h.
 *  - MATCHING / MANGLIK: goldenCharts.json couples (7, astrosageTotal) and charts with
 *    manglik.astrosageLevel (10) — entered by hand on astrosage.com, 17 Oct 2026
 *    (round2.txt "Matching and Manglik vs AstroSage"); same run: 7/7 totals, 10/10 levels.
 *  - PANCHANG: src/lib/vedic/__tests__/panchangDrik.test.ts (Drik day pages opened
 *    25 Oct 2026). Counted with scratchpad b8acc/pdcount.ts: 19 city-days, 32/32 names,
 *    340 clock times within 1 min, 28 Tithi/Nakshatra end times within 2 min.
 *  - INGRESS: src/lib/vedic/__tests__/ayanamsaDrik.test.ts DRIK_EVENTS (Drik pages
 *    fetched 23 Oct 2026): 19 moments; Sun/Rahu ±3 min, Jupiter ±8, Saturn ±10.
 *  - FESTIVALS: src/lib/vedic/__tests__/festivals.test.ts (Drik New Delhi Hindu
 *    calendar pages fetched 23 Oct 2026): 33 named festivals in each of 2026 and 2027;
 *    Ekadashi 24 + 25; Purnima 13 + 12; Sankranti 12 + 12. Eclipses 2026–2030: 24, NASA
 *    eclipse tables fetched 23 Oct 2026.
 *  - VARGAS: src/lib/vedic/__tests__/shodashvarga.test.ts + golden/shodashvargaSwiss.json
 *    (Swiss Ephemeris + independent BPHS ch. 6 implementation): 5 charts × 16 vargas ×
 *    10 points = 800, of which 28 lie within 36″ of a boundary and are not compared → 772.
 *  - DATE-ONLY MOON SIGN: every celebrity with a full birth date in
 *    src/data/celebrities.json (3,044 after the Batch 7 dedupe) — engine range
 *    (moonSignsForDate) vs Swiss Ephemeris (pyswisseph, SIDM_LAHIRI) at the start and end
 *    of the birth day. Run: scratchpad b8acc/celeb_dump.mts + celeb_cmp_signs.py
 *    (copies of b6moon/*): 3,044/3,044 same sign(s). Only four dates differ by more than
 *    60″, all before 1210 CE (largest 525″, Aryabhata 476 CE). Nakshatra lists differed
 *    on 7 boundary days, so the page claims Moon SIGNS only.
 *  - SADE SATI: goldenCharts.json sadeSatiAtRef (Saturn ingresses from Swiss Ephemeris),
 *    status at 24 Oct 2026: 22/22 in the same run.
 *  - WEEKLY CHECK: .github/workflows/weekly-drift.yml (Mondays ~03:00 IST; 20 births +
 *    7 couples on the code and on the live bornclock.com API).
 */

export const TESTED_MONTH = 'October 2026';
export const PAGE_UPDATED_ISO = '2026-10-26';
export const PAGE_UPDATED = '26 October 2026';

export interface EvidenceRow {
  id: string;
  what: string;
  reference: string;
  howMany: string;
  result: string;
  date: string;
}

/** Raw counts — asserted against the fixtures by accuracyEvidence.test.ts. */
export const COUNTS = {
  kundaliBirths: 22,
  goldenBirths: 20,
  kundaliPositions: 220, // 22 births × (Lagna + Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
  kundaliMaxArcsec: 32,
  dashaMaxHours: 8,
  couples: 7,
  manglikCharts: 10,
  panchangCityDays: 19,
  panchangCities: 5,
  panchangNames: 32,
  panchangTimes: 340,
  panchangEndTimes: 28,
  ingressEvents: 19,
  festivals2026: 33,
  festivals2027: 33,
  ekadashi2026: 24,
  ekadashi2027: 25,
  eclipses: 24,
  vargaCharts: 5,
  vargas: 16,
  vargaPlacements: 772,
  vargaSkipped: 28,
  celebrities: 3044,
} as const;

export const EVIDENCE: EvidenceRow[] = [
  {
    id: 'kundali',
    what: 'Kundali: Lagna and all 9 planet positions',
    reference: 'Swiss Ephemeris (astronomical library)',
    howMany: `${COUNTS.kundaliBirths} test births, ${COUNTS.kundaliPositions} positions`,
    result: `All ${COUNTS.kundaliPositions} within 1 arc-minute (largest gap ${COUNTS.kundaliMaxArcsec}″); same sign every time`,
    date: '26 Oct 2026',
  },
  {
    id: 'nakshatra-dasha',
    what: 'Moon Nakshatra and pada; current Dasha',
    reference: 'Swiss Ephemeris + the classical Vimshottari rules',
    howMany: `${COUNTS.kundaliBirths} test births`,
    result: `${COUNTS.kundaliBirths} of ${COUNTS.kundaliBirths} same Nakshatra and pada; ${COUNTS.kundaliBirths} of ${COUNTS.kundaliBirths} same Mahadasha and Antardasha`,
    date: '26 Oct 2026',
  },
  {
    id: 'vargas',
    what: 'All 16 divisional charts (D1–D60)',
    reference: 'Swiss Ephemeris + the Parashari rules (BPHS ch. 6), coded separately',
    howMany: `${COUNTS.vargaCharts} charts, ${COUNTS.vargaPlacements} placements`,
    result: `${COUNTS.vargaPlacements} of ${COUNTS.vargaPlacements} same sign`,
    date: 'Oct 2026',
  },
  {
    id: 'matching',
    what: 'Kundali matching: Guna Milan total (out of 36)',
    reference: 'AstroSage (entered by hand)',
    howMany: `${COUNTS.couples} couples`,
    result: `${COUNTS.couples} of ${COUNTS.couples} same total`,
    date: '17 Oct 2026',
  },
  {
    id: 'manglik',
    what: 'Manglik (Mangal Dosha) level',
    reference: 'AstroSage (entered by hand)',
    howMany: `${COUNTS.manglikCharts} charts`,
    result: `${COUNTS.manglikCharts} of ${COUNTS.manglikCharts} same level`,
    date: '17 Oct 2026',
  },
  {
    id: 'panchang',
    what: 'Panchang: Tithi and Nakshatra names, sunrise, Rahu Kaal and other times',
    reference: 'Drik Panchang day pages',
    howMany: `${COUNTS.panchangCityDays} city-days (${COUNTS.panchangCities} cities)`,
    result: `${COUNTS.panchangNames} of ${COUNTS.panchangNames} names; ${COUNTS.panchangTimes} times within 1 minute; ${COUNTS.panchangEndTimes} Tithi/Nakshatra end times within 2 minutes`,
    date: '25 Oct 2026',
  },
  {
    id: 'ingress',
    what: 'When planets change sign or Nakshatra',
    reference: 'Drik Panchang transit pages',
    howMany: `${COUNTS.ingressEvents} moments`,
    result: 'Sun and Rahu within 3 minutes; Jupiter within 8; Saturn within 10',
    date: '23 Oct 2026',
  },
  {
    id: 'festivals',
    what: 'Festival, Ekadashi, Purnima and Sankranti dates (2026 and 2027)',
    reference: 'Drik Panchang Hindu calendar (New Delhi)',
    howMany: `${COUNTS.festivals2026 + COUNTS.festivals2027} festivals, ${COUNTS.ekadashi2026 + COUNTS.ekadashi2027} Ekadashis`,
    result: 'Every date the same',
    date: '23 Oct 2026',
  },
  {
    id: 'eclipses',
    what: 'Solar and lunar eclipses 2026–2030',
    reference: 'NASA eclipse tables',
    howMany: `${COUNTS.eclipses} eclipses`,
    result: `${COUNTS.eclipses} of ${COUNTS.eclipses} same date and type`,
    date: '23 Oct 2026',
  },
  {
    id: 'moon-sign',
    what: 'Moon sign from a birth date only (celebrity pages)',
    reference: 'Swiss Ephemeris',
    howMany: `${COUNTS.celebrities.toLocaleString('en-IN')} people`,
    result: `${COUNTS.celebrities.toLocaleString('en-IN')} of ${COUNTS.celebrities.toLocaleString('en-IN')} same sign (or same two signs on change days)`,
    date: '26 Oct 2026',
  },
  {
    id: 'sade-sati',
    what: 'Sade Sati status',
    reference: 'Saturn positions from Swiss Ephemeris',
    howMany: `${COUNTS.kundaliBirths} test births`,
    result: `${COUNTS.kundaliBirths} of ${COUNTS.kundaliBirths} same status`,
    date: '26 Oct 2026',
  },
];

export interface FaqItem { q: string; a: string }

export const ACCURACY_FAQ: FaqItem[] = [
  {
    q: 'How does BornClock check that its Kundali is calculated correctly?',
    a: `We run the same code the website uses on ${COUNTS.kundaliBirths} test births and compare every result with the Swiss Ephemeris, an independent astronomical library. In our tests (${TESTED_MONTH}) all ${COUNTS.kundaliPositions} Lagna and planet positions were within 1 arc-minute, and the Nakshatra, pada and current Dasha were the same for all ${COUNTS.kundaliBirths} births.`,
  },
  {
    q: 'Which Kundali matching method does BornClock follow?',
    a: `Guna Milan follows AstroSage's tables and conventions. We entered ${COUNTS.couples} couples on AstroSage on 17 October 2026; in our tests BornClock gave the same total for all ${COUNTS.couples}. The Manglik level was the same on all ${COUNTS.manglikCharts} test charts.`,
  },
  {
    q: 'Why can a Tithi or Nakshatra end time differ by a minute or two from another Panchang?',
    a: `Those end times depend only on the Moon, and tiny differences between astronomical methods move them by seconds. After rounding to the minute, our end times were within 2 minutes of Drik Panchang in our tests (${TESTED_MONTH}); sunrise, sunset, Rahu Kaal and the other clock times were within 1 minute.`,
  },
  {
    q: 'Why does a celebrity page show two Moon signs?',
    a: 'When only the birth date is known, the Moon can change sign during that day. If it does, we show both signs and say it depends on the birth time, rather than guessing one.',
  },
  {
    q: 'How often are these checks repeated?',
    a: 'Every Monday morning (India time) an automatic check runs the stored reference births and couples against both the current code and the live bornclock.com website. Any difference opens an alert for us to fix. The same reference tests also run before every release of the website, and a failure stops the release.',
  },
  {
    q: 'Do these tests prove that astrology predictions come true?',
    a: 'No. These tests check the calculations — planet positions, Panchang timings, dates and scores — against standard references. Astrology readings are a tradition of interpretation, and we present them as guidance, not certainty.',
  },
];
