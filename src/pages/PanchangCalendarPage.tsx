/**
 * Batch 10 — monthly Panchang calendar (/panchang-calendar).
 *
 * A month grid: the Tithi and Nakshatra at local sunrise for every day, sunrise and sunset,
 * and the festivals / vrats of each day from BornClock's festival engine. Distinct search
 * intent from the daily /panchang/:city pages ("Hindu calendar / Panchang calendar <month>"),
 * so it is its own URL with its own title; other months and places are query views of it
 * (?month=YYYY-MM, ?city=<one of the 50 cities>, or ?place&lat&lon for any place) and keep
 * the canonical /panchang-calendar.
 *
 * The current month for New Delhi comes from the shared daily mechanism (src/lib/daily —
 * one small month file, injected by the Worker), so the page never goes stale between
 * deploys; anything else is computed in the browser with the same engine and template.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { CityPicker } from '@/components/CityPicker';
import type { SavedCity } from '@/services/savedProfile';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { istDateISO } from '@/lib/daily/dates';
import type { DailyEntry } from '@/lib/daily/types';
import { PANCHANG_CALENDAR_STATIC, monthLabel } from '@/lib/daily/kinds/panchangMonthTemplate';
import { PANCHANG_CITIES, panchangCityBySlug } from '@/lib/vedic/panchangDay';
import { resolveForPlace } from '@/lib/timezone/clientBirth';
import { TermChips } from '@/components/panchang/PanchangSections';
import { isPrerender } from '@/components/panchang/PanchangControls';

const TERMS = ['Panchang', 'Tithi', 'Paksha', 'Nakshatra', 'Purnima', 'Amavasya', 'Ekadashi', 'Sankranti'];
const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;
const shiftMonth = (m: string, n: number) => {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};


export default function PanchangCalendarPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const today = istDateISO(new Date());
  const thisMonth = today.slice(0, 7);
  const mParam = sp.get('month');
  const month = mParam && MONTH_RE.test(mParam) && Number(mParam.slice(0, 4)) >= 1900 && Number(mParam.slice(0, 4)) <= 2100 ? mParam : thisMonth;
  const city = panchangCityBySlug(sp.get('city') || undefined);
  const qLat = Number(sp.get('lat')), qLon = Number(sp.get('lon'));
  const custom = !city && sp.has('lat') && sp.has('lon') && Number.isFinite(qLat) && Number.isFinite(qLon) && Math.abs(qLat) <= 90 && Math.abs(qLon) <= 180;
  const place = custom
    ? { name: (sp.get('place') || `${qLat.toFixed(2)}°, ${qLon.toFixed(2)}°`).slice(0, 80), lat: qLat, lon: qLon, tz: 5.5, slug: undefined as string | undefined }
    : { ...(city ?? panchangCityBySlug('delhi')!), slug: (city ?? panchangCityBySlug('delhi')!).slug };
  const shared = !custom && place.slug === 'delhi' && month === thisMonth;

  const daily = useDailyEntry('panchang-calendar', shared ? 'index' : null);
  const [local, setLocal] = useState<DailyEntry | null>(null);
  useEffect(() => {
    if (shared) return;
    let alive = true;
    setLocal(null);
    // Computed off the first paint (the festival year takes about a second).
    const t = setTimeout(() => {
      import('@/lib/daily/kinds/panchangMonth').then(({ buildPanchangMonthEntry }) => {
        const tzFor = custom ? (d: string) => { try { return resolveForPlace(d, '12:00', { lat: qLat, lon: qLon }).utcOffsetHours; } catch { return 0; } } : undefined;
        const e = buildPanchangMonthEntry({ name: place.name, lat: place.lat, lon: place.lon, tz: place.tz }, month, today, { india: !custom, tzFor });
        if (alive) setLocal(e);
      });
    }, 0);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shared, month, place.name, place.lat, place.lon, custom]);
  const entry = shared ? daily.entry : local;

  const go = (o: { month?: string; city?: string; place?: { name: string; lat: number; lon: number } }) => {
    const q = new URLSearchParams();
    const m = o.month ?? month;
    if (m !== thisMonth) q.set('month', m);
    if (o.place) { q.set('place', o.place.name); q.set('lat', o.place.lat.toFixed(4)); q.set('lon', o.place.lon.toFixed(4)); }
    else {
      const c = o.city ?? (custom ? undefined : place.slug);
      if (c && c !== 'delhi') q.set('city', c);
      if (!o.city && custom) { q.set('place', place.name); q.set('lat', String(qLat)); q.set('lon', String(qLon)); }
    }
    const s = q.toString();
    navigate(`/panchang-calendar${s ? `?${s}` : ''}`, { replace: !!o.month });
  };
  const [picked, setPicked] = useState<SavedCity | null>(null);
  const sorted = useMemo(() => [...PANCHANG_CITIES].sort((a, b) => a.name.localeCompare(b.name)), []);
  const pre = shared && isPrerender();
  const year = Number(month.slice(0, 4));

  return (
    <ToolLayout
      theme="vedic"
      testId="panchang-calendar-page"
      seo={<SEO title={PANCHANG_CALENDAR_STATIC.title} description={PANCHANG_CALENDAR_STATIC.description} canonicalUrl="/panchang-calendar" ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Panchang', to: '/panchang' }], current: 'Calendar' }}
      footer={{ tagline: 'Monthly Panchang computed from real sunrise and the real Moon.', nav: [{ label: 'Today’s Panchang', to: '/panchang' }, { label: 'Festivals', to: '/festivals' }, { label: 'Moon phase', to: '/moon-phase' }, { label: 'Planets today', to: '/planets-today' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Panchang calendar"
      h1={<DailyH1 entry={entry} fallback={PANCHANG_CALENDAR_STATIC.h1} />}
      lead={<span data-testid="panchang-calendar-label">{shared ? <DailyDate entry={entry} fallback={`${monthLabel(month)} · ${place.name}`} /> : `${monthLabel(month)} · ${place.name}`}</span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="rounded-xl border border-border bg-background/60 p-4 mb-6 space-y-3" data-testid="panchang-calendar-controls">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-muted-foreground">City</span>
                <select aria-label="Choose a city" data-testid="calendar-city-select" value={custom ? '' : place.slug}
                        onChange={e => { if (e.target.value) go({ city: e.target.value }); }}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  {custom && <option value="">{place.name}</option>}
                  {sorted.map(c => <option key={c.slug} value={c.slug}>{c.name}, {c.state}</option>)}
                </select>
              </label>
              <div className="block text-sm">
                <span className="text-muted-foreground">Or search any place</span>
                <div className="mt-1">
                  <CityPicker testid="calendar-place-search" mode="place" value={picked} placeholder="Type a town or city (e.g. Sagar)" ariaLabel="Search any place"
                              onPick={c => { setPicked(c); if (c) go({ place: { name: c.name, lat: c.lat, lon: c.lon } }); }} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2" data-testid="calendar-month-controls">
              <button type="button" onClick={() => go({ month: shiftMonth(month, -1) })} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-primary/5" aria-label="Previous month">← Previous month</button>
              <input type="month" aria-label="Choose a month" data-testid="calendar-month-input" value={pre ? '' : month} min="1900-01" max="2100-12"
                     onChange={e => { if (MONTH_RE.test(e.target.value)) go({ month: e.target.value }); }}
                     className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm" />
              <button type="button" onClick={() => go({ month: shiftMonth(month, 1) })} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-primary/5" aria-label="Next month">Next month →</button>
              {month !== thisMonth && <button type="button" onClick={() => go({ month: thisMonth })} className="px-3 py-1.5 rounded-lg border border-primary text-primary text-sm hover:bg-primary/5">This month</button>}
            </div>
          </div>

          {!entry && !shared && <p className="text-muted-foreground py-6" data-testid="calendar-working">Working out {monthLabel(month)} for {place.name}…</p>}
          <DailyBody entry={entry} testId="panchang-calendar-body" />
          <DailyJsonLd entry={entry} path="/panchang-calendar" />

          <TermChips labels={TERMS} />

          <div className="rounded-xl border border-border p-4 mb-6 text-sm text-muted-foreground space-y-2" data-testid="calendar-how">
            <h2 className="font-semibold text-foreground">How to read a day</h2>
            <p>The first line of each day is its Tithi (lunar day) and Nakshatra (the Moon’s star) at local sunrise — the classical way a Hindu calendar names the day. Below are sunrise, sunset and any festival or vrat. Tap a city or search any town to see its own sunrise times; open <Link to={place.slug && !custom ? `/panchang/${place.slug}` : '/panchang'} className="underline">today’s full Panchang</Link> for Rahu Kaal, Choghadiya, Gowri Nalla Neram and more.</p>
            <p>Festival dates use the same rules as our <Link to={year >= 2025 && year <= 2027 ? `/festivals/${year}` : '/festivals'} className="underline">festival calendar</Link>; in our tests the Tithi and Nakshatra end times agree with Drik Panchang to within 2 minutes. <Link to="/accuracy" className="underline">How we check accuracy →</Link></p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Need a good date for something important? Find an auspicious muhurat.</p>
            <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Muhurat finder →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
