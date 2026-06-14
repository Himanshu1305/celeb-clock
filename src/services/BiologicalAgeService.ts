export interface BioQuestion {
  id: string;
  question: string;
  options: { id: string; label: string; adjustment: number }[];
}

export const BIO_QUESTIONS: BioQuestion[] = [
  {
    id: 'heartRate',
    question: 'What is your typical resting heart rate?',
    options: [
      { id: 'under60',  label: 'Under 60 bpm — athlete level',    adjustment: -3 },
      { id: 'normal',   label: '60–75 bpm — healthy range',        adjustment:  0 },
      { id: 'elevated', label: '76–90 bpm — slightly elevated',    adjustment:  2 },
      { id: 'high',     label: 'Over 90 bpm — high',               adjustment:  3 },
    ],
  },
  {
    id: 'pushups',
    question: 'How many push-ups can you do without stopping?',
    options: [
      { id: 'excellent', label: '30 or more',  adjustment: -3 },
      { id: 'good',      label: '15–29',        adjustment:  0 },
      { id: 'fair',      label: '6–14',         adjustment:  2 },
      { id: 'poor',      label: '0–5',          adjustment:  3 },
    ],
  },
  {
    id: 'balance',
    question: 'How long can you balance on one leg with eyes closed?',
    options: [
      { id: 'excellent', label: '60+ seconds',      adjustment: -3 },
      { id: 'good',      label: '30–59 seconds',    adjustment:  0 },
      { id: 'fair',      label: '10–29 seconds',    adjustment:  2 },
      { id: 'poor',      label: 'Under 10 seconds', adjustment:  3 },
    ],
  },
  {
    id: 'stairs',
    question: 'Do you get out of breath climbing a single flight of stairs?',
    options: [
      { id: 'never',     label: 'Never breathless',  adjustment: -3 },
      { id: 'rarely',    label: 'Rarely',             adjustment:  0 },
      { id: 'sometimes', label: 'Sometimes',          adjustment:  2 },
      { id: 'always',    label: 'Always breathless',  adjustment:  3 },
    ],
  },
  {
    id: 'sleep',
    question: 'How do you typically feel when you wake up?',
    options: [
      { id: 'refreshed', label: 'Fully refreshed (7–9 hrs quality sleep)', adjustment: -3 },
      { id: 'okay',      label: 'Okay — adequate rest',                     adjustment:  0 },
      { id: 'tired',     label: 'Somewhat tired',                           adjustment:  2 },
      { id: 'exhausted', label: 'Exhausted — chronic poor sleep',           adjustment:  3 },
    ],
  },
  {
    id: 'flexibility',
    question: 'Standing and bending forward, how far can you reach?',
    options: [
      { id: 'palms',      label: 'Palms flat on the floor', adjustment: -3 },
      { id: 'fingertips', label: 'Fingertips touch toes',   adjustment:  0 },
      { id: 'shins',      label: 'Only reach my shins',     adjustment:  2 },
      { id: 'knees',      label: 'Only reach my knees',     adjustment:  3 },
    ],
  },
  {
    id: 'memory',
    question: 'How is your memory and mental sharpness?',
    options: [
      { id: 'excellent', label: 'Excellent — rarely forget things',   adjustment: -3 },
      { id: 'good',      label: 'Good — occasional minor lapses',     adjustment:  0 },
      { id: 'fair',      label: 'Fair — regularly forget things',     adjustment:  2 },
      { id: 'poor',      label: 'Poor — frequent memory struggles',   adjustment:  3 },
    ],
  },
  {
    id: 'reaction',
    question: 'How would you describe your reaction time and reflexes?',
    options: [
      { id: 'fast',     label: 'Very quick and alert',      adjustment: -3 },
      { id: 'average',  label: 'Average',                   adjustment:  0 },
      { id: 'slow',     label: 'Slower than I would like',  adjustment:  2 },
      { id: 'veryslow', label: 'Noticeably slow',           adjustment:  3 },
    ],
  },
  {
    id: 'waistHeight',
    question: 'What is your waist-to-height ratio? (waist ÷ height, same units)',
    options: [
      { id: 'healthy',   label: 'Under 0.5 — healthy',       adjustment: -3 },
      { id: 'moderate',  label: '0.5–0.6 — moderate risk',   adjustment:  0 },
      { id: 'high',      label: '0.6–0.7 — high risk',       adjustment:  2 },
      { id: 'very_high', label: 'Over 0.7 — very high risk', adjustment:  3 },
    ],
  },
  {
    id: 'energy',
    question: 'How would you rate your daily energy level?',
    options: [
      { id: 'high',    label: 'High and consistent throughout the day', adjustment: -3 },
      { id: 'good',    label: 'Good, with mild afternoon dips',         adjustment:  0 },
      { id: 'low',     label: 'Low — often feel fatigued',              adjustment:  2 },
      { id: 'verylow', label: 'Very low — persistent fatigue',          adjustment:  3 },
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
