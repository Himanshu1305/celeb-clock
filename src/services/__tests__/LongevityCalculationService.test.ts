import { describe, it, expect } from 'vitest';
import {
  calculateLongevity,
  recalcWithOverrides,
  DEFAULT_PILLAR1,
  DEFAULT_PILLAR2,
  HealthQuizData,
  Pillar1Data,
  Pillar2Data,
  FamilyMemberData,
} from '../LongevityCalculationService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQuiz(overrides: Partial<HealthQuizData> = {}): HealthQuizData {
  return {
    name: 'Test',
    gender: 'male',
    country: 'India',
    smoking: 'never',
    drinking: 'none',
    heartDisease: false,
    heartDiseaseFamily: false,
    heartDiseaseControlled: null,
    diabetes: false,
    diabetesFamily: false,
    diabetesControlled: null,
    hypertension: false,
    hypertensionControlled: null,
    diet: 'average',
    exercise: 'moderate',
    stress: 5,
    bmi: 24.5,
    bloodPressure: 'normal',
    sleepDuration: '7to9',
    socialConnections: 'moderate',
    ...overrides,
  };
}

function makeP1Member(age: number, isLiving: boolean): FamilyMemberData {
  return { age, isLiving, dontKnow: false };
}

function makeAllFamilyAt(age: number, isLiving: boolean): Pillar1Data {
  const m = () => makeP1Member(age, isLiving);
  return {
    paternalGrandfather: m(),
    paternalGrandmother: m(),
    father: m(),
    paternalUncles: m(),
    paternalAunts: m(),
    maternalGrandfather: m(),
    maternalGrandmother: m(),
    mother: m(),
    maternalUncles: m(),
    maternalAunts: m(),
  };
}

