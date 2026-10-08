/**
 * DashaDeepDive (Backlog-1 Item F) — an expandable Vimshottari Dasha tree that goes
 * five levels deep: Mahadasha → Antardasha → Pratyantardasha → Sookshma → Prana.
 *
 * Collapsed by default (the Kundli page must not become cluttered) and computed
 * ON DEMAND: a node's children are only calculated when the user expands it, using
 * the pure `subPeriods` helper (no API call, no ephemeris). The deepest levels last
 * days-to-hours, so a birth-time-sensitivity caveat is shown prominently.
 */
import { useState, useCallback } from 'react';
import { TermTip } from '@/components/vedic/TermTip';
import {
  subPeriods, describeDuration, DASHA_LEVEL_NAMES, type DashaSubPeriod, type DashaLevel,
} from '@/lib/vedic/dashaDeep';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmt(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
const now = () => Date.now();
function isCurrent(p: { start: string; end: string }): boolean {
  const t = now();
  return t >= Date.parse(p.start) && t < Date.parse(p.end);
}

function Node({ period, level, path }: { period: DashaSubPeriod; level: DashaLevel; path: string }) {
  const [open, setOpen] = useState(false);
  const canExpand = level < 4;
  const [children, setChildren] = useState<DashaSubPeriod[] | null>(null);

  const toggle = useCallback(() => {
    setOpen(o => {
      const next = !o;
      // Compute children lazily, exactly once, only when first expanded.
      if (next && children === null) setChildren(subPeriods(period.lord, period.start, period.end));
      return next;
    });
  }, [children, period.lord, period.start, period.end]);

  const current = isCurrent(period);
  const levelName = DASHA_LEVEL_NAMES[level];

  return (
    <li style={{ listStyle: 'none', marginLeft: level === 0 ? 0 : 14 }}>
      <div
        style={{
          display: 'flex', alignItems: 'baseline', gap: 8, padding: '6px 8px', borderRadius: 8,
          borderLeft: current ? '3px solid var(--accent)' : '3px solid transparent',
          background: current ? 'var(--paper)' : 'transparent',
        }}
      >
        {canExpand ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${period.lord} ${levelName}`}
            data-testid={`dasha-toggle-${path}`}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, width: 16, color: 'var(--accent-text)' }}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span style={{ width: 16, flex: 'none' }} aria-hidden="true" />
        )}
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{period.lord}</span>
        <span style={{ fontSize: 12, color: 'var(--muted, #667)' }}>
          {levelName} · {fmt(period.start)} – {fmt(period.end)} · {describeDuration(period.start, period.end)}
        </span>
        {current && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-text)' }}>• now</span>}
      </div>
      {open && children && children.length > 0 && (
        <ul style={{ margin: '2px 0 2px 0', padding: 0 }}>
          {children.map((c, i) => (
            <Node key={`${path}/${i}`} period={c} level={(level + 1) as DashaLevel} path={`${path}/${i}`} />
          ))}
        </ul>
      )}
    </li>
  );
}

export interface DashaDeepDiveProps {
  /** Maha-level Vimshottari timeline (lord + ISO start/end), from the chart engine. */
  mahadashas: Array<{ lord: string; start: string; end: string }>;
}

export function DashaDeepDive({ mahadashas }: DashaDeepDiveProps) {
  const [open, setOpen] = useState(false);
  if (!mahadashas || mahadashas.length === 0) return null;

  return (
    <section data-testid="dasha-deep-dive" style={{ marginTop: 16 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        data-testid="dasha-deep-toggle"
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
          padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line, #e4dcc8)',
          background: 'var(--paper)', cursor: 'pointer', fontWeight: 700, color: 'var(--ink)',
        }}
      >
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        <span>Dasha periods in depth — 5 levels (<TermTip id="mahadasha">Maha</TermTip> → <TermTip id="antardasha">Antar</TermTip> → <TermTip id="pratyantardasha">Pratyantar</TermTip> → <TermTip id="sookshma">Sookshma</TermTip> → <TermTip id="prana">Prana</TermTip>)</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted, #667)', margin: '0 0 10px' }}>
            Expand any period to see the level beneath it. The deeper levels
            (Pratyantardasha, Sookshma and Prana) last from a few <strong>days down to hours</strong>, so they are
            <strong> very sensitive to your exact birth time</strong> — a few minutes' error can shift them.
            Treat the deepest levels as indicative, not precise. Each level's sub-periods are the classical
            Vimshottari proportions and sum exactly to their parent.
          </p>
          <ul style={{ margin: 0, padding: 0 }}>
            {mahadashas.map((m, i) => (
              <Node key={i} period={{ lord: m.lord, start: m.start, end: m.end }} level={0} path={`${i}`} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default DashaDeepDive;
