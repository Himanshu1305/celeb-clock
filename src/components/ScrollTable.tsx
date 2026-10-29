import { useEffect, useRef, useState, type ReactNode } from 'react';

const HINT = {
  en: 'Swipe sideways to see the whole table',
  hi: 'पूरी तालिका देखने के लिए बगल में स्वाइप करें',
} as const;

/**
 * Batch 10 — mobile-friendly wrapper for wide tables. The table scrolls inside its own box
 * (never the page), edge shadows show there is more to see, and when the table is actually
 * wider than its box (e.g. on a 375 px phone) a short "swipe sideways" hint appears above it.
 */
export function ScrollTable({ children, className = '', boxClassName = '', lang = 'en', label, testId = 'scroll-table' }: {
  children: ReactNode;
  className?: string;
  /** Extra classes for the scrolling box itself (e.g. a border around the table). */
  boxClassName?: string;
  lang?: 'en' | 'hi';
  /** Accessible name for the scroll region (keyboard users can focus and arrow-scroll it). */
  label?: string;
  /** data-testid of the scrolling box (kept when replacing an existing wrapper). */
  testId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    window.addEventListener('resize', check);
    return () => { ro?.disconnect(); window.removeEventListener('resize', check); };
  }, []);

  return (
    <div className={`max-w-full ${className}`}>
      {overflows && (
        <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground" data-testid="table-swipe-hint">
          <span aria-hidden="true">↔</span> {HINT[lang]}
        </p>
      )}
      <div
        ref={ref}
        className={`scroll-table overflow-x-auto overscroll-x-contain ${boxClassName}`}
        data-scroll-table=""
        data-testid={testId}
        {...(overflows ? { tabIndex: 0, role: 'region', 'aria-label': label ?? HINT[lang] } : {})}
      >
        {children}
      </div>
    </div>
  );
}
