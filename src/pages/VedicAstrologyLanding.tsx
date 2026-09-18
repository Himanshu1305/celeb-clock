/**
 * Vedic Astrology category landing page (Part W) — /vedic-astrology.
 *
 * A genuinely new SEO/AEO landing page for the Vedic Astrology tool category. Links
 * out to all 14 real existing tool pages (no new tool logic). Stats use REAL, verified
 * engine numbers (Phase 0): 5 classical yogas detected, 8 divisional charts computed,
 * 14 Vedic tools — NOT the prompt's assumed 11/16 (see docs/part-w-touchpoints.md).
 *
 * Layout: edge-to-edge density (Part 2) — full `container mx-auto` width, grids fill the
 * row, minimal vertical padding between sections. SEO/AEO (Part 1.5): specific title +
 * meta, a 40–60 word direct-answer opening, WebApplication schema, indexable, sitemap +
 * prerender wired separately. Saved profile (Part 3) reused via useSavedProfile.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema } from '@/components/SEO';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { Moon, ArrowRight } from 'lucide-react';

// ── Real, verified stat values (Phase 0) ────────────────────────────────────
const STATS = [
  { value: 5, label: 'Classical yogas detected' },
  { value: 8, label: 'Divisional charts computed' },
  { value: 14, label: 'Vedic tools, all in one place' },
];

// ── The 14 real tools, grouped into the three tiers (Part 1) ─────────────────
const CORE_TOOLS = [
  { to: '/kundali', emoji: '🪔', name: 'Free Kundali', desc: 'Your full sidereal birth chart — planets, houses, Nakshatra and Vimshottari Dasha.' },
  { to: '/kundali-match', emoji: '💑', name: 'Kundali Matching', desc: 'Ashtakoota (Guna Milan) compatibility with the real point-by-point breakdown.' },
  { to: '/astrologer', emoji: '💬', name: 'Ask an Astrologer (AI)', desc: 'A private conversation grounded in your own chart — traditional guidance, gently.' },
];
const TIMING_TOOLS = [
  { to: '/sade-sati', emoji: '🪐', name: 'Sade Sati Calculator' },
  { to: '/muhurat', emoji: '🗓️', name: 'Muhurat Finder' },
  { to: '/career-report', emoji: '💼', name: 'Career Analysis' },
  { to: '/gemstones', emoji: '💍', name: 'Gemstone Suggestions' },
];
const SIGN_TOOLS = [
  { to: '/zodiac', emoji: '♈', name: 'Western Zodiac' },
  { to: '/chinese-zodiac', emoji: '🐉', name: 'Chinese Zodiac' },
  { to: '/vedic-zodiac', emoji: '🕉️', name: 'Indian Zodiac (Vedic)' },
  { to: '/moon-sign', emoji: '🌙', name: 'Moon Sign Calculator' },
  { to: '/compatibility', emoji: '💕', name: 'Compatibility Calculator' },
  { to: '/sun-vs-moon-sign', emoji: '☀️', name: 'Sun Sign vs Moon Sign' },
  { to: '/rashi-ratna', emoji: '💎', name: 'Rashi Ratna' },
];

/** Count-up from 0 → value on mount (matches the site's on-mount animation convention:
 *  the homepage hero counter and BentoGrid both animate on mount). The rapidly-changing
 *  digits are aria-hidden; a static sr-only final value is exposed to assistive tech so
 *  a screen reader announces the real number once, not every frame. */
function StatCounter({ value, label }: { value: number; label: string }) {
  const [display, setDisplay] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const durationMs = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value); // guarantee the exact final value (Part 4 negative case)
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center" data-testid="vedic-stat">
      <div className="text-4xl md:text-5xl font-black text-indigo-600 tabular-nums" aria-hidden="true">{display}</div>
      <span className="sr-only">{value} {label}</span>
      <p className="text-sm text-muted-foreground mt-1" aria-hidden="true">{label}</p>
    </div>
  );
}

