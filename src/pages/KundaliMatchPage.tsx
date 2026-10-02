import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { SEO } from '@/components/SEO';
import { KundaliTabs } from '@/components/KundaliTabs';
import '@/styles/part-aj.css';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import type { GunaMilanResult } from '@/lib/vedic/matchmaking';
import { geocodeCity, type GeoResult } from '@/services/geocoding';
import { type SavedCity, sanitizeName, NAME_MAX } from '@/services/savedProfile';

interface TimingWindow { planet: string; level: string; range: string; status: string; describe: string }
interface MatchResponse {
  gunaMilan: GunaMilanResult;
  synthesis?: { verdict: string; paragraphs: string[] } | null;
  timing: {
    personA: { significators: string[]; windows: TimingWindow[] };
    personB: { significators: string[]; windows: TimingWindow[] };
    overlaps: Array<{ range: string; aPlanet: string; bPlanet: string }>;
    note: string;
  };
  people: { a: { lagna: string; rashi: string; nakshatra: string; pada: number }; b: { lagna: string; rashi: string; nakshatra: string; pada: number } };
}

function partsFor(dob: string, time: string, coords: { lat: number; lon: number; tz: number }, suffix: string): Record<string, string> {
  const [y, m, d] = dob.split('-');
  const [h, min] = (time || '12:00').split(':');
  return {
    ['y' + suffix]: y, ['m' + suffix]: m, ['d' + suffix]: d, ['h' + suffix]: h, ['min' + suffix]: min,
    ['lat' + suffix]: String(coords.lat), ['lon' + suffix]: String(coords.lon), ['tz' + suffix]: String(coords.tz),
  };
}

/** Inline birth-city picker (Part 1) — reuses the same geocoding service the
 * Kundali form uses, so both people's real birthplaces are collected (previously
 * Person B was silently hardcoded to Delhi, producing wrong Lagna/house results). */
