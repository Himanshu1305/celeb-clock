import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import {
  extractReadingFacts,
  scanForRedFlags,
  scanReadingForRedFlags,
  buildReadingSystemPrompt,
  buildReadingUserPrompt,
  READING_SECTION_KEYS,
  type GeneratedReading,
} from '../readingPrompts';
import { buildReadingPayload } from '../../../../api/vedic-reading';
import { GET as vedicReading } from '../../../../api/vedic-reading';

const REF = new Date(Date.UTC(2026, 8, 9, 0, 0, 0));
const REFERENCE = { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 };
const SYDNEY = { year: 1975, month: 7, day: 20, hour: 23, minute: 45, latitude: -33.8688, longitude: 151.2093, timezoneOffset: 10 };
const POLAR = { ...REFERENCE, latitude: 69.6, longitude: 18.9, timezoneOffset: 1 };

// A clean, realistic fake reading (deterministic — no network). Mirrors the
// shape/tone the real model returns, and deliberately avoids red-flag phrases.
const CLEAN_READING: GeneratedReading = {
  snapshot: 'With your grounded rising sign and thoughtful Moon, you bring quiet steadiness to what you do.',
  career: 'This period is traditionally associated with steady, methodical progress; you may find patience rewarded.',
  relationships: 'You tend to show care through practical devotion; gentle patience helps connections deepen.',
  health: 'Steady daily rhythms and unhurried rest tend to support your general wellbeing.',
  money: 'A calm, prudent mindset around resources often brings you a grounded sense of security.',
  family: 'Home tends to be where you seek order and quiet support, offering a sensible voice to relatives.',
  rightNow: 'This phase is traditionally associated with reflection; simple routines may help you feel anchored.',
  doshas: 'Your chart is calm and free of major traditional patterns — simply mindful living is the gentle suggestion.',
  divisional: 'In one classical reading, deeper layers suggest resilience that grows with maturity — one of several traditional perspectives.',
};

const fakeGoodGenerator = async () => CLEAN_READING;
const fakeThrowingGenerator = async () => { throw new Error('Gemini API error: 503'); };
const fakeUnsafeGenerator = async () => ({ ...CLEAN_READING, career: 'You will definitely get rich — invest and buy now.' });

async function factsFor(input: typeof REFERENCE) {
  const chart = await calculateBirthChart(input, { refDate: REF });
  return extractReadingFacts(chart);
}

describe('Reading — POSITIVE: reference chart produces complete, clean text (all 5 sections)', () => {
  it('all 9 fields present, non-empty, no placeholders, no red flags', async () => {
    const facts = await factsFor(REFERENCE);
    const payload = await buildReadingPayload(facts, fakeGoodGenerator);
    expect(payload.degraded).toBe(false);
    expect(payload.reading).not.toBeNull();
    for (const k of READING_SECTION_KEYS) {
      expect(payload.reading![k].length).toBeGreaterThan(10);
      expect(payload.reading![k]).not.toMatch(/undefined|null|\{\{|\}\}|lorem/i);
    }
    expect(Object.keys(scanReadingForRedFlags(payload.reading!))).toHaveLength(0);
    // the exact prompt + input are stored alongside (spec requirement)
    expect(payload.prompt.systemPrompt).toContain('Vedic astrology');
    expect(payload.prompt.userPrompt).toContain('Kanya'); // reference Moon sign in the prompt
    expect(payload.fieldsUsed.career).toContain('current Dasha');
  });
});

describe('Reading — POSITIVE: a very different chart (Sydney 1975, southern hemisphere) also works', () => {
  it('produces a complete payload and reflects that chart\'s facts', async () => {
    const facts = await factsFor(SYDNEY);
    const payload = await buildReadingPayload(facts, fakeGoodGenerator);
    expect(payload.degraded).toBe(false);
    expect(payload.facts.rashi).toBe('Dhanu');
    expect(payload.facts.doshas.mangal.present).toBe(true); // Sydney chart has Mangal Dosha
    expect(payload.prompt.userPrompt).toContain('Mangal Dosha: present');
  });
});

