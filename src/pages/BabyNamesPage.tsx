import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { NAKSHATRA_AKSHARAS, NAKSHATRA_LIST, SAMPLE_NAMES } from '@/data/nakshatraAksharas';
import { NAKSHATRA_HINDI } from '@/data/vedicTermsHindi';

export default function BabyNamesPage() {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [computing, setComputing] = useState(false);
  const [failed, setFailed] = useState(false);

  const aksharas = nakshatra ? (NAKSHATRA_AKSHARAS[nakshatra] || []) : [];

  const computeFromBirth = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !/^\d{2}:\d{2}$/.test(time)) return;
    setComputing(true); setFailed(false);
    try {
      const [y, m, d] = dob.split('-');
      const [h, min] = time.split(':');
      const params = new URLSearchParams({ y, m, d, h, min, lat: '28.6139', lon: '77.2090', tz: '5.5' });
      const res = await fetch(`/api/vedic-profile?${params.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (data?.nakshatra?.nakshatra) setNakshatra(data.nakshatra.nakshatra);
      else throw new Error('no nakshatra');
    } catch { setFailed(true); }
    finally { setComputing(false); }
  };

  return (
    <div data-testid="baby-names-page" className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Baby Names by Nakshatra — Birth Star Name Syllables | BornClock"
        description="Find auspicious baby-name starting syllables (aksharas) by Nakshatra (birth star), the traditional Vedic way. Enter the birth details or pick the Nakshatra directly."
        canonicalUrl="/baby-names"
        ogType="website"
      />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Baby Names by Nakshatra</h1>
        <p className="text-muted-foreground mb-6">
          In the Vedic tradition, a baby's name begins with an auspicious syllable (akshara) determined by the Moon's Nakshatra at birth.
        </p>

        <div className="rounded-xl border border-border p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-dob">Baby's date of birth</label>
              <input id="baby-dob" data-testid="baby-dob-input" type="date" value={dob}
                     onChange={e => setDob(e.target.value)}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-time">Birth time (for accuracy)</label>
              <input id="baby-time" data-testid="baby-time-input" type="time" value={time}
                     onChange={e => setTime(e.target.value)}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
          </div>
          <button data-testid="baby-compute-btn" onClick={computeFromBirth}
                  disabled={computing || !/^\d{4}-\d{2}-\d{2}$/.test(dob) || !/^\d{2}:\d{2}$/.test(time)}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {computing ? 'Finding Nakshatra…' : 'Find Nakshatra from birth details →'}
          </button>
          {failed && <p className="text-xs text-muted-foreground">Couldn't compute the Nakshatra automatically — pick it below instead.</p>}

          <div>
            <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-nakshatra">Or pick the Nakshatra</label>
            <select id="baby-nakshatra" data-testid="baby-nakshatra-select" value={nakshatra}
                    onChange={e => setNakshatra(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value="">Select Nakshatra…</option>
              {NAKSHATRA_LIST.map(n => <option key={n} value={n}>{n} {NAKSHATRA_HINDI[n] || ''}</option>)}
            </select>
          </div>
        </div>

        {nakshatra && (
          <div data-testid="baby-aksharas" className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5">
            <h2 className="font-semibold text-foreground mb-1">
              {nakshatra} {NAKSHATRA_HINDI[nakshatra] || ''} — auspicious starting sounds
            </h2>
            <div className="flex flex-wrap gap-2 my-3">
              {aksharas.map(a => (
                <span key={a} className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 font-semibold text-indigo-700">{a}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-2">Baby names traditionally begin with one of these syllables.</p>
            {aksharas.some(a => SAMPLE_NAMES[a]?.length) && (
              <p className="text-sm text-foreground">
                Examples: {aksharas.flatMap(a => SAMPLE_NAMES[a] || []).slice(0, 8).join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="mt-10 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-3">Want your baby's full Vedic birth chart?</p>
          <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">
            Generate the Kundali →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
