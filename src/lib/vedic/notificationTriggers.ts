/**
 * Chart-event notification TRIGGER DETECTION (Part P, Part 2).
 *
 * Pure, deterministic detection of genuinely meaningful upcoming events from data
 * the project ALREADY computes — no new astronomy:
 *   • a Dasha sub-period (Antardasha) or main period (Mahadasha) changing soon,
 *   • Sade Sati being active (with its cycle end if known),
 *   • an upcoming favourable timing window (D-Fix3 activation) starting soon.
 *
 * Delivery is intentionally NOT here (see part-p-flags.md: Cloudflare cron triggers
 * are broken in this environment). This module is delivery-agnostic — the same
 * events feed the in-app opportunistic notice today and email later.
 *
 * Frequency/retention bound: each event carries a STABLE `key` tied to the specific
 * transition (e.g. the exact Antardasha + its end date), so it can fire at most once
 * per real transition; `filterDueEvents` additionally enforces a cooldown so the same
 * key never re-notifies within `cooldownDays` (default 30) — no spam-like flood.
 */

export type ChartEventType = 'dasha-antar' | 'dasha-maha' | 'sade-sati' | 'favorable-window';

export interface ChartEvent {
  type: ChartEventType;
  key: string;      // stable dedupe key for this specific transition
  title: string;
  body: string;
  whenISO: string;  // the date the event is anchored to
}

export interface ChartEventInput {
  now: Date;
  currentDasha?: { mahadasha: string; mahadasha_end?: string | null; antardasha: string; antardasha_end?: string | null } | null;
  sadeSati?: { active: boolean; phase: string | null } | null;
  sadeSatiCycleEnd?: string | null;
  upcomingWindows?: Array<{ label: string; planet: string; start: string; end: string }>;
  /** Look-ahead horizon in days (default 45). */
  horizonDays?: number;
}

const DAY = 86400000;
const daysUntil = (iso: string | null | undefined, now: Date): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.round((t - now.getTime()) / DAY);
};
const fmt = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

/** Detect all meaningful upcoming events within the horizon (deterministic). */
export function detectChartEvents(input: ChartEventInput): ChartEvent[] {
  const { now, currentDasha, sadeSati, sadeSatiCycleEnd, upcomingWindows = [] } = input;
  const horizon = input.horizonDays ?? 45;
  const out: ChartEvent[] = [];

  // 1) Mahadasha change soon (the bigger life chapter) — takes precedence in wording.
  const mahaDays = daysUntil(currentDasha?.mahadasha_end, now);
  if (currentDasha && mahaDays !== null && mahaDays >= 0 && mahaDays <= horizon) {
    out.push({
      type: 'dasha-maha',
      key: `dasha-maha:${currentDasha.mahadasha}:${currentDasha.mahadasha_end}`,
      title: `Your ${currentDasha.mahadasha} main period is ending soon`,
      body: `Around ${fmt(currentDasha.mahadasha_end!)} your ${currentDasha.mahadasha} Mahadasha — the broad chapter shaping this era of your life — gives way to the next. Major Dasha changes are worth reflecting on; open your chart to see what's ahead.`,
      whenISO: currentDasha.mahadasha_end!,
    });
  }

  // 2) Antardasha (sub-period) change soon — only if not already the same date as the maha.
  const antarDays = daysUntil(currentDasha?.antardasha_end, now);
  if (currentDasha && antarDays !== null && antarDays >= 0 && antarDays <= horizon &&
      currentDasha.antardasha_end !== currentDasha.mahadasha_end) {
    out.push({
      type: 'dasha-antar',
      key: `dasha-antar:${currentDasha.antardasha}:${currentDasha.antardasha_end}`,
      title: `Your ${currentDasha.antardasha} sub-period is changing soon`,
      body: `Around ${fmt(currentDasha.antardasha_end!)} your current ${currentDasha.antardasha} Antardasha moves on, shifting the near-term tone within your ${currentDasha.mahadasha} main period.`,
      whenISO: currentDasha.antardasha_end!,
    });
  }

  // 3) Sade Sati active — awareness (calm, non-fear). Anchored to cycle end if known,
  // else to "now" (still deduped by phase so it won't repeat within the cooldown).
  if (sadeSati?.active) {
    const anchor = sadeSatiCycleEnd || now.toISOString();
    out.push({
      type: 'sade-sati',
      key: `sade-sati:${sadeSati.phase ?? 'active'}`,
      title: 'Your Sade Sati is currently active',
      body: `Saturn is in its ${sadeSati.phase ?? 'Sade Sati'} phase relative to your Moon${sadeSatiCycleEnd ? `, with this cycle running to around ${fmt(sadeSatiCycleEnd)}` : ''}. Traditionally a period of consolidation and patience — an area to move through consciously, not a verdict.`,
      whenISO: anchor,
    });
  }

  // 4) Upcoming favourable windows starting soon.
  for (const w of upcomingWindows) {
    const d = daysUntil(w.start, now);
    if (d !== null && d >= 0 && d <= horizon) {
      out.push({
        type: 'favorable-window',
        key: `favorable-window:${w.label}:${w.planet}:${w.start}`,
        title: `A favourable ${w.label} window opens soon`,
        body: `Around ${fmt(w.start)} your ${w.planet} period begins a classically supportive window for ${w.label.toLowerCase()} — one of your stronger upcoming times for it.`,
        whenISO: w.start,
      });
    }
  }

  return out;
}

/**
 * Apply the frequency/retention bound: drop any event whose key was last shown within
 * `cooldownDays` (default 30). `lastShown` maps event key → ISO timestamp last shown.
 * Because keys are transition-specific, a new transition produces a new key and IS
 * allowed through; the cooldown only suppresses re-showing the SAME transition.
 */
export function filterDueEvents(
  events: ChartEvent[],
  lastShown: Record<string, string>,
  now: Date,
  cooldownDays = 30,
): ChartEvent[] {
  return events.filter(e => {
    const prev = lastShown[e.key];
    if (!prev) return true;
    const days = (now.getTime() - new Date(prev).getTime()) / DAY;
    return days >= cooldownDays;
  });
}
