/**
 * Choghadiya today for any city and date (batch 7, W7).
 * /choghadiya (Delhi by default, or a searched place), /choghadiya/:city for the 50
 * most-populated Indian cities, ?date=YYYY-MM-DD for any day.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip, NumberNote } from '@/components/vedic/TermTip';
import { CHOGHADIYA_TERM } from '@/lib/vedic/termDefinitions';
import { computeDayPanchang, nearestCities, PANCHANG_CITIES } from '@/lib/vedic/panchangDay';
import { pageAnswer, pageMeta, indexMeta, dateWithWeekday, goodDaySlots } from '@/lib/vedic/panchangText';
import { usePanchangPlace } from '@/components/panchang/usePanchangPlace';
import { PanchangControls } from '@/components/panchang/PanchangControls';
import { AnswerBox, ChoghadiyaTables, CityLinks, choghadiyaNowIndex } from '@/components/panchang/PanchangSections';

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

export default function ChoghadiyaPage() {
  const ctl = usePanchangPlace('choghadiya');
  const { place, dateKey, tz } = ctl;

  const p = useMemo(
    () => computeDayPanchang(new Date(dateKey + 'T12:00:00Z'), place.lat, place.lon, tz, place.name),
    [place.lat, place.lon, place.name, dateKey, tz],
  );

  // Highlight the running slot only in the browser and only for today (the
  // prerendered HTML has no "now").
  const [nowIdx, setNowIdx] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!ctl.isToday) { setNowIdx(undefined); return; }
    const tick = () => {
      const local = new Date(Date.now() + tz * 3600e3).toISOString().slice(11, 16);
      setNowIdx(choghadiyaNowIndex(p, local));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [p, tz, ctl.isToday]);

  // Index page (no city in the URL, no searched place) has its own title/H1 so it never
  // duplicates the Delhi city page it shows by default.
  const meta = !ctl.cityParam && !ctl.isCustom ? indexMeta('choghadiya') : pageMeta('choghadiya', place.name);
  const canonical = ctl.cityParam && place.slug ? `/choghadiya/${place.slug}` : '/choghadiya';
  const nearby = useMemo(() => nearestCities(place, 4), [place]);
  const good = goodDaySlots(p);

  const faqItems = [
    { question: `What is today's Choghadiya in ${place.name}?`, answer: pageAnswer('choghadiya', p, place.name) },
    { question: 'What is Choghadiya?', answer: 'Choghadiya divides the day (sunrise to sunset) and the night (sunset to the next sunrise) into eight slots each. Amrit, Shubh and Labh are good; Char is neutral and fine for travel; Udveg, Kaal and Rog are avoided for new starts. It is a quick, popular way to pick a good hour for a task.' },
    { question: 'Why is a Choghadiya slot not exactly 90 minutes?', answer: 'Each slot is one-eighth of the actual daylight or night at your place. In summer the day slots are longer and the night slots shorter; in winter the reverse — and every city has its own sunrise and sunset.' },
    { question: 'How is the first Choghadiya of the day decided?', answer: 'It depends on the weekday: the day starts with Udveg on Sunday, Amrit on Monday, Rog on Tuesday, Labh on Wednesday, Shubh on Thursday, Char on Friday and Kaal on Saturday, and the slots then follow a fixed order.' },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="choghadiya-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={canonical} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Choghadiya', to: '/choghadiya' }], current: place.name }}
      footer={{ tagline: 'Choghadiya from real sunrise and sunset for your city.', nav: [{ label: 'Panchang', to: '/panchang' }, { label: 'Rahu Kaal', to: '/rahu-kaal' }, { label: 'Muhurat', to: '/muhurat' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Choghadiya"
      h1={meta.h1}
      lead={<span data-testid="panchang-date">{!ctl.cityParam && !ctl.isCustom ? `${place.name} · ` : ''}{dateWithWeekday(dateKey)}{ctl.isToday ? '' : ' (selected date)'}</span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <AnswerBox text={pageAnswer('choghadiya', p, place.name)} />

          <PanchangControls ctl={ctl} />

          {good.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-6" data-testid="choghadiya-best">
              <h2 className="font-semibold text-emerald-900 mb-1">Good daytime slots</h2>
              <ul className="text-sm text-emerald-900 space-y-0.5">
                {good.map((c, i) => <li key={i} className="tabular-nums">{CHOGHADIYA_TERM[c.name] ? <TermTip id={CHOGHADIYA_TERM[c.name]}>{c.name}</TermTip> : c.name}: {c.start}–{c.end}</li>)}
              </ul>
            </div>
          )}

          <ChoghadiyaTables p={p} nowIndex={nowIdx} />
          <NumberNote testid="choghadiya-note">Local clock times for {place.name}, rounded to the nearest minute. Each slot is one-eighth of this day's daylight (or night), so slot lengths change with the season. Night slots after midnight belong to the same Panchang day, which runs from sunrise to the next sunrise.</NumberNote>
          <div className="mb-6" />

          <h2 className="font-semibold text-foreground mb-2">What each slot means</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm mb-6" data-testid="choghadiya-guide">
            {SLOT_GUIDE.map(s => (
              <li key={s.name} className="rounded-lg border border-border px-3 py-2">
                <TermTip id={CHOGHADIYA_TERM[s.name]}>{s.name}</TermTip> — <span className="text-muted-foreground">{s.kind}</span>
              </li>
            ))}
          </ul>

          <CityLinks kind="choghadiya" city={ctl.isCustom ? undefined : place.city} nearby={nearby} all={PANCHANG_CITIES} linkTo={ctl.linkTo} />

          <PageFAQ items={faqItems} />

          <p className="text-xs text-muted-foreground mb-8">
            Worked out from the real astronomical sunrise and sunset for {place.name}.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>
        </div>
      </section>
    </ToolLayout>
  );
}
