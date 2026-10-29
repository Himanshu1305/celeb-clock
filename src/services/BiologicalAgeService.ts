/**
 * BornClock biological-age ESTIMATE.
 *
 * What this is (and is not): a lifestyle- and fitness-based estimate built from
 * published risk factors. It is NOT a lab test, NOT an epigenetic clock, and it has
 * not been validated against one. The point values per answer are BornClock's own
 * modest heuristic weights; the CUT-OFFS behind them come from the sources cited
 * next to each question (all opened and checked, Oct 2026). Result = calendar age +
 * sum of item points, capped at ±MAX_TOTAL_ADJUSTMENT years and floored at 18.
 *
 * Batch 9 (Oct 2026) changes, see the per-item comments:
 *  - balance: eyes-open test scored against age-group norms (Springer 2007);
 *    the old eyes-closed "<10 s = +3 years" rule penalised most healthy over-50s.
 *  - push-ups: scored against an age/sex benchmark (Mayo Clinic), weight reduced.
 *  - waist: IDF South Asian cut-offs (90 cm men / 80 cm women).
 *  - new: smoking, alcohol and physical-activity items.
 *  - all weights scaled down (max ±1 to ±3 per item, total cap ±10).
 */

export type BioCategory =
  | 'cardiovascular'
  | 'musculoskeletal'
  | 'neurological'
  | 'bodycomp'
  | 'metabolic'
  | 'vitality'
  | 'lifestyle';

export type BioSex = 'male' | 'female';

export interface BioProfile {
  age: number;
  sex: BioSex;
}

export interface BioOption {
  id: string;
  label: string;
  sublabel?: string;
  /** Static points. Omitted for age/sex-relative items (see BioQuestion.score). */
  adjustment?: number;
}

export interface BioQuestion {
  id: string;
  biomarkerName: string;
  category: BioCategory;
  question: string;
  instruction?: string;
  /** Short, verified source line shown under the question. */
  source?: string;
  motivationalContext?: string;
  hasCalculator?: boolean;
  calculatorType?: 'bmi' | 'waist';
  options: BioOption[];
  /** Age/sex-relative scoring; when present it overrides option.adjustment. */
  score?: (optionId: string, profile: BioProfile) => number;
}

/** Total adjustment cap in years (either direction). */
export const MAX_TOTAL_ADJUSTMENT = 10;

// ── Balance: age-relative (Springer et al. 2007) ─────────────────────────────
// Source (opened): Springer BA, Marin R, Cyhan T, Roberts H, Gill NW. Normative values
// for the unipedal stance test with eyes open and closed. J Geriatr Phys Ther
// 2007;30(1):8-15. n=549, 45-second ceiling, no sex difference. Best-of-3 EYES-OPEN
// means (spread): 18-39 44.7 (3.1); 40-49 41.9 (9.9); 50-59 41.2 (10.2);
// 60-69 32.1 (16.2); 70-79 21.5 (17.3); 80-99 9.4 (12.8) seconds.
// (Eyes-closed means are only 15.2 / 12.7 / 8.3 / 4.4 / 3.1 / 1.9 s — which is why
// the old "eyes closed under 10 s = +3 years" rule mis-scored most healthy over-50s.)
// We use eyes OPEN because it is safer to try at home and is the version linked to
// survival: Araujo CG et al., Br J Sports Med 2022;56(17):975-980 (doi
// 10.1136/bjsports-2021-105360) — in 1,702 people aged 51-75, not completing a 10 s
// one-legged stance was linked to higher all-cause mortality (adjusted HR 1.84).
// Table below maps answer buckets to points by placing each bucket against the
// age-group mean ± spread (rounded to whole buckets; for under-60s the ceiling of
// 45 s is the norm, so no bonus is possible there).
export const BALANCE_NORMS_EYES_OPEN = [
  { minAge: 18, maxAge: 39, meanSec: 44.7 },
  { minAge: 40, maxAge: 49, meanSec: 41.9 },
  { minAge: 50, maxAge: 59, meanSec: 41.2 },
  { minAge: 60, maxAge: 69, meanSec: 32.1 },
  { minAge: 70, maxAge: 79, meanSec: 21.5 },
  { minAge: 80, maxAge: 130, meanSec: 9.4 },
] as const;

