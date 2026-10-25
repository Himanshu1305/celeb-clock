/**
 * Panchang for any city and any date (batch 7, W7; first built in Growth P1-2).
 * /panchang (Delhi by default, or any searched place via ?place&lat&lon),
 * /panchang/:city for the 50 most-populated Indian cities, ?date=YYYY-MM-DD for any day.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip, NumberNote } from '@/components/vedic/TermTip';
import { limbEndNote } from '@/lib/vedic/numberNotes';
import { computeDayPanchang, nearestCities, sunriseSunset, PANCHANG_CITIES, panchangCityBySlug } from '@/lib/vedic/panchangDay';
import { karanaName } from '@/lib/vedic/panchang';
import { pageAnswer, pageMeta, indexMeta, cityContrast, dateWithWeekday } from '@/lib/vedic/panchangText';
import { usePanchangPlace } from '@/components/panchang/usePanchangPlace';
import { PanchangControls } from '@/components/panchang/PanchangControls';
import { AnswerBox, MuhurtaLists, ChoghadiyaTables, CityLinks } from '@/components/panchang/PanchangSections';

const TITHI_TERM: Record<string, string> = { Purnima: 'purnima', Amavasya: 'amavasya', Ekadashi: 'ekadashi' };
const HINDI_SLUGS = new Set(['delhi', 'mumbai', 'bengaluru', 'kolkata', 'chennai', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow']);

export default function PanchangPage() {
  const ctl = usePanchangPlace('panchang');
  const { place, dateKey, tz } = ctl;

  const p = useMemo(
    () => computeDayPanchang(new Date(dateKey + 'T12:00:00Z'), place.lat, place.lon, tz, place.name),
    [place.lat, place.lon, place.name, dateKey, tz],
  );
  const delhi = panchangCityBySlug('delhi')!;
  const contrast = useMemo(() => {
    if (place.slug === 'delhi' || ctl.isCustom) return cityContrast(place.name, p, null);
    const d = sunriseSunset(new Date(dateKey + 'T12:00:00Z'), delhi.lat, delhi.lon, 5.5);
    const f = (x: Date) => new Date(Math.round((x.getTime() + 5.5 * 3600e3) / 60000) * 60000).toISOString().slice(11, 16);
    return cityContrast(place.name, p, { sunrise: f(d.rise), sunset: f(d.set) });
  }, [p, place.slug, place.name, ctl.isCustom, dateKey, delhi.lat, delhi.lon]);

  // Index page (no city in the URL, no searched place) has its own title/H1 so it never
  // duplicates the Delhi city page it shows by default.
  const meta = !ctl.cityParam && !ctl.isCustom ? indexMeta('panchang') : pageMeta('panchang', place.name);
  const canonical = ctl.cityParam && place.slug ? `/panchang/${place.slug}` : '/panchang';
  const nearby = useMemo(() => nearestCities(place, 4), [place]);

  const faqItems = [
    { question: 'What is Panchang?', answer: 'Panchang ("five limbs") is the Vedic almanac for a day: the Tithi (lunar day), Nakshatra (Moon\'s star), Yoga, Karana and Vara (weekday). It is used to understand the quality of a day and to choose auspicious timing.' },
    { question: `How is the Panchang for ${place.name} different from other cities?`, answer: `The Tithi, Nakshatra and Yoga change at the same instant everywhere, but which one is "at sunrise", and every timing on this page — sunrise, sunset, Rahu Kaal, the muhurtas and Choghadiya — depends on the local sunrise and sunset. They are worked out here for ${place.name}'s own latitude and longitude.` },
    { question: 'What is Rahu Kaal?', answer: 'Rahu Kaal is a roughly 90-minute window each day traditionally considered unsuitable for starting important work. It is one of the eight equal parts of daylight, with the part depending on the weekday — so it is computed here from the real sunrise and sunset.' },
    { question: 'What are Brahma Muhurta, Amrit Kalam, Varjyam and Dur Muhurtam?', answer: 'Brahma Muhurta is the quiet period before dawn (the 14th of the 15 parts of the night). Amrit Kalam is a favourable window and Varjyam one avoided for new starts — each a fixed slice of the day\'s Nakshatra. Dur Muhurtam is one or two short daytime windows, fixed by the weekday, avoided for auspicious starts.' },
    { question: 'Can I see the Panchang for another date?', answer: 'Yes — use the previous / next day buttons or pick any date in the date box. You can also search any town in the world; the times are worked out for that place and its local time zone.' },
    { question: 'How accurate are the timings?', answer: 'Sunrise, sunset and all derived windows come from the real astronomical position of the Sun for the place, and the five limbs from the sidereal (Lahiri) Sun and Moon. Times are rounded to the nearest minute; checked against Drik Panchang they agree to within a minute.' },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="panchang-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={canonical} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Panchang', to: '/panchang' }], current: place.name }}
      footer={{ tagline: 'Daily Panchang computed from real sunrise and sunset.', nav: [{ label: 'Rahu Kaal', to: '/rahu-kaal' }, { label: 'Choghadiya', to: '/choghadiya' }, { label: 'Muhurat', to: '/muhurat' }, { label: 'Rashifal', to: '/rashifal' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Panchang"
      h1={meta.h1}
      lead={<span data-testid="panchang-date">{!ctl.cityParam && !ctl.isCustom ? `${place.name} · ` : ''}{dateWithWeekday(dateKey)}{ctl.isToday ? '' : ' (selected date)'}</span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <AnswerBox text={pageAnswer('panchang', p, place.name)} />

          <PanchangControls ctl={ctl} />

          {place.slug && HINDI_SLUGS.has(place.slug) && !ctl.isCustom ? (
            <p className="text-sm mb-4"><Link to={`/hi/panchang/${place.slug}`} className="text-primary hover:underline">{place.name} का पंचांग हिन्दी में देखें →</Link></p>
          ) : (
            <p className="text-sm mb-4"><Link to="/hi/panchang" className="text-primary hover:underline">हिन्दी में देखें →</Link></p>
          )}

          {/* Five limbs */}
          <p className="text-sm text-muted-foreground mb-2">The five limbs of the <TermTip id="panchang">Panchang</TermTip> at sunrise:</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-2" data-testid="panchang-limbs">
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground"><TermTip id="tithi">Tithi</TermTip></div>
              <div className="font-semibold text-foreground">{TITHI_TERM[p.tithiName] ? <TermTip id={TITHI_TERM[p.tithiName]}>{p.tithiName}</TermTip> : p.tithiName} <span className="text-muted-foreground font-normal">(<TermTip id="paksha">{p.paksha} Paksha</TermTip>)</span></div>
              <div className="text-xs text-muted-foreground tabular-nums">till {p.tithiEnd}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground"><TermTip id="panchangNakshatra">Nakshatra</TermTip></div>
              <div className="font-semibold text-foreground">{p.nakshatra}</div>
              <div className="text-xs text-muted-foreground tabular-nums">till {p.nakshatraEnd}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground"><TermTip id="panchangYoga">Yoga</TermTip></div>
              <div className="font-semibold text-foreground">{p.yoga}</div>
              <div className="text-xs text-muted-foreground tabular-nums">till {p.yogaEnd}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground"><TermTip id="karana">Karana</TermTip> · <TermTip id="vara">Vara</TermTip></div>
              <div className="font-semibold text-foreground">{karanaName(p.karana).startsWith('Vishti') ? <TermTip id="bhadra">{karanaName(p.karana)}</TermTip> : karanaName(p.karana)} · {p.weekday}</div>
              <div className="text-xs text-muted-foreground tabular-nums">Karana till {p.karanaEnd}</div>
            </div>
          </div>
          <NumberNote testid="panchang-limb-note">{limbEndNote()}</NumberNote>
          <div className="mb-6" />

          <div className="rounded-xl border border-border p-4 mb-6" data-testid="panchang-sun">
            <h2 className="font-semibold text-foreground mb-2">Sun in {place.name}</h2>
            <div className="text-sm text-muted-foreground">Sunrise <strong className="text-foreground tabular-nums">{p.sunrise}</strong> · Sunset <strong className="text-foreground tabular-nums">{p.sunset}</strong></div>
            <p className="text-sm text-muted-foreground mt-1" data-testid="panchang-city-contrast">{contrast}</p>
          </div>

          <MuhurtaLists p={p} place={place.name} />

          <ChoghadiyaTables p={p} />

          <p className="text-xs text-muted-foreground mb-8">
            Sunrise, sunset and every window are computed from the real astronomical position of the Sun for {place.name}'s coordinates, and the five limbs from the sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) Sun and Moon — the same engine behind your Kundli.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <CityLinks kind="panchang" city={ctl.isCustom ? undefined : place.city} nearby={nearby} all={PANCHANG_CITIES} linkTo={ctl.linkTo} />

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Choosing a date for something important? Find an auspicious muhurat.</p>
            <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Muhurat finder →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
