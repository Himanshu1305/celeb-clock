import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Rashi (or Western sign fallback) → recommended gemstone. Amazon Associates
// India tag is a placeholder until the account is registered.
const AMAZON_TAG = 'bornclock-21';
const GEMSTONE_BY_RASHI: Record<string, string> = {
  Mesha: 'Red Coral', Vrishabha: 'Diamond', Mithuna: 'Emerald', Karka: 'Pearl',
  Simha: 'Ruby', Kanya: 'Emerald', Tula: 'Diamond', Vrishchika: 'Red Coral',
  Dhanu: 'Yellow Sapphire', Makara: 'Blue Sapphire', Kumbha: 'Blue Sapphire', Meena: 'Yellow Sapphire',
};

export function LuckyStoneAffiliate({ rashi }: { rashi: string | null }) {
  const gem = (rashi && GEMSTONE_BY_RASHI[rashi]) || 'Rudraksha';
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(gem + ' gemstone')}&tag=${AMAZON_TAG}`;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 my-6">
      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
        💎 Lucky gemstone{rashi ? ` for ${rashi} Rashi` : ''}: {gem}
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        In Vedic tradition, wearing your rashi's gemstone is believed to strengthen its planetary energy.
      </p>
      <a
        href={url}
        target="_blank"
        rel="sponsored noopener nofollow"
        className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline"
      >
        Shop {gem} on Amazon →
      </a>
    </div>
  );
}

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
