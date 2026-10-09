/**
 * Mystic Corner category landing — /mystic-corner (Part AJ redesign).
 *
 * Rebuilt to the finalized "Atlas" design (docs/design-reference/mystic-final.html) using the
 * shared scoped design system (src/styles/part-aj.css). class="paj atlas".
 *
 * Carried forward + made genuinely interactive: the three real tools — Numerology (life path),
 * Western zodiac, Chinese zodiac — are now COMPUTED ON-PAGE from the entered date with the real
 * calc utils (calculateLifePathNumber / calculateWesternZodiac / calculateChineseZodiac,
 * LIFE_PATH_TRAITS), with the workings shown. The honest "these are different systems, not a
 * generic horoscope" framing and the cross-links to Vedic Astrology + Birthday & Celebrity are
 * preserved. WhatsApp share (reused) at the result moment.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PajPage } from '@/components/central';
import { DobInput, type DobValue, parseDob } from '@/components/DobInput';
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { JsonLd } from '@/components/JsonLd';
import {
  calculateWesternZodiac, calculateChineseZodiac, calculateLifePathNumber,
  LIFE_PATH_TRAITS, type ZodiacInfo,
} from '@/utils/celebrityCalculations';

type Tab = 'numerology' | 'western' | 'chinese';

// The 12 signs for the browse selector — real ZodiacInfo via representative in-range dates.
const SIGN_REPS: Array<[number, number]> = [[4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [1, 5], [2, 5], [3, 5]];
const SIGNS: ZodiacInfo[] = SIGN_REPS.map(([m, d]) => calculateWesternZodiac(d, m));

function lifePathCalc(day: number, month: number, year: number) {
  const digits = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`.split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return { expr: `${digits.join(' + ')} = ${sum}`, sum };
}

export default function MysticCornerLanding() {
  const [tab, setTab] = useState<Tab>('numerology');
  // Default to the reference sample (14 Mar 1990) so the workings show real content immediately.
  const [dob, setDob] = useState<DobValue>({ day: '14', month: '03', year: '1990' });
  const active = useMemo(() => {
    const { date } = parseDob(dob.day, dob.month, dob.year);
    return date ?? new Date(1990, 2, 14);
  }, [dob]);

  const d = active.getDate(), m = active.getMonth() + 1, y = active.getFullYear();
  const lifePath = calculateLifePathNumber(d, m, y);
  const lpTrait = LIFE_PATH_TRAITS[lifePath] ?? LIFE_PATH_TRAITS[9];
  const lpCalc = lifePathCalc(d, m, y);
  const western = calculateWesternZodiac(d, m);
  const chinese = calculateChineseZodiac(y);

  const [browseSign, setBrowseSign] = useState<string | null>(null);
  const shownSign = SIGNS.find(s => s.sign === (browseSign ?? western.sign)) ?? western;

  const openTool = (t: Tab) => { setTab(t); document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }); };

  const dateLabel = active.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const shareMsg = `My birth date through three lenses on BornClock — Life Path ${lifePath} (${lpTrait.title}), ${western.sign} (Western), ${chinese.animal} · ${chinese.element} (Chinese). Each one actually computed: https://bornclock.com/mystic-corner`;

  return (
    <PajPage
      theme="mystic"
      variant="atlas"
      testId="mystic-corner-page"
      seo={(
        <SEO
          title="Mystic Corner — Numerology, Zodiac & Chinese Sign | BornClock"
          description="The mystical side of your birth date: numerology Life Path, Western zodiac, Chinese zodiac — each one actually computed from your date, with the workings shown. Not a templated horoscope."
          keywords="numerology, life path number, western zodiac, chinese zodiac, birth date numerology, zodiac sign calculator"
          canonicalUrl="/mystic-corner"
          ogType="website"
        />
      )}
      breadcrumb={{ current: 'Mystic Corner', edition: 'Three distinct traditions' }}
      footer={{ note: '© 2026 BornClock · Independent perspectives. Clear boundaries.' }}
    >
        <JsonLd id="faq" data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
          { '@type': 'Question', name: 'Is this different from a generic horoscope?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The numerology result and calendar assignments respond to your actual input, with the calculation method shown. The interpretations remain symbolic, not scientifically validated personal predictions.' } },
          { '@type': 'Question', name: 'Why could my Chinese zodiac differ elsewhere?', acceptedAnswer: { '@type': 'Answer', text: 'This uses the Chinese year for your Gregorian birth year. Births in January or early February can fall in the previous Chinese year under the Lunar New Year boundary. A full BaZi reading also needs additional birth information.' } },
          { '@type': 'Question', name: 'Are Western and Vedic signs the same?', acceptedAnswer: { '@type': 'Answer', text: 'No. This Western tool uses conventional tropical Sun-sign date ranges. Vedic systems typically use sidereal positions with a chosen ayanamsa — see the Vedic Astrology page. Different reference systems can produce different sign labels.' } },
        ] }} />
        {/* HERO (atlas) */}
        <section className="hero" id="start" aria-label="Introduction">
          <div className="hero-top">
            <aside className="atlas-index" aria-label="On this page">
              <div>
                <span className="eyebrow">The index</span>
                <ol>
                  <li><a href="#start"><span>01</span>Your birth date</a></li>
                  <li><a href="#tools"><span>02</span>Three traditions</a></li>
                  <li><a href="#results"><span>03</span>Show the workings</a></li>
                  <li><a href="#explore"><span>04</span>Keep exploring</a></li>
                </ol>
              </div>
              <div><div className="index-no">03</div><span className="small muted">A BornClock collection</span></div>
            </aside>
            <div className="hero-copy">
              <span className="eyebrow kicker">Curiosity, with perspective</span>
              <h1>The mystical side of your birth date.<br /><em>Numerology, zodiac, and more — actually computed.</em></h1>
              <p className="lead">Numerology, Western zodiac and Chinese zodiac — distinct systems, clearly explained. An invitation to reflect, never an instruction to believe.</p>
              <div className="hero-links">
                <a className="btn" href="#tools">Explore the three tools →</a>
                <a className="text-button" href="#results">See how it works</a>
              </div>
              <p className="hero-note">Personalised inputs, transparent conventions. No daily prediction dressed up as insight.</p>
            </div>
            <div className="hero-visual">
              <div className="visual-wrap">
                <div className="visual-top"><strong>Your reflection, in three lenses</strong><span className="pill accent">{dateLabel} · computed</span></div>
                <div className="mystic-art">
                  <div className="number-orbit">
                    <span className="orbit-dot" />
                    <span className="big-num">{lifePath}</span>
                    <span className="orbit-label">LIFE PATH · NUMEROLOGY</span>
                  </div>
                  <div className="chart-stats">
                    <div className="chart-stat"><small>Western zodiac</small><strong>{western.sign}</strong><span>Conventional date ranges</span></div>
                    <div className="chart-stat"><small>Chinese zodiac</small><strong>{chinese.animal}</strong><span>{chinese.element} · lunar-year convention</span></div>
                    <div className="chart-stat"><small>A useful question</small><span>What resonates — and what doesn’t?</span></div>
                  </div>
                </div>
                <div className="visual-caption"><span>Symbolic traditions, not scientific assessments.</span><a className="textlink" href="#results">See the workings →</a></div>
              </div>
            </div>
          </div>
          <div className="form-band">
            <div><h3>What’s your birth date?</h3><p className="small muted">One date. A place to begin.</p></div>
            <div className="entry-form">
              <DobInput value={dob} onChange={setDob} label="" idPrefix="mc" />
              <p className="small muted" style={{ marginTop: 8 }}>Calculated locally in your browser. Symbolic interpretations are not scientific findings.</p>
            </div>
          </div>
        </section>

        <div className="trust-strip">
          <div><span className="tick" aria-hidden="true">✓</span>Three distinct traditions</div>
          <div><span className="tick" aria-hidden="true">✓</span>The workings, not just the result</div>
          <div><span className="tick" aria-hidden="true">✓</span>Reflection, not prediction</div>
        </div>

        {/* TOOLS */}
        <section className="section" id="tools">
          <div className="section-head">
            <div><span className="eyebrow">Choose a lens</span><h2>A small atlas of possibilities.</h2></div>
            <p>These systems ask different questions. They are not interchangeable.</p>
          </div>
          <div className="feature-grid three">
            <article className="feature"><span className="feature-no">01</span><h3>Numerology</h3><p>Start with the digits of your birth date. See your life-path calculation and the convention used.</p><button className="text-button" type="button" onClick={() => openTool('numerology')}>Explore numerology →</button></article>
            <article className="feature"><span className="feature-no">02</span><h3>Western zodiac</h3><p>Discover your conventional Sun-sign category. Date-only readings are not a full natal chart.</p><button className="text-button" type="button" onClick={() => openTool('western')}>Explore Western zodiac →</button></article>
            <article className="feature"><span className="feature-no">03</span><h3>Chinese zodiac</h3><p>Find your animal and element using the Chinese year, not simply 1 January alone.</p><button className="text-button" type="button" onClick={() => openTool('chinese')}>Explore Chinese zodiac →</button></article>
          </div>
        </section>

        {/* RESULTS — the three lenses, computed */}
        <section className="section white" id="results">
          <div className="section-head">
            <div><span className="eyebrow">Show the workings</span><h2>Your date, through three lenses.</h2></div>
            <p>Computed from {dateLabel}. Change the date above to explore another — it recalculates locally.</p>
          </div>
          <TrustStrip claim="Calculated from your actual birth date, every time — not a generic daily horoscope." href="/how-it-works#zodiac" />
          <div className="tabs" role="tablist" aria-label="Explore the output">
            {(['numerology', 'western', 'chinese'] as Tab[]).map(t => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === 'numerology' ? 'Numerology' : t === 'western' ? 'Western zodiac' : 'Chinese zodiac'}
              </button>
            ))}
          </div>

          {tab === 'numerology' && (
            <div className="tabpanel" role="tabpanel">
              <div className="reading-panel">
                <div>
                  <div className="reading-number">
                    <strong>{lifePath}</strong>
                    <div><span>Life-path number</span><h3>{lpTrait.title}</h3><span>Symbolic interpretation</span></div>
                  </div>
                  <div className="calculation">{lpCalc.expr} → {lifePath}</div>
                  <p className="subtle">This convention adds every birth-date digit, then reduces the total while retaining the master numbers 11, 22 and 33. It does not predict your abilities or future.</p>
                </div>
                <div className="reflection">
                  <span className="eyebrow">A prompt, not a prescription</span>
                  <h3>Where could your experience be useful to someone else?</h3>
                  <p>{lpTrait.traits} Notice what feels familiar without treating the label as a fact about you.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'western' && (
            <div className="tabpanel" role="tabpanel">
              <div className="explain-grid">
                <div>
                  <span className="eyebrow">Western · tropical tradition</span>
                  <h2 style={{ margin: '8px 0' }}>{shownSign.symbol} {shownSign.sign}</h2>
                  <p>Common date range: {shownSign.date_range}. Traditionally associated with the {shownSign.element.toLowerCase()} element; ruling planet {shownSign.ruling_planet}. {shownSign.traits}</p>
                </div>
                <div>
                  <h3>A Sun sign is not a whole chart.</h3>
                  <p>These are conventional date ranges. Births near a boundary need the actual Sun position, birth time and timezone. The interpretation is cultural and reflective, not a scientifically validated personality assessment.</p>
                  <p><Link to="/western-birth-chart" className="text-button">Build your full Western birth chart (Sun, Moon, Rising &amp; houses) →</Link></p>
                </div>
              </div>
              <div className="zodiac-select" aria-label="Browse zodiac traditions">
                {SIGNS.map(s => (
                  <button key={s.sign} type="button" className={s.sign === shownSign.sign ? 'active' : ''}
                    aria-pressed={s.sign === shownSign.sign} onClick={() => setBrowseSign(s.sign)}>
                    <span aria-hidden="true">{s.symbol}</span>{s.sign}
                  </button>
                ))}
              </div>
              {browseSign && browseSign !== western.sign && (
                <p className="small-note">Browsing {browseSign}. Your date’s sign is {western.sign}.</p>
              )}
            </div>
          )}

          {tab === 'chinese' && (
            <div className="tabpanel" role="tabpanel">
              <div className="explain-grid">
                <div>
                  <span className="eyebrow">Chinese · lunar-year convention</span>
                  <h2 style={{ margin: '10px 0' }}>{chinese.emoji} {chinese.animal}</h2>
                  <p><strong>{chinese.element} · {chinese.animal}</strong></p>
                  <p>{chinese.traits} This maps the Chinese year associated with {y}.</p>
                </div>
                <div className="reflection">
                  <span className="eyebrow">The boundary matters</span>
                  <h3>Born in January or February?</h3>
                  <p>This uses the Gregorian birth year. Births in January or early February can fall in the previous Chinese year under the Lunar New Year boundary; a full BaZi reading needs more than the year alone.</p>
                  <a className="text-button" href="https://www.hko.gov.hk/en/gts/time/conversion.htm" target="_blank" rel="noopener noreferrer">Calendar reference: Hong Kong Observatory ↗</a>
                </div>
              </div>
            </div>
          )}

          <div className="result-notes">
            <p><strong>For reflection and entertainment.</strong> An exact calculation within a tradition does not make that tradition a scientific explanation of personality or future events.</p>
            <WhatsAppShareButton message={shareMsg} label="Share my three lenses" />
          </div>
        </section>

        {/* HONESTY */}
        <section className="section" id="honesty">
          <div className="honesty">
            <div><span className="eyebrow">Our approach</span><h2>Personal to your inputs.<br />Not a claim about your future.</h2></div>
            <div className="honesty-items">
              <div><h3>Not a generic daily horoscope</h3><p>The date changes the arithmetic and calendar mapping. You can inspect the rule that produced the result.</p></div>
              <div><h3>Not scientific personality testing</h3><p>The symbolic meanings are traditions. A personalised calculation does not validate the associated interpretation.</p></div>
              <div><h3>Different systems stay distinct</h3><p>Tropical Sun signs, Chinese lunar years and Vedic sidereal charts use different conventions; they are not one combined score.</p></div>
              <div><h3>Your judgement stays yours</h3><p>Use a result as a journal prompt, not as a basis for medical, financial, legal or major life decisions.</p></div>
            </div>
          </div>
        </section>

        {/* EXPLORE + cross-links */}
        <section className="section white" id="explore">
          <div className="section-head"><div><span className="eyebrow">Keep exploring</span><h2>Follow a different thread.</h2></div><p>Choose the kind of discovery you came for.</p></div>
          <div className="crosslinks">
            <Link className="crosslink" to="/vedic-astrology">
              <div><span className="eyebrow">For a deeper chart</span><h3>Explore Vedic Astrology</h3><p>Sidereal positions, birth-time detail and traditional chart interpretation — actually computed.</p></div><span aria-hidden="true">↗</span>
            </Link>
            <Link className="crosslink" to="/celebrity-birthday">
              <div><span className="eyebrow">For a lighter discovery</span><h3>Meet your birthday twins</h3><p>Famous company and calendar connections worth sharing.</p></div><span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="lead" data-testid="mc-explore" style={{ maxWidth: 'none', marginTop: 20 }}>
            {([
              ['Numerology', '/numerology'], ['Name numerology', '/name-numerology'],
              ['Western zodiac', '/zodiac'], ['Chinese zodiac', '/chinese-zodiac'],
              ['Tarot by birthday', '/tarot-card-by-birthday'], ['Compatibility', '/compatibility'],
              ['Personal year number', '/personal-year-number'], ['Angel numbers', '/angel-numbers'],
            ] as Array<[string, string]>).map(([label, to], i, arr) => (
              <span key={label}><Link className="textlink" to={to}>{label}</Link>{i < arr.length - 1 && <span className="muted"> · </span>}</span>
            ))}
          </p>
        </section>

        {/* FAQ */}
        <section className="section white">
          <div className="faq-layout">
            <div><span className="eyebrow">Before you begin</span><h2>A few good questions.</h2></div>
            <div className="faq-list">
              <details><summary>Is this different from a generic horoscope?</summary><p>Yes. The numerology result and calendar assignments respond to your actual input, with the calculation method shown. The interpretations remain symbolic, not scientifically validated personal predictions.</p></details>
              <details><summary>Why could my Chinese zodiac differ elsewhere?</summary><p>This uses the Chinese year for your Gregorian birth year. Births in January or early February can fall in the previous Chinese year under the Lunar New Year boundary. A full BaZi reading also needs additional birth information.</p></details>
              <details><summary>Are Western and Vedic signs the same?</summary><p>No. This Western tool uses conventional tropical Sun-sign date ranges. Vedic systems typically use sidereal positions with a chosen ayanamsa — see the Vedic Astrology page. Different reference systems can produce different sign labels.</p></details>
            </div>
          </div>
        </section>
    </PajPage>
  );
}
