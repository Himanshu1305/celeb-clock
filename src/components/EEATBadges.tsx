import { ShieldCheck, BookOpenCheck, CalendarClock } from 'lucide-react';

interface EEATBadgesProps {
  lastUpdated?: string;
  sources?: string[];
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const EEATBadges = ({
  lastUpdated = new Date().toISOString().slice(0, 10),
  sources = ['WHO', 'CDC', 'NASA', 'Wikipedia'],
}: EEATBadgesProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground py-3">
      <div className="flex items-center gap-1.5">
        <CalendarClock className="w-4 h-4 text-primary" />
        <span>Last updated: <strong className="text-foreground">{formatDate(lastUpdated)}</strong></span>
      </div>
      <div className="flex items-center gap-1.5">
        <BookOpenCheck className="w-4 h-4 text-accent" />
        <span>Reviewed by BornClock Editorial Team</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>Sources: <strong className="text-foreground">{sources.join(', ')}</strong></span>
      </div>
    </div>
  );
};
