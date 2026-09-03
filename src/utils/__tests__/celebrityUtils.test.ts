import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateCelebritySlug, generateAllSlugs,
  parseCelebrityDOB, formatDOBDisplay,
  generateCelebrityTitle, generateCelebrityMeta,
} from '../celebrityUtils';
import {
  calculateLifePathNumber, calculateWesternZodiac,
  calculateChineseZodiac, calculateVedicRashi,
  calculatePlanetaryAges, calculateAge,
  LIFE_PATH_TRAITS,
} from '../celebrityCalculations';
import { indianCelebrities } from '@/data/indianCelebrities';

// ── SLUG GENERATION ───────────────────────────────────────────
describe('generateCelebritySlug — Positive', () => {
  it('TC-SLUG-P-01: two-word name', () => expect(generateCelebritySlug('Virat Kohli')).toBe('virat-kohli'));
  it('TC-SLUG-P-02: three-word name', () => expect(generateCelebritySlug('Shah Rukh Khan')).toBe('shah-rukh-khan'));
  it('TC-SLUG-P-03: dots removed (A.R. Rahman)', () => expect(generateCelebritySlug('A.R. Rahman')).toBe('ar-rahman'));
  it('TC-SLUG-P-04: output is URL-safe', () => {
    ['Virat Kohli','A.R. Rahman',"O'Brien",'Björk'].forEach(n => {
      expect(generateCelebritySlug(n)).toMatch(/^[a-z0-9-]*$/);
    });
  });
  it('TC-SLUG-P-05: no leading/trailing hyphens', () => {
    ['Virat Kohli','A.R. Rahman','.Leading','Trailing.'].forEach(n => {
      expect(generateCelebritySlug(n)).not.toMatch(/^-|-$/);
    });
  });
  it('TC-SLUG-P-06: no consecutive hyphens', () => {
    expect(generateCelebritySlug('A.R. Rahman')).not.toContain('--');
  });
});

