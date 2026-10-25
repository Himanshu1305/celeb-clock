/**
 * The day's content for a Panchang / Rahu Kaal / Choghadiya page (batch 7, W7).
 *
 * Built-in city (or index page) viewed for TODAY → the shared daily mechanism
 * (useDailyEntry: the entry the Worker injected / precomputed JSON), so the prerendered
 * shell, the Worker HTML and the browser all show the same, current text.
 * Any other date or a searched place → the same builder, run in the browser.
 */
import { useMemo } from 'react';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { buildPanchangEntry, PANCHANG_INDEX_SLUG } from '@/lib/daily/kinds/panchangDaily';
import type { PanchangPageKind } from '@/lib/vedic/panchangText';
import type { usePanchangPlace } from './usePanchangPlace';

export function usePanchangEntry(kind: PanchangPageKind, ctl: ReturnType<typeof usePanchangPlace>) {
  const { place, dateKey, tz, isCustom, isToday, cityParam } = ctl;
  const isIndex = !cityParam && !isCustom;
  const shared = !isCustom && isToday;
  const slug = isIndex ? PANCHANG_INDEX_SLUG : place.slug;
  const daily = useDailyEntry(kind, shared ? slug : null);
  const local = useMemo(
    () => (shared ? null : buildPanchangEntry(kind, { name: place.name, lat: place.lat, lon: place.lon, tz, slug: place.slug }, dateKey, isIndex)),
    [shared, kind, place.name, place.lat, place.lon, place.slug, tz, dateKey, isIndex],
  );
  const path = isIndex ? `/${kind}` : place.slug && !isCustom ? `/${kind}/${place.slug}` : `/${kind}`;
  return { entry: shared ? daily.entry : local, path, isIndex, shared };
}
