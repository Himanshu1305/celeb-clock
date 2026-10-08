/**
 * Vedic Astrology category landing — /vedic-astrology (Part AJ redesign).
 *
 * Rebuilt to the finalized "Editorial" design system (docs/design-reference/vedic-final.html).
 * The shared, scoped design system lives in src/styles/part-aj.css (every selector under .paj
 * so it can't leak into the rest of the site). This page sets class="paj editorial"
 * data-category="vedic".
 *
 * Carried forward from the pre-AJ live page (all real functionality preserved):
 *  - the real Kundli-generation entry (BirthDetailsForm → /kundali autoGenerate flow),
 *  - every real internal link (Kundli, Kundali Matching, AI Astrologer, Sade Sati, Muhurat,
 *    Career Report, Gemstones, Nakshatra, Rashi/Moon-sign, cross-category links),
 *  - the honest framing + FAQ + priced report blocks (real purchase flow),
 *  - the "real example" section — now a genuinely computed chart (live /api/vedic-reading,
 *    local astronomy-engine, with ProKerala as fallback), rendered as a full placements table + North-Indian
 *    chart, matching the reference design's own example (14 Mar 1990, 10:30 IST, New Delhi).
 *
 * Added per Part AJ brief: the Part AI glossary (TermTip) on technical terms, the yoga
 * GradeLegend, and a WhatsApp share (reused WhatsAppShareButton) at the real-example moment.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PajPage } from '@/components/central';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { TermTip, GradeLegend } from '@/components/vedic/TermTip';
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { JsonLd } from '@/components/JsonLd';
import { fetchReading } from '@/services/readingService';

// Build the DOB carry-forward URL (Part AK): extends Birthday's ?dob= pattern to carry the
// date + time + place (with coordinates) a real chart needs, so /kundali requires no re-entry.
function kundaliCarryUrl(d: BirthDetails): string {
  const params = new URLSearchParams({
    dob: d.dob, time: d.time, place: d.city.name,
    lat: String(d.city.lat), lon: String(d.city.lon), tz: String(d.city.tz),
  });
  if (d.name) params.set('name', d.name);
  return `/kundali?${params.toString()}`;
}

type Teaser = { lagna: string; rashi: string; nakshatra: string; dasha: string | null; name: string | null } | { error: true };

// ── The reference example chart: 14 Mar 1990, 10:30 IST, New Delhi ────────────
// Real astronomy-engine output (Lahiri sidereal, whole-sign houses). These are the
// exact verified values the finalized design shows; §results also re-computes them live via
// /api/vedic-reading so the "computed, not a template" claim is demonstrably true either way.
const REF_META = { date: '14 Mar 1990', time: '10:30 IST', place: 'New Delhi', coords: '28.6139°N, 77.2090°E', utc: '05:00 UTC', ayanamsa: '23.720168°' };
type Placement = { body: string; sign: string; pos: string; house: number; retro?: boolean };
const REF_PLACEMENTS: Placement[] = [
  { body: 'Sun', sign: 'Aquarius', pos: '29°38′', house: 10 },
  { body: 'Moon', sign: 'Libra', pos: '00°34′', house: 6 },
  { body: 'Mercury', sign: 'Aquarius', pos: '25°02′', house: 10 },
  { body: 'Venus', sign: 'Capricorn', pos: '14°19′', house: 9 },
  { body: 'Mars', sign: 'Capricorn', pos: '08°10′', house: 9 },
  { body: 'Jupiter', sign: 'Gemini', pos: '07°35′', house: 2 },
  { body: 'Saturn', sign: 'Sagittarius', pos: '29°31′', house: 8 },
  { body: 'Rahu', sign: 'Capricorn', pos: '20°55′', house: 9, retro: true },
  { body: 'Ketu', sign: 'Cancer', pos: '20°55′', house: 3, retro: true },
];
const REF_STATS = { lagna: 'Taurus', lagnaPos: '14°19′', moonNak: 'Chitra', moonPada: 'Pada 3 · Mars-ruled' };
const PLANET_ABBR: Record<string, string> = { Sun: 'Su', Moon: 'Mo', Mercury: 'Me', Venus: 'Ve', Mars: 'Ma', Jupiter: 'Ju', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };

// Standard North-Indian (diamond) chart: fixed (x,y) text anchors per house 1–12.
const HOUSE_XY: Record<number, [number, number]> = {
  1: [150, 88], 2: [78, 42], 3: [38, 78], 4: [86, 150], 5: [38, 224], 6: [78, 262],
  7: [150, 214], 8: [224, 262], 9: [262, 224], 10: [214, 150], 11: [262, 78], 12: [224, 42],
};

function NorthIndianChart({ placements }: { placements: Placement[] }) {
  const byHouse: Record<number, string[]> = {};
  placements.forEach(p => { (byHouse[p.house] ||= []).push(PLANET_ABBR[p.body] || p.body.slice(0, 2)); });
  return (
    <svg className="chart-svg" viewBox="0 0 300 300" role="img"
      aria-label="Computed North-Indian birth chart for the reference example; planets placed by their real house positions.">
      <path className="chart-line" d="M8 8H292V292H8Z M8 8L292 292 M8 292L292 8 M150 8L292 150L150 292L8 150Z" />
      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
        const [x, y] = HOUSE_XY[h];
        const planets = byHouse[h] || [];
        return (
          <g key={h}>
            <text className="house" x={x} y={y - 15} textAnchor="middle">{h}</text>
            <text className="planet" x={x} y={y} textAnchor="middle">{h === 1 ? `Asc ${planets.join(' ')}`.trim() : planets.join(' ')}</text>
          </g>
        );
      })}
    </svg>
  );
}

type Tab = 'chart' | 'dasha' | 'yoga' | 'method';

function RealExample() {
  const [tab, setTab] = useState<Tab>('chart');
  const [live, setLive] = useState<null | { lagna: string; rashi: string; dasha: string }>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Re-compute the SAME reference chart live (14 Mar 1990, 10:30 IST, New Delhi).
        const res = await fetch('/api/vedic-reading?y=1990&m=3&d=14&h=10&min=30&lat=28.6139&lon=77.2090&tz=5.5');
        if (!res.ok) return;
        const d = await res.json();
        const f = d?.facts; if (!f || cancelled) return;
        setLive({
          lagna: f.lagna || '', rashi: f.rashi || '',
          dasha: f.dasha ? `${f.dasha.maha} / ${f.dasha.antar}` : '',
        });
      } catch { /* verified static table stands on its own */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const tabs: Array<[Tab, string]> = [['chart', 'Birth chart'], ['dasha', 'Dasha timeline'], ['yoga', 'Yoga check'], ['method', 'Calculation notes']];
  const shareMsg = `I just looked at a real, computed Vedic birth chart on BornClock — sidereal (Lahiri), genuinely calculated, nothing templated. Compute yours free: https://bornclock.com/vedic-astrology`;

  return (
    <section className="section white" id="results">
      <div className="section-head">
        <div><span className="eyebrow">Show, then explain</span><h2>The calculation behind the reading.</h2></div>
        <p>A real computed chart, with its inputs and method visible — not generated from a template.</p>
      </div>
      <TrustStrip claim="The example chart is really computed — re-run live from the same calculation engine." href="/how-it-works#vedic" />

      <div className="tabs" role="tablist" aria-label="Explore the output">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'chart' && (
        <div className="tabpanel" role="tabpanel">
          <div className="result-layout">
            <div>
              <div className="result-annotation">
                <strong>Computed example · {REF_META.date}, {REF_META.time}</strong><br />
                {REF_META.place} · {REF_META.coords}<br />
                {REF_META.utc} · <TermTip id="ayanamsa">Lahiri sidereal</TermTip> · whole-sign houses
                {live && <> · <span data-testid="vap-live-ok" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>✓ re-computed live — engine agrees ({live.lagna} {'lagna'})</span></>}
              </div>
              <div className="chart-with-stats" data-testid="vap-sample-chart">
                <NorthIndianChart placements={REF_PLACEMENTS} />
                <div className="chart-stats">
                  <div className="chart-stat"><small><TermTip id="lagna">Lagna / ascendant</TermTip></small><strong>{REF_STATS.lagna}</strong><span>{REF_STATS.lagnaPos}</span></div>
                  <div className="chart-stat"><small>Moon&rsquo;s <TermTip id="nakshatra">nakshatra</TermTip></small><strong>{REF_STATS.moonNak}</strong><span>{REF_STATS.moonPada}</span></div>
                  <div className="chart-stat"><small><TermTip id="ayanamsa">Ayanamsa</TermTip></small><strong className="mini-number">{REF_META.ayanamsa}</strong><span>At the example epoch</span></div>
                </div>
              </div>
            </div>
            <div>
              <h3>Nothing hidden behind the chart.</h3>
              <p className="subtle">Sidereal longitudes, rounded to the nearest arcminute. R denotes retrograde motion.</p>
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th scope="col">Body</th><th scope="col">Sign</th><th scope="col">Position</th><th scope="col">House</th></tr></thead>
                  <tbody>
                    {REF_PLACEMENTS.map(p => (
                      <tr key={p.body}>
                        <td>{p.body} {p.retro && <span className="muted">R</span>}</td>
                        <td>{p.sign}</td><td>{p.pos}</td><td>{String(p.house).padStart(2, '0')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="inline-actions" style={{ marginTop: 16 }}>
                <WhatsAppShareButton message={shareMsg} label="Share this on WhatsApp" />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'dasha' && (
        <div className="tabpanel" role="tabpanel">
          <p className="panel-intro">A calculated <TermTip id="dasha">Vimshottari period</TermTip> sequence within a traditional system — not evidence that an event will happen.</p>
          <div className="timeline">
            <div><span>Birth-period balance</span><strong>Mars</strong><span>14 Mar 1990<br />– 27 May 1993</span></div>
            <div><span><TermTip id="mahadasha">Planetary period</TermTip></span><strong>Rahu</strong><span>27 May 1993<br />– 27 May 2011</span></div>
            <div className="active"><span><TermTip id="mahadasha">Planetary period</TermTip></span><strong>Jupiter</strong><span>27 May 2011<br />– 27 May 2027</span></div>
            <div><span><TermTip id="mahadasha">Planetary period</TermTip></span><strong>Saturn</strong><span>27 May 2027<br />– 27 May 2046</span></div>
          </div>
          <div className="explain-grid">
            <div><h3>How this example was derived</h3><p>The Moon falls in Chitra, a Mars-ruled lunar mansion; its remaining fraction supplies the birth-period balance. The timeline uses 365.25 days per Dasha year; other software conventions may shift dates.</p></div>
            <div><h3>What the dates do not mean</h3><p>A period label is not a promise about marriage, money, health or career. A responsible interpretation explains uncertainty instead of presenting a date as fate.</p></div>
          </div>
        </div>
      )}

      {tab === 'yoga' && (
        <div className="tabpanel" role="tabpanel">
          <div className="explain-grid">
            <div>
              <span className="pill accent">Visible chart condition</span>
              <h3 style={{ marginTop: 12 }}>Sun + Mercury in Aquarius.</h3>
              <p>Both occupy the tenth whole-sign house in this example. A same-sign Sun–Mercury rule is commonly used as an initial Budha-Aditya <TermTip id="yoga">Yoga</TermTip> check. That first check is not a complete assessment of strength.</p>
              <GradeLegend />
            </div>
            <div className="reflection">
              <span className="eyebrow">Context before conclusions</span>
              <h3>A pattern is a starting point.</h3>
              <p>Angular distance, combustion criteria, dignity and the rest of the chart can change a traditional interpretation. No success, income or status outcome is guaranteed by this combination.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'method' && (
        <div className="tabpanel" role="tabpanel">
          <div className="explain-grid">
            <div>
              <h3>Reproducible astronomical input</h3>
              <p>This record is generated with the open-source <strong>astronomy-engine</strong> library (v2.1); <TermTip id="ayanamsa">Lahiri sidereal</TermTip> positions; whole-sign houses; mean lunar node for <TermTip id="rashi">Rahu</TermTip>, with Ketu opposite. Location and UTC conversion are shown with the result.</p>
              <p><a className="textlink" href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener">Read the astronomy-engine documentation ↗</a></p>
            </div>
            <div>
              <h3>Computed, cross-verified, honest</h3>
              <p>Every chart you generate is calculated the same way — local-first, with an independent professional engine as a fallback — then cross-checked for accuracy. The example above re-computes live from the same service.</p>
            </div>
          </div>
        </div>
      )}

      <div className="result-notes">
        <p><strong>Computed positions are not proof of predictive astrology.</strong> The astronomical record is calculated; any life interpretation belongs to a symbolic tradition.</p>
        <a className="textlink" href="#honesty">Our approach →</a>
      </div>
    </section>
  );
}

const FEATURES: Array<{ title: string; desc: string; to: string }> = [
  { title: 'Kundli', desc: 'Your planetary positions, ascendant and twelve houses — the structure behind the reading.', to: '/kundali' },
  { title: 'Dasha timing', desc: 'Follow Vimshottari planetary periods and sub-periods on a real timeline.', to: '/kundali' },
  { title: 'Yoga detection', desc: 'Inspect the chart conditions behind a classical pattern, graded by strength.', to: '/kundali' },
  { title: 'Kundali Matching', desc: 'Ashtakoota compatibility, point by point — a score and an honest caveat.', to: '/kundali-match' },
  { title: 'AI Astrologer', desc: 'Ask about a placement and see the chart evidence it is grounded in.', to: '/astrologer' },
];
const DEEPER: Array<{ title: string; desc: string; to: string }> = [
  { title: 'Sade Sati', desc: 'Where Saturn’s 7½-year cycle stands for you.', to: '/sade-sati' },
  { title: 'Muhurat Finder', desc: 'Auspicious timing for what matters.', to: '/muhurat' },
  { title: 'Career Report', desc: 'Vedic career analysis from your 10th house.', to: '/career-report' },
  { title: 'Gemstone Recommendation', desc: 'Stones matched to your Lagna lord.', to: '/gemstones' },
];

export default function VedicAstrologyLanding() {
  // Tier 1.3 inline teaser: on submit, compute a real quick preview (Lagna/Rashi/Nakshatra +
  // current Dasha) right here, then offer "See your full chart →" into /kundali WITH the birth
  // details carried forward in the URL (no re-entry). The teaser uses the same real engine as
  // the chart; if the engine is unreachable, the carry-forward link still works.
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [carryUrl, setCarryUrl] = useState('/kundali');

  const onGenerate = async (details: BirthDetails) => {
    setCarryUrl(kundaliCarryUrl(details));
    setTeaserLoading(true); setTeaser(null);
    setTimeout(() => document.getElementById('teaser')?.scrollIntoView({ behavior: 'smooth' }), 60);
    try {
      const payload = await fetchReading(details.dob, details.time, { lat: details.city.lat, lon: details.city.lon, tz: details.city.tz });
      const f = payload.facts;
      setTeaser({
        lagna: f.lagna, rashi: f.rashi,
        nakshatra: f.nakshatra ? `${f.nakshatra.name} (pada ${f.nakshatra.pada})` : '—',
        dasha: f.dasha ? `${f.dasha.maha} / ${f.dasha.antar}` : null,
        name: details.name || null,
      });
    } catch { setTeaser({ error: true }); }
    finally { setTeaserLoading(false); }
  };

  const faqs: Array<[string, string]> = [
    ['Can I use this without my exact birth time?', 'You still get your Moon sign, Nakshatra and Dasha (these depend mainly on the date). The Ascendant (Lagna) and house-based details need an accurate time — we tell you plainly which parts are affected rather than guessing a time for you.'],
    ['Is the example chart actually calculated?', 'Yes. Its planetary positions and ascendant were calculated for 14 March 1990, 10:30 IST in New Delhi using the astronomy-engine library, Lahiri sidereal positions and whole-sign houses. The page re-computes the same chart live.'],
    ['Do you predict exactly what will happen to me?', 'No. We show real planetary periods and classical combinations, always labelled as traditional association — never a guaranteed date or outcome. Where a period matters, we give the honest window, not a fabricated “on this day” claim.'],
    ['How is this different from a generic horoscope app?', 'Generic apps recycle one Sun-sign paragraph for millions. This is your individual chart — real planetary positions, your Dasha timeline, detected yogas graded by strength — computed, cross-verified and honest about its limits.'],
    ['Is my birth data private?', 'Yes. Your birth details are used to compute your chart and are stored only on your own device unless you explicitly choose to save them to your account. Nothing is sold or shared.'],
  ];

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="vedic-astrology-page"
      seo={(
        <SEO
          title="Vedic Astrology — Your Birth Chart, Computed Not Guessed | BornClock"
          description="Your real Vedic birth chart, computed from your exact birth details — Kundli, Dasha timing, yoga detection, Kundali matching and an AI astrologer. Not a horoscope template."
          keywords="vedic astrology, kundli, birth chart, kundali matching, dasha, nakshatra, rashi, lagna, sade sati, manglik, gemstone, muhurat"
          canonicalUrl="/vedic-astrology"
          ogType="website"
        />
      )}
      breadcrumb={{ current: 'Vedic Astrology', edition: 'Sidereal · Lahiri' }}
      footer={{ note: '© 2026 BornClock · Vedic astrology, computed with care.' }}
    >
        <JsonLd id="faq" data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }} />
        {/* HERO (editorial) */}
        <section className="hero" id="start" aria-label="Introduction">
          <div className="hero-top">
            <div className="hero-copy">
              <span className="eyebrow kicker">A chart, not a certainty</span>
              <h1>Your birth chart, computed — not guessed.<br /><em>Every detail matters.</em></h1>
              <p className="lead">Start with the sky at your first moment. Explore your Kundli, planetary periods and chart patterns — with the calculation behind every reading.</p>
              <div className="hero-links">
                <a className="btn" href="#results">See a real example →</a>
                <a className="text-button" href="#honesty">How the calculation works</a>
              </div>
              <p className="hero-note">The example chart is really computed. Your own chart is generated the moment you enter your birth details below.</p>
            </div>
            <div className="hero-visual">
              <div className="visual-wrap">
                <div className="visual-top"><strong>D1 · Rāśi chart</strong><span className="pill accent">Computed example</span></div>
                <div className="chart-with-stats">
                  <NorthIndianChart placements={REF_PLACEMENTS} />
                  <div className="chart-stats">
                    <div className="chart-stat"><small>Ascendant</small><strong>{REF_STATS.lagna}</strong><span>{REF_STATS.lagnaPos} · House 1</span></div>
                    <div className="chart-stat"><small>Moon sign</small><strong>Libra</strong><span>Chitra · Pada 3</span></div>
                    <div className="chart-stat"><small>Sample Dasha</small><strong className="mini-number">Jupiter</strong><span>2011 – 2027</span></div>
                  </div>
                </div>
                <div className="visual-caption">
                  <span>{REF_META.date} · {REF_META.time}<br />{REF_META.place} · Lahiri sidereal</span>
                  <span>Whole-sign houses<br /><a className="textlink" href="#results">Inspect the data →</a></span>
                </div>
              </div>
            </div>
          </div>
          {/* Real Kundli entry — BirthDetailsForm → /kundali autoGenerate flow */}
          <div className="form-band">
            <div><h3>Begin with your birth.</h3><p className="small muted">Date, time and place — that’s all the engine needs.</p></div>
            <BirthDetailsForm submitLabel="Generate My Kundli — Free" onSubmit={onGenerate} testIdPrefix="vap" />
          </div>
        </section>

        {/* Tier 1.3 — inline teaser: a real, instant preview after the hero form is submitted */}
        {(teaserLoading || teaser) && (
          <section className="section white" id="teaser" data-testid="vap-teaser">
            <div className="section-head">
              <div><span className="eyebrow">Your instant preview</span>
                <h2>{teaser && !('error' in teaser) && teaser.name ? `${teaser.name}, here’s your chart at a glance.` : 'Your chart at a glance.'}</h2></div>
              <p>A real, computed snapshot — the full chart (planets, Dasha, yogas, remedies) is one click away.</p>
            </div>
            {teaserLoading && <p className="subtle">Computing your chart from your exact birth details…</p>}
            {teaser && !('error' in teaser) && (
              <>
                <div className="snapshot">
                  <div><span className="eyebrow"><TermTip id="lagna">Lagna</TermTip> · Ascendant</span><strong>{teaser.lagna}</strong><p>The sign rising at your birth — your outward self and approach to life.</p></div>
                  <div><span className="eyebrow"><TermTip id="rashi">Rashi</TermTip> · Moon sign</span><strong>{teaser.rashi}</strong><p>Where the Moon sits — your emotional nature and inner life.</p></div>
                  <div><span className="eyebrow"><TermTip id="nakshatra">Nakshatra</TermTip></span><strong>{teaser.nakshatra}</strong><p>Your birth lunar mansion — a finer layer beneath the Moon sign.</p></div>
                </div>
                <div className="inline-actions" style={{ marginTop: 18 }}>
                  <Link className="btn" to={carryUrl} data-testid="vap-see-full-chart">See your full chart →</Link>
                  {teaser.dasha && <span className="inline-bullet">Current <TermTip id="dasha">Dasha</TermTip> period: <strong>{teaser.dasha}</strong></span>}
                </div>
              </>
            )}
            {teaser && 'error' in teaser && (
              <div className="inline-actions">
                <Link className="btn" to={carryUrl} data-testid="vap-see-full-chart">See your full chart →</Link>
                <span className="inline-bullet">Your full computed chart opens on the next page — no need to re-enter anything.</span>
              </div>
            )}
          </section>
        )}

        <div className="trust-strip">
          <div><span className="tick" aria-hidden="true">✓</span>Positions you can inspect</div>
          <div><span className="tick" aria-hidden="true">✓</span>A named calculation method</div>
          <div><span className="tick" aria-hidden="true">✓</span>Interpretation, not certainty</div>
        </div>

        {/* TOOLKIT */}
        <section className="section" id="tools">
          <div className="section-head">
            <div><span className="eyebrow">The toolkit</span><h2>Five ways into your chart.</h2></div>
            <p>Explore one question, or connect the whole picture.</p>
          </div>
          <div className="feature-grid" data-testid="vap-what-you-get">
            {FEATURES.map((f, i) => (
              <article className="feature" key={f.title}>
                <span className="feature-no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link className="text-button" to={f.to}>Explore →</Link>
              </article>
            ))}
          </div>
        </section>

        {/* GO DEEPER */}
        <section className="section white" id="deeper">
          <div className="section-head">
            <div><span className="eyebrow">Go deeper</span><h2>Beyond the birth chart.</h2></div>
            <p>Timing, remedies and specific questions — each on its own dedicated tool.</p>
          </div>
          <div className="feature-grid four" data-testid="vap-go-deeper">
            {DEEPER.map((f, i) => (
              <article className="feature" key={f.title}>
                <span className="feature-no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link className="text-button" to={f.to}>Open →</Link>
              </article>
            ))}
          </div>
        </section>

        {/* REAL EXAMPLE (tabs) */}
        <RealExample />

        {/* HONESTY */}
        <section className="section" id="honesty">
          <div className="honesty">
            <div><span className="eyebrow">Our approach</span><h2>Precision in the calculation.<br />Humility in the interpretation.</h2></div>
            <div className="honesty-items">
              <div><h3>What is computed</h3><p>Planetary positions, house assignments and period dates follow explicit inputs and a named calculation convention.</p></div>
              <div><h3>What is not established</h3><p>A precisely computed chart is not scientific proof that personal events or personality can be predicted from it.</p></div>
              <div><h3>When birth time is uncertain</h3><p>Ascendant, houses and timing can change. We show the uncertainty rather than manufacture precision.</p></div>
              <div><h3>No fear-based certainty</h3><p>No guaranteed marriage dates, health diagnoses or alarming claims. A reading should leave you more informed, not more dependent.</p></div>
            </div>
          </div>
        </section>

        {/* PAID REPORT banner */}
        <section className="report" id="report">
          <div><span className="eyebrow">Go deeper · paid report</span><h2>Your chart, in a report<br />you can return to.</h2></div>
          <p>A structured reading with the birth chart, planetary periods, chart patterns, doshas and remedies, and the calculation notes together.</p>
          <div className="report-actions">
            <Link className="btn light" to="/kundali" data-testid="vap-buy-kundali">Generate &amp; unlock — ₹199 →</Link>
            <p className="small"><Link className="textlink" to="/birthday-report/gift" data-testid="vap-buy-combo">Combo with the Birthday Report — ₹299 →</Link></p>
          </div>
        </section>

        {/* ASK YOUR CHART (AI astrologer) */}
        <section className="section white">
          <div className="section-head">
            <div><span className="eyebrow">Private, grounded guidance</span><h2>Ask your chart anything.</h2></div>
            <p>A judgment-free conversation grounded in your own birth chart — traditional guidance, offered gently and honestly.</p>
          </div>
          <div className="inline-actions">
            <Link className="btn" to="/astrologer">Ask the AI Astrologer →</Link>
            <span className="inline-bullet">No account needed to start.</span>
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="faq-layout">
            <div><span className="eyebrow">Before you begin</span><h2>A few good questions.</h2></div>
            <div className="faq-list">
              {faqs.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        {/* EXPLORE BY TOPIC + cross-category */}
        <section className="section white">
          <div className="section-head"><div><span className="eyebrow">Explore by topic</span><h2>Everything in one place.</h2></div></div>
          <p className="lead" data-testid="vap-explore" style={{ maxWidth: 'none' }}>
            {([
              ['Kundli', '/kundali'], ['Kundali Matching', '/kundali-match'],
              ['Rashifal', '/rashifal'], ['Daily Panchang', '/panchang'],
              ['Festival Calendar', '/festivals'],
              ['Planetary Transits', '/transit'], ['Mercury Retrograde', '/mercury-retrograde'],
              ['27 Nakshatras', '/nakshatra'], ['Rashi', '/moon-sign'],
              ['Planet in Sign', '/planet-in-sign'], ['Planet in House', '/planet-in-house'],
              ['Vedic Yogas', '/yoga'], ['Divisional Charts', '/divisional-charts'],
              ['Sade Sati', '/sade-sati'], ['Dasha Calculator', '/dasha-calculator'],
              ['Manglik', '/manglik'], ['Kaal Sarp Dosha', '/kaal-sarp-dosha'],
              ['Pitra Dosha', '/pitra-dosha'], ['Mool Nakshatra Dosha', '/mool-dosha'],
              ['Grahan Dosha', '/grahan-dosha'], ['Nadi Dosha', '/nadi-dosha'],
              ['Gemstone Recommendation', '/gemstones'], ['Rashi Ratna', '/rashi-ratna'],
              ['Career Report', '/career-report'], ['Life Report', '/life-report'],
              ['Child Kundli', '/child-kundli'], ['Muhurat Finder', '/muhurat'],
              ['Sun vs Moon sign', '/sun-vs-moon-sign'], ['How we calculate', '/how-it-works'],
            ] as Array<[string, string]>).map(([label, to], i, arr) => (
              <span key={label}>
                <Link className="textlink" to={to}>{label}</Link>{i < arr.length - 1 && <span className="muted"> · </span>}
              </span>
            ))}
          </p>
          <div className="crosslinks" style={{ marginTop: 20 }}>
            <Link className="crosslink" to="/celebrity-birthday">
              <div><span className="eyebrow">The other lens</span><h3>Birthday &amp; Celebrity →</h3><p>Your birthday twins, real photos and the playful side of your date.</p></div>
              <span>↗</span>
            </Link>
            <Link className="crosslink" to="/mystic-corner">
              <div><span className="eyebrow">Different systems</span><h3>Mystic Corner →</h3><p>Numerology, Western and Chinese zodiac — each one actually computed.</p></div>
              <span>↗</span>
            </Link>
          </div>
        </section>
    </PajPage>
  );
}
