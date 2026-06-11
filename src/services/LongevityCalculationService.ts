// src/services/LongevityCalculationService.ts
// All calculation is client-side only — no health data is transmitted.

export interface FamilyMemberData {
  age: number;              // 0 = not entered
  isLiving: boolean | null; // null = status not yet selected
  dontKnow: boolean;        // explicitly marked as unknown
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
  mentorHabits: string[]; // habits believed to contribute to mentor's longevity
}

export interface HealthQuizData {
  name: string;
  gender: 'male' | 'female' | '';
  country: string;
  smoking: 'never' | 'quit_over5' | 'quit_under5' | 'light' | 'moderate' | 'heavy' | '';
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

export interface SimulatorOverrides {
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
  // Panel 1 extras
  hydration?: 'high' | 'moderate' | 'low' | 'poor';
  screenTime?: 'low' | 'moderate' | 'high' | 'very_high';
  workLifeBalance?: 'excellent' | 'good' | 'fair' | 'poor';
  // Panel 3 extras
  diabetesManagement?: 'none' | 'controlled' | 'uncontrolled';
  healthCheckups?: 'annual' | 'occasional' | 'rarely' | 'never';
  dentalCare?: 'regular' | 'occasional' | 'rarely';
  mentalHealth?: 'active' | 'managing' | 'struggling';
  // Panel 4
  relationship?: 'married' | 'stable' | 'single' | 'divorced';
  petOwnership?: 'yes' | 'no';
  mentoring?: 'active' | 'occasional' | 'none';
  cancerScreening?: 'up_to_date' | 'partial' | 'never';
  airQuality?: 'clean' | 'moderate' | 'polluted';
  commuteStress?: 'none' | 'low' | 'moderate' | 'high';
  epigeneticBonusOverride?: number;
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
  controllablePotential: number;
  yearsGapToClose: number;
  currentAge: number;
  yearsRemaining: number;
  factorBreakdown: FactorImpact[];
  geneticVitalityScore: 'Exceptional' | 'Strong' | 'Average' | 'Below Average';
  geneticVitalityLabel: string;
  familyBaselineAge: number;
  userEpigeneticHabits: string[];
  /** @deprecated use userEpigeneticHabits */
  epigeneticHabitsSelected: string[];
  blueZonesCount: number;
  baselineCitation: string;
  quizSnapshot: HealthQuizData;
  pillar1Snapshot: Pillar1Data;
  pillar2Snapshot: Pillar2Data;
}

// WHO 2023 base life expectancy by country and sex
const BASE_TABLE: Record<string, { male: number; female: number }> = {
  'India':          { male: 68, female: 71 },
  'United States':  { male: 74, female: 80 },
  'United Kingdom': { male: 79, female: 83 },
  'Australia':      { male: 81, female: 85 },
  'Canada':         { male: 79, female: 84 },
  'Germany':        { male: 78, female: 83 },
  'France':         { male: 79, female: 85 },
  'Japan':          { male: 81, female: 87 },
  'China':          { male: 75, female: 79 },
  'Brazil':         { male: 72, female: 79 },
  'South Africa':   { male: 62, female: 68 },
  'Nigeria':        { male: 54, female: 57 },
  'Mexico':         { male: 73, female: 78 },
};
const DEFAULT_BASE = { male: 72, female: 76 };

const BLUE_ZONES_HABIT_IDS = new Set([
  'walking', 'purpose', 'meditation', 'fasting', 'wholefood', 'spiritual', 'community', 'volunteer',
]);

const VITALITY_LABELS: Record<LongevityResult['geneticVitalityScore'], string> = {
  Exceptional:     'Your family tree shows remarkable inherited longevity across multiple generations. This gives you a strong biological foundation — your genetic starting point is already working in your favor.',
  Strong:          'Your family history suggests solid inherited longevity. With supportive lifestyle choices, you have excellent potential to reach or exceed your family baseline.',
  Average:         "Your family longevity history is close to global averages — this is the norm for most people. Remember: research shows 70–75% of your outcome is controlled by lifestyle, not genetics. (Karolinska Institute, 2017)",
  'Below Average': 'Some branches of your family tree show shorter lifespans. However, research shows lifestyle interventions can completely override genetic predispositions in many cases. Your habits matter more than your genes. (NIH Epigenetics Research, 2022)',
};

export const EPIGENETIC_HABITS: {
  id: string; label: string; emoji: string; gain: number; source: string; detail?: string;
}[] = [
  { id: 'walking',    label: 'Daily Walking (30+ min)',                    emoji: '🚶', gain: 1.5, source: 'Blue Zones research: daily walkers live 1.5 years longer on average (Buettner, 2012)' },
  { id: 'community',  label: 'Strong Community Bonds',                      emoji: '👥', gain: 2.0, source: 'Harvard Study of Adult Development (80 years): quality of relationships is the strongest predictor of healthy aging' },
  { id: 'laughter',   label: 'Laughter & Joy Practices',                    emoji: '😂', gain: 0.8, source: 'International Journal of Yoga, 2020: regular laughter therapy reduces cortisol and improves immune function' },
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

export const HABIT_DETAILS: Record<string, string> = {
  walking:    "Walking activates FOXO3 — a longevity gene found in centenarian populations worldwide. A 2023 JAMA Internal Medicine study of 72,000 participants found daily walkers lived 1.5 years longer, independent of other lifestyle factors. Dose matters: 30+ minutes daily maximizes the cardiovascular and metabolic benefits.",
  community:  "The Harvard Study of Adult Development (85 years, 2,000+ participants) found that quality of relationships is the single strongest predictor of healthy aging — stronger than cholesterol levels, income, or IQ. Social isolation has the same mortality risk as smoking 15 cigarettes per day.",
  laughter:   "Laughter Yoga, developed by Dr. Madan Kataria in 1995, is now practiced in 110+ countries. Regular laughter reduces cortisol by 39%, increases NK (natural killer) immune cells by 40%, and improves cardiovascular function. The International Journal of Yoga (2020) documented significant longevity benefits.",
  meditation: "Regular meditation reduces telomere shortening — the biological mechanism of aging. A landmark UCSF study found meditators had measurably longer telomeres than non-meditators. NHS-backed evidence shows meditation reduces chronic stress markers associated with cellular aging.",
  wholefood:  "The PREDIMED Study (New England Journal of Medicine, 2013) followed 7,447 participants and found Mediterranean diet adherents had 30% fewer cardiovascular events. This is one of the largest and most rigorous dietary studies ever conducted.",
  fasting:    "Time-restricted eating triggers autophagy — cellular self-cleaning that removes damaged proteins linked to cancer and neurodegeneration. Cell Metabolism (2019) showed 16:8 intermittent fasting improves metabolic markers, insulin sensitivity, and inflammatory markers within 12 weeks.",
  purpose:    "The Okinawa Blue Zone study found that 'ikigai' (reason for being) is the single most cited factor among centenarians. Purpose activates the hypothalamic-pituitary axis, reducing chronic stress hormones. A 2014 Psychological Science study found strong sense of purpose reduced all-cause mortality by 15%.",
  spiritual:  "A JAMA Internal Medicine meta-analysis of 91 studies (2016) found regular spiritual practice associated with significantly lower mortality across all causes, with effects independent of social connection. Mechanisms include stress reduction, community bonds, and meaning-making.",
  cold:       "Cold exposure triggers the 'cold shock protein' response, activating RBM3 — a neuroprotective protein that rebuilds neural synapses. Wim Hof Method research (Radboud University) showed controlled cold exposure reduces inflammatory markers by 35% and strengthens immune response.",
  gardening:  "A landmark study in Preventive Medicine Reports (2017) found regular gardening reduces dementia risk by 36%. Physical activity + sunlight exposure + stress reduction + microbiome diversity from soil exposure create a compound longevity effect documented across multiple populations.",
  learning:   "Neurology journal research shows continuous learning builds 'cognitive reserve' — extra neural pathways that delay dementia onset by an average of 8.7 years. The brain's neuroplasticity responds to intellectual challenge at any age, with measurable structural changes within weeks.",
  volunteer:  "Health Psychology journal research (2013): regular volunteering reduces mortality risk by 22% — comparable to the protective effect of exercising four times per week. The mechanism is a combination of purpose, social connection, and reduced depression.",
};

const BLANK_MEMBER: FamilyMemberData = { age: 0, isLiving: null, dontKnow: false };

export const DEFAULT_PILLAR1: Pillar1Data = {
  paternalGrandfather: { ...BLANK_MEMBER },
  paternalGrandmother: { ...BLANK_MEMBER },
  father:              { ...BLANK_MEMBER },
  paternalUncles:      { ...BLANK_MEMBER },
  paternalAunts:       { ...BLANK_MEMBER },
  maternalGrandfather: { ...BLANK_MEMBER },
  maternalGrandmother: { ...BLANK_MEMBER },
  mother:              { ...BLANK_MEMBER },
  maternalUncles:      { ...BLANK_MEMBER },
  maternalAunts:       { ...BLANK_MEMBER },
};

export const DEFAULT_PILLAR2: Pillar2Data = {
  hasMentor: false,
  mentorName: '',
  mentorAge: 0,
  mentorRelationship: 'neighbor',
  mentorHabits: [],
};

function getBase(country: string, gender: 'male' | 'female' | ''): number {
  const g = gender === 'female' ? 'female' : 'male';
  return (BASE_TABLE[country] ?? DEFAULT_BASE)[g];
}

function isEntered(m: FamilyMemberData): boolean {
  return !m.dontKnow && m.age > 0 && m.isLiving !== null;
}

function livingAdjustment(age: number): number {
  if (age >= 80) return 7;
  if (age >= 70) return 4;
  if (age >= 60) return 2;
  return 0;
}

function longevityContribution(m: FamilyMemberData): number {
  if (m.isLiving) return m.age + livingAdjustment(m.age);
  return m.age;
}

// Living contribution label shown in UI
export function livingContributionLabel(m: FamilyMemberData): string | null {
  if (!isEntered(m) || !m.isLiving) return null;
  const adj = livingAdjustment(m.age);
  if (adj === 0) return null;
  return `Still living at ${m.age} → contribution: ~${m.age + adj} yrs`;
}

type P1Key = keyof Pillar1Data;

const PAT_MEMBERS: { key: P1Key; weight: number }[] = [
  { key: 'paternalGrandfather', weight: 25 },
  { key: 'paternalGrandmother', weight: 25 },
  { key: 'father',              weight: 30 },
  { key: 'paternalUncles',      weight: 10 },
  { key: 'paternalAunts',       weight: 10 },
];
const MAT_MEMBERS: { key: P1Key; weight: number }[] = [
  { key: 'maternalGrandfather', weight: 25 },
  { key: 'maternalGrandmother', weight: 25 },
  { key: 'mother',              weight: 30 },
  { key: 'maternalUncles',      weight: 10 },
  { key: 'maternalAunts',       weight: 10 },
];

function calcSideAvg(members: { key: P1Key; weight: number }[], p1: Pillar1Data): number | null {
  const entered = members.filter(({ key }) => isEntered(p1[key]));
  if (entered.length === 0) return null;
  const totalWeight = entered.reduce((s, { weight }) => s + weight, 0);
  const weightedSum = entered.reduce((s, { key, weight }) => s + longevityContribution(p1[key]) * weight, 0);
  return weightedSum / totalWeight;
}

function geneticCalc(p1: Pillar1Data): {
  adjustment: number;
  familyBaselineAge: number;
  score: LongevityResult['geneticVitalityScore'];
} {
  const patAvg = calcSideAvg(PAT_MEMBERS, p1);
  const matAvg = calcSideAvg(MAT_MEMBERS, p1);

  if (patAvg === null && matAvg === null) {
    return { adjustment: 0, familyBaselineAge: 78, score: 'Average' };
  }

  const wfa =
    patAvg !== null && matAvg !== null ? patAvg * 0.5 + matAvg * 0.5 :
    patAvg ?? matAvg!;

  const adj = Math.max(-8, Math.min(8, (wfa - 78) * 0.25));

  const score: LongevityResult['geneticVitalityScore'] =
    wfa > 87  ? 'Exceptional' :
    wfa >= 82 ? 'Strong' :
    wfa >= 75 ? 'Average' :
                'Below Average';

  return { adjustment: Math.round(adj * 10) / 10, familyBaselineAge: Math.round(wfa * 10) / 10, score };
}

// Inline preview (no living adjustment — used in calculator step 7 badge only)
export function computeGeneticPreview(p1: Pillar1Data): { wfa: number; score: string } {
  const patAvg = calcSideAvg(PAT_MEMBERS, p1);
  const matAvg = calcSideAvg(MAT_MEMBERS, p1);
  if (patAvg === null && matAvg === null) return { wfa: 78, score: 'Average' };
  const wfa = patAvg !== null && matAvg !== null ? patAvg * 0.5 + matAvg * 0.5 : patAvg ?? matAvg!;
  const score = wfa > 87 ? 'Exceptional' : wfa >= 82 ? 'Strong' : wfa >= 75 ? 'Average' : 'Below Average';
  return { wfa: Math.round(wfa * 10) / 10, score };
}

export function calculateLongevity(
  quiz: HealthQuizData,
  pillar1: Pillar1Data,
  pillar2: Pillar2Data,
  birthDate?: Date | null,
  userHabits: string[] = [],
): LongevityResult {
  const base = getBase(quiz.country, quiz.gender);

  // ── Health adjustment (Steps 1-6) ──
  let health = 0;

  const smokeVal: Record<string, number> = {
    never: 0, quit_over5: -1, quit_under5: -2, light: -3, moderate: -7, heavy: -12, '': 0,
  };
  health += smokeVal[quiz.smoking] ?? 0;

  const drinkVal: Record<string, number> = { none: 0, light: 1, moderate: -1, heavy: -6, '': 0 };
  health += drinkVal[quiz.drinking] ?? 0;

  if (quiz.heartDisease)       { health -= 5; if (quiz.heartDiseaseControlled)  health += 1.25; }
  if (quiz.heartDiseaseFamily) health -= 2;
  if (quiz.diabetes)           { health -= 4; if (quiz.diabetesControlled)       health += 1.6; }
  if (quiz.diabetesFamily)     health -= 1;
  if (quiz.hypertension)       { health -= 3; if (quiz.hypertensionControlled)   health += 1.05; }

  const dietVal: Record<string, number> = { poor: -3, average: 0, good: 2, excellent: 4, '': 0 };
  health += dietVal[quiz.diet] ?? 0;

  const exVal: Record<string, number> = { seldom: -2, light: 1, moderate: 3, heavy: 5, '': 0 };
  health += exVal[quiz.exercise] ?? 0;

  health += quiz.stress >= 8 ? -2.5 : quiz.stress >= 5 ? -0.5 : quiz.stress >= 3 ? 1 : 1.5;

  health += quiz.bmi < 18.5 ? -2 : quiz.bmi > 30 ? -3 : quiz.bmi > 25 ? -1 : 0;

  const bpVal: Record<string, number> = { optimal: 1.5, normal: 0, elevated: -1, high1: -2.5, high2: -5, '': 0 };
  health += bpVal[quiz.bloodPressure] ?? 0;

  const sleepVal: Record<string, number> = { under6: -2, '6to7': -0.5, '7to9': 0, over9: -1, '': 0 };
  health += sleepVal[quiz.sleepDuration] ?? 0;

  const socVal: Record<string, number> = { strong: 2, moderate: 0, limited: -1.5, isolated: -3, '': 0 };
  health += socVal[quiz.socialConnections] ?? 0;

  // ── Pillar 1: Genetics ──
  const { adjustment: genetic, familyBaselineAge, score } = geneticCalc(pillar1);

  // ── Pillar 2 (user habits passed separately) ──
  const habitSum = userHabits.reduce((s, id) => {
    const h = EPIGENETIC_HABITS.find(x => x.id === id);
    return s + (h?.gain ?? 0);
  }, 0);
  const epigenetic = Math.min(6, habitSum);

  // ── Community bonus ──
  const communityBonus = pillar2.hasMentor && pillar2.mentorAge > 85 ? 0.5 : 0;

  const totalForecast = Math.round((base + health + genetic + epigenetic + communityBonus) * 10) / 10;

  // controllablePotential = best health + actual genetics + max epigenetic + community bonus
  const maxHealth = 4 + 5 + 1.5 + 1.5 + 0 + 2;
  const controllablePotential = Math.round((base + maxHealth + genetic + 6 + 0.5) * 10) / 10;
  const maximumPotential = controllablePotential; // backward compat alias

  const now = new Date();
  const currentAge = birthDate instanceof Date
    ? Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000))
    : 35;
  const yearsRemaining = Math.max(0, Math.round((totalForecast - currentAge) * 10) / 10);

