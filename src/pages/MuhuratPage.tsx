/**
 * Muhurat (auspicious timing) finder (Part I.9). Reuses the validated engine's
 * Sun/Moon positions → Panchang → auspicious-day scoring. Scope (v1): find
 * auspicious dates in the next N days for a common purpose, with the Panchang
 * detail and the Rahu Kalam window to avoid. Fuller Muhurta categories (Chaughadia,
 * Hora, per-event exact-minute windows) are deferred to a future expansion.
 */
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

interface Day { date: string; weekday: string; nakshatra: string; tithiName: string; paksha: string; yoga: string; rahuKalam: { start: string; end: string }; score: number; reasons: string[]; auspicious: boolean }
const PURPOSES = [{ id: 'business', label: 'Start a business / venture' }, { id: 'travel', label: 'Travel / journey' }, { id: 'general', label: 'General auspicious start' }] as const;

export default function MuhuratPage() {
  const [purpose, setPurpose] = useState<'business' | 'travel' | 'general'>('business');
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<Day[] | null>(null);
  const [methodology, setMethodology] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const find = async () => {
    setLoading(true); setFailed(false); setResult(null);
    try {
      const res = await fetch(`/api/muhurat?purpose=${purpose}&days=${days}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      setResult(data.auspicious as Day[]);
      setMethodology(data.methodology || '');
    } catch { setFailed(true); } finally { setLoading(false); }
  };
  const fmt = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  return (
    <div data-testid="muhurat-page" className="min-h-screen bg-gradient-cosmic">
      <SEO title="Muhurat Finder — Auspicious Dates (Panchang) | BornClock"
        description="Find auspicious Muhurat dates in the coming weeks for starting a business, travel or any new beginning — by Tithi, Nakshatra, Yoga and weekday, with the Rahu Kalam window to avoid."
        canonicalUrl="/muhurat" ogType="website" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8"><Navigation /><AuthNav /></header>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Muhurat Finder</h1>
        <p className="text-muted-foreground mb-6">Auspicious dates for a fresh start, chosen by the Panchang (Tithi, Nakshatra, Yoga and weekday). Each day also shows the Rahu Kalam window to avoid.</p>

        <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Purpose</label>
            <select data-testid="muhurat-purpose" value={purpose} onChange={e => setPurpose(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              {PURPOSES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Look ahead</label>
            <select data-testid="muhurat-days" value={days} onChange={e => setDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value={30}>Next 30 days</option><option value={60}>Next 60 days</option><option value={90}>Next 90 days</option>
            </select>
          </div>
          <button data-testid="muhurat-find-btn" onClick={find} disabled={loading}
                  className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Finding…' : 'Find auspicious dates →'}
          </button>
        </div>

        {failed && <p className="text-sm text-muted-foreground mt-4">The service is temporarily unavailable. Please try again shortly.</p>}

        {result && (
          <div data-testid="muhurat-result" className="mt-6 space-y-3">
            {methodology && (
              <div data-testid="muhurat-methodology" className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-sm text-foreground">
                <div className="font-semibold mb-1">How these dates are chosen</div>
                <p>{methodology}</p>
              </div>
            )}
            <div className="text-sm text-muted-foreground">{result.length} auspicious {result.length === 1 ? 'date' : 'dates'} found in the next {days} days.</div>
            {result.length === 0 && <p className="text-sm text-foreground">No strongly auspicious day in this window — try a longer range, or a general astrologer would look at your personal chart too.</p>}
            {result.map(d => (
              <div key={d.date} data-testid="muhurat-day" className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-foreground">{fmt(d.date)}</div>
                  <div className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white">auspicious</div>
                </div>
                <div className="text-sm text-foreground mt-1">{d.nakshatra} Nakshatra · {d.tithiName} ({d.paksha}) · {d.yoga} Yoga</div>
                <div className="text-xs text-muted-foreground mt-1">{d.reasons.slice(0, 2).join(' · ')}</div>
                <div className="text-xs text-amber-700 mt-1">Avoid the Rahu Kalam window that day: {d.rahuKalam.start}–{d.rahuKalam.end} (approx, local).</div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Scope: this first version evaluates each day’s Panchang at approximately local sunrise and reports the standard weekday Rahu Kalam. Finer categories (Chaughadia, Hora, exact-minute windows and personal-chart Chandrashtama) are a planned expansion. Treat Muhurat as classical guidance, not a guarantee.
        </p>
      </div>
      <Footer />
    </div>
  );
}