const ALL_HABIT_IDS = [
  'walking', 'community', 'laughter', 'meditation', 'wholefood',
  'fasting', 'purpose', 'spiritual', 'cold', 'gardening', 'learning', 'volunteer',
];

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 — WHO Baseline
// ─────────────────────────────────────────────────────────────────────────────
// Baselines now from UN WPP 2024 (BIRTH_BASELINES); no conditional multiplier since default age=35 < 40
describe('Group 1 — UN WPP 2024 Baseline', () => {
  it('male India → 71.2 (UN WPP 2024)', () => {
    const r = calculateLongevity(makeQuiz({ gender: 'male', country: 'India' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.baselineLifeExpectancy).toBe(71.2);
  });

  it('female India → 74.4 (UN WPP 2024)', () => {
    const r = calculateLongevity(makeQuiz({ gender: 'female', country: 'India' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.baselineLifeExpectancy).toBe(74.4);
  });

  it('male United States → 74.5 (UN WPP 2024)', () => {
    const r = calculateLongevity(makeQuiz({ gender: 'male', country: 'United States' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.baselineLifeExpectancy).toBe(74.5);
  });

  it('female United States → 80.5 (UN WPP 2024)', () => {
    const r = calculateLongevity(makeQuiz({ gender: 'female', country: 'United States' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.baselineLifeExpectancy).toBe(80.5);
  });

  it('male United Kingdom → 79.5 (UN WPP 2024)', () => {
    const r = calculateLongevity(makeQuiz({ gender: 'male', country: 'United Kingdom' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.baselineLifeExpectancy).toBe(79.5);
  });

  it('unknown country male → 73.3 (UN WPP 2024 GLOBAL_DEFAULT)', () => {
    const r = calculateLongevity(makeQuiz({ gender: 'male', country: 'UnknownCountry' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.baselineLifeExpectancy).toBe(73.3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 — Health Adjustments
// Lookup tables (from service):
//   smoke: never=0 quit_over5=-1 quit_under5=-2 light=-3 moderate=-7 heavy=-12
//   drink: none=0 light=+1 moderate=-1 heavy=-6
//   diet:  poor=-3 average=0 good=+2 excellent=+4
//   exercise: seldom=-2 light=+1 moderate=+3 heavy=+5
//   stress: >=8→-2.5  >=5→-0.5  >=3→+1  <3→+1.5
//   bmi:   <18.5→-2  >30→-3  >25→-1  else=0
//   bp:    optimal=+1.5 normal=0 elevated=-1 high1=-2.5 high2=-5
//   sleep: under6=-2 6to7=-0.5 7to9=0 over9=-1
//   social: strong=+2 moderate=0 limited=-1.5 isolated=-3
// ─────────────────────────────────────────────────────────────────────────────
describe('Group 2 — Health Adjustments', () => {
  it('all-positive lifestyle → healthAdjustment > 10', () => {
    // never(0)+light(+1)+excellent(+4)+heavy(+5)+optimal(+1.5)+7to9(0)+strong(+2)+stress2(+1.5)+bmi22(0) = +15
    const r = calculateLongevity(makeQuiz({
      smoking: 'never',
      drinking: 'light',
      diet: 'excellent',
      exercise: 'heavy',
      bloodPressure: 'optimal',
      sleepDuration: '7to9',
      socialConnections: 'strong',
      stress: 2,
      bmi: 22,
    }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.healthAdjustment).toBeGreaterThan(10);
  });

  it('all-negative lifestyle → healthAdjustment < -30', () => {
    // heavy(-12)+heavy(-6)+poor(-3)+seldom(-2)+high2(-5)+under6(-2)+isolated(-3)+stress9(-2.5)+bmi35(-3) = -38.5
    const r = calculateLongevity(makeQuiz({
      smoking: 'heavy',
      drinking: 'heavy',
      diet: 'poor',
      exercise: 'seldom',
      bloodPressure: 'high2',
      sleepDuration: 'under6',
      socialConnections: 'isolated',
      stress: 9,
      bmi: 35,
    }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.healthAdjustment).toBeLessThan(-30);
  });

  it('all neutral string factors + stress=3 → healthAdjustment = +1.0', () => {
    // All string factors map to 0; stress=3 gives +1.0; bmi=24.5 gives 0
    const r = calculateLongevity(makeQuiz({
      smoking: '',
      drinking: '',
      diet: '',
      exercise: '',
      bloodPressure: '',
      sleepDuration: '',
      socialConnections: '',
      stress: 3,
      bmi: 24.5,
    }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.healthAdjustment).toBe(1.0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3 — Genetic Calculation
// Formula: wfa = weighted avg of all family, living members get +livingAdj
//   livingAdj: age>=80→+7  age>=70→+4  age>=60→+2  else→0
// Genetic bonus = (wfa - 78) * 0.25, capped ±8
// ─────────────────────────────────────────────────────────────────────────────
describe('Group 3 — Genetic Calculation', () => {
  it('all family age 90 deceased → geneticAdjustment = +3.0', () => {
    // wfa=90, (90-78)*0.25 = 3.0
    const r = calculateLongevity(makeQuiz(), makeAllFamilyAt(90, false), DEFAULT_PILLAR2);
    expect(r.geneticAdjustment).toBe(3.0);
  });

  it('all family age 60 deceased → geneticAdjustment = -4.5', () => {
    // wfa=60, (60-78)*0.25 = -4.5
    const r = calculateLongevity(makeQuiz(), makeAllFamilyAt(60, false), DEFAULT_PILLAR2);
    expect(r.geneticAdjustment).toBe(-4.5);
  });

  it('no family entered → geneticAdjustment=0, score=Average', () => {
    // DEFAULT_PILLAR1 has all dontKnow:false, age:0 — so isEntered() returns false
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.geneticAdjustment).toBe(0);
    expect(r.geneticVitalityScore).toBe('Average');
  });

  it('one grandfather age 98 still living → living adjustment applied, adj = 6.75', () => {
    // contribution = 98 + 7 = 105; patAvg=105; matAvg=null; wfa=105
    // (105-78)*0.25 = 6.75 (not capped since 6.75 < 8)
    // Without living adj: wfa=98, adj=5.0 — so adj MUST be > 5.0
    const pillar1: Pillar1Data = {
      ...DEFAULT_PILLAR1,
      paternalGrandfather: { age: 98, isLiving: true, dontKnow: false },
    };
    const r = calculateLongevity(makeQuiz(), pillar1, DEFAULT_PILLAR2);
    expect(r.geneticAdjustment).toBeGreaterThan(5.0);
    expect(r.geneticAdjustment).toBe(6.8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4 — Community Bonus
// baseBonus: age>=95→0.8  age>=85→0.5  age>=75→0.3  else→0
// habitsBonus: sum(gain*0.15) capped at 1.0
// communityBonus: min(1.5, baseBonus+habitsBonus)
// ─────────────────────────────────────────────────────────────────────────────
describe('Group 4 — Community Bonus', () => {
  const noHabitMentor = (age: number): Pillar2Data => ({
    ...DEFAULT_PILLAR2,
    hasMentor: true,
    mentorAge: age,
    mentorHabits: [],
  });

  it('hasMentor: false → communityBonus 0', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, { ...DEFAULT_PILLAR2, hasMentor: false });
    expect(r.communityBonus).toBe(0);
  });

  it('hasMentor true, age 70 → communityBonus 0 (below 75 threshold)', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, noHabitMentor(70));
    expect(r.communityBonus).toBe(0);
  });

  it('hasMentor true, age 80 → communityBonus 0.3', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, noHabitMentor(80));
    expect(r.communityBonus).toBe(0.3);
  });

  it('hasMentor true, age 88 → communityBonus 0.5', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, noHabitMentor(88));
    expect(r.communityBonus).toBe(0.5);
  });

  it('hasMentor true, age 96 → communityBonus 0.8', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, noHabitMentor(96));
    expect(r.communityBonus).toBe(0.8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 5 — Total Forecast Sanity Checks
// ─────────────────────────────────────────────────────────────────────────────
describe('Group 5 — Total Forecast Sanity Checks', () => {
  it('average person (makeQuiz defaults, India male) → totalForecast between 60 and 80', () => {
    // base=68, health=moderate(+3)+stress5(-0.5)+bmi24.5(0)+normal(0)+7to9(0)+moderate(0)=2.5
    // expected totalForecast = 70.5
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.totalForecast).toBeGreaterThan(60);
    expect(r.totalForecast).toBeLessThan(80);
  });

  it('best case (all optimal, India male) → totalForecast between 75 and 95', () => {
    // base=68, health=never(0)+light(1)+excellent(4)+heavy(5)+optimal(1.5)+7to9(0)+strong(2)+stress2(1.5)+bmi22(0)=15
    // expected totalForecast = 83
    const r = calculateLongevity(makeQuiz({
      smoking: 'never',
      drinking: 'light',
      diet: 'excellent',
      exercise: 'heavy',
      bloodPressure: 'optimal',
      sleepDuration: '7to9',
      socialConnections: 'strong',
      stress: 2,
      bmi: 22,
    }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.totalForecast).toBeGreaterThan(75);
    expect(r.totalForecast).toBeLessThan(95);
  });

  it('worst case (all negative, India male) → totalForecast is very low but positive', () => {
    // base=68, health=-38.5 → totalForecast=29.5 — no floor in service
    const r = calculateLongevity(makeQuiz({
      smoking: 'heavy',
      drinking: 'heavy',
      diet: 'poor',
      exercise: 'seldom',
      bloodPressure: 'high2',
      sleepDuration: 'under6',
      socialConnections: 'isolated',
      stress: 9,
      bmi: 35,
    }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.totalForecast).toBeLessThan(50);
    expect(r.totalForecast).toBeGreaterThan(10);
  });

  it('totalForecast extreme best-case (Japan female, all habits, best family) → below 120', () => {
    // Japan female(87)+health15+family90genetic(+3)+allHabits(+6)+maxCommunity(+1.5) = 112.5 — no ceiling
    const r = calculateLongevity(makeQuiz({
      gender: 'female',
      country: 'Japan',
      smoking: 'never',
      drinking: 'light',
      diet: 'excellent',
      exercise: 'heavy',
      bloodPressure: 'optimal',
      sleepDuration: '7to9',
      socialConnections: 'strong',
      stress: 2,
      bmi: 22,
    }), makeAllFamilyAt(90, false), {
      hasMentor: true,
      mentorAge: 96,
      mentorName: '',
      mentorRelationship: 'neighbor',
      mentorHabits: ALL_HABIT_IDS,
    }, undefined, ALL_HABIT_IDS);
    expect(r.totalForecast).toBeLessThan(120);
  });

  it('totalForecast extreme worst-case (all diseases + all negative) → real number above 10', () => {
    // base=68, health≈-53.5 → totalForecast≈14.5 — no floor in service
    const r = calculateLongevity(makeQuiz({
      smoking: 'heavy',
      drinking: 'heavy',
      diet: 'poor',
      exercise: 'seldom',
      bloodPressure: 'high2',
      sleepDuration: 'under6',
      socialConnections: 'isolated',
      stress: 9,
      bmi: 35,
      heartDisease: true,
      heartDiseaseControlled: false,
      heartDiseaseFamily: true,
      diabetes: true,
      diabetesControlled: false,
      diabetesFamily: true,
      hypertension: true,
      hypertensionControlled: false,
    }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.totalForecast).toBeGreaterThan(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 6 — Epigenetic Habits
// All 12 habit gains: 1.5+2.0+0.8+0.5+0.8+0.6+1.2+0.7+0.3+0.6+0.9+0.5 = 10.4 → capped at 6
// ─────────────────────────────────────────────────────────────────────────────
describe('Group 6 — Epigenetic Habits', () => {
  it('all 12 habits → epigeneticAdjustment capped at 6.0', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, ALL_HABIT_IDS);
    expect(r.epigeneticAdjustment).toBe(6);
    expect(r.epigeneticAdjustment).toBeLessThanOrEqual(6);
  });

  it('0 explicit habits → epigeneticAdjustment derived from quiz (0.9 for makeQuiz defaults)', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, []);
    // Auto-derived: exercise:moderate(+0.4) + sleep:7to9(+0.3) + smoking:never(+0.2) = 0.9
    expect(r.epigeneticAdjustment).toBe(0.9);
  });

  it('only walking → epigeneticAdjustment = 1.5', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, ['walking']);
    expect(r.epigeneticAdjustment).toBe(1.5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 8 — Conditional Baseline & Survival Minimum Guard
// Tests the getConditionalBase() multiplier logic and the survival minimum
// guard by varying only country and age, isolating the baseline effect.
// All "neutral" calls use makeQuiz() defaults:
//   exercise:moderate(+3) + stress:5(-0.5) = healthAdj +2.5, no genetic/epigenetic
// ─────────────────────────────────────────────────────────────────────────────
describe('Group 8 — Conditional Baseline & Survival Minimum Guard', () => {
  // Helper: birthDate for a user of the given age
  function birthdateForAge(years: number): Date {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d;
  }

  // Worst-case quiz for survival guard trigger tests
  const worstQuiz = makeQuiz({
    smoking: 'heavy', drinking: 'heavy',
    diet: 'poor', exercise: 'seldom',
    bloodPressure: 'high2', sleepDuration: 'under6',
    socialConnections: 'isolated', stress: 9, bmi: 35,
    heartDisease: true, heartDiseaseControlled: false, heartDiseaseFamily: true,
    diabetes: true, diabetesControlled: false, diabetesFamily: true,
    hypertension: true, hypertensionControlled: false,
  });

  it('Test A — India male age 30: no conditional multiplier (age < 40)', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAge(30),
    );
    // base = 71.2 (birth baseline, no multiplier), health = +2.5 → ~73.7
    expect(r.isConditionalBaseline).toBe(false);
    expect(r.totalForecast).toBeGreaterThan(70);
    expect(r.totalForecast).toBeLessThan(79);
  });

  it('Test B — India male age 79: conditional multiplier applied (HIGH set, bracket 70)', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAge(79),
    );
    // HIGH[70]=1.163 → conditionalBase=71.2*1.163≈82.8, health=2.5 → totalForecast≈85.3
    expect(r.totalForecast).toBeGreaterThan(79);           // CRITICAL
    expect(r.totalForecast).toBeGreaterThan(80);
    expect(r.totalForecast).toBeLessThan(92);
    expect(r.isConditionalBaseline).toBe(true);
    expect(r.baselineSource).toContain('India');
  });

  it('Test C — Nigeria male age 79: conditional multiplier applied (LOW set, bracket 70)', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'Nigeria' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAge(79),
    );
    // LOW[70]=1.350 → 53.5*1.35≈72.2, health=2.5 → 74.7; survival guard raises to 85
    expect(r.totalForecast).toBeGreaterThan(79);           // CRITICAL
    expect(r.isConditionalBaseline).toBe(true);
  });

  it('Test D — Unknown country male age 79: falls back to GLOBAL_DEFAULT (HIGH set)', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'Unknownistan' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAge(79),
    );
    // GLOBAL_DEFAULT.male=73.3 > 70 → HIGH[70]=1.163 → 85.2, health=2.5 → 87.7
    expect(r.totalForecast).toBeGreaterThan(79);           // CRITICAL
    expect(r.baselineSource).toContain('Global Average');
  });

  it('Test E — Survival minimum guard triggers for India male age 79 with worst inputs', () => {
    const r = calculateLongevity(
      makeQuiz({ ...worstQuiz, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAge(79),
    );
    // survivalBuffer = floor(79*0.08) = 6; minimumThreshold = 85
    expect(r.minimumApplied).toBe(true);
    expect(r.survivalBuffer).toBe(6);
    expect(r.totalForecast).toBeGreaterThanOrEqual(85);
  });

  it('Test F — Survival minimum does NOT trigger for young user (age 35)', () => {
    // No birthDate → currentAge defaults to 35 < 50, guard never fires
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.minimumApplied).toBe(false);
  });

  it('Test G — Remaining years always positive for India male age 79 worst inputs', () => {
    const r = calculateLongevity(
      makeQuiz({ ...worstQuiz, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAge(79),
    );
    expect(r.totalForecast - 79).toBeGreaterThan(0);       // CRITICAL regression test
  });

  it('Test H — Remaining years sanity range for India male age 79 neutral inputs', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAge(79),
    );
    const remaining = r.totalForecast - 79;
    expect(remaining).toBeGreaterThanOrEqual(3);
    expect(remaining).toBeLessThanOrEqual(15);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 7 — controllablePotential
// Formula: base + maxHealth(14) + genetic + 6 + 1.5
// maxHealth = excellent(4)+heavy(5)+optimal(1.5)+stress1(1.5)+strong(2) = 14
// NOTE: drinking light (+1) is NOT in maxHealth, so best actual health (15) > maxHealth (14)
// ─────────────────────────────────────────────────────────────────────────────
describe('Group 7 — controllablePotential', () => {
  it('controllablePotential >= totalForecast for standard quiz (no habits/community)', () => {
    // Standard: totalForecast=70.5, controllablePotential=68+14+0+6+1.5=89.5
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.controllablePotential).toBeGreaterThanOrEqual(r.totalForecast);
  });

  it('controllablePotential Japan female best-case → below 130 (no artificial ceiling)', () => {
    // Japan female(87)+maxHealth(14)+genetic_family90(+3)+6+1.5 = 111.5 — no ceiling in service
    const r = calculateLongevity(makeQuiz({ gender: 'female', country: 'Japan' }),
      makeAllFamilyAt(90, false), DEFAULT_PILLAR2);
    expect(r.controllablePotential).toBeLessThan(130);
  });

  it('controllablePotential uses ACTUAL genetic adjustment, not max +8', () => {
    // With no family: genetic=0, controllablePotential = 68+14+0+6+1.5 = 89.5
    // With all-90 family: genetic=3.0, controllablePotential = 68+14+3+6+1.5 = 92.5
    // Difference = 3.0 (not 8)
    const noFamily = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    const goodFamily = calculateLongevity(makeQuiz(), makeAllFamilyAt(90, false), DEFAULT_PILLAR2);
    expect(goodFamily.controllablePotential).toBeGreaterThan(noFamily.controllablePotential);
    const diff = Math.round((goodFamily.controllablePotential - noFamily.controllablePotential) * 10) / 10;
    expect(diff).toBe(3.0);
  });
});

// ── Shared helpers for Groups A–G ────────────────────────────────────────────

function birthdateForAgeG(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

const WORST_QUIZ_OVERRIDES: Partial<HealthQuizData> = {
  smoking: 'heavy', drinking: 'heavy',
  diet: 'poor', exercise: 'seldom',
  bloodPressure: 'high2', sleepDuration: 'under6',
  socialConnections: 'isolated', stress: 9, bmi: 35,
  heartDisease: true, heartDiseaseControlled: false, heartDiseaseFamily: true,
  diabetes: true, diabetesControlled: false, diabetesFamily: true,
  hypertension: true, hypertensionControlled: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP A — Conditional baseline correctness
// getConditionalBase multiplier: age<40 none; 40→HIGH×1.04; 60→HIGH×1.113; 70→HIGH×1.163; 80→HIGH×1.218
// LOW set (birth ≤70): 70→1.350
// ─────────────────────────────────────────────────────────────────────────────
describe('Test Group A — Conditional baseline correctness', () => {
  it('A1: India male age 25 → isConditionalBaseline=false, totalForecast in 65–80', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(25),
    );
    expect(r.isConditionalBaseline).toBe(false);
    expect(r.totalForecast).toBeGreaterThan(65);
    expect(r.totalForecast).toBeLessThan(80);
  });

  it('A2: India male age 45 → conditional HIGH[40], base ≈74.0, totalForecast > 70', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(45),
    );
    expect(r.isConditionalBaseline).toBe(true);
    // 71.2 × 1.040 = 74.048 → 74.0
    expect(r.baselineLifeExpectancy).toBeCloseTo(74.0, 0);
    expect(r.totalForecast).toBeGreaterThan(70);
  });

  it('A3: India male age 65 → conditional HIGH[60], base ≈79.2, totalForecast > 65', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(65),
    );
    expect(r.isConditionalBaseline).toBe(true);
    // 71.2 × 1.113 = 79.2
    expect(r.baselineLifeExpectancy).toBeCloseTo(79.2, 0);
    expect(r.totalForecast).toBeGreaterThan(65);
  });

  it('A4: India male age 79 → totalForecast > 79 (CRITICAL regression test)', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.isConditionalBaseline).toBe(true);
    expect(r.totalForecast).toBeGreaterThan(79);
    expect(r.totalForecast - 79).toBeGreaterThan(0);
  });

  it('A5: India male age 85 → conditional HIGH[80], totalForecast > 85', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(85),
    );
    expect(r.isConditionalBaseline).toBe(true);
    expect(r.totalForecast).toBeGreaterThan(85);
  });

  it('A6: Nigeria male age 79 → LOW multiplier (birth 53.5 ≤70), totalForecast > 79', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'Nigeria' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.isConditionalBaseline).toBe(true);
    expect(r.totalForecast).toBeGreaterThan(79);
  });

  it('A7: Japan female age 79 → HIGH, base >100, totalForecast > 79', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'female', country: 'Japan' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.isConditionalBaseline).toBe(true);
    // 87.5 × 1.163 ≈ 101.8
    expect(r.baselineLifeExpectancy).toBeGreaterThan(100);
    expect(r.totalForecast).toBeGreaterThan(79);
  });

  it('A8: USA male age 79 → conditional HIGH, totalForecast > 79', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'United States' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.isConditionalBaseline).toBe(true);
    expect(r.totalForecast).toBeGreaterThan(79);
  });

  it('A9: Unknown country male age 79 → GLOBAL_DEFAULT HIGH, baselineSource contains "Global Average"', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'Ruritania' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.totalForecast).toBeGreaterThan(79);
    expect(r.baselineSource).toContain('Global Average');
  });

  it('A10: Bolivia (WHO AMRO) male age 79 → baselineSource contains "AMRO", totalForecast > 79', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'Bolivia' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.totalForecast).toBeGreaterThan(79);
    expect(r.baselineSource).toContain('AMRO');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP B — Survival minimum guard
// survivalBuffer = floor(age × 0.08); minimumThreshold = age + buffer; applied for age ≥ 50
// ─────────────────────────────────────────────────────────────────────────────
describe('Test Group B — Survival minimum guard', () => {
  it('B1: India male age 79, worst inputs → minimumApplied=true, survivalBuffer=6, totalForecast≥85', () => {
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.minimumApplied).toBe(true);
    expect(r.survivalBuffer).toBe(6);
    expect(r.minimumThreshold).toBe(85);
    expect(r.totalForecast).toBeGreaterThanOrEqual(85);
  });

  it('B2: India male age 60, worst inputs → minimumThreshold=64, totalForecast≥64', () => {
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(60),
    );
    // floor(60 × 0.08) = 4 → threshold = 64
    expect(r.minimumThreshold).toBe(64);
    expect(r.totalForecast).toBeGreaterThanOrEqual(64);
  });

  it('B3: India male age 35 (no birthDate), worst inputs → minimumApplied=false (age < 50)', () => {
    // No birthDate → currentAge defaults to 35
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
    );
    expect(r.minimumApplied).toBe(false);
  });

  it('B4: India male age 55, worst inputs → minimumThreshold=59, totalForecast≥59', () => {
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(55),
    );
    // floor(55 × 0.08) = 4 → threshold = 59
    expect(r.minimumApplied).toBe(true);
    expect(r.minimumThreshold).toBe(59);
    expect(r.totalForecast).toBeGreaterThanOrEqual(59);
  });

  it('B5: India male age 79, best inputs → minimumApplied=false, totalForecast in 88–100', () => {
    const r = calculateLongevity(
      makeQuiz({
        gender: 'male', country: 'India',
        smoking: 'never', drinking: 'light', diet: 'excellent', exercise: 'heavy',
        bloodPressure: 'optimal', sleepDuration: '7to9', socialConnections: 'strong',
        stress: 2, bmi: 22,
      }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    // base=82.8 + health15 = 97.8 → above threshold 85 → no guard
    expect(r.minimumApplied).toBe(false);
    expect(r.totalForecast).toBeGreaterThan(88);
    expect(r.totalForecast).toBeLessThan(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP C — Remaining years always positive
// (totalForecast - currentAge) must be > 0 for any reasonable inputs
// ─────────────────────────────────────────────────────────────────────────────
describe('Test Group C — Remaining years always positive', () => {
  it('C1: India male age 79, neutral → (totalForecast - 79) > 0', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.totalForecast - 79).toBeGreaterThan(0);
  });

  it('C2: India male age 79, worst inputs → (totalForecast - 79) > 0 (guard applied)', () => {
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    expect(r.totalForecast - 79).toBeGreaterThan(0);
  });

  it('C3: India male age 85, neutral → (totalForecast - 85) > 0', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(85),
    );
    expect(r.totalForecast - 85).toBeGreaterThan(0);
  });

  it('C4: Nigeria male age 75, worst inputs → (totalForecast - 75) > 0', () => {
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'Nigeria' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(75),
    );
    expect(r.totalForecast - 75).toBeGreaterThan(0);
  });

  it('C5: Japan female age 80, neutral → (totalForecast - 80) > 0', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'female', country: 'Japan' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(80),
    );
    expect(r.totalForecast - 80).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP D — Epigenetic habits cap
// All 12 habits sum = 10.4 gains → capped at 6; tested via calculateLongevity 5th arg
// ─────────────────────────────────────────────────────────────────────────────
describe('Test Group D — Epigenetic habits cap', () => {
  it('D1: All 12 habits → epigeneticAdjustment ≤ 6.0 (cap enforced)', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, ALL_HABIT_IDS);
    expect(r.epigeneticAdjustment).toBeLessThanOrEqual(6.0);
    expect(r.epigeneticAdjustment).toBe(6);
  });

  it('D2: Zero habits → epigeneticAdjustment derived from quiz (moderate exercise + good sleep + non-smoker = 0.9)', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, []);
    // makeQuiz: exercise:moderate(+0.4), sleep:7to9(+0.3), smoking:never(+0.2) = 0.9 derived
    expect(r.epigeneticAdjustment).toBe(0.9);
  });

  it('D3: Only walking → epigeneticAdjustment = 1.5', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, ['walking']);
    expect(r.epigeneticAdjustment).toBe(1.5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP E — Community bonus
// baseBonus: age>=95→0.8  age>=85→0.5  age>=75→0.3  else→0
// communityBonus = min(1.5, baseBonus + habitsBonus) rounded to 1dp
// ─────────────────────────────────────────────────────────────────────────────
describe('Test Group E — Community bonus', () => {
  const mentor = (age: number): Pillar2Data => ({
    ...DEFAULT_PILLAR2,
    hasMentor: true,
    mentorAge: age,
    mentorHabits: [],
  });

  it('E1: hasMentor false → communityBonus = 0', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.communityBonus).toBe(0);
  });

  it('E2: hasMentor true, mentorAge 70 → communityBonus = 0 (below 75 threshold)', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, mentor(70));
    expect(r.communityBonus).toBe(0);
  });

  it('E3: hasMentor true, mentorAge 76 → communityBonus = 0.3', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, mentor(76));
    expect(r.communityBonus).toBe(0.3);
  });

  it('E4: hasMentor true, mentorAge 86 → communityBonus = 0.5', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, mentor(86));
    expect(r.communityBonus).toBe(0.5);
  });

  it('E5: hasMentor true, mentorAge 96 → communityBonus = 0.8', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, mentor(96));
    expect(r.communityBonus).toBe(0.8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP F — Genetic calculation edge cases
// adj = (wfa - 78) × 0.25, capped ±8; living members get +2/+4/+7 adjustment
// ─────────────────────────────────────────────────────────────────────────────
describe('Test Group F — Genetic calculation edge cases', () => {
  it('F1: All family dontKnow:true → geneticAdjustment=0, score=Average', () => {
    const allDontKnow: Pillar1Data = {
      paternalGrandfather: { age: 0, isLiving: null, dontKnow: true },
      paternalGrandmother: { age: 0, isLiving: null, dontKnow: true },
      father:              { age: 0, isLiving: null, dontKnow: true },
      paternalUncles:      { age: 0, isLiving: null, dontKnow: true },
      paternalAunts:       { age: 0, isLiving: null, dontKnow: true },
      maternalGrandfather: { age: 0, isLiving: null, dontKnow: true },
      maternalGrandmother: { age: 0, isLiving: null, dontKnow: true },
      mother:              { age: 0, isLiving: null, dontKnow: true },
      maternalUncles:      { age: 0, isLiving: null, dontKnow: true },
      maternalAunts:       { age: 0, isLiving: null, dontKnow: true },
    };
    const r = calculateLongevity(makeQuiz(), allDontKnow, DEFAULT_PILLAR2);
    expect(r.geneticAdjustment).toBe(0);
    expect(r.geneticVitalityScore).toBe('Average');
  });

  it('F2: All family age 95, deceased → positive geneticAdjustment, score Strong or Exceptional', () => {
    const r = calculateLongevity(makeQuiz(), makeAllFamilyAt(95, false), DEFAULT_PILLAR2);
    // wfa=95, (95-78)×0.25=4.25 → adj=4.3; 95>87 → Exceptional
    expect(r.geneticAdjustment).toBeGreaterThan(0);
    expect(['Strong', 'Exceptional']).toContain(r.geneticVitalityScore);
  });

  it('F3: All family age 55, deceased → negative geneticAdjustment, score Below Average', () => {
    const r = calculateLongevity(makeQuiz(), makeAllFamilyAt(55, false), DEFAULT_PILLAR2);
    // wfa=55, (55-78)×0.25=-5.75 → adj=-5.8; 55<75 → Below Average
    expect(r.geneticAdjustment).toBeLessThan(0);
    expect(r.geneticVitalityScore).toBe('Below Average');
  });

  it('F4: Mixed family (half age 90, half age 60) → geneticAdjustment between -3 and +3', () => {
    const mixed: Pillar1Data = {
      paternalGrandfather: makeP1Member(90, false),
      paternalGrandmother: makeP1Member(90, false),
      father:              makeP1Member(60, false),
      paternalUncles:      makeP1Member(60, false),
      paternalAunts:       makeP1Member(60, false),
      maternalGrandfather: makeP1Member(90, false),
      maternalGrandmother: makeP1Member(90, false),
      mother:              makeP1Member(60, false),
      maternalUncles:      makeP1Member(60, false),
      maternalAunts:       makeP1Member(60, false),
    };
    const r = calculateLongevity(makeQuiz(), mixed, DEFAULT_PILLAR2);
    // patAvg=75, matAvg=75, wfa=75, (75-78)×0.25=-0.75 → adj=-0.8
    expect(r.geneticAdjustment).toBeGreaterThan(-3);
    expect(r.geneticAdjustment).toBeLessThan(3);
  });

  it('F5: One living grandparent age 95 → living adjustment applied (adj > 4.0)', () => {
    const pillar1: Pillar1Data = {
      ...DEFAULT_PILLAR1,
      paternalGrandfather: { age: 95, isLiving: true, dontKnow: false },
    };
    const r = calculateLongevity(makeQuiz(), pillar1, DEFAULT_PILLAR2);
    // contribution = 95+7 = 102; (102-78)×0.25 = 6.0 > 4.25 (without living adj)
    expect(r.geneticAdjustment).toBeGreaterThan(4.0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP G — controllablePotential sanity
// formula: base + maxHealth(14) + genetic + 6 + 1.5
// maxHealth = diet4 + exercise5 + BP1.5 + stress<3(1.5) + sleep0 + social2 = 14
// ─────────────────────────────────────────────────────────────────────────────
describe('Test Group G — controllablePotential sanity', () => {
  it('G1: controllablePotential >= totalForecast (India male, neutral)', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(r.controllablePotential).toBeGreaterThanOrEqual(r.totalForecast);
  });

  it('G2: India male age 79, neutral → controllablePotential > totalForecast', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    // totalForecast≈85.3, controllablePotential = 82.8+14+0+6+1.5 = 104.3
    expect(r.controllablePotential).toBeGreaterThan(r.totalForecast);
  });

  it('G3: India male age 79, neutral → controllablePotential < 115', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    // base(82.8) + 14 + 0 + 6 + 1.5 = 104.3 < 115
    expect(r.controllablePotential).toBeLessThan(115);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NEG1–NEG10 — Negative scenario tests
// Verify floors, caps, and adverse-input guards hold under worst-case inputs.
// ─────────────────────────────────────────────────────────────────────────────
describe('NEG — Negative scenario tests', () => {
  it('NEG1: India male no birthDate (age 35), all-worst inputs → totalForecast floored to 35.5 by hard minimum', () => {
    // base=71.2 (age<40, no conditional) + health≈-53.5 → naive 17.7
    // hard min: max(17.7, 35+0.5) = 35.5; survival guard not applied (age < 50)
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
    );
    expect(r.totalForecast).toBeGreaterThanOrEqual(35.5);
    expect(r.minimumApplied).toBe(false); // survival guard only fires for age ≥ 50
  });

  it('NEG2: recalcWithOverrides India male age 79, all-worst overrides + extra negatives → result ≥ 79.5', () => {
    // survival guard raises r.totalForecast to 85; extra=-6.8 → 78.2; hard min=max(78.2, 79.5)=79.5
    const base = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(79),
    );
    const result = recalcWithOverrides(base, {
      smoking: 'heavy', drinking: 'heavy', diet: 'poor', exercise: 'seldom',
      bloodPressure: 'high2', sleepDuration: 'under6', socialConnections: 'isolated',
      stress: 9, bmi: 35,
      hydration: 'poor', screenTime: 'very_high', workLifeBalance: 'poor',
      mentalHealth: 'struggling', airQuality: 'polluted', relationship: 'divorced',
    });
    expect(result).toBeGreaterThanOrEqual(79.5);
  });

  it('NEG3: recalcWithOverrides with empty overrides returns same as original totalForecast', () => {
    const base = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    const result = recalcWithOverrides(base, {});
    expect(result).toBe(base.totalForecast);
  });

  it('NEG4: all family deceased age 200 → geneticAdjustment capped at +8.0', () => {
    // wfa=200; (200-78)×0.25=30.5 → capped at min(8, 30.5) = 8.0
    const r = calculateLongevity(makeQuiz(), makeAllFamilyAt(200, false), DEFAULT_PILLAR2);
    expect(r.geneticAdjustment).toBe(8.0);
  });

  it('NEG5: all family deceased age 10 → geneticAdjustment capped at -8.0', () => {
    // wfa=10; (10-78)×0.25=-17 → capped at max(-8, -17) = -8.0
    const r = calculateLongevity(makeQuiz(), makeAllFamilyAt(10, false), DEFAULT_PILLAR2);
    expect(r.geneticAdjustment).toBe(-8.0);
  });

  it('NEG6: stress=5 vs stress=4 → exactly 1.5 year difference in totalForecast', () => {
    // stress≥5→-0.5; stress≥3(but<5)→+1.0; diff = 1.5
    const stress5 = calculateLongevity(makeQuiz({ stress: 5 }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    const stress4 = calculateLongevity(makeQuiz({ stress: 4 }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(Math.round((stress4.totalForecast - stress5.totalForecast) * 10) / 10).toBe(1.5);
  });

  it('NEG7: mentor age 96 + all 12 habits → communityBonus = 1.5 (habits push past base; capped at 1.5)', () => {
    // baseBonus=0.8 (age≥95); habitsBonus=min(1.0, 10.4×0.15)=1.0; total=min(1.5, 1.8)=1.5
    const pillar2Full: Pillar2Data = {
      hasMentor: true, mentorAge: 96,
      mentorName: '', mentorRelationship: 'neighbor',
      mentorHabits: ALL_HABIT_IDS,
    };
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, pillar2Full);
    expect(r.communityBonus).toBe(1.5);
  });

  it('NEG8: drinking light (+1) vs none (0) → exactly 1.0 year difference in totalForecast', () => {
    const drinkNone = calculateLongevity(makeQuiz({ drinking: 'none' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    const drinkLight = calculateLongevity(makeQuiz({ drinking: 'light' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(Math.round((drinkLight.totalForecast - drinkNone.totalForecast) * 10) / 10).toBe(1.0);
  });

  it('NEG9: exercise heavy vs seldom → 7.7 year difference (7.0 health + 0.7 epigenetic derived diff)', () => {
    const heavy = calculateLongevity(makeQuiz({ exercise: 'heavy' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    const seldom = calculateLongevity(makeQuiz({ exercise: 'seldom' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    // Health diff: heavy(+5) - seldom(-2) = 7.0; epigenetic derived diff: heavy(0.7) - seldom(0.0) = 0.7; total = 7.7
    expect(Math.round((heavy.totalForecast - seldom.totalForecast) * 10) / 10).toBe(7.7);
  });

  it('NEG10: recalcWithOverrides epigeneticBonusOverride=6 sets total epigenetic to 6 from derived base of 0.9', () => {
    const base = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, []);
    // Auto-derived from makeQuiz defaults: 0.9
    expect(base.epigeneticAdjustment).toBe(0.9);
    const result = recalcWithOverrides(base, { epigeneticBonusOverride: 6 });
    // epigenDiff = 6 - 0.9 = 5.1; simForecast = base.totalForecast + 5.1
    expect(result).toBe(Math.round((base.totalForecast + 5.1) * 10) / 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EDGE1–EDGE7 — Edge case tests
// Boundary conditions: exact age thresholds, gender parity, fallback chains.
// ─────────────────────────────────────────────────────────────────────────────
describe('EDGE — Edge case tests', () => {
  it('EDGE1: age 51 with worst inputs → survival guard triggers (buffer=4, threshold=55)', () => {
    // birthdateForAgeG(51) → currentAge=51; floor(51×0.08)=4; threshold=55
    // naive forecast ≈ 22.7 < 55 → guard applied
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(51),
    );
    expect(r.minimumApplied).toBe(true);
    expect(r.survivalBuffer).toBe(4);
    expect(r.minimumThreshold).toBe(55);
    expect(r.totalForecast).toBeGreaterThanOrEqual(55);
  });

  it('EDGE2: age exactly 49 with worst inputs → survival guard does NOT trigger (age < 50)', () => {
    const r = calculateLongevity(
      makeQuiz({ ...WORST_QUIZ_OVERRIDES, gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(49),
    );
    expect(r.minimumApplied).toBe(false);
    expect(r.survivalBuffer).toBe(0);
  });

  it('EDGE3: India male age exactly 40 → conditional multiplier HIGH[40]=1.040 applied, base ≈ 74.0', () => {
    // 71.2 × 1.040 = 74.048 → 74.0
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(40),
    );
    expect(r.isConditionalBaseline).toBe(true);
    expect(r.baselineLifeExpectancy).toBeCloseTo(74.0, 0);
  });

  it('EDGE4: India male age exactly 39 → no conditional multiplier, birth baseline returned', () => {
    const r = calculateLongevity(
      makeQuiz({ gender: 'male', country: 'India' }),
      DEFAULT_PILLAR1, DEFAULT_PILLAR2,
      birthdateForAgeG(39),
    );
    expect(r.isConditionalBaseline).toBe(false);
    expect(r.baselineLifeExpectancy).toBe(71.2); // raw birth baseline, no multiplier
  });

  it('EDGE5: Japan female has higher baseline and totalForecast than Japan male (same age, same inputs)', () => {
    // Japan male birth=81.5, female birth=87.5; no conditional (age 35 < 40)
    const male   = calculateLongevity(makeQuiz({ gender: 'male',   country: 'Japan' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    const female = calculateLongevity(makeQuiz({ gender: 'female', country: 'Japan' }), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    expect(female.baselineLifeExpectancy).toBeGreaterThan(male.baselineLifeExpectancy);
    expect(female.totalForecast).toBeGreaterThan(male.totalForecast);
  });

  it('EDGE6: all 12 habits → blueZonesCount = 10 (cold & learning are not Blue Zones habits)', () => {
    const r = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2, undefined, ALL_HABIT_IDS);
    expect(r.blueZonesCount).toBe(10);
  });

  it('EDGE7: recalcWithOverrides hydration=high adds exactly +0.5 vs no hydration override', () => {
    // extraAdjustment: hydration high → +0.5
    const base = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
    const withHydration    = recalcWithOverrides(base, { hydration: 'high' });
    const withoutHydration = recalcWithOverrides(base, {});
    expect(Math.round((withHydration - withoutHydration) * 10) / 10).toBe(0.5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// S1–S6 — calculateLongevityScore
// Formula: base=50, healthContrib (max±20), geneticContrib (max+15),
//          epigeneticContrib (max+10 at 6yr), communityContrib (max+5 at 1.5yr)
// Clamped [0, 100].
// ─────────────────────────────────────────────────────────────────────────────
import { calculateLongevityScore } from '../LongevityCalculationService';

function makeResult(overrides: Partial<{
  healthAdjustment: number;
  geneticAdjustment: number;
  epigeneticAdjustment: number;
  communityBonus: number;
  factorBreakdown: any[];
}> = {}) {
  const base = calculateLongevity(makeQuiz(), DEFAULT_PILLAR1, DEFAULT_PILLAR2);
  return {
    ...base,
    healthAdjustment: 0,
    geneticAdjustment: 0,
    epigeneticAdjustment: 0,
    communityBonus: 0,
    factorBreakdown: [],
    ...overrides,
  };
}

describe('S1–S6 — calculateLongevityScore', () => {
  it('S1: all zeros → base 50 + healthMid(10) + geneticMid(6) = 66', () => {
    // health=0 → healthNorm=(0+15)/30=0.5 → round(0.5*20)=10
    // genetic=0 → geneticNorm=(0+4)/10=0.4 → round(min(0.4*15,15))=round(6)=6
    // epi=0 → 0; community=0 → 0; total=66
    const score = calculateLongevityScore(makeResult());
    expect(score).toBe(66);
  });

  it('S2: max health (+15) → health contrib = 20 (full)', () => {
    // health=15 → norm=(15+15)/30=1 → round(1*20)=20; genetic=0→6; total=50+20+6=76
    const score = calculateLongevityScore(makeResult({ healthAdjustment: 15 }));
    expect(score).toBe(76);
  });

  it('S3: worst health (-15) → health contrib = 0', () => {
    // health=-15 → norm=0 → contrib=0; genetic=0→6; total=56
    const score = calculateLongevityScore(makeResult({ healthAdjustment: -15 }));
    expect(score).toBe(56);
  });

  it('S4: max epigenetic (6yr) → epi contrib = 10', () => {
    // epi=6 → round(6/6*10)=10; health=0→10; genetic=0→6; total=76
    const score = calculateLongevityScore(makeResult({ epigeneticAdjustment: 6 }));
    expect(score).toBe(76);
  });

  it('S5: max community (1.5yr) → community contrib = 5', () => {
    // community=1.5 → round(1.5/1.5*5)=5; total=50+10+6+5=71
    const score = calculateLongevityScore(makeResult({ communityBonus: 1.5 }));
    expect(score).toBe(71);
  });

  it('S6: extreme values are clamped to [0, 100]', () => {
    const high = calculateLongevityScore(makeResult({
      healthAdjustment: 100,
      geneticAdjustment: 100,
      epigeneticAdjustment: 100,
      communityBonus: 100,
    }));
    expect(high).toBe(100);

    const low = calculateLongevityScore(makeResult({
      healthAdjustment: -100,
      geneticAdjustment: -100,
    }));
    expect(low).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FM1–FM5 — calculateBaseForecast (FamilyService pure logic)
// Inlined here to avoid Supabase module (which uses localStorage) failing in Node.
// Logic is identical to FamilyService.calculateBaseForecast.
// Returns getConditionalBase(country, gender, age).base + 1.5, rounded to 1dp.
// ─────────────────────────────────────────────────────────────────────────────
import { getConditionalBase } from '../LongevityCalculationService';

function calculateBaseForecastPure(dob: string, gender: string, country: string): number {
  const birthDate = new Date(dob);
  const currentAge = Math.floor(
    (new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const g = gender === 'female' ? 'female' : 'male';
  const { base } = getConditionalBase(country || 'Unknown', g, currentAge);
  return Math.round((base + 1.5) * 10) / 10;
}

function dobForAge(yearsAgo: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d.toISOString().split('T')[0];
}

describe('FM1–FM5 — calculateBaseForecast', () => {
  it('FM1: male India age~30 → 71.2 + 1.5 = 72.7', () => {
    // age=30 < 40 → no conditional multiplier; base = 71.2
    const fc = calculateBaseForecastPure(dobForAge(30), 'male', 'India');
    expect(fc).toBe(72.7);
  });

  it('FM2: female India age~30 → 74.4 + 1.5 = 75.9', () => {
    const fc = calculateBaseForecastPure(dobForAge(30), 'female', 'India');
    expect(fc).toBe(75.9);
  });

  it('FM3: male United States age~30 → 74.5 + 1.5 = 76.0', () => {
    const fc = calculateBaseForecastPure(dobForAge(30), 'male', 'United States');
    expect(fc).toBe(76.0);
  });

  it('FM4: female Japan age~45 → conditional multiplier applied (HIGH bracket)', () => {
    // birth baseline Japan female = 87.5 (> 70, HIGH set)
    // dobForAge(45) → age=44 or 45, both in bracket=40 (avoids age-50 boundary)
    // bracket=40, HIGH[40]=1.040 → conditional = round(87.5*1.040*10)/10 = 91.0
    // forecast = 91.0 + 1.5 = 92.5 (conditional multiplier is applied — higher than birth baseline 87.5)
    const fc = calculateBaseForecastPure(dobForAge(45), 'female', 'Japan');
    expect(fc).toBe(92.5);
    // Verify the multiplier actually lifted the base above the birth baseline
    expect(fc).toBeGreaterThan(87.5 + 1.5);
  });

  it('FM5: unknown country → global default 73.3 + 1.5 = 74.8', () => {
    const fc = calculateBaseForecastPure(dobForAge(30), 'male', 'Atlantis');
    expect(fc).toBe(74.8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP W3 — Wave 3: Country Comparison, Biological Age, PDF Quota
// ─────────────────────────────────────────────────────────────────────────────
import { getForecastForCountry } from '../LongevityCalculationService';
import { calculateBiologicalAge } from '../BiologicalAgeService';

// getQuotaLimit inlined to avoid Supabase module import in Node environment
function getQuotaLimitPure(tier: string): number {
  if (tier === 'premium') return 3;
  if (tier === 'trial') return 2;
  return 1;
}

const ALL_BEST_ANSWERS = {
  heartRate: 'under60', pushups: 'excellent', balance: 'excellent',
  stairs: 'never', sleep: 'refreshed', flexibility: 'palms',
  memory: 'excellent', reaction: 'fast', waistHeight: 'healthy', energy: 'high',
};
const ALL_WORST_ANSWERS = {
  heartRate: 'high', pushups: 'poor', balance: 'poor',
  stairs: 'always', sleep: 'exhausted', flexibility: 'knees',
  memory: 'poor', reaction: 'veryslow', waistHeight: 'very_high', energy: 'verylow',
};

describe('Group W3-1-3 — Country Forecast Comparison', () => {
  it('W3-1: Japan female forecast > Nigeria female forecast at age 40', () => {
    const japan = getForecastForCountry('Japan', 'female', 40, 0, 0, 0, 0);
    const nigeria = getForecastForCountry('Nigeria', 'female', 40, 0, 0, 0, 0);
    expect(japan).toBeGreaterThan(nigeria);
  });

  it('W3-2: Japan male forecast > India male forecast at same age', () => {
    const japan = getForecastForCountry('Japan', 'male', 40, 0, 0, 0, 0);
    const india = getForecastForCountry('India', 'male', 40, 0, 0, 0, 0);
    expect(japan).toBeGreaterThan(india);
  });

  it('W3-3: Country forecast is always above current age even for low-baseline country at age 79', () => {
    // Nigeria male birth baseline = 53.5; conditional at 79 still low — minimum enforced
    const forecast = getForecastForCountry('Nigeria', 'male', 79, 0, 0, 0, 0);
    expect(forecast).toBeGreaterThan(79);
  });
});

describe('Group W3-4-8 — Biological Age Calculator', () => {
  it('W3-4: All best answers → bioAge < 45 for chronological age 45', () => {
    const bio = calculateBiologicalAge(45, ALL_BEST_ANSWERS);
    expect(bio).toBeLessThan(45);
  });

  it('W3-5: All worst answers → bioAge > 45 for chronological age 45', () => {
    const bio = calculateBiologicalAge(45, ALL_WORST_ANSWERS);
    expect(bio).toBeGreaterThan(45);
  });

  it('W3-6: Cap at -15 even if raw total adjustments = -30', () => {
    // All best: 10 × -3 = -30; capped at -15 → bioAge = max(18, 45 - 15) = 30
    const bio = calculateBiologicalAge(45, ALL_BEST_ANSWERS);
    expect(bio).toBe(30);
  });

  it('W3-7: Cap at +15 even if raw total adjustments = +30', () => {
    // All worst: 10 × 3 = +30; capped at +15 → bioAge = max(18, 45 + 15) = 60
    const bio = calculateBiologicalAge(45, ALL_WORST_ANSWERS);
    expect(bio).toBe(60);
  });

  it('W3-8: bioAge floor is 18 — never returns below 18', () => {
    // chronologicalAge 5 + cap(-15) = -10 → max(18, -10) = 18
    const bio = calculateBiologicalAge(5, ALL_BEST_ANSWERS);
    expect(bio).toBe(18);
  });
});

describe('Group W3-9-10 — PDF Quota Limits', () => {
  it('W3-9: Free user quota limit is 1', () => {
    expect(getQuotaLimitPure('free')).toBe(1);
  });

  it('W3-10: Trial user quota limit is 2', () => {
    expect(getQuotaLimitPure('trial')).toBe(2);
  });
});