describe('Reading — NEGATIVE: Gemini failure degrades gracefully (no crash, no blank, facts kept)', () => {
  it('generator throws → degraded:true, reading:null, facts still present', async () => {
    const facts = await factsFor(REFERENCE);
    const payload = await buildReadingPayload(facts, fakeThrowingGenerator);
    expect(payload.degraded).toBe(true);
    expect(payload.reading).toBeNull();
    expect(payload.degradedReason).toContain('503');
    expect(payload.facts.rashi).toBe('Kanya'); // deterministic facts survive for the UI
  });
});

describe('Reading — NEGATIVE: malformed/missing chart input fails gracefully at the endpoint', () => {
  it('missing y/m/d → 400 (not a crash, not a wrong chart)', async () => {
    const res = await vedicReading(new Request('http://localhost/api/vedic-reading?h=12'));
    expect(res.status).toBe(400);
  });
  it('invalid latitude → 400 with a clear message', async () => {
    const res = await vedicReading(new Request('http://localhost/api/vedic-reading?y=1988&m=11&d=5&lat=999&lon=77&tz=5.5'));
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(String(j.error)).toMatch(/latitude/i);
  });
  it('no Gemini key configured → endpoint still returns 200 degraded (facts only)', async () => {
    const res = await vedicReading(new Request('http://localhost/api/vedic-reading?y=1988&m=11&d=5&h=12&min=30&lat=28.6139&lon=77.2090&tz=5.5'));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.degraded).toBe(true);
    expect(j.facts.rashi).toBe('Kanya'); // UI still has real chart data to show
  });
});

describe('Reading — EDGE: a chart with a real dosha reads calm/remedy-focused (not alarming)', () => {
  it('Sydney (Mangal present) — fallback dosha text stays calm and constructive', async () => {
    const facts = await factsFor(SYDNEY);
    // Simulate AI offline so we exercise the deterministic dosha framing too.
    const payload = await buildReadingPayload(facts, fakeThrowingGenerator);
    expect(payload.facts.doshas.mangal.present).toBe(true);
    // No fear words anywhere in the facts we would surface.
    const factsText = JSON.stringify(payload.facts);
    expect(factsText).not.toMatch(/curse|doomed|danger|unlucky/i);
  });
});

describe('Reading — EDGE: polar-latitude chart surfaces the warning', () => {
  it('payload.warnings contains POLAR_LATITUDE', async () => {
    const facts = await factsFor(POLAR);
    const payload = await buildReadingPayload(facts, fakeGoodGenerator);
    expect(payload.warnings.map(w => w.code)).toContain('POLAR_LATITUDE');
  });
});

describe('Reading — EDGE: D60 / low-confidence content carries softened language', () => {
  it('the D60 disclaimer is present in facts and the system prompt instructs hedging', async () => {
    const facts = await factsFor(REFERENCE);
    expect(facts.divisional.d60Disclaimer).toMatch(/one interpretation/i);
    const sys = buildReadingSystemPrompt();
    expect(sys).toMatch(/less certain|softer language/i);
    expect(sys).toMatch(/Shashtiamsa \(D60\)/);
    const user = buildReadingUserPrompt(facts);
    expect(user).toMatch(/one of several classical methods/i);
  });
});

describe('Reading — CONTENT SAFETY: red-flag phrases are caught and never shown', () => {
  it('scanForRedFlags flags absolute/medical/financial language', () => {
    expect(scanForRedFlags('you will definitely get rich')).toEqual(expect.arrayContaining(['will (absolute prediction)', 'definitely']));
    expect(scanForRedFlags('you must invest and buy shares')).toEqual(expect.arrayContaining(['must', 'invest', 'buy']));
    expect(scanForRedFlags('this may be a diabetes risk')).toEqual(expect.arrayContaining(['diagnosis/disease term']));
    expect(scanForRedFlags('This period is traditionally associated with reflection.')).toEqual([]);
  });
  it('if the model emits red-flag text, the endpoint degrades instead of showing it', async () => {
    const facts = await factsFor(REFERENCE);
    const payload = await buildReadingPayload(facts, fakeUnsafeGenerator);
    expect(payload.degraded).toBe(true);
    expect(payload.degradedReason).toBe('safety');
    expect(payload.reading).toBeNull();
    expect(payload.redFlags).toBeDefined();
  });
});
