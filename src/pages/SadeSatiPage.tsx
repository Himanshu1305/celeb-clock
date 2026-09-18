/**
 * Sade Sati & Dhaiya standalone tool (Part I.10). Reuses the validated engine's
 * Sade Sati phase logic and turns it into real cycle START/END dates. Focused UI
 * around already-validated data, matching the other Vedic tool pages.
 */
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';

interface Cycle { start: string; end: string }
interface Report {
  moonSignName: string; active: boolean; phase: string | null;
  currentCycle: Cycle | null; nextCycle: Cycle | null; previousCycle: Cycle | null;
  methodology: string;
  dhaiya: { active: boolean; type: string | null; currentEnd: string | null };
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = (iso: string | null | undefined) => { if (!iso) return '—'; const d = new Date(iso); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const yearsFromNow = (iso: string | null | undefined) => { if (!iso) return null; const yrs = (new Date(iso).getTime() - Date.now()) / (365.25 * 24 * 3600 * 1000); return Math.max(0, Math.round(yrs * 10) / 10); };

/**
 * Part X — the approved impact-first Sade Sati narrative (verdict → plain impact →
 * evidence/dates → forward-looking close), built deterministically from the computed
 * report so the exact approved wording is guaranteed (not LLM-generated). Covers the
 * active (with Rising/Peak/Setting phase note) and inactive cases.
 */
function sadeSatiNarrative(r: Report): { verdict: string; body: string[] } {
  if (r.active) {
    const phaseKey = (r.phase || '').toLowerCase();
    const phaseNote = phaseKey.includes('rising')
      ? 'The Rising phase often brings the first pressures that set the stage for what follows.'
      : phaseKey.includes('peak')
        ? 'The Peak phase is typically the most demanding but also where the deepest growth happens.'
        : phaseKey.includes('setting')
          ? 'The Setting phase is where earlier effort starts paying off.'
          : '';
    const phaseLabel = r.phase ? r.phase.split(' (')[0] : 'current';
    const start = fmt(r.currentCycle?.start), end = fmt(r.currentCycle?.end);
    return {
      verdict: "You're currently in a Sade Sati period — and that's genuinely nothing to worry about.",
      body: [
        "Despite its reputation, this is one of the most misunderstood periods in Vedic astrology, and for good reason: it's far more often a season of real, lasting growth than the hardship people fear.",
        "Sade Sati refers to the roughly seven-and-a-half years when Saturn transits the signs before, on, and after your Moon sign. Saturn's themes are discipline, patience, and long-term reward — many people look back on their Sade Sati as the period that built their strongest foundations: real maturity, financial discipline, or a career that held up long after the effort of building it.",
        `You're specifically in the ${phaseLabel} phase, which began ${start} and runs until ${end}.${phaseNote ? ' ' + phaseNote : ''}`,
        "There's no need to brace for anything — just know that what you build now tends to last.",
      ],
    };
  }
  // Inactive case (approved template).
  const lines: string[] = [
    'Traditionally, Sade Sati periods bring pressure toward restructuring, added responsibility, or slower, harder-won progress. Since you\'re outside one currently, your day-to-day life isn\'t carrying that particular weight.',
  ];
  if (r.previousCycle) {
    lines.push(`Your last Sade Sati ran from ${fmt(r.previousCycle.start)} to ${fmt(r.previousCycle.end)} — if that stretch felt like a time of consolidation or slow, deliberate change, that lines up with the classical pattern.`);
  }
  if (r.nextCycle) {
    const away = yearsFromNow(r.nextCycle.start);
    lines.push(`Your next one begins in ${fmt(r.nextCycle.start)}, lasting until ${fmt(r.nextCycle.end)}${away !== null ? ` — that's about ${away} year${away === 1 ? '' : 's'} away, so there's no reason for concern now, just something to keep in mind well ahead of time.` : '.'}`);
  }
  return { verdict: "Good news — you're not in a Sade Sati period right now.", body: lines };
}

export default function SadeSatiPage() {
  const { profile, save } = useSavedProfile();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const run = async (d: BirthDetails) => {
    setLoading(true); setFailed(false); setReport(null);
    if (saveChecked) save({ dob: d.dob, time: d.time, city: d.city });
    try {
      const [y, m, day] = d.dob.split('-'); const [h, min] = (d.time || '12:00').split(':');
      const p = new URLSearchParams({ y, m, d: day, h, min, lat: String(d.city.lat), lon: String(d.city.lon), tz: String(d.city.tz) });
      const res = await fetch(`/api/sade-sati?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.moonSignName) throw new Error('unavailable');
      setReport(data as Report);
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  return (
    <div data-testid="sadesati-page" className="min-h-screen bg-gradient-cosmic">
      <SEO title="Sade Sati Calculator — Saturn's 7.5-Year Transit | BornClock"
        description="Free Sade Sati calculator — find whether Saturn's 7.5-year Sade Sati (or the 2.5-year Dhaiya) is active for you, which phase, and the real start and end dates of your current and next cycle."
        canonicalUrl="/sade-sati" ogType="website" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8"><Navigation /><AuthNav /></header>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Sade Sati Calculator</h1>
        <p className="text-muted-foreground mb-6">Saturn’s 7.5-year Sade Sati passes over the 12th, 1st and 2nd signs from your Moon. This tool shows whether it’s active for you now, which phase, and the real start/end dates — plus the 2.5-year Dhaiya (small Panoti).</p>

        <BirthDetailsForm initial={initial} submitLabel="Check my Sade Sati" loadingLabel="Calculating…" loading={loading} onSubmit={run} showSaveOption saveChecked={saveChecked} onSaveCheckedChange={setSaveChecked} testIdPrefix="sadesati" />
        {failed && <p className="text-sm text-muted-foreground mt-4">The service is temporarily unavailable. Please try again shortly.</p>}

        {report && (
          <div data-testid="sadesati-result" className="mt-6 space-y-4">
            <div className={`rounded-xl border p-5 text-center ${report.active ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="text-sm text-muted-foreground">Moon sign: {report.moonSignName}</div>
              <div className={`text-2xl font-black ${report.active ? 'text-amber-700' : 'text-emerald-700'}`}>
                {report.active ? 'Sade Sati is ACTIVE' : 'Sade Sati is not active right now'}
              </div>
              {report.active && report.phase && <div className="font-semibold text-foreground mt-1">Phase: {report.phase}</div>}
            </div>

            {/* Part X — impact-first approved narrative (verdict → plain impact → dates → close). */}
            {(() => { const n = sadeSatiNarrative(report); return (
              <div data-testid="sadesati-narrative" className="rounded-xl border border-border p-5">
                <p className="font-bold text-foreground mb-2">{n.verdict}</p>
                {n.body.map((para, i) => <p key={i} className="text-sm text-foreground leading-relaxed mb-2 last:mb-0">{para}</p>)}
              </div>
            ); })()}

            {report.active && report.currentCycle && (
              <div data-testid="sadesati-current" className="rounded-lg border border-border p-4">
                <div className="font-semibold text-foreground">Current Sade Sati cycle</div>
                <div className="text-sm text-foreground">{fmt(report.currentCycle.start)} → {fmt(report.currentCycle.end)}</div>
                <p className="text-xs text-muted-foreground mt-1">Saturn entered the 12th sign from your Moon and leaves the 2nd sign at the end date. Traditionally a period for patience, consolidation and reduced over-extension — a phase to move through steadily, not a verdict.</p>
              </div>
            )}

            {report.nextCycle && (
              <div data-testid="sadesati-next" className="rounded-lg border border-border p-4">
                <div className="font-semibold text-foreground">{report.active ? 'Following' : 'Next'} Sade Sati cycle</div>
                <div className="text-sm text-foreground">{fmt(report.nextCycle.start)} → {fmt(report.nextCycle.end)}</div>
              </div>
            )}

            {report.dhaiya.active && (
              <div data-testid="sadesati-dhaiya" className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="font-semibold text-foreground">Dhaiya (small Panoti) is active</div>
                <div className="text-sm text-foreground">{report.dhaiya.type} — until {fmt(report.dhaiya.currentEnd)}</div>
                <p className="text-xs text-muted-foreground mt-1">A 2.5-year Saturn transit (the 4th or 8th from your Moon), traditionally a lighter version of Sade Sati’s themes.</p>
              </div>
            )}

            <div data-testid="sadesati-methodology" className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="font-semibold text-foreground mb-1">How this was worked out</div>
              <p className="text-sm text-foreground">{report.methodology}</p>
            </div>

            <p className="text-xs text-muted-foreground">Dates are computed from Saturn’s real transit through the signs, using the same Lahiri-ayanamsa engine as the rest of BornClock. Treat Sade Sati as a classical timing indicator, not a fixed prediction.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