const BALANCE_POINTS: Record<string, Record<string, number>> = {
  //        full45  30to44  15to29  5to14  under5
  under60: { full45: 0, '30to44': 0, '15to29': 1, '5to14': 2, under5: 2 },
  '60s': { full45: -1, '30to44': 0, '15to29': 0, '5to14': 1, under5: 2 },
  '70s': { full45: -1, '30to44': -1, '15to29': 0, '5to14': 0, under5: 1 },
  '80plus': { full45: -1, '30to44': -1, '15to29': -1, '5to14': 0, under5: 0 },
};

export function balanceAdjustment(optionId: string, age: number): number {
  const band = age < 60 ? 'under60' : age < 70 ? '60s' : age < 80 ? '70s' : '80plus';
  return BALANCE_POINTS[band][optionId] ?? 0;
}

// ── Push-ups: age/sex-relative (Mayo Clinic benchmark) ───────────────────────
// Source (opened): Mayo Clinic, "Muscular strength and endurance: Pushup test"
// (mayoclinic.org/healthy-lifestyle/fitness/in-depth/interval-training/art-20046429).
// "Good fitness" push-up counts: age 25 — women 20, men 28; 35 — 19 / 21;
// 45 — 14 / 16; 55 — 10 / 12; 65 — 10 / 10. The page lets beginners use knee
// push-ups and does not say which version the table uses, so this item is only a
// rough guide and carries a small weight (−1 to +1). Scored conservatively from the
// LOWER end of the answer bucket: at/above benchmark −1, at least half 0, below half +1.
// Background (opened, PubMed): Yang J et al., JAMA Netw Open 2019;2(2):e188341 —
// male firefighters doing >40 push-ups had fewer cardiovascular events than <10.
export const PUSHUP_BENCHMARKS = [
  { maxAge: 29, female: 20, male: 28 },
  { maxAge: 39, female: 19, male: 21 },
  { maxAge: 49, female: 14, male: 16 },
  { maxAge: 59, female: 10, male: 12 },
  { maxAge: 130, female: 10, male: 10 },
] as const;

const PUSHUP_BUCKET_MIN: Record<string, number> = {
  p0to4: 0,
  p5to9: 5,
  p10to14: 10,
  p15to19: 15,
  p20to29: 20,
  p30plus: 30,
};

export function pushupBenchmark(age: number, sex: BioSex): number {
  const row = PUSHUP_BENCHMARKS.find(r => age <= r.maxAge) ?? PUSHUP_BENCHMARKS[PUSHUP_BENCHMARKS.length - 1];
  return row[sex];
}

export function pushupAdjustment(optionId: string, profile: BioProfile): number {
  const min = PUSHUP_BUCKET_MIN[optionId];
  if (min === undefined) return 0;
  const target = pushupBenchmark(profile.age, profile.sex);
  if (min >= target) return -1;
  if (min >= target / 2) return 0;
  return 1;
}

// ── Flexibility: only scored from age 40 ─────────────────────────────────────
// Source (opened, PubMed): Yamamoto K et al. Poor trunk flexibility is associated with
// arterial stiffening. Am J Physiol Heart Circ Physiol 2009;297(4):H1314-8
// (doi 10.1152/ajpheart.00061.2009). Cross-sectional, n=526: poor flexibility went
// with stiffer arteries in middle-aged (40-59) and older (60-83) adults, but there
// was NO difference in 20-39 year olds — so under 40 this item scores 0.
const FLEX_POINTS: Record<string, number> = { palms: -1, fingertips: 0, shins: 1, knees: 1 };
export function flexibilityAdjustment(optionId: string, age: number): number {
  if (age < 40) return 0;
  return FLEX_POINTS[optionId] ?? 0;
}

