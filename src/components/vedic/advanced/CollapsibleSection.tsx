/**
 * Batch 10 — a native <details> section: open by default on wider screens, collapsed on
 * phones (< 768px) so the long Kundali page stays scannable. The summary line carries the
 * one-sentence answer, so a collapsed section still tells the reader what it found.
 */
import { useState, type ReactNode } from 'react';

const isWide = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(min-width: 768px)').matches
  : true;

export function CollapsibleSection({ testid, eyebrow, title, answer, children }: {
  testid: string; eyebrow: string; title: ReactNode; answer: ReactNode; children: ReactNode;
}) {
  const [open, setOpen] = useState(isWide);
  return (
    <details data-testid={testid} open={open} onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      style={{ marginTop: 24, borderTop: '1px solid var(--line,#e4dcc8)', paddingTop: 12 }}>
      {/* The site's summary style is a flex row with a +/− marker (part-aj.css); one wrapper
          keeps eyebrow, heading and answer stacked on the left of that marker. */}
      <summary>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="eyebrow" style={{ display: 'block' }}>{eyebrow}</span>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span className="text-sm" style={{ display: 'block', margin: '6px 0 0', fontWeight: 400 }} data-testid={`${testid}-answer`}>{answer}</span>
        </div>
      </summary>
      <div style={{ marginTop: 12 }}>{children}</div>
    </details>
  );
}

/** Visible-on-phones hint above a table that scrolls inside its own box. */
export function ScrollHint() {
  return <p className="text-xs text-muted-foreground sm:hidden" style={{ margin: '4px 0' }} aria-hidden="true">Scroll sideways inside the table to see every column →</p>;
}
