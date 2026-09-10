/**
 * Gemstone / remedy suggestions (Part I.11) — informational only, built cautiously.
 * No purchase or seller links. Heavy, honest disclaimers (traditional association,
 * not medical/guaranteed, consult a qualified astrologer, trial powerful stones).
 */
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';

interface Sugg { planet: string; gem: string; hindi: string; reason: string; trialCaution: boolean }
interface Report { primary: Sugg | null; supportive: Sugg[]; methodology: string; disclaimer: string }

function Card({ s, primary }: { s: Sugg; primary?: boolean }) {
  return (
    <div data-testid={primary ? 'gem-primary' : 'gem-supportive'} className={`rounded-xl border p-4 ${primary ? 'border-indigo-300 bg-indigo-50/50' : 'border-border'}`}>
      <div className="font-semibold text-foreground">{s.gem} <span className="text-muted-foreground">({s.hindi})</span> — for {s.planet}</div>
      <p className="text-sm text-muted-foreground mt-1">{s.reason}</p>
      {s.trialCaution && <p className="text-xs text-amber-700 mt-1">⚠️ A powerful stone — traditionally worn on a short trial before regular wear.</p>}
    </div>
  );
}

export default function GemstonePage() {
  const { profile } = useSavedProfile();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async (d: BirthDetails) => {
    setLoading(true); setFailed(false); setReport(null);
    try {
      const [y, m, day] = d.dob.split('-'); const [h, min] = (d.time || '12:00').split(':');
      const p = new URLSearchParams({ y, m, d: day, h, min, lat: String(d.city.lat), lon: String(d.city.lon), tz: String(d.city.tz) });
      const res = await fetch(`/api/gemstones?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.report) throw new Error('unavailable');
      setReport(data.report as Report);
    } catch { setFailed(true); } finally { setLoading(false); }
  };
  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  return (
    <div data-testid="gemstone-page" className="min-h-screen bg-gradient-cosmic">
      <SEO title="Gemstone Suggestions (Vedic) — Ascendant-Lord Stone | BornClock"
        description="Informational Vedic gemstone suggestions based on your Ascendant lord and computed planetary strength — a traditional association, not a medical or guaranteed-effect claim. No sales."
        canonicalUrl="/gemstones" ogType="website" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8"><Navigation /><AuthNav /></header>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Gemstone Suggestions</h1>
        <p className="text-muted-foreground mb-4">A traditional, informational suggestion based on your Ascendant lord and computed planetary strength. This is classical association only — not a medical claim, not a guarantee, and we sell nothing.</p>

        <BirthDetailsForm initial={initial} submitLabel="Suggest my gemstone" loadingLabel="Analysing…" loading={loading} onSubmit={run} testIdPrefix="gemstone" />
        {failed && <p className="text-sm text-muted-foreground mt-4">The service is temporarily unavailable. Please try again shortly.</p>}

        {report && (
          <div data-testid="gemstone-result" className="mt-6 space-y-4">
            {report.primary && <Card s={report.primary} primary />}
            {report.supportive.map(s => <Card key={s.planet} s={s} />)}
            {report.supportive.length === 0 && <p className="text-sm text-muted-foreground">No additional supportive stone stands out — the Ascendant-lord stone above is the primary traditional suggestion.</p>}
            <details data-testid="gemstone-methodology" className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">How this is chosen (and where traditions differ)</summary>
              <p className="mt-2">{report.methodology}</p>
            </details>
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{report.disclaimer}</div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
