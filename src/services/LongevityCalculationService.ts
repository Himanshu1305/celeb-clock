// src/services/LongevityCalculationService.ts
// All calculation is client-side only — no health data is transmitted.

export interface FamilyMemberData {
  age: number;
  isLiving: boolean;
  unknown: boolean;
}

export interface Pillar1Data {
  paternalGrandfather: FamilyMemberData;
  paternalGrandmother: FamilyMemberData;
  father: FamilyMemberData;
  paternalUncles: FamilyMemberData;
  paternalAunts: FamilyMemberData;
  maternalGrandfather: FamilyMemberData;
  maternalGrandmother: FamilyMemberData;
  mother: FamilyMemberData;
  maternalUncles: FamilyMemberData;
  maternalAunts: FamilyMemberData;
}

export interface Pillar2Data {
  hasMentor: boolean;
  mentorName: string;
  mentorAge: number;
  mentorRelationship: string;
  selectedHabits: string[];
}

export interface HealthQuizData {
  name: string;
  gender: 'male' | 'female' | '';
  country: string;
  smoking: 'never' | 'light' | 'moderate' | 'heavy' | '';
  drinking: 'none' | 'light' | 'moderate' | 'heavy' | '';
  heartDisease: boolean;
  heartDiseaseFamily: boolean;
  heartDiseaseControlled: boolean | null;
  diabetes: boolean;
  diabetesFamily: boolean;
  diabetesControlled: boolean | null;
  hypertension: boolean;
  hypertensionControlled: boolean | null;
  diet: 'poor' | 'average' | 'good' | 'excellent' | '';
  exercise: 'seldom' | 'light' | 'moderate' | 'heavy' | '';
  stress: number;
  bmi: number;
  bloodPressure: 'optimal' | 'normal' | 'elevated' | 'high1' | 'high2' | '';
  sleepDuration: 'under6' | '6to7' | '7to9' | 'over9' | '';
  socialConnections: 'strong' | 'moderate' | 'limited' | 'isolated' | '';
}

export interface FactorImpact {
  factor: string;
  emoji: string;
  currentValueLabel: string;
  optimalValueLabel: string;
  currentImpact: number;
  potentialGain: number;
  source: string;
  category: 'lifestyle' | 'health' | 'genetic' | 'epigenetic';
}

export interface LongevityResult {
  baselineLifeExpectancy: number;
  healthAdjustment: number;
  geneticAdjustment: number;
  epigeneticAdjustment: number;
  communityBonus: number;
  totalForecast: number;
  maximumPotential: number;
  yearsGapToClose: number;
  currentAge: number;
  yearsRemaining: number;
  factorBreakdown: FactorImpact[];
  geneticVitalityScore: 'Exceptional' | 'Strong' | 'Average' | 'Below Average';
  geneticVitalityLabel: string;
  familyBaselineAge: number;
  epigeneticHabitsSelected: string[];
  blueZonesCount: number;
  baselineCitation: string;
  quizSnapshot: HealthQuizData;
  pillar1Snapshot: Pillar1Data;
  pillar2Snapshot: Pillar2Data;
}

// WHO 2023 base life expectancy by country and sex
const BASE_TABLE: Record<string, { male: number; female: number }> = {
  'India':         { male: 68, female: 71 },
  'United States': { male: 74, female: 80 },
  'United Kingdom':{ male: 79, female: 83 },
  'Australia':     { male: 81, female: 85 },
  'Canada':        { male: 79, female: 84 },
  'Germany':       { male: 78, female: 83 },
  'France':        { male: 79, female: 85 },
  'Japan':         { male: 81, female: 87 },
  'China':         { male: 75, female: 79 },
  'Brazil':        { male: 72, female: 79 },
  'South Africa':  { male: 62, female: 68 },
  'Nigeria':       { male: 54, female: 57 },
  'Mexico':        { male: 73, female: 78 },
};
const DEFAULT_BASE = { male: 72, female: 76 };

// Blue Zones habits mapped from Buettner's 9 principles
const BLUE_ZONES_HABIT_IDS = new Set([
  'walking',    // Move naturally
  'purpose',    // Purpose
  'meditation', // Downshift
  'fasting',    // 80% rule
  'wholefood',  // Plant slant
  'spiritual',  // Belong
  'community',  // Loved ones first
  'volunteer',  // Right tribe
]);

