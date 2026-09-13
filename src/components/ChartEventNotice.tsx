/**
 * In-app chart-event notice (Part P, Part 2). For a user who has explicitly opted in
 * (profile.notifyOptIn) with a full profile, this checks their upcoming chart events
 * opportunistically on visit and surfaces them calmly. Dismissing marks them shown
 * (starting the 30-day cooldown). Renders nothing when opted-out or nothing is due —
 * so a non-opted-in user never sees it. No cron, no email — see docs/part-p-flags.md.
 */
import { useEffect, useState } from 'react';
import type { SavedBirthProfile } from '@/services/savedProfile';
import { getDueChartEvents, markNotificationsShown } from '@/services/chartNotifications';
import type { ChartEvent } from '@/lib/vedic/notificationTriggers';

export function ChartEventNotice({ profile }: { profile: SavedBirthProfile | null }) {
  const [events, setEvents] = useState<ChartEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    getDueChartEvents(profile).then(evs => { if (!cancelled) setEvents(evs); });
    return () => { cancelled = true; };
  }, [profile?.dob, profile?.time, profile?.city?.name, profile?.notifyOptIn]);

  if (!events.length) return null;

  const dismiss = () => { markNotificationsShown(events.map(e => e.key)); setEvents([]); };

  return (
    <div data-testid="chart-event-notice" className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-indigo-900">🔔 Coming up in your chart</div>
        <button data-testid="chart-event-dismiss" type="button" onClick={dismiss}
                className="text-xs text-indigo-700 underline hover:text-indigo-900">Got it, dismiss</button>
      </div>
      <ul className="space-y-2">
        {events.map(e => (
          <li key={e.key} data-testid="chart-event-item" className="text-sm">
            <div className="font-medium text-indigo-900">{e.title}</div>
            <div className="text-indigo-900/80">{e.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChartEventNotice;
