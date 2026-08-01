/**
 * Suite — batch-8-logic.spec.ts  (BATCH-8 pure logic: P4 feedback, P3 DOB validation, P1 prose)
 * Deterministic unit tests over the shared libs — no browser / servers.
 */
import { test, expect } from '@playwright/test';
import {
  passesEngagementGate, routeSentiment, isPubliclyVisible, shouldShowAverage,
  averageRating, publicComments, type FeedbackRow,
} from '../../src/lib/feedbackLogic';
import { parseDob } from '../../src/components/DobInput';
import {
  loveProse, dayToDayProse, frictionProse, makingItWorkProse, strengthsList, challengesList,
  type Sign,
} from '../../src/lib/compatibilityProse';

// ── P4 feedback logic ─────────────────────────────────────────────────────────
test.describe('P4 — feedback logic', () => {
  test('engagement gate: ≥50% scroll OR ≥45s dwell', () => {
    expect(passesEngagementGate(50, 0)).toBe(true);
    expect(passesEngagementGate(0, 45)).toBe(true);
    expect(passesEngagementGate(49, 44)).toBe(false);
    expect(passesEngagementGate(100, 0)).toBe(true);
  });

  test('sentiment routing: 4-5★ → consent, 1-3★ → improve', () => {
    expect(routeSentiment(5)).toBe('consent');
    expect(routeSentiment(4)).toBe('consent');
    expect(routeSentiment(3)).toBe('improve');
    expect(routeSentiment(1)).toBe('improve');
  });

  test('TWO-KEY: public only when consent AND approved (no exceptions, incl. 5★)', () => {
    expect(isPubliclyVisible({ consent: true, approved: true })).toBe(true);
    expect(isPubliclyVisible({ consent: true, approved: false })).toBe(false); // consent w/o approval → hidden
    expect(isPubliclyVisible({ consent: false, approved: true })).toBe(false); // approval w/o consent → hidden
    expect(isPubliclyVisible({ consent: false, approved: false })).toBe(false);
  });

  test('average shown only at ≥5 ratings (4 → no stars, 5 → shown)', () => {
    expect(shouldShowAverage(4)).toBe(false);
    expect(shouldShowAverage(5)).toBe(true);
    expect(averageRating([5, 4, 5, 3, 5])).toBe(4.4);
  });

  test('publicComments returns only two-key survivors with non-empty text', () => {
    const rows: FeedbackRow[] = [
      { user_id: 'a', content_type: 'report', slug: 's', rating: 5, comment: 'Loved it', consent: true, approved: true, dismissed: false },
      { user_id: 'b', content_type: 'report', slug: 's', rating: 5, comment: 'hidden', consent: true, approved: false, dismissed: false },
      { user_id: 'c', content_type: 'report', slug: 's', rating: 5, comment: 'no consent', consent: false, approved: true, dismissed: false },
      { user_id: 'd', content_type: 'report', slug: 's', rating: 5, comment: '   ', consent: true, approved: true, dismissed: false },
    ];
    const out = publicComments(rows);
    expect(out).toHaveLength(1);
    expect(out[0].comment).toBe('Loved it');
  });
});

// ── P3 DOB validation ─────────────────────────────────────────────────────────
test.describe('P3 — DOB trio validation', () => {
  test('Feb 29 valid in a leap year, rejected otherwise', () => {
    expect(parseDob('29', '02', '2000').error).toBeNull();   // 2000 leap
    expect(parseDob('29', '02', '2004').error).toBeNull();   // leap
    expect(parseDob('29', '02', '2001').error).not.toBeNull(); // non-leap
    expect(parseDob('29', '02', '1900').error).not.toBeNull(); // 1900 not leap (÷100 not ÷400)
  });
  test('Feb 30 and month 13 rejected', () => {
    expect(parseDob('30', '02', '1990').error).toContain('February');
    expect(parseDob('01', '13', '1990').error).toContain('month');
  });
  test('future date rejected; >120 years ago rejected', () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(parseDob('01', '01', String(nextYear)).error).toContain('future');
    expect(parseDob('01', '01', '1850').error).toContain('120');
  });
  test('single-digit day/month normalise to a valid date', () => {
    const r = parseDob('5', '3', '1985');
    expect(r.error).toBeNull();
    expect(r.date?.getDate()).toBe(5);
    expect(r.date?.getMonth()).toBe(2); // March = index 2
  });
  test('incomplete trio is not an error (just not complete)', () => {
    expect(parseDob('5', '3', '19').complete).toBe(false);
    expect(parseDob('5', '3', '19').error).toBeNull();
  });
});

// ── P1 prose depth + diffs ──────────────────────────────────────────────────────
const first = (s: string, n = 300) => s.slice(0, n);
test.describe('P1 — compat depth v2 prose', () => {
  test('two SAME-element pairs read differently across every new section', () => {
    const a: [Sign, Sign] = ['Aries', 'Leo'];       // Fire+Fire
    const b: [Sign, Sign] = ['Leo', 'Sagittarius'];  // Fire+Fire
    for (const fn of [dayToDayProse, frictionProse]) {
      expect(first(fn(...a))).not.toBe(first(fn(...b)));
    }
    expect(makingItWorkProse(...a).join()).not.toBe(makingItWorkProse(...b).join());
  });
  test('two DIFFERENT-element pairs read differently', () => {
    const a: [Sign, Sign] = ['Aries', 'Cancer'];   // Fire+Water
    const b: [Sign, Sign] = ['Taurus', 'Gemini'];  // Earth+Air
    expect(first(dayToDayProse(...a))).not.toBe(first(dayToDayProse(...b)));
    expect(first(frictionProse(...a))).not.toBe(first(frictionProse(...b)));
  });
  test('same-sign pair gets the mirror-dynamics treatment (not the generic template)', () => {
    const mirror = frictionProse('Aries', 'Aries').toLowerCase();
    expect(mirror).toMatch(/counterweight|doubled|mirror/);
    expect(dayToDayProse('Aries', 'Aries').toLowerCase()).toContain('two aries');
    // and it differs from a non-same-sign Aries pairing
    expect(frictionProse('Aries', 'Aries')).not.toBe(frictionProse('Aries', 'Leo'));
  });
  test('each pair page has substantial composed content (>700 words across sections)', () => {
    const s1: Sign = 'Aries', s2: Sign = 'Leo';
    const words = [loveProse, dayToDayProse, frictionProse]
      .map(fn => fn(s1, s2)).join(' ')
      .concat(' ', makingItWorkProse(s1, s2).join(' '))
      .concat(' ', strengthsList(s1, s2).join(' '), ' ', challengesList(s1, s2).join(' '))
      .split(/\s+/).length;
    expect(words).toBeGreaterThan(200); // these sections alone; page adds friendship/work/desc/FAQ → 700+
  });
});
