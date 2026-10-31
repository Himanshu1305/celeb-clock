/**
 * TermTip — the ONE way to explain an astrology term inline on any page.
 * Reads from the single VEDIC_TERMS dictionary (termDefinitions.ts).
 *
 * Usage:  <TermTip id="lagna">Lagna</TermTip>            → dotted term + small (i)
 *         <TermTip id="koota" iconOnly />                 → just the (i) button
 *         <TermTip id="tithi" lang="hi">तिथि</TermTip>     → Hindi explanation
 *
 * Behaviour (Batch 5): a Radix Popover, so it works everywhere —
 *   - desktop: opens on hover (and stays open if clicked);
 *   - mobile: opens on tap, closes on tap outside;
 *   - keyboard: it is a real <button>; Enter/Space toggles, Escape closes, focus moves
 *     into the popover so the glossary link is reachable.
 * The visible text stays the button's accessible name (plus a screen-reader-only
 * "what does this mean?"), and the popover links to /glossary#<term>.
 * Unknown ids degrade to plain text (and are caught by the glossary-coverage test).
 */
import { useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { getTermDef, glossaryHref } from '@/lib/vedic/termDefinitions';

interface TermTipProps {
  id: string;
  children?: React.ReactNode;
  /** 'hi' shows the Hindi name and explanation (falls back to English if missing). */
  lang?: 'en' | 'hi';
  /** Render only the (i) button — for labels where the term is already plain text. */
  iconOnly?: boolean;
}

export function TermTip({ id, children, lang = 'en', iconOnly = false }: TermTipProps) {
  const def = getTermDef(id);
  const [open, setOpen] = useState(false);
  const hoverOpened = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!def) return <>{children}</>;

  const hi = lang === 'hi';
  const title = hi && def.hiTerm ? def.hiTerm : def.term;
  const body = hi && def.hi ? def.hi : def.impact;
  const srAsk = hi ? `${title} — इसका अर्थ क्या है?` : `What does ${def.term} mean?`;

  const schedule = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return; // touch/pen use tap
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (next) hoverOpened.current = true;
      setOpen(next);
    }, next ? 80 : 150);
  };

  return (
    <Popover open={open} onOpenChange={o => { if (!o) hoverOpened.current = false; setOpen(o); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={`termtip-${id}`}
          data-term={id}
          onPointerEnter={schedule(true)}
          onPointerLeave={schedule(false)}
          onClick={e => {
            // A click after a hover-open pins the popover open instead of closing it.
            if (hoverOpened.current && open) { e.preventDefault(); hoverOpened.current = false; }
          }}
          className={iconOnly
            ? 'inline-flex items-center align-middle text-muted-foreground hover:text-foreground cursor-help rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60'
            : 'inline underline decoration-dotted decoration-muted-foreground/60 underline-offset-2 cursor-help font-medium text-inherit text-left rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60'}
        >
          {!iconOnly && children}
          <Info aria-hidden="true" className={iconOnly ? 'h-3.5 w-3.5' : 'inline h-3 w-3 ml-0.5 -mt-0.5 opacity-60'} />
          <span className="sr-only">{iconOnly ? srAsk : ` (${srAsk})`}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 text-left"
        data-testid={`termtip-content-${id}`}
        aria-label={title}
        onPointerEnter={schedule(true)}
        onPointerLeave={schedule(false)}
        onOpenAutoFocus={e => { if (hoverOpened.current) e.preventDefault(); }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}{hi && def.hiTerm ? <span className="normal-case font-normal"> · {def.term}</span> : null}
        </p>
        {/* impact-first: plain-language impact leads */}
        <p className="mt-1 text-sm font-medium text-foreground">{body}</p>
        {!hi && def.why && <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{def.why}</p>}
        {!hi && def.guidance && <p className="mt-2 text-xs text-brand-purple">{def.guidance}</p>}
        <a href={glossaryHref(id)} className="mt-2 inline-block text-xs font-medium text-brand-purple hover:underline">
          {hi ? 'शब्दकोश में और पढ़ें →' : 'More in the glossary →'}
        </a>
      </PopoverContent>
    </Popover>
  );
}

/**
 * A one-line "what this number means for you" note under a numeric result.
 * Pair it with a helper from src/lib/vedic/numberNotes.ts.
 */
export function NumberNote({ children, testid }: { children: React.ReactNode; testid?: string }) {
  if (!children) return null;
  return (
    <p data-testid={testid ?? 'number-note'} className="mt-1 text-xs text-muted-foreground leading-snug">
      <span aria-hidden="true">↳ </span>{children}
    </p>
  );
}

/**
 * A small, reusable legend for the Yoga/strength grade chips (full / strong / moderate /
 * partial) — impact-first: says what each grade means for the reader, once, so bare
 * `[grade]` chips stop being unexplained jargon.
 */
export function GradeLegend() {
  const rows: Array<[string, string]> = [
    ['full / strong', 'the combination is clearly formed — its promise is well supported in your chart'],
    ['moderate', 'partly formed — treat it as genuine support, not a guarantee'],
    ['partial', 'only loosely present — a mild influence, not a headline'],
  ];
  return (
    <div data-testid="grade-legend" className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">What the grades mean: </span>
      {rows.map(([g, meaning], i) => (
        <span key={g}>
          <strong className="text-foreground">{g}</strong> — {meaning}{i < rows.length - 1 ? '; ' : '.'}
        </span>
      ))}
    </div>
  );
}

export default TermTip;
