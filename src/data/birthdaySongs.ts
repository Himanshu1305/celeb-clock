// #1 song on your birthday (NB3-SONG). Data-driven and HONEST: this module only ever
// reports a song when a verified dataset entry covers the date. It NEVER guesses or
// fabricates a chart position (Rule 8).
//
// STATUS: the dataset ships EMPTY. A "#1 song by date" dataset (e.g. Billboard Hot 100
// or the Official UK Singles Chart) must be properly licensed or compiled from a
// CC-compatible source (the facts — "song X was #1 from date A to B" — are not
// copyrightable, but a particular compiled dataset can be). That sourcing is a
// business/licensing decision → see "Needs the person" in docs/growth-p3-report.md.
// Once a verified dataset is dropped into NUMBER_ONE_RANGES (or loaded from JSON in the
// same shape), every birthday surface and the shareable card light up automatically.
//
// Format: inclusive date ranges in ISO YYYY-MM-DD, sorted ascending by `from`.

export interface NumberOneSong {
  title: string;
  artist: string;
  /** Which chart this came from, shown for honesty (e.g. "Billboard Hot 100"). */
  chart: string;
}

export interface NumberOneRange extends NumberOneSong {
  from: string; // inclusive YYYY-MM-DD
  to: string;   // inclusive YYYY-MM-DD
}

// Intentionally empty until a licensed/verified dataset is supplied (see note above).
export const NUMBER_ONE_RANGES: NumberOneRange[] = [];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * The #1 song on a given date, or null if the dataset doesn't (honestly) cover it.
 * `ranges` is injectable for testing; production uses the shipped dataset.
 */
export function numberOneSong(dob: Date, ranges: NumberOneRange[] = NUMBER_ONE_RANGES): NumberOneSong | null {
  if (!(dob instanceof Date) || isNaN(dob.getTime())) return null;
  const key = iso(dob);
  for (const r of ranges) {
    if (key >= r.from && key <= r.to) return { title: r.title, artist: r.artist, chart: r.chart };
  }
  return null;
}

/** Whether a usable dataset is present (used by UI to show/hide the song line). */
export function hasSongData(): boolean {
  return NUMBER_ONE_RANGES.length > 0;
}
