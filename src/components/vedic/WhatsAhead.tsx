/**
 * WhatsAhead (Backlog-1 Item G) — the chart's REAL Dasha data re-presented two ways:
 *   • By LIFE AREA (career, relationships, home & property, health & energy, travel)
 *   • By TIME HORIZON (now, +1 month, +6 months, +1 year, and a lifetime overview)
 *
 * It computes nothing astronomical — it reuses the already-computed Vimshottari
 * timeline (dashaTimeline) and the engine's house-lord mapping via src/lib/vedic/
 * whatsAhead.ts (unit-tested for parity with the engine). All windows/horizons are
 * computed in the browser against the current time (Rule 13), so every window shown
 * matches the same Dasha data displayed elsewhere on the chart.
 *
 * MARRIAGE-TIMING GUARDRAIL (non-negotiable): the Relationships area shows only
 * "traditionally favourable WINDOWS" as month-year RANGES — never a single date,
 * never a certainty, never a claim that marriage will/won't happen, and it never
 * volunteers anything about a second marriage or assumes the reader's marital status.
 * This matches the AI-astrologer / report guardrails (chatGuardrails.ts), which treat
 * such windows as "a period of heightened possibility, not a fixed certainty".
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  windowsFor, lifeAreas, timeHorizons, type AheadWindow, type MahaPeriod, type LifeArea,
} from '@/lib/vedic/whatsAhead';
import { WHATS_AHEAD_IS_FREE } from '@/config/whatsAheadAccess';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monYear = (iso: string) => { const d = new Date(iso); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
/** Windows are always shown as RANGES (month-year → month-year), never a single day. */
const rangeOf = (w: { start: string; end: string }) => `${monYear(w.start)} – ${monYear(w.end)}`;

function pickWindows(all: AheadWindow[]): { current: AheadWindow | null; upcoming: AheadWindow | null } {
  return {
    current: all.find(w => w.status === 'current') ?? null,
    upcoming: all.find(w => w.status === 'upcoming') ?? null,
  };
}

