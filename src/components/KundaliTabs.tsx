/**
 * Section tabs for the Vedic hub (Part E2). The /kundali page is the anchor; from
 * here the user reaches Matching and (future) the AI astrologer chat. Kundali,
 * Matching, and the chat stay SEPARATE focused pages (matches every competitor) —
 * these are navigation, not a merged mega-page.
 *
 * The "Ask your personal astrologer" tab is a DOCUMENTED PLACEHOLDER only — the
 * chat feature itself is a separate future session and is intentionally not built
 * here. It renders disabled with a "soon" affordance.
 */
import { Link } from 'react-router-dom';

export type KundaliTab = 'kundali' | 'match';

const base = 'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap';

export function KundaliTabs({ active }: { active: KundaliTab }) {
  const cls = (isActive: boolean) =>
    `${base} ${isActive ? 'bg-indigo-600 text-white' : 'bg-card/60 border border-border text-foreground hover:bg-muted/40'}`;
  return (
    <nav data-testid="kundali-tabs" aria-label="Vedic sections" className="flex flex-wrap gap-2 mb-6">
      <Link data-testid="tab-kundali" to="/kundali" className={cls(active === 'kundali')} aria-current={active === 'kundali' ? 'page' : undefined}>
        Kundali
      </Link>
      <Link data-testid="tab-match" to="/kundali-match" className={cls(active === 'match')} aria-current={active === 'match' ? 'page' : undefined}>
        Kundali Matching
      </Link>
      {/* Placeholder for the future "Ask your personal astrologer" AI chat — not built this session. */}
      <span
        data-testid="tab-astrologer-placeholder"
        aria-disabled="true"
        title="Coming soon — talk to your personal astrologer"
        className={`${base} bg-muted/30 border border-dashed border-border text-muted-foreground cursor-not-allowed`}
      >
        Ask your personal astrologer <span className="ml-1 text-[10px] uppercase tracking-wide">soon</span>
      </span>
    </nav>
  );
}

export default KundaliTabs;
