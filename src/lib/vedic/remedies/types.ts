/** Shared types for the Remedies catalogue (Batch 5, goal d). */

export type Lang = 'en' | 'hi';
export interface L10n { en: string; hi: string }

export type RemedyKind = 'dosha' | 'transit' | 'matching' | 'nakshatra' | 'planet';
export type PlanetName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

/** A cited traditional source. Short, human-readable label. */
export type SourceLabel = string;

export interface Mantra {
  name: L10n;
  devanagari: string;
  transliteration: string;
  /** e.g. "108 times (one mala)". */
  count: L10n;
  when: L10n;
  source: SourceLabel;
}

export interface Practice { text: L10n; source: SourceLabel }

export interface Daan {
  what: L10n;
  toWhom: L10n;
  day: L10n;
  source: SourceLabel;
}

export type PujaWhere = 'home' | 'priest' | 'home-or-priest';
export interface Puja {
  name: L10n;
  when: L10n;
  where: PujaWhere;
  note: L10n;
  source: SourceLabel;
}

export interface RemedyEntry {
  key: string;
  /** URL slug under /remedies/ and /hi/upay/. */
  slug: string;
  kind: RemedyKind;
  name: L10n;
  /** The planet(s) whose remedies this builds on (for cross-links). */
  planets: PlanetName[];
  /** Where on BornClock this finding is detected. */
  toolPath: string;
  meaning: {
    /** Plain, calm description of what it means for the person. */
    plain: L10n;
    /** Honest note on how common it is. */
    howCommon: L10n;
    /** Cancellations / why it is often milder than feared. */
    cancellations: L10n;
  };
  free: {
    mantras: Mantra[];
    prayers: Practice[];
    fasting: Practice;
    lifestyle: Practice[];
    seva: Practice[];
  };
  daan: Daan[];
  puja: Puja[];
  /** Temple ids from TEMPLES (verified). */
  temples: string[];
  /** Shown when the tradition does not tie the remedy to a specific shrine. */
  templesNote?: L10n;
  gemstone: {
    /** The planet whose stone is relevant, or null when no stone is a remedy here. */
    planet: PlanetName | null;
    note: L10n;
  };
  consult: L10n;
}
