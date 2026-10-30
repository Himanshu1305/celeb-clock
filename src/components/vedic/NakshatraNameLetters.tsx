/**
 * Batch 7 (W8): one line under the Kundali result — "Your Nakshatra is X → name letter …"
 * linking to /baby-names/nakshatra/:slug. Uses the ONE site-wide syllable table.
 */
import { Link } from '@/components/seo/CanonicalLink';
import { NAKSHATRA_PADA_AKSHARAS, aksharaForPada } from '@/data/nakshatraAksharas';
import { NAKSHATRA_EXTRA } from '@/data/nakshatraPages';
import { TermTip } from '@/components/vedic/TermTip';

export function NakshatraNameLetters({ nakshatra, pada }: { nakshatra: string; pada: number | string | undefined }) {
  const row = NAKSHATRA_PADA_AKSHARAS[nakshatra];
  const slug = NAKSHATRA_EXTRA[nakshatra]?.slug;
  if (!row || !slug) return null;
  const one = aksharaForPada(nakshatra, Number(pada));
  return (
    <p data-testid="kundali-name-letters" className="text-sm text-muted-foreground" style={{ marginTop: 12 }}>
      Your <TermTip id="nakshatra">Nakshatra</TermTip> is <strong className="text-foreground">{nakshatra}</strong>
      {one ? (
        <> (pada {Number(pada)}) → traditional name letter <strong className="text-foreground">“{one.en}”</strong> <span lang="hi">({one.hi})</span>.</>
      ) : (
        <> → traditional name letters <strong className="text-foreground">{row.map(a => a.en).join(', ')}</strong>.</>
      )}{' '}
      <Link to={`/baby-names/nakshatra/${slug}`} className="underline">See {nakshatra} baby names →</Link>
    </p>
  );
}
