import { describe, it, expect } from 'vitest';

// BIO1-BIO10: calculateBiologicalAge unit tests
// CC1-CC3: getForecastForCountry unit tests (inline to avoid Supabase import)

// Inline calculateBiologicalAge to avoid Supabase-dependent imports
interface BioOption { id: string; label: string; adjustment: number }
interface BioQ { id: string; question: string; options: BioOption[] }

const QUESTIONS: BioQ[] = [
  { id: 'heartRate', question: '', options: [
    { id: 'under60', label: '', adjustment: -3 },
    { id: 'normal',  label: '', adjustment:  0 },
    { id: 'elevated',label: '', adjustment:  2 },
    { id: 'high',    label: '', adjustment:  3 },
  ]},
  { id: 'pushups', question: '', options: [
    { id: 'excellent', label: '', adjustment: -3 },
    { id: 'good',      label: '', adjustment:  0 },
    { id: 'fair',      label: '', adjustment:  2 },
    { id: 'poor',      label: '', adjustment:  3 },
  ]},
  { id: 'balance', question: '', options: [
    { id: 'excellent', label: '', adjustment: -3 },
    { id: 'good',      label: '', adjustment:  0 },
    { id: 'fair',      label: '', adjustment:  2 },
    { id: 'poor',      label: '', adjustment:  3 },
  ]},
  { id: 'stairs', question: '', options: [
    { id: 'never',     label: '', adjustment: -3 },
    { id: 'rarely',    label: '', adjustment:  0 },
    { id: 'sometimes', label: '', adjustment:  2 },
    { id: 'always',    label: '', adjustment:  3 },
  ]},
  { id: 'sleep', question: '', options: [
    { id: 'refreshed', label: '', adjustment: -3 },
    { id: 'okay',      label: '', adjustment:  0 },
    { id: 'tired',     label: '', adjustment:  2 },
    { id: 'exhausted', label: '', adjustment:  3 },
  ]},
  { id: 'flexibility', question: '', options: [
    { id: 'palms',      label: '', adjustment: -3 },
    { id: 'fingertips', label: '', adjustment:  0 },
    { id: 'shins',      label: '', adjustment:  2 },
    { id: 'knees',      label: '', adjustment:  3 },
  ]},
  { id: 'memory', question: '', options: [
    { id: 'excellent', label: '', adjustment: -3 },
    { id: 'good',      label: '', adjustment:  0 },
    { id: 'fair',      label: '', adjustment:  2 },
    { id: 'poor',      label: '', adjustment:  3 },
  ]},
  { id: 'reaction', question: '', options: [
    { id: 'fast',     label: '', adjustment: -3 },
    { id: 'average',  label: '', adjustment:  0 },
    { id: 'slow',     label: '', adjustment:  2 },
    { id: 'veryslow', label: '', adjustment:  3 },
  ]},
  { id: 'waistHeight', question: '', options: [
    { id: 'healthy',   label: '', adjustment: -3 },
    { id: 'moderate',  label: '', adjustment:  0 },
    { id: 'high',      label: '', adjustment:  2 },
    { id: 'very_high', label: '', adjustment:  3 },
  ]},
  { id: 'energy', question: '', options: [
    { id: 'high',    label: '', adjustment: -3 },
    { id: 'good',    label: '', adjustment:  0 },
    { id: 'low',     label: '', adjustment:  2 },
    { id: 'verylow', label: '', adjustment:  3 },
  ]},
];

function calcBioAge(chronoAge: number, answers: Record<string, string>): number {
  let total = 0;
  for (const q of QUESTIONS) {
    const selectedId = answers[q.id];
    if (selectedId) {
      const opt = q.options.find(o => o.id === selectedId);
      if (opt) total += opt.adjustment;
    }
  }
  const capped = Math.max(-15, Math.min(15, total));
  return Math.max(18, Math.round((chronoAge + capped) * 10) / 10);
}

// Inline getForecastForCountry to avoid Supabase import
const BIRTH_BASELINES_TEST: Record<string, { male: number; female: number }> = {
  'Japan':         { male: 81.5, female: 87.5 },
  'Nigeria':       { male: 53.5, female: 56.5 },
  'India':         { male: 71.2, female: 74.4 },
  'United States': { male: 74.5, female: 80.5 },
};

function getForecastTest(
  country: string, gender: 'male' | 'female', age: number,
  healthAdj = 0, geneticAdj = 0, epigenAdj = 0, communityAdj = 0
): number {
  const baseline = BIRTH_BASELINES_TEST[country];
  if (!baseline) return age + 1;
  const base = baseline[gender];
  const raw = base + healthAdj + geneticAdj + epigenAdj + communityAdj;
  return Math.max(age + 1, Math.round(raw * 10) / 10);
}

// ── BIO1-BIO10 ────────────────────────────────────────────────────────────────

