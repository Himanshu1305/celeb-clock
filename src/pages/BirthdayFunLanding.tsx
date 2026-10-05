/**
 * Birthday Fun & Celebrity Twins category landing page (Part Z) — /birthday-fun.
 * Migrated onto the central ToolLayout (theme "birthday"). Exact approved hero copy
 * (NO "waste your time" framing — explicitly rejected). Real verified celebrity count:
 * celebrities.json holds 3,107 entries → "3,000+" (the Part V-resolved number, not the
 * stale "50,000+"). 7 tools in this category. All SEO, schema, stats, tiers, CTA,
 * saved-profile hint, language selector and data-testids preserved unchanged.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Cake, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ToolLayout } from '@/components/central';
import { useSavedProfile } from '@/hooks/useSavedProfile';

const SITE_URL = 'https://bornclock.com';

interface LandingStat { value: number; label: string; suffix?: string }
interface LandingTool { to: string; emoji: string; name: string; desc?: string }
interface LandingTier { key: string; heading: string; variant: 'flagship' | 'medium' | 'dense'; tools: LandingTool[] }

const SEO_CONFIG = {
  title: 'Birthday Fun & Celebrity Twins — Who Shares Your Birthday | BornClock',
  description: "Find your celebrity birthday twin and the real depth most sites skip — their Nakshatra, zodiac sign and numerology. See who's celebrating today, your exact age to the second, planetary age and more. 3,000+ celebrities.",
  keywords: 'celebrity birthday twin, who shares my birthday, famous birthdays today, age calculator, age in seconds, planetary age, birthday countdown',
  canonicalUrl: '/birthday-fun',
};
const SCHEMA_CONFIG = {
  name: 'BornClock Birthday Fun & Celebrity Twins',
  description: "Find your celebrity birthday twin with real depth — Nakshatra, zodiac and numerology — plus today's birthdays, exact age tools and planetary age. 3,000+ celebrities.",
  url: '/birthday-fun',
};
const TESTID = 'birthday';
const BADGE: { label: string; icon: LucideIcon } = { label: 'Birthday Fun & Celebrity Twins', icon: Cake };
const HEADLINE = { lead: '3,000+ celebrities, and', accent: 'real depth most sites skip.' };
const DIRECT_ANSWER = "Not just who shares your birthday — their actual Nakshatra, their zodiac sign, their numerology. See who's celebrating today, check back daily, and discover connections nobody else shows you. Your age, down to the second. Your birthday twin, waiting to be found.";
const CTA = { label: 'Find my birthday twin', to: '/celebrity-birthday' };
const SAVED_PROFILE_HINT_TO = '/celebrity-birthday';
const STATS: LandingStat[] = [
  { value: 3000, suffix: '+', label: 'Celebrities in the database' },
  { value: 7, label: 'Birthday & age tools' },
  { value: 366, label: 'Days of birthdays covered' },
];
const TIERS: LandingTier[] = [
  { key: 'core', heading: 'Start here', variant: 'flagship', tools: [
    { to: '/age-calculator', emoji: '⏰', name: 'Age Calculator', desc: 'Your exact age — years, days, hours, right down to the second, updating live.' },
    { to: '/celebrity-birthday', emoji: '🌟', name: 'Celebrity Match', desc: 'Find the famous faces who share your birthday — with their real Nakshatra, zodiac and numerology.' },
    { to: '/todays-birthdays', emoji: '🎂', name: "Today's Birthdays", desc: "See who's celebrating today, and check back daily for a fresh cast of famous birthdays." },
  ] },
  { key: 'supporting', heading: 'More birthday tools', variant: 'medium', tools: [
    { to: '/birthday-countdown', emoji: '🎉', name: 'Birthday Countdown' },
    { to: '/age-in-days', emoji: '📅', name: 'Age in Days' },
    { to: '/age-in-seconds', emoji: '⏱️', name: 'Age in Seconds' },
    { to: '/planetary-age', emoji: '🌏', name: 'Planetary Age' },
  ] },
];
const CLOSING = (
  <p className="text-base md:text-lg text-foreground leading-relaxed">
    Most birthday sites stop at a name and a photo. We go further — the Nakshatra,
    zodiac and numerology behind every celebrity twin, your age to the exact second,
    and a fresh set of birthdays every single day.
    <strong className="text-[#6E5AA6]"> Come find who you share your day with.</strong>
  </p>
);

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
      <div className="text-4xl md:text-5xl font-black text-[#6E5AA6] tabular-nums" aria-hidden="true">{display}{suffix}</div>
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
          const base = `group block rounded-2xl border border-border bg-card transition-all hover:border-[#6E5AA6]/50 hover:-translate-y-0.5`;
          if (tier.variant === 'flagship') {
            return (
              <Link key={t.to} to={t.to} data-testid={`landing-tool-${t.to.replace(/\//g, '')}`} className={`${base} p-6 hover:shadow-lg`}>
                <div className="text-3xl mb-2" aria-hidden="true">{t.emoji}</div>
                <h3 className="font-bold text-lg text-foreground">{t.name}</h3>
                {t.desc && <p className="text-sm text-muted-foreground leading-relaxed mt-1">{t.desc}</p>}
                <span className="inline-flex items-center gap-1 text-sm text-[#6E5AA6] font-medium mt-3">
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

export default function BirthdayFunLanding() {
  const { profile, isFull } = useSavedProfile();
  const hasSaved = !!profile && isFull;
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [hindiNotice, setHindiNotice] = useState(false);
  const onLang = (next: 'en' | 'hi') => { if (next === 'hi') { setHindiNotice(true); return; } setLang('en'); setHindiNotice(false); };
  const BadgeIcon = BADGE.icon;

  // WebApplication schema rendered INLINE in the body (not via react-helmet) so the
  // prerender's outerHTML snapshot captures it reliably — helmet's rAF flush races the
  // snapshot and was intermittently dropping it for some pages (Part Y fix).
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SCHEMA_CONFIG.name,
    description: SCHEMA_CONFIG.description,
    url: `${SITE_URL}${SCHEMA_CONFIG.url}`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: 'BornClock', url: SITE_URL },
  });

  return (
    <ToolLayout
      theme="birthday"
      testId={`landing-${TESTID}`}
      seo={(
        <SEO title={SEO_CONFIG.title} description={SEO_CONFIG.description} keywords={SEO_CONFIG.keywords} canonicalUrl={SEO_CONFIG.canonicalUrl} ogType="website" />
      )}
      breadcrumb={{ trail: [{ label: 'Answers', to: '/answers' }], current: 'Birthday Fun & Celebrity Twins' }}
      footer={{
        tagline: "Who shares your birthday — with real Nakshatra, zodiac and numerology depth.",
        nav: [
          { label: 'Answers', to: '/answers' },
          { label: 'Age Calculator', to: '/age-calculator' },
          { label: 'Birthdays', to: '/birthday' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock.',
      }}
      h1={(<>{HEADLINE.lead}{' '}<span className="text-[#6E5AA6]">{HEADLINE.accent}</span></>)}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />

      <section className="section">
        <div className="container mx-auto px-4">
          {/* Language selector + Hindi notice (from the hero's top-right control) */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 text-xs">
              <label className="sr-only" htmlFor={`${TESTID}-lang`}>Page language</label>
              <button type="button" data-testid="landing-lang-en" onClick={() => onLang('en')} aria-pressed={lang === 'en'}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${lang === 'en' ? 'bg-[#0E2238] text-white' : 'text-muted-foreground hover:text-foreground'}`}>EN</button>
              <button type="button" data-testid="landing-lang-hi" onClick={() => onLang('hi')} aria-pressed={false}
                className="px-3 py-1 rounded-full font-medium text-muted-foreground hover:text-foreground transition-colors">हि</button>
            </div>
          </div>

          <section className="text-center max-w-3xl mx-auto" data-testid="landing-hero">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E5AA6]/10 border border-[#6E5AA6]/20 text-xs font-medium text-[#6E5AA6]">
              <BadgeIcon className="w-3.5 h-3.5" aria-hidden="true" /> {BADGE.label}
            </span>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed" data-testid="landing-answer">{DIRECT_ANSWER}</p>
            {hindiNotice && (
              <p data-testid="landing-hindi-notice" className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                हिंदी संस्करण जल्द आ रहा है — Hindi for this page is coming soon. The English version is shown for now.
              </p>
            )}
            <div className="mt-6">
              <Link to={CTA.to} data-testid="landing-hero-cta"
                className="inline-flex items-center gap-2 bg-[#0E2238] text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-[#0E2238] transition-colors">
                {CTA.label} <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              {SAVED_PROFILE_HINT_TO && hasSaved && (
                <p data-testid="landing-saved-hint" className="mt-2 text-xs text-muted-foreground">
                  We'll reuse your saved birth details ({profile!.dob}) — no re-entry needed.
                </p>
              )}
            </div>
          </section>

          {/* STATS — literal grid classes (Tailwind purge-safe) */}
          {STATS.length > 0 && (
            <section className={`grid grid-cols-1 gap-4 mt-6 ${STATS.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`} data-testid="landing-stats" aria-label={`${BADGE.label} by the numbers`}>
              {STATS.map(s => <StatCounter key={s.label} value={s.value} label={s.label} />)}
            </section>
          )}

          {/* TOOL TIERS */}
          {TIERS.map(t => <Tier key={t.key} tier={t} />)}

          {/* CLOSING */}
          <section className="mt-8 mb-4" data-testid="landing-closing">
            <div className="rounded-2xl border border-[#6E5AA6]/20 bg-gradient-to-br from-[#6E5AA6]/5 to-[#6E5AA6]/5 p-6 md:p-8 text-center max-w-3xl mx-auto">
              {CLOSING}
            </div>
          </section>
        </div>
      </section>
    </ToolLayout>
  );
}