// ── Questions ────────────────────────────────────────────────────────────────

export const BIO_QUESTIONS: BioQuestion[] = [
  {
    id: 'heartRate',
    biomarkerName: 'Resting Heart Rate',
    category: 'cardiovascular',
    question: 'What is your usual resting heart rate?',
    instruction:
      'Sit quietly for 5 minutes, then count your pulse for 60 seconds (or use a watch or BP monitor). A lower resting heart rate usually goes with better fitness.',
    // Opened (PubMed): Jensen MT et al. Heart 2013;99(12):882-7, doi 10.1136/heartjnl-2012-303375.
    // Copenhagen Male Study, 2,798 men, 16 years: risk of death rose ~16% per 10 bpm;
    // >90 bpm vs ≤50 bpm HR 3.06, independent of fitness.
    source: 'Jensen et al., Heart 2013 — Copenhagen Male Study (2,798 men, 16 years)',
    options: [
      { id: 'under60', label: 'Under 60 bpm', sublabel: 'Often seen in people who exercise regularly.', adjustment: -1 },
      { id: 'normal', label: '60–75 bpm', sublabel: 'A common, healthy range.', adjustment: 0 },
      { id: 'elevated', label: '76–90 bpm', sublabel: 'Regular aerobic exercise usually brings this down.', adjustment: 1 },
      { id: 'high', label: 'Over 90 bpm', sublabel: 'Worth mentioning to your doctor at your next check-up.', adjustment: 2 },
    ],
  },
  {
    id: 'pushups',
    biomarkerName: 'Push-ups (muscular endurance)',
    category: 'musculoskeletal',
    question: 'How many push-ups can you do in a row, with good form?',
    instruction:
      'Count full push-ups (knee push-ups are fine if that is what you can do). Stop when your form breaks. Skip this if you have shoulder, wrist or heart problems — pick the lowest option. This item is compared with a benchmark for your age and sex and only counts a little.',
    source: 'Mayo Clinic push-up benchmarks by age and sex — rough guide only',
    options: [
      { id: 'p0to4', label: '0–4' },
      { id: 'p5to9', label: '5–9' },
      { id: 'p10to14', label: '10–14' },
      { id: 'p15to19', label: '15–19' },
      { id: 'p20to29', label: '20–29' },
      { id: 'p30plus', label: '30 or more' },
    ],
    score: (id, p) => pushupAdjustment(id, p),
  },
  {
    id: 'balance',
    biomarkerName: 'One-leg balance (eyes open)',
    category: 'neurological',
    question: 'How long can you stand on one leg with your eyes OPEN?',
    instruction:
      'Stand next to a wall or sturdy chair for safety. Cross your arms, lift one foot and time yourself — stop at 45 seconds. Take your best of 3 tries. Your time is compared with the average for your age group, because balance naturally changes with age.',
    source: 'Springer et al., J Geriatr Phys Ther 2007 — age-group norms (549 adults)',
    options: [
      { id: 'full45', label: 'The full 45 seconds' },
      { id: '30to44', label: '30–44 seconds' },
      { id: '15to29', label: '15–29 seconds' },
      { id: '5to14', label: '5–14 seconds' },
      { id: 'under5', label: 'Under 5 seconds' },
    ],
    score: (id, p) => balanceAdjustment(id, p.age),
  },
  {
    id: 'stairs',
    biomarkerName: 'Stair climbing (self-reported fitness)',
    category: 'cardiovascular',
    question: 'Do you get out of breath climbing one flight of stairs at a normal pace?',
    instruction: 'One flight is about 12–15 steps. This is a simple self-check of everyday fitness, not a lab test.',
    options: [
      { id: 'never', label: 'Never breathless', adjustment: -1 },
      { id: 'rarely', label: 'Rarely', adjustment: 0 },
      { id: 'sometimes', label: 'Sometimes', adjustment: 1 },
      { id: 'always', label: 'Always breathless', sublabel: 'If this is new or getting worse, please see a doctor.', adjustment: 2 },
    ],
  },
  {
    id: 'sleep',
    biomarkerName: 'Sleep',
    category: 'neurological',
    question: 'How do you usually feel when you wake up?',
    instruction: 'Think about a typical morning over the past 4 weeks.',
    // Opened (PubMed): Cappuccio FP et al. Sleep 2010;33(5):585-92, doi 10.1093/sleep/33.5.585 —
    // meta-analysis, 1.38 million people: short sleep RR 1.12 and long sleep RR 1.30 for death.
    source: 'Cappuccio et al., Sleep 2010 — sleep duration meta-analysis (1.38 million people)',
    options: [
      { id: 'refreshed', label: 'Refreshed (about 7–9 hours of good sleep)', adjustment: -1 },
      { id: 'okay', label: 'Okay — adequate rest', adjustment: 0 },
      { id: 'tired', label: 'Somewhat tired', adjustment: 1 },
      { id: 'exhausted', label: 'Exhausted — poor sleep most nights', adjustment: 2 },
    ],
  },
  {
    id: 'flexibility',
    biomarkerName: 'Flexibility',
    category: 'musculoskeletal',
    question: 'Standing with straight knees and bending forward slowly, how far can you reach?',
    instruction:
      'Do not bounce or force it. In one study, less flexible middle-aged and older adults tended to have stiffer arteries; no link was seen under 40, so this item only counts from age 40.',
    source: 'Yamamoto et al., Am J Physiol Heart Circ Physiol 2009 (526 adults)',
    options: [
      { id: 'palms', label: 'Palms flat on the floor' },
      { id: 'fingertips', label: 'Fingertips touch my toes' },
      { id: 'shins', label: 'Only my shins' },
      { id: 'knees', label: 'Only my knees' },
    ],
    score: (id, p) => flexibilityAdjustment(id, p.age),
  },
  {
    id: 'memory',
    biomarkerName: 'Memory (self-reported)',
    category: 'neurological',
    question: 'How is your memory and mental sharpness day to day?',
    instruction: 'Think about remembering names, tasks and recent events.',
    options: [
      { id: 'excellent', label: 'Excellent — I rarely forget things', adjustment: -1 },
      { id: 'good', label: 'Good — occasional small lapses', adjustment: 0 },
      { id: 'fair', label: 'Fair — I regularly forget things', adjustment: 1 },
      { id: 'poor', label: 'Poor — frequent memory struggles', sublabel: 'If this worries you, a doctor can help check the cause.', adjustment: 1 },
    ],
  },
  {
    id: 'reaction',
    biomarkerName: 'Reaction speed (self-reported)',
    category: 'neurological',
    question: 'How quick are your reactions — for example catching a dropped object?',
    instruction: 'Reaction time gets slower gradually through adult life.',
    // Opened (PubMed match): Der G, Deary IJ. Psychol Aging 2006;21(1):62-73 — age and sex
    // differences in reaction time (UK Health and Lifestyle Survey).
    source: 'Der & Deary, Psychology and Aging 2006',
    options: [
      { id: 'fast', label: 'Very quick and alert', adjustment: -1 },
      { id: 'average', label: 'Average', adjustment: 0 },
      { id: 'slow', label: 'Slower than I would like', adjustment: 1 },
      { id: 'veryslow', label: 'Noticeably slow', adjustment: 1 },
    ],
  },
  {
    id: 'bmi',
    biomarkerName: 'Body Mass Index (BMI)',
    category: 'bodycomp',
    question: 'Work out your Body Mass Index (BMI):',
    instruction:
      'BMI = weight (kg) ÷ height (m)². We use the lower "public health action points" suggested for Asian populations (23 and 27.5), as many Indians face higher risk at a lower BMI. BMI cannot tell muscle from fat, so treat it as a rough guide.',
    // Opened (PubMed): WHO Expert Consultation. Lancet 2004;363(9403):157-63,
    // doi 10.1016/S0140-6736(03)15268-3 — action points 23.0, 27.5, 32.5, 37.5 kg/m².
    source: 'WHO Expert Consultation, Lancet 2004 — BMI for Asian populations',
    hasCalculator: true,
    calculatorType: 'bmi',
    options: [
      { id: 'bmi_underweight', label: 'Under 18.5', sublabel: 'Underweight', adjustment: 1 },
      { id: 'bmi_optimal', label: '18.5–22.9', sublabel: 'Healthy (Asian cut-off)', adjustment: -1 },
      { id: 'bmi_healthy', label: '23.0–24.9', sublabel: 'Increased risk for Asians', adjustment: 0 },
      { id: 'bmi_ow_mild', label: '25.0–27.4', sublabel: 'Overweight', adjustment: 0.5 },
      { id: 'bmi_ow', label: '27.5–29.9', sublabel: 'High risk for Asians', adjustment: 1 },
      { id: 'bmi_obese1', label: '30.0–34.9', sublabel: 'Obesity class I', adjustment: 2 },
      { id: 'bmi_obese2', label: '35+', sublabel: 'Obesity class II+', adjustment: 3 },
    ],
  },
  {
    id: 'waist',
    biomarkerName: 'Waist size',
    category: 'bodycomp',
    question: 'Measure your waist:',
    instruction:
      'Measure halfway between your lowest rib and the top of your hip bone (about belly-button level), after breathing out normally. Use a soft tape on bare skin.',
    // Opened: Zimmet PZ, Shaw JE, Alberti KGMM. Mainstreaming the metabolic syndrome: a
    // definitive definition. Med J Aust 2005;183(4):175-176 (IDF 2005 definition):
    // "South Asian and South-East Asian men ≥ 90 cm, women ≥ 80 cm" (Europid 94 / 80).
    source: 'IDF 2005 definition (Zimmet et al., Med J Aust 2005) — South Asian cut-offs',
    hasCalculator: true,
    calculatorType: 'waist',
    options: [
      { id: 'waist_low', label: 'Below the cut-off', sublabel: 'Men under 90 cm · Women under 80 cm', adjustment: -1 },
      { id: 'waist_high', label: 'At or above the cut-off', sublabel: 'Men 90 cm or more · Women 80 cm or more', adjustment: 1.5 },
    ],
  },
  {
    id: 'bloodPressure',
    biomarkerName: 'Blood pressure (top number)',
    category: 'metabolic',
    question: 'What is your usual blood pressure — the top (systolic) number?',
    instruction:
      'Use a recent reading from a clinic, pharmacy or home monitor, taken after sitting quietly for 5 minutes. If you do not know it, choose the last option — a quick check at a pharmacy is easy.',
    // Opened (PubMed match): Whelton PK et al. 2017 ACC/AHA high blood pressure guideline,
    // Hypertension 2018;71(6):e13-e115 — systolic <120 normal, 120-129 elevated,
    // 130-139 stage 1, ≥140 stage 2.
    source: '2017 ACC/AHA blood pressure guideline (Whelton et al., Hypertension 2018)',
    options: [
      { id: 'bp_optimal', label: 'Under 120 mmHg', sublabel: 'Normal', adjustment: -1 },
      { id: 'bp_elevated', label: '120–129 mmHg', sublabel: 'Elevated', adjustment: 0 },
      { id: 'bp_stage1', label: '130–139 mmHg', sublabel: 'Stage 1 high blood pressure', adjustment: 1 },
      { id: 'bp_stage2', label: '140–159 mmHg', sublabel: 'Stage 2 — please discuss with a doctor', adjustment: 2 },
      { id: 'bp_severe', label: '160 mmHg or more', sublabel: 'Please see a doctor soon', adjustment: 3 },
      { id: 'bp_unknown', label: "I don't know", sublabel: 'Counts as neutral — worth checking', adjustment: 0 },
    ],
  },
  {
    id: 'energy',
    biomarkerName: 'Daily energy (self-reported)',
    category: 'vitality',
    question: 'How is your energy on a typical day?',
    instruction: 'Think about the past 4 weeks, not just today.',
    options: [
      { id: 'high', label: 'High and steady through the day', adjustment: -1 },
      { id: 'good', label: 'Good, with mild afternoon dips', adjustment: 0 },
      { id: 'low', label: 'Low — often tired', adjustment: 1 },
      { id: 'verylow', label: 'Very low — tired most of the time', sublabel: 'Long-lasting tiredness is worth checking with a doctor.', adjustment: 1 },
    ],
  },
  {
    id: 'smoking',
    biomarkerName: 'Smoking',
    category: 'lifestyle',
    question: 'Do you smoke (cigarettes, bidis or other tobacco you smoke)?',
    instruction: 'Quitting helps at every age — the earlier, the bigger the gain.',
    // Opened (PubMed): Doll R, Peto R et al. BMJ 2004;328:1519, doi 10.1136/bmj.38142.554479.AE —
    // continuing cigarette smokers died ~10 years younger; quitting at 60/50/40/30 gained
    // ~3/6/9/10 years. Jha P et al. NEJM 2013;368:341-50, doi 10.1056/NEJMsa1211128 —
    // >10 years of life expectancy lost; quitting before 40 cut the excess risk ~90%.
    // Our points (+3 / +1) are deliberately far smaller than those life-expectancy gaps.
    // Quitline number opened: who.int/india/news/item/08-10-2021-tobacco-kills-dial-1800-11-2356-to-quit!
    // ("national toll-free National Quitline ... set-up by the Government of India").
    source: 'Doll et al., BMJ 2004 (50-year doctors study); Jha et al., NEJM 2013',
    options: [
      { id: 'never', label: 'Never smoked', adjustment: 0 },
      { id: 'quit10plus', label: 'Quit 10 or more years ago', adjustment: 0 },
      { id: 'quitRecent', label: 'Quit less than 10 years ago', adjustment: 1 },
      { id: 'current', label: 'I smoke now', sublabel: 'Free help: India’s National Tobacco Quitline 1800-11-2356', adjustment: 3 },
    ],
  },
  {
    id: 'alcohol',
    biomarkerName: 'Alcohol',
    category: 'lifestyle',
    question: 'How much alcohol do you drink in a typical week?',
    instruction:
      '100 g of alcohol is about 10 small (30 ml) pegs of 42.8% spirits, or about 4 bottles (650 ml) of 5% beer.',
    // Opened (PubMed): Wood AM et al. Lancet 2018;391:1513-23, doi 10.1016/S0140-6736(18)30134-X —
    // 599,912 current drinkers, 83 studies: lowest death risk at ≤100 g/week; vs >0-100 g,
    // drinking >100-200, >200-350 and >350 g/week meant ~6 months, 1-2 years and 4-5 years
    // lower life expectancy at age 40. Conversions computed (ethanol 0.789 g/ml):
    // 30 ml × 42.8% × 0.789 ≈ 10.1 g per peg; 650 ml × 5% × 0.789 ≈ 25.6 g per bottle.
    // Non-drinkers score 0 — this is not a reason to start drinking.
    source: 'Wood et al., Lancet 2018 (599,912 drinkers, 83 studies)',
    options: [
      { id: 'none', label: 'None', adjustment: 0 },
      { id: 'upTo100', label: 'Up to 100 g a week', sublabel: 'Up to ~10 small pegs or ~4 beer bottles', adjustment: 0 },
      { id: '100to200', label: '100–200 g a week', sublabel: '~10–20 small pegs or ~4–8 beer bottles', adjustment: 0.5 },
      { id: '200to350', label: '200–350 g a week', sublabel: '~20–35 small pegs or ~8–14 beer bottles', adjustment: 1.5 },
      { id: 'over350', label: 'More than 350 g a week', sublabel: 'More than ~35 small pegs or ~14 beer bottles', adjustment: 3 },
    ],
  },
  {
    id: 'activity',
    biomarkerName: 'Physical activity',
    category: 'lifestyle',
    question: 'On average, how much moderate exercise do you get (brisk walking, cycling, yoga, sport)?',
    instruction: 'Count activity that makes you breathe a little harder — on most days.',
    // Opened (PubMed): Wen CP et al. Lancet 2011;378:1244-53, doi 10.1016/S0140-6736(11)60749-6 —
    // 416,175 adults in Taiwan: ~15 min/day (92 min/week) vs inactive = 14% lower death risk
    // and ~3 years longer life expectancy; each extra 15 min/day a further 4% lower.
    source: 'Wen et al., Lancet 2011 (416,175 adults, Taiwan)',
    options: [
      { id: 'under15', label: 'Less than 15 minutes a day', adjustment: 1 },
      { id: '15to29', label: '15–29 minutes a day', adjustment: 0 },
      { id: '30plus', label: '30 minutes a day or more', adjustment: -1 },
    ],
  },
];

