/**
 * Client side of chart-event notifications (Part P, Part 2).
 *
 * DELIVERY MODEL (deliberate — see docs/part-p-flags.md): Cloudflare cron triggers are
 * broken in this environment (schedules deploy returns 400), so there is NO reliable
 * background daily job. Instead this checks OPPORTUNISTICALLY when an opted-in user
 * visits, via the deterministic `/api/chart-events` endpoint, and surfaces the result
 * in-app. Email delivery (reusing the existing send-email + unsubscribe infra) is the
 * documented next channel once scheduling is reliable — the detection is identical.
 *
 * OPT-IN: nothing is checked or shown unless the saved profile has `notifyOptIn === true`.
 * FREQUENCY BOUND: a per-device record of last-shown keys enforces a 30-day cooldown per
 * event (via filterDueEvents), so the same transition never re-notifies within a month.
 */
import type { SavedBirthProfile } from './savedProfile';
import { isFullVedicProfile } from './savedProfile';
import { filterDueEvents, type ChartEvent } from '@/lib/vedic/notificationTriggers';

const SHOWN_KEY = 'bornclock-chart-notif-shown';

function readShown(): Record<string, string> {
  try { const raw = localStorage.getItem(SHOWN_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
function writeShown(map: Record<string, string>): void {
  try { localStorage.setItem(SHOWN_KEY, JSON.stringify(map)); } catch { /* noop */ }
}

/** Mark events as shown now, so the 30-day cooldown starts. */
export function markNotificationsShown(keys: string[], now: Date = new Date()): void {
  const map = readShown();
  for (const k of keys) map[k] = now.toISOString();
  writeShown(map);
}

async function fetchEvents(profile: SavedBirthProfile): Promise<ChartEvent[]> {
  const [y, m, d] = profile.dob.split('-');
  const [h, min] = (profile.time || '12:00').split(':');
  const c = profile.city!;
  const params = new URLSearchParams({ y, m, d, h, min, lat: String(c.lat), lon: String(c.lon), tz: String(c.tz) });
  const res = await fetch(`/api/chart-events?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data?.events) ? data.events : [];
}

/**
 * The events to actually surface right now: [] unless the user has explicitly opted in
 * AND has a full profile; then the detected events minus any still within their cooldown.
 */
export async function getDueChartEvents(profile: SavedBirthProfile | null, now: Date = new Date()): Promise<ChartEvent[]> {
  if (!profile || profile.notifyOptIn !== true) return [];   // hard opt-in gate
  if (!isFullVedicProfile(profile)) return [];               // needs date+time+place
  try {
    const events = await fetchEvents(profile);
    return filterDueEvents(events, readShown(), now);
  } catch {
    return [];
  }
}