function CityPicker({ testid, value, onPick }: { testid: string; value: SavedCity | null; onPick: (c: SavedCity | null) => void }) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [options, setOptions] = useState<GeoResult[]>([]);
  const onChange = async (v: string) => {
    setQuery(v); onPick(null);
    if (v.trim().length >= 3) { try { setOptions(await geocodeCity(v)); } catch { setOptions([]); } }
    else setOptions([]);
  };
  return (
    <div className="relative">
      <input data-testid={testid} type="text" value={query} onChange={e => onChange(e.target.value)} placeholder="Birth city (e.g. Delhi)"
             className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Birth city" />
      {options.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
          {options.map((o, i) => (
            <li key={`${o.name}-${i}`}>
              <button type="button" onClick={() => { onPick({ name: o.name, lat: o.lat, lon: o.lon, tz: o.utcOffset }); setQuery(o.name); setOptions([]); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-gray-900">
                {o.name}{o.state ? `, ${o.state}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function KundaliMatchPage() {
  const { profile, isFull } = useSavedProfile();
  const [usingDifferent, setUsingDifferent] = useState(false);
  // Progressive (Part J): reuse Person A outright ONLY when the saved profile is full;
  // a partial (date-only) profile pre-fills Person A's date and asks for the rest.
  const usingSaved = isFull && !usingDifferent;
  const hasPartial = !!profile && !isFull && !usingDifferent;

  const [dobA, setDobA] = useState(hasPartial ? profile!.dob : '');
  const [timeA, setTimeA] = useState('');
  const [cityA, setCityA] = useState<SavedCity | null>(null);
  const [nameA, setNameA] = useState('');
  const [dobB, setDobB] = useState('');
  const [timeB, setTimeB] = useState('');
  const [cityB, setCityB] = useState<SavedCity | null>(null);
  const [nameB, setNameB] = useState('');
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // Person A comes from the saved profile (incl. real birthplace) when present;
  // otherwise from the form. Person B is always entered fresh — now WITH birthplace.
  const effDobA = usingSaved ? profile!.dob : dobA;
  const effTimeA = usingSaved ? profile!.time : timeA;
  const coordsA = usingSaved ? { lat: profile!.city.lat, lon: profile!.city.lon, tz: profile!.city.tz } : cityA;

  // Part P: OPTIONAL display names. Person A defaults to the saved profile's name
  // when reusing it; Person B is always entered fresh. Display/identification only —
  // never sent to the /api/kundali-match calculation. `withNames` is a pure display
  // transform of the computed report text; with no name it's a no-op (labels stay
  // "Person A/B"), so nothing breaks in the unnamed case.
  const dispA = sanitizeName(usingSaved ? (profile?.name ?? '') : nameA) || 'Person A';
  const dispB = sanitizeName(nameB) || 'Person B';
  const withNames = (s: string) => s.split('Person A').join(dispA).split('Person B').join(dispB);

  // Every person now needs date + time + a real birthplace (Part 1 accuracy fix).
  const validA = usingSaved || (/^\d{4}-\d{2}-\d{2}$/.test(dobA) && /^\d{2}:\d{2}$/.test(timeA) && !!cityA);
  const validB = /^\d{4}-\d{2}-\d{2}$/.test(dobB) && /^\d{2}:\d{2}$/.test(timeB) && !!cityB;
  const canCalc = validA && validB;

  const calculate = async () => {
    if (!canCalc || !coordsA || !cityB) return;
    setLoading(true); setFailed(false);
    try {
      const params = new URLSearchParams({
        ...partsFor(effDobA, effTimeA, coordsA, 'A'),
        ...partsFor(dobB, timeB, cityB, 'B'),
      });
      const res = await fetch(`/api/kundali-match?${params.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.gunaMilan) throw new Error('unavailable');
      setResult(data as MatchResponse);
    } catch { setFailed(true); }
    finally { setLoading(false); }
  };

  return (
    <div data-testid="kmatch-page" className="paj editorial" data-category="vedic">
      <SEO
        title="Kundali Matching — Free Guna Milan (Ashtakoota) | BornClock"
        description="Free Kundali matching by the 36-point Ashtakoota (Guna Milan) system — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi, with Nadi & Bhakoot dosha checks."
        canonicalUrl="/kundali-match"
        ogType="website"
      />
      <header className="site-header print:hidden" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Navigation />
        <AuthNav />
      </header>
      <div className="breadcrumb">
        <div><span className="crumb-parent">BornClock&nbsp; /&nbsp; <Link to="/vedic-astrology" className="textlink">Vedic Astrology</Link>&nbsp; /&nbsp; </span><span className="crumb-name">Kundali Matching</span></div>
        <div className="edition"><span className="dot" />Ashtakoota · 36-point Guna Milan</div>
      </div>
      <main id="main">
        <section className="section">
          <div className="section-head">
            <div><span className="eyebrow">Guna Milan</span><h1>Kundali Matching.</h1></div>
            <p>The traditional 36-point Ashtakoota system. {usingSaved ? 'Your details are already filled in — just add the second person.' : 'Enter both birth dates (and times for accurate Nakshatra) to see all eight kootas.'}</p>
          </div>

          <KundaliTabs active="match" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 print:hidden" style={{ marginTop: 16 }}>
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
              <input data-testid="kmatch-name-a" type="text" value={nameA} maxLength={NAME_MAX}
                     onChange={e => { setNameA(e.target.value); setResult(null); }}
                     placeholder="Name (optional)" aria-label="Person A name"
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
              <input data-testid="kmatch-dob-a" type="date" value={dobA}
                     onChange={e => { setDobA(e.target.value); setResult(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person A date of birth" />
              <input data-testid="kmatch-time-a" type="time" value={timeA}
                     onChange={e => { setTimeA(e.target.value); setResult(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person A birth time" />
              <CityPicker testid="kmatch-city-a" value={cityA} onPick={c => { setCityA(c); setResult(null); }} />
            </div>
          )}

          {/* Person B — always entered fresh, now including birthplace */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="font-semibold text-foreground">{usingSaved ? 'The other person' : 'Person B'}</div>
            <input data-testid="kmatch-name-b" type="text" value={nameB} maxLength={NAME_MAX}
                   onChange={e => { setNameB(e.target.value); setResult(null); }}
                   placeholder="Name (optional)" aria-label="Person B name"
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            <input data-testid="kmatch-dob-b" type="date" value={dobB}
                   onChange={e => { setDobB(e.target.value); setResult(null); }}
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person B date of birth" />
            <input data-testid="kmatch-time-b" type="time" value={timeB}
                   onChange={e => { setTimeB(e.target.value); setResult(null); }}
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person B birth time" />
            <CityPicker testid="kmatch-city-b" value={cityB} onPick={c => { setCityB(c); setResult(null); }} />
          </div>
        </div>

        <button data-testid="kmatch-calculate-btn" onClick={calculate} disabled={!canCalc || loading}
                className="btn print:hidden" style={{ width: '100%', marginBottom: 8 }}>
          {loading ? 'Matching…' : 'Match Kundalis →'}
        </button>

        {failed && <p className="subtle" style={{ marginTop: 12 }}>Matching service is temporarily unavailable. Please try again shortly.</p>}
        </section>

        <section className="section white">
        {result && (
          <div data-testid="kmatch-result" id="kmatch-report" className="space-y-5">
            <div className="flex justify-end print:hidden">
              <button data-testid="kmatch-print" type="button" onClick={() => window.print()}
                      className="text-sm px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                ⤓ Download / Print PDF
              </button>
            </div>

            <div className="text-center rounded-xl border border-border p-4">
              <div className="text-sm text-muted-foreground">Total Guna Milan</div>
              <div className="text-4xl font-black text-indigo-600">{result.gunaMilan.total} / 36</div>
              <div className="font-semibold text-foreground">{result.gunaMilan.compatibility}</div>
              <div data-testid="kmatch-people-line" className="text-xs text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{dispA}</span> ({result.people.a.rashi}/{result.people.a.nakshatra})
                {' × '}
                <span className="font-medium text-foreground">{dispB}</span> ({result.people.b.rashi}/{result.people.b.nakshatra})
              </div>
            </div>

            {/* Overall reading — narrative synthesis (Part M). Short synthesis first,
                details below — same structure as the Kundali reading. Degrades
                gracefully: if synthesis is absent, the factual breakdown still shows. */}
            {result.synthesis && (
              <div data-testid="kmatch-synthesis" className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-wide text-indigo-600 font-semibold">Overall reading</div>
                <p className="font-semibold text-foreground">{withNames(result.synthesis.verdict)}</p>
                {result.synthesis.paragraphs.map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground">{withNames(para)}</p>
                ))}
              </div>
            )}

            {/* Doshas with cancellation transparency (Part 2.2) */}
            {result.gunaMilan.doshas.some(d => d.present) && (
              <div data-testid="kmatch-doshas" className="space-y-2">
                {result.gunaMilan.doshas.filter(d => d.present).map(d => (
                  <div key={d.name} className={`rounded-lg border p-3 text-sm ${d.cancelled ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <span className="font-semibold">{d.cancelled ? '✓' : '⚠️'} {d.name}{d.cancelled ? ' — cancelled' : ''}:</span> {withNames(d.reason)}
                  </div>
                ))}
              </div>
            )}

            {/* Full 8-Koota breakdown (Part 2.1) with Nadi/Bhakoot emphasis (Part 2.3) */}
            <div data-testid="kmatch-kootas" className="space-y-2">
              {result.gunaMilan.kootas.map(k => (
                <div key={k.key} className={`rounded-lg border p-3 ${k.heavy ? 'border-indigo-300 bg-indigo-50/50' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-foreground">
                      {k.heavy && <span title="Heaviest kootas" className="mr-1 text-indigo-600">★</span>}{k.label}
                      {k.heavy && <span className="ml-2 text-[10px] uppercase tracking-wide text-indigo-600">high weight</span>}
                    </div>
                    <div className={`font-bold ${k.score === 0 ? 'text-amber-600' : 'text-indigo-600'}`}>{k.score} / {k.max}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{withNames(k.explanation)}</div>
                </div>
              ))}
            </div>

            {/* Marriage-timing windows (Part 2.5) — reuses the D-Fix3 activation engine */}
            <div data-testid="kmatch-timing" className="rounded-xl border border-border p-4 space-y-2">
              <div className="font-semibold text-foreground">Favourable marriage-timing windows</div>
              <p className="text-xs text-muted-foreground">{result.timing.note}</p>
              {result.timing.overlaps.length > 0 ? (
                <div className="text-sm text-foreground">
                  <div className="font-medium mb-1">When BOTH charts are favourable (strongest):</div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {result.timing.overlaps.map((o, i) => (
                      <li key={i}><span className="font-medium">{o.range}</span> <span className="text-muted-foreground">({dispA}’s {o.aPlanet} period overlapping {dispB}’s {o.bPlanet} period)</span></li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No overlapping favourable window in the near future — each person’s individual windows are listed below.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
                <div><div className="font-medium text-foreground">{dispA}</div>{result.timing.personA.windows.slice(0, 2).map((w, i) => <div key={i} className="text-muted-foreground">{w.describe}</div>) || '—'}</div>
                <div><div className="font-medium text-foreground">{dispB}</div>{result.timing.personB.windows.slice(0, 2).map((w, i) => <div key={i} className="text-muted-foreground">{w.describe}</div>) || '—'}</div>
              </div>
            </div>

            {/* Methodology disclosure (Part 2.4) */}
            <details data-testid="kmatch-methodology" className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">How this is calculated (methodology)</summary>
              <p className="mt-2">{result.gunaMilan.methodology}</p>
            </details>

            <Link to="/articles/kundali-compatibility" className="text-indigo-600 hover:underline text-sm print:hidden">Learn what each koota means →</Link>
          </div>
        )}

        <p className="subtle" style={{ marginTop: 24 }}>
          Read the full <Link to="/articles/kundali-compatibility" className="textlink">Kundali compatibility guide</Link>.
        </p>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <Link className="brand" to="/">bornclock<span className="brand-dot">.</span></Link>
            <p className="subtle">Kundali matching by the traditional 36-point Ashtakoota system — computed, with every koota shown.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to="/vedic-astrology">Vedic Astrology</Link>
            <Link to="/kundali">Kundali</Link>
            <Link to="/sade-sati">Sade Sati</Link>
            <Link to="/muhurat">Muhurat</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
        <div className="footer-bottom"><span>© 2026 BornClock · Vedic astrology, computed with care.</span></div>
      </footer>
    </div>
  );
}
