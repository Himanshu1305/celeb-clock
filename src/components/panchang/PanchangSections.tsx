/**
 * Building blocks shared by the Panchang, Rahu Kaal and Choghadiya pages (batch 7, W7).
 * Every term shown gets a TermTip (plain-language explanation).
 */
import { Link } from 'react-router-dom';
import { TermTip, NumberNote } from '@/components/vedic/TermTip';
import { CHOGHADIYA_TERM } from '@/lib/vedic/termDefinitions';
import type { DayPanchang, TimeWindow, PanchangCity } from '@/lib/vedic/panchangDay';
import { windowText, type PanchangPageKind } from '@/lib/vedic/panchangText';

export const QUALITY_STYLE: Record<TimeWindow['quality'], string> = {
  good: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  neutral: 'bg-slate-50 border-slate-200 text-slate-700',
  bad: 'bg-rose-50 border-rose-200 text-rose-800',
};

/** The 2–3 sentence direct answer, shown first. */
export function AnswerBox({ text, testid = 'panchang-answer' }: { text: string; testid?: string }) {
  return (
    <p data-testid={testid} className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-[15px] leading-relaxed text-foreground mb-6">
      {text}
    </p>
  );
}

function Row({ label, ws, tone }: { label: React.ReactNode; ws: TimeWindow[]; tone: 'good' | 'bad' }) {
  return (
    <li className="flex justify-between gap-3 py-1 border-b border-border/50 last:border-0">
      <span>{label}</span>
      <span className={`tabular-nums text-right ${tone === 'good' ? 'text-emerald-700' : 'text-rose-700'}`}>
        {ws.length ? ws.map((w, i) => <span key={i} className="block">{windowText(w)}</span>) : <span className="text-muted-foreground">none today</span>}
      </span>
    </li>
  );
}

/** Good and avoid windows of the day, side by side. */
export function MuhurtaLists({ p, place, highlight }: { p: DayPanchang; place: string; highlight?: 'rahu' }) {
  const isWednesday = p.weekday === 'Wednesday';
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-6">
      <div className="rounded-xl border border-border p-4" data-testid="panchang-good-times">
        <h2 className="font-semibold text-foreground mb-2">Good times</h2>
        <ul className="text-sm">
          <Row label={<TermTip id="brahmaMuhurta">Brahma Muhurta</TermTip>} ws={[p.brahmaMuhurta]} tone="good" />
          {p.abhijitApplies
            ? <Row label={<TermTip id="abhijit">Abhijit Muhurta</TermTip>} ws={[p.abhijit]} tone="good" />
            : <li className="flex justify-between gap-3 py-1 border-b border-border/50"><span><TermTip id="abhijit">Abhijit Muhurta</TermTip></span><span className="text-muted-foreground text-right">not used on Wednesday</span></li>}
          <Row label={<TermTip id="amritKalam">Amrit Kalam</TermTip>} ws={p.amritKalam} tone="good" />
        </ul>
        {isWednesday && (
          <NumberNote testid="panchang-abhijit-wednesday">On a Wednesday the midday muhurta that would be Abhijit is that day’s Dur Muhurtam, so Abhijit is not used (Drik Panchang shows it as “None” too).</NumberNote>
        )}
      </div>
      <div className={`rounded-xl border p-4 ${highlight === 'rahu' ? 'border-rose-300' : 'border-border'}`} data-testid="panchang-windows">
        <h2 className="font-semibold text-foreground mb-2">Times to avoid for new starts</h2>
        <ul className="text-sm">
          <Row label={<TermTip id="rahuKalam">Rahu Kaal</TermTip>} ws={[p.rahuKaal]} tone="bad" />
          <Row label={<TermTip id="gulikaKaal">Gulika Kaal</TermTip>} ws={[p.gulikaKaal]} tone="bad" />
          <Row label={<TermTip id="yamaganda">Yamaganda</TermTip>} ws={[p.yamaganda]} tone="bad" />
          <Row label={<TermTip id="durMuhurtam">Dur Muhurtam</TermTip>} ws={p.durMuhurtam} tone="bad" />
          <Row label={<TermTip id="varjyam">Varjyam</TermTip>} ws={p.varjyam} tone="bad" />
        </ul>
        <NumberNote testid="panchang-window-note">Local clock times for {place}, rounded to the nearest minute and worked out from this day’s sunrise and sunset (Varjyam and Amrit Kalam from the Moon’s Nakshatra). These are traditional guides for starting something new — ongoing work is fine.</NumberNote>
      </div>
    </div>
  );
}

function ChoghadiyaRow({ c, now }: { c: TimeWindow; now?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${QUALITY_STYLE[c.quality]} ${now ? 'ring-2 ring-primary' : ''}`}>
      <span className="font-medium">{CHOGHADIYA_TERM[c.name] ? <TermTip id={CHOGHADIYA_TERM[c.name]}>{c.name}</TermTip> : c.name}{now ? ' · now' : ''}</span>
      <span className="tabular-nums">{c.start}–{c.end}</span>
    </div>
  );
}

/** Day + night Choghadiya. `nowIndex` (0–15) highlights the current slot when viewing today. */
export function ChoghadiyaTables({ p, nowIndex, headingLevel = 2 }: { p: DayPanchang; nowIndex?: number; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-6" data-testid="panchang-choghadiya">
      <div>
        <H className="font-semibold text-foreground mb-2">Day <TermTip id="choghadiya">Choghadiya</TermTip> <span className="text-sm font-normal text-muted-foreground">(sunrise {p.sunrise} → sunset {p.sunset})</span></H>
        <div className="space-y-1">{p.dayChoghadiya.map((c, i) => <ChoghadiyaRow key={i} c={c} now={nowIndex === i} />)}</div>
      </div>
      <div>
        <H className="font-semibold text-foreground mb-2">Night <TermTip id="choghadiya">Choghadiya</TermTip> <span className="text-sm font-normal text-muted-foreground">(sunset → next sunrise)</span></H>
        <div className="space-y-1">{p.nightChoghadiya.map((c, i) => <ChoghadiyaRow key={i} c={c} now={nowIndex === 8 + i} />)}</div>
      </div>
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
