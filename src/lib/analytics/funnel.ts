/**
 * Conversion funnel computation (P5-2 — conversion tracking).
 *
 * Turns the raw consent-gated `analytics_events` rows into the
 * visit → generate chart → checkout → purchase funnel. Pure and deterministic
 * so it is unit-tested without the database; the admin dashboard renders the
 * result. Each stage counts UNIQUE SESSIONS that reached it, so one visitor who
 * generates three charts is one "chart generated", not three.
 */

export interface AnalyticsEventRow {
  event_type: string;
  event_name: string;
  session_id?: string | null;
}

export interface FunnelStage {
  key: string;
  label: string;
  /** Unique sessions that reached this stage. */
  sessions: number;
  /** Conversion from the top of the funnel (visits), 0–100. */
  pctOfTop: number;
  /** Conversion from the immediately-previous stage, 0–100. */
  pctOfPrev: number;
}

interface StageDef {
  key: string;
  label: string;
  /** Returns true if this event marks the session as having reached the stage. */
  match: (e: AnalyticsEventRow) => boolean;
}

// Order matters: top of funnel first. A session is credited to a stage if it has
// ANY matching event. "Visits" = any tracked activity in the session.
export const FUNNEL_STAGES: StageDef[] = [
  { key: 'visit', label: 'Visited', match: () => true },
  { key: 'chart_generated', label: 'Generated a chart', match: e => e.event_type === 'funnel' && e.event_name === 'chart_generated' },
  { key: 'report_preview_viewed', label: 'Viewed a locked report', match: e => e.event_type === 'funnel' && e.event_name === 'report_preview_viewed' },
  { key: 'checkout_opened', label: 'Opened checkout', match: e => e.event_type === 'funnel' && e.event_name === 'checkout_opened' },
  { key: 'purchase_completed', label: 'Completed purchase', match: e => e.event_type === 'funnel' && e.event_name === 'purchase_completed' },
];

const pct = (num: number, den: number): number =>
  den <= 0 ? 0 : Math.round((num / den) * 1000) / 10;

export function computeFunnel(events: AnalyticsEventRow[]): FunnelStage[] {
  // Sessions that reached each stage.
  const stageSessions: Set<string>[] = FUNNEL_STAGES.map(() => new Set<string>());

  for (const e of events) {
    const sid = e.session_id || '';
    if (!sid) continue;
    FUNNEL_STAGES.forEach((stage, i) => {
      if (stage.match(e)) stageSessions[i].add(sid);
    });
  }

  const counts = stageSessions.map(s => s.size);
  const top = counts[0];

  return FUNNEL_STAGES.map((stage, i) => ({
    key: stage.key,
    label: stage.label,
    sessions: counts[i],
    pctOfTop: pct(counts[i], top),
    pctOfPrev: i === 0 ? 100 : pct(counts[i], counts[i - 1]),
  }));
}
