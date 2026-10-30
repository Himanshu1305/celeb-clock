/**
 * Plain-language note shown under every date-only Moon sign (Rashi) / Nakshatra
 * result (Batch 6). Explains the "both signs" rule so a user comparing with
 * AstroSage / Drik Panchang understands why two may be shown.
 */
import { Link } from '@/components/seo/CanonicalLink';

export function DateOnlyMoonNote({
  ambiguous,
  what = 'Moon sign (Rashi)',
  className = 'text-xs text-gray-500 mt-3 italic',
}: {
  /** True when more than one sign / Nakshatra was possible on that date; null before a date is entered. */
  ambiguous: boolean | null;
  what?: string;
  className?: string;
}) {
  return (
    <p data-testid="date-only-moon-note" className={className}>
      Your {what} comes from the sidereal (Lahiri) position of the <strong>Moon</strong> at birth — not from your Western Sun sign.
      We checked the Moon from 00:00 to 23:59 Indian Standard Time on your birth date.
      {ambiguous == null
        ? ' If it changed during that day, every possible one is shown and your birth time decides. '
        : ambiguous
          ? ' The Moon moved on during that day, so more than one is possible and your birth time decides which. '
          : ' The Moon stayed there all day, so it does not depend on your birth time. '}
      For your exact chart with birth time and place, use the <Link to="/kundali/" className="underline">free Kundali</Link>.
    </p>
  );
}
