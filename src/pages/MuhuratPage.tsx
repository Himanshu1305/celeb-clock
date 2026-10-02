/**
 * Muhurat (auspicious timing) finder (Part I.9; expanded in Part AI).
 * Reuses the validated engine's Sun/Moon positions → Panchang → auspicious-day
 * scoring. Part AI adds: a fuller occasion list (marriage, griha pravesh, vehicle,
 * naming, vidyarambh, engagement …), a REQUIRED location so the Panchang is
 * computed in the user's own timezone, a custom start date + look-ahead range
 * (capped at 180 days), and plain-language glosses for the Panchang jargon.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { MUHURAT_OCCASIONS, type MuhuratPurpose } from '@/lib/vedic/panchang';
import { geocodeCity, type GeoResult } from '@/services/geocoding';
import '@/styles/part-aj.css';

interface Day { date: string; weekday: string; nakshatra: string; tithiName: string; paksha: string; yoga: string; rahuKalam: { start: string; end: string }; score: number; reasons: string[]; auspicious: boolean }

// Look-ahead choices — custom range capped at 180 days (Part AI).
const RANGES = [30, 60, 90, 120, 180] as const;

export default function MuhuratPage() {
  const [purpose, setPurpose] = useState<MuhuratPurpose>('marriage');
  const [days, setDays] = useState(90);
  const [from, setFrom] = useState(''); // empty = today
  const [cityQuery, setCityQuery] = useState('');
  const [city, setCity] = useState<GeoResult | null>(null);
  const [options, setOptions] = useState<GeoResult[]>([]);
  const [result, setResult] = useState<Day[] | null>(null);
  const [methodology, setMethodology] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const onCity = async (v: string) => {
    setCityQuery(v); setCity(null);
    if (v.trim().length >= 3) { try { setOptions(await geocodeCity(v)); } catch { setOptions([]); } }
    else setOptions([]);
  };
  const pickCity = (c: GeoResult) => { setCity(c); setCityQuery(c.name); setOptions([]); };

  const find = async () => {
    if (!city) return;
    setLoading(true); setFailed(false); setResult(null);
    try {
      const params = new URLSearchParams({ purpose, days: String(days), tz: String(city.utcOffset) });
      if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) params.set('from', from);
      const res = await fetch(`/api/muhurat?${params.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      setResult(data.auspicious as Day[]);
      setMethodology(data.methodology || '');
    } catch { setFailed(true); } finally { setLoading(false); }
  };
  const fmt = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  return (
    <div data-testid="muhurat-page" className="paj editorial" data-category="vedic">
      <SEO title="Muhurat Finder — Auspicious Dates (Panchang) | BornClock"
        description="Find auspicious Muhurat dates for marriage, house-warming, business, a vehicle, naming or travel — by Tithi, Nakshatra, Yoga and weekday for your own location, with the Rahu Kalam window to avoid."
        canonicalUrl="/muhurat" ogType="website" />
      <header className="site-header" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><Navigation /><AuthNav /></header>
      <div className="breadcrumb">
        <div><span className="crumb-parent">BornClock&nbsp; /&nbsp; <Link to="/vedic-astrology" className="textlink">Vedic Astrology</Link>&nbsp; /&nbsp; </span><span className="crumb-name">Muhurat Finder</span></div>
        <div className="edition"><span className="dot" />Panchang · auspicious timing</div>
      </div>
      <main id="main">
        <section className="section">
          <div className="section-head">
            <div><span className="eyebrow">Panchang</span><h1>Muhurat Finder.</h1></div>
            <p>Auspicious dates for a specific occasion, chosen by the Panchang (<TermTip id="tithi">Tithi</TermTip>, <TermTip id="nakshatra">Nakshatra</TermTip>, <TermTip id="panchangYoga">Yoga</TermTip> and weekday) for your location — each day shows the <TermTip id="rahuKalam">Rahu Kalam</TermTip> window to avoid.</p>
          </div>

        <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4" style={{ marginTop: 16 }}>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Occasion</label>
            <select data-testid="muhurat-purpose" value={purpose} onChange={e => setPurpose(e.target.value as MuhuratPurpose)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              {MUHURAT_OCCASIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>

          {/* Required location — the Panchang day is computed in this location's timezone. */}
          <div className="relative">
            <label className="block text-xs text-muted-foreground mb-1" htmlFor="muhurat-city">Location <span className="text-amber-700">(required)</span></label>
            <input id="muhurat-city" data-testid="muhurat-city" type="text" value={cityQuery}
                   onChange={e => onCity(e.target.value)} placeholder="e.g. Delhi, London, New York"
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            {options.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-56 overflow-auto">
                {options.map((o, i) => (
                  <button key={i} type="button" data-testid="muhurat-city-option" onClick={() => pickCity(o)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-gray-900">
                    {o.name}
                  </button>
                ))}
              </div>
            )}
            {city && <p className="mt-1 text-xs text-muted-foreground">Using {city.name} (UTC{city.utcOffset >= 0 ? '+' : ''}{city.utcOffset}) for the day’s Panchang.</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="muhurat-from">Start from</label>
              <input id="muhurat-from" data-testid="muhurat-from" type="date" value={from} onChange={e => setFrom(e.target.value)}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
              <p className="mt-1 text-[11px] text-muted-foreground">Leave blank for today.</p>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Look ahead</label>
              <select data-testid="muhurat-days" value={days} onChange={e => setDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                {RANGES.map(r => <option key={r} value={r}>Next {r} days</option>)}
              </select>
            </div>
          </div>

          <button data-testid="muhurat-find-btn" onClick={find} disabled={loading || !city}
                  className="btn" style={{ width: '100%' }}>
            {loading ? 'Finding…' : !city ? 'Enter a location to search' : 'Find auspicious dates →'}
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
                <div className="text-sm text-foreground mt-1">{d.nakshatra} Nakshatra · {d.tithiName} ({d.paksha}) · {d.yoga} <TermTip id="panchangYoga">Yoga</TermTip></div>
                <div className="text-xs text-muted-foreground mt-1">{d.reasons.slice(0, 2).join(' · ')}</div>
                <div className="text-xs text-amber-700 mt-1">Avoid the <TermTip id="rahuKalam">Rahu Kalam</TermTip> window that day: {d.rahuKalam.start}–{d.rahuKalam.end} (approx, local).</div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Scope: this evaluates each day’s Panchang at approximately local sunrise for your chosen location and reports the standard weekday Rahu Kalam. Finer intraday categories (<TermTip id="choghadiya">Choghadiya</TermTip>, <TermTip id="hora">Hora</TermTip>, exact-minute windows and personal-chart <TermTip id="chandrashtama">Chandrashtama</TermTip>) are a planned expansion. Treat Muhurat as classical guidance, not a guarantee.
        </p>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <Link className="brand" to="/">bornclock<span className="brand-dot">.</span></Link>
            <p className="subtle">Auspicious dates from the Panchang, computed for your own location and timezone.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to="/vedic-astrology">Vedic Astrology</Link>
            <Link to="/kundali">Kundali</Link>
            <Link to="/sade-sati">Sade Sati</Link>
            <Link to="/gemstones">Gemstones</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
        <div className="footer-bottom"><span>© 2026 BornClock · Vedic astrology, computed with care.</span></div>
      </footer>
    </div>
  );
}