function AreaCard({ area, timeline, nowMs }: { area: LifeArea; timeline: MahaPeriod[]; nowMs: number }) {
  const wins = windowsFor(timeline, area.significators, nowMs);
  const { current, upcoming } = pickWindows(wins);
  const isRel = area.key === 'relationships';
  return (
    <div data-testid={`whatsahead-area-${area.key}`} style={{ border: '1px solid var(--line, #e4dcc8)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{area.label}</div>
      <p style={{ fontSize: 12, color: 'var(--muted,#667)', margin: '4px 0 8px' }}>{area.note}</p>
      {current && (
        <div style={{ fontSize: 13, color: 'var(--ink)' }}>
          <strong style={{ color: 'var(--accent-text)' }}>Active now:</strong> a {current.planet} period, {rangeOf(current)}
        </div>
      )}
      {upcoming && (
        <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>
          <strong>Next favourable window:</strong> a {upcoming.planet} period, {rangeOf(upcoming)}
        </div>
      )}
      {!current && !upcoming && (
        <div style={{ fontSize: 13, color: 'var(--muted,#667)' }}>No strongly-significant upcoming window on the books — the quieter stretches matter too.</div>
      )}
      {isRel && (
        <p style={{ fontSize: 11.5, color: 'var(--muted,#667)', marginTop: 8, fontStyle: 'italic' }}>
          These are <strong>traditionally favourable windows</strong> for relationship matters — periods of heightened possibility, not a fixed date and not a certainty. Astrology can’t promise whether or exactly when anything happens; treat them as "worth having plans ready", nothing more.
        </p>
      )}
    </div>
  );
}

export interface WhatsAheadProps {
  lagnaSignIndex: number;
  planets: Array<{ name: string; house: number }>;
  dashaTimeline: MahaPeriod[];
  /** Override the free/paid default (defaults to the WHATS_AHEAD_IS_FREE setting). */
  free?: boolean;
}

export function WhatsAhead({ lagnaSignIndex, planets, dashaTimeline, free }: WhatsAheadProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'area' | 'horizon'>('area');
  if (!dashaTimeline || dashaTimeline.length === 0) return null;

  const isFree = free ?? WHATS_AHEAD_IS_FREE;
  const nowMs = Date.now(); // Rule 13 — computed at view time, never baked in.
  const planetsInHouse = (h: number) => planets.filter(p => p.house === h).map(p => p.name);
  const areas = lifeAreas(lagnaSignIndex, planetsInHouse);
  const { horizons, lifetime } = timeHorizons(dashaTimeline, nowMs);

  return (
    <section data-testid="whats-ahead" style={{ marginTop: 16 }}>
      <button
        type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} data-testid="whats-ahead-toggle"
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line,#e4dcc8)', background: 'var(--paper)', cursor: 'pointer', fontWeight: 700, color: 'var(--ink)' }}
      >
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        <span>What’s ahead — your chart by life area &amp; time horizon</span>
      </button>

      {open && !isFree && (
        <div data-testid="whats-ahead-locked" style={{ marginTop: 10, border: '1px solid var(--line,#e4dcc8)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--ink)' }}>
          "What’s ahead" is part of the full report. It re-presents your real Dasha timeline by life area and time horizon.
          <div style={{ marginTop: 8 }}><Link className="btn" to="/birthday-report/gift">See the full report →</Link></div>
        </div>
      )}

      {open && isFree && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12.5, color: 'var(--muted,#667)', margin: '0 0 10px' }}>
            The same Vimshottari periods shown above, organised by what they touch and when. These are classical
            timing <em>windows</em> — forward-looking guidance, never guarantees.
          </p>
          <div role="tablist" aria-label="What's ahead views" style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button type="button" role="tab" aria-selected={tab === 'area'} data-testid="whatsahead-tab-area" onClick={() => setTab('area')}
              style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid var(--line,#e4dcc8)', background: tab === 'area' ? 'var(--accent)' : 'transparent', color: tab === 'area' ? '#fff' : 'var(--ink)', cursor: 'pointer', fontSize: 13 }}>By life area</button>
            <button type="button" role="tab" aria-selected={tab === 'horizon'} data-testid="whatsahead-tab-horizon" onClick={() => setTab('horizon')}
              style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid var(--line,#e4dcc8)', background: tab === 'horizon' ? 'var(--accent)' : 'transparent', color: tab === 'horizon' ? '#fff' : 'var(--ink)', cursor: 'pointer', fontSize: 13 }}>By time horizon</button>
          </div>

          {tab === 'area' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {areas.map(a => <AreaCard key={a.key} area={a} timeline={dashaTimeline} nowMs={nowMs} />)}
            </div>
          )}

          {tab === 'horizon' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {horizons.map(h => (
                <div key={h.label} data-testid={`whatsahead-horizon-${h.label.replace(/\s+/g, '-').toLowerCase()}`} style={{ border: '1px solid var(--line,#e4dcc8)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--ink)' }}>
                  <strong>{h.label}:</strong>{' '}
                  {h.maha
                    ? <>{h.maha} Mahadasha{h.antar ? ` · ${h.antar} Antardasha` : ''}{h.pratyantar ? ` · ${h.pratyantar} Pratyantar` : ''}{h.sookshma ? ` · ${h.sookshma} Sookshma` : ''}</>
                    : 'beyond the computed timeline'}
                </div>
              ))}
              <div style={{ border: '1px solid var(--line,#e4dcc8)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Lifetime overview — your Mahadasha sequence</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink)' }}>
                  {lifetime.map((m, i) => (
                    <li key={i}>{m.lord}: {monYear(m.start)} – {monYear(m.end)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: 'var(--muted,#667)', marginTop: 10 }}>
            Windows are the same computed Vimshottari periods used throughout your chart. Shown as month ranges, not exact days.
          </p>
        </div>
      )}
    </section>
  );
}

export default WhatsAhead;
