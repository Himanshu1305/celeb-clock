/**
 * Homepage — Option C "Animated Celestial Wheel" redesign (Part AH).
 *
 * Replaces the old hero + "choose your path" cards + category content blocks with:
 * animated celestial-wheel hero (real night-sky photo bg) → four color-coded orbit tiles
 * (the single category picker; the old choose-your-path section is REMOVED, not duplicated)
 * → sub-tools row → "Ask your chart anything" banner → proof strip → final CTA → full
 * four-way footer sitemap (the site-wide interlinking fix).
 *
 * Animations: continuous rotation/twinkle/float are gated behind
 * @media (prefers-reduced-motion: no-preference) AND disabled at ≤767px (mobile) for
 * performance — the hero is static on mobile. See the scoped <style> block below.
 *
 * Photos (real, sourced from Unsplash free/commercial-use library, served as optimized WebP):
 *  - Hero night sky: photo by Tobias Rademacher — https://unsplash.com/photos/oQR1B87HsNs
 *  - AI banner (cozy): photo by Vitaly Gariev — https://unsplash.com/photos/qAuSGkePHV0
 *
 * DOB entry reuses the existing DobInput + BirthDateContext + /results flow (not rebuilt).
 * No fabricated stats (the old made-up "birthdays decoded" counter and "42+ insights" were removed).
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { DobInput } from '@/components/DobInput';
import { useBirthDate } from '@/context/BirthDateContext';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SEO, WebSiteSchema } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';

const NAVY = '#0E2238', GOLD = '#C6A15B', IVORY = '#FAF7F0', INK = '#1A2230', INK2 = '#3E4759', MUTE = '#5B6472', DIV = '#E4DCC8';
const serif = "'Fraunces', Georgia, serif";
const sans = "'Public Sans', system-ui, sans-serif";

// Four category "planets" — verified-real routes (checked in App.tsx before shipping).
const CATEGORIES = [
  { key: 'vedic', label: 'Vedic Astrology', desc: 'Your real computed Kundli, Dasha & yogas.', to: '/vedic-astrology', grad: 'linear-gradient(135deg,#D9B978,#8A6D2F)' },
  { key: 'birthday', label: 'Birthday & Celebrity', desc: 'Celebrity twins, zodiac & numerology.', to: '/celebrity-birthday', grad: 'linear-gradient(135deg,#EE9077,#C7513A)' },
  { key: 'mystic', label: 'Mystic Corner', desc: 'Numerology, Western & Chinese zodiac.', to: '/mystic-corner', grad: 'linear-gradient(135deg,#49B3AC,#276E69)' },
  { key: 'science', label: 'Science & Longevity', desc: 'Research-backed life-expectancy tools.', to: '/life-expectancy', grad: 'linear-gradient(135deg,#6DBE6D,#2F6B33)' },
];

const SUB_TOOLS = [
  { label: 'Kundali Matching', to: '/kundali-match' },
  { label: 'Muhurat Finder', to: '/muhurat' },
  { label: 'Gemstones', to: '/gemstones' },
  { label: 'AI Astrologer', to: '/astrologer' },
  { label: 'Numerology', to: '/numerology' },
];

// Deterministic star positions (no Math.random — stable across renders/SSR).
const STARS = Array.from({ length: 36 }, (_, i) => ({
  top: (i * 37) % 100, left: (i * 61) % 100, d: (i % 5) * 0.7, s: 1 + (i % 3),
}));

const Index = () => {
  const { setBirthDate } = useBirthDate();
  const navigate = useNavigate();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Reused, existing DOB flow — unchanged.
  const handleFindTwin = () => {
    if (day && month && year) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) { setBirthDate(date); navigate('/results'); }
    }
  };
  const isFormValid = day && month && year &&
    parseInt(day) >= 1 && parseInt(day) <= 31 &&
    parseInt(month) >= 1 && parseInt(month) <= 12 &&
    parseInt(year) >= 1900 && parseInt(year) <= new Date().getFullYear();

  return (
    <div style={{ background: '#fff', color: INK, fontFamily: sans }}>
      <SEO
        title="BornClock — Vedic Astrology, Numerology & Birthday Tools"
        description="Your birth date, computed into one real chart — Vedic astrology, numerology, celebrity twins and longevity, calculated not templated. Not a generic horoscope."
        canonicalUrl="/"
        ogType="website"
      />
      <WebSiteSchema />
      <style>{`
        .ah-wheel,.ah-stars,.ah-star,.ah-tile{will-change:transform,opacity}
        @media (prefers-reduced-motion: no-preference) and (min-width: 768px){
          .ah-wheel{animation:ah-spin 90s linear infinite}
          .ah-stars{animation:ah-spinrev 160s linear infinite}
          .ah-star{animation:ah-tw 4s ease-in-out infinite}
          .ah-tile{animation:ah-float 6s ease-in-out infinite}
        }
        @keyframes ah-spin{to{transform:rotate(360deg)}}
        @keyframes ah-spinrev{to{transform:rotate(-360deg)}}
        @keyframes ah-tw{0%,100%{opacity:.25}50%{opacity:1}}
        @keyframes ah-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .ah-tile{transition:transform .2s ease, box-shadow .2s ease}
        .ah-tile:hover{transform:translateY(-6px) scale(1.03)}
        @media (prefers-reduced-motion:no-preference){ .fnt-load{} }
      `}</style>
      {/* fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* header */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* 1 · HERO */}
      <section data-testid="hero-section" className="relative overflow-hidden" style={{ background: NAVY }}>
        {/* real night-sky photo bg (Tobias Rademacher, Unsplash) + dark overlay for legibility */}
        <img src="/images/hero-nightsky.webp" alt="" aria-hidden="true" loading="eager" fetchPriority="high"
             className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.5 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,34,56,0.62), rgba(14,34,56,0.82))' }} />
        {/* counter-rotating starfield */}
        <div className="ah-stars absolute inset-0" aria-hidden="true">
          {STARS.map((st, i) => (
            <span key={i} className="ah-star absolute rounded-full bg-white" style={{ top: `${st.top}%`, left: `${st.left}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />
          ))}
        </div>
        {/* slowly rotating celestial chart-wheel */}
        <svg className="ah-wheel absolute left-1/2 top-1/2 opacity-20" width="620" height="620" viewBox="0 0 200 200"
             style={{ transform: 'translate(-50%,-50%)', color: GOLD }} aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="100" cy="100" r="95" /><circle cx="100" cy="100" r="72" /><circle cx="100" cy="100" r="48" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30) * Math.PI / 180, x = 100 + 95 * Math.cos(a), y = 100 + 95 * Math.sin(a);
              const xi = 100 + 48 * Math.cos(a), yi = 100 + 48 * Math.sin(a);
              return <line key={i} x1={xi} y1={yi} x2={x} y2={y} />;
            })}
            {Array.from({ length: 36 }, (_, i) => {
              const a = (i * 10) * Math.PI / 180;
              return <circle key={i} cx={100 + 95 * Math.cos(a)} cy={100 + 95 * Math.sin(a)} r="0.8" fill="currentColor" stroke="none" />;
            })}
          </g>
        </svg>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white" style={{ fontFamily: serif }}>
              Your birth date, mapped like the sky itself.
            </h1>
            <p className="mt-4 text-lg" style={{ color: '#C7CFDA' }}>
              Vedic astrology, numerology, celebrity twins, and longevity — one real, computed chart, not a generic horoscope.
            </p>
          </div>
          <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.96)', border: `1px solid ${DIV}` }}>
            <p className="text-sm font-semibold mb-2" style={{ color: INK }}>Enter your birthday</p>
            <DobInput label="" onChange={({ day: d, month: m, year: y }) => { setDay(d); setMonth(m); setYear(y); }} />
            <Button data-testid="hero-cta-button" onClick={handleFindTwin} disabled={!isFormValid}
                    className="w-full gap-2 text-lg py-6 mt-4" style={{ background: NAVY, color: '#fff' }}>
              <Sparkles className="w-5 h-5" /> Reveal Everything <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="mt-2 text-xs text-center" style={{ color: MUTE }}>Computed from your date · 100% free to start</p>
          </div>
        </div>
      </section>

      {/* 2 · CATEGORY ORBIT ROW (replaces the old "choose your path" section) */}
      <section data-testid="orbit-row" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] mb-8" style={{ color: MUTE }}>Choose your path</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((c) => (
            <Link key={c.key} to={c.to} data-testid={`orbit-${c.key}`} className="ah-tile block text-center group">
              <div className="mx-auto rounded-full mb-3" style={{ width: 120, height: 120, background: c.grad, boxShadow: '0 10px 30px rgba(14,34,56,0.18)' }} />
              <div className="font-bold" style={{ color: INK, fontFamily: serif }}>{c.label}</div>
              <div className="mt-1 text-sm" style={{ color: INK2 }}>{c.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3 · SUB-TOOLS ROW */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}`, borderBottom: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE }}>Popular tools</h2>
          <div data-testid="sub-tools" className="grid grid-cols-2 md:grid-cols-5">
            {SUB_TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="block p-4 hover:bg-white transition-colors font-semibold" style={{ borderLeft: `2px solid ${GOLD}`, color: NAVY, fontFamily: serif }}>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · ASK YOUR CHART ANYTHING (cozy photo, Vitaly Gariev / Unsplash) */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: serif, color: INK }}>Ask your chart anything.</h2>
          <p className="mt-2" style={{ color: INK2 }}>
            A private, judgment-free conversation grounded in your own birth chart — traditional guidance, offered gently and honestly.
          </p>
          <Link to="/astrologer" className="mt-4 inline-block px-6 py-3 rounded font-semibold" style={{ background: NAVY, color: '#fff' }}>
            Ask the AI Astrologer →
          </Link>
        </div>
        <img src="/images/ai-cozy.webp" alt="Someone checking their birth chart on a phone at home" loading="lazy"
             className="rounded-xl w-full object-cover" style={{ maxHeight: 320, border: `1px solid ${DIV}` }} width="900" height="600" />
      </section>

      {/* 5 · PROOF STRIP (consistent honest 3-part framing, matching the category pages) */}
      <section style={{ background: IVORY, borderTop: `1px solid ${DIV}` }}>
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3">
          {([
            ['Validated data', 'Charts computed with the Swiss Ephemeris and tested against real birth data — not a generic horoscope engine.'],
            ['Personal to you', 'Every result is calculated from the exact birth details you enter — not one paragraph recycled for millions.'],
            ['Honest, on purpose', 'No invented dates or false certainty; classical associations are labelled as exactly that.'],
          ] as Array<[string, string]>).map(([label, sentence], i) => (
            <div key={label} className="p-4" style={{ borderLeft: i === 0 ? 'none' : `1px solid ${DIV}` }}>
              <span className="font-semibold" style={{ color: GOLD }}>{label}</span>
              <span style={{ color: INK2 }}> — {sentence}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6 · FINAL CTA — real prices from src/lib/pricing.ts (REPORT_PRICE INR ₹199) */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: serif, color: INK }}>Want the full picture?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ border: `1px solid ${DIV}` }}>
          <Link to="/kundali" data-testid="cta-kundali" className="block p-6 hover:bg-[#FAF7F0] transition-colors">
            <div className="text-lg font-semibold" style={{ fontFamily: serif, color: INK }}>Kundali Report <span style={{ color: GOLD }}>₹199</span></div>
            <p className="mt-1 text-sm" style={{ color: INK2 }}>Your full computed Vedic birth-chart report — placements, Dasha, yogas and remedies.</p>
          </Link>
          <Link to="/birthday-report" data-testid="cta-birthday" className="block p-6 hover:bg-[#FAF7F0] transition-colors" style={{ borderLeft: `1px solid ${DIV}` }}>
            <div className="text-lg font-semibold" style={{ fontFamily: serif, color: INK }}>Birthday Blueprint <span style={{ color: GOLD }}>₹199</span></div>
            <p className="mt-1 text-sm" style={{ color: INK2 }}>Celebrity twins, zodiac, numerology, tarot and more for your exact date.</p>
          </Link>
        </div>
        <p className="mt-2 text-xs" style={{ color: MUTE }}>Premium members: reports covered by monthly credits.</p>
      </section>

      {/* 7 · FOOTER — full four-way sitemap (the interlinking fix). Every link verified real. */}
      <footer style={{ background: NAVY, color: '#C7CFDA' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          {([
            ['Vedic Astrology', [['Kundli', '/kundali'], ['Kundali Matching', '/kundali-match'], ['Dasha Timing', '/kundali'], ['Sade Sati', '/sade-sati'], ['Muhurat Finder', '/muhurat'], ['Gemstones', '/gemstones']]],
            ['Birthday & Celebrity', [['Celebrity Birthday Twins', '/celebrity-birthday'], ["Today's Birthdays", '/todays-birthdays'], ['Birthday Blueprint', '/birthday-report'], ['Age Calculator', '/age-calculator']]],
            ['Mystic Corner', [['Numerology', '/numerology'], ['Western Zodiac', '/zodiac'], ['Chinese Zodiac', '/chinese-zodiac'], ['Tarot', '/tarot-card-by-birthday'], ['Compatibility', '/compatibility']]],
            ['Science & Longevity', [['Life Expectancy', '/life-expectancy'], ['Biological Age', '/biological-age']]],
            ['Company', [['How It Works', '/how-it-works'], ['Privacy', '/privacy'], ['Contact', '/contact']]],
          ] as Array<[string, Array<[string, string]>]>).map(([col, links]) => (
            <div key={col}>
              <div className="font-semibold mb-2" style={{ color: '#fff', fontFamily: serif }}>{col}</div>
              <ul className="space-y-1">
                {links.map(([label, to]) => (
                  <li key={to + label}><Link to={to} className="hover:underline hover:text-white">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-8 text-xs" style={{ color: '#8B93A0' }}>
          © {'2026'} BornClock · Your birth date, computed — not guessed.
        </div>
      </footer>

      {/* home FAQ schema (kept for SEO continuity) */}
      <div className="max-w-6xl mx-auto px-4 py-8"><PageFAQ slug="home" title="Frequently Asked Questions" /></div>
    </div>
  );
};

export default Index;
