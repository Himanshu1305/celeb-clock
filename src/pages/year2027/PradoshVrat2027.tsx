/**
 * /pradosh-vrat-2027 — every Pradosh Vrat of 2027 with the Trayodashi start / end and the
 * pradosh puja window (IST, New Delhi). Dates from the festival engine (pradoshDays — the
 * same rule and dates as the /festivals/2027 calendar's "Pradosh Vrat" rows); the puja window
 * from pradoshPujaWindow (the same window the /vrat/pradosh-vrat/ page shows).
 */
import { useMemo } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { ScrollTable } from '@/components/ScrollTable';
import { pradoshDays, type PradoshDay } from '@/lib/vedic/festivals';
import { pradoshPujaWindow } from '@/lib/vedic/vrats/next';
import { dayLabel, istTime, stamp, weekday } from '@/lib/year2027/festivalData';
import { year2027Meta, p2027 } from '@/lib/year2027/meta.js';
import { H2, FaqList, LinkChips, YearJsonLd } from './parts';

/** Traditional weekday names of Pradosh (Sunday … Saturday). */
export const PRADOSH_DAY_NAME = ['Ravi Pradosh', 'Som Pradosh', 'Bhaum Pradosh', 'Budh Pradosh', 'Guru Pradosh', 'Shukra Pradosh', 'Shani Pradosh'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso: string) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}`;
const dow = (iso: string) => new Date(iso + 'T12:00:00Z').getUTCDay();
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

interface Row extends PradoshDay { dayName: string; window: [number, number] | null }

export function pradoshRows2027(): Row[] {
  return pradoshDays(2027).map(r => ({ ...r, dayName: PRADOSH_DAY_NAME[dow(r.dateISO)], window: pradoshPujaWindow(r.dateISO, r.paksha) }));
}

export default function PradoshVrat2027() {
  const path = p2027.pradosh;
  const meta = year2027Meta(path)!;
  const rows = useMemo(pradoshRows2027, []);
  const byName = (n: string) => rows.filter(r => r.dayName === n).map(r => short(r.dateISO));
  const som = byName('Som Pradosh'), bhaum = byName('Bhaum Pradosh'), shani = byName('Shani Pradosh');
  const mahaShivratriEve = rows.find(r => r.month === 'Magha' && r.paksha === 'Krishna');
  const crumbs = [{ name: 'Hindu calendar 2027', path: '/hindu-calendar-2027' }, { name: 'Pradosh Vrat 2027', path }];

  const faq = [
    { question: 'How many Pradosh Vrats are there in 2027?', answer: `${rows.length} Pradosh Vrats fall in 2027 (New Delhi): ${rows.map(r => short(r.dateISO)).join(', ')}.` },
    { question: 'Which Pradosh Vrats in 2027 fall on a Monday, Tuesday or Saturday?', answer: `Som Pradosh (Monday): ${list(som) || 'none'}. Bhaum Pradosh (Tuesday): ${list(bhaum) || 'none'}. Shani Pradosh (Saturday): ${list(shani) || 'none'}. These weekday Pradoshs are traditionally given extra importance, but every Pradosh is kept the same way.` },
    { question: 'Why is Pradosh sometimes on the day before Trayodashi in the calendar?', answer: 'Pradosh is decided by the evening, not the morning. The vrat day is the one on which Trayodashi (the 13th lunar day) is running during pradosh kaal, the time just after sunset. If Trayodashi begins in the afternoon, that evening is the Pradosh even though the morning was still Dwadashi.' },
    { question: 'What time is the Pradosh puja?', answer: 'In the evening, starting at sunset. The table gives the window for New Delhi: from sunset for about the first fifth of the night (roughly two and a half hours), shortened when Trayodashi begins after sunset or ends before the window closes. Sunset — and so the window — is a little different in other cities.' },
    { question: 'Are the dates the same everywhere?', answer: 'In most of India, yes, but not always. Because the rule depends on local sunset, a Pradosh that sits close to the boundary can move by a day between cities, and in North America or the UK it is often a day earlier than in India. Use the date for where you live.' },
    { question: 'Do I have to fast without water?', answer: 'No. Many people keep a simple fast or eat one light meal, and many only do the evening puja. Elders, anyone unwell, pregnant or on medication should not fast strictly — devotion and the evening prayer are what the vrat is about.' },
  ];

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="pradosh2027"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png" breadcrumbItems={crumbs} articleSchema={false} />}
      breadcrumb={{ trail: [{ label: 'Festivals', to: '/festivals/' }, { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }], current: 'Pradosh Vrat 2027', edition: 'Vrat dates 2027' }}
      footer={{ tagline: 'Vrat dates computed from the real Sun and Moon.', nav: [{ label: 'Ekadashi 2027', to: '/ekadashi-2027/' }, { label: 'Purnima 2027', to: '/purnima-2027/' }, { label: 'Amavasya 2027', to: '/amavasya-2027/' }, { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }], note: 'Dates and times are for New Delhi (IST).' }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={faq} lang="en" />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">2027</span><h1 data-testid="pradosh2027-h1">{meta.h1}</h1></div>
          <p>{rows.length} Pradosh Vrat dates in 2027 — two a month, one in each fortnight — with the Trayodashi start and end and the evening puja window in IST for New Delhi.</p>
        </div>

        <ScrollTable>
          <table className="w-full text-sm" data-testid="pradosh2027-table">
            <thead><tr className="text-left text-brand-muted"><th className="py-1 pr-3 font-medium">Date</th><th className="py-1 pr-3 font-medium">Pradosh</th><th className="py-1 pr-3 font-medium">Month & paksha</th><th className="py-1 pr-3 font-medium">Puja window</th><th className="py-1 pr-3 font-medium">Trayodashi begins</th><th className="py-1 pr-3 font-medium">Trayodashi ends</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.dateISO} className="border-t border-brand-line text-brand-ink align-top" data-date={r.dateISO}>
                  <td className="py-1.5 pr-3 whitespace-nowrap font-medium">{dayLabel(r.dateISO, 'en')}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{r.dayName}</td>
                  <td className="py-1.5 pr-3">{r.monthPurnimanta === r.month ? `${r.month} ${r.paksha}` : `${r.monthPurnimanta} ${r.paksha} (purnimanta) / ${r.month} (amanta)`}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{r.window ? `${istTime(r.window[0])}–${istTime(r.window[1])}` : '—'}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{stamp(r.tithiStart, 'en')}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{stamp(r.tithiEnd, 'en')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTable>
        <p className="text-xs text-brand-muted !mt-3">Computed by BornClock’s festival engine from real Sun and Moon positions for New Delhi: the vrat day is the evening on which Trayodashi covers pradosh kaal, and the puja window runs from sunset for one fifth of the night while Trayodashi lasts. <Link to="/accuracy/" className="underline">How we check our dates →</Link></p>

        <H2 id="weekday">The weekday Pradoshs of 2027</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed">
          <p>A Pradosh takes the name of the weekday it falls on, and three of them are especially popular. <strong>Som Pradosh</strong> (Monday — Monday is already Shiva’s day) falls on {list(som) || 'no date'} in 2027. <strong>Bhaum Pradosh</strong> (Tuesday, Mars’s day, often kept for relief from debts and quarrels) falls on {list(bhaum) || 'no date'}. <strong>Shani Pradosh</strong> (Saturday, linked in tradition with the Mahakaleshwar legend of Ujjain and with prayers for children) falls on {list(shani) || 'no date'}.</p>
          {mahaShivratriEve && <p>The Krishna-paksha Pradosh of Magha (purnimanta Phalguna) — {dayLabel(mahaShivratriEve.dateISO, 'en')} — falls on the eve of <Link to="/festivals/2027/mahashivratri/" className="underline">Mahashivratri 2027</Link>, which is why many calendars call it Maha Pradosh.</p>}
          <p>The other weekday names — Ravi, Budh, Guru and Shukra Pradosh — are used too, but the way the vrat is kept does not change with the weekday.</p>
        </div>

        <H2 id="about">What Pradosh Vrat is</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed">
          <p>Pradosh Vrat is a twice-monthly fast and evening prayer to Lord Shiva on Trayodashi, the thirteenth lunar day of each fortnight. “Pradosh” means the beginning of the night — the twilight hours just after sunset — and that is when the worship is done. Because there is one Trayodashi in the waxing fortnight (Shukla paksha) and one in the waning fortnight (Krishna paksha), a year usually has 24 or 25 Pradoshs — twelve lunar months are about eleven days shorter than the calendar year, so some years fit an extra one. 2027 has {rows.length}.</p>
          <p>In South India the same observance is called Pradosham. Shiva temples worship Nandi, Shiva’s bull, at dusk, and the festival image of Shiva and Parvati seated on Nandi is taken around the temple. The story, the puja steps and the katha are on our <Link to="/vrat/pradosh-vrat/" className="underline">Pradosh Vrat katha and puja vidhi</Link> page.</p>
        </div>

        <H2 id="rule">How the date is decided</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed">
          <p>Most Hindu observances are dated by the tithi running at sunrise. Pradosh is the exception: it follows the tithi running in the evening. A lunar day (tithi) does not line up with a calendar day — it can begin at any hour and last anywhere from about 19 to 26 hours — so the engine checks the actual Trayodashi start and end times against the actual New Delhi sunset for each candidate day. The day whose pradosh kaal is covered by Trayodashi is the vrat day. When two evenings are both partly covered, the one with more coverage wins.</p>
          <p>That is why the “Trayodashi begins” column sometimes shows the morning or afternoon of the vrat day (the evening is Trayodashi), and why on a few dates Trayodashi only starts after sunset — the puja window is then shorter, starting when Trayodashi begins. The window column already accounts for this.</p>
          <p>The months are shown in both systems. North Indian (purnimanta) calendars start each month after the full moon, so the waning fortnight carries the next month’s name; South and West Indian (amanta) calendars start each month after the new moon. The date is the same either way.</p>
        </div>

        <H2 id="observe">How to keep Pradosh Vrat simply</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed">
          <p>Nothing has to be bought and no priest is needed. A simple, widely followed way:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Morning:</strong> bathe, and make a quiet resolution (sankalp) to keep the vrat. Eat lightly or keep a fruit-and-milk fast if your health allows.</li>
            <li><strong>Before sunset:</strong> bathe again or wash, and set up a lamp near a Shiva lingam or a picture of Shiva and Parvati.</li>
            <li><strong>In the puja window:</strong> offer water or milk, a few bel (bilva) leaves if you have them, a lamp and incense, and chant “Om Namah Shivaya”. Read or listen to the Pradosh katha.</li>
            <li><strong>After the puja:</strong> break the fast with a simple sattvic meal. Sharing food with someone who needs it is a traditional part of the day.</li>
          </ul>
          <p>If you cannot fast, the evening prayer alone is a complete observance. Visiting a nearby Shiva temple at dusk is the traditional alternative to puja at home.</p>
        </div>

        <H2 id="faq">Pradosh Vrat 2027 — questions</H2>
        <FaqList items={faq} testId="pradosh2027-faq" />

        <H2 id="more">More for 2027</H2>
        <LinkChips items={[
          { label: 'Pradosh Vrat katha & puja vidhi', to: '/vrat/pradosh-vrat/' },
          { label: 'Mahashivratri 2027', to: '/festivals/2027/mahashivratri/' },
          { label: 'Ekadashi 2027', to: '/ekadashi-2027/' },
          { label: 'Purnima 2027', to: '/purnima-2027/' },
          { label: 'Amavasya 2027', to: '/amavasya-2027/' },
          { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' },
          { label: 'Festival & vrat calendar 2027', to: '/festivals/2027/' },
          { label: 'Today’s Panchang', to: '/panchang/' },
          { label: 'Rashifal 2027', to: '/rashifal-2027/' },
        ]} />
        <p className="text-xs text-brand-muted !mt-6">Times are in IST for New Delhi ({weekday(rows[0].dateISO, 'en')} {short(rows[0].dateISO)} to {weekday(rows[rows.length - 1].dateISO, 'en')} {short(rows[rows.length - 1].dateISO)}). For another city, the date is usually the same but the puja window follows your local sunset.</p>
      </section>
    </PajPage>
  );
}
