/**
 * B14 — the guide below the /manglik tool. Sample numbers come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, ord, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { COUNTS, TESTED_MONTH } from '@/lib/accuracy/evidence';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn } from './shared';

const A = S.manglik.a, B = S.manglik.b;
const counted = (h: number) => [1, 4, 7, 8, 12].includes(h);

export const MANGLIK_EXTRA_FAQ: FaqItem[] = [
  { question: 'What is the difference between High and Low Manglik?', answer: 'BornClock checks Mars twice — from the Lagna and from the Moon. Manglik by both checks is shown as High; by one check only, as Low. Low simply means one of the two reference points flags it.' },
  { question: 'Why does another website say I am Manglik when BornClock says I am not?', answer: 'Conventions differ. Some schools also count Mars in the 2nd house, some check from Venus too, and some use unequal (bhava) houses. BornClock follows the AstroSage convention — houses 1, 4, 7, 8 and 12, from the Lagna and from the Moon, whole-sign — and says so on the result.' },
  { question: 'Do I need my birth time for the Manglik check?', answer: 'Yes, for the Lagna check: the Lagna changes about every two hours, so Mars’s house from it depends on the time. The Moon check usually holds across a few minutes. Without a time, only the Moon check is reliable.' },
  { question: 'Is Manglik dosh the same as Kuja dosha or Chevvai dosham?', answer: 'Yes. Mangal, Kuja and Chevvai are the Hindi, Sanskrit and Tamil names for Mars, so Manglik dosh, Mangal dosha, Kuja dosha and Chevvai dosham describe the same pattern.' },
  { question: 'What are simple remedies for Manglik dosh?', answer: 'Free practices come first: Hanuman Chalisa or the Mangal mantra on Tuesdays, regular physical activity to channel Mars’s energy, and a small daan of red lentils on a Tuesday. A temple puja is optional, never urgent.' },
];

export function ManglikGuide({ baseFaq }: { baseFaq: FaqItem[] }) {
  const meta = GUIDE_META['/manglik'];
  return (
    <Guide id="manglik">
      <GuideWebApp name="Manglik Dosh Calculator" description={meta.description} path="/manglik" />
      <GuideHowTo
        name="How to check Manglik dosh in your Kundli"
        description="Check Mangal dosha from the Lagna and from the Moon, with the classical cancellations."
        steps={[
          { name: 'Enter your birth details', text: 'Date, time and place of birth — the time fixes the Lagna.' },
          { name: 'Read the two checks', text: 'See Mars’s house counted from the Lagna and from the Moon, each marked Manglik or not.' },
          { name: 'Note the level', text: 'High if both checks flag it, Low if one does, None if neither.' },
          { name: 'Look at cancellations', text: 'See which classical cancellations (parihara) apply to your chart.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is Manglik dosh?">
        <p>Manglik dosh — also called Mangal dosha, Kuja dosha or Chevvai dosham — is a pattern in which Mars sits in one of five particular houses of the birth chart. Mars is the planet of energy, courage and drive. In houses tied to the self, home, partnership, change and private life, the tradition reads that drive as extra heat in close relationships, which is why families look at it during Kundli matching.</p>
        <p>It is a very common pattern — five of the twelve houses count, so each check alone flags about five charts in twelve — and the same tradition that defines it lists many cancellations. It describes a temperament to understand, not a defect and not a forecast.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock checks Mangal dosha" white>
        <p>Your chart is computed from your exact birth date, time and place (Lahiri ayanamsa). Mars’s house is then counted whole-sign twice: once from the Lagna and once from the Moon. Mars in the 1st, 4th, 7th, 8th or 12th from a reference point counts; the 2nd house does not, and Venus is not used. Manglik by both checks is High, by one is Low. The tool then lists the classical cancellations that apply to your chart — Mars in its own or exalted sign, Jupiter’s or Venus’s aspect on Mars, and others.</p>
        <p>This is the AstroSage convention, chosen so results agree with what most families in India already see. The check is rigorously computed and cross-verified: in our tests ({TESTED_MONTH}) the Manglik level matched AstroSage for all {COUNTS.manglikCharts} test charts.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="Two sample Manglik checks">
        <p>Two illustrative births (not real people), computed by the same engine as the tool above:</p>
        <SampleCard testId="manglik-sample" title="Mars from the Lagna and from the Moon" note="Computed by the BornClock engine (AstroSage convention: houses 1, 4, 7, 8, 12; whole-sign; Lagna and Moon).">
          <SampleTable caption="Sample Manglik checks" head={['Chart', 'Mars in', 'From Lagna', 'From Moon', 'Result']} rows={[
            ['Sample A', signEn(A.marsSign), `${ord(A.marsHouseFromLagna)}${counted(A.marsHouseFromLagna) ? ' — counts' : ' — not counted'}`, `${ord(A.marsHouseFromMoon)}${counted(A.marsHouseFromMoon) ? ' — counts' : ' — not counted'}`, A.hasDosha ? `Manglik (${A.level})` : 'Not Manglik'],
            ['Sample B', signEn(B.marsSign), `${ord(B.marsHouseFromLagna)}${counted(B.marsHouseFromLagna) ? ' — counts' : ' — not counted'}`, `${ord(B.marsHouseFromMoon)}${counted(B.marsHouseFromMoon) ? ' — counts' : ' — not counted'}`, B.hasDosha ? `Manglik (${B.level})` : 'Not Manglik'],
          ]} />
        </SampleCard>
        <p><strong>How to read it.</strong> In Sample A, Mars is in the {ord(A.marsHouseFromLagna)} house from the Lagna and the {ord(A.marsHouseFromMoon)} from the Moon. {A.fromLagna && A.fromMoon ? 'Both checks count, so the level is High.' : A.fromLagna || A.fromMoon ? `Only the ${A.fromMoon ? 'Moon' : 'Lagna'} check counts, so the level is ${A.level}.` : 'Neither check counts.'}{A.marsHouseFromLagna === 2 ? ' This chart also shows why sites disagree: a school that counts the 2nd house would flag the Lagna check too and call it High.' : ''}</p>
        <p>In Sample B, Mars falls in the {ord(B.marsHouseFromLagna)} and {ord(B.marsHouseFromMoon)} houses, {B.hasDosha ? 'so it is Manglik.' : 'neither of which counts, so the chart is not Manglik.'}{B.cancellations.length > 0 ? ` The tool still notes the classical softeners present in this chart (${B.cancellations.join('; ')}), which would matter if Mars were in a counted house.` : ''}</p>
      </GuideSection>

      <GuideSection eyebrow="Why results differ" title="Why Manglik results vary between websites" white>
        <Bullets items={[
          ['The 2nd house', 'many South Indian traditions count Mars in the 2nd house; the AstroSage convention does not.'],
          ['Venus as a third reference', 'some astrologers also count from Venus, which makes far more charts Manglik.'],
          ['House system', 'whole-sign houses (used here) and degree-based bhava houses can place Mars one house apart.'],
          ['Birth time', 'the Lagna check moves with the birth time; a 15-minute difference can change it.'],
        ]} />
        <p>None of these is “wrong” — they are different schools. What matters is knowing which one a result uses, which is why BornClock shows both checks separately and names its convention.</p>
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Manglik terms in plain language">
        <TermList items={[
          ['Mangal / Kuja / Chevvai', 'Mars, in Hindi, Sanskrit and Tamil.'],
          ['Lagna', 'The rising sign — the 1st house and the first reference point.'],
          ['Moon reference', 'Counting houses from the Moon’s sign — the second reference point.'],
          ['Whole-sign house', 'Each sign is one complete house, counted from the reference sign.'],
          ['Parihara', 'A classical cancellation that removes or softens the dosha.'],
          ['Drishti (aspect)', 'A planet’s “gaze” on another house or planet; Jupiter’s is read as protective.'],
          ['Exalted / own sign', 'Mars is exalted in Capricorn and owns Aries and Scorpio.'],
          ['Mutual Manglik', 'Both partners Manglik — the most-cited cancellation in matching.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="What helps" title="Free-first Manglik remedies" white>
        <p>Mars responds best to purposeful action. Regular exercise, sport or physical work, patience in arguments, and channelling ambition into a clear goal are the most practical “remedies”. Traditional free practices include reciting Hanuman Chalisa or the Mangal mantra on Tuesdays and serving others. A small Tuesday daan of red lentils (masoor dal) or jaggery is a common optional step. Temple pujas such as those at Mangalnath in Ujjain are optional and never urgent — be wary of anyone who says otherwise. Sourced details: <Link to="/remedies/manglik-dosha/" className="underline">Manglik dosha remedies</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Manglik myths">
        <Bullets items={[
          ['“Manglik marriages do not last.”', 'There is no such rule in the tradition; it asks for mindful matching. Countless Manglik people have long, happy marriages.'],
          ['“A Manglik must only marry a Manglik.”', 'Mutual Manglik is one cancellation among several. Others — Mars in its own or exalted sign, Jupiter’s aspect — may already apply.'],
          ['“Manglik is rare.”', 'With five houses counted from two reference points, it is one of the most common patterns in Vedic astrology.'],
          ['“It must be fixed with an expensive ritual.”', 'The tradition offers free, simple practices first; costly rituals are optional.'],
        ]} />
        <p>Matching two charts? Use <Link to="/kundali-match/" className="underline">Kundli matching</Link>, which checks Manglik in both charts together. Looking ahead? See <Link to="/horoscope-2027/" className="underline">Horoscope 2027</Link>.</p>
      </GuideSection>

      <GuideFAQ items={[...baseFaq, ...MANGLIK_EXTRA_FAQ]} title="Manglik dosh FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'match', 'hiMatch', 'kaalSarp', 'sadeSati', 'remedies'])} />
    </Guide>
  );
}
