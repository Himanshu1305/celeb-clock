/**
 * Shared types for daily-changing pages (see ./index.ts for the full design + API).
 * Kept dependency-free: the Cloudflare Worker, the build script and the browser all
 * import this file.
 */

export type DailyLang = 'en' | 'hi';

/** A tone marker for a section — drives a small coloured dot, never fear wording. */
export type DailyTone = 'good' | 'mixed' | 'care';

export interface DailyItem {
  label: string;
  value: string;
  /** Optional one-line plain-language note shown under the value. */
  note?: string;
}

export interface DailySection {
  /** Stable id (e.g. 'overview', 'love') — used as the HTML id + test hook. */
  id: string;
  heading: string;
  /** Plain text paragraph (escaped on render). */
  text?: string;
  /** Optional label/value list (lucky items, timings, planets on the move …). */
  items?: DailyItem[];
  tone?: DailyTone;
}

export interface DailyWhy {
  /** Short factor name, e.g. "Chandrabala — Moon in your 11th house". */
  label: string;
  /** One plain line: what it is and what it means today. */
  text: string;
}

export interface DailyFaq {
  q: string;
  a: string;
}

/**
 * Everything a daily page shows for ONE date. Precomputed at build time into
 * `dist/daily/<kind>/<slug>/<YYYY-MM>.json` and rendered identically by the Worker
 * (string HTML injection) and the browser (same renderer, dangerouslySetInnerHTML).
 */
export interface DailyEntry {
  /** India calendar date (Asia/Kolkata), YYYY-MM-DD. */
  date: string;
  lang: DailyLang;
  /** Full <title> (dated). */
  title: string;
  /** Meta description (dated). */
  description: string;
  /** H1 text (the visible date is shown separately via `dateLabel`). */
  h1: string;
  /** Visible date, e.g. "Monday, 26 October 2026" / "सोमवार, 26 अक्टूबर 2026". */
  dateLabel: string;
  /** Answer-first: a 2–3 sentence direct answer shown at the very top. */
  answer: string;
  /** "Why today": the 2–3 real factors used, each explained in one plain line. */
  why: DailyWhy[];
  sections: DailySection[];
  /** Visible FAQ; also emitted as FAQPage JSON-LD (same text). */
  faq: DailyFaq[];
}

/** One month file: `dist/daily/<kind>/<slug>/<YYYY-MM>.json`. */
export interface DailyMonthFile {
  kind: string;
  slug: string;
  month: string;
  /** No build timestamp here on purpose: unchanged months keep the same bytes, so a
   *  deploy only re-uploads the month files that actually changed. */
  days: Record<string, DailyEntry>;
}

/** `dist/daily/manifest.json` — read by the ops monitor to check freshness. */
export interface DailyManifest {
  generatedAt: string;
  firstDate: string;
  lastDate: string;
  kinds: Record<string, { slugs: number; files: number; entries: number }>;
}
