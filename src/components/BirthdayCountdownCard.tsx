import { useEffect, useState } from 'react';
import { nextBirthday } from '@/lib/nextBirthday';

/** S11: the actual countdown for /birthday-countdown (days + live h/m/s to local midnight). */
export function BirthdayCountdownCard({ birthDate }: { birthDate: Date | null }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!birthDate) {
    return (
      <div data-testid="birthday-countdown-empty" className="rounded-2xl border border-border p-6 text-center text-muted-foreground mb-6">
        Enter your date of birth below to start your birthday countdown.
      </div>
    );
  }

  const nb = nextBirthday(birthDate, now);
  const ms = Math.max(0, nb.next.getTime() - now.getTime());
  const hrs = Math.floor(ms / 3600000) % 24;
  const mins = Math.floor(ms / 60000) % 60;
  const secs = Math.floor(ms / 1000) % 60;
  const fullDays = Math.floor(ms / 86400000);
  const dateLabel = nb.next.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div data-testid="birthday-countdown" className="rounded-2xl border border-brand-purple/30 bg-brand-purple/10 p-6 text-center mb-6">
      {nb.isToday && (
        <p data-testid="birthday-today" className="text-lg font-bold text-brand-purple mb-2">🎉 Happy birthday — it's today!</p>
      )}
      <p className="text-sm text-muted-foreground">Your next birthday is in</p>
      <p className="text-5xl font-extrabold text-foreground my-2">
        <span data-testid="birthday-countdown-days">{nb.days}</span> {nb.days === 1 ? 'day' : 'days'}
      </p>
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="off">
        {fullDays}d {String(hrs).padStart(2, '0')}h {String(mins).padStart(2, '0')}m {String(secs).padStart(2, '0')}s
      </p>
      <p className="mt-3 text-sm text-foreground">
        {dateLabel} · a <strong>{nb.weekday}</strong> · you'll turn <strong>{nb.turningAge}</strong>
      </p>
      {nb.isLeapling && nb.nextLeapDay && (
        <p data-testid="birthday-leapling" className="mt-2 text-xs text-muted-foreground">
          Born on 29 February: in non-leap years we count to 28 February. Your next real 29 February is in {nb.nextLeapDay.getFullYear()}.
        </p>
      )}
    </div>
  );
}