const VITALITY_LABELS: Record<LongevityResult['geneticVitalityScore'], string> = {
  Exceptional:      'Your family history shows exceptional longevity — strong hereditary tailwinds',
  Strong:           'Solid genetic inheritance — your family history supports above-average longevity',
  Average:          'Close to global population norms — lifestyle choices have outsized impact',
  'Below Average':  'Lifestyle habits are especially important for you — every habit compounds',
};

export const EPIGENETIC_HABITS: {
  id: string; label: string; emoji: string; gain: number; source: string;
}[] = [
  { id: 'walking',    label: 'Daily Walking (30+ min)',                    emoji: '🚶', gain: 1.5, source: 'Blue Zones research: daily walkers live 1.5 years longer on average (Buettner, 2012)' },
  { id: 'community',  label: 'Strong Community Bonds',                      emoji: '👥', gain: 2.0, source: 'Harvard Study of Adult Development (80 years): quality of relationships is the strongest predictor of healthy aging' },
  { id: 'laughter',   label: 'Laughter & Joy Practices',                    emoji: '😂', gain: 0.8, source: 'International Journal of Yoga, 2020: documented cortisol reduction and immune function improvement from regular laughter therapy' },
  { id: 'meditation', label: 'Meditation / Mindfulness',                    emoji: '🧘', gain: 0.5, source: 'NHS-backed evidence: regular meditation reduces chronic stress markers associated with cellular aging' },
  { id: 'wholefood',  label: 'Mediterranean / Traditional Whole Food Diet', emoji: '🥗', gain: 0.8, source: 'PREDIMED Study, NEJM 2013: Mediterranean diet reduced cardiovascular events by 30%' },
  { id: 'fasting',    label: 'Intermittent Fasting / Mindful Eating',       emoji: '⏰', gain: 0.6, source: 'Cell Metabolism, 2019: time-restricted eating improves metabolic markers associated with longevity' },
  { id: 'purpose',    label: 'Strong Sense of Purpose (Ikigai)',             emoji: '🎯', gain: 1.2, source: 'Okinawa Blue Zone study: having ikigai (reason for being) correlates with 7 additional healthy years' },
  { id: 'spiritual',  label: 'Spiritual / Religious Practice',               emoji: '🙏', gain: 0.7, source: 'JAMA Internal Medicine meta-analysis: regular spiritual practice associated with longevity increase across 32 studies' },
  { id: 'cold',       label: 'Cold Exposure / Contrast Therapy',             emoji: '🌊', gain: 0.3, source: 'Wim Hof studies and Scandinavian cold bathing research show immune and inflammatory benefits' },
  { id: 'gardening',  label: 'Active Gardening / Nature Immersion',          emoji: '🌿', gain: 0.6, source: 'Preventive Medicine Reports, 2017: regular gardening reduces dementia risk by 36%' },
  { id: 'learning',   label: 'Lifelong Learning / Mental Stimulation',       emoji: '📚', gain: 0.9, source: 'Neurology journal: continuous learning builds cognitive reserve, delaying neurodegeneration by average 8.7 years' },
  { id: 'volunteer',  label: 'Volunteering / Giving Back',                   emoji: '🤝', gain: 0.5, source: 'Health Psychology journal: regular volunteering reduces mortality risk by 22%' },
];

export const DEFAULT_PILLAR1: Pillar1Data = {
  paternalGrandfather: { age: 0, isLiving: false, unknown: true },
  paternalGrandmother: { age: 0, isLiving: false, unknown: true },
  father:              { age: 0, isLiving: false, unknown: true },
  paternalUncles:      { age: 0, isLiving: false, unknown: true },
  paternalAunts:       { age: 0, isLiving: false, unknown: true },
  maternalGrandfather: { age: 0, isLiving: false, unknown: true },
  maternalGrandmother: { age: 0, isLiving: false, unknown: true },
  mother:              { age: 0, isLiving: false, unknown: true },
  maternalUncles:      { age: 0, isLiving: false, unknown: true },
  maternalAunts:       { age: 0, isLiving: false, unknown: true },
};

