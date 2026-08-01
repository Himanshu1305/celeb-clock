/**
 * Feedback & rating system (BATCH-8 P4) — for REPORTS and BLOG ARTICLES.
 *
 * Pure logic (engagement gate, sentiment routing, TWO-KEY publication, thresholds) lives
 * here and is unit-tested. The Supabase ops TOLERATE the `feedback` table being ABSENT
 * (until NOTES-feedback.sql is applied) — every read resolves to empty and writes report a
 * soft failure, so the UI hides gracefully rather than throwing.
 */
import { supabase } from '@/integrations/supabase/client';
import { publicComments, type ContentType, type FeedbackRow } from '@/lib/feedbackLogic';

// Re-export the pure logic so existing importers of '@/lib/feedback' keep working.
export {
  passesEngagementGate, routeSentiment, isPubliclyVisible, shouldShowAverage,
  MIN_RATINGS_FOR_AVERAGE, averageRating, publicComments,
} from '@/lib/feedbackLogic';
export type { ContentType, FeedbackRow } from '@/lib/feedbackLogic';

// ── Supabase ops (tolerate-absent) ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const tableMissing = (e: unknown) => {
  const msg = (e as { message?: string; code?: string })?.message ?? '';
  const code = (e as { code?: string })?.code ?? '';
  return /relation .*feedback.* does not exist|could not find the table|schema cache/i.test(msg) || code === '42P01' || code === 'PGRST205';
};

/** The current user's own feedback row for a content item (null if none / table absent). */
export async function getMyFeedback(userId: string, contentType: ContentType, slug: string): Promise<FeedbackRow | null> {
  try {
    const { data, error } = await db.from('feedback').select('*')
      .eq('user_id', userId).eq('content_type', contentType).eq('slug', slug).maybeSingle();
    if (error) throw error;
    return (data as FeedbackRow) ?? null;
  } catch (e) {
    if (!tableMissing(e)) console.error('[feedback] getMyFeedback:', e);
    return null;
  }
}

/** Idempotent upsert — one row per (user, content_type, slug). Returns ok/error. */
export async function submitFeedback(row: Omit<FeedbackRow, 'id' | 'created_at' | 'approved'>): Promise<{ ok: boolean; error: string | null }> {
  try {
    const { error } = await db.from('feedback')
      .upsert({ ...row, approved: false }, { onConflict: 'user_id,content_type,slug' });
    if (error) throw error;
    return { ok: true, error: null };
  } catch (e) {
    const soft = tableMissing(e);
    if (!soft) console.error('[feedback] submitFeedback:', e);
    return { ok: false, error: soft ? 'Feedback isn’t available yet.' : ((e as Error).message ?? 'Could not save feedback.') };
  }
}

/** Persist a dismissal (server-side) so the prompt stays hidden across sessions/devices. */
export async function dismissFeedback(userId: string, contentType: ContentType, slug: string): Promise<void> {
  try {
    const { error } = await db.from('feedback')
      .upsert({ user_id: userId, content_type: contentType, slug, rating: 0, comment: null, consent: false, approved: false, dismissed: true }, { onConflict: 'user_id,content_type,slug' });
    if (error) throw error;
  } catch (e) {
    if (!tableMissing(e)) console.error('[feedback] dismissFeedback:', e);
  }
}

/** Public, approved+consented feedback for a content item (empty if table absent / none). */
export async function getPublicFeedback(contentType: ContentType, slug: string): Promise<{ ratings: number[]; comments: FeedbackRow[] }> {
  try {
    const { data, error } = await db.from('feedback').select('*')
      .eq('content_type', contentType).eq('slug', slug).eq('approved', true).gt('rating', 0);
    if (error) throw error;
    const rows = (data as FeedbackRow[]) ?? [];
    return { ratings: rows.map(r => r.rating), comments: publicComments(rows) };
  } catch (e) {
    if (!tableMissing(e)) console.error('[feedback] getPublicFeedback:', e);
    return { ratings: [], comments: [] };
  }
}
