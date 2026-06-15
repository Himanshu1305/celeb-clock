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
    question: 'What is your typical resting heart rate (cardiovascular fitness proxy)?',
    instruction:
      'Measure after sitting quietly for 5 minutes. Count beats for 60 seconds. Resting heart rate is one of the strongest single predictors of all-cause mortality — lower values reflect better cardiovascular efficiency and autonomic nervous system health.',
    source: 'Filipiak et al., Heart rate as a prognostic marker. Cardiology Journal, 2012.',
    options: [
      {
        id: 'under60',
        label: 'Under 60 bpm — athlete level',
        sublabel: 'Elite cardiovascular efficiency — VO₂ max proxy (estimate of how efficiently your body uses oxygen) is typically very high at this resting rate.',
        adjustment: -3,
      },
      {
        id: 'normal',
        label: '60–75 bpm — healthy range',
        sublabel: 'Optimal cardiovascular efficiency; reflects healthy parasympathetic nervous system (rest-and-digest) dominance.',
        adjustment: 0,
      },
      {
        id: 'elevated',
        label: '76–90 bpm — slightly elevated',
        sublabel: 'Common with elevated cortisol (stress hormone) or low aerobic fitness — worth improving through regular cardio exercise.',
        adjustment: 2,
      },
      {
        id: 'high',
        label: 'Over 90 bpm — high',
        sublabel: 'Associated with increased cardiovascular risk; may reflect elevated allostatic load (cumulative stress burden on the body). Seek medical advice.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'pushups',
    question: 'How many push-ups can you do without stopping? (muscular endurance test)',
    instruction:
      'Use full push-up form: chest to floor, arms fully extended. Muscular endurance (how long your muscles work without fatiguing) declines with age if untrained — this is an early marker of sarcopenia (age-related muscle loss).',
    source:
      'Yang et al., Association between push-up capacity and cardiovascular risk. JAMA Network Open, 2019.',
    options: [
      {
        id: 'excellent',
        label: '30 or more',
        sublabel: 'Strong muscular endurance — protective against sarcopenia (age-related muscle loss) and a marker of healthy upper-body strength reserves.',
        adjustment: -3,
      },
      {
        id: 'good',
        label: '15–29',
        sublabel: 'Good muscular endurance for most ages; sarcopenia (age-related muscle loss) risk is low.',
        adjustment: 0,
      },
      {
        id: 'fair',
        label: '6–14',
        sublabel: 'Below average; early sarcopenia risk (age-related muscle loss) — resistance training is the single most effective intervention.',
        adjustment: 2,
      },
      {
        id: 'poor',
        label: '0–5',
        sublabel: 'Suggests low muscular fitness; elevated sarcopenia risk (age-related muscle loss). Prioritise progressive resistance training.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'balance',
    question: 'How long can you balance on one leg with eyes closed? (proprioceptive control test)',
    instruction:
      'Stand barefoot, arms at your sides. Close eyes. Start timer. Proprioception (your body\'s self-positioning sense) declines markedly with age — this single test predicts fall risk and neurological aging better than most clinic measures.',
    source:
      'Bohannon et al., One-legged balance test performance. Perceptual and Motor Skills, 2006.',
    options: [
      {
        id: 'excellent',
        label: '60+ seconds',
        sublabel: 'Exceptional proprioception (your body\'s self-positioning sense) and neuromuscular control (brain-to-muscle signaling) — reflects youthful cerebellar and vestibular function.',
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
        sublabel: 'Average; consider balance training to maintain proprioception (your body\'s self-positioning sense) and prevent age-related decline.',
        adjustment: 2,
      },
      {
        id: 'poor',
        label: 'Under 10 seconds',
        sublabel: 'Low proprioception (self-positioning sense); linked to fall risk and neurological aging. Balance exercises and medical review recommended.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'stairs',
    question: 'Do you get out of breath climbing a single flight of stairs? (cardiorespiratory fitness proxy)',
    instruction:
      'A single flight is approximately 12–15 steps at a normal walking pace. Breathlessness on a single flight reflects VO₂ max proxy (estimate of how efficiently your body uses oxygen during exercise) — a key predictor of cardiovascular longevity.',
    source:
      'Petersen et al., Stair climbing and all-cause mortality. European Journal of Preventive Cardiology, 2020.',
    options: [
      {
        id: 'never',
        label: 'Never breathless',
        sublabel: 'Indicates strong aerobic capacity — high VO₂ max proxy (estimate of how efficiently your body uses oxygen during exercise). A major longevity marker.',
        adjustment: -3,
      },
      {
        id: 'rarely',
        label: 'Rarely',
        sublabel: 'Within normal cardiorespiratory range for most adults; VO₂ max proxy (oxygen efficiency) is adequate.',
        adjustment: 0,
      },
      {
        id: 'sometimes',
        label: 'Sometimes',
        sublabel: 'Mild cardiorespiratory limitation; aerobic exercise will improve VO₂ max proxy (oxygen efficiency) relatively quickly.',
        adjustment: 2,
      },
      {
        id: 'always',
        label: 'Always breathless',
        sublabel: 'Significant cardiovascular concern — low VO₂ max proxy (oxygen efficiency) is strongly associated with early mortality. Consult a healthcare professional.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'sleep',
    question: 'How do you typically feel when you wake up? (glymphatic function and sleep quality)',
    instruction:
      'Think about your average morning over the past 4 weeks. During deep sleep, your glymphatic system (your brain\'s overnight waste-clearance system) removes metabolic waste including amyloid-beta. Disrupted sleep impairs this process and accelerates epigenetic age (how old your DNA methylation patterns suggest your cells are).',
    source:
      'Walker, M. Why We Sleep. Simon & Schuster, 2017. Also: Czeisler et al., Sleep deficiency. NEJM, 2011.',
    options: [
      {
        id: 'refreshed',
        label: 'Fully refreshed (7–9 hrs quality sleep)',
        sublabel: 'Optimal glymphatic system (brain\'s overnight waste-clearance) function; supports slow epigenetic aging (how old your DNA methylation patterns suggest your cells are).',
        adjustment: -3,
      },
      {
        id: 'okay',
        label: 'Okay — adequate rest',
        sublabel: 'Functional but not fully restorative; glymphatic clearance (brain waste removal) may be partially impaired.',
        adjustment: 0,
      },
      {
        id: 'tired',
        label: 'Somewhat tired',
        sublabel: 'Chronic mild fatigue elevates allostatic load (cumulative stress burden on the body) and accelerates biological aging markers.',
        adjustment: 2,
      },
      {
        id: 'exhausted',
        label: 'Exhausted — chronic poor sleep',
        sublabel: 'Strongly linked to accelerated epigenetic age (how old your DNA methylation patterns suggest your cells are) and 12–25% higher all-cause mortality risk.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'flexibility',
    question: 'Standing and bending forward, how far can you reach? (arterial stiffness proxy)',
    instruction:
      'Stand with feet together, knees straight. Bend forward slowly without bouncing. Research shows flexibility correlates with arterial stiffness (hardening of blood vessels) — stiffer muscles and stiffer arteries tend to age together, making this a remarkable cardiovascular window.',
    source:
      'Yamamoto et al., Arterial stiffness and flexibility. American Journal of Physiology, 2009.',
    options: [
      {
        id: 'palms',
        label: 'Palms flat on the floor',
        sublabel: 'Excellent flexibility — a proxy for low arterial stiffness (hardening of blood vessels); reflects healthy vascular elasticity.',
        adjustment: -3,
      },
      {
        id: 'fingertips',
        label: 'Fingertips touch toes',
        sublabel: 'Good range of motion; healthy vascular flexibility with low arterial stiffness (blood vessel hardening) likely.',
        adjustment: 0,
      },
      {
        id: 'shins',
        label: 'Only reach my shins',
        sublabel: 'Below average; consider stretching routines — may reflect early arterial stiffness (hardening of blood vessels) and reduced vascular elasticity.',
        adjustment: 2,
      },
      {
        id: 'knees',
        label: 'Only reach my knees',
        sublabel: 'Significant stiffness; linked to arterial stiffness (hardening of blood vessels) and accelerated vascular aging. Stretching and aerobic exercise both help.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'memory',
    question: 'How is your memory and mental sharpness? (cognitive aging assessment)',
    instruction:
      'Consider your ability to recall names, tasks, and recent events. Cognitive decline (gradual brain function decrease) is partly driven by epigenetic age (how old your DNA methylation patterns suggest your cells are), elevated allostatic load (cumulative stress burden), and glymphatic dysfunction (impaired overnight brain waste-clearance) — all influenced by lifestyle.',
    source: 'Salthouse, T.A., Cognitive aging. Annual Review of Psychology, 2010.',
    options: [
      {
        id: 'excellent',
        label: 'Excellent — rarely forget things',
        sublabel: 'Sharp recall indicates healthy neural aging — protective against cognitive decline (gradual brain function decrease) and consistent with low epigenetic age (younger DNA methylation patterns).',
        adjustment: -3,
      },
      {
        id: 'good',
        label: 'Good — occasional minor lapses',
        sublabel: 'Normal for adults; maintain with mental exercise, quality sleep, and aerobic fitness to slow cognitive decline (gradual brain function decrease).',
        adjustment: 0,
      },
      {
        id: 'fair',
        label: 'Fair — regularly forget things',
        sublabel: 'Moderate cognitive decline (gradual brain function decrease); worth monitoring and discussing with your doctor.',
        adjustment: 2,
      },
      {
        id: 'poor',
        label: 'Poor — frequent memory struggles',
        sublabel: 'Frequent memory struggles may reflect elevated epigenetic age (older-than-calendar DNA methylation patterns) or early neurodegeneration (nerve cell deterioration). Consult a healthcare professional.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'reaction',
    question: 'How would you rate your psychomotor reaction time (how fast your brain triggers physical response)?',
    instruction:
      'Think about activities like catching a dropped object or responding quickly while driving. Psychomotor reaction time (how fast your brain triggers physical response) peaks in your 20s and slows predictably with age — it reflects the speed of neural signal transmission from brain to muscle.',
    source:
      'Der & Deary, Age and sex differences in reaction time. Psychology and Aging, 2006.',
    options: [
      {
        id: 'fast',
        label: 'Very quick and alert',
        sublabel: 'Fast psychomotor reaction time (brain-to-muscle signaling speed) signals youthful neurological function and intact neural transmission.',
        adjustment: -3,
      },
      {
        id: 'average',
        label: 'Average',
        sublabel: 'Typical psychomotor reaction time (brain-to-muscle signaling speed) for your age group.',
        adjustment: 0,
      },
      {
        id: 'slow',
        label: 'Slower than I would like',
        sublabel: 'Mildly slowed psychomotor reaction time (brain-to-muscle signaling speed); aerobic exercise and quality sleep are the most effective interventions.',
        adjustment: 2,
      },
      {
        id: 'veryslow',
        label: 'Noticeably slow',
        sublabel: 'Significant psychomotor slowing may indicate telomere attrition (gradual shortening of protective chromosome caps with each cell division) and accelerated neurological aging.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'waistHeight',
    question: 'What is your waist-to-height ratio? (central adiposity and visceral fat proxy — waist ÷ height, same units)',
    instruction:
      'Measure waist at the narrowest point. Divide waist circumference by height using the same unit. Waist-to-height ratio is the single strongest metabolic marker for central adiposity (belly fat around your organs) and visceral fat (deep organ fat, not the fat under your skin) — both drive inflammation and insulin resistance independently of overall body weight.',
    source:
      'Browning et al., Waist-to-height ratio and cardiovascular risk. Obesity Reviews, 2010.',
    options: [
      {
        id: 'healthy',
        label: 'Under 0.5 — healthy',
        sublabel: 'Keep your waist to less than half your height — optimal central adiposity (belly fat around your organs) range. Visceral fat (deep organ fat) is minimal.',
        adjustment: -3,
      },
      {
        id: 'moderate',
        label: '0.5–0.6 — moderate risk',
        sublabel: 'Increased central adiposity (belly fat around your organs); elevated metabolic and cardiovascular risk from rising visceral fat (deep organ fat).',
        adjustment: 0,
      },
      {
        id: 'high',
        label: '0.6–0.7 — high risk',
        sublabel: 'High visceral fat (deep organ fat, not the fat under your skin) — strongly linked to type 2 diabetes, heart disease, and accelerated epigenetic aging.',
        adjustment: 2,
      },
      {
        id: 'very_high',
        label: 'Over 0.7 — very high risk',
        sublabel: 'Central adiposity (belly fat around your organs) in the severe range — highest metabolic risk category. Consult a healthcare provider and prioritise visceral fat (deep organ fat) reduction.',
        adjustment: 3,
      },
    ],
  },
  {
    id: 'energy',
    question: 'How would you rate your daily energy level? (allostatic load and metabolic vitality)',
    instruction:
      'Assess your typical energy over the past 4 weeks, not just today. Persistent fatigue can signal elevated allostatic load (cumulative stress burden on the body) and impaired mitochondrial function — the cellular engines that produce your energy.',
    source:
      'Hardy & Bhardwaj, Fatigue as a marker of biological aging. Journal of Aging Research, 2018.',
    options: [
      {
        id: 'high',
        label: 'High and consistent throughout the day',
        sublabel: 'Sustained energy reflects efficient metabolism and low allostatic load (cumulative stress burden on the body) — a hallmark of healthy mitochondrial function.',
        adjustment: -3,
      },
      {
        id: 'good',
        label: 'Good, with mild afternoon dips',
        sublabel: 'Common and manageable; optimise sleep and nutrition to further reduce allostatic load (cumulative stress burden on the body).',
        adjustment: 0,
      },
      {
        id: 'low',
        label: 'Low — often feel fatigued',
        sublabel: 'Chronic fatigue increases allostatic load (cumulative stress burden on the body) and accelerates biological aging — investigate sleep, nutrition, and stress levels.',
        adjustment: 2,
      },
      {
        id: 'verylow',
        label: 'Very low — persistent fatigue',
        sublabel: 'Very low energy may indicate severely elevated allostatic load (cumulative stress burden on the body) or mitochondrial dysfunction — worth investigating with a doctor.',
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
