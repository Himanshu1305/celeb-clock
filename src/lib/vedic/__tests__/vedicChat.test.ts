import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';
import { CRISIS_RESPONSE, HEALTH_REDIRECT_RESPONSE, UNSAFE_REPLY_FALLBACK } from '../chatGuardrails';
import { buildChatReply, POST as chat } from '../../../../api/vedic-chat';

const REF = new Date(Date.UTC(2026, 8, 9));
const BIRTH = { y: 1988, m: 11, d: 5, h: 12, min: 30, lat: 28.6139, lon: 77.209, tz: 5.5 };
async function facts() {
  const c = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.209, timezoneOffset: 5.5 }, { refDate: REF });
  return extractReadingFacts(c);
}
const post = (body: any) => chat(new Request('http://localhost/api/vedic-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));

describe('buildChatReply — grounding, sanitisation, degradation', () => {
  it('a clean model reply passes through with grounding attached', async () => {
    const gen = async () => 'This period is traditionally associated with reflection; you may find rest helpful.';
    const r = await buildChatReply(await facts(), [], 'how is my year?', gen);
    expect(r.sanitized).toBe(false);
    expect(r.reply).toMatch(/traditionally associated/);
    expect(r.grounding).toEqual(expect.arrayContaining([expect.stringContaining('Rashi:Kanya'), expect.stringContaining('Dasha:Rahu/Moon')]));
  });
  it('an unsafe model reply is replaced with the safe fallback, never shown', async () => {
    const gen = async () => 'You will definitely get rich — invest in gold and buy property.';
    const r = await buildChatReply(await facts(), [], 'will I be rich?', gen);
    expect(r.sanitized).toBe(true);
    expect(r.reply).toBe(UNSAFE_REPLY_FALLBACK);
    expect(r.redFlags && r.redFlags.length).toBeGreaterThan(0);
  });
  it('a model error degrades gracefully (no crash)', async () => {
    const gen = async () => { throw new Error('Gemini API error: 503'); };
    const r = await buildChatReply(await facts(), [], 'hello', gen);
    expect(r.degraded).toBe(true);
    expect(r.reply).toMatch(/try again/i);
  });
});

describe('chat endpoint — safety short-circuits (no model call needed)', () => {
  it('CRISIS message returns the crisis response, before rate limit or chart', async () => {
    const res = await post({ birth: BIRTH, message: "I don't want to live anymore", tier: 'free', questionCount: 99 });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.crisis).toBe(true);
    expect(j.reply).toBe(CRISIS_RESPONSE);
  });

  it('HEALTH symptom returns the medical redirect, not an astrological read', async () => {
    const res = await post({ birth: BIRTH, message: 'I have chest pain, what does my chart say?', tier: 'free' });
    const j = await res.json();
    expect(j.healthRedirect).toBe(true);
    expect(j.reply).toBe(HEALTH_REDIRECT_RESPONSE);
  });

  it('empty message → 400 with a gentle prompt', async () => {
    const res = await post({ birth: BIRTH, message: '   ', tier: 'free' });
    expect(res.status).toBe(400);
  });

  it('no birth profile → 400 no-profile (does not guess a chart)', async () => {
    const res = await post({ message: 'what about my career?', tier: 'free' });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toBe('no-profile');
    expect(j.reply).toMatch(/birth details/i);
  });

  it('over the daily limit → 429 with a clear message', async () => {
    const res = await post({ birth: BIRTH, message: 'one more?', tier: 'free', questionCount: 3 });
    expect(res.status).toBe(429);
    const j = await res.json();
    expect(j.rateLimited).toBe(true);
    expect(j.reply).toMatch(/free questions for today/i);
  });

  it('crisis overrides the rate limit (distress is never blocked by the cap)', async () => {
    const res = await post({ birth: BIRTH, message: 'I want to end my life', tier: 'free', questionCount: 99 });
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(j.crisis).toBe(true);
  });
});
