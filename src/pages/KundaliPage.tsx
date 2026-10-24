import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
// TBT fix: the chart + the reading render only AFTER the visitor generates a chart
// (behind `data`/`reading`), so split them into their own chunks that load on demand.
// This keeps them out of the initial /kundali route bundle (lower TBT) without changing
// the chart output; the prerendered intro/form/H1 (eager imports below) are untouched.
const KundaliChart = lazy(() => import('@/components/KundaliChart').then(m => ({ default: m.KundaliChart })));
import { KundaliTabs } from '@/components/KundaliTabs';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { ChartEventNotice } from '@/components/ChartEventNotice';
import { ReadingHistory } from '@/components/ReadingHistory';
import { recordReading, getReadingHistory } from '@/services/readingHistory';
import { syncHistoryToAccount, isHistorySyncEligible } from '@/services/readingHistorySync';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { mergeProfile, maritalStatusOf, MARITAL_STATUS_OPTIONS, type MaritalStatusChoice } from '@/services/savedProfile';
import { fetchKundali, buildInterpretationBlocks, kundaliBasis, type KundaliData } from '@/services/kundaliService';
import { BirthDataUsed } from '@/components/vedic/BirthDataUsed';
import { DashaDeepDive } from '@/components/vedic/DashaDeepDive';
import { WhatsAhead } from '@/components/vedic/WhatsAhead';
import { PeriodForecast } from '@/components/vedic/PeriodForecast';
import { buildKundaliPdfHtml } from '@/lib/pdf/kundaliPdfHtml';
import { printHtmlViaIframe } from '@/lib/pdf/printHtml';
import { fetchReading, type ReadingPayload } from '@/services/readingService';
import { useAnalytics } from '@/hooks/useAnalytics';
const VedicReading = lazy(() => import('@/components/reading/VedicReading').then(m => ({ default: m.VedicReading })));
const PastPeriodReflection = lazy(() => import('@/components/reading/PastPeriodReflection').then(m => ({ default: m.PastPeriodReflection })));
import { TermTip, NumberNote } from '@/components/vedic/TermTip';
import { degreeNote, padaNote, dashaPairNote } from '@/lib/vedic/numberNotes';
import { formatDegreeInSign } from '@/lib/vedic/formatDegree';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { reportPrice, resolveCurrency } from '@/lib/pricing';

