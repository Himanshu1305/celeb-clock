export type BioCategory =
  | 'cardiovascular'
  | 'musculoskeletal'
  | 'neurological'
  | 'bodycomp'
  | 'metabolic'
  | 'vitality';

export interface BioQuestion {
  id: string;
  biomarkerName: string;
  category: BioCategory;
  question: string;
  instruction?: string;
  source?: string;
  motivationalContext?: string;
  sourceLabel?: string;
  hasCalculator?: boolean;
  calculatorType?: 'bmi' | 'waist';
  options: { id: string; label: string; sublabel?: string; adjustment: number }[];
}

export const BIO_QUESTIONS: BioQuestion[] = [
  // Q1
  {
    id: 'heartRate',
    biomarkerName: 'Resting Heart Rate',
    category: 'cardiovascular',
    question: 'What is your typical resting heart rate (cardiovascular fitness proxy)?',
    instruction:
      'Measure after sitting quietly for 5 minutes. Count beats for 60 seconds. Resting heart rate is one of the strongest single predictors of all-cause mortality — lower values reflect better cardiovascular efficiency and autonomic nervous system health.',
    source: 'Filipiak et al., Heart rate as a prognostic marker. Cardiology Journal, 2012.',
    options: [
      {
        id: 'under60',
        label: 'Under 60 bpm — athlete level',
        sublabel:
          'Elite cardiovascular efficiency — VO₂ max proxy (estimate of how efficiently your body uses oxygen) is typically very high at this resting rate.',
        adjustment: -3,
      },
      {
        id: 'normal',
        label: '60–75 bpm — healthy range',
        sublabel:
          'Optimal cardiovascular efficiency; reflects healthy parasympathetic nervous system (rest-and-digest) dominance.',
        adjustment: 0,
      },
      {
        id: 'elevated',
        label: '76–90 bpm — slightly elevated',
        sublabel:
          'Common with elevated cortisol (stress hormone) or low aerobic fitness — worth improving through regular cardio exercise.',
        adjustment: 2,
      },
      {
        id: 'high',
        label: 'Over 90 bpm — high',
        sublabel:
          'Associated with increased cardiovascular risk; may reflect elevated allostatic load (cumulative stress burden on the body). Seek medical advice.',
        adjustment: 3,
      },
    ],
  },
  // Q2
  {
    id: 'pushups',
    biomarkerName: 'Muscular Endurance',
    category: 'musculoskeletal',
    question: 'How many push-ups can you do without stopping? (muscular endurance test)',
    instruction:
      'Use full push-up form: chest to floor, arms fully extended. Muscular endurance (how long your muscles work without fatiguing) declines with age if untrained — this is an early marker of sarcopenia (age-related muscle loss).',
    source:
      'Yang et al., Association between push-up capacity and cardiovascular risk. JAMA Network Open, 2019.',
    options: [
      {
        id: 'excellent',
        label: '30 or more',
        sublabel:
          'Strong muscular endurance — protective against sarcopenia (age-related muscle loss) and a marker of healthy upper-body strength reserves.',
        adjustment: -3,
      },
      {
        id: 'good',
        label: '15–29',
        sublabel:
          'Good muscular endurance for most ages; sarcopenia (age-related muscle loss) risk is low.',
        adjustment: 0,
      },
      {
        id: 'fair',
        label: '6–14',
        sublabel:
          'Below average; early sarcopenia risk (age-related muscle loss) — resistance training is the single most effective intervention.',
        adjustment: 2,
      },
      {
        id: 'poor',
        label: '0–5',
        sublabel:
          'Suggests low muscular fitness; elevated sarcopenia risk (age-related muscle loss). Prioritise progressive resistance training.',
        adjustment: 3,
      },
    ],
  },
  // Q3
  {
    id: 'balance',
    biomarkerName: 'Single-Leg Balance',
    category: 'neurological',
    question: 'How long can you balance on one leg with eyes closed? (proprioceptive control test)',
    instruction:
      "Stand barefoot, arms at your sides. Close eyes. Start timer. Proprioception (your body's self-positioning sense) declines markedly with age — this single test predicts fall risk and neurological aging better than most clinic measures.",
    source:
      'Bohannon et al., One-legged balance test performance. Perceptual and Motor Skills, 2006.',
    options: [
      {
        id: 'excellent',
        label: '60+ seconds',
        sublabel:
          "Exceptional proprioception (your body's self-positioning sense) and neuromuscular control (brain-to-muscle signaling) — reflects youthful cerebellar and vestibular function.",
        adjustment: -3,
      },
      {
        id: 'good',
        label: '30–59 seconds',
        sublabel: 'Good proprioception (self-positioning sense) and balance for most age groups.',
        adjustment: 0,
      },
      {
        id: 'fair',
        label: '10–29 seconds',
        sublabel:
          "Average; consider balance training to maintain proprioception (your body's self-positioning sense) and prevent age-related decline.",
        adjustment: 2,
      },
      {
        id: 'poor',
        label: 'Under 10 seconds',
        sublabel:
          'Low proprioception (self-positioning sense); linked to fall risk and neurological aging. Balance exercises and medical review recommended.',
        adjustment: 3,
      },
    ],
  },
  // Q4
  {
    id: 'stairs',
    biomarkerName: 'Cardiovascular Fitness',
    category: 'cardiovascular',
    question: 'Do you get out of breath climbing a single flight of stairs? (cardiorespiratory fitness proxy)',
    instruction:
      'A single flight is approximately 12–15 steps at a normal walking pace. Breathlessness on a single flight reflects VO₂ max proxy (estimate of how efficiently your body uses oxygen during exercise) — a key predictor of cardiovascular longevity.',
    source:
      'Petersen et al., Stair climbing and all-cause mortality. European Journal of Preventive Cardiology, 2020.',
    options: [
      {
        id: 'never',
        label: 'Never breathless',
        sublabel:
          'Indicates strong aerobic capacity — high VO₂ max proxy (estimate of how efficiently your body uses oxygen during exercise). A major longevity marker.',
        adjustment: -3,
      },
      {
        id: 'rarely',
        label: 'Rarely',
        sublabel:
          'Within normal cardiorespiratory range for most adults; VO₂ max proxy (oxygen efficiency) is adequate.',
        adjustment: 0,
      },
      {
        id: 'sometimes',
        label: 'Sometimes',
        sublabel:
          'Mild cardiorespiratory limitation; aerobic exercise will improve VO₂ max proxy (oxygen efficiency) relatively quickly.',
        adjustment: 2,
      },
      {
        id: 'always',
        label: 'Always breathless',
        sublabel:
          'Significant cardiovascular concern — low VO₂ max proxy (oxygen efficiency) is strongly associated with early mortality. Consult a healthcare professional.',
        adjustment: 3,
      },
    ],
  },
  // Q5
  {
    id: 'sleep',
    biomarkerName: 'Sleep Quality',
    category: 'neurological',
    question: 'How do you typically feel when you wake up? (glymphatic function and sleep quality)',
    instruction:
      "Think about your average morning over the past 4 weeks. During deep sleep, your glymphatic system (your brain's overnight waste-clearance system) removes metabolic waste including amyloid-beta. Disrupted sleep impairs this process and accelerates epigenetic age (how old your DNA methylation patterns suggest your cells are).",
    source:
      'Walker, M. Why We Sleep. Simon & Schuster, 2017. Also: Czeisler et al., Sleep deficiency. NEJM, 2011.',
    options: [
      {
        id: 'refreshed',
        label: 'Fully refreshed (7–9 hrs quality sleep)',
        sublabel:
          "Optimal glymphatic system (brain's overnight waste-clearance) function; supports slow epigenetic aging (how old your DNA methylation patterns suggest your cells are).",
        adjustment: -3,
      },
      {
        id: 'okay',
        label: 'Okay — adequate rest',
        sublabel:
          'Functional but not fully restorative; glymphatic clearance (brain waste removal) may be partially impaired.',
        adjustment: 0,
      },
      {
        id: 'tired',
        label: 'Somewhat tired',
        sublabel:
          'Chronic mild fatigue elevates allostatic load (cumulative stress burden on the body) and accelerates biological aging markers.',
        adjustment: 2,
      },
      {
        id: 'exhausted',
        label: 'Exhausted — chronic poor sleep',
        sublabel:
          'Strongly linked to accelerated epigenetic age (how old your DNA methylation patterns suggest your cells are) and 12–25% higher all-cause mortality risk.',
        adjustment: 3,
      },
    ],
  },
  // Q6
  {
    id: 'flexibility',
    biomarkerName: 'Flexibility',
    category: 'musculoskeletal',
    question: 'Standing and bending forward, how far can you reach? (arterial stiffness proxy)',
    instruction:
      'Stand with feet together, knees straight. Bend forward slowly without bouncing. Research shows flexibility correlates with arterial stiffness (hardening of blood vessels) — stiffer muscles and stiffer arteries tend to age together, making this a remarkable cardiovascular window.',
    source:
      'Yamamoto et al., Arterial stiffness and flexibility. American Journal of Physiology, 2009.',
    options: [
      {
        id: 'palms',
        label: 'Palms flat on the floor',
        sublabel:
          'Excellent flexibility — a proxy for low arterial stiffness (hardening of blood vessels); reflects healthy vascular elasticity.',
        adjustment: -3,
      },
      {
        id: 'fingertips',
        label: 'Fingertips touch toes',
        sublabel:
          'Good range of motion; healthy vascular flexibility with low arterial stiffness (blood vessel hardening) likely.',
        adjustment: 0,
      },
      {
        id: 'shins',
        label: 'Only reach my shins',
        sublabel:
          'Below average; consider stretching routines — may reflect early arterial stiffness (hardening of blood vessels) and reduced vascular elasticity.',
        adjustment: 2,
      },
      {
        id: 'knees',
        label: 'Only reach my knees',
        sublabel:
          'Significant stiffness; linked to arterial stiffness (hardening of blood vessels) and accelerated vascular aging. Stretching and aerobic exercise both help.',
        adjustment: 3,
      },
    ],
  },
  // Q7
  {
    id: 'memory',
    biomarkerName: 'Working Memory',
    category: 'neurological',
    question: 'How is your memory and mental sharpness? (cognitive aging assessment)',
    instruction:
      'Consider your ability to recall names, tasks, and recent events. Cognitive decline (gradual brain function decrease) is partly driven by epigenetic age (how old your DNA methylation patterns suggest your cells are), elevated allostatic load (cumulative stress burden), and glymphatic dysfunction (impaired overnight brain waste-clearance) — all influenced by lifestyle.',
    source: 'Salthouse, T.A., Cognitive aging. Annual Review of Psychology, 2010.',
    options: [
      {
        id: 'excellent',
        label: 'Excellent — rarely forget things',
        sublabel:
          'Sharp recall indicates healthy neural aging — protective against cognitive decline (gradual brain function decrease) and consistent with low epigenetic age (younger DNA methylation patterns).',
        adjustment: -3,
      },
      {
        id: 'good',
        label: 'Good — occasional minor lapses',
        sublabel:
          'Normal for adults; maintain with mental exercise, quality sleep, and aerobic fitness to slow cognitive decline (gradual brain function decrease).',
        adjustment: 0,
      },
      {
        id: 'fair',
        label: 'Fair — regularly forget things',
        sublabel:
          'Moderate cognitive decline (gradual brain function decrease); worth monitoring and discussing with your doctor.',
        adjustment: 2,
      },
      {
        id: 'poor',
        label: 'Poor — frequent memory struggles',
        sublabel:
          'Frequent memory struggles may reflect elevated epigenetic age (older-than-calendar DNA methylation patterns) or early neurodegeneration (nerve cell deterioration). Consult a healthcare professional.',
        adjustment: 3,
      },
    ],
  },
  // Q8
  {
    id: 'reaction',
    biomarkerName: 'Reaction Time',
    category: 'neurological',
    question:
      'How would you rate your psychomotor reaction time (how fast your brain triggers physical response)?',
    instruction:
      'Think about activities like catching a dropped object or responding quickly while driving. Psychomotor reaction time (how fast your brain triggers physical response) peaks in your 20s and slows predictably with age — it reflects the speed of neural signal transmission from brain to muscle.',
    source: 'Der & Deary, Age and sex differences in reaction time. Psychology and Aging, 2006.',
    options: [
      {
        id: 'fast',
        label: 'Very quick and alert',
        sublabel:
          'Fast psychomotor reaction time (brain-to-muscle signaling speed) signals youthful neurological function and intact neural transmission.',
        adjustment: -3,
      },
      {
        id: 'average',
        label: 'Average',
        sublabel:
          'Typical psychomotor reaction time (brain-to-muscle signaling speed) for your age group.',
        adjustment: 0,
      },
      {
        id: 'slow',
        label: 'Slower than I would like',
        sublabel:
          'Mildly slowed psychomotor reaction time (brain-to-muscle signaling speed); aerobic exercise and quality sleep are the most effective interventions.',
        adjustment: 2,
      },
      {
        id: 'veryslow',
        label: 'Noticeably slow',
        sublabel:
          'Significant psychomotor slowing may indicate telomere attrition (gradual shortening of protective chromosome caps with each cell division) and accelerated neurological aging.',
        adjustment: 3,
      },
    ],
  },
  // Q9 — BMI Calculator
  {
    id: 'bmi',
    biomarkerName: 'Body Mass Index',
    category: 'bodycomp',
    question:
      'Calculate your Body Mass Index (BMI) — a WHO-validated surrogate marker of adiposity (body fat levels):',
    instruction:
      'BMI = weight ÷ height². Use the calculator below. Note: WHO recommends lower BMI thresholds for South Asian populations due to differences in body composition at equivalent BMI values.',
    motivationalContext:
      'BMI is included in virtually every validated biological age model. At population level, it predicts all-cause mortality, cardiovascular disease, and type 2 diabetes risk. It is imperfect — it cannot distinguish muscle from fat — but it remains the most widely used body composition biomarker globally.',
    sourceLabel:
      'WHO Global Health Observatory — BMI Classification; WHO Expert Consultation (2004) — Appropriate BMI for Asian Populations, Lancet 363',
    hasCalculator: true,
    calculatorType: 'bmi',
    options: [
      { id: 'bmi_underweight', label: 'Under 18.5', sublabel: 'Underweight', adjustment: 1.0 },
      {
        id: 'bmi_optimal',
        label: '18.5–22.9',
        sublabel: 'Optimal (Asian threshold)',
        adjustment: -1.5,
      },
      { id: 'bmi_healthy', label: '23.0–24.9', sublabel: 'Healthy, upper range', adjustment: 0 },
      { id: 'bmi_ow_mild', label: '25.0–27.4', sublabel: 'Overweight, mild', adjustment: 0.5 },
      { id: 'bmi_ow', label: '27.5–29.9', sublabel: 'Overweight', adjustment: 1.5 },
      { id: 'bmi_obese1', label: '30.0–34.9', sublabel: 'Obese Class I', adjustment: 3.0 },
      { id: 'bmi_obese2', label: '35+', sublabel: 'Obese Class II+', adjustment: 5.0 },
    ],
  },
  // Q10 — Waist Calculator
  {
    id: 'waist',
    biomarkerName: 'Waist Circumference',
    category: 'bodycomp',
    question:
      'Measure your waist circumference — the most direct accessible marker of central adiposity (belly fat around your organs):',
    instruction:
      'Measure at the narrowest point between your lowest rib and the top of your hip bone — roughly at belly button level. Exhale normally before measuring. Do not hold your breath or pull in your stomach. Use a soft tape measure directly on skin.',
    motivationalContext:
      'Unlike subcutaneous fat (fat under the skin), visceral fat (deep organ fat) actively secretes inflammatory cytokines (chemical messengers that accelerate cellular aging). Waist circumference is a stronger predictor of cardiovascular mortality than BMI alone in most population studies. A 1 cm reduction in waist circumference produces measurable improvements in metabolic biomarkers within weeks.',
    sourceLabel:
      'WHO (2011) Waist Circumference and Waist-Hip Ratio Report; Frontiers in Public Health (2024) — Waist Circumference and Premature Death, n=49,217',
    hasCalculator: true,
    calculatorType: 'waist',
    options: [
      {
        id: 'waist_low',
        label: 'Low risk',
        sublabel: 'Male <94 cm / Female <80 cm',
        adjustment: -1.5,
      },
      {
        id: 'waist_increased',
        label: 'Increased risk',
        sublabel: 'Male 94–101 cm / Female 80–87 cm',
        adjustment: 0.5,
      },
      {
        id: 'waist_high',
        label: 'High risk',
        sublabel: 'Male ≥102 cm / Female ≥88 cm',
        adjustment: 2.5,
      },
    ],
  },
  // Q11 — Blood Pressure
  {
    id: 'bloodPressure',
    biomarkerName: 'Blood Pressure',
    category: 'metabolic',
    question: 'What is your blood pressure — systolic (cardiovascular system load)?',
    instruction:
      'Use a home monitor after sitting quietly for 5 minutes, or use your most recent reading from a clinic or pharmacy. If using a pharmacy monitor, take the average of two readings. Report the systolic (top) number only.',
    motivationalContext:
      'Hypertension (high blood pressure) is called the "silent killer" because it produces zero symptoms while silently damaging blood vessels, kidneys, heart, and brain over years. The WHO estimates 1.28 billion adults globally have hypertension — and 46% are unaware. Controlling blood pressure from age 40–50 is equivalent to approximately 5–7 additional years of healthy life expectancy.',
    sourceLabel:
      'WHO Global Report on Hypertension (2023); AHA/ACC Hypertension Guidelines (2017); Journal of Gerontology Expert Consensus Biomarkers (2025)',
    options: [
      {
        id: 'bp_optimal',
        label: 'Under 120 mmHg',
        sublabel: 'Optimal — textbook perfect',
        adjustment: -2.0,
      },
      {
        id: 'bp_elevated',
        label: '120–129 mmHg',
        sublabel: 'Elevated — monitor closely',
        adjustment: -0.5,
      },
      {
        id: 'bp_stage1',
        label: '130–139 mmHg',
        sublabel: 'Stage 1 hypertension (high blood pressure)',
        adjustment: 1.5,
      },
      {
        id: 'bp_stage2',
        label: '140–159 mmHg',
        sublabel: 'Stage 2 hypertension — medical attention advised',
        adjustment: 3.0,
      },
      {
        id: 'bp_severe',
        label: '160+ mmHg',
        sublabel: 'Severe hypertension — seek medical review',
        adjustment: 5.0,
      },
      {
        id: 'bp_unknown',
        label: "I don't know my blood pressure",
        sublabel: 'This is your reminder to check it',
        adjustment: 0,
      },
    ],
  },
  // Q12 — Energy
  {
    id: 'energy',
    biomarkerName: 'Subjective Vitality',
    category: 'vitality',
    question: 'How would you rate your daily energy level? (allostatic load and metabolic vitality)',
    instruction:
      'Assess your typical energy over the past 4 weeks, not just today. Persistent fatigue can signal elevated allostatic load (cumulative stress burden on the body) and impaired mitochondrial function — the cellular engines that produce your energy.',
    source:
      'Hardy & Bhardwaj, Fatigue as a marker of biological aging. Journal of Aging Research, 2018.',
    options: [
      {
        id: 'high',
        label: 'High and consistent throughout the day',
        sublabel:
          'Sustained energy reflects efficient metabolism and low allostatic load (cumulative stress burden on the body) — a hallmark of healthy mitochondrial function.',
        adjustment: -3,
      },
      {
        id: 'good',
        label: 'Good, with mild afternoon dips',
        sublabel:
          'Common and manageable; optimise sleep and nutrition to further reduce allostatic load (cumulative stress burden on the body).',
        adjustment: 0,
      },
      {
        id: 'low',
        label: 'Low — often feel fatigued',
        sublabel:
          'Chronic fatigue increases allostatic load (cumulative stress burden on the body) and accelerates biological aging — investigate sleep, nutrition, and stress levels.',
        adjustment: 2,
      },
      {
        id: 'verylow',
        label: 'Very low — persistent fatigue',
        sublabel:
          'Very low energy may indicate severely elevated allostatic load (cumulative stress burden on the body) or mitochondrial dysfunction — worth investigating with a doctor.',
        adjustment: 3,
      },
    ],
  },
];

export function calculateBiologicalAge(
  chronologicalAge: number,
  answers: Record<string, string>,
): number {
  let total = 0;
  for (const q of BIO_QUESTIONS) {
    const selectedId = answers[q.id];
    if (selectedId) {
      const option = q.options.find(o => o.id === selectedId);
      if (option) total += option.adjustment;
    }
  }
  const capped = Math.max(-15, Math.min(15, total));
  return Math.max(18, Math.round((chronologicalAge + capped) * 10) / 10);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
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

export function getWHOWaistRisk(
  waistCm: number,
  gender: 'male' | 'female',
): 'low' | 'increased' | 'high' {
  if (gender === 'male') {
    if (waistCm < 94) return 'low';
    if (waistCm < 102) return 'increased';
    return 'high';
  }
  if (waistCm < 80) return 'low';
  if (waistCm < 88) return 'increased';
  return 'high';
}
