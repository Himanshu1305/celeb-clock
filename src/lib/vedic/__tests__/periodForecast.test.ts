import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { buildPeriodForecast } from '../periodForecast';

const refChart = () => calculateBirthChart(
  { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.73, longitude: 74.87, timezoneOffset: 5.5 },
  { refDate: new Date(Date.UTC(2026, 9, 9)) },
);
const NOW = Date.UTC(2026, 9, 9);

describe('buildPeriodForecast', () => {
  it('produces yearly (3), quarterly (4) and monthly (12) periods', async () => {
    const chart = await refChart();
    const f = buildPeriodForecast(chart.dashaTimeline!, chart.lagna.rashiIndex, NOW);
    expect(f.yearly).toHaveLength(3);
    expect(f.quarterly).toHaveLength(4);
    expect(f.monthly).toHaveLength(12);
  });

  it('every period is graded, reasoned and names a life area', async () => {
    const chart = await refChart();
    const f = buildPeriodForecast(chart.dashaTimeline!, chart.lagna.rashiIndex, NOW);
    const all = [...f.yearly, ...f.quarterly, ...f.monthly];
    for (const p of all) {
      expect(['strong', 'moderate', 'mild']).toContain(p.grade);
      expect(p.lead.length).toBeGreaterThan(10);
      expect(p.reason.toLowerCase()).toContain('dasha');
      expect(p.area.length).toBeGreaterThan(0);
    }
  });

  it('guardrails: no fixed dates for marriage/illness/death anywhere', async () => {
    const chart = await refChart();
    const f = buildPeriodForecast(chart.dashaTimeline!, chart.lagna.rashiIndex, NOW);
    const text = [...f.yearly, ...f.quarterly, ...f.monthly].map(p => `${p.lead} ${p.reason}`).join(' ').toLowerCase() + ' ' + f.note.toLowerCase();
    expect(/\b(will\s+(marry|die)|date of (marriage|death)|you will (fall ill|get married))\b/.test(text)).toBe(false);
  });

  it('monthly periods advance chronologically and are ~30 days long', async () => {
    const chart = await refChart();
    const f = buildPeriodForecast(chart.dashaTimeline!, chart.lagna.rashiIndex, NOW);
    for (let i = 1; i < f.monthly.length; i++) {
      expect(Date.parse(f.monthly[i].start)).toBeGreaterThan(Date.parse(f.monthly[i - 1].start));
    }
    const span = Date.parse(f.monthly[0].end) - Date.parse(f.monthly[0].start);
    expect(Math.round(span / 86400000)).toBe(30);
  });
});
