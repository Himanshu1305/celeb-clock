/**
 * Batch 10 — a Kundali section that is open on wider screens and collapsed on phones
 * (≤ 640px), so the long results page stays scannable at 375px. Uses a native <details>
 * so it works without JS and keyboard/screen readers get a real disclosure widget.
 */
import { useState, type ReactNode } from 'react';
import { brandVar } from '../../theme/palette';

function isPhone(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 640px)').matches;
  } catch { return false; }
}

export function CollapsibleSection({ testid, title, summary, children }: {
  testid: string;
  title: ReactNode;
  /** One-line answer shown under the title even while collapsed. */
  summary?: ReactNode;
  children: ReactNode;
}) {
  // Decided once on mount (these sections only render client-side, after a chart is computed).
  const [open, setOpen] = useState(() => !isPhone());
  return (
    <details data-testid={testid} open={open} onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      style={{ marginTop: 20, border: `1px solid var(--line, ${brandVar.line})`, borderRadius: 12, padding: '10px 14px', background: 'var(--paper)' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'revert' }}>
        <div style={{ display: 'inline-block', verticalAlign: 'top', maxWidth: 'calc(100% - 28px)' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {summary && <div className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>{summary}</div>}
        </div>
      </summary>
      <div style={{ marginTop: 10 }}>{children}</div>
    </details>
  );
}
