import { useEffect, useState } from 'react';
import { getPublicFeedback, shouldShowAverage, averageRating, type ContentType, type FeedbackRow } from '@/lib/feedback';
import { Star } from 'lucide-react';

/**
 * Public feedback display (BATCH-8 P4). Renders the average star rating ONLY once an item
 * has ≥5 ratings, and a "Reader comments" block of the TWO-KEY survivors (approved AND
 * consented). Comment text is rendered as plain React children (auto-escaped) — hostile
 * HTML/script content is shown inert, never executed. With zero data today, renders nothing.
 */
export function ReaderComments({ contentType, slug }: { contentType: ContentType; slug: string }) {
  const [ratings, setRatings] = useState<number[]>([]);
  const [comments, setComments] = useState<FeedbackRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPublicFeedback(contentType, slug).then(({ ratings, comments }) => {
      if (!cancelled) { setRatings(ratings); setComments(comments); }
    });
    return () => { cancelled = true; };
  }, [contentType, slug]);

  const showAvg = shouldShowAverage(ratings.length);
  if (!showAvg && comments.length === 0) return null; // nothing public yet

  const avg = averageRating(ratings);

  return (
    <div className="mt-8 border-t border-gray-100 pt-6" data-testid="reader-comments">
      {showAvg && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} className={`w-5 h-5 ${avg >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900">{avg.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({ratings.length} ratings)</span>
        </div>
      )}
      {comments.length > 0 && (
        <>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Reader comments</p>
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id ?? c.created_at} className="border border-gray-200 rounded-xl p-4">
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-3.5 h-3.5 ${c.rating >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                {/* Plain children → React escapes; hostile markup renders inert. */}
                <p className="text-sm text-gray-700">{c.comment}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ReaderComments;
