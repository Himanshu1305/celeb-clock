import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: number;
  user_id: string;
  display_name: string;
  forecast: number;
  country: string | null;
  age_group: string;
  score: number;
  opted_in_at: string;
}

export interface LeaderboardFilters {
  country?: string;
  ageGroup?: string;
  view?: 'forecast' | 'newest';
  limit?: number;
  offset?: number;
}

export async function getLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardEntry[]> {
  let query = supabase
    .from('leaderboard_entries')
    .select('*');

  if (filters.country) {
    query = query.eq('country', filters.country);
  }
  if (filters.ageGroup) {
    query = query.eq('age_group', filters.ageGroup);
  }

  if (filters.view === 'newest') {
    query = query.order('opted_in_at', { ascending: false });
  } else {
    query = query.order('forecast', { ascending: false });
  }

  query = query.limit(filters.limit || 20);
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data } = await query;
  return (data as LeaderboardEntry[]) || [];
}

export async function joinLeaderboard(
  userId: string,
  displayName: string,
  forecast: number,
  country: string | null,
  ageGroup: string,
  score: number
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('leaderboard_entries')
    .upsert(
      {
        user_id: userId,
        display_name: displayName || 'Anonymous',
        forecast,
        country,
        age_group: ageGroup,
        score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  return { error: error?.message };
}

export async function removeFromLeaderboard(userId: string): Promise<void> {
  await supabase.from('leaderboard_entries').delete().eq('user_id', userId);
}

export async function getMyRank(forecast: number): Promise<number> {
  const { count } = await supabase
    .from('leaderboard_entries')
    .select('*', { count: 'exact', head: true })
    .gt('forecast', forecast);

  return (count ?? 0) + 1;
}

export async function getLeaderboardStats(): Promise<{
  total: number;
  highest: { forecast: number; country: string | null } | null;
  average: number;
  topAgeGroup: string;
}> {
  const { data } = await supabase
    .from('leaderboard_entries')
    .select('forecast, country, age_group');

  if (!data || data.length === 0) {
    return { total: 0, highest: null, average: 0, topAgeGroup: '30s' };
  }

  const sorted = [...data].sort((a, b) => b.forecast - a.forecast);
  const avg = data.reduce((s, r) => s + r.forecast, 0) / data.length;

  const ageCounts: Record<string, number> = {};
  for (const r of data) {
    ageCounts[r.age_group] = (ageCounts[r.age_group] || 0) + 1;
  }
  const topAgeGroup = Object.entries(ageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '30s';

  return {
    total: data.length,
    highest: sorted[0] ? { forecast: sorted[0].forecast, country: sorted[0].country } : null,
    average: Math.round(avg * 10) / 10,
    topAgeGroup,
  };
}
