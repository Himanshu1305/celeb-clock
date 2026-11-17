/**
 * B14 — /chinese-horoscope-2027: the Year of the Fire Goat for all 12 animals.
 *
 * Chinese New Year 2027 = Saturday 6 February 2027, the start of the Ding-Wei (Fire Goat)
 * year, which runs until Chinese New Year 2028 on 26 January 2028. Sources:
 *   • Hong Kong Observatory Gregorian–Lunar calendar 2027 (T2027e.txt, title "Ding-wei – year
 *     of the Goat"; 6 Feb 2027 = 1st Lunar Month day 1) — already cited in
 *     src/lib/chineseCalendar.js, whose CHINESE_NEW_YEAR_DATES this page reads;
 *   • chinatravel.com/chinese-new-year/date (opened 17 Nov 2026 via WebSearch/WebFetch):
 *     "Saturday, February 6, 2027 … Fire Goat … ends … January 26, 2028".
 * The per-animal outlook is the existing relationship engine (src/services/chineseYearlyForecast.ts:
 * San He allies, Liu He secret friend, Liu Chong clash, Liu Hai harm, Ben Ming Nian).
 */
import { useMemo } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { CHINESE_NEW_YEAR_DATES, CHINESE_ANIMALS } from '@/lib/chineseCalendar.js';
import { getYearForecast, type Grade } from '@/services/chineseYearlyForecast';
import { p2027, year2027Meta } from '@/lib/year2027/meta.js';
import { H2, Card, FaqList, LinkChips, YearJsonLd } from './parts';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const GRADE_TONE: Record<Grade, string> = { strong: 'text-brand-green-ink', moderate: 'text-brand-gold-text', mild: 'text-brand-coral-ink' };

