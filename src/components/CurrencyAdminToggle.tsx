import { useAuth } from '@/hooks/useAuth';
import { getCurrencyOverride, setCurrencyOverride, type Currency } from '@/lib/pricing';

// Admin-only currency toggle so pricing can be reviewed in both INR and USD
// without a VPN or ?currency= param. Never rendered for normal users. Setting a
// currency persists the session override and reloads so every priced surface
// re-resolves. Same mechanism as ?currency= (C2c).
export function CurrencyAdminToggle() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;

  const active = getCurrencyOverride();
  const pick = (c: Currency | null) => {
    setCurrencyOverride(c);
    window.location.reload();
  };

  const btn = (label: string, val: Currency | null) => (
    <button
      onClick={() => pick(val)}
      className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
        active === val || (val === null && !active)
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-3 left-3 z-[60] flex items-center gap-1 rounded-lg border border-gray-200 bg-white/95 px-2 py-1 shadow-lg no-print">
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Admin ₹/$</span>
      {btn('Auto', null)}
      {btn('INR', 'INR')}
      {btn('USD', 'USD')}
    </div>
  );
}
