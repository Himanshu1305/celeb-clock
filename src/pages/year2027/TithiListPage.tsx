/**
 * B14 — /ekadashi-2027, /purnima-2027, /amavasya-2027: every date of the year with the
 * exact tithi start / end (IST, New Delhi), from the festival engine (tithiDays — the same
 * dates as the /festivals/2027 calendar rows).
 */
import { useMemo } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { ScrollTable } from '@/components/ScrollTable';
import { tithiDays, type TithiDay } from '@/lib/vedic/festivals';
import { dayLabel, stamp } from '@/lib/year2027/festivalData';
import { year2027Meta } from '@/lib/year2027/meta.js';
import { H2, FaqList, LinkChips, YearJsonLd } from './parts';

type Kind = TithiDay['kind'];

const INFO: Record<Kind, { what: string[]; faq: Array<{ question: string; answer: string }>; link: { label: string; to: string } }> = {
  ekadashi: {
    what: [
      'Ekadashi is the eleventh tithi (lunar day) of each fortnight — twice a month — and is the most widely kept Vishnu fasting day. Each Ekadashi has a traditional name (Kamada, Mohini, Nirjala, Devshayani, Devutthana and so on).',
      'The fast is observed on the Ekadashi day and broken the next morning (parana) during Dwadashi. The dates below are the Smarta dates for New Delhi; Vaishnava (ISKCON) calendars occasionally keep an Ekadashi a day later.',
    ],
    faq: [
      { question: 'How many Ekadashis are there in 2027?', answer: '' },
      { question: 'Why do Ekadashi dates sometimes differ between calendars?', answer: 'Smarta calendars take the day Ekadashi prevails at sunrise, with corrections so the fast never falls on the parana day; Vaishnava calendars avoid an Ekadashi touched by Dashami at dawn and can move it a day later. Local sunrise can also shift a date by a day between cities.' },
      { question: 'When is the Ekadashi fast broken?', answer: 'On the next morning, during Dwadashi, after sunrise. Check a local Panchang for the exact parana window, which depends on your city.' },
    ],
    link: { label: 'Ekadashi vrat katha & puja vidhi', to: '/vrat/ekadashi/' },
  },
  purnima: {
    what: [
      'Purnima is the full-moon tithi that closes the bright fortnight (Shukla paksha). Many vrats and festivals fall on it — Guru Purnima, Raksha Bandhan, Sharad Purnima, Kartik Purnima — and the Satyanarayan katha is traditionally read on Purnima.',
      'The date listed is the day Purnima prevails at sunrise in New Delhi; the full tithi span is given so you can see when it begins and ends.',
    ],
    faq: [
      { question: 'How many Purnimas are there in 2027?', answer: '' },
      { question: 'Why is a Purnima fast sometimes kept the day before?', answer: 'Some vrats (such as Purnima vrat with moonrise worship) follow the day Purnima prevails in the evening rather than at sunrise. That is why a Purnima vrat and a Purnima snan-daan can fall on different days.' },
      { question: 'Is the Purnima time the same as the exact full moon?', answer: 'Purnima is the whole tithi in which the exact full moon falls; the exact astronomical full moon is a single moment near its end.' },
    ],
    link: { label: 'Satyanarayan katha (Purnima)', to: '/vrat/satyanarayan-katha/' },
  },
  amavasya: {
    what: [
      'Amavasya is the new-moon tithi that closes the dark fortnight (Krishna paksha). It is traditionally a day for remembering ancestors (pitru tarpan) and for quiet worship; Diwali, Mauni Amavasya and Sarva Pitru Amavasya are among the best known.',
      'North Indian (purnimanta) calendars name the dark fortnight one month ahead of South and West Indian (amanta) calendars, so the same Amavasya can carry two month names — both are shown.',
    ],
    faq: [
      { question: 'How many Amavasyas are there in 2027?', answer: '' },
      { question: 'What is done on Amavasya?', answer: 'Tradition associates Amavasya with remembering ancestors — tarpan, shraddha and charity — and with quiet prayer. It is generally not chosen for new beginnings.' },
      { question: 'Why do calendars give different month names for the same Amavasya?', answer: 'Because of the amanta and purnimanta systems. The day is the same; only the name of the month differs.' },
    ],
    link: { label: 'Pradosh Vrat', to: '/vrat/pradosh-vrat/' },
  },
};

