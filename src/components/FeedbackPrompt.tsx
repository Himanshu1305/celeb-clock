import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  passesEngagementGate, routeSentiment, submitFeedback, dismissFeedback, getMyFeedback,
  type ContentType,
} from '@/lib/feedback';
import { Star, X } from 'lucide-react';

interface FeedbackPromptProps {
  contentType: ContentType;
  slug: string;
  variant?: 'report' | 'blog' | 'tool';
  /** Tool pages: open the prompt as soon as the user has a RESULT, bypassing scroll/dwell. */
  resultReady?: boolean;
}

/**
 * Engagement-gated feedback prompt (BATCH-8 P4). Shows once per (user, content) after
 * ≥50% scroll OR ≥45s dwell. Sentiment routing: 4-5★ → optional public-consent comment
 * (consent DEFAULT UNCHECKED); 1-3★ → private "what would have made this better?". Dismissal
 * and submission are persisted server-side, so it won't reappear. Hides for logged-out users
 * and whenever the feedback table is absent (tolerate-absent).
 */
export function FeedbackPrompt({ contentType, slug, variant = 'report', resultReady = false }: FeedbackPromptProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gateOpen, setGateOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false); // DEFAULT UNCHECKED (two-key)
  const [submitting, setSubmitting] = useState(false);
  const mountedAt = useRef(Date.now());

  // Already submitted or dismissed? → stay hidden (server-side persistence).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getMyFeedback(user.id, contentType, slug).then(row => {
      if (!cancelled && row && (row.dismissed || row.rating > 0)) setHidden(true);
    });
    return () => { cancelled = true; };
  }, [user, contentType, slug]);

  // Tool pages open the prompt the moment a result exists (not scroll/dwell).
  useEffect(() => { if (resultReady) setGateOpen(true); }, [resultReady]);

  // Engagement gate — poll scroll% + dwell (skipped once resultReady has opened it).
  useEffect(() => {
    if (!user || hidden || resultReady) return;
    const check = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const scrollPct = scrollable > 0 ? ((doc.scrollTop || window.scrollY) / scrollable) * 100 : 100;
      const dwellSec = (Date.now() - mountedAt.current) / 1000;
      if (passesEngagementGate(scrollPct, dwellSec)) setGateOpen(true);
    };
    const id = window.setInterval(check, 1000);
    window.addEventListener('scroll', check, { passive: true });
    return () => { window.clearInterval(id); window.removeEventListener('scroll', check); };
  }, [user, hidden]);

  if (!user || hidden || !gateOpen) return null;

  const sentiment = rating > 0 ? routeSentiment(rating) : null;

  const doSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const { ok, error } = await submitFeedback({
      user_id: user.id, content_type: contentType, slug, rating,
      comment: comment.trim() || null,
      consent: sentiment === 'consent' ? consent : false, // 1-3★ is always private
      dismissed: false,
    });
    setSubmitting(false);
    setHidden(true);
    if (ok) toast({ title: 'Thank you', description: 'Your feedback helps us improve.' });
  };
  const doDismiss = async () => {
    setHidden(true);
    if (user) await dismissFeedback(user.id, contentType, slug);
  };

  const wrap = variant === 'blog'
    ? 'border-t border-gray-200 mt-10 pt-6'
    : 'bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mt-8';

  return (
    <div className={wrap} data-testid="feedback-prompt">
      <button onClick={doDismiss} aria-label="Dismiss" className="float-right text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      <p className="font-semibold text-gray-900 mb-3">
        {variant === 'blog' ? 'Was this article helpful?' : 'How was your report?'}
      </p>
      <div className="flex gap-1 mb-4" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} role="radio" aria-checked={rating === n}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}
          >
            <Star className={`w-7 h-7 ${(hover || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>

      {sentiment === 'consent' && (
        <div className="space-y-3">
          <textarea
            value={comment} onChange={e => setComment(e.target.value)} maxLength={1000}
            placeholder="What did you love? (optional)"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" />
            <span>You may feature my comment publicly.</span>
          </label>
        </div>
      )}
      {sentiment === 'improve' && (
        <div className="space-y-3">
          <textarea
            value={comment} onChange={e => setComment(e.target.value)} maxLength={1000}
            placeholder="What would have made this better?"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <p className="text-xs text-gray-400">This is private — it goes only to the BornClock team.</p>
        </div>
      )}

      {rating > 0 && (
        <button
          onClick={doSubmit} disabled={submitting}
          className="mt-4 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send feedback'}
        </button>
      )}
    </div>
  );
}

export default FeedbackPrompt;
