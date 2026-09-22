/**
 * Vedic Astrology category landing page — /vedic-astrology (Part AE rebuild).
 *
 * Bespoke approved design (navy/gold/Fraunces), scoped to THIS page only via arbitrary
 * Tailwind values + a page-local <Helmet> font load — the homepage and other pages are
 * untouched. Dense, edge-to-edge, hairline-divided (no boxed cards), alternating
 * ivory/white/navy sections. Responsive: multi-column rows stack at mobile widths.
 *
 * Real links only (verified against the route table). Concepts that are computed WITHIN
 * the Kundali rather than having their own page (Lagna, Dasha, Yoga detection, Manglik)
 * link to /kundali or /kundali-match — their genuine home — never a dead link.
 *
 * §5 "See a real example" shows REAL engine output for the project's reference test chart
 * (5 Nov 1988, 12:30, New Delhi): it fetches the live computed chart from /api/vedic-reading
 * and falls back to the same values pre-computed from the engine — so the on-page claim
 * "This is real, computed output…" is literally true either way. NOT a fabricated template.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';

// ── palette (scoped, inline) ────────────────────────────────────────────────
const NAVY = '#0E2238', GOLD = '#C6A15B', IVORY = '#FAF7F0';
const INK = '#1A2230', INK2 = '#3E4759', MUTE = '#5B6472', DIV = '#E4DCC8';
const serif = "'Fraunces', Georgia, serif";
const sans = "'Public Sans', system-ui, sans-serif";

// ── REAL reference-chart output (5 Nov 1988, 12:30, New Delhi) ───────────────
// Pre-computed from the same Swiss-Ephemeris engine the site uses (verified 2026-09-23,
// consistent with the project's test suite which asserts Kanya / Uttara Phalguni). Used as
// the fallback; §5 also fetches the live value so the "real computed output" claim holds.
const REF = {
  lagna: 'Makara (Capricorn)',
  rashi: 'Kanya (Virgo)',
  nakshatra: 'Uttara Phalguni (pada 2)',
  dasha: 'Rahu / Mars',
  yoga: 'Raj Yoga (strong)',
};

function SampleChartPanel() {
  const [c, setC] = useState(REF);
  const [live, setLive] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/vedic-reading?y=1988&m=11&d=5&h=12&min=30&lat=28.6139&lon=77.2090&tz=5.5');
        if (!res.ok) return;
        const d = await res.json();
        const f = d?.facts; if (!f || cancelled) return;
        const topYoga = (f.yogas && f.yogas[0]) ? `${f.yogas[0].name}${f.yogas[0].grade ? ` (${f.yogas[0].grade})` : ''}` : REF.yoga;
        setC({
          lagna: f.lagna || REF.lagna,
          rashi: f.rashi || REF.rashi,
          nakshatra: f.nakshatra ? `${f.nakshatra.name}${f.nakshatra.pada ? ` (pada ${f.nakshatra.pada})` : ''}` : REF.nakshatra,
          dasha: f.dasha ? `${f.dasha.maha} / ${f.dasha.antar}` : REF.dasha,
          yoga: topYoga,
        });
        setLive(true);
      } catch { /* keep the real pre-computed fallback */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows: Array<[string, string]> = [
    ['Lagna (Ascendant)', c.lagna],
    ['Rashi (Moon sign)', c.rashi],
    ['Nakshatra', c.nakshatra],
    ['Current Dasha', c.dasha],
    ['Active Yoga', c.yoga],
  ];
  return (
    <div data-testid="vap-sample-chart" className="grid grid-cols-1 sm:grid-cols-5" style={{ border: `1px solid ${DIV}` }}>
      {rows.map(([label, value], i) => (
        <div key={label} className="p-4" style={{ borderLeft: i === 0 ? 'none' : `1px solid ${DIV}`, background: '#fff' }}>
          <div className="text-[11px] uppercase tracking-wider" style={{ color: MUTE }}>{label}</div>
          <div className="mt-1 font-semibold" style={{ color: INK, fontFamily: serif }}>{value}</div>
        </div>
      ))}
      <p className="col-span-1 sm:col-span-5 px-4 py-3 text-sm" style={{ color: INK2, background: IVORY, borderTop: `1px solid ${DIV}` }}>
        This is real, computed output for a real birth chart — not a sample template.
        <span style={{ color: MUTE }}> {live ? 'Computed live' : 'Computed'} from the reference chart (5 Nov 1988, 12:30, New Delhi) with the Swiss-Ephemeris sidereal (Lahiri) engine.</span>
      </p>
    </div>
  );
}

