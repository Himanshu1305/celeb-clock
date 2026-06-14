import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FEATURES } from '@/config/features';

export function BirthdayDiscountBanner() {
  const { profile, isPremium } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    const key = `birthday_discount_dismissed_${new Date().getMonth()}`;
    return localStorage.getItem(key) === 'true';
  });

  if (!FEATURES.BIRTHDAY_DISCOUNT) return null;
  if (!profile) return null;
  if (isPremium) return null;
  if (dismissed) return null;

  // Show only in user's birth month
  // Profile doesn't store birth_month directly — derive from DOB if available
  // For now, check against a stored field; will wire to real DOB when available
  const currentMonth = new Date().getMonth(); // 0-indexed
  const userBirthMonth: number | null = null; // Will be (profile as any).birth_month ?? null
  if (userBirthMonth !== null && userBirthMonth !== currentMonth) return null;

  const handleDismiss = () => {
    const key = `birthday_discount_dismissed_${new Date().getMonth()}`;
    localStorage.setItem(key, 'true');
    setDismissed(true);
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-amber-900 py-2.5 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4 max-w-5xl">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>🎂</span>
          <span>
            <strong>Happy Birthday Month!</strong> You get 30% off premium this month only.
            Use code <strong className="font-mono bg-amber-900/20 px-1.5 py-0.5 rounded">BIRTHDAY30</strong> at checkout.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/upgrade"
            className="bg-amber-900 text-amber-100 hover:bg-amber-800 transition-colors text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            Upgrade Now →
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-amber-900/20 transition-colors"
            aria-label="Dismiss birthday offer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