  const blueZonesCount = userHabits.filter(id => BLUE_ZONES_HABIT_IDS.has(id)).length;

  // ── Factor breakdown ──
  const factors: FactorImpact[] = [];
  const add = (
    factor: string, emoji: string,
    currentValueLabel: string, optimalValueLabel: string,
    currentImpact: number, potentialGain: number,
    source: string, category: FactorImpact['category'],
  ) => factors.push({ factor, emoji, currentValueLabel, optimalValueLabel, currentImpact, potentialGain, source, category });

  const sv = smokeVal[quiz.smoking] ?? 0;
  add('Tobacco Smoking', '🚬', quiz.smoking || 'Not answered', 'Non-smoker', sv, sv < 0 ? Math.abs(sv) : 0, 'WHO, 2023: Smoking is the leading preventable cause of death worldwide', 'lifestyle');

  const dv = drinkVal[quiz.drinking] ?? 0;
  add('Alcohol Consumption', '🍷', quiz.drinking || 'Not answered', 'None', dv, dv < 0 ? Math.abs(dv) : 0, 'CDC, 2023: No level of alcohol is safe for cancer risk', 'lifestyle');

  const ev = exVal[quiz.exercise] ?? 0;
  add('Physical Exercise', '🏋️', quiz.exercise || 'Not answered', 'Heavy (5+ sessions/week)', ev, Math.max(0, 5 - ev), 'WHO, 2022: Moderate exercise reduces all-cause mortality by 31%', 'lifestyle');

