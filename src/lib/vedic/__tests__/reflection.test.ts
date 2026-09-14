import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import {
  selectReflectionQuestions, buildReflectionQuestionText,
  REFLECTION_OPTIONS, REFLECTION_ACK, REFLECTION_THEMES,
} from '../reflection';

const NOW = new Date(Date.UTC(2026, 8, 14));
const born = (i: any) => new Date(Date.UTC(i.year, i.month - 1, i.day, Math.floor(i.hour), i.minute) - Math.round(i.timezoneOffset * 60) * 60000);
const mk = async (i: any) => ({ chart: await calculateBirthChart(i, { includeShadbala: false, refDate: NOW }), bd: born(i) });

const INPUTS = {
  chennai78: { year: 1978, month: 3, day: 22, hour: 21, minute: 0, latitude: 13.08, longitude: 80.27, timezoneOffset: 5.5 }, // qualifies all 3
  delhi90: { year: 1990, month: 11, day: 5, hour: 6, minute: 15, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },     // qualifies 2
  baby24: { year: 2024, month: 6, day: 1, hour: 12, minute: 0, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },       // qualifies 0 (edge)
};

describe('Past-Period Reflection (Part R)', () => {
  it('POSITIVE: two different charts produce real, differently-populated questions', async () => {
    const a = await mk(INPUTS.chennai78);
    const b = await mk(INPUTS.delhi90);
    const qa = selectReflectionQuestions(a.chart, a.bd, NOW);
    const qb = selectReflectionQuestions(b.chart, b.bd, NOW);
    expect(qa.length).toBeGreaterThan(0);
    expect(qb.length).toBeGreaterThan(0);
    // genuinely chart-specific: the two charts don't produce identical question sets
    expect(qa.map(q => `${q.theme}:${q.dashaLord}/${q.antardashaLord}`).join('|'))
      .not.toBe(qb.map(q => `${q.theme}:${q.dashaLord}/${q.antardashaLord}`).join('|'));
  });

  it('ACCURACY (zero tolerance): every selected period is a REAL completed, post-birth period in the timeline', async () => {
    for (const key of Object.keys(INPUTS) as (keyof typeof INPUTS)[]) {
      const { chart, bd } = await mk(INPUTS[key]);
      const qs = selectReflectionQuestions(chart, bd, NOW);
      for (const q of qs) {
        const maha = (chart.dashaTimeline || []).find(m => m.lord === q.dashaLord);
        expect(maha, `${key} ${q.theme}: maha ${q.dashaLord} exists`).toBeTruthy();
        const antar = maha!.antardashas.find(a => a.lord === q.antardashaLord && a.start === q.start && a.end === q.end);
        expect(antar, `${key} ${q.theme}: antar ${q.antardashaLord} ${q.start} exists exactly`).toBeTruthy();
        // completed (past) AND lived (post-birth)
        expect(new Date(q.end).getTime()).toBeLessThan(NOW.getTime());
        expect(new Date(q.start).getTime()).toBeGreaterThanOrEqual(bd.getTime());
        // house rule: theme houses jointly signified is baked into selection; assert the theme's houses match its def
        const def = REFLECTION_THEMES.find(t => t.theme === q.theme)!;
        expect(q.houses).toEqual(def.houses);
      }
    }
  });

  it('NEGATIVE: a theme with no qualifying completed period is NOT forced', async () => {
    // delhi90 qualifies for a strict subset of the 3 themes → at least one theme absent
    const { chart, bd } = await mk(INPUTS.delhi90);
    const themes = new Set(selectReflectionQuestions(chart, bd, NOW).map(q => q.theme));
    expect(themes.size).toBeLessThan(3);            // not all themes forced
    expect(themes.size).toBeGreaterThan(0);
  });

  it('EDGE: a very young chart returns nothing to ask (no pre-birth periods offered)', async () => {
    const { chart, bd } = await mk(INPUTS.baby24);
    expect(selectReflectionQuestions(chart, bd, NOW)).toEqual([]);
  });

  it('EDGE: a chart with no dashaTimeline returns []', async () => {
    const { chart, bd } = await mk(INPUTS.chennai78);
    expect(selectReflectionQuestions({ ...chart, dashaTimeline: undefined }, bd, NOW)).toEqual([]);
  });

  it('WORDING: exact template, load-bearing hedging present, no over-confidence', async () => {
    const { chart, bd } = await mk(INPUTS.chennai78);
    const q = selectReflectionQuestions(chart, bd, NOW)[0];
    expect(q.questionText).toContain('A quick reflection — no right or wrong answer here.');
    expect(q.questionText).toContain('is traditionally linked to themes of');
    expect(q.questionText).toContain('Did anything along those lines happen for you during that time?');
    // never states it WILL/DID/definitely happened
    expect(q.questionText).not.toMatch(/\b(will|definitely|certainly|guaranteed|proves|because you)\b/i);
  });

  it('WORDING: single-planet collapse when maha lord == antar lord', () => {
    expect(buildReflectionQuestionText('Venus', 'Venus', '2005-01-01', '2006-01-01', 'x'))
      .toContain('your Venus period ran from');
    expect(buildReflectionQuestionText('Venus', 'Saturn', '2005-01-01', '2006-01-01', 'x'))
      .toContain('your Venus–Saturn period ran from');
  });

  it('exact response options and acknowledgments (tone is part of the spec)', () => {
    expect([...REFLECTION_OPTIONS]).toEqual(['Yes, that fits', 'Not really', "I don't remember"]);
    expect(REFLECTION_ACK['Yes, that fits']).toBe("That's good to know — thank you for sharing.");
    expect(REFLECTION_ACK['Not really']).toBe("That's completely normal — not every classical pattern shows up the same way for everyone. Thanks for letting us know.");
    expect(REFLECTION_ACK["I don't remember"]).toBe('No problem — thanks anyway.');
  });
});
