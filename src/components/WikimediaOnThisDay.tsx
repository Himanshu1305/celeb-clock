/**
 * WikimediaOnThisDay — P4-BIRTHDAY-EVENTS + NB-DEATHS.
 * Renders notable historical events, births and deaths for a month/day from
 * Wikipedia's "On this day" feed (fetched at request time), with the required
 * CC BY-SA 4.0 attribution. Degrades silently if the feed is unavailable.
 */
import { useEffect, useState } from 'react';
import {
  fetchOnThisDay,
  WIKIMEDIA_ATTRIBUTION,
  type OnThisDay,
  type OtdItem,
  type OtdKind,
} from '@/services/wikimediaOnThisDay';

const SECTION_META: Record<OtdKind, { icon: string; title: string; blurb: string }> = {
  events: { icon: '🌍', title: 'Events on this day', blurb: 'Notable things that happened on this date through history.' },
  births: { icon: '🎂', title: 'Famous births', blurb: 'Well-known people who share this birthday.' },
  deaths: { icon: '🕊️', title: 'Notable deaths', blurb: 'People remembered on this date.' },
};

function ItemRow({ item }: { item: OtdItem }) {
  return (
    <li className="text-sm text-muted-foreground leading-relaxed">
      <span className="font-semibold text-foreground">{item.year}</span>
      {' — '}
      {item.pageUrl ? (
        <a href={item.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {item.text}
        </a>
      ) : (
        item.text
      )}
    </li>
  );
}

function Section({ kind, items }: { kind: OtdKind; items: OtdItem[] }) {
  if (items.length === 0) return null;
  const meta = SECTION_META[kind];
  return (
    <div data-testid={`otd-${kind}`} className="rounded-xl border border-border p-4">
      <h3 className="font-semibold text-foreground mb-1">{meta.icon} {meta.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{meta.blurb}</p>
      <ul className="space-y-2">
        {items.map((item, i) => <ItemRow key={`${item.year}-${i}`} item={item} />)}
      </ul>
    </div>
  );
}

export function WikimediaOnThisDay({
  month,
  day,
  kinds = ['events', 'births', 'deaths'],
  limit = 12,
  heading,
}: {
  month: number;
  day: number;
  kinds?: OtdKind[];
  limit?: number;
  heading?: string;
}) {
  const [data, setData] = useState<OnThisDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOnThisDay(month, day, limit).then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [month, day, limit]);

  if (loading) {
    return (
      <div data-testid="otd-loading" className="rounded-xl border border-border p-4 animate-pulse text-sm text-muted-foreground">
        Loading what happened on this day…
      </div>
    );
  }

  const hasAny = data && kinds.some(k => data[k].length > 0);
  if (!data || !hasAny) {
    // Honest, soft fallback — never a crash or a confusing error.
    return (
      <div data-testid="otd-empty" className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        We couldn't load historical highlights for this date right now. Please try again later.
      </div>
    );
  }

  return (
    <section data-testid="wikimedia-on-this-day" className="space-y-4">
      {heading && <h2 className="text-2xl font-bold text-foreground">{heading}</h2>}
      {kinds.map(k => <Section key={k} kind={k} items={data[k]} />)}
      <p data-testid="otd-attribution" className="text-xs text-muted-foreground">
        {WIKIMEDIA_ATTRIBUTION.text}{' '}
        <a href={WIKIMEDIA_ATTRIBUTION.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {WIKIMEDIA_ATTRIBUTION.sourceLabel}
        </a>
        {' · '}
        <a href={WIKIMEDIA_ATTRIBUTION.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {WIKIMEDIA_ATTRIBUTION.licenseName}
        </a>
      </p>
    </section>
  );
}
