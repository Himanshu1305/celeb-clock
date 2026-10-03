/**
 * Deeper Career Analysis report (Part I.12; Part AM redesign to paj editorial).
 * Deterministic report (10th house + lord + D10 + career Yogas + career-timing windows) built
 * on the validated engines. Carries forward birth details from the Vedic hub (?dob&time&place&
 * lat&lon&tz) and the saved profile; fresh carried params take precedence over stale saved data.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { SEO } from '@/components/SEO';
import { KundaliTabs } from '@/components/KundaliTabs';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { GradeLegend } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { JsonLd } from '@/components/JsonLd';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import '@/styles/part-aj.css';

interface Report {
  tenthHouse: { sign: string; lord: string; analysis: string };
  occupants: Array<{ planet: string; strength: string }>;
  dasamsa: { analysis: string };
  yogas: Array<{ name: string; grade: string; summary: string }>;
  timing: { windows: Array<{ describe: string }>; next: string | null; note: string };
  verdict: string; methodology: string; disclaimer: string;
}

export default function CareerReportPage() {
  const { profile, save } = useSavedProfile();
  const location = useLocation();
  const autoRan = useRef(false);
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

  // DOB carry-forward (Part AM/Step 5): accept the same ?dob&time&place&lat&lon&tz params the
  // Vedic hub/kundali pass; auto-generate with zero re-entry. Fresh params beat the saved profile.
  const carried = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const dob = sp.get('dob') || '', time = sp.get('time') || '', lat = sp.get('lat'), lon = sp.get('lon'), tz = sp.get('tz'), place = sp.get('place') || '';
    if (dob && time && lat != null && lon != null && tz != null) return { dob, time, city: { name: place, lat: +lat, lon: +lon, tz: +tz } } as BirthDetails;
    return null;
  }, [location.search]);
  useEffect(() => {
    if (autoRan.current || !carried) return;
    autoRan.current = true;
    void run(carried);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carried]);

  const initial = carried
    ? { dob: carried.dob, time: carried.time, city: carried.city }
    : profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  return (
    <div data-testid="career-page" className="paj editorial" data-category="vedic">
      <SEO title="Career Analysis Report (Vedic) — 10th House, D10 & Timing | BornClock"
        description="A deeper Vedic career report: your 10th house and its lord, the Dasamsa (D10) career chart, career-relevant Yogas, and the real classical timing windows for professional moves."
        canonicalUrl="/career-report" ogType="website" />
      <JsonLd id="webapp" data={{
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: 'Vedic Career Analysis Report',
        description: 'A deeper Vedic career report from your 10th house and its lord, the Dasamsa (D10) career chart, career Yogas, and real classical career-timing windows.',
        url: 'https://bornclock.com/career-report/', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        provider: { '@type': 'Organization', name: 'BornClock', url: 'https://bornclock.com' },
      }} />
      <header className="site-header" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><Navigation /><AuthNav /></header>
      <div className="breadcrumb">
        <div><span className="crumb-parent">BornClock&nbsp; /&nbsp; <Link to="/vedic-astrology" className="textlink">Vedic Astrology</Link>&nbsp; /&nbsp; </span><span className="crumb-name">Career Analysis</span></div>
        <div className="edition"><span className="dot" />10th house · D10 · timing</div>
      </div>

      <main id="main">
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">Vedic career · premium depth</span>
              <h1>Career Analysis <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--accent-text)', border: '1px solid var(--line)', borderRadius: 3, padding: '2px 6px', verticalAlign: 'middle' }}>Premium depth</span></h1>
            </div>
            <p>A decisive-but-bounded read of your career: the 10th house and its lord, the Dasamsa (D10) career chart, career Yogas, and real timing windows.</p>
          </div>

          <TrustStrip claim="Based on your actual 10th house and career-timing periods — not a generic trait list." />
          <KundaliTabs active="kundali" />

          <div className="form-band" style={{ marginTop: 16 }}>
            <div><h3>Your birth details</h3><p className="small muted">The 10th house and D10 need your exact time and place.</p></div>
            <BirthDetailsForm initial={initial} submitLabel="Generate my career report" loadingLabel="Analysing…" loading={loading} onSubmit={run} showSaveOption saveChecked={saveChecked} onSaveCheckedChange={setSaveChecked} testIdPrefix="career" />
          </div>
          {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

          {report && (
            <div data-testid="career-result" className="mt-6 space-y-4" style={{ marginTop: 20 }}>
              <div data-testid="career-methodology" className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                <div className="font-semibold text-foreground mb-1">How this report was built (from your chart)</div>
                <p className="text-sm text-foreground">{report.methodology}</p>
              </div>
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
                  <p className="text-xs text-muted-foreground mb-2">A "Yoga" here is a classical planetary combination linked to a career strength — an indication, never a guarantee.</p>
                  <ul className="text-sm text-foreground space-y-1">
                    {report.yogas.map(y => <li key={y.name}><span className="font-medium">{y.name}</span> <span className="text-xs uppercase text-indigo-600">[{y.grade}]</span> — {y.summary}</li>)}
                  </ul>
                  <GradeLegend />
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
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <Link className="brand" to="/">bornclock<span className="brand-dot">.</span></Link>
            <p className="subtle">A Vedic career read from your real 10th house, D10 and timing periods — computed, not a trait list.</p>
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
