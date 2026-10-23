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

// ── Round-2 audit (T2/T3) regression ─────────────────────────────────────────
// Reference dates copied from Drik Panchang's Hindu calendar pages for New Delhi
// (drikpanchang.com/calendars/hindu/hinducalendar.html?year=YYYY&geoname-id=1261481,
// fetched 23 Oct 2026). Diwali 2036 is from AstroSage (panchang.astrosage.com/
// festival/diwali?date=2036, New Delhi) because the Drik 2036 page could not be read.
// Ram Navami and Janmashtami are Drik's Smarta dates.
const DRIK: Record<number, Record<string, string>> = {
  2026: {
    'Makar Sankranti (Uttarayana)': '2026-01-14', 'Maha Shivratri': '2026-02-15', 'Holika Dahan': '2026-03-03', 'Holi': '2026-03-04',
    'Ugadi / Gudi Padwa': '2026-03-19', 'Ram Navami': '2026-03-26', 'Hanuman Jayanti': '2026-04-02', 'Akshaya Tritiya': '2026-04-19',
    'Guru Purnima': '2026-07-29', 'Raksha Bandhan': '2026-08-28', 'Krishna Janmashtami': '2026-09-04', 'Ganesh Chaturthi': '2026-09-14',
    'Navratri begins (Ghatasthapana)': '2026-10-11', 'Durga Ashtami': '2026-10-19', 'Dussehra (Vijayadashami)': '2026-10-20',
    'Karwa Chauth': '2026-10-29', 'Dhanteras': '2026-11-06', 'Diwali (Lakshmi Puja)': '2026-11-08', 'Govardhan Puja': '2026-11-10', 'Bhai Dooj': '2026-11-11',
  },
  2027: {
    'Makar Sankranti (Uttarayana)': '2027-01-15', 'Maha Shivratri': '2027-03-06', 'Holika Dahan': '2027-03-21', 'Holi': '2027-03-22',
    'Ugadi / Gudi Padwa': '2027-04-07', 'Ram Navami': '2027-04-15', 'Hanuman Jayanti': '2027-04-20', 'Akshaya Tritiya': '2027-05-09',
    'Guru Purnima': '2027-07-18', 'Raksha Bandhan': '2027-08-17', 'Krishna Janmashtami': '2027-08-25', 'Ganesh Chaturthi': '2027-09-04',
    'Navratri begins (Ghatasthapana)': '2027-09-30', 'Durga Ashtami': '2027-10-07', 'Dussehra (Vijayadashami)': '2027-10-09',
    'Karwa Chauth': '2027-10-18', 'Dhanteras': '2027-10-27', 'Diwali (Lakshmi Puja)': '2027-10-29', 'Govardhan Puja': '2027-10-30', 'Bhai Dooj': '2027-10-31',
  },
  2036: { 'Diwali (Lakshmi Puja)': '2036-10-18' },
  2037: {
    'Makar Sankranti (Uttarayana)': '2037-01-14', 'Maha Shivratri': '2037-02-13', 'Holika Dahan': '2037-03-01', 'Holi': '2037-03-02',
    'Ugadi / Gudi Padwa': '2037-03-17', 'Ram Navami': '2037-03-25', 'Hanuman Jayanti': '2037-03-31', 'Akshaya Tritiya': '2037-04-18',
    'Guru Purnima': '2037-07-27', 'Raksha Bandhan': '2037-08-25', 'Krishna Janmashtami': '2037-09-02', 'Ganesh Chaturthi': '2037-09-12',
    'Navratri begins (Ghatasthapana)': '2037-10-09', 'Durga Ashtami': '2037-10-16', 'Dussehra (Vijayadashami)': '2037-10-18',
    'Karwa Chauth': '2037-10-27', 'Dhanteras': '2037-11-05', 'Diwali (Lakshmi Puja)': '2037-11-07', 'Govardhan Puja': '2037-11-08', 'Bhai Dooj': '2037-11-08',
  },
};
// Smarta Ekadashi and Purnima dates from the same Drik pages.
const DRIK_EKADASHI: Record<number, string[]> = {
  2026: ['01-14', '01-29', '02-13', '02-27', '03-15', '03-29', '04-13', '04-27', '05-13', '05-27', '06-11', '06-25', '07-10', '07-25', '08-09', '08-23', '09-07', '09-22', '10-06', '10-22', '11-05', '11-20', '12-04', '12-20'],
  2027: ['01-03', '01-18', '02-02', '02-17', '03-04', '03-18', '04-02', '04-17', '05-02', '05-16', '06-01', '06-14', '06-30', '07-14', '07-29', '08-12', '08-28', '09-11', '09-26', '10-11', '10-25', '11-10', '11-24', '12-09', '12-23'],
  2037: ['01-12', '01-27', '02-10', '02-26', '03-12', '03-27', '04-11', '04-26', '05-11', '05-25', '06-09', '06-23', '07-09', '07-23', '08-07', '08-21', '09-06', '09-20', '10-05', '10-19', '11-03', '11-18', '12-03', '12-18'],
};
const DRIK_PURNIMA: Record<number, string[]> = {
  2026: ['01-03', '02-01', '03-03', '04-02', '05-01', '05-31', '06-29', '07-29', '08-28', '09-26', '10-26', '11-24', '12-23'],
  2027: ['01-22', '02-20', '03-22', '04-20', '05-20', '06-18', '07-18', '08-17', '09-15', '10-15', '11-14', '12-13'],
  2037: ['01-02', '01-31', '03-01', '03-31', '04-29', '05-29', '06-27', '07-27', '08-25', '09-24', '10-24', '11-22', '12-22'],
};
const DRIK_SANKRANTI: Record<number, string[]> = {
  2026: ['01-14', '02-13', '03-15', '04-14', '05-15', '06-15', '07-16', '08-17', '09-17', '10-17', '11-16', '12-16'],
  2027: ['01-15', '02-13', '03-15', '04-14', '05-15', '06-15', '07-17', '08-17', '09-17', '10-18', '11-17', '12-16'],
  2037: ['01-14', '02-12', '03-14', '04-14', '05-15', '06-15', '07-16', '08-17', '09-17', '10-17', '11-16', '12-16'],
};
const NAMED = Object.keys(DRIK[2026]);

