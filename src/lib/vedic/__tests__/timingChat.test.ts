import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';
import { verifyReadingClaims, verifyTimingClaims } from '../readingSpecificity';
import {
  detectTimingQuestion, classifyTimingCategory, deterministicTimingReply, scanChatResponse,
} from '../chatGuardrails';
import { buildChatReply } from '../../../../api/vedic-chat';

const NOW = new Date(Date.UTC(2026, 8, 10));
async function refFacts() {
  const c = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 }, { includeShadbala: true, refDate: NOW });
  return extractReadingFacts(c, NOW);
}

describe('timing-question detection & classification', () => {
  it('recognises real-world phrasings as timing questions', () => {
    for (const q of ['when will I get rich', 'when will I get a job', 'when will I get married',
      "when's my dhana yoga gonna kick in", 'will I be rich soon', 'good time to start a business?',
      'give me the exact day I will get rich', 'how many years until marriage']) {
      expect(detectTimingQuestion(q), q).toBe(true);
    }
  });
  it('does NOT flag non-timing questions', () => {
    for (const q of ['what is my moon sign', 'how are you', 'tell me about my personality', 'what does saturn mean'])
      expect(detectTimingQuestion(q), q).toBe(false);
  });
  it('classifies category for the deterministic fallback', () => {
    expect(classifyTimingCategory('when will I get rich')).toBe('wealth');
    expect(classifyTimingCategory('when will I get a job')).toBe('career');
    expect(classifyTimingCategory('when will I get married')).toBe('marriage');
    expect(classifyTimingCategory('what is my nakshatra')).toBeNull();
  });
});

describe('date-accuracy guard (zero tolerance)', () => {
  it('flags a fabricated Month-Year and passes real computed ones', async () => {
    const f = await refFacts();
    const real = f.timing.validMonths[0]; // a genuine computed endpoint
    const bad = verifyTimingClaims(`Your window is ${real} to somewhere, but also February 1999.`, f.timing.validMonths);
    expect(bad.wrong.map(w => w.claimed)).toContain('February 1999');
    expect(bad.wrong.map(w => w.claimed)).not.toContain(real);
    const clean = verifyTimingClaims(`Your window runs around ${real}.`, f.timing.validMonths);
    expect(clean.wrong).toHaveLength(0);
    expect(clean.checked).toBeGreaterThan(0);
  });

  it('verifyReadingClaims flags a reading that cites a fabricated date', async () => {
    const f = await refFacts();
    const good = f.timing.validMonths[0];
    const reading: any = {
      money: `Your strongest window is around ${good}.`,
      career: 'Your Mercury Antardasha from March 1975 to August 1976 is the peak.', // fabricated (past/not computed)
    };
    const r = verifyReadingClaims(reading, f);
    const dateWrong = r.wrong.filter(w => w.type === 'date-claim');
    expect(dateWrong.length).toBeGreaterThanOrEqual(1);
    expect(dateWrong.some(w => /1975|1976/.test(w.claimed))).toBe(true);
  });
});

describe('deterministic safe fallback', () => {
  it('builds a guaranteed-correct, guardrail-safe reply from the real windows', async () => {
    const f = await refFacts();
    for (const cat of ['wealth', 'career', 'marriage'] as const) {
      const reply = deterministicTimingReply(f.timing, cat)!;
      expect(reply).toBeTruthy();
      // it must cite a REAL computed date and contain NO banned language
      expect(verifyTimingClaims(reply, f.timing.validMonths).wrong).toHaveLength(0);
      expect(scanChatResponse(reply)).toHaveLength(0);
    }
    expect(deterministicTimingReply(f.timing, null)).toBeNull();
  });
});

describe('D-Fix2 hard boundary still holds WITH real dates (Part 4.5)', () => {
  it('a real date RANGE framed as likelihood passes safety; a "you will definitely" + date is still blocked', () => {
    // Legitimate: specific dates, framed as classical likelihood, no yes/no verb.
    const ok = 'Your strongest classical window is your Jupiter Antardasha from September 2027 to November 2029 — traditionally the most supportive period for this.';
    expect(scanChatResponse(ok)).toHaveLength(0);
    // Still forbidden: a literal certainty, even though a real date is attached.
    const bad = 'You will definitely become rich in September 2027.';
    const flags = scanChatResponse(bad);
    expect(flags.length).toBeGreaterThan(0);           // caught by the D-Fix2 boundary
    expect(flags.join(' ')).toMatch(/will|definitely/i);
  });

  it('citing a date range is not a yes/no guarantee — both boundaries coexist', () => {
    // "guaranteed"/"will" remain banned; a date range with "tends to / your strongest window" is fine.
    expect(scanChatResponse('This is guaranteed by March 2027.').length).toBeGreaterThan(0);
    expect(scanChatResponse('Your Mars Antardasha from September 2026 to September 2027 tends to support this.')).toHaveLength(0);
  });
});

describe('buildChatReply — timing accuracy retry loop (Part F rigor)', () => {
  const facts = async () => refFacts();

  it('passes a good-date answer straight through and marks it timingChecked', async () => {
    const f = await facts();
    const good = `Your Jupiter window is around ${f.timing.validMonths[0]}, traditionally supportive.`;
    const gen = async () => good;
    const out = await buildChatReply(f, [], 'when will I get rich', gen);
    expect(out.reply).toBe(good);
    expect(out.timingChecked).toBe(true);
    expect(out.sanitized).toBeFalsy();
  });

  it('retries on a fabricated date, then falls back to the deterministic correct answer', async () => {
    const f = await facts();
    let calls = 0;
    const gen = async () => { calls++; return 'You will be rich in February 1999 for sure.'; }; // always wrong + banned words
    const out = await buildChatReply(f, [], 'when will I get rich', gen);
    expect(calls).toBe(3);                       // 3 attempts before giving up on the model
    expect(out.timingCorrected).toBe(true);      // deterministic fallback used
    expect(verifyTimingClaims(out.reply, f.timing.validMonths).wrong).toHaveLength(0); // never a wrong date
    expect(scanChatResponse(out.reply)).toHaveLength(0);                                // never banned language
    expect(out.reply).not.toMatch(/February 1999/);
  });

  it('recovers a good answer on retry when the first attempt used a banned word', async () => {
    const f = await facts();
    const goodDate = f.timing.validMonths[0];
    let calls = 0;
    const gen = async () => {
      calls++;
      return calls === 1
        ? `You will definitely be rich around ${goodDate}.`          // banned "will"/"definitely"
        : `Your strongest classical window is around ${goodDate}.`;   // clean, real date
    };
    const out = await buildChatReply(f, [], 'when will I get rich', gen);
    expect(calls).toBe(2);
    expect(out.sanitized).toBeFalsy();
    expect(out.reply).toMatch(new RegExp(goodDate));
  });
});
