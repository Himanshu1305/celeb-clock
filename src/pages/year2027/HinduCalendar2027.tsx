/**
 * B14 — /hindu-calendar-2027: month-by-month overview of 2027 (lunar months, festivals,
 * Ekadashi / Purnima / Amavasya, Sankrantis, eclipses), linking to the dated pages.
 * Everything comes from computeFestivalCalendar(2027) and amantaMonths(2027).
 */
import { useMemo } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { computeFestivalCalendar, amantaMonths, purnimantaMonthName } from '@/lib/vedic/festivals';
import { FESTIVALS_2027, p2027, year2027Meta } from '@/lib/year2027/meta.js';
import { festivals2027 } from '@/lib/year2027/festivalData';
import { H2, Card, FaqList, LinkChips, YearJsonLd } from './parts';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const short = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)}`;
const IST = 5.5 * 3600_000;
const istDate = (d: Date) => new Date(d.getTime() + IST).toISOString().slice(0, 10);

export default function HinduCalendar2027() {
  const path = p2027.hinduCalendar;
  const meta = year2027Meta(path)!;
  const cal = useMemo(() => computeFestivalCalendar(2027), []);
  const months = useMemo(() => amantaMonths(2027).filter(m => istDate(m.end) >= '2027-01-01' && istDate(m.start) <= '2027-12-31'), []);
  const pages = useMemo(() => festivals2027('en'), []);
  const pageByDateName = (name: string) => FESTIVALS_2027.find(f => f.engine === name);
  const byMonth = MONTHS.map((_, i) => cal.festivals.filter(f => Number(f.dateISO.slice(5, 7)) === i + 1));
  const counts = { ek: cal.festivals.filter(f => f.type === 'ekadashi').length, pu: cal.festivals.filter(f => f.type === 'purnima').length, am: cal.festivals.filter(f => f.type === 'amavasya').length, ecl: cal.festivals.filter(f => f.type === 'eclipse').length };
  const adhik = months.filter(m => m.adhik);
  const top = ['holi', 'diwali', 'navratri', 'raksha-bandhan', 'janmashtami', 'mahashivratri', 'ganesh-chaturthi', 'dussehra'].map(s => pages.find(p => p.slug === s)!).filter(Boolean);
  const faq = [
    { question: 'When are the major Hindu festivals in 2027?', answer: top.map(p => `${FESTIVALS_2027.find(f => f.slug === p.slug)!.en}: ${short(p.dateISO)}`).join('; ') + ' (New Delhi).' },
    { question: 'Is there an Adhik Maas in 2027?', answer: adhik.length ? `Yes — ${adhik.map(m => `${m.name} (${short(istDate(m.start))} – ${short(istDate(m.end))})`).join(', ')}.` : 'No. Every lunar month of 2027 contains a Sankranti, so there is no Adhik (extra) month this year.' },
    { question: 'How many Ekadashis, Purnimas and Amavasyas are in 2027?', answer: `${counts.ek} Ekadashis, ${counts.pu} Purnimas and ${counts.am} Amavasyas, with ${counts.ecl} eclipses.` },
    { question: 'Which calendar does this follow?', answer: 'Lunar months are computed in the amanta system (new moon to new moon) and every dark-fortnight date also shows its North Indian (purnimanta) month name. Dates are for New Delhi; they come from the same engine as our Panchang and Kundli.' },
  ];
  const crumbs = [{ name: 'Hindu calendar 2027', path }];

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="hindu-calendar-2027"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png" breadcrumbItems={crumbs} articleSchema={false} />}
      breadcrumb={{ trail: [{ label: 'Festivals', to: '/festivals/' }], current: 'Hindu calendar 2027', edition: '2027' }}
      footer={{ tagline: 'The 2027 Hindu calendar, computed from the real Sun and Moon.', nav: [{ label: 'Festivals 2027', to: '/festivals/2027/' }, { label: 'Ekadashi 2027', to: '/ekadashi-2027/' }, { label: 'Rashifal 2027', to: '/rashifal-2027/' }], note: 'Dates for New Delhi (IST).' }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={faq} lang="en" />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">2027</span><h1 data-testid="hc2027-h1">{meta.h1}</h1></div>
          <p>Every festival, vrat and tithi of 2027 by month, computed for New Delhi. Tap a festival for its date page with tithi and puja times.</p>
        </div>

        <H2 id="top">Major festivals of 2027</H2>
        <LinkChips testId="hc2027-top" items={pages.map(p => ({ to: `${p2027.festival(p.slug)}/`, label: `${FESTIVALS_2027.find(f => f.slug === p.slug)!.en} — ${short(p.dateISO)}` }))} />

        <H2 id="lunar">Lunar months of 2027</H2>
        <ul className="grid sm:grid-cols-2 gap-1 text-sm text-brand-ink" data-testid="hc2027-lunar">
          {months.map(m => <li key={m.start.toISOString()}><strong>{m.name}</strong> (amanta): {short(istDate(m.start))} – {short(istDate(m.end))}{m.adhik ? ' · Adhik Maas' : ''} <span className="text-brand-muted">· dark half named {purnimantaMonthName(m.name, 'Krishna')} in North India</span></li>)}
        </ul>

        <H2 id="months">2027 month by month</H2>
        <div className="grid md:grid-cols-2 gap-3" data-testid="hc2027-months">
          {byMonth.map((fs, i) => (
            <Card key={i}>
              <h3 className="font-semibold text-brand-ink mb-2">{MONTHS[i]} 2027</h3>
              <ul className="space-y-1 text-sm text-brand-ink-soft">
                {fs.map(f => {
                  const pg = pageByDateName(f.name);
                  const label = `${short(f.dateISO)} — ${f.name}`;
                  return <li key={f.dateISO + f.name}>{pg ? <Link to={`${p2027.festival(pg.slug)}/`} className="underline text-brand-ink">{label}</Link> : label}</li>;
                })}
              </ul>
            </Card>
          ))}
        </div>

        <H2 id="faq">Hindu calendar 2027 — questions</H2>
        <FaqList items={faq} testId="hc2027-faq" />
        <H2 id="more">Dated lists</H2>
        <LinkChips items={[
          { label: 'Ekadashi 2027', to: '/ekadashi-2027/' }, { label: 'Purnima 2027', to: '/purnima-2027/' }, { label: 'Amavasya 2027', to: '/amavasya-2027/' },
          { label: 'Festival & vrat calendar 2027', to: '/festivals/2027/' }, { label: 'Eclipses 2027', to: '/eclipses/2027/' },
          { label: 'Rashifal 2027', to: '/rashifal-2027/' }, { label: 'राशिफल 2027', to: '/hi/rashifal-2027/', lang: 'hi' },
        ]} />
      </section>
    </PajPage>
  );
}
