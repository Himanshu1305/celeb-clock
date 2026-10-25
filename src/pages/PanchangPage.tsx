/**
 * Panchang for any city and any date (batch 7, W7; first built in Growth P1-2).
 * /panchang (index, shows Delhi), /panchang/:city for the 50 most-populated Indian cities,
 * ?date=YYYY-MM-DD for any day, ?place&lat&lon for any searched place.
 * Today's content for built-in cities comes from the shared daily-page mechanism
 * (src/lib/daily) so it never goes stale between deploys.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { nearestCities, PANCHANG_CITIES } from '@/lib/vedic/panchangDay';
import { pageMeta, indexMeta, dateWithWeekday } from '@/lib/vedic/panchangText';
import { usePanchangPlace } from '@/components/panchang/usePanchangPlace';
import { usePanchangEntry } from '@/components/panchang/usePanchangEntry';
import { PanchangControls } from '@/components/panchang/PanchangControls';
import { CityLinks, TermChips } from '@/components/panchang/PanchangSections';
import { HINDI_PANCHANG_SLUGS } from '@/lib/seo/panchangSlugs';

const TERMS = ['Panchang', 'Tithi', 'Paksha', 'Nakshatra', 'Yoga', 'Karana', 'Vara', 'Brahma Muhurta', 'Abhijit Muhurta', 'Amrit Kalam', 'Rahu Kaal', 'Gulika Kaal', 'Yamaganda', 'Dur Muhurtam', 'Varjyam', 'Choghadiya'];

export default function PanchangPage() {
  const ctl = usePanchangPlace('panchang');
  const { place, dateKey } = ctl;
  const { entry, path, isIndex } = usePanchangEntry('panchang', ctl);

  // Static (undated) title — the Worker swaps in the dated one each day.
  const meta = isIndex ? indexMeta('panchang') : pageMeta('panchang', place.name);
  const canonical = ctl.cityParam && place.slug ? `/panchang/${place.slug}` : '/panchang';
  const nearby = useMemo(() => nearestCities(place, 4), [place]);

  return (
    <ToolLayout
      theme="vedic"
      testId="panchang-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={canonical} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Panchang', to: '/panchang' }], current: place.name }}
      footer={{ tagline: 'Daily Panchang computed from real sunrise and sunset.', nav: [{ label: 'Rahu Kaal', to: '/rahu-kaal' }, { label: 'Choghadiya', to: '/choghadiya' }, { label: 'Muhurat', to: '/muhurat' }, { label: 'Rashifal', to: '/rashifal' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Panchang"
      h1={<DailyH1 entry={entry} fallback={meta.h1} />}
      lead={<span data-testid="panchang-date">{isIndex ? `${place.name} · ` : ''}<DailyDate entry={entry} fallback={dateWithWeekday(dateKey)} /></span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <PanchangControls ctl={ctl} />

          <DailyBody entry={entry} testId="panchang-daily" />
          <DailyJsonLd entry={entry} path={path} />

          {place.slug && HINDI_PANCHANG_SLUGS.has(place.slug) && !ctl.isCustom ? (
            <p className="text-sm mb-6"><Link to={`/hi/panchang/${place.slug}`} className="text-primary hover:underline">{place.name} का पंचांग हिन्दी में देखें →</Link></p>
          ) : (
            <p className="text-sm mb-6"><Link to="/hi/panchang" className="text-primary hover:underline">हिन्दी में देखें →</Link></p>
          )}

          <TermChips labels={TERMS} />

          <div className="rounded-xl border border-border p-4 mb-6 text-sm text-muted-foreground space-y-2" data-testid="panchang-how">
            <h2 className="font-semibold text-foreground">How this Panchang is worked out</h2>
            <p>The five limbs are read at local sunrise, the classical convention: the Tithi from the Moon–Sun distance, the Nakshatra from the Moon, the Yoga from Sun + Moon, all sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>). The Tithi and Nakshatra change at the same instant everywhere, but which one is “at sunrise” — and every window on this page — depends on the place.</p>
            <p>Sunrise and sunset come from the real position of the Sun for the place’s latitude and longitude. Rahu Kaal, Gulika and Yamaganda are fixed eighths of daylight; Abhijit, Dur Muhurtam and Brahma Muhurta are fifteenths of the day or night; Amrit Kalam and Varjyam are fixed slices of the day’s Nakshatra. Times are local clock times rounded to the nearest minute; checked against Drik Panchang they agree to within a minute.</p>
            <p>Use the date box or the previous / next buttons to see any date, or search any town in the world. <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link></p>
          </div>

          <CityLinks kind="panchang" city={ctl.isCustom ? undefined : place.city} nearby={nearby} all={PANCHANG_CITIES} linkTo={ctl.linkTo} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Choosing a date for something important? Find an auspicious muhurat.</p>
            <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Muhurat finder →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
