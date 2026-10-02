/**
 * Gemstone / remedy suggestions (Part I.11) — informational only, built cautiously.
 * No purchase or seller links. Heavy, honest disclaimers (traditional association,
 * not medical/guaranteed, consult a qualified astrologer, trial powerful stones).
 */
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { Link } from 'react-router-dom';
import { WEARING_RITUAL, SIZING_RULE } from '@/lib/vedic/gemstones';
import '@/styles/part-aj.css';

interface Sugg { planet: string; gem: string; hindi: string; role: string; reason: string; trialCaution: boolean; dashaActive: boolean }
interface Avoid { planet: string; gem: string; reason: string }
interface Methodology { text: string }
interface Report {
  primary: Sugg | null; additional: Sugg[]; additionalNote: string | null;
  avoid: Avoid[]; methodology: Methodology; classificationNote: string; disclaimer: string;
}

function Card({ s, primary }: { s: Sugg; primary?: boolean }) {
  return (
    <div data-testid={primary ? 'gem-primary' : 'gem-additional'} className={`rounded-xl border p-4 ${primary ? 'border-indigo-300 bg-indigo-50/50' : 'border-border'}`}>
      <div className="font-semibold text-foreground">
        {s.gem} <span className="text-muted-foreground">({s.hindi})</span> — for {s.planet}
        <span className="ml-2 text-[10px] uppercase tracking-wide text-indigo-600">{s.role}</span>
        {s.dashaActive && <span className="ml-2 text-[10px] uppercase tracking-wide text-emerald-600">period active now</span>}
      </div>
      <p className="text-sm text-muted-foreground mt-1">{s.reason}</p>
      {s.trialCaution && <p className="text-xs text-amber-700 mt-1">⚠️ A powerful stone — traditionally worn on a short trial before regular wear.</p>}
    </div>
  );
}

export default function GemstonePage() {
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
      const res = await fetch(`/api/gemstones?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.report) throw new Error('unavailable');
      setReport(data.report as Report);
    } catch { setFailed(true); } finally { setLoading(false); }
  };
  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  return (
    <div data-testid="gemstone-page" className="paj editorial" data-category="vedic">
      <SEO title="Gemstone Suggestions (Vedic) — Ascendant-Lord Stone | BornClock"
        description="Informational Vedic gemstone suggestions based on your Ascendant lord and computed planetary strength — a traditional association, not a medical or guaranteed-effect claim. No sales."
        canonicalUrl="/gemstones" ogType="website" />
      <header className="site-header" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><Navigation /><AuthNav /></header>
      <div className="breadcrumb">
        <div><span className="crumb-parent">BornClock&nbsp; /&nbsp; <Link to="/vedic-astrology" className="textlink">Vedic Astrology</Link>&nbsp; /&nbsp; </span><span className="crumb-name">Gemstones</span></div>
        <div className="edition"><span className="dot" />Ratna · Ascendant-lord stone</div>
      </div>
      <main id="main">
        <section className="section">
          <div className="section-head">
            <div><span className="eyebrow">Ratna</span><h1>Gemstone Suggestions.</h1></div>
            <p>A traditional, informational suggestion based on your Ascendant lord and computed planetary strength — classical association only, not a medical claim or guarantee, and we sell nothing.</p>
          </div>
          <div className="form-band" style={{ marginTop: 16 }}>
            <div><h3>Your birth details</h3><p className="small muted">The stone is matched to your Ascendant lord.</p></div>
            <BirthDetailsForm initial={initial} submitLabel="Suggest my gemstone" loadingLabel="Analysing…" loading={loading} onSubmit={run} showSaveOption saveChecked={saveChecked} onSaveCheckedChange={setSaveChecked} testIdPrefix="gemstone" />
          </div>
        {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

        {report && (
          <div data-testid="gemstone-result" className="mt-6 space-y-4">
            {/* Methodology note FIRST — the transparency that builds trust (Part J). */}
            <div data-testid="gemstone-methodology" className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="font-semibold text-foreground mb-1">How we chose this (based on your Ascendant, not your Moon sign)</div>
              <p className="text-sm text-foreground">{report.methodology.text}</p>
            </div>

            {report.primary && <Card s={report.primary} primary />}
            {report.additional.map(s => <Card key={s.planet} s={s} />)}
            {report.additionalNote && <p data-testid="gem-additional-note" className="text-sm text-muted-foreground">{report.additionalNote}</p>}

            {/* Part AI — traditional wearing-ritual detail for the primary stone. */}
            {report.primary && WEARING_RITUAL[report.primary.planet] && (
              <div data-testid="gem-wearing" className="rounded-xl border border-border p-4">
                <div className="font-semibold text-foreground mb-2">How to wear it (traditional guidance)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Metal</div><div className="font-medium text-foreground">{WEARING_RITUAL[report.primary.planet].metal}</div></div>
                  <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Finger</div><div className="font-medium text-foreground">{WEARING_RITUAL[report.primary.planet].finger}</div></div>
                  <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Day to first wear</div><div className="font-medium text-foreground">{WEARING_RITUAL[report.primary.planet].day}</div></div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Sizing: </span>{SIZING_RULE}</p>
                <p className="mt-1 text-xs text-amber-700">These are traditional customs, offered for interest — not requirements, and not medical advice.</p>
              </div>
            )}

            {/* Part AI — honest cross-reference to the simpler Rashi Ratna tool. */}
            <p data-testid="gem-rashiratna-crossref" className="text-sm text-muted-foreground">
              Looking for the quick, Moon-sign version instead? The <Link to="/rashi-ratna" className="text-primary hover:underline font-medium">Rashi Ratna</Link> page gives one stone per zodiac sign from the ruling planet alone — a general starting point. This page is the more precise, full-chart recommendation, so if the two differ, this one is the more personalised.
            </p>

            {report.avoid.length > 0 && (
              <div data-testid="gemstone-avoid" className="rounded-lg border border-border p-4">
                <div className="font-semibold text-foreground mb-1">Traditionally avoid for your Ascendant</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {report.avoid.map(a => <li key={a.planet}>• <span className="font-medium">{a.gem}</span> ({a.planet}) — {a.reason}</li>)}
                </ul>
              </div>
            )}

            <details className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">Where traditions differ</summary>
              <p className="mt-2">{report.classificationNote}</p>
            </details>
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{report.disclaimer}</div>
          </div>
        )}
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <Link className="brand" to="/">bornclock<span className="brand-dot">.</span></Link>
            <p className="subtle">Informational Vedic gemstone guidance from your Ascendant lord — no sales, no guarantees.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to="/vedic-astrology">Vedic Astrology</Link>
            <Link to="/rashi-ratna">Rashi Ratna</Link>
            <Link to="/kundali">Kundali</Link>
            <Link to="/sade-sati">Sade Sati</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
        <div className="footer-bottom"><span>© 2026 BornClock · Vedic astrology, computed with care.</span></div>
      </footer>
    </div>
  );
}
