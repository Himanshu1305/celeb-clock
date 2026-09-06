import { getEventsForDate } from '@/data/indianHistoricalEvents';

/** "On this day in Indian history" — shows historical events for a month/day. */
export function OnThisDay({ month, day }: { month: number; day: number }) {
  const events = getEventsForDate(month, day);
  if (events.length === 0) return null;
  return (
    <div data-testid="on-this-day" className="rounded-xl border border-border p-4 my-6">
      <h3 className="font-semibold text-foreground mb-2">📜 On this day in Indian history</h3>
      <ul className="space-y-2">
        {events.sort((a, b) => a.year - b.year).map((e, i) => (
          <li key={i} className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{e.year}</span> — {e.event}
          </li>
        ))}
      </ul>
    </div>
  );
}
