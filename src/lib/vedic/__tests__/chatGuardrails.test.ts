import { describe, it, expect } from 'vitest';
import {
  detectCrisis, detectHealthSymptom, scanChatResponse,
  buildChatSystemPrompt, CRISIS_RESPONSE, HEALTH_REDIRECT_RESPONSE, UNSAFE_REPLY_FALLBACK,
} from '../chatGuardrails';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';

const REF = new Date(Date.UTC(2026, 8, 9));
async function facts() {
  const c = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.209, timezoneOffset: 5.5 }, { refDate: REF });
  return extractReadingFacts(c);
}

// NOTE: crisis strings below are TEST-ONLY phrasing, documented as test data.
describe('Guardrail: crisis detection (deterministic, overrides all)', () => {
  const hits = [
    'I feel like I don\'t want to live anymore',
    'sometimes I think about killing myself',
    'there is no reason to go on',
    'I want to end my life',
    'everyone would be better off without me',
    'I have been self-harming',
  ];
  const misses = [
    'this deadline is killing me',
    'I am dying to see the results',
    'my career is dead right now',
    'I want to kill this presentation at work',
    'what does my chart say about my life',
  ];
  it('flags genuine crisis signals', () => hits.forEach(h => expect(detectCrisis(h), h).toBe(true)));
  it('does NOT flag common idioms', () => misses.forEach(m => expect(detectCrisis(m), m).toBe(false)));
});

describe('Guardrail: crisis response copy', () => {
  it('drops astrology, is warm, and lists real resources', () => {
    // Must not EXPLAIN their pain through astrology. (It may say it's setting
    // "a birth chart" aside — that's the point — so we forbid the explanatory
    // terms, not the word "chart".)
    expect(CRISIS_RESPONSE).not.toMatch(/saturn|rahu|dasha|nakshatra|transit/i);
    expect(CRISIS_RESPONSE).toMatch(/988/);
    expect(CRISIS_RESPONSE).toMatch(/iCall|AASRA|Vandrevala/);
    expect(CRISIS_RESPONSE).toMatch(/findahelpline\.com/);
    expect(CRISIS_RESPONSE).toMatch(/emergency/i);
  });
});

describe('Guardrail: health-symptom detection + redirect', () => {
  const symptoms = ['I have chest pain', 'shortness of breath for two days', 'I found a lump', 'I have a sharp pain in my stomach', 'I have been bleeding'];
  const nonSymptoms = ['what does my chart say about my health this year', 'will I have good health', 'how is my wellbeing'];
  it('flags described physical symptoms', () => symptoms.forEach(s => expect(detectHealthSymptom(s), s).toBe(true)));
  it('does NOT flag general health questions', () => nonSymptoms.forEach(s => expect(detectHealthSymptom(s), s).toBe(false)));
  it('redirect copy sends to a doctor and does not diagnose', () => {
    expect(HEALTH_REDIRECT_RESPONSE).toMatch(/see a doctor|medical opinion|health service/i);
    expect(scanChatResponse(HEALTH_REDIRECT_RESPONSE)).toEqual([]); // the redirect itself is clean
  });
});

describe('Guardrail: output scanner', () => {
  it('flags absolute predictions, financial instructions, diagnosis phrasing', () => {
    expect(scanChatResponse('you will definitely be rich')).toEqual(expect.arrayContaining(['will (absolute prediction)', 'definitely']));
    expect(scanChatResponse('you should invest in stocks now')).toEqual(expect.arrayContaining(['named stock/asset instruction']));
    expect(scanChatResponse('you have a serious disease')).toEqual(expect.arrayContaining(['diagnosis/disease term']));
    expect(scanChatResponse('you should quit your job')).toEqual(expect.arrayContaining(['definitive decision verdict']));
  });
  it('passes clean, grounded, hedged text', () => {
    expect(scanChatResponse('This period is traditionally associated with reflection; you may find rest helpful.')).toEqual([]);
  });
  it('the unsafe-reply fallback is itself clean and redirects', () => {
    expect(scanChatResponse(UNSAFE_REPLY_FALLBACK)).toEqual([]);
    expect(UNSAFE_REPLY_FALLBACK).toMatch(/doctor|professional/i);
  });
});

describe('Guardrail: system prompt encodes all categories + grounds in the chart', () => {
  it('contains the chart facts and every guardrail rule', async () => {
    const sys = buildChatSystemPrompt(await facts());
    expect(sys).toContain('Kanya');            // this chart's Moon sign
    expect(sys).toContain('Uttara Phalguni');  // this chart's nakshatra
    expect(sys).toMatch(/HEALTH/); expect(sys).toMatch(/CRISIS/); expect(sys).toMatch(/MAJOR LIFE/i);
    expect(sys).toMatch(/Mangal Dosha/); expect(sys).toMatch(/invest/); expect(sys).toMatch(/you will/);
    expect(sys).toMatch(/GROUNDING/);
  });
});
