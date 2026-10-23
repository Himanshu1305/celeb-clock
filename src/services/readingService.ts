/**
 * Client wrapper for the Vedic reading endpoint (`/api/vedic-reading`).
 * The reading is generated server-side (Gemini, with the chart computed by the
 * Part B engine); this fetches it. The response ALWAYS carries deterministic
 * chart `facts`, plus an AI `reading` (null when the AI is unavailable — the UI
 * then falls back to the facts rather than showing a blank or error).
 */
import { birthQuery, type BirthPlaceLike } from '@/lib/timezone/clientBirth';

export interface ReadingSections {
  snapshot: string;
  career: string;
  relationships: string;
  health: string;
  money: string;
  family: string;
  rightNow: string;
  doshas: string;
  divisional: string;
}

export interface ReadingFactsClient {
  rashi: string;
  nakshatra: { name: string; pada: number; lord: string };
  lagna: string;
  dasha: { maha: string; antar: string } | null;
  /** Pratyantardasha (Part X) — 3rd Dasha level, shown ONLY in the advanced view. */
  pratyantardasha?: { lord: string; start: string; end: string } | null;
  placements: Array<{ planet: string; sign: string; house: number; retrograde: boolean }>;
  /** All 9 grahas incl. raw Shadbala (shown only in the advanced/technical view). */
  planets?: Array<{ planet: string; sign: string; house: number; retrograde: boolean; combust?: boolean; navamsa?: string; shadbala?: { total: number; category: string } }>;
  /** Detected classical Yogas (advanced view: name + grade + conditions checked). */
  yogas?: Array<{ name: string; grade: string; summary: string; note?: string; conditions: string[] }>;
  doshas: {
    mangal: { present: boolean; severityLabel: string };
    kaalSarp: { present: boolean; isPartial: boolean; type: string | null };
    sadeSati: { active: boolean; phase: string | null };
  };
  divisional: { d9Moon: string; d10Sun: string; d60Moon: string; d60Disclaimer: string };
  warnings: Array<{ code: string; message: string }>;
}

/** One Past-Period Reflection question (Part R) — see src/lib/vedic/reflection.ts. */
export interface ReflectionQuestionClient {
  theme: 'marriage' | 'career' | 'travel';
  dashaLord: string;
  antardashaLord: string;
  start: string;
  end: string;
  houses: number[];
  themeDescription: string;
  questionText: string;
}

export interface ReadingPayload {
  facts: ReadingFactsClient;
  reading: ReadingSections | null;
  degraded: boolean;
  degradedReason?: string;
  warnings: Array<{ code: string; message: string }>;
  /** Past-Period Reflection questions this chart qualifies for (Part R). May be []. */
  reflections?: ReflectionQuestionClient[];
  source: string;
  _cache?: string;
}

export async function fetchReading(
  dob: string, time: string, loc: BirthPlaceLike & { tz?: number }, maritalStatus?: 'single' | 'married' | 'not-said',
): Promise<ReadingPayload> {
  // fix-timezone-accuracy: shared birth params (zone from the birthplace, DST-correct).
  const params = new URLSearchParams(birthQuery(dob, time, loc));
  // Optional marital status: 'married' swaps forward marriage-window wording for partnership wording.
  if (maritalStatus === 'married' || maritalStatus === 'single') params.set('ms', maritalStatus);
  const res = await fetch(`/api/vedic-reading?${params.toString()}`);
  if (!res.ok) throw new Error('Reading service unavailable');
  const data = await res.json();
  if (!data?.facts) throw new Error('Incomplete reading data');
  return data as ReadingPayload;
}
