import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { KundaliTabs } from '@/components/KundaliTabs';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { TermTip } from '@/components/vedic/TermTip';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import type { GunaMilanResult } from '@/lib/vedic/matchmaking';
import type { PoruthamResult } from '@/lib/vedic/porutham';
import { CityPicker } from '@/components/CityPicker';
import { birthQuery } from '@/lib/timezone/clientBirth';
import { METHOD_LINE } from '@/lib/timezone/birthTimezone';
import { type SavedCity, sanitizeName, NAME_MAX } from '@/services/savedProfile';
import { RemediesForFindings } from '@/components/vedic/Remedies';
import { findingsFromMatch } from '@/lib/vedic/remedies';

/** Map each koota's data key to its glossary (TermTip) id. */
const KOOTA_TERM: Record<string, string> = {
  varna: 'varna', vashya: 'vashya', tara: 'tara', yoni: 'yoni',
  graha_maitri: 'grahaMaitri', gana: 'gana', bhakoot: 'bhakoot', nadi: 'nadi',
};

interface TimingWindow { planet: string; level: string; range: string; status: string; describe: string }
interface ManglikMatch {
  aHasDosha: boolean; bHasDosha: boolean;
  aSeverity: string | null; bSeverity: string | null;
  status: 'clear' | 'mutual' | 'cancelled' | 'one-sided';
  /** One line per person: the Lagna check and the Moon check, shown separately. */
  checks?: string[];
  convention?: string;
  note: string;
}
interface MatchResponse {
  gunaMilan: GunaMilanResult;
  groom?: 'A' | 'B';
  warnings?: { samePerson?: boolean; minor?: boolean; samePersonNote?: string; minorNote?: string };
  porutham?: PoruthamResult | null;
  manglik?: ManglikMatch | null;
  synthesis?: { verdict: string; paragraphs: string[] } | null;
  timing: {
    personA: { significators: string[]; windows: TimingWindow[] };
    personB: { significators: string[]; windows: TimingWindow[] };
    overlaps: Array<{ range: string; aPlanet: string; bPlanet: string }>;
    note: string;
  };
  people: { a: MatchPerson; b: MatchPerson };
  method?: string;
}
/** Per-person transparency block returned by /api/kundali-match (fix-timezone-accuracy). */
interface MatchPerson {
  lagna: string; rashi: string; nakshatra: string; pada: number;
  lagnaDegree?: number; moonDegreeInSign?: number | null;
  timezone?: string; utcOffsetLabel?: string; timezoneSource?: string;
  notes?: string[];
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
  // M2: explicit groom (boy) / bride (girl). Ashtakoota and Porutham both depend on it.
  const [groom, setGroom] = useState<'A' | 'B'>('A');
  // M1: no future birth dates (local today, YYYY-MM-DD).
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  // M12: a clear message for input the server rejects (e.g. 30 February), not "unavailable".
  const [inputError, setInputError] = useState<string | null>(null);

  // Person A comes from the saved profile (incl. real birthplace) when present;
  // otherwise from the form. Person B is always entered fresh — now WITH birthplace.
  const effDobA = usingSaved ? profile!.dob : dobA;
  const effTimeA = usingSaved ? profile!.time : timeA;
  const coordsA: SavedCity | null = usingSaved ? profile!.city : cityA;
  const placeA = coordsA?.name ?? '';
  const placeB = cityB?.name ?? '';

  // Part P: OPTIONAL display names. Person A defaults to the saved profile's name
  // when reusing it; Person B is always entered fresh. Display/identification only —
  // never sent to the /api/kundali-match calculation. `withNames` is a pure display
  // transform of the computed report text; with no name it's a no-op (labels stay
  // "Person A/B"), so nothing breaks in the unnamed case.
  const dispA = sanitizeName(usingSaved ? (profile?.name ?? '') : nameA) || 'Person A';
  const dispB = sanitizeName(nameB) || 'Person B';
  const withNames = (s: string) => s.split('Person A').join(dispA).split('Person B').join(dispB);