export default function KundaliPage() {
  const price = reportPrice(resolveCurrency(undefined));
  const { profile, save, loaded, isFull } = useSavedProfile();
  const { user } = useAuth();
  const location = useLocation();
  const autoRan = useRef(false);
  const { trackFunnel } = useAnalytics();
  const chartFunnelTracked = useRef(false);
  const [usingDifferent, setUsingDifferent] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const [data, setData] = useState<KundaliData | null>(null);
  const [readingDob, setReadingDob] = useState('');
  const [usedPlace, setUsedPlace] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [historyKey, setHistoryKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reading, setReading] = useState<ReadingPayload | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingFailed, setReadingFailed] = useState(false);
  // Optional marital status (default "not said"). Kept in memory for this visit and,
  // when the user has saved their profile, stored inside that saved profile.
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatusChoice>('not-said');
  const msRef = useRef<MaritalStatusChoice>('not-said');
  const lastLoc = useRef<{ dob: string; time: string; loc: BirthDetails['city'] } | null>(null);
  useEffect(() => {
    if (profile?.maritalStatus) { setMaritalStatus(maritalStatusOf(profile)); msRef.current = maritalStatusOf(profile); }
  }, [profile?.maritalStatus]);

  // ── DOB carry-forward (Part AK) ─────────────────────────────────────────────
  // Extends Birthday's ?dob= pattern to carry ALL THREE fields a real chart needs:
  // date + time + place (with coordinates, since Lagna/Dasha need the exact place, not
  // just a name). /kundali?dob=…&time=…&place=…&lat=…&lon=…&tz=…[&name=…]
  const carried = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const dob = /^\d{4}-\d{2}-\d{2}$/.test(sp.get('dob') || '') ? sp.get('dob')! : '' /* ISO only — never guess DD/MM vs MM/DD */;
    const time = sp.get('time') || '';
    const lat = sp.get('lat'), lon = sp.get('lon'), tz = sp.get('tz');
    // fix-timezone-accuracy: a manually-chosen IANA zone travels as ?tzid=…
    const tzid = sp.get('tzid');
    const zone = tzid ? { timezone: tzid, manualTimezone: true } : {};
    const place = sp.get('place') || '';
    const name = sp.get('name') || undefined;
    const hasCoords = lat != null && lon != null && tz != null;
    // Full = everything needed to compute straight away (incl. a known time).
    const full = !!dob && !!time && hasCoords
      ? { dob, time, city: { name: place, lat: +lat!, lon: +lon!, tz: +tz!, ...zone }, name } as BirthDetails
      : null;
    // Partial = enough to pre-fill the form but not auto-run (e.g. unknown birth time).
    const prefill = dob
      ? { dob, time: time || undefined, city: hasCoords ? { name: place, lat: +lat!, lon: +lon!, tz: +tz!, ...zone } : undefined, name }
      : undefined;
    return { full, prefill };
  }, [location.search]);

  const usingSaved = isFull && !usingDifferent && !carried.full;
  const hasPartial = !!profile && !isFull && !usingDifferent;
  const initial = carried.full
    ? { dob: carried.full.dob, time: carried.full.time, city: carried.full.city, name: carried.full.name }
    : carried.prefill
      ? { dob: carried.prefill.dob, time: carried.prefill.time, city: carried.prefill.city, name: carried.prefill.name }
      : (usingSaved || hasPartial)
        ? { dob: profile!.dob, time: profile!.time, city: profile!.city, name: profile!.name }
        : undefined;

  const generate = async (details: BirthDetails) => {
    setLoading(true); setFailed(false); setReading(null); setReadingFailed(false);
    setReadingDob(details.dob);
    setDisplayName(details.name ?? '');
    const loc = details.city;
    setUsedPlace(details.city.name);
    try {
      const k = await fetchKundali(details.dob, details.time, loc);
      setData(k);
      // Funnel step: "generate chart" — the core activation event between a
      // visit (page_view) and a purchase (checkout_opened/purchase_completed).
      // Fires once per page session; consent-gated inside trackFunnel. No birth
      // details are sent — only that a chart was generated.
      if (!chartFunnelTracked.current) {
        chartFunnelTracked.current = true;
        trackFunnel('chart_generated', { tool: 'kundali' });
      }
      const hasSavedProfile = saveChecked || usingSaved;
      if (hasSavedProfile) {
        save({ dob: details.dob, time: details.time, city: details.city, name: details.name, notifyOptIn: profile?.notifyOptIn, maritalStatus: msRef.current });
      }
      recordReading({
        dob: details.dob, rashi: k.rashi ?? '—', lagna: k.lagna.sign,
        nakshatra: k.nakshatra?.nakshatra ?? '—',
        dasha: k.dasha ? `${k.dasha.mahadasha} / ${k.dasha.antardasha}` : '—',
      }, hasSavedProfile);
      if (hasSavedProfile && user?.id && isHistorySyncEligible(user.email)) {
        void syncHistoryToAccount(supabase as any, user.id, getReadingHistory());
      }
      setHistoryKey(x => x + 1);
      setReadingLoading(true);
      lastLoc.current = { dob: details.dob, time: details.time, loc };
      try { setReading(await fetchReading(details.dob, details.time, loc, msRef.current)); }
      catch { setReadingFailed(true); }
      finally { setReadingLoading(false); }
    } catch { setFailed(true); }
    finally { setLoading(false); }
  };

  // Precedence (Part AK): freshly-carried URL details (this session's hero submit) win over
  // a saved profile; then in-app router state; then a logged-in user's saved full profile
  // (skip asking entirely). Waits for `loaded` so the saved profile is known before deciding.
  useEffect(() => {
    if (autoRan.current || !loaded) return;
    if (carried.full) {
      autoRan.current = true;
      setUsingDifferent(true); // fresh details supersede any stale saved profile
      void generate(carried.full);
      return;
    }
    const incoming = (location.state as { autoGenerateBirth?: BirthDetails } | null)?.autoGenerateBirth;
    if (incoming) {
      autoRan.current = true;
      window.history.replaceState({}, '');
      void generate(incoming);
      return;
    }
    if (isFull && profile) {
      autoRan.current = true; // logged-in / saved: straight to their chart, no re-entry
      void generate({ dob: profile.dob, time: profile.time, city: profile.city, name: profile.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, carried.full, isFull, profile, location.state]);

  const changeMaritalStatus = async (v: MaritalStatusChoice) => {
    setMaritalStatus(v); msRef.current = v;
    if (profile && (usingSaved || saveChecked)) save(mergeProfile(profile, { maritalStatus: v }));
    // Re-read the written reading so its relationship wording matches the new status.
    if (data && lastLoc.current) {
      const { dob, time, loc } = lastLoc.current;
      setReadingLoading(true); setReadingFailed(false);
      try { setReading(await fetchReading(dob, time, loc, v)); } catch { setReadingFailed(true); } finally { setReadingLoading(false); }
    }
  };

  const shareText = data
    ? `My Kundali: ${data.lagna.sign} Lagna, ${data.rashi} Rashi, ${data.nakshatra.nakshatra} Nakshatra. Get yours at https://bornclock.com/kundali`
    : '';
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText).replace(/'/g, '%27')}`;

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="kundali-page"
      seo={(
        <SEO
          title="Free Kundali (Janam Kundali) — Birth Chart & Dasha | BornClock"
          description="Generate your free Vedic Kundali (Janam Kundali) — North Indian birth chart, planetary positions, Lagna, Nakshatra and Vimshottari Dasha, in accurate sidereal (Lahiri) astronomy."
          canonicalUrl="/kundali"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Kundali', edition: 'Sidereal · Lahiri' }}
      footer={{
        tagline: 'Your Vedic birth chart, computed with care — accurate sidereal (Lahiri) astronomy.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Glossary', to: '/glossary' },
          { label: 'Kundali Matching', to: '/kundali-match' },
          { label: 'Sade Sati', to: '/sade-sati' },
          { label: 'Muhurat', to: '/muhurat' },
          { label: 'AI Astrologer', to: '/astrologer' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">Janam Kundali</span>
              <h1>Your Kundali, computed.</h1>
            </div>
            <p>Your Vedic birth chart — planetary positions, <TermTip id="lagna">Lagna</TermTip>, <TermTip id="nakshatra">Nakshatra</TermTip> and <TermTip id="dasha">Dasha</TermTip>, in accurate sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) astronomy. Full report {price}.</p>
          </div>

          <TrustStrip claim="Calculated from your exact birth date, time and place — not a template — and cross-checked against a leading Vedic astrology service before launch." href="/how-it-works#vedic" />
          <KundaliTabs active="kundali" />

          {loaded && isFull && (
            <div className="mb-4 space-y-3" style={{ marginTop: 16 }}>
              <ChartEventNotice profile={profile} />
              <label data-testid="kundali-notify-optin" className="check" style={{ fontSize: 13 }}>
                <input type="checkbox" checked={!!profile?.notifyOptIn}
                  onChange={e => save(mergeProfile(profile, { notifyOptIn: e.target.checked }))} />
                🔔 Notify me in-app about upcoming events in my chart (Dasha changes, Sade Sati, favourable windows)
              </label>
            </div>
          )}

          {loaded && usingSaved && (
            <div data-testid="saved-profile-banner" className="result-annotation" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span>★ Using your saved birth details — <strong>{profile!.dob}</strong>, {profile!.time}, {profile!.city.name}</span>
              <button data-testid="use-different-details" type="button" className="text-button"
                onClick={() => { setUsingDifferent(true); setSaveChecked(false); setData(null); autoRan.current = true; }}>
                Use different details
              </button>
            </div>
          )}

          {loaded && hasPartial && (
            <div data-testid="partial-profile-banner" className="result-annotation" style={{ marginTop: 16 }}>
              ★ We’ve filled in your saved birth date (<strong>{profile!.dob}</strong>) — just add your birth time and place below to see your full Kundali.
            </div>
          )}

          {carried.full && (
            <div className="result-annotation" style={{ marginTop: 16 }}>
              ★ Using the birth details you just entered — <strong>{carried.full.dob}</strong>{carried.full.time ? `, ${carried.full.time}` : ''}{carried.full.city.name ? `, ${carried.full.city.name}` : ''}. No need to re-enter them.
            </div>
          )}

          <div className="form-band" style={{ marginTop: 16 }}>
            <div><h3>Birth details</h3><p className="small muted">Date, time and place — carried over automatically when you arrive from the Vedic hub.</p></div>
            <BirthDetailsForm
              key={usingSaved ? 'saved' : carried.full ? 'carried' : 'new'}
              testIdPrefix="kundali"
              initial={initial}
              submitLabel="Generate my Kundali →"
              loading={loading}
              onSubmit={generate}
              showSaveOption={!usingSaved}
              saveChecked={saveChecked}
              onSaveCheckedChange={setSaveChecked}
            />
            <label data-testid="kundali-marital-status" className="small" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span>Marital status <span className="muted">(optional)</span></span>
              <select value={maritalStatus} onChange={e => void changeMaritalStatus(e.target.value as MaritalStatusChoice)}
                style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid var(--line,#e4dcc8)', background: 'var(--paper)', color: 'var(--ink)' }}>
                {MARITAL_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="muted" style={{ fontSize: 12 }}>If you are married, we show partnership periods instead of “marriage windows”.</span>
            </label>
          </div>

          {failed && (
            <p className="subtle" style={{ marginTop: 16 }}>Kundali service is temporarily unavailable. Please try again shortly.</p>
          )}
        </section>

        {data && (
          <>
            <section className="section white">
              <div className="section-head"><div><span className="eyebrow">The chart</span><h2>Your birth chart.</h2></div></div>
              <div className="inline-flex rounded-lg border border-border overflow-hidden mb-3 text-sm" role="group" aria-label="Chart style">
                <button data-testid="chart-style-north" type="button" onClick={() => setChartStyle('north')}
                  className={`px-4 py-1.5 font-medium ${chartStyle === 'north' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                  aria-pressed={chartStyle === 'north'}>North Indian</button>
                <button data-testid="chart-style-south" type="button" onClick={() => setChartStyle('south')}
                  className={`px-4 py-1.5 font-medium ${chartStyle === 'south' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                  aria-pressed={chartStyle === 'south'}>South Indian</button>
              </div>
              <span className="ml-2 align-middle"><TermTip id="northSouthChart" iconOnly /></span>
              {(data.warnings || []).some(w => w.code === 'POLAR_LATITUDE') && (
                <div data-testid="kundali-polar-warning" className="rounded-xl border-2 border-amber-500/60 bg-amber-50 text-amber-900 p-4 text-sm" style={{ marginBottom: 12 }}>
                  <strong>A note about this birth location:</strong> it is at an extreme (polar) latitude where the
                  rising sign (Lagna) and house positions are astronomically unreliable. The planets’ signs, the Moon
                  sign and birth star remain accurate, but treat the houses in this chart as approximate.
                </div>
              )}
              <div className="chart-with-stats">
                <Suspense fallback={<div style={{ width: 300, height: 300 }} aria-hidden="true" />}>
                  <KundaliChart lagnaSignIndex={data.lagna.signIndex} planets={data.planets} style={chartStyle} />
                </Suspense>
                <p data-testid="kundali-chart-legend" className="text-xs text-muted-foreground" style={{ maxWidth: 320 }}>
                  How to read it: Su Sun · Mo Moon · Ma Mars · Me Mercury · Ju Jupiter · Ve Venus · Sa Saturn · Ra <TermTip id="rahu">Rahu</TermTip> · Ke <TermTip id="ketu">Ketu</TermTip> · La <TermTip id="lagna">Lagna</TermTip>. The small numbers are sign numbers (1 Aries … 12 Pisces); each box is a <TermTip id="bhava">house</TermTip>.
                </p>
                <div className="chart-stats">
                  <div className="chart-stat" data-testid="kundali-lagna"><small><TermTip id="lagna">Lagna</TermTip></small><strong>{data.lagna.sign}</strong><span>{formatDegreeInSign(data.lagna.degrees)}</span><NumberNote testid="kundali-lagna-note">{degreeNote(data.lagna.degrees, 'Your Lagna')}</NumberNote></div>
                  <div className="chart-stat"><small><TermTip id="rashi">Rashi</TermTip></small><strong>{data.rashi}</strong><span>{data.rashi_devanagari}</span></div>
                  <div className="chart-stat"><small><TermTip id="nakshatra">Nakshatra</TermTip></small><strong>{data.nakshatra.nakshatra}</strong><span><TermTip id="pada">Pada</TermTip> {data.nakshatra.pada}</span><NumberNote testid="kundali-pada-note">{padaNote(data.nakshatra.pada)}</NumberNote></div>
                  {data.dasha && (
                    <div className="chart-stat" data-testid="kundali-dasha"><small><TermTip id="dasha">Dasha</TermTip></small><strong className="mini-number">{data.dasha.mahadasha}/{data.dasha.antardasha}</strong><NumberNote testid="kundali-dasha-note">{dashaPairNote(data.dasha.mahadasha, data.dasha.antardasha)}</NumberNote></div>
                  )}
                </div>
              </div>

              {/* K13: the divisional charts the explainer pages point to — same drawing, same style toggle. */}
              {(data.divisionalCharts?.d9 || data.divisionalCharts?.d10) && (
                <div data-testid="kundali-divisional" style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 4 }}><TermTip id="navamsa">Navamsa (D9)</TermTip> and <TermTip id="dasamsa">Dasamsa (D10)</TermTip></h3>
                  <p className="text-sm text-muted-foreground" style={{ marginBottom: 8 }}>
                    <TermTip id="varga">Divisional charts</TermTip> refine the main chart: the <Link to="/divisional-charts/d9-navamsa" className="underline">Navamsa</Link> for marriage and inner strength, the <Link to="/divisional-charts/d10-dasamsa" className="underline">Dasamsa</Link> for career. The first house is each chart’s own Lagna. They are sensitive to birth time — a few minutes can move the Lagna.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([['d9', 'Navamsa (D9)'], ['d10', 'Dasamsa (D10)']] as const).map(([key, title]) => {
                      const v = data.divisionalCharts?.[key];
                      if (!v) return null;
                      return (
                        <figure key={key} data-testid={`kundali-${key}-chart`} style={{ margin: 0 }}>
                          <figcaption className="text-sm font-semibold text-center" style={{ marginBottom: 4 }}>{title}</figcaption>
                          <Suspense fallback={<div style={{ width: 300, height: 300 }} aria-hidden="true" />}>
                            <KundaliChart lagnaSignIndex={v.lagnaSignIndex} planets={v.planets} style={chartStyle} label={`${title} chart`} />
                          </Suspense>
                        </figure>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <BirthDataUsed testid="kundali-birth-data" place={usedPlace} basis={kundaliBasis(data)} />
              </div>

              <div className="table-scroll" style={{ marginTop: 16 }}>
                <table data-testid="planet-table" className="data-table" style={{ width: '100%' }}>
                  <thead><tr><th><TermTip id="graha">Planet</TermTip></th><th>Sign</th><th><TermTip id="bhava">House</TermTip></th><th><TermTip id="planetDegree">Degrees</TermTip></th></tr></thead>
                  <tbody>
                    {data.planets.map(p => (
                      <tr key={p.name}>
                        <td>{p.name === 'Rahu' || p.name === 'Ketu' ? <TermTip id={p.name.toLowerCase()}>{p.name}</TermTip> : p.name}{p.retrograde ? <> (<TermTip id="retrograde">R</TermTip>)</> : ''}</td>
                        <td>{p.sign}</td>
                        <td>{p.house}</td>
                        <td>{formatDegreeInSign(p.longitude)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(() => {
                const moon = data.planets.find(p => p.name === 'Moon');
                const nearEdge = data.planets.filter(p => { const d = ((p.longitude % 30) + 30) % 30; return d < 1 || d >= 29; }).map(p => p.name);
                return (
                  <div data-testid="kundali-degree-notes">
                    <NumberNote testid="kundali-degree-note">Degrees show how far each planet is into its 30° sign (0° = just entered, 29° = about to leave).{moon ? ` ${degreeNote(moon.longitude, 'Your Moon')}` : ''}</NumberNote>
                    {nearEdge.length > 0 && <NumberNote testid="kundali-edge-note">{nearEdge.join(', ')} {nearEdge.length === 1 ? 'is' : 'are'} within 1° of a sign boundary — if your birth time is approximate, {nearEdge.length === 1 ? 'its' : 'their'} sign could differ.</NumberNote>}
                  </div>
                );
              })()}

              {data.dashaTimeline && data.dashaTimeline.length > 0 && (
                <DashaDeepDive mahadashas={data.dashaTimeline.map(m => ({ lord: m.lord, start: m.start, end: m.end }))} />
              )}

              {data.dashaTimeline && data.dashaTimeline.length > 0 && (
                <WhatsAhead
                  lagnaSignIndex={data.lagna.signIndex}
                  planets={data.planets.map(p => ({ name: p.name, house: p.house }))}
                  dashaTimeline={data.dashaTimeline}
                  maritalStatus={maritalStatus}
                />
              )}

              {data.dashaTimeline && data.dashaTimeline.length > 0 && (
                <PeriodForecast dashaTimeline={data.dashaTimeline} lagnaSignIndex={data.lagna.signIndex} planets={data.planets} />
              )}

              <div className="inline-actions" style={{ marginTop: 18 }}>
                <a data-testid="kundali-whatsapp-share" href={whatsappHref} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2" style={{ background: '#15803D', color: '#fff', fontWeight: 600, borderRadius: 999, padding: '10px 18px', fontSize: 13 }}>
                  Share on WhatsApp
                </a>
                <button data-testid="kundali-download-pdf" type="button" className="btn secondary"
                  onClick={() => printHtmlViaIframe(buildKundaliPdfHtml(data, { dob: readingDob, place: usedPlace, basis: kundaliBasis(data) }))}>
                  Download Kundli (PDF) — free
                </button>
                <Link className="btn secondary" to="/birthday-report/gift">Gift a Birthday Blueprint ({price}) →</Link>
              </div>
            </section>

            <section className="section">
              <div data-testid="kundali-interpretation">
                <div className="section-head"><div><span className="eyebrow">Read the chart</span><h2 data-testid="kundali-interp-heading">{displayName ? `${displayName}’s chart, interpreted` : 'Your chart, interpreted'}</h2></div></div>
                <div className="honesty-items" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {buildInterpretationBlocks(data).map((b, i) => (
                    <div key={i} data-testid="kundali-interp-block">
                      <h3>{b.title}</h3>
                      <p>{b.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="section white">
              <div className="section-head">
                <div><span className="eyebrow">Your personal reading</span><h2>Your chart, in plain language.</h2></div>
                <p>A reading organised by life area. Traditional guidance — offered thoughtfully, never as certainty.</p>
              </div>
              {readingLoading && <p data-testid="reading-loading" className="subtle">Preparing your reading…</p>}
              {readingFailed && !readingLoading && (
                <p data-testid="reading-failed" className="result-annotation">Your written reading couldn’t be loaded just now, but your full chart above is ready. Please try again in a little while for the narrated version.</p>
              )}
              <Suspense fallback={<p className="subtle" aria-hidden="true">Preparing your reading…</p>}>
                {reading && <VedicReading payload={reading} />}
                {reading && (usingSaved || saveChecked) && (
                  <PastPeriodReflection reflections={reading.reflections} dob={readingDob} hasSavedProfile={usingSaved || saveChecked} />
                )}
              </Suspense>
              {loaded && !!profile && <ReadingHistory dob={profile.dob} refreshKey={historyKey} />}
            </section>
          </>
        )}

        <section className="report">
          <div><span className="eyebrow">Paid report · {price}</span><h2>The Birthday Blueprint.</h2></div>
          <p>A personalised birthday report — Western, Chinese and Vedic zodiac profiles, numerology and life path, and celebrity birthday twins — for yourself or as a gift. Your Kundali above (chart, doshas and reading) stays free; the Blueprint is a different report and does not add remedies or extra predictions.</p>
          <div className="report-actions">
            <Link className="btn light" to="/birthday-report">Get the Birthday Blueprint →</Link>
            <p className="small"><Link className="textlink" to="/birthday-report/gift">Gift a Birthday Blueprint ({price}) →</Link></p>
          </div>
        </section>
    </PajPage>
  );
}
