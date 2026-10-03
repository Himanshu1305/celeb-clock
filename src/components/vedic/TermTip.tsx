/**
 * TermTip (Part AI, Part 1) — the shared, reusable way to explain a Vedic/astrology term
 * inline on any page. Reads from the single VEDIC_TERMS dictionary (termDefinitions.ts)
 * and shows an impact-first hover-card (built on the existing shadcn hover-card primitive,
 * which was previously never used for this).
 *
 * Usage:  <TermTip id="ayanamsa">sidereal (Lahiri ayanamsa)</TermTip>
 * The children are the visible text (dotted-underlined); hovering/tapping reveals the
 * impact → why → guidance definition. If the id is unknown, it degrades to plain text.
 */
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { getTermDef } from '@/lib/vedic/termDefinitions';

export function TermTip({ id, children }: { id: string; children: React.ReactNode }) {
  const def = getTermDef(id);
  if (!def) return <>{children}</>;
  return (
    <HoverCard openDelay={80} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          data-testid={`termtip-${id}`}
          className="underline decoration-dotted decoration-muted-foreground/60 underline-offset-2 cursor-help font-medium text-inherit"
          aria-label={`What is ${def.term}?`}
        >
          {children}
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-72 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{def.term}</p>
        {/* impact-first: plain-language impact leads */}
        <p className="mt-1 text-sm font-medium text-foreground">{def.impact}</p>
        {def.why && <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{def.why}</p>}
        {def.guidance && <p className="mt-2 text-xs text-[#6E5AA6]">{def.guidance}</p>}
      </HoverCardContent>
    </HoverCard>
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
