/**
 * Reading history UI (Part P, Part 3). Shows a user's previously generated readings
 * over time (device-local, capped) with a brief "what's changed since" note. Renders
 * a clear empty state rather than a broken feature when there is no history yet.
 * Only meaningful for a saved profile — the caller shows it in that context.
 */
import { useState } from 'react';
import { changeSince, clearReadingHistory, MAX_HISTORY } from '@/services/readingHistory';
import { useReadingHistorySync } from '@/hooks/useReadingHistorySync';

const fmt = (iso: string) => { try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso; } };

export function ReadingHistory({ dob, refreshKey }: { dob?: string; refreshKey?: unknown }) {
  const { entries: synced, deviceOnly, synced: isSynced, refresh } = useReadingHistorySync(dob, refreshKey);
  const [cleared, setCleared] = useState(false);
  const entries = cleared ? [] : synced;

  return (
    <div data-testid="reading-history" className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg font-semibold text-foreground">Your reading history</h3>
        {entries.length > 0 && (
          <button data-testid="reading-history-clear" type="button"
                  onClick={() => { clearReadingHistory(); setCleared(true); refresh(); }}
                  className="text-xs text-muted-foreground underline hover:text-foreground">Clear</button>
        )}
      </div>
      {isSynced && deviceOnly.length > 0 && (
        <p data-testid="reading-history-deviceonly" className="text-xs text-amber-700 mb-2">
          {deviceOnly.length} reading{deviceOnly.length > 1 ? 's' : ''} from this device {deviceOnly.length > 1 ? 'have' : 'has'} now been added to your account and will follow you to other devices.
        </p>
      )}
      {entries.length === 0 ? (
        <p data-testid="reading-history-empty" className="text-sm text-muted-foreground">
          No past readings yet — each time you generate your reading, a dated snapshot is
          saved here (on this device only) so you can see how your chart’s story evolves.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e, i) => {
            const delta = changeSince(entries, i);
            return (
              <li key={`${e.generatedAt}-${i}`} data-testid="reading-history-item" className="text-sm border-t border-border/60 pt-2 first:border-t-0 first:pt-0">
                <div className="text-foreground">
                  <span className="font-medium">{fmt(e.generatedAt)}</span>
                  <span className="text-muted-foreground"> — {e.rashi} Rashi · {e.nakshatra} · Dasha {e.dasha}</span>
                </div>
                {delta && <div data-testid="reading-history-delta" className="text-xs text-indigo-700 mt-0.5">↳ {delta}</div>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground/80">
        The most recent {MAX_HISTORY} readings. {isSynced
          ? 'Signed in — your history is synced to your account and follows you across devices.'
          : 'Kept on this device; sign in to sync it across your devices.'}
      </p>
    </div>
  );
}

export default ReadingHistory;
