/**
 * Birth details + engine output for the public sample report (/birthday-report/sample).
 *
 * SAMPLE_VEDIC is the output of the Kundali engine (calculateBirthChart → the same
 * mapping the paid report stores, see src/lib/reportVedic.ts) for SAMPLE_BIRTH. It is
 * stored here only so the sample page does not ship the ephemeris; the regression
 * test `src/lib/__tests__/reportVedic.test.ts` recomputes it from the engine and fails
 * if the two ever differ. Independent check (Swiss Ephemeris, Lahiri): Moon 138.02°
 * = Leo / Purva Phalguni pada 2, Ascendant 258.35° = Sagittarius — matching the audit's
 * reference for panel P3 (round2.txt S1: "real Leo/Purva Phalguni").
 */
export const SAMPLE_BIRTH = {
  dob: '1990-01-15',
  time: '06:30',
  place: { name: 'New Delhi, India', lat: 28.6139, lon: 77.209 },
} as const;

export const SAMPLE_VEDIC = {
  moonSignIndex: 4,          // Leo / Simha
  nakshatraNumber: 11,       // Purva Phalguni
  pada: 2,
  lagnaSignIndex: 8,         // Sagittarius / Dhanu
  gem: { planet: 'Jupiter', gem: 'Yellow Sapphire', hindi: 'Pukhraj', role: 'Ascendant lord' },
} as const;