  // Every person now needs date + time + a real birthplace (Part 1 accuracy fix).
  // M12: the date must exist on the calendar (no 30 February / 31 April).
  const realDate = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return false;
    const y = +m[1], mo = +m[2], d = +m[3];
    return mo >= 1 && mo <= 12 && d >= 1 && d <= new Date(Date.UTC(y, mo, 0)).getUTCDate();
  };
  const validA = usingSaved || (realDate(dobA) && dobA <= today && /^\d{2}:\d{2}$/.test(timeA) && !!cityA);
  const validB = realDate(dobB) && dobB <= today && /^\d{2}:\d{2}$/.test(timeB) && !!cityB;
  const futureDate = (!!dobA && dobA > today) || (!!dobB && dobB > today);
  const impossibleDate = (!usingSaved && /^\d{4}-\d{2}-\d{2}$/.test(dobA) && !realDate(dobA)) || (/^\d{4}-\d{2}-\d{2}$/.test(dobB) && !realDate(dobB));
  const canCalc = validA && validB;

  const calculate = async () => {
    if (!canCalc || !coordsA || !cityB) return;
    setLoading(true); setFailed(false); setInputError(null);
    try {
      const params = new URLSearchParams({
        ...birthQuery(effDobA, effTimeA, coordsA, 'A'),
        ...birthQuery(dobB, timeB, cityB, 'B'),
        groom,
      });
      const res = await fetch(`/api/kundali-match?${params.toString()}`);
      if (res.status === 400) {
        const body = await res.json().catch(() => null);
        setInputError(typeof body?.error === 'string' ? body.error : 'Please check the birth details entered.');
        return;
      }
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.gunaMilan) throw new Error('unavailable');
      setResult(data as MatchResponse);
    } catch { setFailed(true); }
    finally { setLoading(false); }
  };

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="kmatch-page"
      seo={(
        <SEO
          title="Kundali Matching — Free Guna Milan (Ashtakoota) | BornClock"
          description="Free Kundali matching by the 36-point Ashtakoota (Guna Milan) system — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi, with Nadi & Bhakoot dosha checks."
          canonicalUrl="/kundali-match"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Kundali Matching', edition: 'Ashtakoota · 36-point Guna Milan' }}
      footer={{
        tagline: 'Kundali matching by the traditional 36-point Ashtakoota system — computed, with every koota shown.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Sade Sati', to: '/sade-sati' },
          { label: 'Muhurat', to: '/muhurat' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
        <section className="section">
          <div className="section-head">
            <div><span className="eyebrow">Guna Milan</span><h1>Kundali Matching.</h1></div>
            <p>The traditional 36-point Ashtakoota system. {usingSaved ? 'Your details are already filled in — just add the second person.' : 'Enter both people’s birth date, birth time and birthplace — all three are needed for an accurate Moon Nakshatra — to see all eight kootas.'}</p>
          </div>

          <TrustStrip claim="The classical 36-point compatibility score (Ashtakoota) — all eight parts shown and added up in front of you, nothing hidden." href="/how-it-works#vedic" />
          <KundaliTabs active="match" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 print:hidden" style={{ marginTop: 16 }}>
          {/* Person A — saved profile if present, else a form */}
          {usingSaved ? (
            <div data-testid="kmatch-saved-a" className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/10 p-4 space-y-2">
              <div className="font-semibold text-[#6E5AA6]">You</div>
              <div className="text-sm text-[#6E5AA6]">★ {profile!.dob}, {profile!.time}<br />{profile!.city.name}</div>
              <button data-testid="kmatch-use-different-a" type="button"
                      onClick={() => { setUsingDifferent(true); setResult(null); }}
                      className="text-[#6E5AA6] underline text-sm hover:text-[#6E5AA6]">
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
              <input data-testid="kmatch-dob-a" type="date" value={dobA} max={today}
                     onChange={e => { setDobA(e.target.value); setResult(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person A date of birth" />
              <input data-testid="kmatch-time-a" type="time" value={timeA}
                     onChange={e => { setTimeA(e.target.value); setResult(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person A birth time" />
              <CityPicker testid="kmatch-city-a" value={cityA} dob={dobA} time={timeA} ariaLabel="Person A birth city" onPick={c => { setCityA(c); setResult(null); }} />
            </div>
          )}

          {/* Person B — always entered fresh, now including birthplace */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="font-semibold text-foreground">{usingSaved ? 'The other person' : 'Person B'}</div>
            <input data-testid="kmatch-name-b" type="text" value={nameB} maxLength={NAME_MAX}
                   onChange={e => { setNameB(e.target.value); setResult(null); }}
                   placeholder="Name (optional)" aria-label="Person B name"
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            <input data-testid="kmatch-dob-b" type="date" value={dobB} max={today}
                   onChange={e => { setDobB(e.target.value); setResult(null); }}
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person B date of birth" />
            <input data-testid="kmatch-time-b" type="time" value={timeB}
                   onChange={e => { setTimeB(e.target.value); setResult(null); }}
                   className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" aria-label="Person B birth time" />
            <CityPicker testid="kmatch-city-b" value={cityB} dob={dobB} time={timeB} ariaLabel="Person B birth city" onPick={c => { setCityB(c); setResult(null); }} />
          </div>
        </div>

        {/* M2: who is the groom (boy) and who is the bride (girl) */}
        <fieldset data-testid="kmatch-groom" className="rounded-xl border border-border p-4 mb-4 print:hidden">
          <legend className="px-1 text-sm font-semibold text-foreground">Who is the boy (groom) and who is the girl (bride)?</legend>
          <p className="text-xs text-muted-foreground mb-2">Kundali matching is read from the boy to the girl, so swapping them can change the score.</p>
          <div className="flex flex-col sm:flex-row gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input data-testid="kmatch-groom-a" type="radio" name="kmatch-groom" checked={groom === 'A'}
                     onChange={() => { setGroom('A'); setResult(null); }} />
              {usingSaved ? 'You' : dispA} = boy, {usingSaved ? 'the other person' : dispB} = girl
            </label>
            <label className="flex items-center gap-2">
              <input data-testid="kmatch-groom-b" type="radio" name="kmatch-groom" checked={groom === 'B'}
                     onChange={() => { setGroom('B'); setResult(null); }} />
              {usingSaved ? 'You' : dispA} = girl, {usingSaved ? 'the other person' : dispB} = boy
            </label>
          </div>
        </fieldset>
        {futureDate && <p data-testid="kmatch-future-date" className="subtle" style={{ marginBottom: 8 }}>A birth date cannot be in the future.</p>}
        {impossibleDate && <p data-testid="kmatch-invalid-date" className="subtle" style={{ marginBottom: 8 }}>That date does not exist on the calendar — please check the day and month.</p>}

        <button data-testid="kmatch-calculate-btn" onClick={calculate} disabled={!canCalc || loading}
                className="btn print:hidden" style={{ width: '100%', marginBottom: 8 }}>
          {loading ? 'Matching…' : 'Match Kundalis →'}
        </button>

        {inputError && <p data-testid="kmatch-input-error" className="subtle" style={{ marginTop: 12 }}>{inputError}</p>}
        {failed && <p className="subtle" style={{ marginTop: 12 }}>Matching service is temporarily unavailable. Please try again shortly.</p>}
        </section>

        <section className="section white">
        {result && (
          <div data-testid="kmatch-result" id="kmatch-report" className="space-y-5">
            <div className="flex justify-end print:hidden">
              <button data-testid="kmatch-print" type="button" onClick={() => window.print()}
                      className="text-sm px-3 py-1.5 rounded-lg border border-[#6E5AA6]/30 text-[#6E5AA6] hover:bg-[#6E5AA6]/10">
                ⤓ Download / Print PDF
              </button>
            </div>

            {result.warnings?.samePerson && (
              <p data-testid="kmatch-same-person" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">⚠️ {result.warnings.samePersonNote}</p>
            )}
            {result.warnings?.minor && (
              <p data-testid="kmatch-minor" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">⚠️ {result.warnings.minorNote}</p>
            )}

            <div className="text-center rounded-xl border border-border p-4">
              <div className="text-sm text-muted-foreground">Total Guna Milan</div>
              <div className="text-4xl font-black text-[#6E5AA6]">{result.gunaMilan.total} / 36</div>
              <div className="font-semibold text-foreground">{result.gunaMilan.compatibility}</div>
              <div data-testid="kmatch-people-line" className="text-xs text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{dispA}</span> ({(result.groom ?? 'A') === 'A' ? 'boy' : 'girl'}, {result.people.a.rashi}/{result.people.a.nakshatra})
                {' × '}
                <span className="font-medium text-foreground">{dispB}</span> ({(result.groom ?? 'A') === 'B' ? 'boy' : 'girl'}, {result.people.b.rashi}/{result.people.b.nakshatra})
              </div>
            </div>

            {/* Birth data actually used (fix-timezone-accuracy): place, zone + offset, Moon, Lagna. */}
            <div data-testid="kmatch-birth-data" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([['a', dispA, placeA, result.people.a], ['b', dispB, placeB, result.people.b]] as const).map(([k, disp, place, pp]) => (
                <div key={k} data-testid={`kmatch-person-${k}`} className="rounded-xl border border-border p-3 text-sm space-y-1">
                  <div className="font-semibold text-foreground">{disp}</div>
                  <div><span className="text-muted-foreground">Place used:</span> <span data-testid={`kmatch-place-${k}`}>{place}</span></div>
                  {pp.timezone && <div><span className="text-muted-foreground">Time zone:</span> <span data-testid={`kmatch-tz-${k}`}>{pp.timezone} · {pp.utcOffsetLabel}</span>{pp.timezoneSource === 'manual' ? ' (set manually)' : ''}</div>}
                  <div data-testid={`kmatch-moon-${k}`}><span className="text-muted-foreground">Moon:</span> {pp.rashi}{pp.moonDegreeInSign != null ? ` ${pp.moonDegreeInSign.toFixed(2)}°` : ''} · {pp.nakshatra} pada {pp.pada}</div>
                  <div data-testid={`kmatch-lagna-${k}`}><span className="text-muted-foreground">Lagna:</span> {pp.lagna}{pp.lagnaDegree != null ? ` ${pp.lagnaDegree.toFixed(2)}°` : ''}</div>
                  {(pp.notes || []).map((n, i) => (
                    <p key={i} data-testid={`kmatch-note-${k}`} className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{n}</p>
                  ))}
                </div>
              ))}
            </div>
            <p data-testid="kmatch-method" className="text-xs text-muted-foreground">{result.method || METHOD_LINE}</p>

            {/* Overall reading — narrative synthesis (Part M). Short synthesis first,
                details below — same structure as the Kundali reading. Degrades
                gracefully: if synthesis is absent, the factual breakdown still shows. */}
            {result.synthesis && (
              <div data-testid="kmatch-synthesis" className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/40 p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-wide text-[#6E5AA6] font-semibold">Overall reading</div>
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
            <table data-testid="kmatch-koota-table" className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead><tr className="text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Koota</th><th className="px-3 py-2 font-medium text-right">Points</th></tr></thead>
              <tbody>
                {result.gunaMilan.kootas.map(k => (
                  <tr key={k.key} data-testid={`kmatch-koota-row-${k.key}`} className="border-t border-border">
                    <td className="px-3 py-1.5 text-foreground">{k.label}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-foreground">{k.score} / {k.max}</td>
                  </tr>
                ))}
                <tr className="border-t border-border"><td className="px-3 py-1.5 font-semibold text-foreground">Total</td><td data-testid="kmatch-koota-total" className="px-3 py-1.5 text-right font-bold text-[#6E5AA6]">{result.gunaMilan.total} / 36</td></tr>
              </tbody>
            </table>

            <div data-testid="kmatch-kootas" className="space-y-2">
              <p className="text-xs text-muted-foreground">
                The eight parts of the <TermTip id="ashtakoota">Ashtakoota</TermTip> score — tap any name to see what it measures.
              </p>
              {result.gunaMilan.kootas.map(k => (
                <div key={k.key} className={`rounded-lg border p-3 ${k.heavy ? 'border-[#6E5AA6]/30 bg-[#6E5AA6]/50' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-foreground">
                      {k.heavy && <span title="Heaviest kootas" className="mr-1 text-[#6E5AA6]">★</span>}{KOOTA_TERM[k.key] ? <TermTip id={KOOTA_TERM[k.key]}>{k.label}</TermTip> : k.label}
                      {k.heavy && <span className="ml-2 text-[10px] uppercase tracking-wide text-[#6E5AA6]">high weight</span>}
                    </div>
                    <div className={`font-bold ${k.score === 0 ? 'text-amber-600' : 'text-[#6E5AA6]'}`}>{k.score} / {k.max}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{withNames(k.explanation)}</div>
                </div>
              ))}
            </div>

            {/* Manglik (Mangal Dosha) check inside matching (P2-7) */}
            {result.manglik && (
              <div data-testid="kmatch-manglik" className={`rounded-xl border p-4 text-sm ${result.manglik.status === 'one-sided' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                <div className="font-semibold mb-1">{result.manglik.status === 'one-sided' ? '⚠️' : '✓'} <TermTip id="manglik">Manglik</TermTip> check</div>
                <p>{withNames(result.manglik.note)}</p>
                {result.manglik.checks && (
                  <ul data-testid="kmatch-manglik-checks" className="mt-2 list-disc pl-5 space-y-0.5 text-xs">
                    {result.manglik.checks.map((c, i) => <li key={i}>{withNames(c)}</li>)}
                  </ul>
                )}
                {result.manglik.convention && <p className="mt-1 text-xs opacity-80">{result.manglik.convention}</p>}
              </div>
            )}

            {/* Batch 5: what each uncancelled matching dosha means + what the couple can do. */}
            <RemediesForFindings testid="kmatch-remedies" findings={findingsFromMatch(result.gunaMilan.doshas, result.manglik?.status)} />

            {/* 10-Porutham (South Indian) view alongside the 36-guna Ashtakoota (P2-7 / GP2-10PORUTHAM) */}
            {result.porutham && (
              <details data-testid="kmatch-porutham" className="rounded-xl border border-[#6E5AA6]/30 p-4">
                <summary className="cursor-pointer font-semibold text-foreground">
                  South-Indian 10-Porutham view — {result.porutham.metCount}/10 met · {result.porutham.verdict}
                </summary>
                <p className="text-xs text-muted-foreground mt-2">
                  The Dravidian (Tamil) matching system used across South India and Sri Lanka. Rajju and Dina are the make-or-break poruthams.
                </p>
                <div className="mt-2 space-y-2">
                  {result.porutham.poruthams.map(p => (
                    <div key={p.key} className={`rounded-lg border p-3 ${p.essential ? 'border-[#6E5AA6]/30 bg-[#6E5AA6]/10' : 'border-border'}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-foreground">
                          {p.essential && <span title="Essential porutham" className="mr-1 text-[#6E5AA6]">★</span>}{p.label}
                        </div>
                        <div className={`font-bold ${p.met ? 'text-[#6E5AA6]' : 'text-amber-600'}`}>{p.met ? '✓ met' : '✕ not met'}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{p.explanation}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{result.porutham.methodology}</p>
              </details>
            )}

            {/* Marriage-timing windows (Part 2.5) — reuses the D-Fix3 activation engine */}
{!result.warnings?.minor && (
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
                <div><div className="font-medium text-foreground">{dispA}</div>{result.timing.personA.windows.length ? result.timing.personA.windows.slice(0, 2).map((w, i) => <div key={i} className="text-muted-foreground">{w.describe}</div>) : <div className="text-muted-foreground">—</div>}</div>
                <div><div className="font-medium text-foreground">{dispB}</div>{result.timing.personB.windows.length ? result.timing.personB.windows.slice(0, 2).map((w, i) => <div key={i} className="text-muted-foreground">{w.describe}</div>) : <div className="text-muted-foreground">—</div>}</div>
              </div>
            </div>
            )}

                        {/* Methodology disclosure (Part 2.4) */}
            <details data-testid="kmatch-methodology" className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">How this is calculated (methodology)</summary>
              <p className="mt-2">{result.gunaMilan.methodology}</p>
            </details>

            <Link to="/articles/kundali-compatibility" className="text-[#6E5AA6] hover:underline text-sm print:hidden">Learn what each koota means →</Link>
          </div>
        )}

        <p className="subtle" style={{ marginTop: 24 }}>
          Read the full <Link to="/articles/kundali-compatibility" className="textlink">Kundali compatibility guide</Link>.
        </p>
        </section>
    </PajPage>
  );
}