/** Points for one answer, taking age/sex-relative items into account. */
export function getAdjustment(q: BioQuestion, optionId: string | undefined, profile: BioProfile): number {
  if (!optionId) return 0;
  if (q.score) return q.score(optionId, profile);
  return q.options.find(o => o.id === optionId)?.adjustment ?? 0;
}

/** Lowest (best) possible points for a question for this person. */
export function bestAdjustment(q: BioQuestion, profile: BioProfile): number {
  return Math.min(...q.options.map(o => getAdjustment(q, o.id, profile)));
}

export function calculateBiologicalAge(
  chronologicalAge: number,
  answers: Record<string, string>,
  sex: BioSex = 'male',
): number {
  const profile: BioProfile = { age: chronologicalAge, sex };
  let total = 0;
  for (const q of BIO_QUESTIONS) total += getAdjustment(q, answers[q.id], profile);
  const capped = Math.max(-MAX_TOTAL_ADJUSTMENT, Math.min(MAX_TOTAL_ADJUSTMENT, total));
  return Math.max(18, Math.round((chronologicalAge + capped) * 10) / 10);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Maps a BMI value to the BMI question's option id. */
export function bmiOptionId(bmi: number): string {
  if (bmi < 18.5) return 'bmi_underweight';
  if (bmi < 23.0) return 'bmi_optimal';
  if (bmi < 25.0) return 'bmi_healthy';
  if (bmi < 27.5) return 'bmi_ow_mild';
  if (bmi < 30.0) return 'bmi_ow';
  if (bmi < 35.0) return 'bmi_obese1';
  return 'bmi_obese2';
}

export function getWHOBMICategory(bmi: number, isAsian: boolean = true): string {
  if (isAsian) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 23.0) return 'Optimal';
    if (bmi < 27.5) return 'Overweight';
    return 'Obese';
  }
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25.0) return 'Healthy weight';
  if (bmi < 30.0) return 'Overweight';
  return 'Obese';
}

/** IDF 2005 South Asian waist cut-off (cm): men 90, women 80. */
export function waistCutoffCm(sex: BioSex): number {
  return sex === 'male' ? 90 : 80;
}

/** 'low' = below the IDF South Asian cut-off; 'high' = at or above it. */
export function getWaistRisk(waistCm: number, sex: BioSex): 'low' | 'high' {
  return waistCm < waistCutoffCm(sex) ? 'low' : 'high';
}

export function waistOptionId(waistCm: number, sex: BioSex): string {
  return getWaistRisk(waistCm, sex) === 'low' ? 'waist_low' : 'waist_high';
}
