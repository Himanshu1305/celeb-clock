/**
 * Building blocks shared by the Panchang, Rahu Kaal and Choghadiya pages (batch 7, W7).
 * Every term shown gets a TermTip (plain-language explanation).
 */
import { Link } from 'react-router-dom';
import { TermTip } from '@/components/vedic/TermTip';
import { PANCHANG_PAGE_TERM } from '@/lib/vedic/termDefinitions';
import type { DayPanchang, PanchangCity } from '@/lib/vedic/panchangDay';
import type { PanchangPageKind } from '@/lib/vedic/panchangText';

/** Plain-language explanations of every term used in the day's content (TermTip chips). */
export function TermChips({ labels }: { labels: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4 mb-6" data-testid="panchang-terms">
      <h2 className="font-semibold text-foreground mb-2">What these terms mean</h2>
      <p className="text-sm text-muted-foreground mb-2">Tap any term for a plain-language explanation.</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        {labels.map(label => <li key={label} className="rounded-full border border-border px-3 py-1"><TermTip id={PANCHANG_PAGE_TERM[label]}>{label}</TermTip></li>)}
      </ul>
    </div>
  );
}

/** Links to the same city on the other two page kinds, nearby cities and all cities. */
export function CityLinks({ kind, city, nearby, all, linkTo }: {
  kind: PanchangPageKind; city?: PanchangCity; nearby: PanchangCity[]; all: PanchangCity[]; linkTo: (k: PanchangPageKind) => string;
}) {
  const label: Record<PanchangPageKind, string> = { panchang: 'Full Panchang', 'rahu-kaal': 'Rahu Kaal', choghadiya: 'Choghadiya' };
  const others = (['panchang', 'rahu-kaal', 'choghadiya'] as PanchangPageKind[]).filter(k => k !== kind);
  const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <nav aria-label="More Panchang pages" className="mb-8 space-y-4 text-sm" data-testid="panchang-city-links">
      <p>
        {others.map((k, i) => (
          <span key={k}>{i > 0 && ' · '}<Link to={linkTo(k)} className="text-primary hover:underline">{label[k]}{city ? ` for ${city.name}` : ''} →</Link></span>
        ))}
      </p>
      {nearby.length > 0 && (
        <p>
          <span className="text-muted-foreground">Nearby cities: </span>
          {nearby.map((c, i) => <span key={c.slug}>{i > 0 && ', '}<Link to={`/${kind}/${c.slug}`} className="text-primary hover:underline">{c.name}</Link></span>)}
        </p>
      )}
      <details>
        <summary className="cursor-pointer text-muted-foreground">{label[kind]} for all {all.length} cities</summary>
        <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
          {sorted.map(c => <li key={c.slug}><Link to={`/${kind}/${c.slug}`} className="text-primary hover:underline">{c.name}</Link></li>)}
        </ul>
      </details>
    </nav>
  );
}

/** Index (0–7 day, 8–15 night) of the Choghadiya slot containing local HH:MM `now`, or undefined. */
export function choghadiyaNowIndex(p: DayPanchang, nowHHMM: string): number | undefined {
  const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const n = toMin(nowHHMM);
  const all = [...p.dayChoghadiya, ...p.nightChoghadiya];
  let prevStart = -1;
  let dayOffset = 0;
  // Walk forward; once clock times wrap past midnight, add 24 h.
  const slots = all.map(c => {
    let s = toMin(c.start) + dayOffset;
    if (s < prevStart) { dayOffset += 1440; s += 1440; }
    prevStart = s;
    let e = toMin(c.end) + dayOffset;
    if (e < s) e += 1440;
    return { s, e };
  });
  // Before this day's sunrise the slot belongs to the previous day's night — not shown here.
  if (n < slots[0].s) return undefined;
  const i = slots.findIndex(x => n >= x.s && n < x.e);
  return i >= 0 ? i : undefined;
}
