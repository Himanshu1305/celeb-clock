// Vedic reading generator (Part D). Computes the chart locally (Part B engine),
// asks Gemini for a plain-language, safety-constrained 5-part reading, caches it
// in the EXISTING vedic_chart_cache table under a namespaced `reading-…` key
// (no schema change), and ALWAYS returns deterministic chart facts so the UI can
// render every section even when the AI is unavailable (graceful degradation).

import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import {
  extractReadingFacts,
  buildReadingSystemPrompt,
  buildReadingUserPrompt,
  STRONGER_REMINDER,
  SAFETY_REMINDER,
  READING_RESPONSE_SCHEMA,
  READING_SECTION_KEYS,
  scanReadingForRedFlags,
} from '../src/lib/vedic/readingPrompts.js';
import { verifyReadingClaims, scoreReadingSpecificity } from '../src/lib/vedic/readingSpecificity.js';

const GEMINI_MODEL = 'gemini-flash-latest';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
  });
}

async function getSupabase(env) {
  const url = (env && env.SUPABASE_URL) || process.env.SUPABASE_URL;
  const key = (env && env.SUPABASE_SERVICE_ROLE_KEY) || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

// Bump READING_VERSION whenever the prompt/output format changes materially, so
// old cached readings are not served after an upgrade. v2 = Part D-Fix specificity
// + warmth (strength-in-words) overhaul.
const READING_VERSION = 'v4';
function buildCacheKey(y, m, d, h, min, lat, lon, tz) {
  const rlat = Number(lat).toFixed(4);
  const rlon = Number(lon).toFixed(4);
  return ['reading', READING_VERSION, y, m, d, h, min, rlat, rlon, tz].join('-');
}

async function getCached(sb, cacheKey) {
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('vedic_chart_cache').select('chart_data').eq('cache_key', cacheKey).maybeSingle();
    if (error || !data) return null;
    sb.from('vedic_chart_cache').update({ last_accessed_at: new Date().toISOString() }).eq('cache_key', cacheKey).then(() => {}, () => {});
    return data.chart_data;
  } catch { return null; }
}

async function setCached(sb, cacheKey, chartData) {
  if (!sb) return;
  try {
    await sb.from('vedic_chart_cache').upsert({ cache_key: cacheKey, chart_data: chartData, source: 'gemini-reading', last_accessed_at: new Date().toISOString() });
  } catch { /* cache write failure must never break the response */ }
}

// Calls Gemini for the structured reading. Returns the parsed reading object or
// throws — the caller degrades gracefully on any throw. Mirrors the longevity-
// coach's safetySettings + block/empty handling.
async function generateReading(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: READING_RESPONSE_SCHEMA,
        // gemini-flash-latest is a thinking model; without this it spends the
        // whole token budget on hidden "thoughts" and truncates the JSON. We
        // don't need chain-of-thought for a templated reading.
        thinkingConfig: { thinkingBudget: 0 },
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  if (data?.promptFeedback?.blockReason) throw new Error(`Gemini blocked: ${data.promptFeedback.blockReason}`);
  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts ?? []).map(p => p?.text).filter(Boolean).join('') || '';
  if (!text) throw new Error('Gemini returned empty text');
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('Gemini returned non-JSON'); }
  // Every section must be present and non-empty.
  for (const k of READING_SECTION_KEYS) {
    if (!parsed[k] || typeof parsed[k] !== 'string' || !parsed[k].trim()) throw new Error(`Gemini reading missing section: ${k}`);
  }
  return parsed;
}

export interface ReadingResult {
  facts: any;
  source: string;
  warnings: any[];
  reading: Record<string, string> | null;
  degraded: boolean;
  degradedReason?: string;
  redFlags?: Record<string, string[]>;
  /** Anti-hallucination results: claims checked/correct + any wrong claim vs the real value. */
  accuracy?: { checked: number; correct: number; wrong: Array<{ section: string; claimed: string; actual: string }> };
  /** Specificity results: which sections still read generic (if any). */
  specificity?: { failing: string[] };
  /** Set when shipped despite low specificity after retries (flagged, not silently shipped). */
  lowSpecificity?: boolean;
  attempts?: number;
  prompt: { systemPrompt: string; userPrompt: string };
  model?: string;
  fieldsUsed?: Record<string, string[]>;
}

// Exposed for reuse/testing: given a chart-facts object, produce the full payload.
// `generate` is injected so tests can supply a fake Gemini. Runs up to 2 attempts,
// gating on safety (never ship flagged text), accuracy (never ship WRONG chart
// facts — retry, then degrade), and specificity (retry; if still generic, ship but
// flag — generic is safe, just low quality).
const MAX_ATTEMPTS = 3;

