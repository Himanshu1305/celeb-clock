import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import {
  NAKSHATRA_EXTRA, NAKSHATRA_ORDER, NAKSHATRA_SLUGS,
  nakshatraBySlug, nakshatraIndexBySlug, GANA_NOTE, NADI_NOTE,
} from '@/data/nakshatraPages';
import { getNakshatraMeaning } from '@/lib/vedic/nakshatraMeanings';
import { RASHIS } from '@/lib/vedic/rashifal';

// Vimshottari Mahadasha lengths (years) — standard, totals 120.
const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const SIG_STYLE: Record<string, string> = {
  exceptional: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  favorable: 'bg-sky-100 text-sky-800 border-sky-300',
  neutral: 'bg-slate-100 text-slate-700 border-slate-300',
  intense: 'bg-amber-100 text-amber-800 border-amber-300',
};

function degStr(d: number): string {
  const deg = Math.floor(d);
  const min = Math.round((d - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}′`;
}

function signSpan(index: number): { label: string; signs: string[] } {
  const span = 360 / 27; // 13.3333°
  const start = index * span;
  const end = (index + 1) * span;
  const startSign = Math.floor(start / 30);
  const endSign = Math.floor((end - 0.0001) / 30);
  const signs = startSign === endSign
    ? [RASHIS[startSign].sanskrit]
    : [RASHIS[startSign].sanskrit, RASHIS[endSign].sanskrit];
  return { label: `${degStr(start)}–${degStr(end)} of the zodiac`, signs };
}

export default function NakshatraPage() {
  const { slug } = useParams<{ slug: string }>();
  const extra = slug ? nakshatraBySlug(slug) : undefined;
  const meaning = extra ? getNakshatraMeaning(extra.name) : null;
  const index = extra ? nakshatraIndexBySlug(extra.slug) : -1;

  if (!extra || !meaning) {
    return (
      <ToolLayout
        theme="vedic"
        testId="nakshatra-page"
        seo={<SEO title="27 Nakshatras — Vedic Birth Stars | BornClock" description="Explore all 27 Nakshatras (lunar mansions) — deity, symbol, ruling planet, meaning and name sounds." canonicalUrl="/nakshatra" />}
        breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Nakshatra' }}
        eyebrow="Nakshatra"
        h1="Nakshatra not found"
      >
        <section className="section">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <p className="text-muted-foreground mb-4">Pick one of the 27 Nakshatras:</p>
            <div className="flex flex-wrap gap-2">
              {NAKSHATRA_ORDER.map(n => (
                <Link key={n} to={`/nakshatra/${NAKSHATRA_EXTRA[n].slug}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-primary/5">{n}</Link>
              ))}
            </div>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const span = signSpan(index);
  const dashaYears = VIMSHOTTARI_YEARS[meaning.rulingPlanet] ?? null;
  const number = index + 1;

  const faqItems = [
    {
      question: `What does being born in ${extra.name} Nakshatra mean?`,
      answer: `${meaning.meaning} Your Moon was in this lunar mansion at birth, which the tradition reads as a finer layer of temperament than the Moon sign alone.`,
    },
    {
      question: `Which planet rules ${extra.name}?`,
      answer: `${extra.name} is ruled by ${meaning.rulingPlanet}. In the Vimshottari dasha system this gives a ${dashaYears}-year ${meaning.rulingPlanet} Mahadasha, so ${meaning.rulingPlanet}'s themes recur as a timing thread through life.`,
    },
    {
      question: `What are the baby-name sounds for ${extra.name}?`,
      answer: `The four padas of ${extra.name} traditionally begin with the sounds ${extra.padaSyllables.join(', ')}. A child born under this Nakshatra is often given a name starting with the sound of their birth pada.`,
    },
    {
      question: `Is ${extra.name} good or bad?`,
      answer: `No Nakshatra is simply "good" or "bad". ${extra.name} is classically read as ${meaning.significance} in nature (${meaning.muhurta}) — a set of tendencies to work with consciously, not a verdict.`,
    },
  ];

  const title = `${extra.name} Nakshatra — Meaning, Pada, Ruling Planet & Name Sounds | BornClock`;
  const description = `${extra.name} Nakshatra (birth star ${number} of 27): ${meaning.meaning} Ruling planet ${meaning.rulingPlanet}, deity ${meaning.deity}, Gana ${extra.gana}, Yoni ${extra.yoni}. Pada name sounds and sign span.`;

  return (
    <ToolLayout
      theme="vedic"
      testId="nakshatra-page"
      seo={<SEO title={title} description={description} canonicalUrl={`/nakshatra/${extra.slug}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Nakshatras', to: '/nakshatra' }], current: extra.name }}
      footer={{ tagline: 'The 27 Nakshatras, computed from your real birth Moon.', nav: [{ label: 'All Nakshatras', to: '/nakshatra' }, { label: 'Free Kundli', to: '/kundali' }] }}
      eyebrow={`Nakshatra ${number} of 27`}
      h1={`${extra.name} Nakshatra`}
      lead={`${meaning.meaning}`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${SIG_STYLE[meaning.significance]}`}>{meaning.significance}</span>
            <span className="px-2 py-0.5 rounded-full border border-border text-xs text-muted-foreground">{meaning.muhurta}</span>
            <span className="px-2 py-0.5 rounded-full border border-border text-xs text-muted-foreground">Ruled by {meaning.rulingPlanet}</span>
          </div>

          {/* Computed + classical facts */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6" data-testid="nakshatra-facts">
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground mb-1">Sign span (computed)</div>
              <div className="text-foreground font-medium">{span.signs.join(' / ')}</div>
              <div className="text-xs text-muted-foreground mt-1">{span.label}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground mb-1">Ruling planet &amp; <TermTip id="mahadasha">Mahadasha</TermTip></div>
              <div className="text-foreground font-medium">{meaning.rulingPlanet}{dashaYears ? ` · ${dashaYears} years` : ''}</div>
              <div className="text-xs text-muted-foreground mt-1">Vimshottari period length</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground mb-1">Deity &amp; symbol</div>
              <div className="text-foreground font-medium capitalize">{meaning.symbol}</div>
              <div className="text-xs text-muted-foreground mt-1">Deity: {meaning.deity}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground mb-1">Shakti (special power)</div>
              <div className="text-foreground font-medium">{meaning.shakti}</div>
            </div>
          </div>

          {/* Temperament + matching attributes */}
          <div className="rounded-xl border border-border p-4 mb-6" data-testid="nakshatra-matching">
            <h2 className="font-semibold text-foreground mb-2">Temperament &amp; matching attributes</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Gana:</strong> {GANA_NOTE[extra.gana]}</li>
              <li><strong className="text-foreground"><TermTip id="yoni">Yoni</TermTip>:</strong> {extra.yoni} — the animal symbol used in compatibility.</li>
              <li><strong className="text-foreground"><TermTip id="nadi">Nadi</TermTip>:</strong> {NADI_NOTE[extra.nadi]} The heaviest koota in Kundali matching.</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              These feed the 36-point <Link to="/kundali-match" className="underline">Kundali matching</Link> score.
            </p>
          </div>

          {/* Baby-name sounds */}
          <div className="rounded-xl border border-border p-4 mb-6" data-testid="nakshatra-padas">
            <h2 className="font-semibold text-foreground mb-2">Name sounds by pada</h2>
            <p className="text-sm text-muted-foreground mb-3">Each of the four quarters (<TermTip id="pada">padas</TermTip>) of {extra.name} has a traditional starting sound for a baby's name:</p>
            <div className="flex flex-wrap gap-2">
              {extra.padaSyllables.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg border border-border text-foreground">Pada {i + 1}: <strong>{s}</strong></span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Looking for a name? See <Link to="/baby-names" className="underline">baby names</Link>.
            </p>
          </div>

          <PageFAQ items={faqItems} />

          <h2 className="font-semibold text-foreground mb-2">All 27 Nakshatras</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {NAKSHATRA_ORDER.filter(n => NAKSHATRA_EXTRA[n].slug !== extra.slug).map(n => (
              <Link key={n} to={`/nakshatra/${NAKSHATRA_EXTRA[n].slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{n}</Link>
            ))}
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Find your own Nakshatra exactly, from your birth date, time and place.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}

export { NAKSHATRA_SLUGS };
