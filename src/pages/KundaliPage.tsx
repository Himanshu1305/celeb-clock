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
import { mergeProfile } from '@/services/savedProfile';
import { fetchKundali, buildInterpretationBlocks, type KundaliData } from '@/services/kundaliService';
import { fetchReading, type ReadingPayload } from '@/services/readingService';
const VedicReading = lazy(() => import('@/components/reading/VedicReading').then(m => ({ default: m.VedicReading })));
const PastPeriodReflection = lazy(() => import('@/components/reading/PastPeriodReflection').then(m => ({ default: m.PastPeriodReflection })));
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { reportPrice, resolveCurrency } from '@/lib/pricing';

export default function KundaliPage() {
  const price = reportPrice(resolveCurrency(undefined));
  const { profile, save, loaded, isFull } = useSavedProfile();
  const { user } = useAuth();
  const location = useLocation();
  const autoRan = useRef(false);
  const [usingDifferent, setUsingDifferent] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const [data, setData] = useState<KundaliData | null>(null);
  const [readingDob, setReadingDob] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [historyKey, setHistoryKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reading, setReading] = useState<ReadingPayload | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingFailed, setReadingFailed] = useState(false);

  // ── DOB carry-forward (Part AK) ─────────────────────────────────────────────
  // Extends Birthday's ?dob= pattern to carry ALL THREE fields a real chart needs:
  // date + time + place (with coordinates, since Lagna/Dasha need the exact place, not
  // just a name). /kundali?dob=…&time=…&place=…&lat=…&lon=…&tz=…[&name=…]
  const carried = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const dob = sp.get('dob') || '';
    const time = sp.get('time') || '';
    const lat = sp.get('lat'), lon = sp.get('lon'), tz = sp.get('tz');
    const place = sp.get('place') || '';
    const name = sp.get('name') || undefined;
    const hasCoords = lat != null && lon != null && tz != null;
    // Full = everything needed to compute straight away (incl. a known time).
    const full = !!dob && !!time && hasCoords
      ? { dob, time, city: { name: place, lat: +lat!, lon: +lon!, tz: +tz! }, name } as BirthDetails
      : null;
    // Partial = enough to pre-fill the form but not auto-run (e.g. unknown birth time).
    const prefill = dob
      ? { dob, time: time || undefined, city: hasCoords ? { name: place, lat: +lat!, lon: +lon!, tz: +tz! } : undefined, name }
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
    const loc = { lat: details.city.lat, lon: details.city.lon, tz: details.city.tz };
    try {
      const k = await fetchKundali(details.dob, details.time, loc);
      setData(k);
      const hasSavedProfile = saveChecked || usingSaved;
      if (hasSavedProfile) {
        save({ dob: details.dob, time: details.time, city: details.city, name: details.name });
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
      try { setReading(await fetchReading(details.dob, details.time, loc)); }
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
          description="Generate your free Vedic Kundali (Janam Kundali) — North Indian birth chart, planetary positions, Lagna, Nakshatra and Vimshottari Dasha, computed with the Swiss Ephemeris."
          canonicalUrl="/kundali"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Kundali', edition: 'Sidereal · Lahiri · Swiss Ephemeris' }}
      footer={{
        tagline: 'Your Vedic birth chart, computed with care — sidereal (Lahiri), Swiss Ephemeris.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
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

          <TrustStrip claim="Computed with the Swiss Ephemeris (sidereal · Lahiri) and cross-checked for accuracy — not a template." />
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
          </div>

          {failed && (
            <p className="subtle" style={{ marginTop: 16 }}>Kundali service is temporarily unavailable. Please try again shortly.</p>
          )}
        </section>

        {data && (
          <>
            <section className="section white">
              <div className="section-head"><div><span className="eyebrow">The chart</span><h2>Your birth chart.</h2></div></div>
              <div className="chart-with-stats">
                <Suspense fallback={<div style={{ width: 300, height: 300 }} aria-hidden="true" />}>
                  <KundaliChart lagnaSignIndex={data.lagna.signIndex} planets={data.planets} />
                </Suspense>
                <div className="chart-stats">
                  <div className="chart-stat" data-testid="kundali-lagna"><small><TermTip id="lagna">Lagna</TermTip></small><strong>{data.lagna.sign}</strong></div>
                  <div className="chart-stat"><small><TermTip id="rashi">Rashi</TermTip></small><strong>{data.rashi}</strong><span>{data.rashi_devanagari}</span></div>
                  <div className="chart-stat"><small><TermTip id="nakshatra">Nakshatra</TermTip></small><strong>{data.nakshatra.nakshatra}</strong><span>Pada {data.nakshatra.pada}</span></div>
                  {data.dasha && (
                    <div className="chart-stat" data-testid="kundali-dasha"><small><TermTip id="dasha">Dasha</TermTip></small><strong className="mini-number">{data.dasha.mahadasha}/{data.dasha.antardasha}</strong></div>
                  )}
                </div>
              </div>

              <div className="table-scroll" style={{ marginTop: 16 }}>
                <table data-testid="planet-table" className="data-table" style={{ width: '100%' }}>
                  <thead><tr><th>Planet</th><th>Sign</th><th>House</th><th>Degrees</th></tr></thead>
                  <tbody>
                    {data.planets.map(p => (
                      <tr key={p.name}>
                        <td>{p.name}{p.retrograde ? ' (R)' : ''}</td>
                        <td>{p.sign}</td>
                        <td>{p.house}</td>
                        <td>{(p.longitude % 30).toFixed(1)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="inline-actions" style={{ marginTop: 18 }}>
                <a data-testid="kundali-whatsapp-share" href={whatsappHref} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2" style={{ background: '#15803D', color: '#fff', fontWeight: 600, borderRadius: 999, padding: '10px 18px', fontSize: 13 }}>
                  Share on WhatsApp
                </a>
                <Link className="btn secondary" to="/birthday-report/gift">Gift a Kundali ({price}) →</Link>
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
          <div><span className="eyebrow">Go deeper · paid report</span><h2>The full Vedic report.</h2></div>
          <p>The complete {price} report with doshas, remedies and detailed predictions — for yourself or as a gift.</p>
          <div className="report-actions">
            <Link className="btn light" to="/birthday-report">Get the complete report →</Link>
            <p className="small"><Link className="textlink" to="/birthday-report/gift">Gift a Kundali ({price}) →</Link></p>
          </div>
        </section>
    </PajPage>
  );
}
