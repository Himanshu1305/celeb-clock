/**
 * Sade Sati & Dhaiya standalone tool (Part I.10). Reuses the validated engine's
 * Sade Sati phase logic and turns it into real cycle START/END dates. Focused UI
 * around already-validated data, matching the other Vedic tool pages.
 */
import { useState } from 'react';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { birthQuery } from '@/lib/timezone/clientBirth';
import { Remedies } from '@/components/vedic/Remedies';
import { IST_ZONE, zoneDay, zoneMonth, zoneLabel } from '@/lib/viewerTime';
import { useViewerTimeZone } from '@/hooks/useViewerTimeZone';

interface Pause { start: string; end: string }
interface Cycle { start: string; end: string; pauses?: Pause[]; startedBeforeBirth?: boolean }
export interface Report {
  moonSignName: string; active: boolean; phase: string | null;
  currentPhase?: { start: string; end: string } | null;
  currentCycle: Cycle | null; nextCycle: Cycle | null; previousCycle: Cycle | null;
  paused?: { since: string; resumes: string } | null;
  ageYears?: number;
  /** D8: true only when the full-chart gemstone logic recommends Saturn's stone (adults). */
  blueSapphireOk?: boolean;
  methodology: string;
  dhaiya: { active: boolean; type: string | null; currentEnd: string | null };
}
// Dates are shown in the viewer's own time zone (labelled); India — and any viewer whose
// zone can't be read — sees Indian Standard Time, the convention of Indian almanacs.
// The instants from the API are unchanged; only their display zone differs.
let VIEW_TZ = IST_ZONE; // set per render by the page / narrative
const fmt = (iso: string) => zoneMonth(iso, VIEW_TZ);
const fmtDay = (iso: string) => zoneDay(iso, VIEW_TZ);
const yearsFromNow = (iso: string | null | undefined) => { if (!iso) return null; const yrs = (new Date(iso).getTime() - Date.now()) / (365.25 * 24 * 3600 * 1000); return Math.max(0, Math.round(yrs * 10) / 10); };
const isChild = (r: Report) => typeof r.ageYears === 'number' && r.ageYears < 18;

/** "Paused 3 June 2027 – 20 October 2027" lines for a cycle's retrograde pauses (audit D2). */
function pauseText(c: Cycle): string {
  const ps = c.pauses ?? [];
  if (!ps.length) return '';
  return ` Saturn's retrograde motion pauses it ${ps.map(p => `from ${fmtDay(p.start)} to ${fmtDay(p.end)}`).join(' and ')}.`;
}

/**
 * Part X — the approved impact-first Sade Sati narrative (verdict → plain impact →
 * evidence/dates → forward-looking close), built deterministically from the computed
 * report so the exact approved wording is guaranteed (not LLM-generated). Covers the
 * active (with Rising/Peak/Setting phase note), paused and inactive cases. Every date
 * slot is guarded so the text can never render a blank "—" (audit D3).
 */
