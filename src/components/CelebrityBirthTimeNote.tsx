/**
 * CelebrityBirthTimeNote — P4-CELEB-BIRTHTIME.
 *
 * Honest, per-celebrity birth-time reliability note. It states plainly whether
 * this person's birth TIME is on record, and that drives whether the
 * time-dependent parts of a Vedic chart (Nakshatra, Ascendant / Lagna, house
 * placements, Dasha) are shown at all. We never default to noon and present
 * the result as fact.
 */
import {
  getCelebrityBirthTime,
  getBirthTimeReliability,
  type BirthTimeReliability,
} from '@/data/celebrityBirthTimes';

const BADGE: Record<BirthTimeReliability, { label: string; cls: string; dot: string }> = {
  reliable:    { label: 'Birth time: reliable',    cls: 'bg-green-50 border-green-200 text-green-800', dot: 'bg-green-500' },
  approximate: { label: 'Birth time: approximate', cls: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' },
  unknown:     { label: 'Birth time: not on record', cls: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
};

export function CelebrityBirthTimeNote({
  slug,
  name,
  ctaHref = '/birthday-report',
}: {
  slug: string;
  name: string;
  ctaHref?: string;
}) {
  const reliability = getBirthTimeReliability(slug);
  const bt = getCelebrityBirthTime(slug);
  const badge = BADGE[reliability];

  return (
    <div
      data-testid="celebrity-birthtime-note"
      data-reliability={reliability}
      className="rounded-xl border border-border p-4 mt-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🌙</span>
        <span className="font-semibold text-foreground">Vedic birth chart &amp; birth time</span>
        <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>

      {reliability === 'unknown' ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          A genuine Vedic Kundli for {name} would need their exact birth <em>time</em> and
          place, and those are not in the public record. The Ascendant (Lagna), house
          placements, Nakshatra and Dasha timeline all change with just a few minutes'
          difference — so we don't invent a time or quietly default to noon. This profile
          therefore shows only what the birth <em>date</em> can honestly support: Sun sign,
          Moon sign (Rashi), Chinese zodiac and Life Path.
        </p>
      ) : (
        <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
          <p>
            Recorded birth time: <strong className="text-foreground">{bt?.time}</strong>
            {bt?.place ? <> in {bt.place.name}</> : null} — reliability <strong>{reliability}</strong>{' '}
            (Rodden <strong>{bt?.rodden}</strong>).
          </p>
          {bt?.source ? <p className="text-xs">Source: {bt.source}</p> : null}
          {!bt?.place && (
            <p className="text-xs italic">
              A birthplace is still needed to compute the full time-dependent chart.
            </p>
          )}
        </div>
      )}

      <a
        href={ctaHref}
        data-testid="celebrity-birthtime-cta"
        className="inline-block mt-2 text-xs font-bold text-primary underline"
      >
        Know your own birth time? Build your precise Kundli →
      </a>
    </div>
  );
}
