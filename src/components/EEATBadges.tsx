import { ShieldCheck, BookOpenCheck, CalendarClock } from 'lucide-react';
import { getReviewer } from '@/config/reviewers';

interface EEATBadgesProps {
  lastUpdated?: string;
  sources?: string[];
  /** Optional id of a REAL expert reviewer (src/config/reviewers.ts). When registered,
   *  the badge names them; otherwise it keeps the honest editorial-team attribution. */
  reviewerId?: string;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const EEATBadges = ({
  // B23: no fake freshness — without a real content date the "Last updated" line is not shown
  // (the old default printed the build date on every page).
  lastUpdated,
  sources = ['WHO', 'CDC', 'NASA', 'Wikipedia'],
  reviewerId,
}: EEATBadgesProps) => {
  const reviewer = getReviewer(reviewerId);
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground py-3">
      {lastUpdated && (
        <div className="flex items-center gap-1.5">
          <CalendarClock className="w-4 h-4 text-primary" />
          <span>Last updated: <strong className="text-foreground">{formatDate(lastUpdated)}</strong></span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <BookOpenCheck className="w-4 h-4 text-accent" />
        <span>{reviewer ? <>Reviewed by <strong className="text-foreground">{reviewer.name}</strong>, {reviewer.credentials}</> : <>Reviewed by the <a href="/editorial-policy/" className="underline">BornClock Editorial Team</a></>}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>Sources: <strong className="text-foreground">{sources.join(', ')}</strong></span>
      </div>
    </div>
  );
};