export function sadeSatiNarrative(r: Report, tz: string = IST_ZONE): { verdict: string; body: string[] } {
  VIEW_TZ = tz;
  const child = isChild(r);
  const growthLine = child
    ? "Sade Sati refers to the roughly seven-and-a-half years when Saturn transits the signs before, on, and after the Moon sign. For a child, the tradition reads it mostly through the home: steady routines, patient support with studies and habits, and a calm family rhythm are what matter — there is nothing for a child to fear or fix."
    : "Sade Sati refers to the roughly seven-and-a-half years when Saturn transits the signs before, on, and after your Moon sign. Saturn's themes are discipline, patience, and long-term reward — many people look back on their Sade Sati as the period that built their strongest foundations: real maturity, financial discipline, or a career that held up long after the effort of building it.";
  const cycleLine = (c: Cycle) => c.startedBeforeBirth
    ? `This cycle was already under way when you were born (Saturn entered the 12th sign from your Moon in ${fmt(c.start)}) and it ends in ${fmt(c.end)}.${pauseText(c)}`
    : `The full cycle runs from ${fmt(c.start)} to ${fmt(c.end)}.${pauseText(c)}`;
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
    const phaseDates = r.currentPhase ? `, which began ${fmtDay(r.currentPhase.start)} and runs until ${fmtDay(r.currentPhase.end)}` : '';
    const body = [
      "Despite its reputation, this is one of the most misunderstood periods in Vedic astrology, and for good reason: it's far more often a season of real, lasting growth than the hardship people fear.",
      growthLine,
      `You're specifically in the ${phaseLabel} phase${phaseDates}.${phaseNote ? ' ' + phaseNote : ''}`,
    ];
    if (r.currentCycle) body.push(cycleLine(r.currentCycle));
    body.push("There's no need to brace for anything — just know that what you build now tends to last.");
    return { verdict: "You're currently in a Sade Sati period — and that's genuinely nothing to worry about.", body };
  }
  if (r.paused && r.currentCycle) {
    return {
      verdict: 'Your Sade Sati is paused right now — Saturn has stepped out of the three signs for a few months.',
      body: [
        `Saturn's retrograde loop has taken it temporarily outside the 12th, 1st and 2nd signs from your Moon since ${fmtDay(r.paused.since)}. It moves back on ${fmtDay(r.paused.resumes)}, when the last stretch of this Sade Sati resumes.`,
        cycleLine(r.currentCycle),
        growthLine,
      ],
    };
  }
  // Inactive case (approved template).
  const lines: string[] = [
    child
      ? 'Traditionally, Sade Sati periods are read as times that call for extra patience and structure. Since this chart is outside one currently, that particular theme is not in play.'
      : 'Traditionally, Sade Sati periods bring pressure toward restructuring, added responsibility, or slower, harder-won progress. Since you\'re outside one currently, your day-to-day life isn\'t carrying that particular weight.',
  ];
  if (r.previousCycle) {
    const c = r.previousCycle;
    lines.push(c.startedBeforeBirth
      ? `Your last Sade Sati was already under way when you were born and ended in ${fmt(c.end)}.`
      : `Your last Sade Sati ran from ${fmt(c.start)} to ${fmt(c.end)} — if that stretch felt like a time of consolidation or slow, deliberate change, that lines up with the classical pattern.`);
  }
  if (r.nextCycle) {
    const away = yearsFromNow(r.nextCycle.start);
    lines.push(`Your next one begins in ${fmt(r.nextCycle.start)}, lasting until ${fmt(r.nextCycle.end)}${away !== null ? ` — that's about ${away} year${away === 1 ? '' : 's'} away, so there's no reason for concern now, just something to keep in mind well ahead of time.` : '.'}`);
  }
  return { verdict: "Good news — you're not in a Sade Sati period right now.", body: lines };
}