describe('festival observance rules match Drik Panchang (round-2 T2/T3)', () => {
  for (const year of Object.keys(DRIK).map(Number)) {
    it(`named festivals in ${year} fall on Drik's dates`, () => {
      const c = computeFestivalCalendar(year);
      for (const [name, date] of Object.entries(DRIK[year])) {
        expect(c.festivals.filter(f => f.name === name).map(f => f.dateISO), `${name} ${year}`).toEqual([date]);
      }
    }, 60000);
  }

  for (const year of [2026, 2027, 2037]) {
    it(`Ekadashi, Purnima and Sankranti dates in ${year} match Drik`, () => {
      const c = computeFestivalCalendar(year);
      const md = (type: string) => c.festivals.filter(f => f.type === type).map(f => f.dateISO.slice(5));
      expect(md('ekadashi'), `Ekadashi ${year}`).toEqual(DRIK_EKADASHI[year]);
      expect(md('purnima'), `Purnima ${year}`).toEqual(DRIK_PURNIMA[year]);
      expect(c.sankrantis.map(s => s.dateISO.slice(5)), `Sankranti ${year}`).toEqual(DRIK_SANKRANTI[year]);
    }, 60000);
  }

  it('never drops a festival: each named festival appears exactly once in every year 2025–2040', () => {
    for (let year = 2025; year <= 2040; year++) {
      const c = computeFestivalCalendar(year);
      for (const name of NAMED) {
        expect(c.festivals.filter(f => f.name === name).length, `${name} ${year}`).toBe(1);
      }
      // a Purnima in every lunation (12–13 a year) and 24–25 Ekadashis
      expect(c.festivals.filter(f => f.type === 'purnima').length, `Purnimas ${year}`).toBeGreaterThanOrEqual(12);
      expect(c.festivals.filter(f => f.type === 'ekadashi').length, `Ekadashis ${year}`).toBeGreaterThanOrEqual(24);
    }
  }, 180000);
});
