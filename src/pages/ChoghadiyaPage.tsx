/**
 * Choghadiya today for any city and date (batch 7, W7).
 * /choghadiya (index, shows Delhi), /choghadiya/:city for the 50 most-populated Indian
 * cities, ?date= for any day, ?place&lat&lon for any searched place. Today's content comes
 * from the shared daily-page mechanism.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { CHOGHADIYA_TERM } from '@/lib/vedic/termDefinitions';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { computeDayPanchang, nearestCities, PANCHANG_CITIES } from '@/lib/vedic/panchangDay';
import { pageMeta, indexMeta, dateWithWeekday } from '@/lib/vedic/panchangText';
import { usePanchangPlace } from '@/components/panchang/usePanchangPlace';
import { usePanchangEntry } from '@/components/panchang/usePanchangEntry';
import { PanchangControls } from '@/components/panchang/PanchangControls';
import { CityLinks, choghadiyaNowIndex } from '@/components/panchang/PanchangSections';

// What each slot is traditionally used for (summarised from the glossary entries in termDefinitions.ts).
const SLOT_GUIDE: Array<{ name: string; kind: string }> = [
  { name: 'Amrit', kind: 'Good — the best slot, for any important start' },
  { name: 'Shubh', kind: 'Good — ceremonies, learning and new starts' },
  { name: 'Labh', kind: 'Good — business, buying and money matters' },
  { name: 'Char', kind: 'Neutral — considered fine for travel' },
  { name: 'Udveg', kind: 'Avoid for new starts' },
  { name: 'Kaal', kind: 'Avoid for new starts' },
  { name: 'Rog', kind: 'Avoid for new starts' },
];

/** "Right now" line — browser only, today only (never in the prerendered HTML). */
function NowLine({ lat, lon, tz, name, dateKey }: { lat: number; lon: number; tz: number; name: string; dateKey: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as { __PRERENDER__?: boolean }).__PRERENDER__) return;
    const p = computeDayPanchang(new Date(dateKey + 'T12:00:00Z'), lat, lon, tz, name);
    const tick = () => {
      const local = new Date(Date.now() + tz * 3600e3).toISOString().slice(11, 16);
      const i = choghadiyaNowIndex(p, local);
      const c = i === undefined ? null : [...p.dayChoghadiya, ...p.nightChoghadiya][i];
      setText(c ? `Right now (${local}) in ${name}: ${c.name}, until ${c.end}.` : null);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [lat, lon, tz, name, dateKey]);
  return text ? <p className="text-sm font-medium text-foreground mb-4" data-testid="choghadiya-now">{text}</p> : null;
}

export default function ChoghadiyaPage() {
  const ctl = usePanchangPlace('choghadiya');
  const { place, dateKey, tz } = ctl;
  const { entry, path, isIndex } = usePanchangEntry('choghadiya', ctl);

  const meta = isIndex ? indexMeta('choghadiya') : pageMeta('choghadiya', place.name);
  const canonical = ctl.cityParam && place.slug ? `/choghadiya/${place.slug}` : '/choghadiya';
  const nearby = useMemo(() => nearestCities(place, 4), [place]);

  return (
    <ToolLayout
      theme="vedic"
      testId="choghadiya-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={canonical} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Choghadiya', to: '/choghadiya' }], current: place.name }}
      footer={{ tagline: 'Choghadiya from real sunrise and sunset for your city.', nav: [{ label: 'Panchang', to: '/panchang' }, { label: 'Rahu Kaal', to: '/rahu-kaal' }, { label: 'Muhurat', to: '/muhurat' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Choghadiya"
      h1={<DailyH1 entry={entry} fallback={meta.h1} />}
      lead={<span data-testid="panchang-date">{isIndex ? `${place.name} · ` : ''}<DailyDate entry={entry} fallback={dateWithWeekday(dateKey)} /></span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <PanchangControls ctl={ctl} />

          {ctl.isToday && <NowLine lat={place.lat} lon={place.lon} tz={tz} name={place.name} dateKey={dateKey} />}

          <DailyBody entry={entry} testId="choghadiya-daily" />
          <DailyJsonLd entry={entry} path={path} />

          <h2 className="font-semibold text-foreground mb-2">What each slot means</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm mb-6" data-testid="choghadiya-guide">
            {SLOT_GUIDE.map(s => (
              <li key={s.name} className="rounded-lg border border-border px-3 py-2">
                <TermTip id={CHOGHADIYA_TERM[s.name]}>{s.name}</TermTip> — <span className="text-muted-foreground">{s.kind}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-border p-4 mb-6 text-sm text-muted-foreground space-y-2" data-testid="choghadiya-how">
            <h2 className="font-semibold text-foreground">How <TermTip id="choghadiya">Choghadiya</TermTip> is worked out</h2>
            <p>The day (sunrise to sunset) and the night (sunset to the next sunrise) are each split into eight equal slots, so a slot is longer than 90 minutes in summer daytime and shorter in winter. The weekday fixes the first slot of the day — Udveg on Sunday, Amrit on Monday, Rog on Tuesday, Labh on Wednesday, Shubh on Thursday, Char on Friday, Kaal on Saturday — and the slots then follow a fixed order.</p>
            <p>Night slots after midnight still belong to the same Panchang day, which runs from sunrise to the next sunrise. Times are local clock times rounded to the nearest minute. <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link></p>
          </div>

          <CityLinks kind="choghadiya" city={ctl.isCustom ? undefined : place.city} nearby={nearby} all={PANCHANG_CITIES} linkTo={ctl.linkTo} />
        </div>
      </section>
    </ToolLayout>
  );
}