  const dtv = dietVal[quiz.diet] ?? 0;
  add('Diet Quality', '🥗', quiz.diet || 'Not answered', 'Excellent (whole foods)', dtv, Math.max(0, 4 - dtv), 'Harvard School of Public Health: nutrient-dense diet adds 4+ years of healthy life', 'lifestyle');

  const stv = quiz.stress >= 8 ? -2.5 : quiz.stress >= 5 ? -0.5 : quiz.stress >= 3 ? 1 : 1.5;
  add('Stress Level', '🧠', `${quiz.stress}/10`, 'Low (1–2/10)', stv, Math.max(0, 1.5 - stv), 'AHA, 2021: High daily stress increases cardiovascular disease risk by 40%', 'health');

  const bmiv = quiz.bmi < 18.5 ? -2 : quiz.bmi > 30 ? -3 : quiz.bmi > 25 ? -1 : 0;
  add('BMI / Body Weight', '⚖️', `${quiz.bmi}`, '18.5–24.9 (Normal)', bmiv, Math.abs(Math.min(0, bmiv)), 'WHO, 2023: BMI 18.5–24.9 associated with lowest all-cause mortality', 'health');

  const bpv = bpVal[quiz.bloodPressure] ?? 0;
  add('Blood Pressure', '❤️', quiz.bloodPressure || 'Not answered', 'Optimal (<120/80)', bpv, Math.max(0, 1.5 - bpv), 'JNC8/AHA Guidelines, 2023: Optimal BP significantly reduces stroke and heart attack risk', 'health');

