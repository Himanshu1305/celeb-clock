/**
 * Rahu Kaal today for any city and date (batch 7, W7).
 * /rahu-kaal (index, shows Delhi), /rahu-kaal/:city for the 50 most-populated Indian
 * cities, ?date= for any day, ?place&lat&lon for any searched place. Today's content comes
 * from the shared daily-page mechanism; adds the week ahead and the weekday rule.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { NumberNote } from '@/components/vedic/TermTip';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { nearestCities, WINDOW_PARTS, PANCHANG_CITIES } from '@/lib/vedic/panchangDay';
import { pageMeta, indexMeta, dateWithWeekday } from '@/lib/vedic/panchangText';
import { usePanchangPlace } from '@/components/panchang/usePanchangPlace';
import { usePanchangEntry } from '@/components/panchang/usePanchangEntry';
import { PanchangControls } from '@/components/panchang/PanchangControls';
import { CityLinks, TermChips } from '@/components/panchang/PanchangSections';

// Which eighth of daylight holds each window, by weekday — straight from the engine table.
const WEEK_RULE = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => ({
  day, rahu: WINDOW_PARTS.rahu[i], gulika: WINDOW_PARTS.gulika[i], yama: WINDOW_PARTS.yama[i],
}));
const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const TERMS = ['Rahu Kaal', 'Gulika Kaal', 'Yamaganda', 'Dur Muhurtam', 'Varjyam', 'Brahma Muhurta', 'Abhijit Muhurta', 'Amrit Kalam'];

export default function RahuKaalPage() {
  const ctl = usePanchangPlace('rahu-kaal');
  const { place, dateKey } = ctl;
  const { entry, path, isIndex } = usePanchangEntry('rahu-kaal', ctl);
  const weekday = new Date(dateKey + 'T12:00:00Z').getUTCDay();

  const meta = isIndex ? indexMeta('rahu-kaal') : pageMeta('rahu-kaal', place.name);
  const canonical = ctl.cityParam && place.slug ? `/rahu-kaal/${place.slug}` : '/rahu-kaal';
  const nearby = useMemo(() => nearestCities(place, 4), [place]);

  return (
    <ToolLayout
      theme="vedic"
      testId="rahu-kaal-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={canonical} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Rahu Kaal', to: '/rahu-kaal' }], current: place.name }}
      footer={{ tagline: 'Rahu Kaal from real sunrise and sunset for your city.', nav: [{ label: 'Panchang', to: '/panchang' }, { label: 'Choghadiya', to: '/choghadiya' }, { label: 'Muhurat', to: '/muhurat' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Rahu Kaal"
      h1={<DailyH1 entry={entry} fallback={meta.h1} />}
      lead={<span data-testid="panchang-date">{isIndex ? `${place.name} · ` : ''}<DailyDate entry={entry} fallback={dateWithWeekday(dateKey)} /></span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <PanchangControls ctl={ctl} />

          <DailyBody entry={entry} testId="rahu-kaal-daily" />
          <DailyJsonLd entry={entry} path={path} />

          <TermChips labels={TERMS} />

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
                {WEEK_RULE.map((w, i) => (
                  <tr key={w.day} className={`border-t border-border ${i === weekday ? 'bg-primary/5 font-medium' : ''}`}>
                    <td className="px-3 py-2">{w.day}</td>
                    <td className="px-3 py-2">{ORD[w.rahu]} part</td>
                    <td className="px-3 py-2">{ORD[w.gulika]} part</td>
                    <td className="px-3 py-2">{ORD[w.yama]} part</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <NumberNote testid="rahu-kaal-rule-note">Daylight (sunrise to sunset) is divided into eight equal parts; the table shows which part each window takes on each weekday. Because it follows the real sunrise and sunset, the clock time differs from city to city and shifts through the year.</NumberNote>
          <div className="mb-6" />

          <div className="rounded-xl border border-border p-4 mb-6 text-sm text-muted-foreground space-y-2" data-testid="rahu-kaal-how">
            <h2 className="font-semibold text-foreground">What to do during Rahu Kaal</h2>
            <p>Traditionally people avoid <em>starting</em> something new — a journey, a purchase, a ceremony or signing an agreement — during Rahu Kaal. Work already under way can simply continue. It is a gentle timing guide, not a cause for worry.</p>
            <p>Times are local clock times rounded to the nearest minute, from the real astronomical sunrise and sunset; checked against Drik Panchang they agree to within a minute. <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link></p>
          </div>

          <CityLinks kind="rahu-kaal" city={ctl.isCustom ? undefined : place.city} nearby={nearby} all={PANCHANG_CITIES} linkTo={ctl.linkTo} />
        </div>
      </section>
    </ToolLayout>
  );
}