export default function SadeSatiPage() {
  const { profile, save } = useSavedProfile();
  const viewerTz = useViewerTimeZone();
  VIEW_TZ = viewerTz;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const run = async (d: BirthDetails) => {
    setLoading(true); setFailed(false); setReport(null);
    if (saveChecked) save({ dob: d.dob, time: d.time, city: d.city });
    try {
      // fix-timezone-accuracy: shared birth params (zone from the birthplace, DST-correct).
      const p = new URLSearchParams(birthQuery(d.dob, d.time, d.city));
      const res = await fetch(`/api/sade-sati?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.moonSignName) throw new Error('unavailable');
      setReport(data as Report);
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="sadesati-page"
      seo={(
        <SEO title="Sade Sati Calculator — Saturn's 7.5-Year Transit | BornClock"
          description="Free Sade Sati calculator — find whether Saturn's 7.5-year Sade Sati (or the 2.5-year Dhaiya) is active for you, which phase, and the real start and end dates of your current and next cycle."
          canonicalUrl="/sade-sati" ogType="website" />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Sade Sati', edition: 'Shani · Saturn transit' }}
      footer={{
        tagline: 'Sade Sati from Saturn’s real transit — the same Lahiri-ayanamsa engine as the rest of BornClock.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Muhurat', to: '/muhurat' },
          { label: 'Gemstones', to: '/gemstones' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
        <section className="section">
          <div className="section-head">
            <div><span className="eyebrow">Shani · Saturn transit</span><h1>Sade Sati Calculator.</h1></div>
            <p>Saturn’s 7.5-year Sade Sati passes over the 12th, 1st and 2nd signs from your Moon — this shows whether it’s active now, which phase, the real start/end dates, plus the 2.5-year Dhaiya (small Panoti).</p>
          </div>
          {/* Batch 8: dated claim backed by /accuracy (src/lib/accuracy/evidence.ts). */}
          <TrustStrip claim="Worked out from where Saturn actually is relative to your Moon sign, not a lookup table. In our tests (October 2026), the Sade Sati status matched Swiss Ephemeris Saturn positions for all 22 test births." href="/accuracy" linkLabel="How we check accuracy" />
          <div className="form-band" style={{ marginTop: 16 }}>
            <div><h3>Your birth details</h3><p className="small muted">We use your Moon sign to locate Saturn’s transit.</p></div>
            <BirthDetailsForm initial={initial} submitLabel="Check my Sade Sati" loadingLabel="Calculating…" loading={loading} onSubmit={run} showSaveOption saveChecked={saveChecked} onSaveCheckedChange={setSaveChecked} testIdPrefix="sadesati" />
          </div>
        {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

        {report && (
          <div data-testid="sadesati-result" className="mt-6 space-y-4">
            <div className={`rounded-xl border p-5 text-center ${report.active || report.paused ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="text-sm text-muted-foreground"><TermTip id="rashi">Moon sign</TermTip>: {report.moonSignName}</div>
              <div className={`text-2xl font-black ${report.active || report.paused ? 'text-amber-700' : 'text-emerald-700'}`}>
                <TermTip id="sadeSati">Sade Sati</TermTip>{report.active ? ' is ACTIVE' : report.paused ? ' is paused right now' : ' is not active right now'}
              </div>
              {report.paused && <div className="font-semibold text-foreground mt-1">Resumes {fmtDay(report.paused.resumes)}</div>}
              {report.active && report.phase && <div className="font-semibold text-foreground mt-1"><TermTip id="sadeSatiPhase">Phase</TermTip>: {report.phase}</div>}
            </div>

            {/* Part X — impact-first approved narrative (verdict → plain impact → dates → close). */}
            {(() => { const n = sadeSatiNarrative(report, viewerTz); return (
              <div data-testid="sadesati-narrative" className="rounded-xl border border-border p-5">
                <p className="font-bold text-foreground mb-2">{n.verdict}</p>
                {n.body.map((para, i) => <p key={i} className="text-sm text-foreground leading-relaxed mb-2 last:mb-0">{para}</p>)}
              </div>
            ); })()}

            {(report.active || report.paused) && report.currentCycle && (
              <div data-testid="sadesati-current" className="rounded-lg border border-border p-4">
                <div className="font-semibold text-foreground">Current Sade Sati cycle</div>
                <div className="text-sm text-foreground">{fmt(report.currentCycle.start)} → {fmt(report.currentCycle.end)}{report.currentCycle.startedBeforeBirth ? ' (began before your birth)' : ''}</div>
                {(report.currentCycle.pauses ?? []).map((p, i) => (
                  <div key={i} data-testid="sadesati-pause" className="text-xs text-muted-foreground">Paused {fmtDay(p.start)} – {fmtDay(p.end)} (Saturn retrograde, briefly outside the three signs)</div>
                ))}
                <p className="text-xs text-muted-foreground mt-1">Saturn first entered the 12th sign from your Moon at the start date and makes its final exit from the 2nd sign at the end date. Traditionally a period for patience, consolidation and reduced over-extension — a phase to move through steadily, not a verdict.</p>
              </div>
            )}

            {report.nextCycle && (
              <div data-testid="sadesati-next" className="rounded-lg border border-border p-4">
                <div className="font-semibold text-foreground">{report.active || report.paused ? 'Following' : 'Next'} Sade Sati cycle</div>
                <div className="text-sm text-foreground">{fmt(report.nextCycle.start)} → {fmt(report.nextCycle.end)}</div>
                {(report.nextCycle.pauses ?? []).map((p, i) => (
                  <div key={i} className="text-xs text-muted-foreground">Paused {fmtDay(p.start)} – {fmtDay(p.end)}</div>
                ))}
              </div>
            )}

            {report.dhaiya.active && (
              <div data-testid="sadesati-dhaiya" className="rounded-lg border border-[#6E5AA6]/30 bg-[#6E5AA6]/50 p-4">
                <div className="font-semibold text-foreground"><TermTip id="dhaiya">Dhaiya (small Panoti)</TermTip> is active</div>
                <div className="text-sm text-foreground">{report.dhaiya.type}{report.dhaiya.currentEnd ? ` — until ${fmtDay(report.dhaiya.currentEnd)}` : ''}</div>
                <p className="text-xs text-muted-foreground mt-1">A 2.5-year Saturn transit (the 4th or 8th from your Moon), traditionally a lighter version of Sade Sati’s themes.</p>
              </div>
            )}

            <div data-testid="sadesati-methodology" className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/40 p-4">
              <div className="font-semibold text-foreground mb-1">How this was worked out</div>
              <p className="text-sm text-foreground">{report.methodology}</p>
            </div>

            {/* Part AI — calm, optional upay/remedies section (non-fear-based). */}
            <div data-testid="sadesati-upay" className="rounded-xl border border-border p-5">
              <div className="font-semibold text-foreground mb-1">Traditional upay (remedies) — optional, not required</div>
              <p className="text-sm text-muted-foreground mb-2">
                First, the honest part: <strong className="text-foreground">nothing here is necessary to "avoid harm"</strong> — Sade Sati is a period to move through steadily, not a threat to defend against. These are simply the customs people have found grounding during Saturn periods, offered for interest.
              </p>
              {report.blueSapphireOk && (
                <p data-testid="sadesati-gem" className="text-sm text-muted-foreground mb-2"><strong className="text-foreground">Gemstone (with caution)</strong> — your full chart does favour Saturn, so a Blue Sapphire (<TermTip id="ratna">Ratna</TermTip>), Saturn’s classical stone, is an option. It is a powerful stone: traditionally worn on a short trial first, and only after a qualified astrologer has checked your chart. Never for anyone under 18. See the <a href="/gemstones" className="text-primary hover:underline">Gemstone tool</a> for the full reasoning.</p>
              )}
              {/* Batch 5: the shared Remedies block for whichever Saturn period is running. */}
              {(report.active || report.paused) && (
                <Remedies remedyKey="sadeSati" testid="sadesati-remedies" label={{ en: 'Sade Sati — what it means and what you can do', hi: 'साढ़ेसाती — अर्थ और उपाय' }} />
              )}
              {report.dhaiya.active && (
                <div className="mt-3"><Remedies remedyKey="dhaiya" testid="dhaiya-remedies" label={{ en: 'Dhaiya — what it means and what you can do', hi: 'ढैया — अर्थ और उपाय' }} /></div>
              )}
              {!(report.active || report.paused) && !report.dhaiya.active && (
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li><strong className="text-foreground">Lean into Saturn’s own themes</strong> — patience, routine, honest hard work and finishing what you start. This is the most-cited "remedy" and the one that actually matches the period.</li>
                  <li><strong className="text-foreground">Service &amp; generosity</strong> — helping elders, workers or those in need on a Saturday is a traditional Saturn practice many find genuinely centring.</li>
                  <li>Full, sourced remedies for when a Saturn period does arrive: <a href="/remedies/sade-sati" className="text-primary hover:underline">Sade Sati</a> · <a href="/remedies/shani-dhaiya" className="text-primary hover:underline">Dhaiya</a>.</li>
                </ul>
              )}
              <p className="mt-2 text-xs text-amber-700">Offered as tradition and reflection, not medical or financial advice — and never as something you must do out of fear.</p>
            </div>

            <p className="text-xs text-muted-foreground">Dates are computed from Saturn’s real transit through the signs, using the same Lahiri-ayanamsa engine (<TermTip id="ayanamsa">the traditional Indian star-based calculation</TermTip>) as the rest of BornClock. Treat Sade Sati as a classical timing indicator, not a fixed prediction. <span data-testid="sadesati-tz">Dates are shown in {zoneLabel(viewerTz)}.</span></p>
          </div>
        )}
        </section>
    </PajPage>
  );
}