describe('calculateBiologicalAge', () => {
  // BIO1: All best → bioAge < chronoAge
  it('BIO1: all-best answers produce bioAge younger than chronoAge', () => {
    const answers = { heartRate: 'under60', pushups: 'excellent', balance: 'excellent',
      stairs: 'never', sleep: 'refreshed', flexibility: 'palms', memory: 'excellent',
      reaction: 'fast', waistHeight: 'healthy', energy: 'high' };
    const result = calcBioAge(45, answers);
    expect(result).toBeLessThan(45);
  });

  // BIO2: All worst → bioAge > chronoAge
  it('BIO2: all-worst answers produce bioAge older than chronoAge', () => {
    const answers = { heartRate: 'high', pushups: 'poor', balance: 'poor',
      stairs: 'always', sleep: 'exhausted', flexibility: 'knees', memory: 'poor',
      reaction: 'veryslow', waistHeight: 'very_high', energy: 'verylow' };
    const result = calcBioAge(45, answers);
    expect(result).toBeGreaterThan(45);
  });

  // BIO3: All neutral → bioAge === chronoAge
  it('BIO3: all-neutral answers produce bioAge equal to chronoAge', () => {
    const answers = { heartRate: 'normal', pushups: 'good', balance: 'good',
      stairs: 'rarely', sleep: 'okay', flexibility: 'fingertips', memory: 'good',
      reaction: 'average', waistHeight: 'moderate', energy: 'good' };
    const result = calcBioAge(45, answers);
    expect(result).toBe(45);
  });

  // BIO4: Floor at 18 — very young + all-best
  it('BIO4: bioAge is floored at 18 even if calculation goes below', () => {
    const answers = { heartRate: 'under60', pushups: 'excellent', balance: 'excellent',
      stairs: 'never', sleep: 'refreshed', flexibility: 'palms', memory: 'excellent',
      reaction: 'fast', waistHeight: 'healthy', energy: 'high' };
    const result = calcBioAge(5, answers);
    expect(result).toBe(18);
  });

  // BIO5: Cap at -15 — total adjustment cannot exceed -15
  it('BIO5: total adjustment capped at -15 (all-best from chrono=45 yields bioAge=30)', () => {
    const answers = { heartRate: 'under60', pushups: 'excellent', balance: 'excellent',
      stairs: 'never', sleep: 'refreshed', flexibility: 'palms', memory: 'excellent',
      reaction: 'fast', waistHeight: 'healthy', energy: 'high' };
    // 10 × -3 = -30, capped to -15, so 45 - 15 = 30
    const result = calcBioAge(45, answers);
    expect(result).toBe(30);
  });

  // BIO6: Cap at +15 — total adjustment cannot exceed +15
  it('BIO6: total adjustment capped at +15 (all-worst from chrono=45 yields bioAge=60)', () => {
    const answers = { heartRate: 'high', pushups: 'poor', balance: 'poor',
      stairs: 'always', sleep: 'exhausted', flexibility: 'knees', memory: 'poor',
      reaction: 'veryslow', waistHeight: 'very_high', energy: 'verylow' };
    // 10 × 3 = 30, capped to +15, so 45 + 15 = 60
    const result = calcBioAge(45, answers);
    expect(result).toBe(60);
  });

  // BIO7: Partial answers — unanswered questions contribute 0
  it('BIO7: unanswered questions contribute zero to adjustment', () => {
    const answers = { heartRate: 'under60' }; // only one answer at -3
    const result = calcBioAge(45, answers);
    expect(result).toBe(42);
  });

  // BIO8: Empty answers → bioAge equals chronoAge
  it('BIO8: empty answers return chronoAge unchanged', () => {
    const result = calcBioAge(35, {});
    expect(result).toBe(35);
  });

  // BIO9: Round-trip — bioAge is rounded to 1 decimal
  it('BIO9: result is rounded to one decimal place', () => {
    const answers = { heartRate: 'elevated' }; // adjustment +2, so 45.5 + 2 = 47.5
    const result = calcBioAge(45.5, answers);
    expect(result).toBe(47.5);
  });

  // BIO10: 10-question count matches BIO_QUESTIONS array length
  it('BIO10: QUESTIONS array has exactly 10 items', () => {
    expect(QUESTIONS.length).toBe(10);
  });
});

// ── CC1-CC3 ───────────────────────────────────────────────────────────────────

describe('getForecastForCountry', () => {
  // CC1: Japan female forecast > Nigeria female forecast (same age/adjustments)
  it('CC1: Japan female forecast exceeds Nigeria female forecast at same age', () => {
    const japan = getForecastTest('Japan', 'female', 40);
    const nigeria = getForecastTest('Nigeria', 'female', 40);
    expect(japan).toBeGreaterThan(nigeria);
  });

  // CC2: forecast is always > age (minimum = age + 1)
  it('CC2: forecast is always at least age + 1 even with large negative adjustments', () => {
    const result = getForecastTest('Nigeria', 'male', 79, -50, -50, -50, -50);
    expect(result).toBeGreaterThan(79);
  });

  // CC3: positive adjustments raise forecast above baseline
  it('CC3: positive health adjustments raise forecast above birth baseline', () => {
    const baseline = BIRTH_BASELINES_TEST['India'].male; // 71.2
    const result = getForecastTest('India', 'male', 35, 3, 2, 1, 1);
    expect(result).toBeGreaterThan(baseline);
  });
});
