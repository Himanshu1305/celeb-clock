import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { rankCareerFields } from '../careerFields';
import { buildLifeAreas } from '../lifeAreas';

// Reference chart: 1978-05-13 19:30, Jammu (lat 32.73, lon 74.87, tz +5.5).
const refChart = () => calculateBirthChart(
  { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.73, longitude: 74.87, timezoneOffset: 5.5 },
  { includeShadbala: true, refDate: new Date(Date.UTC(2026, 9, 9)) },
);

describe('rankCareerFields', () => {
  it('returns a ranked list and an approach-with-care list with reasons', async () => {
    const chart = await refChart();
    const r = rankCareerFields(chart);
    expect(r.ranked.length).toBeGreaterThanOrEqual(8); // top 3 planets × up to 4 fields
    expect(r.ranked.every(f => ['strong', 'moderate', 'mild'].includes(f.grade))).toBe(true);
    expect(r.ranked.every(f => f.reason.length > 10)).toBe(true);
    expect(r.approachWithCare.length).toBeGreaterThan(0);
    // ranked should not duplicate a field
    const fields = r.ranked.map(f => f.field);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it('is deterministic for the same chart', async () => {
    const [a, b] = await Promise.all([refChart(), refChart()]);
    expect(rankCareerFields(a).ranked.map(f => f.field)).toEqual(rankCareerFields(b).ranked.map(f => f.field));
  });
});

describe('buildLifeAreas', () => {
  it('returns the four graded life-area readings', async () => {
    const chart = await refChart();
    const areas = buildLifeAreas(chart);
    expect(areas.map(a => a.key)).toEqual(['wealth', 'education', 'foreign', 'health']);
    expect(areas.every(a => ['strong', 'moderate', 'mild'].includes(a.grade))).toBe(true);
    expect(areas.every(a => a.lead && a.reason && a.meaning)).toBe(true);
  });

  it('health reading is wellbeing-framed: never a diagnosis, points to a doctor, no dates', async () => {
    const chart = await refChart();
    const health = buildLifeAreas(chart).find(a => a.key === 'health')!;
    const text = `${health.lead} ${health.reason} ${health.meaning}`.toLowerCase();
    expect(text).toContain('doctor');
    expect(text).toContain('never');
    // no illness verdicts or explicit calendar dates
    expect(/\bwill\s+(?:get|be|suffer|develop)\b/.test(text)).toBe(false);
    expect(/\b(19|20)\d{2}\b/.test(text)).toBe(false);
  });
});