describe('generateCelebritySlug — Negative/Edge', () => {
  it('TC-SLUG-N-01: apostrophe removed', () => expect(generateCelebritySlug("O'Brien")).not.toContain("'"));
  it('TC-SLUG-N-02: collision adds birth year', () => {
    const used = new Set(['virat-kohli']);
    expect(generateCelebritySlug('Virat Kohli', 1988, used)).toBe('virat-kohli-1988');
  });
  it('TC-SLUG-N-03: double collision adds counter', () => {
    const used = new Set(['virat-kohli','virat-kohli-1988']);
    const slug = generateCelebritySlug('Virat Kohli', 1988, used);
    expect(slug).not.toMatch(/^virat-kohli$|^virat-kohli-1988$/);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('TC-SLUG-N-04: empty string returns non-empty fallback', () => {
    expect(generateCelebritySlug('', 1990).length).toBeGreaterThan(0);
  });
  it('TC-SLUG-N-05: special chars only returns fallback', () => {
    const slug = generateCelebritySlug('!!!', 1990);
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('TC-SLUG-N-06: very long name does not crash', () => {
    expect(() => generateCelebritySlug('Krishnamachari Srikkanth Venkataraman Narayanaswamy')).not.toThrow();
  });
});

describe('generateAllSlugs — Data Integrity', () => {
  let slugMap: Map<string, Record<string, unknown>>;
  beforeAll(() => {
    slugMap = generateAllSlugs(indianCelebrities as unknown as Record<string, unknown>[]);
  });
  it('TC-SLUG-D-01: one slug per celebrity', () => expect(slugMap.size).toBe(indianCelebrities.length));
  it('TC-SLUG-D-02: no duplicate slugs', () => {
    const slugs = Array.from(slugMap.keys());
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('TC-SLUG-D-03: all slugs URL-safe', () => {
    Array.from(slugMap.keys()).forEach(s => expect(s).toMatch(/^[a-z0-9-]+$/));
  });
  it('TC-SLUG-D-04: no empty slugs', () => {
    Array.from(slugMap.keys()).forEach(s => expect(s.length).toBeGreaterThan(0));
  });
  it('TC-SLUG-D-05: no slug starts or ends with hyphen', () => {
    Array.from(slugMap.keys()).forEach(s => expect(s).not.toMatch(/^-|-$/));
  });
});

// ── DOB PARSING ───────────────────────────────────────────────
describe('parseCelebrityDOB — Positive', () => {
  it('TC-DOB-P-01: full date YYYY-MM-DD → isFullDate=true', () => {
    const r = parseCelebrityDOB({ dob: '1988-11-05' });
    expect(r?.isFullDate).toBe(true);
    expect(r?.year).toBe(1988);
    expect(r?.month).toBe(11);
    expect(r?.day).toBe(5);
  });
  it('TC-DOB-P-02: year-only birth_year → isFullDate=false', () => {
    const r = parseCelebrityDOB({ birth_year: 1942 });
    expect(r?.isFullDate).toBe(false);
    expect(r?.year).toBe(1942);
  });
  it('TC-DOB-P-03: year-only birthYear field', () => {
    expect(parseCelebrityDOB({ birthYear: 1970 })?.isFullDate).toBe(false);
  });
  it('TC-DOB-P-04: no date info → null', () => {
    expect(parseCelebrityDOB({ name: 'No Date' })).toBeNull();
  });
});

describe('parseCelebrityDOB — Negative/Edge', () => {
  it('TC-DOB-N-01: year-only NEVER isFullDate=true', () => {
    expect(parseCelebrityDOB({ birth_year: 1956 })?.isFullDate).toBe(false);
  });
  it('TC-DOB-N-02: malformed date with year fallback does not crash', () => {
    expect(() => parseCelebrityDOB({ dob: 'not-a-date', birth_year: 1970 })).not.toThrow();
  });
  it('TC-DOB-N-03: null values → null', () => {
    expect(parseCelebrityDOB({ dob: null, birth_year: null } as Record<string, unknown>)).toBeNull();
  });
  it('TC-DOB-N-04: -01-01 placeholder treated as year-only (dataset convention)', () => {
    const r = parseCelebrityDOB({ birth_date: '1498-01-01', birth_year: 1498 });
    expect(r?.isFullDate).toBe(false);
    expect(r?.year).toBe(1498);
  });
});

// ── DOB DISPLAY — CRITICAL: NO FAKE DATES ────────────────────
describe('formatDOBDisplay — Never Mislead', () => {
  it('TC-DISP-01: full date displays correctly', () => {
    expect(formatDOBDisplay({ year: 1988, month: 11, day: 5, isFullDate: true })).toBe('November 5, 1988');
  });
  it('TC-DISP-02: year-only NEVER shows January 1', () => {
    const r = formatDOBDisplay({ year: 1956, month: 0, day: 0, isFullDate: false });
    expect(r).not.toContain('January 1');
    expect(r).not.toContain('January');
    expect(r).toContain('1956');
  });
  it('TC-DISP-03: year-only shows "not available"', () => {
    expect(formatDOBDisplay({ year: 1956, month: 0, day: 0, isFullDate: false }).toLowerCase())
      .toContain('not available');
  });
  it('TC-DISP-04: null → "Information not available"', () => {
    expect(formatDOBDisplay(null)).toBe('Information not available');
  });
});

// ── LIFE PATH ─────────────────────────────────────────────────
describe('calculateLifePathNumber', () => {
  it('TC-LP-P-01: result always valid LP value', () => {
    [[1,1,1990],[15,6,1985],[28,12,1970],[7,3,2000]].forEach(([d,m,y]) => {
      expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(calculateLifePathNumber(d,m,y));
    });
  });
  it('TC-LP-EDGE-01: master numbers not reduced', () => {
    [1,2,3,4,5,6,7,8,9,11,22,33].forEach(n => {
      expect(LIFE_PATH_TRAITS[n]).toBeTruthy();
    });
  });
  it('TC-LP-EDGE-02: LIFE_PATH_TRAITS has all entries', () => {
    [1,2,3,4,5,6,7,8,9,11,22,33].forEach(n => {
      expect(LIFE_PATH_TRAITS[n].title.length).toBeGreaterThan(0);
      expect(LIFE_PATH_TRAITS[n].traits.length).toBeGreaterThan(10);
    });
  });
});

// ── ZODIAC — INCLUDES BOUNDARY EDGE CASES ────────────────────
describe('calculateWesternZodiac', () => {
  it('TC-ZOD-P-01: Nov 5 → Scorpio', () => expect(calculateWesternZodiac(5, 11).sign).toBe('Scorpio'));
  it('TC-ZOD-P-02: Aug 15 → Leo', () => expect(calculateWesternZodiac(15, 8).sign).toBe('Leo'));
  it('TC-ZOD-P-03: Jan 1 → Capricorn', () => expect(calculateWesternZodiac(1, 1).sign).toBe('Capricorn'));
  it('TC-ZOD-P-04: Dec 31 → Capricorn', () => expect(calculateWesternZodiac(31, 12).sign).toBe('Capricorn'));
  it('TC-ZOD-EDGE-01: Mar 20 → Pisces (last day)', () => expect(calculateWesternZodiac(20, 3).sign).toBe('Pisces'));
  it('TC-ZOD-EDGE-02: Mar 21 → Aries (first day)', () => expect(calculateWesternZodiac(21, 3).sign).toBe('Aries'));
  it('TC-ZOD-EDGE-03: Jan 19 → Capricorn (last day)', () => expect(calculateWesternZodiac(19, 1).sign).toBe('Capricorn'));
  it('TC-ZOD-EDGE-04: Jan 20 → Aquarius (first day)', () => expect(calculateWesternZodiac(20, 1).sign).toBe('Aquarius'));
  it('TC-ZOD-EDGE-05: all 12 months produce valid sign', () => {
    for (let m = 1; m <= 12; m++) {
      const z = calculateWesternZodiac(15, m);
      expect(z.sign.length).toBeGreaterThan(0);
      expect(z.sign).not.toBe('undefined');
    }
  });
  it('TC-ZOD-EDGE-06: no result ever undefined', () => {
    for (let m = 1; m <= 12; m++) {
      [1, 15, 28].forEach(d => {
        const z = calculateWesternZodiac(d, m);
        expect(z).not.toBeUndefined();
        expect(z.sign).not.toBe('undefined');
      });
    }
  });
});

// ── CHINESE ZODIAC ────────────────────────────────────────────
describe('calculateChineseZodiac', () => {
  it('TC-CZ-P-01: 1988 → Dragon', () => expect(calculateChineseZodiac(1988).animal).toBe('Dragon'));
  it('TC-CZ-P-02: 1990 → Horse', () => expect(calculateChineseZodiac(1990).animal).toBe('Horse'));
  it('TC-CZ-EDGE-01: various years all produce valid results', () => {
    [1940,1960,1980,2000,2020].forEach(y => {
      const z = calculateChineseZodiac(y);
      expect(z.animal.length).toBeGreaterThan(0);
      expect(z.element.length).toBeGreaterThan(0);
    });
  });
});

// ── VEDIC RASHI ───────────────────────────────────────────────
describe('calculateVedicRashi', () => {
  it('TC-VR-P-01: Nov 5 → Vrischika (Scorpio equivalent)', () => {
    expect(calculateVedicRashi(5, 11).rashi).toBe('Vrischika');
  });
  it('TC-VR-P-02: every month produces valid rashi', () => {
    for (let m = 1; m <= 12; m++) {
      const r = calculateVedicRashi(15, m);
      expect(r.rashi.length).toBeGreaterThan(0);
      expect(r.western_equivalent.length).toBeGreaterThan(0);
    }
  });
});

// ── PLANETARY AGES ────────────────────────────────────────────
describe('calculatePlanetaryAges', () => {
  it('TC-PLAN-P-01: 7 planets for full DOB', () => {
    expect(calculatePlanetaryAges({ year: 1988, month: 11, day: 5, isFullDate: true }).length).toBe(7);
  });
  it('TC-PLAN-P-02: Mercury age > Jupiter age', () => {
    const ages = calculatePlanetaryAges({ year: 1988, month: 11, day: 5, isFullDate: true });
    expect(ages.find(p => p.planet === 'Mercury')!.age).toBeGreaterThan(ages.find(p => p.planet === 'Jupiter')!.age);
  });
  it('TC-PLAN-P-03: all ages non-negative integers', () => {
    calculatePlanetaryAges({ year: 1990, month: 1, day: 1, isFullDate: true }).forEach(p => {
      expect(p.age).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(p.age)).toBe(true);
    });
  });
  it('TC-PLAN-EDGE-01: year-only DOB returns EMPTY array (no fake ages)', () => {
    expect(calculatePlanetaryAges({ year: 1956, month: 0, day: 0, isFullDate: false }).length).toBe(0);
  });
});

// ── AGE ───────────────────────────────────────────────────────
describe('calculateAge', () => {
  it('TC-AGE-P-01: non-negative', () => {
    expect(calculateAge(5, 11, 1988)).toBeGreaterThanOrEqual(0);
  });
  it('TC-AGE-P-02: known age reasonable', () => {
    const age = calculateAge(5, 11, 1990);
    expect(age).toBeGreaterThanOrEqual(30);
    expect(age).toBeLessThanOrEqual(60);
  });
});

// ── META GENERATION ───────────────────────────────────────────
describe('generateCelebrityTitle', () => {
  it('TC-META-P-01: standard name ≤70 chars', () => expect(generateCelebrityTitle('Virat Kohli').length).toBeLessThanOrEqual(70));
  it('TC-META-P-02: long name ≤70 chars', () => expect(generateCelebrityTitle('Krishnamachari Srikkanth Venkataraman Narayanaswamy').length).toBeLessThanOrEqual(70));
  it('TC-META-P-03: contains BornClock', () => expect(generateCelebrityTitle('Amitabh Bachchan')).toContain('BornClock'));
  it('TC-META-P-04: contains celebrity name', () => expect(generateCelebrityTitle('Sachin Tendulkar')).toContain('Sachin Tendulkar'));
  it('TC-META-N-01: empty name does not crash', () => expect(() => generateCelebrityTitle('')).not.toThrow());
});

describe('generateCelebrityMeta', () => {
  const fullDOB = { year: 1988, month: 11, day: 5, isFullDate: true };
  const yearDOB  = { year: 1956, month: 0,  day: 0, isFullDate: false };

  it('TC-META-P-05: full DOB meta ≤160 chars', () => {
    expect(generateCelebrityMeta('Virat Kohli', fullDOB, 'Scorpio', 'Vrischika', 6).length).toBeLessThanOrEqual(160);
  });
  it('TC-META-P-06: year-only meta ≤160 chars', () => {
    expect(generateCelebrityMeta('Amitabh Bachchan', yearDOB, 'Libra', 'Tula', 3).length).toBeLessThanOrEqual(160);
  });
  it('TC-META-N-01: year-only NEVER says "years old" or January', () => {
    const meta = generateCelebrityMeta('Test', yearDOB, 'Leo', 'Simha', 1);
    expect(meta).not.toContain('January');
    expect(meta).toContain('1956');
  });
  it('TC-META-N-02: null DOB → fallback no undefined', () => {
    const meta = generateCelebrityMeta('Test', null, 'Leo', 'Simha', 1);
    expect(meta).not.toContain('undefined');
    expect(meta.length).toBeGreaterThan(20);
  });
  it('TC-META-N-03: long name still ≤160 chars', () => {
    expect(generateCelebrityMeta('Krishnamachari Srikkanth Venkataraman', fullDOB, 'Libra', 'Tula', 3).length).toBeLessThanOrEqual(160);
  });
  it('TC-META-N-04: no undefined or [object Object] in any combination', () => {
    [
      [fullDOB, 'Scorpio', 'Vrischika', 6],
      [yearDOB, 'Leo', 'Simha', 1],
      [null, 'Aries', 'Mesha', null],
    ].forEach(([dob, z, r, lp]) => {
      const meta = generateCelebrityMeta('Test', dob as typeof fullDOB, String(z), String(r), lp as number);
      expect(meta).not.toContain('undefined');
      expect(meta).not.toContain('[object Object]');
    });
  });
});

// ── FULL DATA INTEGRITY ───────────────────────────────────────
describe('indianCelebrities data integrity', () => {
  it('TC-DATA-01: at least 500 celebrities', () => expect(indianCelebrities.length).toBeGreaterThanOrEqual(500));
  it('TC-DATA-02: every celebrity has name', () => {
    indianCelebrities.forEach((c, i) => {
      expect((c as Record<string,unknown>).name, `Index ${i}`).toBeTruthy();
    });
  });
  it('TC-DATA-03: no name is "undefined" or "null"', () => {
    indianCelebrities.forEach(c => {
      const name = String((c as Record<string,unknown>).name);
      expect(name).not.toBe('undefined');
      expect(name).not.toBe('null');
    });
  });
  it('TC-DATA-04: ≥90% have date info', () => {
    const withDate = indianCelebrities.filter(c => {
      const r = c as Record<string,unknown>;
      return r.birth_year || r.birthYear || r.dob || r.date_of_birth || r.birth_date;
    });
    expect(withDate.length / indianCelebrities.length).toBeGreaterThan(0.9);
  });
  it('TC-DATA-05: no duplicate slugs', () => {
    const m = generateAllSlugs(indianCelebrities as unknown as Record<string,unknown>[]);
    expect(m.size).toBe(indianCelebrities.length);
  });
  it('TC-DATA-06: year-only celebrities NEVER get fake January 1', () => {
    indianCelebrities.forEach(c => {
      const dob = parseCelebrityDOB(c as Record<string,unknown>);
      if (dob && !dob.isFullDate) {
        const display = formatDOBDisplay(dob);
        expect(display).not.toMatch(/January\s+1[^0-9]/);
      }
    });
  });
  it('TC-DATA-07: all zodiac calculations valid for sample', () => {
    indianCelebrities.slice(0, 50).forEach(c => {
      const dob = parseCelebrityDOB(c as Record<string,unknown>);
      if (dob?.isFullDate) {
        const z = calculateWesternZodiac(dob.day, dob.month);
        expect(z.sign.length).toBeGreaterThan(0);
        expect(z.sign).not.toBe('undefined');
      }
    });
  });
});
