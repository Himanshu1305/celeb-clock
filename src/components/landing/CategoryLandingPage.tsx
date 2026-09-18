/**
 * Shared category-landing template (Parts W/Y/Z/AA). Extracted from Part W's proven
 * VedicAstrologyLanding so all four category pages render from ONE component and read
 * as a single coherent family (same header/hero pattern, same stats-strip, same
 * tool-card styles, same animation + language selector + density). Pages differ only in
 * the config passed in.
 *
 * Density (Part W Part 2): full `container mx-auto` width, grids fill the row, minimal
 * vertical padding. A11y: count-up stats are aria-hidden with an sr-only final value;
 * emoji icons aria-hidden; language selector is a real labelled control.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useSavedProfile } from '@/hooks/useSavedProfile';

const SITE_URL = 'https://bornclock.com';

export interface LandingStat { value: number; label: string; suffix?: string }
export interface LandingTool { to: string; emoji: string; name: string; desc?: string }
export interface LandingTier { key: string; heading: string; variant: 'flagship' | 'medium' | 'dense'; tools: LandingTool[] }

export interface CategoryLandingConfig {
  seo: { title: string; description: string; keywords: string; canonicalUrl: string };
  schema: { name: string; description: string; url: string };
  testid: string;                       // e.g. 'vedic' | 'science' | 'birthday' | 'mystic'
  badge: { label: string; icon: LucideIcon };
  headline: { lead: string; accent: string };
  /** 40–60 word direct-answer opening (SEO/AEO). */
  directAnswer: string;
  cta: { label: string; to: string };
  /** Show a "reuse your saved details" hint under the CTA when a full profile exists. */
  savedProfileHintTo?: string;
  stats: LandingStat[];
  tiers: LandingTier[];
  /** Closing "what makes this different" body. */
  closing: React.ReactNode;
}

/** Count-up 0→value on mount; rapidly-changing digits aria-hidden, sr-only final value. */
function StatCounter({ value, label, suffix = '' }: LandingStat) {
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
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center" data-testid="landing-stat">
      <div className="text-4xl md:text-5xl font-black text-indigo-600 tabular-nums" aria-hidden="true">{display}{suffix}</div>
      <span className="sr-only">{value}{suffix} {label}</span>
      <p className="text-sm text-muted-foreground mt-1" aria-hidden="true">{label}</p>
    </div>
  );
}

const TIER_GRID: Record<LandingTier['variant'], string> = {
  flagship: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  medium: 'grid grid-cols-2 lg:grid-cols-4 gap-3',
  dense: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3',
};