  const slv = sleepVal[quiz.sleepDuration] ?? 0;
  add('Sleep Duration', '😴', quiz.sleepDuration || 'Not answered', '7–9 hours (optimal)', slv, Math.max(0, -slv), 'NHS/National Sleep Foundation, 2023: <6 hrs/night has 12% higher all-cause mortality risk', 'health');

  const socv = socVal[quiz.socialConnections] ?? 0;
  add('Social Connections', '👥', quiz.socialConnections || 'Not answered', 'Strong', socv, Math.max(0, 2 - socv), 'Harvard Study of Adult Development: strong relationships comparable to quitting smoking', 'lifestyle');

  add('Family Genetics', '🧬',
    `Family avg: ~${Math.round(familyBaselineAge)} yrs`, 'Family avg >87 yrs',
    Math.round(genetic * 10) / 10, Math.max(0, Math.round((8 - genetic) * 10) / 10),
    'Karolinska Institute, 2017: Genetics account for 25–30% of longevity outcomes', 'genetic');

  add('Epigenetic Habits', '🌱',
    `${userHabits.length} habits active`, 'All 12 habits active',
    Math.round(epigenetic * 10) / 10, Math.max(0, Math.round((6 - epigenetic) * 10) / 10),
    'WHO, 2023: Lifestyle factors account for up to 70% of longevity outcomes', 'epigenetic');

