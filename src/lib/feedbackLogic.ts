/**
 * Feedback pure logic (BATCH-8 P4) — no Supabase/DOM imports, so it's unit-testable in
 * Node. The engagement gate, sentiment routing, TWO-KEY publication rule and thresholds
 * live here; src/lib/feedback.ts re-exports these and adds the Supabase ops.
 */
export type ContentType = 'report' | 'blog' | 'tool';

export interface FeedbackRow {
  id?: string;
  user_id: string;
  content_type: ContentType;
  slug: string;
  rating: number;          // 1-5 (0 = a pure dismissal)
  comment: string | null;
  consent: boolean;        // user allows the comment to be shown publicly
  approved: boolean;       // founder approved it in admin
  dismissed: boolean;      // user dismissed the prompt (don't ask again)
  created_at?: string;
}

/** Engagement gate: prompt only after ≥50% scroll OR ≥45s dwell. */
export function passesEngagementGate(scrollPct: number, dwellSec: number): boolean {
  return scrollPct >= 50 || dwellSec >= 45;
}

/** Sentiment routing: 4-5★ → public-consent comment; 1-3★ → private "what would improve this". */
export function routeSentiment(rating: number): 'consent' | 'improve' {
  return rating >= 4 ? 'consent' : 'improve';
}

/** TWO-KEY publication — shows publicly ONLY with consent AND approval (no exceptions). */
export function isPubliclyVisible(row: Pick<FeedbackRow, 'consent' | 'approved'>): boolean {
  return row.consent === true && row.approved === true;
}

/** Average stars are shown on a page only once it has ≥5 ratings. */
export const MIN_RATINGS_FOR_AVERAGE = 5;
export function shouldShowAverage(ratingCount: number): boolean {
  return ratingCount >= MIN_RATINGS_FOR_AVERAGE;
}
export function averageRating(ratings: number[]): number {
  if (!ratings.length) return 0;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}

/** Public comments = the two-key survivors with non-empty text. */
export function publicComments(rows: FeedbackRow[]): FeedbackRow[] {
  return rows.filter(r => isPubliclyVisible(r) && (r.comment ?? '').trim().length > 0);
}
