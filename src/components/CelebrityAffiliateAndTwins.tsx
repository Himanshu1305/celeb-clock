import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Cosmic Twins — only renders if the visitor's saved birthday (localStorage)
// shares this celebrity's day & month.
export function CosmicTwins({ day, month, celebName }: { day: number | null; month: number | null; celebName: string }) {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    if (day == null || month == null) return;
    try {
      const raw = localStorage.getItem('bornclock_dob') || localStorage.getItem('birthDate');
      if (!raw) return;
      const m = /(\d{4})-(\d{2})-(\d{2})/.exec(raw);
      if (!m) return;
      if (Number(m[2]) === month && Number(m[3]) === day) setMatch(true);
    } catch {
      /* localStorage unavailable — no twins shown */
    }
  }, [day, month]);

  if (!match) return null;
  return (
    <div data-testid="cosmic-twins" className="rounded-xl border border-primary/30 bg-primary/5 p-5 my-6">
      <h3 className="font-bold text-foreground mb-1">✨ You're a cosmic twin!</h3>
      <p className="text-sm text-muted-foreground mb-3">
        You share your birthday with {celebName}. See everything your birthday reveals about you.
      </p>
      <Link
        to="/birthday-report"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Get my Birthday Report →
      </Link>
    </div>
  );
}
