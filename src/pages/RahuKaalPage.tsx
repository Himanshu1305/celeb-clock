/**
 * Rahu Kaal today for any city and date (batch 7, W7).
 * /rahu-kaal (Delhi by default, or a searched place), /rahu-kaal/:city for the 50
 * most-populated Indian cities, ?date=YYYY-MM-DD for any day. Adds what the full
 * Panchang page does not: the week-ahead Rahu Kaal table and the weekday rule.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip, NumberNote } from '@/components/vedic/TermTip';
import { computeDayPanchang, dayWindowsLite, WINDOW_PARTS, addDaysKey, nearestCities, PANCHANG_CITIES } from '@/lib/vedic/panchangDay';
import { pageAnswer, pageMeta, indexMeta, dateWithWeekday, windowText } from '@/lib/vedic/panchangText';
import { usePanchangPlace } from '@/components/panchang/usePanchangPlace';
import { PanchangControls } from '@/components/panchang/PanchangControls';
import { AnswerBox, MuhurtaLists, CityLinks } from '@/components/panchang/PanchangSections';

// Which eighth of daylight holds each window, by weekday — straight from the engine table.
const WEEK_RULE = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => ({
  day, rahu: WINDOW_PARTS.rahu[i], gulika: WINDOW_PARTS.gulika[i], yama: WINDOW_PARTS.yama[i],
}));
const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function RahuKaalPage() {
  const ctl = usePanchangPlace('rahu-kaal');
  const { place, dateKey, tz } = ctl;

  const p = useMemo(
    () => computeDayPanchang(new Date(dateKey + 'T12:00:00Z'), place.lat, place.lon, tz, place.name),
    [place.lat, place.lon, place.name, dateKey, tz],
  );
  const week = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dayWindowsLite(new Date(addDaysKey(dateKey, i) + 'T12:00:00Z'), place.lat, place.lon, tz)),
    [place.lat, place.lon, dateKey, tz],
  );
  // Index page (no city in the URL, no searched place) has its own title/H1 so it never
  // duplicates the Delhi city page it shows by default.
  const meta = !ctl.cityParam && !ctl.isCustom ? indexMeta('rahu-kaal') : pageMeta('rahu-kaal', place.name);
  const canonical = ctl.cityParam && place.slug ? `/rahu-kaal/${place.slug}` : '/rahu-kaal';
  const nearby = useMemo(() => nearestCities(place, 4), [place]);

  const faqItems = [
    { question: `What is the Rahu Kaal time in ${place.name} today?`, answer: `On ${dateWithWeekday(p.date)} Rahu Kaal in ${place.name} is ${windowText(p.rahuKaal)} (local time), from a sunrise of ${p.sunrise} and a sunset of ${p.sunset}.` },
    { question: 'How is Rahu Kaal calculated?', answer: 'The time from sunrise to sunset is split into eight equal parts. Rahu Kaal is one of those parts, and which one depends on the weekday — for example the 8th (last) part on Sunday and the 2nd part on Monday. Because it follows the real sunrise and sunset, it is different in every city and shifts through the year.' },
    { question: 'Why does Rahu Kaal change from city to city?', answer: 'Sunrise and sunset come at different clock times in different places — earlier in the east of India, later in the west — and day length changes with latitude and season. Rahu Kaal is a fixed share of that local daylight, so its clock time moves with it.' },
    { question: 'What should I avoid during Rahu Kaal?', answer: 'Traditionally people avoid starting something new — a journey, a purchase, a ceremony or signing an agreement — during Rahu Kaal. Work that is already under way can simply continue. It is a gentle timing guide, not a cause for worry.' },
    { question: 'What are Gulika Kaal and Yamaganda?', answer: 'They are two more eighths of daylight, also fixed by the weekday. Gulika Kaal is avoided for things you would not want to repeat; Yamaganda, like Rahu Kaal, is avoided for new starts and journeys.' },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="rahu-kaal-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={canonical} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Rahu Kaal', to: '/rahu-kaal' }], current: place.name }}
      footer={{ tagline: 'Rahu Kaal from real sunrise and sunset for your city.', nav: [{ label: 'Panchang', to: '/panchang' }, { label: 'Choghadiya', to: '/choghadiya' }, { label: 'Muhurat', to: '/muhurat' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Rahu Kaal"
      h1={meta.h1}
      lead={<span data-testid="panchang-date">{!ctl.cityParam && !ctl.isCustom ? `${place.name} · ` : ''}{dateWithWeekday(dateKey)}{ctl.isToday ? '' : ' (selected date)'}</span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <AnswerBox text={pageAnswer('rahu-kaal', p, place.name)} />

          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 mb-6 text-center" data-testid="rahu-kaal-today">
            <div className="text-sm text-rose-800"><TermTip id="rahuKalam">Rahu Kaal</TermTip> · {p.weekday}</div>
            <div className="text-3xl font-bold tabular-nums text-rose-800 my-1">{p.rahuKaal.start} – {p.rahuKaal.end}</div>
            <div className="text-xs text-rose-800/80">{ORD[WEEK_RULE.find(w => w.day === p.weekday)!.rahu]} of the eight parts of daylight · sunrise {p.sunrise}, sunset {p.sunset}</div>
          </div>

          <PanchangControls ctl={ctl} />

          <MuhurtaLists p={p} place={place.name} highlight="rahu" />

          <h2 className="font-semibold text-foreground mb-2">Rahu Kaal for the next 7 days in {place.name}</h2>
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-sm border border-border rounded-lg" data-testid="rahu-kaal-week">
              <thead><tr className="bg-muted/40 text-left">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Rahu Kaal</th>
                <th className="px-3 py-2 font-medium">Gulika</th>
                <th className="px-3 py-2 font-medium">Yamaganda</th>
              </tr></thead>
              <tbody>
                {week.map(d => (
                  <tr key={d.date} className="border-t border-border">
                    <td className="px-3 py-2">{d.weekday.slice(0, 3)}, {Number(d.date.slice(8))} {new Date(d.date + 'T12:00:00Z').toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })}</td>
                    <td className="px-3 py-2 tabular-nums text-rose-700">{d.rahuKaal.start}–{d.rahuKaal.end}</td>
                    <td className="px-3 py-2 tabular-nums">{d.gulikaKaal.start}–{d.gulikaKaal.end}</td>
                    <td className="px-3 py-2 tabular-nums">{d.yamaganda.start}–{d.yamaganda.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <NumberNote testid="rahu-kaal-week-note">Each day's windows are worked out from that day's own sunrise and sunset in {place.name}, so they drift by a minute or so from day to day.</NumberNote>
          <div className="mb-6" />

          <h2 className="font-semibold text-foreground mb-2">Which part of the day, by weekday</h2>
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-sm border border-border rounded-lg" data-testid="rahu-kaal-rule">
              <thead><tr className="bg-muted/40 text-left">
                <th className="px-3 py-2 font-medium">Weekday</th>
                <th className="px-3 py-2 font-medium">Rahu Kaal</th>
                <th className="px-3 py-2 font-medium">Gulika</th>
                <th className="px-3 py-2 font-medium">Yamaganda</th>
              </tr></thead>
              <tbody>
                {WEEK_RULE.map(w => (
                  <tr key={w.day} className={`border-t border-border ${w.day === p.weekday ? 'bg-primary/5 font-medium' : ''}`}>
                    <td className="px-3 py-2">{w.day}</td>
                    <td className="px-3 py-2">{ORD[w.rahu]} part</td>
                    <td className="px-3 py-2">{ORD[w.gulika]} part</td>
                    <td className="px-3 py-2">{ORD[w.yama]} part</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <NumberNote testid="rahu-kaal-rule-note">Daylight (sunrise to sunset) is divided into eight equal parts; the table shows which part each window takes on each weekday.</NumberNote>
          <div className="mb-6" />

          <CityLinks kind="rahu-kaal" city={ctl.isCustom ? undefined : place.city} nearby={nearby} all={PANCHANG_CITIES} linkTo={ctl.linkTo} />

          <PageFAQ items={faqItems} />

          <p className="text-xs text-muted-foreground mb-8">
            Times are local clock times, rounded to the nearest minute, from the real astronomical sunrise and sunset for {place.name}.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>
        </div>
      </section>
    </ToolLayout>
  );
}
