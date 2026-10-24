// f5-city-picker — the birthplace confirm line and its historical-offset wording.
//
// Reference for every expected offset: the IANA time-zone database (tzdb 2025b as shipped
// in Node's ICU — the same data browsers and Cloudflare Workers use), cross-checked with:
//   • Pontiac MI, 3 Dec 1999 = EST UTC−5; 3 Jul 1999 = EDT UTC−4 (US DST rules 1987–2006)
//   • London, 10 Jun 1992 = BST UTC+1; 1 Jun 1944 = British Double Summer Time UTC+2
//   • Sydney, 25 Dec 2001 = AEDT UTC+11
//   • Kolkata = IST UTC+5:30 (no DST); Delhi/Kolkata 1942–45 war time UTC+6:30
//     (Wikipedia "Time in India": war time from 1 Sep 1942 to 15 Oct 1945)
//   • Singapore 1975 = UTC+7:30 (changed to UTC+8 on 1 Jan 1982)
// Coordinates: English Wikipedia city articles (Pontiac MI 42.64611, −83.2925).
import { describe, it, expect } from 'vitest';
import { describeBirthZone, birthPlaceConfirmLine, formatOffsetShort } from '../placeConfirm';

const NOW = new Date('2026-10-24T12:00:00Z');
const PONTIAC_MI = { lat: 42.64611, lon: -83.2925 };
const LONDON = { lat: 51.5074, lon: -0.1278 };
const SYDNEY = { lat: -33.8688, lon: 151.2093 };
const KOLKATA = { lat: 22.5726, lon: 88.3639 };
const DELHI = { lat: 28.6139, lon: 77.209 };
const SINGAPORE = { lat: 1.3521, lon: 103.8198 };

const line = (label: string, dob: string, time: string, place: { lat: number; lon: number }) =>
  birthPlaceConfirmLine(label, describeBirthZone(dob, time, place, NOW));

describe('formatOffsetShort', () => {
  it('uses whole hours, :MM for fractional zones and a true minus sign', () => {
    expect(formatOffsetShort(-5)).toBe('UTC−5');
    expect(formatOffsetShort(5.5)).toBe('UTC+5:30');
    expect(formatOffsetShort(5.75)).toBe('UTC+5:45');
    expect(formatOffsetShort(0)).toBe('UTC+0');
  });
});

describe('birth-date confirm line (historical offset for THAT date)', () => {
  it('Pontiac, Michigan — 3 Dec 1999 = EST (UTC−5, standard time)', () => {
    expect(line('Pontiac, Michigan, USA', '1999-12-03', '11:03', PONTIAC_MI))
      .toBe('Born in Pontiac, Michigan, USA · time zone America/Detroit (UTC−5 on that date, standard time)');
  });
  it('Pontiac, Michigan — 3 Jul 1999 = EDT (UTC−4, daylight saving)', () => {
    expect(line('Pontiac, Michigan, USA', '1999-07-03', '11:03', PONTIAC_MI))
      .toBe('Born in Pontiac, Michigan, USA · time zone America/Detroit (UTC−4 on that date, daylight saving)');
  });
  it('London — 10 Jun 1992 = BST (UTC+1, daylight saving)', () => {
    expect(line('London, England, UK', '1992-06-10', '09:00', LONDON))
      .toBe('Born in London, England, UK · time zone Europe/London (UTC+1 on that date, daylight saving)');
  });
  it('Sydney — 25 Dec 2001 = AEDT (UTC+11, daylight saving)', () => {
    expect(line('Sydney, New South Wales, Australia', '2001-12-25', '09:00', SYDNEY))
      .toBe('Born in Sydney, New South Wales, Australia · time zone Australia/Sydney (UTC+11 on that date, daylight saving)');
  });
  it('Kolkata — IST UTC+5:30, no DST wording', () => {
    const s = describeBirthZone('1990-01-01', '10:00', KOLKATA, NOW);
    expect(s.kind).toBe('fixed');
    expect(birthPlaceConfirmLine('Kolkata, West Bengal, India', s))
      .toBe('Born in Kolkata, West Bengal, India · time zone Asia/Kolkata (UTC+5:30 on that date)');
  });
  it('Delhi — 1 Mar 1945 = war time UTC+6:30, said in the line + pre-1970 note', () => {
    const s = describeBirthZone('1945-03-01', '10:00', DELHI, NOW);
    expect(s.kind).toBe('war');
    expect(birthPlaceConfirmLine('Delhi, Delhi, India', s))
      .toBe('Born in Delhi, Delhi, India · time zone Asia/Kolkata (UTC+6:30 on that date, war time — clocks were 1 hour ahead of the usual UTC+5:30)');
    expect(s.pre1970Note).toMatch(/before 1970/);
  });
  it('London — 1 Jun 1944 = double summer time UTC+2 → war time, 2 hours ahead', () => {
    const s = describeBirthZone('1944-06-01', '10:00', LONDON, NOW);
    expect(s.offsetShort).toBe('UTC+2');
    expect(s.kindText).toBe('war time — clocks were 2 hours ahead of the usual UTC+0');
  });
  it('Singapore 1975 = UTC+7:30 → historical clock wording', () => {
    const s = describeBirthZone('1975-05-01', '10:00', SINGAPORE, NOW);
    expect(s.offsetShort).toBe('UTC+7:30');
    expect(s.kind).toBe('historical');
    expect(s.kindText).toBe('the local clock in 1975; today this zone uses UTC+8');
  });
  it('no pre-1970 note for later births', () => {
    expect(describeBirthZone('1992-06-10', '09:00', LONDON, NOW).pre1970Note).toBeNull();
  });
  it('without a birth date it says so instead of pretending', () => {
    const s = describeBirthZone('', '', PONTIAC_MI, NOW); // 24 Oct 2026 = EDT
    expect(birthPlaceConfirmLine('Pontiac, Michigan, USA', s))
      .toBe('Born in Pontiac, Michigan, USA · time zone America/Detroit (UTC−4 today — add the birth date to see the offset for that day, daylight saving)');
  });
  it('a manual zone is used and labelled', () => {
    const s = describeBirthZone('1999-12-03', '11:03', { ...LONDON, timezone: 'America/Detroit', manualTimezone: true }, NOW);
    expect(birthPlaceConfirmLine('London, England, UK', s, true))
      .toBe('Born in London, England, UK · time zone America/Detroit (UTC−5 on that date, standard time) · set manually');
  });
});

describe('server side: the always-sent tzid', () => {
  it('a tzid equal to the coordinates\' zone is not reported as "set manually"', async () => {
    const { resolveBirthTimezone } = await import('../birthTimezone');
    const same = resolveBirthTimezone({ ...PONTIAC_MI, year: 1999, month: 12, day: 3, hour: 11, minute: 3, timezone: 'America/Detroit' });
    expect(same).toMatchObject({ timezone: 'America/Detroit', utcOffsetHours: -5, source: 'coordinates' });
    const other = resolveBirthTimezone({ ...PONTIAC_MI, year: 1999, month: 12, day: 3, hour: 11, minute: 3, timezone: 'Asia/Kolkata' });
    expect(other).toMatchObject({ utcOffsetHours: 5.5, source: 'manual' });
  });
});
