import type { HealthQuizData, FactorImpact } from '@/services/LongevityCalculationService';

export interface ActionPlanPhase {
  period: string;
  title: string;
  items: string[];
}

/**
 * Single source of truth for the 90-day action plan content.
 * Both the web component and PDF use this function.
 * Change here = changes everywhere. Impossible to diverge.
 */
export function buildActionPlanPhases(
  quiz: HealthQuizData | null | undefined,
  factors: FactorImpact[]
): ActionPlanPhase[] {
  const topFactor = [...factors]
    .filter(f => f.potentialGain > 0)
    .sort((a, b) => b.potentialGain - a.potentialGain)[0];
  const topFactorName = topFactor?.factor?.toLowerCase() || '';

  const hasPoorSleep = quiz?.sleepDuration === 'under6' || quiz?.sleepDuration === '6to7';
  const hasPoorDiet = quiz?.diet === 'poor' || quiz?.diet === 'average';
  const isSmoker = (['light', 'moderate', 'heavy', 'quit_under5'] as string[]).includes(quiz?.smoking || '');
  const isHighStress = Number(quiz?.stress || 0) >= 6;
  const isHighBMI = Number(quiz?.bmi || 0) > 25;
  const isLowExercise = quiz?.exercise === 'seldom' || quiz?.exercise === 'light';
  const isLowSocial = quiz?.socialConnections === 'limited' || quiz?.socialConnections === 'isolated';
  const hasHighBP = quiz?.bloodPressure === 'high1' || quiz?.bloodPressure === 'high2';
  const hasConditions = !!(quiz?.heartDisease || quiz?.diabetes || quiz?.hypertension);
  const conditionParts: string[] = [];
  if (quiz?.heartDisease) conditionParts.push('heart disease');
  if (quiz?.diabetes) conditionParts.push('diabetes');
  if (quiz?.hypertension) conditionParts.push('hypertension');
  const conditionList = conditionParts.join(', ');

  return [
    {
      period: 'Weeks 1–2',
      title: '🚀 Foundation — Start Here',
      items: [
        hasHighBP
          ? `🩺 Blood pressure is your highest-impact factor (+6.5 yrs potential). Book a GP appointment this week. Reduce sodium under 2,000mg/day — avoid processed foods, pickles, and restaurant food.`
          : isHighBMI
          ? `⚖️ BMI ${quiz?.bmi ? Number(quiz.bmi).toFixed(1) : ''} is significantly above optimal. Replace one processed meal daily with home-cooked food. Create a 300-500 calorie daily deficit — do not skip meals.`
          : topFactorName.includes('exercise') || topFactorName.includes('physical') || isLowExercise
          ? `🏃 Exercise is your highest-impact factor. Begin 20-minute daily walks immediately — same time each day. Build to 30 minutes by end of Week 2. No gym needed.`
          : topFactorName.includes('genetic') || topFactorName.includes('family')
          ? `🧬 Family health history is your highest risk area. Book a comprehensive health check this week: HbA1c, fasting glucose, lipid panel, blood pressure, ECG if over 40.`
          : `🎯 Begin 30-minute daily morning walks. This single change simultaneously improves cardiovascular health, metabolism, mood, and sleep quality.`,

        hasPoorDiet
          ? `🥗 Diet starts today: remove ultra-processed foods from home (chips, biscuits, packaged juices, instant noodles). Replace one meal daily with home-cooked food. Add vegetables to lunch and dinner.`
          : `🥗 Add one serving of legumes daily — dal, rajma, chana, or moong. Legumes are the single most consistent longevity food across all Blue Zones populations worldwide.`,

        `💧 Hydration target: 2.5-3 litres of water daily. Set four phone reminders (9am, 12pm, 3pm, 6pm). Replace one chai or coffee daily with water or green tea.`,

        ...(isSmoker ? [
          `🚬 Smoking is significantly reducing your forecast. Set a firm quit date within the next 7 days. Speak to your doctor about cessation support — nicotine replacement therapy or varenicline doubles quit success rates.`,
        ] : []),
      ].filter(Boolean) as string[],
    },

    {
      period: 'Weeks 3–4',
      title: '💪 Build — Layer New Habits',
      items: [
        hasPoorSleep
          ? `😴 Sleep is costing you years. Set a non-negotiable bedtime 7.5 hours before your alarm. No screens 30 min before bed. Cool bedroom (18-20°C). This single change is worth up to 2 additional years.`
          : `😴 Protect your sleep quality. Maintain the same wake time every day including weekends — this is the most effective sleep intervention even when duration is adequate.`,

        isLowExercise
          ? `🏃 Week 3: increase to 30-minute walks daily. Add 2 bodyweight sessions: 10 squats, 10 pushups, 10 lunges. Muscle mass independently predicts longevity at every age.`
          : `🏃 Add resistance training 2 days this week. Bodyweight squats, pushups, and lunges. Muscle mass is a direct longevity predictor — cardio alone is insufficient for optimal ageing.`,

        hasPoorDiet
          ? `🥗 Diet Week 3-4: replace refined grains with whole grains — brown rice, whole wheat roti, oats for breakfast. Eat vegetables at every meal. Reduce added sugar to under 25g/day.`
          : `🥗 Add omega-3 rich foods: fatty fish 2×/week (salmon, mackerel, sardines) or 1 tablespoon ground flaxseed daily. Omega-3s reduce cardiovascular mortality by 8-12%.`,

        ...(isHighBMI ? [
          `⚖️ Track your food intake for 7 days using a free app (MyFitnessPal or HealthifyMe). Awareness alone reduces intake by 10-15% in most people without any other change.`,
        ] : []),
      ].filter(Boolean) as string[],
    },

    {
      period: 'Month 2',
      title: '🧘 Deepen — Mind & Metabolic Health',
      items: [
        isHighStress
          ? `🧘 Your stress level (${quiz?.stress}/10) is accelerating epigenetic ageing via cortisol elevation. Begin 10-minute daily mindfulness — Headspace, Calm, or simply sit quietly and focus on breathing. Even 8 weeks measurably alters stress biomarkers.`
          : `🧘 Add 10-minute daily mindfulness or breathing practice. Research (NIH, 2021) shows even low-stress individuals benefit — it directly reverses epigenetic clock advancement.`,

        isLowSocial
          ? `🤝 Limited social connection is reducing your forecast significantly. Commit to one weekly recurring social activity this month — a fitness class, community group, or regular meal with a close friend.`
          : `🤝 Deepen 1-2 key relationships this month. The Harvard Study found depth, not breadth, of relationships predicts healthy ageing. Schedule one meaningful conversation weekly.`,

        `🥗 Add fermented foods for gut microbiome health: yoghurt, idli, dosa, or fermented vegetables. Microbiome diversity is directly linked to immune function and longevity.`,

        `🩺 Schedule a blood test this month: fasting glucose, HbA1c, full lipid panel (LDL/HDL/triglycerides), Vitamin D, and blood pressure. These are your core longevity biomarkers — know your numbers.`,

        ...(isSmoker ? [
          `🚬 Month 2 smoking check: if still smoking, contact a cessation clinic. Nicotine cravings peak at 3 days and reduce significantly after 3 weeks. You are past the hardest part.`,
        ] : []),
      ].filter(Boolean) as string[],
    },

    {
      period: 'Month 3',
      title: '📊 Consolidate — Measure Your Progress',
      items: [
        hasConditions
          ? `🩺 Schedule a specialist review for your health conditions (${conditionList}). Bring your Month 2 blood test results. Controlled conditions have dramatically less longevity impact than uncontrolled ones.`
          : `🩺 Complete a full preventive health check: blood pressure, fasting glucose, HbA1c, lipid panel, BMI measurement. Compare against your Month 2 baseline — you should see measurable improvement.`,

        `📱 Retake the BornClock Life Expectancy quiz this week. Research shows measurable epigenetic improvements within 8-12 weeks of consistent lifestyle change. Your Longevity Score should increase.`,

        `📋 Review your 90-day success honestly. For every dropped habit: change the TRIGGER, not the intention. A different time, place, or cue is more effective than more willpower.`,

        `🏃 Month 3 exercise target: 150 minutes of moderate exercise per week. This is the WHO threshold where the 31% all-cause mortality reduction begins. Track your weekly minutes.`,

        `💧 Consolidate your nutrition gains: 2.5-3L water daily, legumes every day, vegetables at every meal, minimal ultra-processed food. These are now permanent lifestyle changes — not a 90-day experiment.`,
      ].filter(Boolean) as string[],
    },
  ];
}