  if (quiz.heartDisease) {
    const v = -5 + (quiz.heartDiseaseControlled ? 1.25 : 0);
    add('Heart Disease', '🫀', quiz.heartDiseaseControlled ? 'Managed' : 'Unmanaged', 'Managed', Math.round(v * 10) / 10, quiz.heartDiseaseControlled ? 0 : 1.25, 'ESC Guidelines 2023: Regular cardiac monitoring reduces adverse events by 20–30%', 'health');
  }
  if (quiz.diabetes) {
    const v = -4 + (quiz.diabetesControlled ? 1.6 : 0);
    add('Diabetes', '💉', quiz.diabetesControlled ? 'Controlled' : 'Uncontrolled', 'Controlled', Math.round(v * 10) / 10, quiz.diabetesControlled ? 0 : 1.6, 'ADA 2023: Well-controlled blood sugar reduces CV complications by 50%', 'health');
  }
  if (quiz.hypertension) {
    const v = -3 + (quiz.hypertensionControlled ? 1.05 : 0);
    add('Hypertension', '🩺', quiz.hypertensionControlled ? 'Managed' : 'Unmanaged', 'Managed', Math.round(v * 10) / 10, quiz.hypertensionControlled ? 0 : 1.05, 'AHA/ACC 2023: Treatment reduces stroke risk by 35–40%', 'health');
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
    controllablePotential,
    yearsGapToClose:        Math.round((controllablePotential - totalForecast) * 10) / 10,
    currentAge,
    yearsRemaining,
    factorBreakdown:        factors,
    geneticVitalityScore:   score,
    geneticVitalityLabel:   VITALITY_LABELS[score],
    familyBaselineAge,
    userEpigeneticHabits:   userHabits,
    epigeneticHabitsSelected: userHabits,
    blueZonesCount,
    baselineCitation:       'WHO Global Health Statistics, 2023',
    quizSnapshot:           quiz,
    pillar1Snapshot:        pillar1,
    pillar2Snapshot:        pillar2,
  };
}

