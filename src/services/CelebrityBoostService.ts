import { supabase } from '@/integrations/supabase/client';

export async function boostCelebrity(
  celebrityName: string,
  userId: string | null
): Promise<{ success: boolean; totalBoosts: number }> {
  const sessionId = localStorage.getItem('bornclock_session')
    || Math.random().toString(36).substring(7);
  localStorage.setItem('bornclock_session', sessionId);

  // Check if already boosted today (local gate — prevents UI spam)
  const today = new Date().toISOString().split('T')[0];
  const boostedKey = `boost_${celebrityName}_${today}`;
  if (localStorage.getItem(boostedKey)) {
    const { count } = await supabase
      .from('celebrity_boosts')
      .select('*', { count: 'exact', head: true })
      .eq('celebrity_name', celebrityName);
    return { success: false, totalBoosts: count || 0 };
  }

  const { error } = await supabase
    .from('celebrity_boosts')
    .insert({
      celebrity_name: celebrityName,
      user_id: userId || null,
      session_id: userId ? null : sessionId,
    });

  if (!error) {
    localStorage.setItem(boostedKey, 'true');
  }

  const { count } = await supabase
    .from('celebrity_boosts')
    .select('*', { count: 'exact', head: true })
    .eq('celebrity_name', celebrityName);

  return { success: !error, totalBoosts: count || 0 };
}

export async function getCelebrityBoosts(celebrityName: string): Promise<number> {
  const { count } = await supabase
    .from('celebrity_boosts')
    .select('*', { count: 'exact', head: true })
    .eq('celebrity_name', celebrityName);
  return count || 0;
}

export interface BoostLeaderEntry {
  celebrity_name: string;
  boost_count: number;
}

export async function getTodayTopBoosted(limit = 3): Promise<BoostLeaderEntry[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('celebrity_boosts')
    .select('celebrity_name')
    .gte('boosted_at', `${today}T00:00:00Z`);

  if (!data || data.length === 0) return [];

  // Count manually (Supabase anon key doesn't support group-by aggregation)
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.celebrity_name] = (counts[row.celebrity_name] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([celebrity_name, boost_count]) => ({ celebrity_name, boost_count }))
    .sort((a, b) => b.boost_count - a.boost_count)
    .slice(0, limit);
}