export default function TithiListPage({ kind }: { kind: Kind }) {
  const path = `/${kind}-2027`;
  const meta = year2027Meta(path)!;
  const rows = useMemo(() => tithiDays(2027).filter(d => d.kind === kind), [kind]);
  const info = INFO[kind];
  const label = kind === 'ekadashi' ? 'Ekadashi' : kind === 'purnima' ? 'Purnima' : 'Amavasya';
  const faq = info.faq.map((f, i) => (i === 0 ? { ...f, answer: `${rows.length} ${label} days fall in 2027 (New Delhi): ${rows.map(r => r.dateISO.slice(8, 10).replace(/^0/, '') + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(r.dateISO.slice(5, 7)) - 1]).join(', ')}.` } : f));
  const crumbs = [{ name: 'Hindu calendar 2027', path: '/hindu-calendar-2027' }, { name: `${label} 2027`, path }];

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId={`tithi2027-${kind}`}
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png" breadcrumbItems={crumbs} articleSchema={false} />}
      breadcrumb={{ trail: [{ label: 'Festivals', to: '/festivals/' }, { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }], current: `${label} 2027`, edition: 'Tithi dates 2027' }}
      footer={{ tagline: 'Tithi dates computed from the real Sun and Moon.', nav: [{ label: 'Ekadashi 2027', to: '/ekadashi-2027/' }, { label: 'Purnima 2027', to: '/purnima-2027/' }, { label: 'Amavasya 2027', to: '/amavasya-2027/' }, { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }], note: 'Dates and times are for New Delhi (IST).' }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={faq} lang="en" />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">2027</span><h1 data-testid="tithi2027-h1">{meta.h1}</h1></div>
          <p>{rows.length} {label} dates in 2027, each with the exact tithi start and end time in IST for New Delhi.</p>
        </div>
        <ScrollTable>
          <table className="w-full text-sm" data-testid="tithi2027-table">
            <thead><tr className="text-left text-brand-muted"><th className="py-1 pr-3 font-medium">Date</th><th className="py-1 pr-3 font-medium">{kind === 'ekadashi' ? 'Ekadashi' : 'Month'}</th><th className="py-1 pr-3 font-medium">Tithi begins</th><th className="py-1 pr-3 font-medium">Tithi ends</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.dateISO + r.name} className="border-t border-brand-line text-brand-ink align-top" data-date={r.dateISO}>
                  <td className="py-1.5 pr-3 whitespace-nowrap font-medium">{dayLabel(r.dateISO, 'en')}</td>
                  <td className="py-1.5 pr-3">{kind === 'ekadashi' ? `${r.name} (${r.monthPurnimanta === r.month ? `${r.month} ${r.paksha}` : `${r.monthPurnimanta} ${r.paksha} purnimanta / ${r.month} amanta`})` : r.name}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{stamp(r.tithiStart, 'en')}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{stamp(r.tithiEnd, 'en')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTable>
        <H2 id="about">About {label}</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed">{info.what.map(p => <p key={p.slice(0, 30)}>{p}</p>)}</div>
        <p className="text-xs text-brand-muted mt-3">Computed by BornClock’s festival engine from real Sun and Moon positions; the observance date follows the classical rule (tithi at New Delhi sunrise; Ekadashi with the Smarta corrections). <Link to="/accuracy/" className="underline">How we check our dates →</Link></p>
        <H2 id="faq">{label} 2027 — questions</H2>
        <FaqList items={faq} testId="tithi2027-faq" />
        <H2 id="more">More for 2027</H2>
        <LinkChips items={[
          info.link,
          ...(['ekadashi', 'purnima', 'amavasya'] as const).filter(k => k !== kind).map(k => ({ label: `${k.charAt(0).toUpperCase() + k.slice(1)} 2027`, to: `/${k}-2027/` })),
          { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' },
          { label: 'Festival & vrat calendar 2027', to: '/festivals/2027/' },
          { label: 'Rashifal 2027', to: '/rashifal-2027/' },
        ]} />
      </section>
    </PajPage>
  );
}