export const DEFAULT_PILLAR2: Pillar2Data = {
  hasMentor: false,
  mentorName: '',
  mentorAge: 0,
  mentorRelationship: 'neighbor',
  selectedHabits: [],
};

function getBase(country: string, gender: 'male' | 'female' | ''): number {
  const g = gender === 'female' ? 'female' : 'male';
  return (BASE_TABLE[country] ?? DEFAULT_BASE)[g];
}

function geneticCalc(p1: Pillar1Data): {
  adjustment: number;
  familyBaselineAge: number;
  score: LongevityResult['geneticVitalityScore'];
} {
  const pat = [p1.paternalGrandfather, p1.paternalGrandmother, p1.father, p1.paternalUncles, p1.paternalAunts]
    .filter(m => !m.unknown && m.age > 0);
  const mat = [p1.maternalGrandfather, p1.maternalGrandmother, p1.mother, p1.maternalUncles, p1.maternalAunts]
    .filter(m => !m.unknown && m.age > 0);

  if (pat.length === 0 && mat.length === 0) {
    return { adjustment: 0, familyBaselineAge: 78, score: 'Average' };
  }

  const patAvg = pat.length > 0 ? pat.reduce((s, m) => s + m.age, 0) / pat.length : 78;
  const matAvg = mat.length > 0 ? mat.reduce((s, m) => s + m.age, 0) / mat.length : 78;

  const wfa =
    pat.length > 0 && mat.length > 0 ? patAvg * 0.5 + matAvg * 0.5 :
    pat.length > 0 ? patAvg : matAvg;

  const adj = Math.max(-8, Math.min(8, (wfa - 78) * 0.25));
  const score: LongevityResult['geneticVitalityScore'] =
    wfa > 85 ? 'Exceptional' : wfa >= 80 ? 'Strong' : wfa >= 75 ? 'Average' : 'Below Average';

  return { adjustment: adj, familyBaselineAge: wfa, score };
}

