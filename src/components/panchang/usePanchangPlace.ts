/**
 * Shared place + date state for the Panchang, Rahu Kaal and Choghadiya pages (batch 7, W7).
 *
 *  • Place: one of the 50 built-in cities from the route (/panchang/:city), or any place
 *    picked in the city search, carried in the URL as ?place=…&lat=…&lon=… so a link
 *    can be shared. The UTC offset is worked out for the chosen DATE from the place's
 *    IANA time zone (DST-aware for places outside India).
 *  • Date: ?date=YYYY-MM-DD (any date 1900–2100); default = today at that place.
 *    Dated views are reachable only through this selector — they are not separate
 *    sitemap URLs, and the canonical stays the city page.
 */
import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { resolveForPlace } from '@/lib/timezone/clientBirth';
import { timezoneForCoordinates } from '@/lib/timezone/birthTimezone';
import { PANCHANG_CITIES, panchangCityBySlug, isValidDateKey, localDateKey, type PanchangCity } from '@/lib/vedic/panchangDay';
import type { PanchangPageKind } from '@/lib/vedic/panchangText';

export interface PanchangPlace {
  /** Built-in city slug, or undefined for a searched place. */
  slug?: string;
  /** Short display name, e.g. "Kanpur" or "Pontiac, Michigan, USA". */
  name: string;
  state?: string;
  lat: number;
  lon: number;
  /** IANA zone. */
  timezone: string;
  city?: PanchangCity;
}

const DEFAULT_SLUG = 'delhi';

function offsetFor(place: PanchangPlace, dateKey: string): number {
  if (place.city) return place.city.tz;
  try { return resolveForPlace(dateKey, '12:00', { lat: place.lat, lon: place.lon }).utcOffsetHours; }
  catch { return 0; }
}

export interface PanchangPlaceOptions {
  /** URL base for this page (default `/${kind}`); the Hindi page uses '/hi/panchang'. */
  base?: string;
  /** Built-in cities this page has its own URLs for (default: all 50). */
  cities?: PanchangCity[];
}

export function usePanchangPlace(kind: PanchangPageKind, opts: PanchangPlaceOptions = {}) {
  const cities = opts.cities ?? PANCHANG_CITIES;
  const bySlug = (s?: string) => (s ? cities.find(c => c.slug === s) : undefined);
  const { city: cityParam } = useParams<{ city?: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const qLat = Number(sp.get('lat'));
  const qLon = Number(sp.get('lon'));
  const qName = (sp.get('place') || '').slice(0, 80);
  const hasCustom = !cityParam && sp.has('lat') && sp.has('lon') && Number.isFinite(qLat) && Number.isFinite(qLon)
    && Math.abs(qLat) <= 90 && Math.abs(qLon) <= 180;

  const place: PanchangPlace = useMemo(() => {
    if (hasCustom) {
      let timezone = 'UTC';
      try { timezone = timezoneForCoordinates(qLat, qLon); } catch { /* keep UTC */ }
      return { name: qName || `${qLat.toFixed(2)}°, ${qLon.toFixed(2)}°`, lat: qLat, lon: qLon, timezone };
    }
    const c = bySlug(cityParam) || bySlug(DEFAULT_SLUG) || panchangCityBySlug(DEFAULT_SLUG)!;
    return { slug: c.slug, name: c.name, state: c.state, lat: c.lat, lon: c.lon, timezone: 'Asia/Kolkata', city: c };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `cities` is a fixed list per page
  }, [hasCustom, qLat, qLon, qName, cityParam]);

  // Today at the place (offset for today), then the requested date if valid.
  const todayOffset = offsetFor(place, new Date().toISOString().slice(0, 10));
  const todayKey = localDateKey(todayOffset);
  const dParam = sp.get('date');
  const dateKey = isValidDateKey(dParam) ? dParam : todayKey;
  const tz = offsetFor(place, dateKey);

  const base = opts.base ?? `/${kind}`;
  const query = (o: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(o)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `?${s}` : '';
  };
  const customQ = hasCustom ? { place: qName || undefined, lat: String(qLat), lon: String(qLon) } : {};

  const setDate = (key: string | null) => {
    const d = key && key !== todayKey ? key : undefined;
    navigate(`${place.slug && !hasCustom ? `${base}/${place.slug}` : base}${query({ ...customQ, date: d })}`, { replace: true });
  };
  const setCity = (slug: string) => {
    navigate(`${base}/${slug}${query({ date: dateKey !== todayKey ? dateKey : undefined })}`);
  };
  const setCustomPlace = (p: { name: string; lat: number; lon: number }) => {
    navigate(`${base}${query({ place: p.name, lat: p.lat.toFixed(4), lon: p.lon.toFixed(4), date: dateKey !== todayKey ? dateKey : undefined })}`);
  };
  /** Link to the same place + date on another page kind. */
  const linkTo = (k: PanchangPageKind) =>
    `${place.slug && !hasCustom ? `/${k}/${place.slug}` : `/${k}`}${query({ ...customQ, date: dateKey !== todayKey ? dateKey : undefined })}`;

  return {
    place, dateKey, todayKey, tz, isToday: dateKey === todayKey, isCustom: hasCustom,
    cityParam, validCity: !cityParam || !!bySlug(cityParam),
    setDate, setCity, setCustomPlace, linkTo, cities,
  };
}