function Tier({ tier }: { tier: LandingTier }) {
  return (
    <section className="mt-8" data-testid={`landing-tier-${tier.key}`}>
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{tier.heading}</h2>
      <div className={TIER_GRID[tier.variant]}>
        {tier.tools.map(t => {
          const base = `group block rounded-2xl border border-border bg-card transition-all hover:border-indigo-500/50 hover:-translate-y-0.5`;
          if (tier.variant === 'flagship') {
            return (
              <Link key={t.to} to={t.to} data-testid={`landing-tool-${t.to.replace(/\//g, '')}`} className={`${base} p-6 hover:shadow-lg`}>
                <div className="text-3xl mb-2" aria-hidden="true">{t.emoji}</div>
                <h3 className="font-bold text-lg text-foreground">{t.name}</h3>
                {t.desc && <p className="text-sm text-muted-foreground leading-relaxed mt-1">{t.desc}</p>}
                <span className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3">
                  Open {t.name} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          }
          if (tier.variant === 'medium') {
            return (
              <Link key={t.to} to={t.to} data-testid={`landing-tool-${t.to.replace(/\//g, '')}`} className={`${base} flex items-center gap-3 p-4`}>
                <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{t.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{t.name}</span>
              </Link>
            );
          }
          return (
            <Link key={t.to} to={t.to} data-testid={`landing-tool-${t.to.replace(/\//g, '')}`} className={`${base} flex flex-col items-center text-center gap-1.5 p-3`}>
              <span className="text-2xl leading-none" aria-hidden="true">{t.emoji}</span>
              <span className="text-xs font-semibold text-foreground leading-tight">{t.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function CategoryLandingPage({ config }: { config: CategoryLandingConfig }) {
  const { profile, isFull } = useSavedProfile();
  const hasSaved = !!profile && isFull;
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [hindiNotice, setHindiNotice] = useState(false);
  const onLang = (next: 'en' | 'hi') => { if (next === 'hi') { setHindiNotice(true); return; } setLang('en'); setHindiNotice(false); };
  const BadgeIcon = config.badge.icon;

  // WebApplication schema rendered INLINE in the body (not via react-helmet) so the
  // prerender's outerHTML snapshot captures it reliably — helmet's rAF flush races the
  // snapshot and was intermittently dropping it for some pages (Part Y fix).
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.schema.name,
    description: config.schema.description,
    url: `${SITE_URL}${config.schema.url}`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: 'BornClock', url: SITE_URL },
  });

  return (
    <div className="min-h-screen bg-gradient-cosmic" data-testid={`landing-${config.testid}`}>
      <SEO title={config.seo.title} description={config.seo.description} keywords={config.seo.keywords} canonicalUrl={config.seo.canonicalUrl} ogType="website" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />

      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-6"><Navigation /><AuthNav /></header>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-5 py-12 md:py-16" data-testid="landing-hero">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="absolute rounded-full border border-indigo-400/10 w-[320px] h-[320px] animate-[spin_60s_linear_infinite]" />
            <div className="absolute rounded-full border border-indigo-400/10 w-[520px] h-[520px] animate-[spin_90s_linear_infinite_reverse]" />
            <div className="absolute rounded-full border border-indigo-400/10 w-[720px] h-[720px] animate-[spin_120s_linear_infinite]" />
          </div>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 text-xs">
            <label className="sr-only" htmlFor={`${config.testid}-lang`}>Page language</label>
            <button type="button" data-testid="landing-lang-en" onClick={() => onLang('en')} aria-pressed={lang === 'en'}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>EN</button>
            <button type="button" data-testid="landing-lang-hi" onClick={() => onLang('hi')} aria-pressed={false}
              className="px-3 py-1 rounded-full font-medium text-muted-foreground hover:text-foreground transition-colors">हि</button>
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-700">
              <BadgeIcon className="w-3.5 h-3.5" aria-hidden="true" /> {config.badge.label}
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-black text-foreground leading-tight">
              {config.headline.lead}{' '}<span className="text-indigo-600">{config.headline.accent}</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed" data-testid="landing-answer">{config.directAnswer}</p>
            {hindiNotice && (
              <p data-testid="landing-hindi-notice" className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                हिंदी संस्करण जल्द आ रहा है — Hindi for this page is coming soon. The English version is shown for now.
              </p>
            )}
            <div className="mt-6">
              <Link to={config.cta.to} data-testid="landing-hero-cta"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors">
                {config.cta.label} <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              {config.savedProfileHintTo && hasSaved && (
                <p data-testid="landing-saved-hint" className="mt-2 text-xs text-muted-foreground">
                  We'll reuse your saved birth details ({profile!.dob}) — no re-entry needed.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* STATS — literal grid classes (Tailwind purge-safe) */}
        {config.stats.length > 0 && (
          <section className={`grid grid-cols-1 gap-4 mt-6 ${config.stats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`} data-testid="landing-stats" aria-label={`${config.badge.label} by the numbers`}>
            {config.stats.map(s => <StatCounter key={s.label} value={s.value} label={s.label} />)}
          </section>
        )}

        {/* TOOL TIERS */}
        {config.tiers.map(t => <Tier key={t.key} tier={t} />)}

        {/* CLOSING */}
        <section className="mt-8 mb-4" data-testid="landing-closing">
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 md:p-8 text-center max-w-3xl mx-auto">
            {config.closing}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default CategoryLandingPage;