export default function ChineseHoroscope2027() {
  const path = p2027.chinese;
  const meta = year2027Meta(path)!;
  const [m1, d1] = (CHINESE_NEW_YEAR_DATES as Record<number, [number, number]>)[2027];
  const [m2, d2] = (CHINESE_NEW_YEAR_DATES as Record<number, [number, number]>)[2028];
  const start = `${d1} ${MONTHS[m1 - 1]} 2027`;
  const endDay = new Date(Date.UTC(2028, m2 - 1, d2) - 86400_000);
  const end = `${endDay.getUTCDate()} ${MONTHS[endDay.getUTCMonth()]} 2028`;
  const rows = useMemo(() => CHINESE_ANIMALS.map(a => ({ a, f: getYearForecast(a, 2027) })), []);
  const yearsOf = (i: number) => Array.from({ length: 9 }, (_, k) => 1936 + i + 12 * k).filter(y => y <= 2027);
  const by = (rel: string) => rows.filter(r => r.f.relationship === rel).map(r => r.a);
  const faq = [
    { question: 'When does the Chinese New Year 2027 start?', answer: `On ${start}. The Year of the Fire Goat runs from ${start} to ${end}; Chinese New Year 2028 is on ${d2} ${MONTHS[m2 - 1]} 2028.` },
    { question: 'What is the Chinese zodiac animal for 2027?', answer: 'The Goat (also called Sheep or Ram), with the Fire element — a Ding-Wei year in the 60-year cycle.' },
    { question: 'Which animals clash with the Goat year (Tai Sui)?', answer: `By the classical relationships: your own year (Ben Ming Nian) is the Goat; the opposite sign, the ${by('clash').join(', ')}, is in a clash (Liu Chong) year; the ${by('harm').join(', ')} has minor friction (Liu Hai).` },
    { question: 'Which animals are luckiest in 2027?', answer: `The Goat’s trine allies (San He) — ${by('allies').join(' and ')} — and its secret friend (Liu He), the ${by('secret-friend').join(', ')}, are traditionally the most supported.` },
    { question: 'I was born in January or early February — which animal am I?', answer: 'Your animal follows the Chinese New Year of your birth year, not 1 January. If you were born before that year’s Chinese New Year, you belong to the previous year’s animal. Use our Chinese zodiac calculator to check.' },
  ];
  const crumbs = [{ name: 'Chinese horoscope 2027', path }];

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="chinese-2027"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png" breadcrumbItems={crumbs} articleSchema={false} />}
      breadcrumb={{ trail: [{ label: 'Chinese Zodiac', to: '/chinese-zodiac/' }], current: 'Chinese horoscope 2027', edition: 'Year of the Fire Goat' }}
      footer={{ tagline: 'Chinese zodiac forecasts from the classical animal relationships.', nav: [{ label: 'Chinese zodiac', to: '/chinese-zodiac/' }, { label: 'Horoscope 2027', to: '/horoscope-2027/' }, { label: 'Rashifal 2027', to: '/rashifal-2027/' }], note: 'A traditional reading of tendencies — reflective guidance, not certainty.' }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={faq} lang="en" />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Year of the Fire Goat</span><h1 data-testid="cn2027-h1">{meta.h1}</h1></div>
          <p data-testid="cn2027-dates">The Chinese year 2027 — Ding-Wei, the Fire Goat — begins on <strong>{start}</strong> and ends on <strong>{end}</strong>. Below: how the Goat year relates to your animal, and what that means for career, money, love and health.</p>
        </div>

        <H2 id="relations">How the Goat year treats each animal</H2>
        <Card>
          <ul className="space-y-1 text-sm text-brand-ink">
            <li><strong>Allies (San He trine):</strong> {by('allies').join(', ')} — the most supported.</li>
            <li><strong>Secret friend (Liu He):</strong> {by('secret-friend').join(', ')} — quiet help.</li>
            <li><strong>Own year (Ben Ming Nian):</strong> {by('own-year').join(', ')} — a year to be steady and careful.</li>
            <li><strong>Clash (Liu Chong):</strong> {by('clash').join(', ')} — a year of change.</li>
            <li><strong>Minor friction (Liu Hai):</strong> {by('harm').join(', ')} — smooth things with patience.</li>
            <li><strong>Neutral:</strong> {by('neutral').join(', ')} — your own effort sets the pace.</li>
          </ul>
        </Card>

        <H2 id="animals">2027 outlook for all 12 animals</H2>
        <div className="grid md:grid-cols-2 gap-3" data-testid="cn2027-animals">
          {rows.map(({ a, f }, i) => (
            <Card key={a}>
              <h3 className="font-semibold text-brand-ink">{a} in 2027 <span className="text-xs font-normal text-brand-muted">· born {yearsOf(i).slice(-5).join(', ')}…</span></h3>
              <p className="text-sm text-brand-ink mt-1">{f.overall}</p>
              <ul className="text-sm text-brand-ink-soft mt-2 space-y-1">
                <li><strong className={GRADE_TONE[f.career.grade]}>Career ({f.career.grade}):</strong> {f.career.text}</li>
                <li><strong className={GRADE_TONE[f.finance.grade]}>Money ({f.finance.grade}):</strong> {f.finance.text}</li>
                <li><strong className={GRADE_TONE[f.love.grade]}>Love ({f.love.grade}):</strong> {f.love.text}</li>
                <li><strong className={GRADE_TONE[f.health.grade]}>Health ({f.health.grade}):</strong> {f.health.text}</li>
              </ul>
              <p className="text-sm text-brand-ink mt-2"><strong>Advice:</strong> {f.advice}</p>
              <p className="text-sm mt-2"><Link to={`/chinese-horoscope/${a.toLowerCase()}/`} className="underline">{a} horoscope →</Link></p>
            </Card>
          ))}
        </div>

        <H2 id="faq">Chinese horoscope 2027 — questions</H2>
        <FaqList items={faq} testId="cn2027-faq" />
        <p className="text-xs text-brand-muted mt-3">Date source: Hong Kong Observatory Gregorian–Lunar calendar for 2027 (“Ding-wei – year of the Goat”). The outlook follows the classical relationships between animals; it describes tendencies, not certainties.</p>
        <H2 id="more">More for 2027</H2>
        <LinkChips items={[{ label: 'Chinese zodiac calculator', to: '/chinese-zodiac/' }, { label: 'Horoscope 2027 (Western)', to: '/horoscope-2027/' }, { label: 'Rashifal 2027 (Vedic)', to: '/rashifal-2027/' }, { label: 'Numerology 2027', to: '/numerology-2027/' }]} />
      </section>
    </PajPage>
  );
}
