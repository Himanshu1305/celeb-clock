/**
 * Batch 10 — solar and lunar eclipses 2026–2030: /eclipses (all five years) and
 * /eclipses/:year. Dates, the time of greatest eclipse in IST (computed; checked against
 * NASA to within a minute), NASA's type, magnitude, durations and visibility region, and
 * whether timeanddate.com lists the eclipse as visible from India and from Delhi — the
 * only visibility statement we make (sources in src/lib/vedic/eclipses.ts). Static
 * content (it changes only on an eclipse day); the "next eclipse" note is drawn in the
 * browser so the prerendered HTML never goes stale.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { eclipsesOfYear, eclipsesMeta, durationText, ECLIPSE_RANGE, ECLIPSE_YEARS_LIST, type EclipseInfo } from '@/lib/vedic/eclipses';
import { formatLongDateEn } from '@/lib/daily/dates';

const hmText = (s: string) => { const m = s.match(/^(\d+)h(\d+)m$/); return m ? durationText(Number(m[1]) * 60 + Number(m[2])) : s; };


function EclipseCard({ e }: { e: EclipseInfo }) {
  const solar = e.body === 'solar';
  return (
    <li className="rounded-xl border border-border p-4" data-testid="eclipse-card" id={`eclipse-${e.date}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-foreground">{e.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${e.india ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-border text-muted-foreground'}`}>
          {e.india ? 'Visible from India' : 'Not visible from India'}
        </span>
      </div>
      <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="text-muted-foreground">Greatest eclipse</dt>
        <dd className="text-foreground">{formatLongDateEn(e.istDate)}, {e.istTime} IST</dd>
        <dt className="text-muted-foreground">Type (NASA)</dt>
        <dd className="text-foreground">{e.nasa.type}, {solar ? 'magnitude' : 'umbral magnitude'} {e.nasa.magnitude.toFixed(3)}</dd>
        {!solar && (e.nasa.partial || e.nasa.total) && <>
          <dt className="text-muted-foreground">How long (NASA)</dt>
          <dd className="text-foreground">{e.nasa.partial ? `partial phase ${hmText(e.nasa.partial)}` : ''}{e.nasa.total ? `, totality ${hmText(e.nasa.total)}` : ''}</dd>
        </>}
        {solar && e.nasa.central && <>
          <dt className="text-muted-foreground">Central phase (NASA)</dt>
          <dd className="text-foreground">up to {e.nasa.central.replace(/^0/, '').replace('m', ' min ').replace('s', ' s')} on the central line</dd>
        </>}
        <dt className="text-muted-foreground">Seen from (NASA)</dt>
        <dd className="text-foreground">{e.nasa.region}</dd>
        <dt className="text-muted-foreground">India / Delhi</dt>
        <dd className="text-foreground">{e.india ? `Listed by timeanddate.com as visible from India${e.delhi ? ', including Delhi' : ' (not from Delhi)'}.` : 'Not listed by timeanddate.com as visible from India.'}{solar && e.india && e.type !== 'Partial' ? ' India is not among the countries NASA lists on the central path, so from India it is seen as a partial eclipse.' : ''}</dd>
      </dl>
      {solar && e.india && <p className="mt-2 text-xs text-muted-foreground">Eye safety: never look straight at the Sun during a partial or annular eclipse — use solar viewers made to the ISO 12312-2 standard; ordinary sunglasses are not safe (NASA).</p>}
    </li>
  );
}

function NextEclipse() {
  // Browser-only (after mount), so the prerendered page carries no date-dependent text.
  const [next, setNext] = useState<EclipseInfo | null>(null);
  useEffect(() => {
    const now = Date.now();
    const all = ECLIPSE_YEARS_LIST.flatMap(eclipsesOfYear).filter(x => x.india && x.peak.getTime() > now);
    setNext(all[0] ?? null);
  }, []);
  if (!next) return null;
  return (
    <p className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 text-sm" data-testid="eclipse-next">
      <strong className="text-foreground">Next eclipse visible from India:</strong> {next.name} — {formatLongDateEn(next.istDate)}, {next.istTime} IST (greatest eclipse). <a href={`/eclipses/${next.istDate.slice(0, 4)}#eclipse-${next.date}`} className="text-primary hover:underline">Details →</a>
    </p>
  );
}

export default function EclipsesPage() {
  const { year: yp } = useParams<{ year?: string }>();
  const year = yp ? Number(yp) : undefined;
  const valid = year === undefined || (Number.isInteger(year) && year >= ECLIPSE_RANGE.from && year <= ECLIPSE_RANGE.to);
  const years = useMemo(() => (year ? [year] : ECLIPSE_YEARS_LIST), [year]);
  const data = useMemo(() => (valid ? years.map(y => ({ y, list: eclipsesOfYear(y) })) : []), [years, valid]);
  if (!valid) return <Navigate to="/eclipses" replace />;

  const meta = eclipsesMeta(year);
  const all = data.flatMap(d => d.list);
  const india = all.filter(e => e.india);
  const solar = all.filter(e => e.body === 'solar').length;
  const span = year ? String(year) : `${ECLIPSE_RANGE.from}–${ECLIPSE_RANGE.to}`;
  const path = year ? `/eclipses/${year}` : '/eclipses';
  const faq = [
    { question: `How many eclipses are there in ${span}?`, answer: `${all.length}: ${solar} solar (Surya Grahan) and ${all.length - solar} lunar (Chandra Grahan) — the same dates and types as NASA’s eclipse tables.` },
    { question: `Which eclipses of ${span} can be seen from India?`, answer: india.length ? `timeanddate.com lists ${india.length} as visible from India: ${india.map(e => `${e.name.replace(/ \(.*\)$/, '')} on ${formatLongDateEn(e.istDate)}`).join('; ')}.` : `timeanddate.com lists none of the eclipses of ${span} as visible from India.` },
    { question: 'Is it safe to look at a solar eclipse?', answer: 'Not with the bare eye while any part of the Sun is uncovered. NASA advises solar viewers made to the ISO 12312-2 standard; ordinary sunglasses, however dark, are not safe.' },
    { question: 'Why does the date in India differ from some international lists?', answer: 'International tables give the date in Universal Time. We show the date and time of greatest eclipse in Indian Standard Time (UT + 5:30), so an eclipse late in the UT day falls on the next date in India.' },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="eclipses-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: year ? [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Eclipses', to: '/eclipses' }] : [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: year ? String(year) : 'Eclipses' }}
      footer={{ tagline: 'Eclipse dates computed and checked against NASA.', nav: [{ label: 'Moon phase', to: '/moon-phase' }, { label: 'Festivals', to: '/festivals' }, { label: 'Panchang calendar', to: '/panchang-calendar' }, { label: 'Grahan Dosha', to: '/grahan-dosha' }] }}
      eyebrow="Surya & Chandra Grahan"
      h1={meta.h1}
      lead={`${all.length} eclipses in ${span}; ${india.length} visible from India.`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <section className="rounded-2xl border border-border p-5 mb-6 bg-gradient-to-br from-card to-muted/20" data-testid="eclipse-answer">
            <h2 className="text-lg font-semibold text-foreground mb-2">In brief</h2>
            <p className="text-foreground leading-relaxed">
              {span} has {all.length} eclipses — {solar} solar and {all.length - solar} lunar. {india.length ? `${india.length} can be seen from India (as listed by timeanddate.com): ${india.map(e => `${e.body === 'solar' ? 'the solar' : 'the lunar'} eclipse of ${formatLongDateEn(e.istDate).replace(/^\w+, /, '')}`).join(', ')}.` : 'None of them can be seen from India.'} An eclipse is a natural, predictable alignment of the Sun, Moon and Earth — for any observance, follow your own family’s practice.
            </p>
          </section>

          <NextEclipse />

          {year && (
            <nav className="flex flex-wrap gap-2 mb-6" aria-label="Other years" data-testid="eclipse-years">
              {ECLIPSE_YEARS_LIST.map(y => <Link key={y} to={`/eclipses/${y}`} className={`px-3 py-1 rounded-lg border text-sm ${y === year ? 'border-primary text-primary' : 'border-border'}`}>{y}</Link>)}
              <Link to="/eclipses" className="px-3 py-1 rounded-lg border border-border text-sm">All years</Link>
            </nav>
          )}

          {data.map(({ y, list }) => (
            <section key={y} className="mb-8" data-testid={`eclipses-${y}`}>
              <h2 className="text-xl font-semibold text-foreground mb-3">{year ? `Every eclipse of ${y}` : <Link to={`/eclipses/${y}`} className="hover:underline">Eclipses in {y} →</Link>}</h2>
              <ul className="space-y-3">{list.map(e => <EclipseCard key={e.date} e={e} />)}</ul>
            </section>
          ))}

          <div className="rounded-xl border border-border p-4 mb-6 text-sm text-muted-foreground space-y-2" data-testid="eclipse-how">
            <h2 className="font-semibold text-foreground">How these are worked out</h2>
            <p>The eclipses and the time of greatest eclipse are computed from the real positions of the Sun and Moon, near <TermTip id="rahu">Rahu or Ketu</TermTip>, and match NASA’s eclipse tables (Fred Espenak) in date and type; the IST time agrees with NASA’s to within a minute. Type, magnitude, durations and the region where each <TermTip id="eclipse">eclipse</TermTip> is seen are quoted from NASA; visibility from India and Delhi is quoted from timeanddate.com. We do not list Sutak timings, because we have not found a published rule we can cite and check — your family priest or temple calendar is the right guide for that.</p>
            <p>Reading the cards: a solar eclipse’s magnitude is the share of the Sun’s diameter the Moon covers at greatest eclipse (1 or more on the central path of a total eclipse). For a lunar eclipse the umbral magnitude is how far the Moon enters the Earth’s dark inner shadow; a negative value marks a penumbral eclipse, when the Moon passes only through the faint outer shadow and dims slightly.</p>
            <p><Link to="/accuracy" className="underline">How we check accuracy →</Link> · <Link to="/grahan-dosha" className="underline">Grahan Dosha in a birth chart →</Link></p>
          </div>

          <PageFAQ items={faq} />
        </div>
      </section>
    </ToolLayout>
  );
}