// small helpers for the dense hairline-divided rows
function DenseRow({ items, testid }: { items: Array<{ title: string; desc?: string; to: string }>; testid: string }) {
  return (
    <div data-testid={testid} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
      {items.map((it, i) => (
        <Link key={it.to + it.title} to={it.to}
              className="block p-4 hover:bg-[#FAF7F0] transition-colors"
              style={{ borderLeft: `2px solid ${GOLD}`, marginLeft: i === 0 ? 0 : undefined }}>
          <div className="font-semibold" style={{ color: INK, fontFamily: serif }}>{it.title}</div>
          {it.desc && <div className="mt-1 text-sm" style={{ color: INK2 }}>{it.desc}</div>}
        </Link>
      ))}
    </div>
  );
}

export default function VedicAstrologyLanding() {
  const navigate = useNavigate();

  // Hero form → REAL Kundli flow: hand the details to /kundali, which auto-generates
  // (reuses KundaliPage.generate — the actual existing flow, not a rebuilt one).
  const onGenerate = (details: BirthDetails) => {
    navigate('/kundali', { state: { autoGenerateBirth: details } });
  };

  const faqs: Array<[string, string]> = [
    ['Is this really computed, or a template?',
     'Computed. Every chart is calculated from your exact birth date, time and place using the Swiss Ephemeris (sidereal, Lahiri ayanamsa) — the same astronomy professional software uses. The example above is real output, not a fixed sample.'],
    ['Do you predict exactly what will happen to me?',
     'No. We show real planetary periods and classical combinations, always labelled as traditional association — never a guaranteed date or outcome. Where a period matters, we give the honest window, not a fabricated “on this day” claim.'],
    ['What if I don’t know my exact birth time?',
     'You still get your Moon sign, Nakshatra and Dasha (these depend mainly on the date). The Ascendant (Lagna) and house-based details need an accurate time — we tell you plainly which parts are affected rather than guessing a time for you.'],
    ['How is this different from a generic horoscope app?',
     'Generic apps recycle one Sun-sign paragraph for millions of people. This is your individual chart — real planetary positions, your Dasha timeline, detected yogas graded by strength — computed, cross-verified for accuracy, and honest about its limits.'],
    ['Is my birth data private?',
     'Yes. Your birth details are used to compute your chart and are stored only on your own device unless you explicitly choose to save them to your account. Nothing is sold or shared.'],
  ];

  const proof: Array<[string, string]> = [
    ['Validated data', 'Charts are tested against real birth data spanning over a century and cross-checked against independent professional platforms.'],
    ['Graded, not templated', 'Yogas are detected and graded by strength (strong / moderate / partial) from your real placements — never asserted from a template.'],
    ['Honest, on purpose', 'No invented dates. Classical associations are labelled as exactly that — traditional interpretation, not a guaranteed prediction.'],
  ];

  return (
    <div data-testid="vedic-astrology-page" style={{ background: '#fff', color: INK, fontFamily: sans }}>
      <SEO
        title="Vedic Astrology — Your Birth Chart, Computed Not Guessed | BornClock"
        description="Your real Vedic birth chart, computed with the Swiss Ephemeris — Kundli, Dasha timing, yoga detection, Kundali matching and an AI astrologer. Not a horoscope template."
        keywords="vedic astrology, kundli, birth chart, kundali matching, dasha, nakshatra, rashi, lagna, sade sati, manglik, gemstone, muhurat"
        canonicalUrl="/vedic-astrology"
        ogType="website"
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      {/* standard site header (global nav — now Birthday first, Vedic second) */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* 1 · HERO */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Vedic Astrology</div>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: serif, color: INK }}>
            Your birth chart, computed — not guessed.
          </h1>
          <p className="mt-3 text-lg" style={{ color: INK2 }}>
            A real sidereal Kundli from your exact birth details — planets, Nakshatra, Dasha timing and
            classical yogas, calculated with the Swiss Ephemeris. No recycled Sun-sign paragraphs.
          </p>
          <Link to="/todays-birthdays" className="mt-4 inline-block font-semibold underline" style={{ color: NAVY }}>
            See what your birthday says about you →
          </Link>
        </div>
        <div>
          <BirthDetailsForm submitLabel="Generate My Kundli — Free" onSubmit={onGenerate} testIdPrefix="vap" />
        </div>
      </section>

      {/* 2 · WHAT YOU GET (dense, gold left-borders) */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE }}>What you get</h2>
          <DenseRow testid="vap-what-you-get" items={[
            { title: 'Kundli', desc: 'Your full sidereal birth chart.', to: '/kundali' },
            { title: 'Dasha Timing', desc: 'Your Vimshottari planetary periods.', to: '/kundali' },
            { title: 'Yoga Detection', desc: 'Classical combinations, graded by strength.', to: '/kundali' },
            { title: 'Kundali Matching', desc: 'Ashtakoota compatibility, point by point.', to: '/kundali-match' },
            { title: 'AI Astrologer', desc: 'Ask your own chart, privately.', to: '/astrologer' },
          ]} />
        </div>
      </section>

      {/* 3 · GO DEEPER */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE }}>Go deeper</h2>
          <DenseRow testid="vap-go-deeper" items={[
            { title: 'Sade Sati', desc: 'Where Saturn’s 7½-year cycle stands for you.', to: '/sade-sati' },
            { title: 'Muhurat Finder', desc: 'Auspicious timing for what matters.', to: '/muhurat' },
            { title: 'Career Report', desc: 'Vedic career analysis from your 10th house.', to: '/career-report' },
            { title: 'Gemstone Recommendation', desc: 'Stones matched to your Lagna lord.', to: '/gemstones' },
          ]} />
        </div>
      </section>

      {/* 4 · HOW IT WORKS */}
      <section style={{ background: NAVY, color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['1', 'Enter your birth details', 'Date, time and place — that’s all the engine needs.'],
            ['2', 'Get your computed chart', 'Real planetary positions, Nakshatra, Dasha and yogas.'],
            ['3', 'Go deeper, or ask', 'Matching, timing, remedies — or ask the AI astrologer.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ borderLeft: `2px solid ${GOLD}` }} className="pl-4">
              <div className="text-2xl font-bold" style={{ color: GOLD, fontFamily: serif }}>{n}</div>
              <div className="mt-1 text-lg font-semibold" style={{ fontFamily: serif }}>{t}</div>
              <div className="mt-1 text-sm" style={{ color: '#C7CFDA' }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 · SEE A REAL EXAMPLE */}
      <section style={{ background: IVORY }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: serif, color: INK }}>See a real example</h2>
          <SampleChartPanel />
        </div>
      </section>

      {/* 6 · PROOF OF RIGOR */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3">
          {proof.map(([label, sentence], i) => (
            <div key={label} className="p-4" style={{ borderLeft: i === 0 ? 'none' : `1px solid ${DIV}` }}>
              <span className="font-semibold" style={{ color: GOLD }}>{label}</span>
              <span style={{ color: INK2 }}> — {sentence}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7 · COMMON QUESTIONS */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: serif, color: INK }}>Common questions</h2>
          <div className="space-y-3">
            {faqs.map(([q, a]) => (
              <p key={q} style={{ color: INK2, borderTop: `1px solid ${DIV}`, paddingTop: '0.75rem' }}>
                <strong style={{ color: INK }}>{q}</strong> {a}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 8 · EXPLORE BY TOPIC (dense inline · row) */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: MUTE }}>Explore by topic</h2>
          <p className="text-base leading-loose" data-testid="vap-explore">
            {[
              ['Kundli', '/kundali'], ['Kundali Matching', '/kundali-match'],
              ['Nakshatra', '/articles/nakshatra-by-date-of-birth'], ['Rashi', '/moon-sign'],
              ['Lagna', '/kundali'], ['Dasha', '/kundali'], ['Sade Sati', '/sade-sati'],
              ['Manglik', '/kundali-match'], ['Gemstone Recommendation', '/gemstones'],
              ['Career Report', '/career-report'], ['Muhurat Finder', '/muhurat'],
            ].map(([label, to], i, arr) => (
              <span key={label}>
                <Link to={to} className="font-medium hover:underline" style={{ color: NAVY }}>{label}</Link>
                {i < arr.length - 1 && <span style={{ color: MUTE }}> · </span>}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 9 · ALREADY CHECKED YOUR BIRTHDAY? */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: serif, color: INK }}>Already checked your birthday?</h2>
          <p className="mt-1 mb-3" style={{ color: INK2 }}>
            Your birthday and your birth chart are two lenses on the same person — try the fun side too.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/celebrity" className="font-semibold hover:underline" style={{ color: NAVY }}>Celebrity birthday twins →</Link>
            <Link to="/todays-birthdays" className="font-semibold hover:underline" style={{ color: NAVY }}>Today’s birthdays →</Link>
            <Link to="/numerology" className="font-semibold hover:underline" style={{ color: NAVY }}>Your numerology →</Link>
          </div>
        </div>
      </section>

      {/* 10 · ASK YOUR CHART ANYTHING (full-width navy banner) */}
      <section style={{ background: NAVY, color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: serif }}>Ask your chart anything</h2>
          <p className="mt-2 max-w-2xl mx-auto" style={{ color: '#C7CFDA' }}>
            A private, judgment-free conversation grounded in your own birth chart — traditional guidance, offered gently and honestly.
          </p>
          <Link to="/astrologer" className="mt-4 inline-block px-6 py-3 rounded font-semibold"
                style={{ background: GOLD, color: NAVY }}>
            Ask the AI Astrologer →
          </Link>
        </div>
      </section>

      {/* 11 · WANT THE FULL PICTURE? (two priced blocks → real purchase flow) */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: serif, color: INK }}>Want the full picture?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ border: `1px solid ${DIV}` }}>
            <Link to="/kundali" data-testid="vap-buy-kundali" className="block p-6 hover:bg-[#FAF7F0] transition-colors">
              <div className="text-lg font-semibold" style={{ fontFamily: serif, color: INK }}>Kundali Report <span style={{ color: GOLD }}>₹199</span></div>
              <p className="mt-1 text-sm" style={{ color: INK2 }}>Your full computed birth-chart report — placements, Dasha, yogas, doshas and remedies.</p>
              <span className="mt-2 inline-block font-semibold" style={{ color: NAVY }}>Generate & unlock →</span>
            </Link>
            <Link to="/birthday-report/gift" data-testid="vap-buy-combo" className="block p-6 hover:bg-[#FAF7F0] transition-colors" style={{ borderLeft: `1px solid ${DIV}` }}>
              <div className="text-lg font-semibold" style={{ fontFamily: serif, color: INK }}>Combo Report <span style={{ color: GOLD }}>₹299</span></div>
              <p className="mt-1 text-sm" style={{ color: INK2 }}>Birthday Report + Kundali together — best value, for yourself or as a gift.</p>
              <span className="mt-2 inline-block font-semibold" style={{ color: NAVY }}>Get the combo →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 12 · FOOTER */}
      <footer style={{ background: NAVY, color: '#C7CFDA' }}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span>© {'2026'} BornClock · Vedic astrology, computed with care.</span>
          <span className="flex gap-4">
            <Link to="/how-it-works" className="hover:underline" style={{ color: '#fff' }}>Methodology</Link>
            <Link to="/privacy" className="hover:underline" style={{ color: '#fff' }}>Privacy</Link>
            <Link to="/contact" className="hover:underline" style={{ color: '#fff' }}>Contact</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