export default function VedicAstrologyLanding() {
  const { profile, isFull } = useSavedProfile();
  const hasSaved = !!profile && isFull;
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [hindiNotice, setHindiNotice] = useState(false);

  // Language selector: English works; Hindi is honestly "coming soon" for THIS page
  // (no silent fail) — Part 0/1 decision, flagged as a follow-up.
  const onLang = (next: 'en' | 'hi') => {
    if (next === 'hi') { setHindiNotice(true); return; }
    setLang('en'); setHindiNotice(false);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Free Vedic Astrology — Kundali, Birth Chart & Dasha | BornClock"
        description="Free Vedic astrology done right: a real sidereal Kundali (birth chart), Kundali matching, AI astrologer, Dasha timing, yogas and divisional charts — computed with the Swiss Ephemeris, not guessed. 14 tools in one place."
        keywords="vedic astrology, free kundali, birth chart, janam kundali, kundali matching, dasha, nakshatra, moon sign, sidereal astrology, ashtakoota"
        canonicalUrl="/vedic-astrology"
        ogType="website"
      />
      <WebApplicationSchema
        name="BornClock Vedic Astrology"
        description="Free Vedic astrology tools — real sidereal Kundali, Kundali matching, AI astrologer, Dasha timing, yogas and divisional charts, computed with the Swiss Ephemeris."
        url="/vedic-astrology"
      />

      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-6">
          <Navigation />
          <AuthNav />
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-5 py-12 md:py-16" data-testid="vedic-hero">
          {/* Faint, slow orbital-ring decoration (CSS only, tasteful, low opacity) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="absolute rounded-full border border-indigo-400/10 w-[320px] h-[320px] animate-[spin_60s_linear_infinite]" />
            <div className="absolute rounded-full border border-indigo-400/10 w-[520px] h-[520px] animate-[spin_90s_linear_infinite_reverse]" />
            <div className="absolute rounded-full border border-indigo-400/10 w-[720px] h-[720px] animate-[spin_120s_linear_infinite]" />
          </div>

          {/* Language selector (top-right) */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 text-xs">
            <label className="sr-only" htmlFor="vedic-lang">Page language</label>
            <button
              type="button" data-testid="vedic-lang-en"
              onClick={() => onLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >EN</button>
            <button
              type="button" data-testid="vedic-lang-hi"
              onClick={() => onLang('hi')}
              aria-pressed={false}
              className="px-3 py-1 rounded-full font-medium text-muted-foreground hover:text-foreground transition-colors"
            >हि</button>
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-700">
              <Moon className="w-3.5 h-3.5" aria-hidden="true" /> Vedic astrology
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-black text-foreground leading-tight">
              Most Kundali generators guess.{' '}
              <span className="text-indigo-600">Ours computes.</span>
            </h1>
            {/* Direct-answer opening (Part 1.5, ~50 words) — snippet/AEO-liftable */}
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed" data-testid="vedic-answer">
              BornClock's Vedic astrology is a free suite of birth-chart tools that use real
              sidereal (Lahiri) astronomy — a genuine Kundali, Kundali matching, an AI
              astrologer, Dasha timing, classical yogas and divisional charts — rigorously
              tested against birth charts spanning over a century, cross-verified against
              independent professional platforms for accuracy.
            </p>
            {hindiNotice && (
              <p data-testid="vedic-hindi-notice" className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                हिंदी संस्करण जल्द आ रहा है — Hindi for this page is coming soon. The English version is shown for now.
              </p>
            )}
            <div className="mt-6">
              <Link
                to="/kundali"
                data-testid="vedic-hero-cta"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors"
              >
                Get my free Kundali <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              {hasSaved && (
                <p data-testid="vedic-saved-hint" className="mt-2 text-xs text-muted-foreground">
                  We'll reuse your saved birth details ({profile!.dob}) — no re-entry needed.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── STATS STRIP (animated count-up, real numbers) ─────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6" data-testid="vedic-stats" aria-label="BornClock Vedic astrology by the numbers">
          {STATS.map(s => <StatCounter key={s.label} value={s.value} label={s.label} />)}
        </section>

        {/* ── YOUR CORE CHART (3 flagship tools, larger treatment) ──────────── */}
        <section className="mt-8" data-testid="vedic-core">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">Your core chart</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CORE_TOOLS.map(t => (
              <Link
                key={t.to} to={t.to}
                data-testid={`vedic-tool-${t.to.replace(/\//g, '')}`}
                className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-2" aria-hidden="true">{t.emoji}</div>
                <h3 className="font-bold text-lg text-foreground">{t.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{t.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3">
                  Open {t.name} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── TIMING AND LIFE GUIDANCE (4 tools, medium treatment) ──────────── */}
        <section className="mt-8" data-testid="vedic-timing">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">Timing and life guidance</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TIMING_TOOLS.map(t => (
              <Link
                key={t.to} to={t.to}
                data-testid={`vedic-tool-${t.to.replace(/\//g, '')}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-indigo-500/50 hover:-translate-y-0.5"
              >
                <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{t.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{t.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SIGNS AND COMPATIBILITY (7 tools, densest treatment) ──────────── */}
        <section className="mt-8" data-testid="vedic-signs">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">Signs and compatibility</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {SIGN_TOOLS.map(t => (
              <Link
                key={t.to} to={t.to}
                data-testid={`vedic-tool-${t.to.replace(/\//g, '')}`}
                className="group flex flex-col items-center text-center gap-1.5 rounded-xl border border-border bg-card p-3 transition-all hover:border-indigo-500/50 hover:-translate-y-0.5"
              >
                <span className="text-2xl leading-none" aria-hidden="true">{t.emoji}</span>
                <span className="text-xs font-semibold text-foreground leading-tight">{t.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── WHAT MAKES THIS DIFFERENT (closing callout) ───────────────────── */}
        <section className="mt-8 mb-4" data-testid="vedic-different">
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 md:p-8 text-center max-w-3xl mx-auto">
            <p className="text-base md:text-lg text-foreground leading-relaxed">
              We detect real classical planetary combinations (yogas), compute your exact
              Dasha timing down to the month, and never guess where a shortcut would do.
              <strong className="text-indigo-700"> This isn't a horoscope. It's your actual birth chart, done right.</strong>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
