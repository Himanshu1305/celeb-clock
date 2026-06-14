export interface BioQuestion {
  id: string;
  question: string;
  instruction?: string;
  source?: string;
  options: { id: string; label: string; sublabel?: string; adjustment: number }[];
}

export const BIO_QUESTIONS: BioQuestion[] = [
  {
    id: 'heartRate',
    question: 'What is your typical resting heart rate?',
    instruction: 'Measure after sitting quietly for 5 minutes. Count beats for 60 seconds.',
    source: 'Filipiak et al., Heart rate as a prognostic marker. Cardiology Journal, 2012.',
    options: [
      { id: 'under60',  label: 'Under 60 bpm — athlete level',    sublabel: 'Elite athletes often reach 40–55 bpm',         adjustment: -3 },
      { id: 'normal',   label: '60–75 bpm — healthy range',        sublabel: 'Optimal cardiovascular efficiency',            adjustment:  0 },
      { id: 'elevated', label: '76–90 bpm — slightly elevated',    sublabel: 'Common with stress or low fitness levels',     adjustment:  2 },
      { id: 'high',     label: 'Over 90 bpm — high',               sublabel: 'Associated with increased cardiovascular risk', adjustment:  3 },
    ],
  },
  {
    id: 'pushups',
    question: 'How many push-ups can you do without stopping?',
    instruction: 'Use full push-up form: chest to floor, arms fully extended.',
    source: 'Yang et al., Association between push-up capacity and cardiovascular risk. JAMA Network Open, 2019.',
    options: [
      { id: 'excellent', label: '30 or more',  sublabel: 'Strong upper body and core resilience', adjustment: -3 },
      { id: 'good',      label: '15–29',        sublabel: 'Good muscular endurance for most ages', adjustment:  0 },
      { id: 'fair',      label: '6–14',         sublabel: 'Below average; room for improvement',  adjustment:  2 },
      { id: 'poor',      label: '0–5',          sublabel: 'Suggests low muscular fitness',        adjustment:  3 },
    ],
  },
  {
    id: 'balance',
    question: 'How long can you balance on one leg with eyes closed?',
    instruction: 'Stand barefoot, arms at your sides. Close eyes. Start timer.',
    source: 'Bohannon et al., One-legged balance test performance. Perceptual and Motor Skills, 2006.',
    options: [
      { id: 'excellent', label: '60+ seconds',      sublabel: 'Exceptional proprioception and neuromuscular control', adjustment: -3 },
      { id: 'good',      label: '30–59 seconds',    sublabel: 'Good balance for most age groups',                   adjustment:  0 },
      { id: 'fair',      label: '10–29 seconds',    sublabel: 'Average; consider balance training',                 adjustment:  2 },
      { id: 'poor',      label: 'Under 10 seconds', sublabel: 'Low; linked to fall risk and neurological aging',   adjustment:  3 },
    ],
  },
  {
    id: 'stairs',
    question: 'Do you get out of breath climbing a single flight of stairs?',
    instruction: 'A single flight is approximately 12–15 steps at a normal walking pace.',
    source: 'Petersen et al., Stair climbing and all-cause mortality. European Journal of Preventive Cardiology, 2020.',
    options: [
      { id: 'never',     label: 'Never breathless',  sublabel: 'Indicates good aerobic capacity',       adjustment: -3 },
      { id: 'rarely',    label: 'Rarely',             sublabel: 'Within normal range for most adults',  adjustment:  0 },
      { id: 'sometimes', label: 'Sometimes',          sublabel: 'Mild cardiorespiratory limitation',    adjustment:  2 },
      { id: 'always',    label: 'Always breathless',  sublabel: 'Significant cardiovascular concern',   adjustment:  3 },
    ],
  },
  {
    id: 'sleep',
    question: 'How do you typically feel when you wake up?',
    instruction: 'Think about your average morning over the past 4 weeks.',
    source: 'Walker, M. Why We Sleep. Simon & Schuster, 2017. Also: Czeisler et al., Sleep deficiency. NEJM, 2011.',
    options: [
      { id: 'refreshed', label: 'Fully refreshed (7–9 hrs quality sleep)', sublabel: 'Optimal sleep duration for most adults',   adjustment: -3 },
      { id: 'okay',      label: 'Okay — adequate rest',                     sublabel: 'Functional but not optimal',              adjustment:  0 },
      { id: 'tired',     label: 'Somewhat tired',                           sublabel: 'Chronic mild fatigue accelerates aging',  adjustment:  2 },
      { id: 'exhausted', label: 'Exhausted — chronic poor sleep',           sublabel: 'Strongly linked to reduced life expectancy', adjustment:  3 },
    ],
  },
  {
    id: 'flexibility',
    question: 'Standing and bending forward, how far can you reach?',
    instruction: 'Stand with feet together, knees straight. Bend forward slowly without bouncing.',
    source: 'Yamamoto et al., Arterial stiffness and flexibility. American Journal of Physiology, 2009.',
    options: [
      { id: 'palms',      label: 'Palms flat on the floor', sublabel: 'Excellent flexibility and vascular health marker', adjustment: -3 },
      { id: 'fingertips', label: 'Fingertips touch toes',   sublabel: 'Good range of motion',                           adjustment:  0 },
      { id: 'shins',      label: 'Only reach my shins',     sublabel: 'Below average; consider stretching routines',    adjustment:  2 },
      { id: 'knees',      label: 'Only reach my knees',     sublabel: 'Significant stiffness; linked to vascular aging', adjustment:  3 },
    ],
  },
  {
    id: 'memory',
    question: 'How is your memory and mental sharpness?',
    instruction: 'Consider your ability to recall names, tasks, and recent events.',
    source: 'Salthouse, T.A., Cognitive aging. Annual Review of Psychology, 2010.',
    options: [
      { id: 'excellent', label: 'Excellent — rarely forget things',   sublabel: 'Sharp recall indicates healthy neural aging', adjustment: -3 },
      { id: 'good',      label: 'Good — occasional minor lapses',     sublabel: 'Normal for adults; maintain with mental exercise', adjustment:  0 },
      { id: 'fair',      label: 'Fair — regularly forget things',     sublabel: 'Moderate cognitive decline; worth monitoring',   adjustment:  2 },
      { id: 'poor',      label: 'Poor — frequent memory struggles',   sublabel: 'Consult a healthcare professional',             adjustment:  3 },
    ],
  },
  {
    id: 'reaction',
    question: 'How would you describe your reaction time and reflexes?',
    instruction: 'Think about activities like catching a dropped object or responding quickly while driving.',
    source: 'Der & Deary, Age and sex differences in reaction time. Psychology and Aging, 2006.',
    options: [
      { id: 'fast',     label: 'Very quick and alert',      sublabel: 'Fast reflexes signal youthful neurological function', adjustment: -3 },
      { id: 'average',  label: 'Average',                   sublabel: 'Typical for your age group',                         adjustment:  0 },
      { id: 'slow',     label: 'Slower than I would like',  sublabel: 'Mild decline; can improve with exercise',            adjustment:  2 },
      { id: 'veryslow', label: 'Noticeably slow',           sublabel: 'Significant slowing associated with accelerated aging', adjustment:  3 },
    ],
  },
  {
    id: 'waistHeight',
    question: 'What is your waist-to-height ratio? (waist ÷ height, same units)',
    instruction: 'Measure waist at the narrowest point. Divide waist circumference by height (same unit).',
    source: 'Browning et al., Waist-to-height ratio and cardiovascular risk. Obesity Reviews, 2010.',
    options: [
      { id: 'healthy',   label: 'Under 0.5 — healthy',       sublabel: 'Keep your waist to less than half your height',   adjustment: -3 },
      { id: 'moderate',  label: '0.5–0.6 — moderate risk',   sublabel: 'Increased metabolic and cardiovascular risk',     adjustment:  0 },
      { id: 'high',      label: '0.6–0.7 — high risk',       sublabel: 'Strongly linked to diabetes and heart disease',   adjustment:  2 },
      { id: 'very_high', label: 'Over 0.7 — very high risk', sublabel: 'Central obesity; consult a healthcare provider',  adjustment:  3 },
    ],
  },
  {
    id: 'energy',
    question: 'How would you rate your daily energy level?',
    instruction: 'Assess your typical energy over the past 4 weeks, not just today.',
    source: 'Hardy & Bhardwaj, Fatigue as a marker of biological aging. Journal of Aging Research, 2018.',
    options: [
      { id: 'high',    label: 'High and consistent throughout the day', sublabel: 'Sustained energy reflects efficient metabolism',    adjustment: -3 },
      { id: 'good',    label: 'Good, with mild afternoon dips',         sublabel: 'Common and manageable; optimise sleep and nutrition', adjustment:  0 },
      { id: 'low',     label: 'Low — often feel fatigued',              sublabel: 'Chronic fatigue linked to accelerated biological aging', adjustment:  2 },
      { id: 'verylow', label: 'Very low — persistent fatigue',          sublabel: 'Significant; worth investigating with a doctor',      adjustment:  3 },
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
