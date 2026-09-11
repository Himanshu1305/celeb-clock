/**
 * Deeper Career Analysis report (Part I.12). A premium-depth, deterministic report
 * (10th house + lord + D10 + career Yogas + career-timing windows) built entirely
 * on the validated engines. Gating note: like the Matching detailed breakdown, this
 * is currently NOT hard-paywalled (the Vedic features are free today); a "Premium
 * depth" affordance marks it, and real payment enforcement is a monetisation task
 * flagged for the person (docs/part-i-flags.md).
 */
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { KundaliTabs } from '@/components/KundaliTabs';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';

interface Report {
  tenthHouse: { sign: string; lord: string; analysis: string };
  occupants: Array<{ planet: string; strength: string }>;
  dasamsa: { analysis: string };
  yogas: Array<{ name: string; grade: string; summary: string }>;
  timing: { windows: Array<{ describe: string }>; next: string | null; note: string };
  verdict: string; disclaimer: string;
}

export default function CareerReportPage() {
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
      const res = await fetch(`/api/career-report?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.report) throw new Error('unavailable');
      setReport(data.report as Report);
    } catch { setFailed(true); } finally { setLoading(false); }
  };
  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  return (
    <div data-testid="career-page" className="min-h-screen bg-gradient-cosmic">
      <SEO title="Career Analysis Report (Vedic) — 10th House, D10 & Timing | BornClock"
        description="A deeper Vedic career report: your 10th house and its lord, the Dasamsa (D10) career chart, career-relevant Yogas, and the real classical timing windows for professional moves."
        canonicalUrl="/career-report" ogType="website" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8"><Navigation /><AuthNav /></header>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Career Analysis</h1>
          <span className="text-[10px] uppercase tracking-wide bg-amber-500/15 text-amber-700 border border-amber-500/30 rounded px-1.5 py-0.5">Premium depth</span>
        </div>
        <p className="text-muted-foreground mb-4">A dedicated, decisive-but-bounded read of your career: the 10th house and its lord, the Dasamsa (D10) career chart, career Yogas, and real timing windows.</p>
        <KundaliTabs active="kundali" />

        <div className="mt-4"><BirthDetailsForm initial={initial} submitLabel="Generate my career report" loadingLabel="Analysing…" loading={loading} onSubmit={run} showSaveOption saveChecked={saveChecked} onSaveCheckedChange={setSaveChecked} testIdPrefix="career" /></div>
        {failed && <p className="text-sm text-muted-foreground mt-4">The service is temporarily unavailable. Please try again shortly.</p>}

        {report && (
          <div data-testid="career-result" className="mt-6 space-y-4">
            <div data-testid="career-tenth" className="rounded-xl border border-border p-4">
              <div className="font-semibold text-foreground mb-1">Your 10th house of career</div>
              <p className="text-sm text-foreground">{report.tenthHouse.analysis}</p>
            </div>
            <div data-testid="career-d10" className="rounded-xl border border-border p-4">
              <div className="font-semibold text-foreground mb-1">Dasamsa (D10) — the career chart</div>
              <p className="text-sm text-foreground">{report.dasamsa.analysis}</p>
            </div>
            {report.yogas.length > 0 && (
              <div data-testid="career-yogas" className="rounded-xl border border-border p-4">
                <div className="font-semibold text-foreground mb-1">Career-relevant Yogas</div>
                <ul className="text-sm text-foreground space-y-1">
                  {report.yogas.map(y => <li key={y.name}><span className="font-medium">{y.name}</span> <span className="text-xs uppercase text-indigo-600">[{y.grade}]</span> — {y.summary}</li>)}
                </ul>
              </div>
            )}
            <div data-testid="career-timing" className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="font-semibold text-foreground mb-1">Career timing windows</div>
              <p className="text-xs text-muted-foreground mb-2">{report.timing.note}</p>
              <ul className="text-sm text-foreground space-y-0.5">{report.timing.windows.map((w, i) => <li key={i}>• {w.describe}</li>)}</ul>
            </div>
            <div data-testid="career-verdict" className="rounded-xl border-2 border-indigo-300 bg-card/70 p-5">
              <div className="font-semibold text-foreground mb-1">The bottom line</div>
              <p className="text-sm text-foreground">{report.verdict}</p>
            </div>
            <p className="text-xs text-muted-foreground">{report.disclaimer}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
