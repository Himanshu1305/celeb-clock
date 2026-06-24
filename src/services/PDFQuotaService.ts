import { supabase } from '@/integrations/supabase/client';

export type QuotaTier = 'free' | 'trial' | 'premium' | 'admin';

// Admin emails — these users bypass all quota limits
export const ADMIN_EMAILS: string[] = [
  'himanshu1305@gmail.com',
  'hello@bornclock.com',
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function getQuotaLimit(tier: QuotaTier): number {
  if (tier === 'admin') return Infinity;
  if (tier === 'premium') return 3;
  if (tier === 'trial') return 2;
  return 1;
}

export async function getUsageCount(userId: string, tier: QuotaTier): Promise<number> {
  const now = new Date();
  const fromDate = tier === 'premium'
    ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    : '2020-01-01T00:00:00.000Z';

  const { count } = await supabase
    .from('pdf_reports_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', fromDate);

  return count ?? 0;
}

export async function hasQuotaRemaining(userId: string, tier: QuotaTier): Promise<boolean> {
  const [limit, used] = await Promise.all([
    Promise.resolve(getQuotaLimit(tier)),
    getUsageCount(userId, tier),
  ]);
  return used < limit;
}

export async function recordPDFGeneration(userId: string, reportType = 'birthday'): Promise<void> {
  await supabase
    .from('pdf_reports_log')
    .insert({ user_id: userId, report_type: reportType });
}

// Aliases for audit compatibility
export const getQuotaStatus = getQuotaLimit;
export const logPDFGeneration = recordPDFGeneration;
