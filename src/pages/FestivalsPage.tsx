import { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { computeFestivalCalendar, type Festival, type FestivalType } from '@/lib/vedic/festivals';

const MIN_YEAR = 2020;
const MAX_YEAR = 2039;

const TYPE_STYLE: Record<FestivalType, string> = {
  festival: 'bg-rose-100 text-rose-800 border-rose-300',
  vrat: 'bg-amber-100 text-amber-800 border-amber-300',
  ekadashi: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  purnima: 'bg-sky-100 text-sky-800 border-sky-300',
  amavasya: 'bg-slate-200 text-slate-700 border-slate-300',
  sankranti: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};
const TYPE_LABEL: Record<FestivalType, string> = {
  festival: 'Festival', vrat: 'Vrat', ekadashi: 'Ekadashi', purnima: 'Purnima', amavasya: 'Amavasya', sankranti: 'Sankranti',
};
const GMONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function nice(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export default function FestivalsPage() {
  const { year: yearParam } = useParams<{ year?: string }>();
  const thisYear = new Date().getUTCFullYear();
  const year = yearParam ? Number(yearParam) : thisYear;
  const yearValid = Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;

  const cal = useMemo(() => (yearValid ? computeFestivalCalendar(year) : null), [year, yearValid]);

  if (yearParam && !yearValid) return <Navigate to="/festivals" replace />;
  if (!cal) return null;

  const major = cal.festivals.filter(f => f.type === 'festival' || f.type === 'vrat');
  const byMonth: Festival[][] = Array.from({ length: 12 }, () => []);
  for (const f of cal.festivals) byMonth[Number(f.dateISO.slice(5, 7)) - 1].push(f);

  const title = `Hindu Festival & Vrat Calendar ${year} — Dates | BornClock`;
  const description = `Computed Hindu festival and vrat calendar for ${year}: Diwali, Holi, Navratri, Janmashtami, every Ekadashi, Purnima, Amavasya, Pradosh, Sankashti and the 12 Sankrantis — with exact dates derived from real Moon/Sun positions.`;

  const years = [year - 1, year, year + 1, year + 2].filter(y => y >= MIN_YEAR && y <= MAX_YEAR);

  const faqItems = [
    {
      question: 'How are these festival dates calculated?',
      answer: 'They are computed, not copied from a table. We derive the exact instants of every new moon and full moon and the Sun’s entry into each sidereal sign, build the lunar months by the classical rule (a month is named after the Sankranti that falls within it), and then locate each festival by its lunar month, paksha and tithi — using the observance time (sunrise, pradosh/evening, moonrise or midnight) that fixes the civil date. The engine is the same one behind your Kundli.',
    },
    {
      question: 'Do these match Drik Panchang / my local Panchang?',
      answer: 'For 2025 our major-festival dates match Drik Panchang on 16 of 17 — the one exception is Ghatasthapana (Navratri start), where the muhurta can fall a day earlier when Pratipada begins after sunrise. Regional Panchangs occasionally differ by a day because of local sunrise and the amanta/purnimanta convention; where a festival is observed at night or moonrise we note it.',
    },
    {
      question: 'What is the difference between a festival, a vrat and Ekadashi?',
      answer: 'A festival is a celebration (e.g. Diwali, Holi). A vrat is an observance/fast (e.g. Ekadashi, Pradosh, Karwa Chauth). Ekadashi — the 11th tithi of each fortnight — is the most frequent Vishnu fasting day, so it is listed separately.',
    },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="festivals"
      seo={<SEO title={title} description={description} canonicalUrl={yearParam ? `/festivals/${year}` : '/festivals'} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: `Festivals ${year}` }}
      footer={{ tagline: 'Computed Hindu festival & vrat calendar.', nav: [{ label: 'Daily Panchang', to: '/panchang' }, { label: 'Muhurat Finder', to: '/muhurat' }, { label: 'Rashifal', to: '/rashifal' }], note: 'Dates are computed from real sidereal positions; local Panchangs may differ by a day. Not a substitute for a priest’s muhurta.' }}
      eyebrow="Panchang · festivals & vrats"
      h1={`Hindu Festival & Vrat Calendar ${year}`}
      lead="Every major festival, Ekadashi, Purnima, Amavasya, Pradosh, Sankashti and Sankranti for the year — with exact dates computed from the real sky, not a fixed table."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">

          {/* Year switcher */}
          <div className="flex flex-wrap gap-2 mb-6" data-testid="festival-years">
            {years.map(y => (
              <Link key={y} to={y === thisYear ? '/festivals' : `/festivals/${y}`} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${y === year ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}>
                {y}
              </Link>
            ))}
          </div>

          {/* Major festivals */}
          <h2 className="font-semibold text-foreground mb-3 text-lg">Major festivals &amp; vrats in {year}</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-8" data-testid="festival-major">
            {major.map((f, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{f.name}</h3>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLE[f.type]}`}>{TYPE_LABEL[f.type]}</span>
                </div>
                <div className="text-sm text-primary font-medium">{nice(f.dateISO)}</div>
                {f.note && <p className="text-xs text-muted-foreground mt-1">{f.note}</p>}
              </div>
            ))}
          </div>

          {/* Sankranti strip */}
          <h2 className="font-semibold text-foreground mb-3 text-lg">The 12 Sankrantis</h2>
          <p className="text-xs text-muted-foreground mb-2">Each Sankranti is the day the Sun enters a new sidereal sign — Makar Sankranti (Uttarayana) and Karka Sankranti (Dakshinayana) are the solstitial turns.</p>
          <div className="flex flex-wrap gap-2 mb-8" data-testid="festival-sankranti">
            {cal.sankrantis.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground">
                <strong>{nice(s.dateISO)}</strong> · {s.name}
              </span>
            ))}
          </div>

          {/* Full month-by-month list */}
          <h2 className="font-semibold text-foreground mb-3 text-lg">All observances, month by month</h2>
          <div className="space-y-6 mb-8" data-testid="festival-allmonths">
            {byMonth.map((list, mi) => list.length === 0 ? null : (
              <div key={mi}>
                <h3 className="font-semibold text-foreground mb-2 border-b border-border pb-1">{GMONTHS[mi]} {year}</h3>
                <ul className="space-y-1">
                  {list.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 w-24 text-muted-foreground tabular-nums">{nice(f.dateISO)}</span>
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${TYPE_STYLE[f.type]}`}>{TYPE_LABEL[f.type]}</span>
                      <span className="text-foreground">{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-8">
            Computed from the real sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) positions of the Sun and Moon and the classical amanta <TermTip id="paksha">paksha</TermTip>/tithi rules.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Planning a ceremony? Find an auspicious time for your city and occasion.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Muhurat Finder →</Link>
              <Link to="/panchang" className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">Today’s Panchang →</Link>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