export async function buildReadingPayload(facts, generate): Promise<ReadingResult> {
  const systemPrompt = buildReadingSystemPrompt();
  const baseUserPrompt = buildReadingUserPrompt(facts);
  const base = { facts, source: 'local', warnings: facts.warnings };
  const pack = (a: ReturnType<typeof verifyReadingClaims>) => ({ checked: a.checked, correct: a.correct, wrong: a.wrong.map(w => ({ section: w.section, claimed: w.claimed, actual: w.actual })) });

  // The best safety-clean + accuracy-clean reading seen so far (may be low-specificity).
  let best: { reading: any; accuracy: ReturnType<typeof verifyReadingClaims>; specificity: ReturnType<typeof scoreReadingSpecificity> } | null = null;
  let sawSafety = false, sawAccuracyWrong = false;
  let lastFlags: Record<string, string[]> = {};
  let lastAccuracy: ReturnType<typeof verifyReadingClaims> | null = null;
  let lastSpecificity: ReturnType<typeof scoreReadingSpecificity> | null = null;
  let needSafety = false, needSpecificity = false;
  let attempt = 0;

  for (attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let userPrompt = baseUserPrompt;
    if (needSpecificity) userPrompt += STRONGER_REMINDER;
    if (needSafety) userPrompt += SAFETY_REMINDER;

    let reading;
    try {
      reading = await generate(systemPrompt, userPrompt);
    } catch (e) {
      if (best) break; // we already have something shippable
      return { ...base, reading: null, degraded: true, degradedReason: String(e?.message || e), attempts: attempt, prompt: { systemPrompt, userPrompt } };
    }

    // Safety — never ship flagged language. Retry rather than immediately fail.
    const flags = scanReadingForRedFlags(reading);
    if (Object.keys(flags).length > 0) { sawSafety = true; needSafety = true; lastFlags = flags; continue; }

    // Accuracy — never ship a WRONG placement. Retry.
    const accuracy = verifyReadingClaims(reading, facts);
    const specificity = scoreReadingSpecificity(reading, facts);
    lastAccuracy = accuracy; lastSpecificity = specificity;
    if (accuracy.wrong.length > 0) { sawAccuracyWrong = true; needSpecificity = true; continue; }

    // Safety-clean + accuracy-clean: this is shippable. Keep it as best.
    best = { reading, accuracy, specificity };
    if (specificity.overallPass) {
      return { ...base, reading, degraded: false, attempts: attempt, model: GEMINI_MODEL, fieldsUsed: facts.fieldsUsed, accuracy: pack(accuracy), specificity: { failing: [] }, prompt: { systemPrompt, userPrompt } };
    }
    needSpecificity = true; // shippable but generic — try once more for a full pass
  }

  if (best) {
    // Safe + accurate, but never hit a full specificity pass → ship, but FLAG it.
    return { ...base, reading: best.reading, degraded: false, lowSpecificity: !best.specificity.overallPass, attempts: attempt - 1, model: GEMINI_MODEL, fieldsUsed: facts.fieldsUsed, accuracy: pack(best.accuracy), specificity: { failing: best.specificity.failing }, prompt: { systemPrompt, userPrompt: baseUserPrompt } };
  }
  // Nothing shippable across all attempts → degrade to facts (never ship unsafe/wrong).
  const reason = sawAccuracyWrong && !sawSafety ? 'accuracy' : sawSafety ? 'safety' : 'unspecific';
  return {
    ...base, reading: null, degraded: true, degradedReason: reason, attempts: attempt - 1,
    redFlags: reason === 'safety' ? lastFlags : undefined,
    accuracy: lastAccuracy ? pack(lastAccuracy) : undefined, specificity: lastSpecificity ? { failing: lastSpecificity.failing } : undefined,
    prompt: { systemPrompt, userPrompt: baseUserPrompt },
  };
}

async function handler(request, env?) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k, def?) => { const v = searchParams.get(k); return (v === null || v === '') ? def : Number(v); };
  const y = n('y'), m = n('m'), d = n('d');
  if (![y, m, d].every(v => Number.isFinite(v))) return json({ error: 'Missing y/m/d' }, 400);
  const h = n('h', 12), min = n('min', 0), lat = n('lat', 28.6139), lon = n('lon', 77.2090), tz = n('tz', 5.5);

  try {
    const sb = await getSupabase(env);
    const cacheKey = buildCacheKey(y, m, d, h, min, lat, lon, tz);

    const cached = await getCached(sb, cacheKey);
    if (cached) return json({ ...cached, _cache: 'hit' });

    // Chart via the local engine (Part B). Invalid input throws → 400.
    let chart;
    try {
      chart = await calculateBirthChart({ year: y, month: m, day: d, hour: h, minute: min, latitude: lat, longitude: lon, timezoneOffset: tz }, { includeShadbala: true });
    } catch (inputErr) {
      return json({ error: String(inputErr?.message || inputErr) }, 400);
    }

    const facts = extractReadingFacts(chart);
    const payload = await buildReadingPayload(facts, generateReading);

    // Only cache a full, safe AI reading — never cache a degraded/fallback
    // response (so a transient Gemini outage isn't frozen into the cache).
    if (!payload.degraded) await setCached(sb, cacheKey, payload);

    return json({ ...payload, _cache: 'miss' });
  } catch (e) {
    return json({ error: 'reading-failed', detail: String(e?.message || e) }, 500);
  }
}

export const GET = handler;
