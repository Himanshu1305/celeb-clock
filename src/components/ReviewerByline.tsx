import { UserCheck } from 'lucide-react';
import { getReviewer, type ExpertReviewer } from '@/config/reviewers';

/**
 * Expert-reviewer byline (P3-8). Renders a named reviewer + credentials ONLY when a REAL
 * reviewer is registered in src/config/reviewers.ts. With no reviewer it renders nothing
 * (returns null) — BornClock never invents a reviewer or credentials (Rule 8 / Part 4).
 *
 * Usage once the person supplies a reviewer:
 *   <ReviewerByline reviewerId="dr-example" reviewedOn="2026-10-09" />
 */
export function ReviewerByline({
  reviewerId,
  reviewer,
  reviewedOn,
  className = '',
}: {
  reviewerId?: string;
  reviewer?: ExpertReviewer;
  reviewedOn?: string;
  className?: string;
}) {
  const r = reviewer || getReviewer(reviewerId);
  if (!r) return null; // no real reviewer → render nothing (honest default)

  const dateLabel = reviewedOn
    ? new Date(reviewedOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className={`flex items-start gap-2 text-sm text-muted-foreground ${className}`} data-testid="reviewer-byline">
      <UserCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
      <span>
        Medically/astrologically reviewed by{' '}
        {r.profileUrl ? (
          <a href={r.profileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline underline-offset-2">{r.name}</a>
        ) : (
          <strong className="text-foreground">{r.name}</strong>
        )}
        <span className="text-foreground">, {r.credentials}</span>
        {dateLabel && <span> · {dateLabel}</span>}
        {r.bio && <span className="block text-xs mt-0.5 opacity-80">{r.bio}</span>}
      </span>
    </div>
  );
}
