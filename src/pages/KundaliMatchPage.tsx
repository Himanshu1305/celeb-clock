import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { KundaliTabs } from '@/components/KundaliTabs';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { calculateAshtakoota, type AshtakootaResult } from '@/utils/ashtakoota';

const RASHI_ORDER = ['Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const DELHI = { lat: 28.6139, lon: 77.2090, tz: 5.5 };

async function profileFor(dob: string, time: string, coords: { lat: number; lon: number; tz: number }): Promise<{ nakshatra: string; rashiIndex: number } | null> {
  try {
    const [y, m, d] = dob.split('-');
    const [h, min] = (time || '12:00').split(':');
    const params = new URLSearchParams({ y, m, d, h, min, lat: String(coords.lat), lon: String(coords.lon), tz: String(coords.tz) });
    const res = await fetch(`/api/vedic-profile?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const rashiIndex = data.rashi ? RASHI_ORDER.indexOf(data.rashi) + 1 : 1;
    return { nakshatra: data?.nakshatra?.nakshatra, rashiIndex: rashiIndex || 1 };
  } catch { return null; }
}

const KOOTAS: Array<[keyof AshtakootaResult, string, number]> = [
  ['varna', 'Varna', 1], ['vashya', 'Vashya', 2], ['tara', 'Tara', 3], ['yoni', 'Yoni', 4],
  ['graha_maitri', 'Graha Maitri', 5], ['gana', 'Gana', 6], ['bhakoot', 'Bhakoot', 7], ['nadi', 'Nadi', 8],
];

export default function KundaliMatchPage() {
  const { profile } = useSavedProfile();
  const [usingDifferent, setUsingDifferent] = useState(false);
  const usingSaved = !!profile && !usingDifferent;

  const [dobA, setDobA] = useState('');
  const [timeA, setTimeA] = useState('');
  const [dobB, setDobB] = useState('');
  const [timeB, setTimeB] = useState('');
  const [result, setResult] = useState<AshtakootaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // Person A comes from the saved profile (incl. real birthplace) when present;
  // otherwise from the form. Person B is always entered fresh.
  const effDobA = usingSaved ? profile!.dob : dobA;
  const effTimeA = usingSaved ? profile!.time : timeA;
  const coordsA = usingSaved ? { lat: profile!.city.lat, lon: profile!.city.lon, tz: profile!.city.tz } : DELHI;

  const validA = usingSaved || /^\d{4}-\d{2}-\d{2}$/.test(dobA);
  const validB = /^\d{4}-\d{2}-\d{2}$/.test(dobB);
  const canCalc = validA && validB;

  const calculate = async () => {
    if (!canCalc) return;
    setLoading(true); setFailed(false);
    try {
      const [a, b] = await Promise.all([
        profileFor(effDobA, effTimeA, coordsA),
        profileFor(dobB, timeB, DELHI),
      ]);
      if (!a?.nakshatra || !b?.nakshatra) throw new Error('unavailable');
      setResult(calculateAshtakoota(a.nakshatra, b.nakshatra, a.rashiIndex, b.rashiIndex));
    } catch { setFailed(true); }
    finally { setLoading(false); }
  };

  return (
    <div data-testid="kmatch-page" className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Kundali Matching — Free Guna Milan (Ashtakoota) | BornClock"
        description="Free Kundali matching by the 36-point Ashtakoota (Guna Milan) system — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi, with Nadi & Bhakoot dosha checks."
        canonicalUrl="/kundali-match"
        ogType="website"
      />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Kundali Matching (Guna Milan)</h1>
        <p className="text-muted-foreground mb-4">
          The traditional 36-point Ashtakoota system. {usingSaved ? 'Your details are already filled in — just add the second person.' : 'Enter both birth dates (and times for accurate Nakshatra) to see all eight kootas.'}
        </p>

        <KundaliTabs active="match" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Person A — saved profile if present, else a form */}
          {usingSaved ? (
            <div data-testid="kmatch-saved-a" className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-2">
              <div className="font-semibold text-indigo-900">You</div>
              <div className="text-sm text-indigo-900">★ {profile!.dob}, {profile!.time}<br />{profile!.city.name}</div>
              <button data-testid="kmatch-use-different-a" type="button"
                      onClick={() => { setUsingDifferent(true); setResult(null); }}
                      className="text-indigo-700 underline text-sm hover:text-indigo-900">
                Use different details
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="font-semibold text-foreground">Person A</div>
              <input data-testid="kmatch-dob-a" type="date" value={dobA}
                     onChange={e => { setDobA(e.target.value); setResult(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person A date of birth" />
              <input data-testid="kmatch-time-a" type="time" value={timeA}
                     onChange={e => { setTimeA(e.target.value); setResult(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person A birth time" />
            </div>
          )}

          {/* Person B — always entered fresh */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="font-semibold text-foreground">{usingSaved ? 'The other person' : 'Person B'}</div>
            <input data-testid="kmatch-dob-b" type="date" value={dobB}
                   onChange={e => { setDobB(e.target.value); setResult(null); }}
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person B date of birth" />
            <input data-testid="kmatch-time-b" type="time" value={timeB}
                   onChange={e => { setTimeB(e.target.value); setResult(null); }}
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person B birth time" />
          </div>
        </div>

        <button data-testid="kmatch-calculate-btn" onClick={calculate} disabled={!canCalc || loading}
                className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 mb-6">
          {loading ? 'Matching…' : 'Match Kundalis →'}
        </button>

        {failed && <p className="text-sm text-muted-foreground mb-6">Matching service is temporarily unavailable. Please try again shortly.</p>}

        {result && (
          <div data-testid="kmatch-result" className="space-y-4">
            <div className="text-center rounded-xl border border-border p-4">
              <div className="text-sm text-muted-foreground">Total Guna Milan</div>
              <div className="text-4xl font-black text-indigo-600">{result.total} / 36</div>
              <div className="font-semibold text-foreground">{result.compatibility}</div>
            </div>
            {(result.nadi_dosha || result.bhakoot_dosha) && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                {result.nadi_dosha && <div>⚠️ Nadi Dosha present (same Nadi).</div>}
                {result.bhakoot_dosha && <div>⚠️ Bhakoot Dosha present.</div>}
              </div>
            )}
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted/40 text-muted-foreground"><tr><th className="text-left px-3 py-2">Koota</th><th className="text-left px-3 py-2">Score</th><th className="text-left px-3 py-2">Max</th></tr></thead>
              <tbody>
                {KOOTAS.map(([key, label, max]) => (
                  <tr key={label} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">{label}</td>
                    <td className="px-3 py-2 text-foreground">{result[key] as number}</td>
                    <td className="px-3 py-2 text-muted-foreground">{max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/articles/kundali-compatibility" className="text-indigo-600 hover:underline text-sm">Learn what each koota means →</Link>
          </div>
        )}

        <div className="mt-10 text-sm text-muted-foreground">
          Read the full <Link to="/articles/kundali-compatibility" className="text-primary hover:underline">Kundali compatibility guide</Link>.
        </div>
      </div>
      <Footer />
    </div>
  );
}
