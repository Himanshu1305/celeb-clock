/**
 * City + date selector shared by the Panchang, Rahu Kaal and Choghadiya pages (batch 7, W7).
 * Pick one of the 50 built-in cities, search any place in the world, and move through
 * dates (previous / next day, a date box, back to today).
 */
import { useState } from 'react';
import { CityPicker } from '@/components/CityPicker';
import type { SavedCity } from '@/services/savedProfile';
import { addDaysKey } from '@/lib/vedic/panchangDay';
import { dateWithWeekday } from '@/lib/vedic/panchangText';
import type { usePanchangPlace } from './usePanchangPlace';

type Ctl = ReturnType<typeof usePanchangPlace>;

function offsetLabel(h: number): string {
  const sign = h < 0 ? '−' : '+';
  const a = Math.abs(h);
  const hh = Math.floor(a);
  const mm = Math.round((a - hh) * 60);
  return `UTC${sign}${hh}${mm ? `:${String(mm).padStart(2, '0')}` : ''}`;
}

export function PanchangControls({ ctl }: { ctl: Ctl }) {
  const [picked, setPicked] = useState<SavedCity | null>(null);
  const sorted = [...ctl.cities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 mb-6 space-y-3" data-testid="panchang-controls">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted-foreground">City</span>
          <select
            data-testid="panchang-city-select"
            aria-label="Choose a city"
            value={ctl.isCustom ? '' : ctl.place.slug}
            onChange={e => { if (e.target.value) ctl.setCity(e.target.value); }}
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            {ctl.isCustom && <option value="">{ctl.place.name}</option>}
            {sorted.map(c => <option key={c.slug} value={c.slug}>{c.name}, {c.state}</option>)}
          </select>
        </label>
        <div className="block text-sm">
          <span className="text-muted-foreground">Or search any place</span>
          <div className="mt-1">
            <CityPicker
              testid="panchang-place-search"
              mode="place"
              value={picked}
              placeholder="Type a town or city (e.g. Sagar)"
              ariaLabel="Search any place"
              onPick={c => { setPicked(c); if (c) ctl.setCustomPlace({ name: c.name, lat: c.lat, lon: c.lon }); }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" data-testid="panchang-date-controls">
        <button type="button" data-testid="panchang-prev-day" onClick={() => ctl.setDate(addDaysKey(ctl.dateKey, -1))}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-primary/5" aria-label="Previous day">← Previous day</button>
        <input type="date" data-testid="panchang-date-input" aria-label="Choose a date" value={ctl.dateKey} min="1900-01-01" max="2100-12-31"
               onChange={e => { if (e.target.value) ctl.setDate(e.target.value); }}
               className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm" />
        <button type="button" data-testid="panchang-next-day" onClick={() => ctl.setDate(addDaysKey(ctl.dateKey, 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-primary/5" aria-label="Next day">Next day →</button>
        {!ctl.isToday && (
          <button type="button" data-testid="panchang-today" onClick={() => ctl.setDate(null)}
                  className="px-3 py-1.5 rounded-lg border border-primary text-primary text-sm hover:bg-primary/5">Back to today</button>
        )}
      </div>

      <p className="text-xs text-muted-foreground" data-testid="panchang-showing">
        Showing <strong className="text-foreground">{ctl.place.name}{ctl.place.state && ctl.place.state !== ctl.place.name ? `, ${ctl.place.state}` : ''}</strong>
        {' · '}<strong className="text-foreground">{dateWithWeekday(ctl.dateKey)}</strong>
        {' · '}local time {ctl.isCustom ? `${ctl.place.timezone} (${offsetLabel(ctl.tz)})` : `IST (${offsetLabel(ctl.tz)})`}
        {ctl.isCustom && <> · {ctl.place.lat.toFixed(2)}°, {ctl.place.lon.toFixed(2)}°</>}
      </p>
    </div>
  );
}
