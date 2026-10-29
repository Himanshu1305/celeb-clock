import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BIO_QUESTIONS,
  MAX_TOTAL_ADJUSTMENT,
  balanceAdjustment,
  bmiOptionId,
  calculateBMI,
  calculateBiologicalAge,
  flexibilityAdjustment,
  getAdjustment,
  getWHOBMICategory,
  getWaistRisk,
  pushupAdjustment,
  pushupBenchmark,
  waistOptionId,
} from '../BiologicalAgeService';
import { BIO_QUESTIONS_HI } from '../biologicalAgeHindi';

const ROOT = resolve(__dirname, '../../..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

const NEUTRAL = {
  heartRate: 'normal', pushups: 'p10to14', balance: '30to44', stairs: 'rarely', sleep: 'okay',
  flexibility: 'fingertips', memory: 'good', reaction: 'average', bmi: 'bmi_healthy',
  bloodPressure: 'bp_elevated', energy: 'good', smoking: 'never', alcohol: 'none', activity: '15to29',
};
const ALL_BEST = {
  heartRate: 'under60', pushups: 'p30plus', balance: 'full45', stairs: 'never', sleep: 'refreshed',
  flexibility: 'palms', memory: 'excellent', reaction: 'fast', bmi: 'bmi_optimal', waist: 'waist_low',
  bloodPressure: 'bp_optimal', energy: 'high', smoking: 'never', alcohol: 'none', activity: '30plus',
};
const ALL_WORST = {
  heartRate: 'high', pushups: 'p0to4', balance: 'under5', stairs: 'always', sleep: 'exhausted',
  flexibility: 'knees', memory: 'poor', reaction: 'veryslow', bmi: 'bmi_obese2', waist: 'waist_high',
  bloodPressure: 'bp_severe', energy: 'verylow', smoking: 'current', alcohol: 'over350', activity: 'under15',
};

describe('questions match the content promised on the pages', () => {
  it('BIO-Q1: 15 questions incl. smoking, alcohol and physical activity', () => {
    expect(BIO_QUESTIONS.length).toBe(15);
    const ids = BIO_QUESTIONS.map(q => q.id);
    expect(ids).toEqual(expect.arrayContaining(['smoking', 'alcohol', 'activity', 'balance', 'pushups', 'waist']));
    // Not asked → must not be scored or promised: diet, stress, social life, diabetes.
    for (const notAsked of ['diet', 'stress', 'social', 'diabetes']) expect(ids).not.toContain(notAsked);
  });

  it('BIO-Q2: every question and option has a Hindi label', () => {
    for (const q of BIO_QUESTIONS) {
      const hi = BIO_QUESTIONS_HI[q.id];
      expect(hi, q.id).toBeTruthy();
      for (const o of q.options) expect(hi.options[o.id], `${q.id}.${o.id}`).toBeTruthy();
    }
  });

  it('BIO-Q3: answer page lists exactly the calculator questions (generated from BIO_QUESTIONS)', () => {
    const src = read('src/pages/answers/WhatIsMyBiologicalAge.tsx');
    expect(src).toContain('BIO_QUESTIONS.map');
    expect(src).not.toMatch(/Diet quality|Chronic stress level|Social connection|Diabetes status/);
  });
});

describe('scoring', () => {
  it('BIO-S1: neutral answers leave age unchanged', () => {
    expect(calculateBiologicalAge(45, NEUTRAL, 'male')).toBe(45);
  });
  it('BIO-S2: best answers are younger, worst older', () => {
    expect(calculateBiologicalAge(45, ALL_BEST, 'female')).toBeLessThan(45);
    expect(calculateBiologicalAge(45, ALL_WORST, 'female')).toBeGreaterThan(45);
  });
  it('BIO-S3: total is capped at ±MAX_TOTAL_ADJUSTMENT and floored at 18', () => {
    expect(MAX_TOTAL_ADJUSTMENT).toBe(10);
    expect(calculateBiologicalAge(45, ALL_WORST, 'male')).toBe(55);
    expect(calculateBiologicalAge(65, ALL_BEST, 'male')).toBe(55);
    expect(calculateBiologicalAge(20, ALL_BEST, 'male')).toBe(18);
    expect(calculateBiologicalAge(35, {}, 'male')).toBe(35);
  });
  it('BIO-S4: no single answer moves the result by more than 3 years', () => {
    for (const q of BIO_QUESTIONS) {
      for (const age of [25, 45, 65, 85]) {
        for (const sex of ['male', 'female'] as const) {
          for (const o of q.options) {
            expect(Math.abs(getAdjustment(q, o.id, { age, sex })), `${q.id}.${o.id}`).toBeLessThanOrEqual(3);
          }
        }
      }
    }
  });
});

describe('balance is scored against age norms (Springer et al. 2007, eyes open)', () => {
  it('BAL1: the question is eyes OPEN with a safety note', () => {
    const q = BIO_QUESTIONS.find(x => x.id === 'balance')!;
    expect(q.question).toMatch(/eyes OPEN/);
    expect(q.instruction).toMatch(/wall or sturdy chair/);
  });
  it('BAL2: a typical time for each age group scores 0 (no penalty for normal ageing)', () => {
    // Group means: 18-39 44.7 s, 50-59 41.2 s, 60-69 32.1 s, 70-79 21.5 s, 80+ 9.4 s.
    expect(balanceAdjustment('full45', 30)).toBe(0);
    expect(balanceAdjustment('30to44', 55)).toBe(0);
    expect(balanceAdjustment('30to44', 65)).toBe(0);
    expect(balanceAdjustment('15to29', 72)).toBe(0);
    expect(balanceAdjustment('5to14', 85)).toBe(0);
  });
  it('BAL3: the same time scores differently by age', () => {
    expect(balanceAdjustment('15to29', 30)).toBe(1);
    expect(balanceAdjustment('15to29', 75)).toBe(0);
    expect(balanceAdjustment('15to29', 85)).toBe(-1);
    expect(balanceAdjustment('5to14', 40)).toBe(2);
    expect(balanceAdjustment('5to14', 65)).toBe(1);
    expect(balanceAdjustment('full45', 70)).toBe(-1);
  });
  it('BAL4: a healthy 55-year-old holding 45 s is not penalised (old rule gave +3)', () => {
    const q = BIO_QUESTIONS.find(x => x.id === 'balance')!;
    expect(getAdjustment(q, 'full45', { age: 55, sex: 'male' })).toBe(0);
  });
});

describe('push-ups relative to age and sex (Mayo Clinic benchmark)', () => {
  it('PU1: benchmarks', () => {
    expect(pushupBenchmark(25, 'male')).toBe(28);
    expect(pushupBenchmark(25, 'female')).toBe(20);
    expect(pushupBenchmark(55, 'male')).toBe(12);
    expect(pushupBenchmark(70, 'female')).toBe(10);
  });
  it('PU2: same count, different age/sex → different score; weight is small', () => {
    expect(pushupAdjustment('p10to14', { age: 25, sex: 'male' })).toBe(1);
    expect(pushupAdjustment('p10to14', { age: 60, sex: 'female' })).toBe(-1);
    expect(pushupAdjustment('p15to19', { age: 30, sex: 'male' })).toBe(0);
    for (const id of ['p0to4', 'p5to9', 'p10to14', 'p15to19', 'p20to29', 'p30plus'])
      expect(Math.abs(pushupAdjustment(id, { age: 40, sex: 'male' }))).toBeLessThanOrEqual(1);
  });
});

describe('flexibility only counts from 40 (Yamamoto 2009)', () => {
  it('FLX1', () => {
    expect(flexibilityAdjustment('knees', 30)).toBe(0);
    expect(flexibilityAdjustment('knees', 50)).toBe(1);
    expect(flexibilityAdjustment('palms', 50)).toBe(-1);
  });
});

describe('BMI (Asian action points) and waist (IDF South Asian 90/80 cm)', () => {
  it('BMI1-3', () => {
    expect(calculateBMI(70, 170)).toBe(24.2);
    expect(bmiOptionId(22.9)).toBe('bmi_optimal');
    expect(bmiOptionId(23)).toBe('bmi_healthy');
    expect(bmiOptionId(27.5)).toBe('bmi_ow');
    expect(getWHOBMICategory(24, true)).toBe('Overweight');
    expect(getWHOBMICategory(24, false)).toBe('Healthy weight');
  });
  it('WAIST1-4: South Asian cut-offs', () => {
    expect(getWaistRisk(89.9, 'male')).toBe('low');
    expect(getWaistRisk(90, 'male')).toBe('high');
    expect(getWaistRisk(79.9, 'female')).toBe('low');
    expect(getWaistRisk(80, 'female')).toBe('high');
    expect(waistOptionId(92, 'male')).toBe('waist_high'); // was "low risk" under the old 94 cm rule
  });
});

describe('three sample people (before/after recorded in the batch 9 report)', () => {
  it('fit 55-year-old man → 46', () => {
    expect(calculateBiologicalAge(55, {
      heartRate: 'under60', pushups: 'p20to29', balance: 'full45', stairs: 'never', sleep: 'refreshed',
      flexibility: 'fingertips', memory: 'good', reaction: 'average', bmi: 'bmi_optimal', waist: 'waist_low',
      bloodPressure: 'bp_optimal', energy: 'high', smoking: 'never', alcohol: 'upTo100', activity: '30plus',
    }, 'male')).toBe(46);
  });
  it('sedentary 30-year-old man → 38.5', () => {
    expect(calculateBiologicalAge(30, {
      heartRate: 'elevated', pushups: 'p5to9', balance: '30to44', stairs: 'sometimes', sleep: 'tired',
      flexibility: 'shins', memory: 'good', reaction: 'average', bmi: 'bmi_ow_mild', waist: 'waist_high',
      bloodPressure: 'bp_elevated', energy: 'low', smoking: 'never', alcohol: '100to200', activity: 'under15',
    }, 'male')).toBe(38.5);
  });
  it('typical 70-year-old woman → 75.5', () => {
    expect(calculateBiologicalAge(70, {
      heartRate: 'normal', pushups: 'p5to9', balance: '15to29', stairs: 'sometimes', sleep: 'okay',
      flexibility: 'shins', memory: 'good', reaction: 'slow', bmi: 'bmi_healthy', waist: 'waist_high',
      bloodPressure: 'bp_stage1', energy: 'good', smoking: 'never', alcohol: 'none', activity: '15to29',
    }, 'female')).toBe(75.5);
  });
});

describe('honest-wording guard', () => {
  const FILES = [
    'src/services/BiologicalAgeService.ts',
    'src/services/biologicalAgeHindi.ts',
    'src/pages/BiologicalAge.tsx',
    'src/pages/HindiBiologicalAge.tsx',
    'src/components/biological-age/BioAgeQuizHindi.tsx',
    'src/pages/answers/WhatIsMyBiologicalAge.tsx',
    'src/pages/answers/WhatIsEpigeneticAge.tsx',
    'src/pages/answers/WhatIsBMI.tsx',
    'src/content/biologicalAgeMeta.ts',
    'scripts/prerender-titles.mjs',
    'scripts/prerender.mjs',
    // review b9: the OG card and the long-form article also described the calculator
    'scripts/generate-og-cards.mts',
    'src/pages/articles/BiologicalAgeArticle.tsx',
  ];
  it('HW1: no "WHO-validated" / "12 WHO biomarkers" claims', () => {
    for (const f of FILES) expect(read(f), f).not.toMatch(/WHO[- ]validated|12 WHO|WHO Biomarkers/i);
  });
  it('HW1b: no stale "12 biomarkers" description of the 15-question calculator', () => {
    for (const f of FILES) expect(read(f), f).not.toMatch(/12 (self-reported |proxy |validated )*(proxy )?biomarkers/i);
  });
  it('HW1c: FAQ is rendered outside the result step (FAQPage JSON-LD must match visible content)', () => {
    const page = read('src/pages/BiologicalAge.tsx');
    // Rendered after the last result-only block (the result step ends with <MedicalDisclaimer />).
    const faqUse = page.lastIndexOf('<FAQSection />');
    expect(page.split('<FAQSection />').length - 1).toBe(1);
    expect(faqUse).toBeGreaterThan(page.lastIndexOf('<MedicalDisclaimer />'));
    expect(page.indexOf('{/* P1-H internal linking */}')).toBeGreaterThan(faqUse);
    expect(page).not.toMatch(/\{open === i && \(/);
  });
  it('HW2: no equating the result with epigenetic age', () => {
    for (const f of FILES) {
      const src = read(f);
      expect(src, f).not.toMatch(/\(\s*epigenetic\)\s*age|Biological age \(\s*(<[^>]+>\s*)?epigenetic age|also called physiological age or epigenetic age|true \(epigenetic\)/i);
    }
  });
  it('HW3: removed claims stay removed', () => {
    const page = read('src/pages/BiologicalAge.tsx');
    expect(page).not.toMatch(/r=0\.8|measurable cellular benefit|grip strength|£/);
    for (const f of FILES) expect(read(f), f).not.toMatch(/Aging Cell|2\.5 years/);
  });
  it('HW4: Fitzgerald trial described consistently (Aging 2021, 3.23 years, 43 men)', () => {
    for (const f of ['src/pages/BiologicalAge.tsx', 'src/pages/answers/WhatIsMyBiologicalAge.tsx', 'src/pages/HindiBiologicalAge.tsx']) {
      const src = read(f);
      expect(src, f).toMatch(/3\.23/);
      expect(src, f).toMatch(/43/);
    }
  });
  it('HW5: disclaimer present on English and Hindi calculators', () => {
    expect(read('src/pages/BiologicalAge.tsx')).toMatch(/not a lab test, not an epigenetic clock, not a diagnosis/);
    expect(read('src/pages/HindiBiologicalAge.tsx')).toMatch(/डॉक्टरी सलाह नहीं/);
  });
});

describe('SEO: H1 / meta stay in sync with prerender-titles', async () => {
  const { getTitleForRoute } = await import('../../../scripts/prerender-titles.mjs');
  const page = read('src/pages/BiologicalAge.tsx');
  it('SEO1: H1 and title include "Biological Age Calculator"', () => {
    expect(page).toMatch(/h1="Biological Age Calculator/);
    expect(getTitleForRoute('/biological-age').title).toMatch(/^Biological Age Calculator/);
    expect(read('src/pages/HindiBiologicalAge.tsx')).toMatch(/h1="Biological Age Calculator/);
  });
  it('SEO2: meta descriptions match the page constants', async () => {
    const { BIO_AGE_META_DESCRIPTION, WHAT_IS_BIO_AGE_DESC, HINDI_BIO_AGE_TITLE, HINDI_BIO_AGE_DESC } =
      await import('../../content/biologicalAgeMeta');
    expect(getTitleForRoute('/biological-age').description).toBe(BIO_AGE_META_DESCRIPTION);
    expect(getTitleForRoute('/answers/what-is-my-biological-age').description).toBe(WHAT_IS_BIO_AGE_DESC);
    expect(getTitleForRoute('/biological-age-hindi').title).toBe(HINDI_BIO_AGE_TITLE);
    expect(getTitleForRoute('/biological-age-hindi').description).toBe(HINDI_BIO_AGE_DESC);
  });
  it('SEO3: meta description mentions only things the calculator asks', () => {
    const d = getTitleForRoute('/biological-age').description;
    expect(d).not.toMatch(/diet|stress|diabetes|social/i);
    expect(d).toMatch(/smoking/);
    expect(d).toMatch(/alcohol/);
  });
});
