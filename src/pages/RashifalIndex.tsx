import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { RASHIS } from '@/lib/vedic/rashifal';

const ELEMENT_STYLE: Record<string, string> = {
  Fire: 'border-rose-300 bg-rose-50', Earth: 'border-emerald-300 bg-emerald-50',
  Air: 'border-sky-300 bg-sky-50', Water: 'border-indigo-300 bg-indigo-50',
};

export default function RashifalIndex() {
  const faqItems = [
    {
      question: 'What is a rashifal?',
      answer: 'Rashifal is the Vedic horoscope read from your Moon sign (rashi). It describes how the current movement of the planets (gochar / transits) touches the different areas of your life.',
    },
    {
      question: 'Which rashi should I choose?',
      answer: 'Choose your Moon sign (Chandra rashi), not your Western Sun sign. If you do not know it, generate your free Kundli — it tells you your Moon sign exactly from your birth date, time and place.',
    },
    {
      question: 'How often does the rashifal update?',
      answer: 'The daily reading is recomputed every day from the real planetary positions; weekly, monthly and yearly readings summarise the transits over those periods. Nothing is a fixed, pre-written block of text.',
    },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="rashifal-index"
      seo={<SEO
        title="Rashifal — Daily, Weekly, Monthly & Yearly Horoscope by Moon Sign | BornClock"
        description="Free Vedic rashifal for all 12 Moon signs — daily, weekly, monthly and yearly. Computed from the real sidereal planetary transits, with graded, plain-language predictions."
        canonicalUrl="/rashifal"
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Rashifal' }}
      footer={{ tagline: 'Computed Vedic horoscopes from your real Moon sign.', nav: [{ label: 'Free Kundli', to: '/kundali' }, { label: 'Vedic signs', to: '/vedic-zodiac' }] }}
      eyebrow="Rashifal"
      h1="Rashifal — horoscope by your Moon sign"
      lead="Pick your Vedic Moon sign for a daily, weekly, monthly or yearly reading — computed from today's real planetary transits, not a fixed template."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="rashifal-grid">
            {RASHIS.map(r => (
              <Link
                key={r.slug}
                to={`/rashifal/${r.slug}/today`}
                className={`rounded-xl border p-4 hover:shadow-sm transition ${ELEMENT_STYLE[r.element] || 'border-border'}`}
              >
                <div className="font-semibold text-foreground">{r.sanskrit} <span className="text-muted-foreground font-normal">({r.english})</span></div>
                <div className="text-xs text-muted-foreground mt-1">{r.hindi} · {r.element} · ruled by {r.lord}</div>
                <div className="text-xs text-primary mt-2">Today · week · month · year →</div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6 mb-10">
            Each reading is a <TermTip id="rashi">Moon-sign</TermTip> gochar (transit) reading, computed from the sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) positions of the planets — the same engine behind your Kundli.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Don't know your Moon sign? Find it free in seconds.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
