export interface BiorhythmResult {
  physical: number;
  emotional: number;
  intellectual: number;
  date: Date;
  daysSinceBirth: number;
}

export function calculateBiorhythm(birthDate: Date, targetDate: Date): BiorhythmResult {
  const daysDiff = Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  return {
    physical: Math.round(Math.sin(2 * Math.PI * daysDiff / 23) * 100),
    emotional: Math.round(Math.sin(2 * Math.PI * daysDiff / 28) * 100),
    intellectual: Math.round(Math.sin(2 * Math.PI * daysDiff / 33) * 100),
    date: targetDate,
    daysSinceBirth: daysDiff,
  };
}

export function getBiorhythmStatus(value: number): { label: string; color: string; bgColor: string; description: string } {
  if (value > 75) return { label: 'Peak', color: 'text-green-700', bgColor: 'bg-green-100', description: 'Operating at maximum capacity in this cycle' };
  if (value > 25) return { label: 'Rising', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Above average — a good day for this type of activity' };
  if (value > -25) return { label: 'Transition', color: 'text-amber-600', bgColor: 'bg-amber-50', description: 'Transitional phase — proceed with extra care today' };
  if (value > -75) return { label: 'Low', color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'Below average — conserve energy in this area' };
  return { label: 'Recovery', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Deep recovery phase — rest and allow the cycle to reset' };
}

export function getBiorhythmInsight(physical: number, emotional: number, intellectual: number): string {
  const allHigh = physical > 50 && emotional > 50 && intellectual > 50;
  const allLow = physical < -50 && emotional < -50 && intellectual < -50;
  const physHigh = physical > 50;
  const emoHigh = emotional > 50;
  const intHigh = intellectual > 50;

  if (allHigh) return 'A rare alignment — all three cycles are elevated simultaneously. This is an exceptional day for demanding work, important conversations, and peak performance. Seize it.';
  if (allLow) return "All three cycles are in their recharge phase — a rare but meaningful signal to rest, reflect, and restore. Don't fight this day. Work with it.";
  if (physHigh && intHigh) return 'Your physical and intellectual cycles are both elevated — an excellent day for challenging work that requires both stamina and sharp thinking.';
  if (physHigh && emoHigh) return 'Your body and emotions are aligned and elevated — a powerful day for activities that combine physical engagement with emotional connection.';
  if (emoHigh && intHigh) return 'Your emotional and intellectual cycles are both high — an ideal day for creative work, meaningful conversations, and decisions requiring both heart and mind.';
  if (physHigh) return 'Your physical cycle is at peak — prioritise exercise, physical work, and activities requiring bodily engagement today.';
  if (emoHigh) return 'Your emotional cycle is elevated — a good day for important conversations, creative expression, and deepening relationships.';
  if (intHigh) return 'Your intellectual cycle is at peak — tackle your most cognitively demanding work, learning, and decision-making today.';
  return 'Your cycles are in a mixed or transitional phase — a steady, methodical day rather than a peak performance one. Good for consistent work.';
}

export function getBiorhythmSeries(birthDate: Date, startDate: Date, days: number = 30): BiorhythmResult[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i - 15);
    return calculateBiorhythm(birthDate, date);
  });
}