function extraAdjustment(overrides: SimulatorOverrides): number {
  let extra = 0;
  const hyd = ({ high: 0.5, moderate: 0, low: -0.3, poor: -0.8 } as Record<string, number>)[overrides.hydration ?? ''];
  if (hyd !== undefined) extra += hyd;

  const scr = ({ low: 0, moderate: -0.3, high: -0.7, very_high: -1.2 } as Record<string, number>)[overrides.screenTime ?? ''];
  if (scr !== undefined) extra += scr;

  const wlb = ({ excellent: 0.8, good: 0.3, fair: 0, poor: -1.0 } as Record<string, number>)[overrides.workLifeBalance ?? ''];
  if (wlb !== undefined) extra += wlb;

  const dm = ({ none: 0, controlled: -1.5, uncontrolled: -4.0 } as Record<string, number>)[overrides.diabetesManagement ?? ''];
  if (dm !== undefined) extra += dm;

  const hc = ({ annual: 0.8, occasional: 0.3, rarely: -0.5, never: -1.2 } as Record<string, number>)[overrides.healthCheckups ?? ''];
  if (hc !== undefined) extra += hc;

  const dc = ({ regular: 0.4, occasional: 0, rarely: -0.6 } as Record<string, number>)[overrides.dentalCare ?? ''];
  if (dc !== undefined) extra += dc;

  const mh = ({ active: 0.5, managing: 0, struggling: -1.5 } as Record<string, number>)[overrides.mentalHealth ?? ''];
  if (mh !== undefined) extra += mh;

  const rel = ({ married: 1.5, stable: 0.5, single: 0, divorced: -0.8 } as Record<string, number>)[overrides.relationship ?? ''];
  if (rel !== undefined) extra += rel;

  const pet = ({ yes: 0.4, no: 0 } as Record<string, number>)[overrides.petOwnership ?? ''];
  if (pet !== undefined) extra += pet;

  const ment = ({ active: 0.6, occasional: 0.2, none: 0 } as Record<string, number>)[overrides.mentoring ?? ''];
  if (ment !== undefined) extra += ment;

  const cs = ({ up_to_date: 0.5, partial: 0, never: -0.8 } as Record<string, number>)[overrides.cancerScreening ?? ''];
  if (cs !== undefined) extra += cs;

  const aq = ({ clean: 0.3, moderate: 0, polluted: -1.5 } as Record<string, number>)[overrides.airQuality ?? ''];
  if (aq !== undefined) extra += aq;

  const com = ({ none: 0.2, low: 0, moderate: -0.3, high: -0.8 } as Record<string, number>)[overrides.commuteStress ?? ''];
  if (com !== undefined) extra += com;

  return extra;
}

export function recalcWithOverrides(
  result: LongevityResult,
  overrides: SimulatorOverrides,
): number {
  const quiz = { ...result.quizSnapshot, ...overrides };
  const userHabits = overrides.selectedHabits ?? result.userEpigeneticHabits;
  const r = calculateLongevity(quiz, result.pillar1Snapshot, result.pillar2Snapshot, undefined, userHabits);
  const extra = extraAdjustment(overrides);
  if (overrides.epigeneticBonusOverride !== undefined) {
    const epigenDiff = overrides.epigeneticBonusOverride - r.epigeneticAdjustment;
    return Math.round((r.totalForecast + extra + epigenDiff) * 10) / 10;
  }
  return Math.round((r.totalForecast + extra) * 10) / 10;
}
