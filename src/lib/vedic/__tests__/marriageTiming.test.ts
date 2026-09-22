/**
 * Part AC (Part S.2 tense-aware marriage timing + Part S.3 already-married guardrail).
 *
 * Verified against the two real test charts named in the Part S spec (both married
 * June 2006), plus a young chart with no past marriage window. The bar here is honest
 * framing and correct tense/date filtering — NOT event-matching accuracy (which the
 * Part AB research already showed unreachable by any method).
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';
import { verifyTimingClaims } from '../readingSpecificity';
import {
  detectQuestionTense, detectAlreadyMarried, detectSecondMarriageQuestion,
  resolveMarriageContext, buildMarriageDirective, deterministicTimingReply,
  verifyMarriageGuardrail, scanChatResponse,
} from '../chatGuardrails';
import { buildChatReply } from '../../../../api/vedic-chat';

const NOW = new Date(Date.UTC(2026, 8, 20)); // fixed "today" so tense filtering is deterministic

// The two real charts from the Part S spec (noon used — exact birth time was not
// recorded; Venus/Jupiter significators are time-robust and the assertions here are
// structural, not exact-date).
async function facts(chart: { y: number; m: number; d: number; lat: number; lon: number }) {
  const c = await calculateBirthChart(
    { year: chart.y, month: chart.m, day: chart.d, hour: 12, minute: 0, latitude: chart.lat, longitude: chart.lon, timezoneOffset: 5.5 },
    { includeShadbala: true, refDate: NOW });
  return extractReadingFacts(c, NOW);
}
const HIMANSHU = { y: 1978, m: 5, d: 13, lat: 32.7266, lon: 74.8570 }; // Jammu
const SECOND = { y: 1981, m: 7, d: 9, lat: 25.5941, lon: 85.1376 };    // Patna

// Mirror the guardrail's future-month logic: upcoming windows' both months + current
// windows' END month only (a current window's START is in the past).
const futureMonths = (f: any) => {
  const cat = f.timing.categories.find((c: any) => c.key === 'marriage');
  const s = new Set<string>();
  for (const w of cat.upcoming) {
    const [startM, endM] = w.range.split(' to ').map((x: string) => x.trim());
    if (w.status === 'upcoming') { if (startM) s.add(startM); if (endM) s.add(endM); }
    else if (w.status === 'current' && endM) s.add(endM);
  }
  return [...s];
};

describe('Part S.2 — tense detection', () => {
  it('classifies past / future / ambiguous', () => {
    expect(detectQuestionTense('when did I get married')).toBe('past');
    expect(detectQuestionTense('when will I get married')).toBe('future');
    expect(detectQuestionTense('am I going to get married')).toBe('future');
    expect(detectQuestionTense('tell me about my marriage timing')).toBe('ambiguous');
    expect(detectQuestionTense('my marriage')).toBe('ambiguous');
  });
});

describe('Part S.3 — marital-status detection', () => {
  it('detects already-married phrasing', () => {
    for (const q of ['my wife and I argue', 'my husband is a Leo', "I'm already married", 'we got married in 2006', 'when did I get married'])
      expect(detectAlreadyMarried(q), q).toBe(true);
    for (const q of ['when will I get married', 'will I ever find love', 'tell me about marriage'])
      expect(detectAlreadyMarried(q), q).toBe(false);
  });
  it('detects a direct second-marriage question', () => {
    for (const q of ['will I marry again', 'does my chart show a second marriage', 'am I likely to remarry'])
      expect(detectSecondMarriageQuestion(q), q).toBe(true);
    expect(detectSecondMarriageQuestion('when will I get married')).toBe(false);
  });
});

describe('Part S.2/S.3 — system-prompt directive', () => {
  it('past-tense directive carries the verbatim honest opener', () => {
    const d = buildMarriageDirective({ tense: 'past', alreadyMarried: false, asksSecondMarriage: false });
    expect(d).toMatch(/can't pinpoint a specific date for a past event/);
    expect(d).toMatch(/won't invent an explanation to make it fit/);
  });
  it('already-married directive forbids future windows + second marriage', () => {
    const d = buildMarriageDirective({ tense: 'ambiguous', alreadyMarried: true, asksSecondMarriage: false });
    expect(d).toMatch(/ALREADY MARRIED/);
    expect(d).toMatch(/NOT .*future/);
    expect(d).toMatch(/multiple-marriage/i);
  });
  it('direct second-marriage directive requires the no-evidence caveat', () => {
    const d = buildMarriageDirective({ tense: 'future', alreadyMarried: true, asksSecondMarriage: true });
    expect(d).toMatch(/NO predictive evidence/);
    expect(d).toMatch(/never frame it as a prediction/i);
  });
});

describe('Part S.2 — tense-aware deterministic reply (both real charts)', () => {
  for (const [name, chart] of [['himanshu 1978', HIMANSHU], ['second 1981', SECOND]] as const) {
    it(`${name}: PAST-tense answer is past-only, honest, cites only real dates`, async () => {
      const f = await facts(chart);
      const reply = deterministicTimingReply(f.timing, 'marriage', resolveMarriageContext('when did I get married'))!;
      expect(reply).toMatch(/can't pinpoint a specific date for a past event/);
      // never a fabricated date; never a FUTURE window month
      expect(verifyTimingClaims(reply, f.timing.validMonths).wrong).toHaveLength(0);
      for (const mth of futureMonths(f)) expect(reply).not.toContain(mth);
      expect(scanChatResponse(reply)).toHaveLength(0);
    });
    it(`${name}: FUTURE-tense answer frames as possibility, cites only real dates`, async () => {
      const f = await facts(chart);
      const reply = deterministicTimingReply(f.timing, 'marriage', resolveMarriageContext('when will I get married'))!;
      expect(reply).toMatch(/heightened possibility|doesn't show a strong upcoming/);
      expect(verifyTimingClaims(reply, f.timing.validMonths).wrong).toHaveLength(0);
      expect(scanChatResponse(reply)).toHaveLength(0);
    });
    it(`${name}: AMBIGUOUS answer shows both directions`, async () => {
      const f = await facts(chart);
      const reply = deterministicTimingReply(f.timing, 'marriage', resolveMarriageContext('tell me about my marriage timing'))!;
      expect(reply).toMatch(/Looking back/);
      expect(reply).toMatch(/Looking ahead|Right now you're in/);
      expect(verifyTimingClaims(reply, f.timing.validMonths).wrong).toHaveLength(0);
    });
  }

  it('no past window → honest "haven\'t yet passed through" message (past-tense)', () => {
    // Synthetic timing with an empty marriage history (a genuinely young chart has no
    // ended significator window). Deterministic, independent of ephemeris drift.
    const timing: any = {
      categories: [{ key: 'marriage', label: 'Marriage', significators: ['Venus', 'Jupiter'], next: null, upcoming: [], past: [], note: '' }],
      yogas: [], doshaTiming: [], divisionalTiming: [], currentPeriod: null, validRanges: [], validMonths: [],
    };
    const reply = deterministicTimingReply(timing, 'marriage', resolveMarriageContext('when did I get married'))!;
    expect(reply).toMatch(/haven't yet passed through a significant Venus/);
    expect(scanChatResponse(reply)).toHaveLength(0);
  });
});

describe('Part S.3 — marriage guardrail enforcement', () => {
  it('flags a future window surfaced to an already-married person', async () => {
    const f = await facts(HIMANSHU);
    const fut = futureMonths(f);
    const ctx = resolveMarriageContext('my wife and I — when did we get married?');
    if (fut.length) {
      const bad = `Your next marriage window is your Venus Antardasha around ${fut[0]}.`;
      expect(verifyMarriageGuardrail(bad, ctx, f.timing).some(x => x.startsWith('future-window'))).toBe(true);
    }
    const good = deterministicTimingReply(f.timing, 'marriage', ctx)!;
    expect(verifyMarriageGuardrail(good, ctx, f.timing)).toHaveLength(0); // our own past-only reply is clean
  });
  it('flags a volunteered second marriage but allows it when directly asked', async () => {
    const f = await facts(HIMANSHU);
    const married = resolveMarriageContext('my husband and I are happy');
    expect(verifyMarriageGuardrail('Your chart shows a possible second marriage.', married, f.timing))
      .toContain('volunteered-second-marriage');
    const asked = resolveMarriageContext('does my chart show a second marriage?');
    expect(verifyMarriageGuardrail('Traditionally a second-marriage combination is present, with no predictive evidence.', asked, f.timing))
      .toHaveLength(0);
  });
});

describe('Part S.3 — buildChatReply end-to-end (already-married never gets a future window)', () => {
  it('retries a future-window answer, then falls back to a past-only deterministic reply', async () => {
    const f = await facts(HIMANSHU);
    const fut = futureMonths(f);
    // model keeps trying to surface a future window for an already-married past question
    const gen = async () => `Your next relationship window is coming up around ${fut[0] || 'March 2030'}.`;
    const out = await buildChatReply(f, [], 'my wife and I — when did I get married?', gen);
    // the surfaced future month must never reach the user
    for (const mth of fut) expect(out.reply).not.toContain(mth);
    expect(out.reply).not.toMatch(/second marriage|marry again/i);
  });
});
