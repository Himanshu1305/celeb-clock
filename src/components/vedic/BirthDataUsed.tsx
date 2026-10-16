/**
 * "Birth data used" panel (fix-timezone-accuracy) — shown on Kundali and the reports so
 * the user can verify the inputs: place, time zone + UTC offset applied, Moon
 * rashi/nakshatra/pada/degree, Lagna, the boundary warnings and the method line.
 * Existing design tokens only.
 */
import type { ChartBasis } from '@/lib/vedic/chartBasis';

export function BirthDataUsed({ place, basis, testid = 'birth-data-used', showLagna = true }: {
  place: string;
  basis: ChartBasis | null | undefined;
  testid?: string;
  /** False for date-only charts (no birth time → no Lagna). */
  showLagna?: boolean;
}) {
  if (!basis) return null;
  return (
    <div data-testid={testid} className="rounded-xl border border-border p-4 text-sm space-y-1">
      <div className="font-semibold text-foreground">Birth data used</div>
      <div><span className="text-muted-foreground">Place:</span> <span data-testid={`${testid}-place`}>{place || '—'}</span></div>
      <div>
        <span className="text-muted-foreground">Time zone:</span>{' '}
        <span data-testid={`${testid}-tz`}>{basis.timezone} · {basis.utcOffsetLabel}</span>
        {basis.timezoneSource === 'manual' ? ' (set manually)' : ''}
      </div>
      <div data-testid={`${testid}-moon`}>
        <span className="text-muted-foreground">Moon:</span> {basis.rashi}
        {basis.moonDegreeInSign != null ? ` ${basis.moonDegreeInSign.toFixed(2)}°` : ''} · {basis.nakshatra} pada {basis.pada}
      </div>
      {showLagna && (
        <div data-testid={`${testid}-lagna`}>
          <span className="text-muted-foreground">Lagna:</span> {basis.lagna}
          {basis.lagnaDegree != null ? ` ${basis.lagnaDegree.toFixed(2)}°` : ''}
        </div>
      )}
      {basis.notes.filter(n => showLagna || !n.startsWith('Lagna')).map((n, i) => (
        <p key={i} data-testid={`${testid}-note`} className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{n}</p>
      ))}
      <p data-testid={`${testid}-method`} className="text-xs text-muted-foreground">{basis.method}</p>
    </div>
  );
}

export default BirthDataUsed;
