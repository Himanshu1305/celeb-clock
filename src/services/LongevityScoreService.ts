import { supabase } from '@/integrations/supabase/client';

export interface ScoreEntry {
  score: number;
  forecast: number;
  recorded_at: string;
  week_start: string;
}

export async function saveWeeklyScore(
  userId: string,
  score: number,
  forecast: number
): Promise<void> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  await supabase
    .from('longevity_scores')
    .upsert(
      { user_id: userId, score, forecast, week_start: weekStartStr },
      { onConflict: 'user_id,week_start' }
    );
}

export async function getScoreHistory(
  userId: string,
  weeks: number = 12
): Promise<ScoreEntry[]> {
  const { data } = await supabase
    .from('longevity_scores')
    .select('score, forecast, recorded_at, week_start')
    .eq('user_id', userId)
    .order('week_start', { ascending: true })
    .limit(weeks);

  return (data as ScoreEntry[]) || [];
}
