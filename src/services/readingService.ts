/**
 * Client wrapper for the Vedic reading endpoint (`/api/vedic-reading`).
 * The reading is generated server-side (Gemini, with the chart computed by the
 * Part B engine); this fetches it. The response ALWAYS carries deterministic
 * chart `facts`, plus an AI `reading` (null when the AI is unavailable — the UI
 * then falls back to the facts rather than showing a blank or error).
 */

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
  placements: Array<{ planet: string; sign: string; house: number; retrograde: boolean }>;
  doshas: {
    mangal: { present: boolean; severityLabel: string };
    kaalSarp: { present: boolean; isPartial: boolean; type: string | null };
    sadeSati: { active: boolean; phase: string | null };
  };
  divisional: { d9Moon: string; d10Sun: string; d60Moon: string; d60Disclaimer: string };
  warnings: Array<{ code: string; message: string }>;
}

export interface ReadingPayload {
  facts: ReadingFactsClient;
  reading: ReadingSections | null;
  degraded: boolean;
  degradedReason?: string;
  warnings: Array<{ code: string; message: string }>;
  source: string;
  _cache?: string;
}

export async function fetchReading(
  dob: string, time: string, loc: { lat: number; lon: number; tz: number }
): Promise<ReadingPayload> {
  const [y, m, d] = dob.split('-');
  const [h, min] = time.split(':');
  const params = new URLSearchParams({ y, m, d, h, min, lat: String(loc.lat), lon: String(loc.lon), tz: String(loc.tz) });
  const res = await fetch(`/api/vedic-reading?${params.toString()}`);
  if (!res.ok) throw new Error('Reading service unavailable');
  const data = await res.json();
  if (!data?.facts) throw new Error('Incomplete reading data');
  return data as ReadingPayload;
}
