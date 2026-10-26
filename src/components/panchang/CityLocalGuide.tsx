/**
 * "<City> — local guide" (batch 8): a few notable Hindu temples in or near the city and
 * festivals especially associated with it, each with one plain line and its source.
 *
 * Data: src/data/panchangCityLocal.json — every line was taken from the page linked in its
 * `source` (Wikipedia, official temple / district / state-tourism sites, Incredible India),
 * opened with WebFetch on 26 Oct 2026. Cities with nothing sourced render nothing.
 * Static text (it does not change daily), so it sits outside the daily-injected markers
 * and is part of the prerendered HTML.
 */
import localData from '@/data/panchangCityLocal.json';

export interface LocalFact { name: string; line: string; source: string; nameHi?: string; lineHi?: string }
export interface CityLocal { temples?: LocalFact[]; festivals?: LocalFact[] }

const CITIES = (localData as { cities: Record<string, CityLocal> }).cities;

/** Local facts for a built-in city slug (undefined if none were sourced). */
export function cityLocal(slug: string | undefined): CityLocal | undefined {
  if (!slug) return undefined;
  const c = CITIES[slug];
  if (!c || (!c.temples?.length && !c.festivals?.length)) return undefined;
  return c;
}

/** Short readable label for a source link. */
export function sourceLabel(url: string): string {
  let host = '';
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { return 'Source'; }
  if (host.endsWith('wikipedia.org')) return 'Wikipedia';
  if (host.endsWith('incredibleindia.gov.in')) return 'Incredible India';
  if (host === 'mptourism.com') return 'MP Tourism';
  if (host === 'haryanatourism.gov.in') return 'Haryana Tourism';
  if (host === 'karnatakatourism.org') return 'Karnataka Tourism';
  if (host === 'mtdc.co') return 'MTDC';
  return host;
}

export function CityLocalGuide({ slug, cityName, lang = 'en' }: { slug?: string; cityName: string; lang?: 'en' | 'hi' }) {
  const c = cityLocal(slug);
  if (!c) return null;
  const hi = lang === 'hi';
  const t = hi
    ? { h: `${cityName} — स्थानीय मार्गदर्शिका`, temples: 'प्रमुख मंदिर', festivals: 'यहाँ के ख़ास त्योहार', src: 'स्रोत', note: 'हर पंक्ति साथ दिए स्रोत से ली गई है। दर्शन और उत्सव के समय के लिए मंदिर या स्थानीय सूचना देख लें।' }
    : { h: `${cityName} — local guide`, temples: 'Notable temples', festivals: 'Festivals especially linked to the city', src: 'Source', note: 'Each line comes from the linked source. For darshan and festival timings, check with the temple or local notices.' };
  const name = (f: LocalFact) => (hi && f.nameHi) || f.name;
  const line = (f: LocalFact) => (hi && f.lineHi) || f.line;
  const list = (items: LocalFact[], id: string) => (
    <ul className="space-y-2" data-testid={`city-local-${id}`}>
      {items.map(f => (
        <li key={f.name} className="text-sm">
          <span className="font-medium text-foreground">{name(f)}</span>
          <span className="text-muted-foreground"> — {line(f)} </span>
          <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline whitespace-nowrap">{t.src}: {sourceLabel(f.source)}</a>
        </li>
      ))}
    </ul>
  );
  return (
    <section className="rounded-xl border border-border p-4 mb-6 space-y-3" data-testid="city-local-guide" aria-label={t.h}>
      <h2 className="font-semibold text-foreground">{t.h}</h2>
      {c.temples?.length ? (<div><h3 className="text-sm font-semibold text-foreground mb-1">{t.temples}</h3>{list(c.temples, 'temples')}</div>) : null}
      {c.festivals?.length ? (<div><h3 className="text-sm font-semibold text-foreground mb-1">{t.festivals}</h3>{list(c.festivals, 'festivals')}</div>) : null}
      <p className="text-xs text-muted-foreground">{t.note}</p>
    </section>
  );
}