export function calculateLongevity(
  quiz: HealthQuizData,
  pillar1: Pillar1Data,
  pillar2: Pillar2Data,
  birthDate?: Date | null,
): LongevityResult {
  const base = getBase(quiz.country, quiz.gender);

  // ── Steps 1-6 health adjustment ──
  let health = 0;

  const smokeVal = { never: 0, light: -3, moderate: -7, heavy: -12, '': 0 }[quiz.smoking] ?? 0;
  health += smokeVal;

  const drinkVal = { none: 0, light: 1, moderate: -1, heavy: -6, '': 0 }[quiz.drinking] ?? 0;
  health += drinkVal;

  if (quiz.heartDisease)       { health -= 5; if (quiz.heartDiseaseControlled)  health += 1.25; }
  if (quiz.heartDiseaseFamily) health -= 2;
  if (quiz.diabetes)           { health -= 4; if (quiz.diabetesControlled)       health += 1.6; }
  if (quiz.diabetesFamily)     health -= 1;
  if (quiz.hypertension)       { health -= 3; if (quiz.hypertensionControlled)   health += 1.05; }

  const dietVal = { poor: -3, average: 0, good: 2, excellent: 4, '': 0 }[quiz.diet] ?? 0;
  health += dietVal;

  const exVal = { seldom: -2, light: 1, moderate: 3, heavy: 5, '': 0 }[quiz.exercise] ?? 0;
  health += exVal;

  const stressVal = quiz.stress >= 8 ? -2.5 : quiz.stress >= 5 ? -0.5 : quiz.stress >= 3 ? 1 : 1.5;
  health += stressVal;

  const bmiVal = quiz.bmi < 18.5 ? -2 : quiz.bmi > 30 ? -3 : quiz.bmi > 25 ? -1 : 0;
  health += bmiVal;

  const bpVal = { optimal: 1.5, normal: 0, elevated: -1, high1: -2.5, high2: -5, '': 0 }[quiz.bloodPressure] ?? 0;
  health += bpVal;

  const sleepVal = { under6: -2, '6to7': -0.5, '7to9': 0, over9: -1, '': 0 }[quiz.sleepDuration] ?? 0;
  health += sleepVal;

  const socVal = { strong: 2, moderate: 0, limited: -1.5, isolated: -3, '': 0 }[quiz.socialConnections] ?? 0;
  health += socVal;

  // ── Pillar 1: Genetics ──
  const { adjustment: genetic, familyBaselineAge, score } = geneticCalc(pillar1);

  // ── Pillar 2: Epigenetics ──
  const habitSum = pillar2.selectedHabits.reduce((s, id) => {
    const h = EPIGENETIC_HABITS.find(x => x.id === id);
    return s + (h?.gain ?? 0);
  }, 0);
  const epigenetic = Math.min(6, habitSum);
  const communityBonus = pillar2.hasMentor && pillar2.mentorAge > 85 ? 0.5 : 0;

  const totalForecast = Math.round((base + health + genetic + epigenetic + communityBonus) * 10) / 10;

  const maxHealth = 4 + 5 + 1.5 + 1.5 + 0 + 2; // excellent diet + heavy ex + low stress + optimal BP + good sleep + strong social
  const maximumPotential = Math.round((base + maxHealth + 8 + 6 + 0.5) * 10) / 10;

  // Age calculation
  const now = new Date();
  const currentAge = birthDate instanceof Date
    ? Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000))
    : 35;
  const yearsRemaining = Math.max(0, Math.round((totalForecast - currentAge) * 10) / 10);

  // Blue Zones alignment
  const blueZonesCount = pillar2.selectedHabits.filter(id => BLUE_ZONES_HABIT_IDS.has(id)).length;

  // ── Factor breakdown ──
  const factors: FactorImpact[] = [];

  const add = (
    factor: string, emoji: string,
    currentValueLabel: string, optimalValueLabel: string,
    currentImpact: number, potentialGain: number,
    source: string, category: FactorImpact['category'],
  ) => factors.push({ factor, emoji, currentValueLabel, optimalValueLabel, currentImpact, potentialGain, source, category });

  add('Tobacco Smoking', '🚬',
    quiz.smoking || 'Not answered', 'Non-smoker',
    smokeVal, smokeVal < 0 ? Math.abs(smokeVal) : 0,
    'WHO, 2023: Smoking is the leading preventable cause of death worldwide', 'lifestyle');

  add('Alcohol Consumption', '🍷',
    quiz.drinking || 'Not answered', 'None',
    drinkVal, drinkVal < 0 ? Math.abs(drinkVal) : 0,
    'CDC, 2023: No level of alcohol is safe for cancer risk', 'lifestyle');

  add('Physical Exercise', '🏋️',
    quiz.exercise || 'Not answered', 'Heavy (5+ sessions/week)',
    exVal, Math.max(0, 5 - exVal),
    'WHO, 2022: Moderate exercise reduces all-cause mortality by 31%', 'lifestyle');

  add('Diet Quality', '🥗',
    quiz.diet || 'Not answered', 'Excellent (whole foods)',
    dietVal, Math.max(0, 4 - dietVal),
    'Harvard School of Public Health: nutrient-dense diet adds 4+ years of healthy life', 'lifestyle');

  add('Stress Level', '🧠',
    `${quiz.stress}/10`, 'Low (1–2/10)',
    stressVal, Math.max(0, 1.5 - stressVal),
    'AHA, 2021: High daily stress increases cardiovascular disease risk by 40%', 'health');

  add('BMI / Body Weight', '⚖️',
    `${quiz.bmi}`, '18.5–24.9 (Normal)',
    bmiVal, Math.abs(Math.min(0, bmiVal)),
    'WHO, 2023: BMI 18.5–24.9 associated with lowest all-cause mortality', 'health');

  add('Blood Pressure', '❤️',
    quiz.bloodPressure || 'Not answered', 'Optimal (<120/80)',
    bpVal, Math.max(0, 1.5 - bpVal),
    'JNC8/AHA Guidelines, 2023: Optimal BP significantly reduces stroke and heart attack risk', 'health');

  add('Sleep Duration', '😴',
    quiz.sleepDuration || 'Not answered', '7–9 hours (optimal)',
    sleepVal, Math.max(0, -sleepVal),
    'NHS/National Sleep Foundation, 2023: <6 hrs/night has 12% higher all-cause mortality risk', 'health');

  add('Social Connections', '👥',
    quiz.socialConnections || 'Not answered', 'Strong',
    socVal, Math.max(0, 2 - socVal),
    'Harvard Study of Adult Development: strong relationships comparable to quitting smoking', 'lifestyle');

  add('Family Genetics', '🧬',
    `Family avg: ~${Math.round(familyBaselineAge)} yrs`, 'Family avg >85 yrs',
    Math.round(genetic * 10) / 10, Math.max(0, Math.round((8 - genetic) * 10) / 10),
    'Karolinska Institute, 2017: Genetics account for 25–30% of longevity outcomes', 'genetic');

  add('Epigenetic Habits', '🌱',
    `${pillar2.selectedHabits.length} habits active`, 'All 12 habits active',
    Math.round(epigenetic * 10) / 10, Math.max(0, Math.round((6 - epigenetic) * 10) / 10),
    'WHO, 2023: Lifestyle factors account for up to 70% of longevity outcomes', 'epigenetic');

  if (quiz.heartDisease) {
    const v = -5 + (quiz.heartDiseaseControlled ? 1.25 : 0);
    add('Heart Disease', '🫀',
      quiz.heartDiseaseControlled ? 'Managed' : 'Unmanaged', 'Managed',
      Math.round(v * 10) / 10, quiz.heartDiseaseControlled ? 0 : 1.25,
      'ESC Guidelines 2023: Regular cardiac monitoring reduces adverse events by 20–30%', 'health');
  }
  if (quiz.diabetes) {
    const v = -4 + (quiz.diabetesControlled ? 1.6 : 0);
    add('Diabetes', '💉',
      quiz.diabetesControlled ? 'Controlled' : 'Uncontrolled', 'Controlled',
      Math.round(v * 10) / 10, quiz.diabetesControlled ? 0 : 1.6,
      'ADA 2023: Well-controlled blood sugar reduces CV complications by 50%', 'health');
  }
  if (quiz.hypertension) {
    const v = -3 + (quiz.hypertensionControlled ? 1.05 : 0);
    add('Hypertension', '🩺',
      quiz.hypertensionControlled ? 'Managed' : 'Unmanaged', 'Managed',
      Math.round(v * 10) / 10, quiz.hypertensionControlled ? 0 : 1.05,
      'AHA/ACC 2023: Treatment reduces stroke risk by 35–40%', 'health');
  }

  factors.sort((a, b) => b.potentialGain - a.potentialGain);

  return {
    baselineLifeExpectancy: base,
    healthAdjustment:       Math.round(health * 10) / 10,
    geneticAdjustment:      Math.round(genetic * 10) / 10,
    epigeneticAdjustment:   Math.round(epigenetic * 10) / 10,
    communityBonus:         Math.round(communityBonus * 10) / 10,
    totalForecast,
    maximumPotential,
    yearsGapToClose:        Math.round((maximumPotential - totalForecast) * 10) / 10,
    currentAge,
    yearsRemaining,
    factorBreakdown:        factors,
    geneticVitalityScore:   score,
    geneticVitalityLabel:   VITALITY_LABELS[score],
    familyBaselineAge:      Math.round(familyBaselineAge * 10) / 10,
    epigeneticHabitsSelected: pillar2.selectedHabits,
    blueZonesCount,
    baselineCitation:       'WHO Global Health Statistics, 2023',
    quizSnapshot:           quiz,
    pillar1Snapshot:        pillar1,
    pillar2Snapshot:        pillar2,
  };
}

export function recalcWithOverrides(
  result: LongevityResult,
  overrides: {
    smoking?: HealthQuizData['smoking'];
    drinking?: HealthQuizData['drinking'];
    diet?: HealthQuizData['diet'];
    exercise?: HealthQuizData['exercise'];
    stress?: number;
    bmi?: number;
    bloodPressure?: HealthQuizData['bloodPressure'];
    sleepDuration?: HealthQuizData['sleepDuration'];
    socialConnections?: HealthQuizData['socialConnections'];
    selectedHabits?: string[];
  }
): number {
  const quiz = { ...result.quizSnapshot, ...overrides };
  const pillar2 = overrides.selectedHabits
    ? { ...result.pillar2Snapshot, selectedHabits: overrides.selectedHabits }
    : result.pillar2Snapshot;
  const r = calculateLongevity(quiz, result.pillar1Snapshot, pillar2);
  return r.totalForecast;
}
