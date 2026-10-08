import { describe, it, expect } from 'vitest';
import {
  computeFestivalCalendar,
  majorFestivals,
  computeSankrantis,
  amantaMonths,
  LUNAR_MONTHS,
} from '../festivals';

// Reference dates from Drik Panchang (IST) for 2025 — the established source the
// P1 spec asks us to validate against.
const DRIK_2025: Record<string, string> = {
  'Maha Shivratri': '2025-02-26',
  'Ugadi / Gudi Padwa': '2025-03-30',
  'Ram Navami': '2025-04-06',
  'Hanuman Jayanti': '2025-04-12',
  'Akshaya Tritiya': '2025-04-30',
  'Guru Purnima': '2025-07-10',
  'Raksha Bandhan': '2025-08-09',
  'Krishna Janmashtami': '2025-08-16',
  'Ganesh Chaturthi': '2025-08-27',
  'Durga Ashtami': '2025-09-30',
  'Dussehra (Vijayadashami)': '2025-10-02',
  'Karwa Chauth': '2025-10-10',
  'Dhanteras': '2025-10-18',
  'Diwali (Lakshmi Puja)': '2025-10-20',
  'Govardhan Puja': '2025-10-22',
  'Bhai Dooj': '2025-10-23',
};

describe('festival & vrat calendar', () => {
  it('names the 12 amanta months correctly (Chaitra…Phalguna)', () => {
    expect(LUNAR_MONTHS).toHaveLength(12);
    expect(LUNAR_MONTHS[0]).toBe('Chaitra');
    expect(LUNAR_MONTHS[7]).toBe('Kartika');
    const names = amantaMonths(2025).map(m => m.name);
    // every non-adhik month name must be a known lunar month
    for (const n of names) expect(n.startsWith('Adhik') || LUNAR_MONTHS.includes(n)).toBe(true);
  });

  it('computes 12 Sankrantis a year with Makar Sankranti on 14 Jan 2025', () => {
    const sk = computeSankrantis(2025);
    expect(sk).toHaveLength(12);
    const makar = sk.find(s => s.name.startsWith('Makar'));
    expect(makar?.dateISO).toBe('2025-01-14');
  });

  it('matches Drik Panchang for the major 2025 festivals (allow Ghatasthapana ±1)', () => {
    const got = new Map(majorFestivals(2025).map(f => [f.name, f.dateISO]));
    let exact = 0;
    for (const [name, date] of Object.entries(DRIK_2025)) {
      expect(got.get(name), name).toBe(date);
      exact++;
    }
    expect(exact).toBe(Object.keys(DRIK_2025).length);
  });

  it('produces ~24–26 Ekadashis and 12 Purnimas/Amavasyas for the year', () => {
    const c = computeFestivalCalendar(2025);
    const ek = c.festivals.filter(f => f.type === 'ekadashi').length;
    expect(ek).toBeGreaterThanOrEqual(23);
    expect(ek).toBeLessThanOrEqual(27);
    expect(c.festivals.filter(f => f.type === 'purnima').length).toBeGreaterThanOrEqual(11);
    expect(c.festivals.filter(f => f.type === 'amavasya').length).toBeGreaterThanOrEqual(11);
  });

  it('every festival has an ISO date in the requested year, sorted ascending', () => {
    const c = computeFestivalCalendar(2026);
    let prev = '';
    for (const f of c.festivals) {
      expect(f.dateISO.startsWith('2026')).toBe(true);
      expect(f.dateISO >= prev).toBe(true);
      prev = f.dateISO;
    }
  });
});
