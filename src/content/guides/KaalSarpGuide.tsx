/**
 * B14 — the guide below the /kaal-sarp-dosha tool. Sample numbers come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, ord, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { KAAL_SARP_TYPES } from '@/lib/vedic/engine/kaalSarp';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn } from './shared';

const KS = S.kaalSarp.k, A = S.kaalSarp.a;

export const KAALSARP_EXTRA_FAQ: FaqItem[] = [
  { question: 'How do I check Kaal Sarp dosh in my Kundli?', answer: 'Enter your birth date, time and place above. The tool computes Rahu, Ketu and the seven classical planets by exact degree and reports Kaal Sarp only if all seven lie strictly on one side of the Rahu–Ketu axis.' },
  { question: 'What is partial Kaal Sarp dosh?', answer: 'A near-pattern — for example six of the seven planets inside the axis, or all seven inside only when counted by whole signs. BornClock does not report these as Kaal Sarp; at most it shows a soft, clearly labelled note.' },
  { question: 'Is Kaal Sarp dosh mentioned in classical texts?', answer: 'It is not described in the oldest classical texts such as Brihat Parashara Hora Shastra; it became widely used in later tradition. That is one reason astrologers weigh it very differently.' },
  { question: 'How is the type of Kaal Sarp decided?', answer: 'By the house Rahu occupies counted from the Lagna: Rahu in the 1st is Anant, in the 2nd Kulik, and so on to Sheshnag in the 12th. Because it depends on the Lagna, the type needs an accurate birth time.' },
  { question: 'Do I need a puja at Trimbakeshwar?', answer: 'No puja is required. Free practices — Om Namah Shivaya, the Maha Mrityunjaya mantra, Monday prayers — come first. Temple pujas at Trimbakeshwar or Srikalahasti are optional choices, never urgent.' },
  { question: 'Should I wear Gomed or Cat’s Eye for Kaal Sarp?', answer: 'These Rahu and Ketu stones are not general Kaal Sarp remedies. They are strong stones that traditional astrologers suggest, if at all, only after a full-chart check.' },
];

export function KaalSarpGuide({ baseFaq }: { baseFaq: FaqItem[] }) {
  const meta = GUIDE_META['/kaal-sarp-dosha'];
  const typeRows = Object.entries(KAAL_SARP_TYPES).map(([h, n]) => [`Rahu in the ${ord(Number(h))} house`, `${n} Kaal Sarp`]);
  return (
    <Guide id="kaal-sarp">
      <GuideWebApp name="Kaal Sarp Dosh Calculator" description={meta.description} path="/kaal-sarp-dosha" />
      <GuideHowTo
        name="How to check Kaal Sarp dosh"
        description="Check whether all seven planets fall between Rahu and Ketu in your birth chart, by exact degree."
        steps={[
          { name: 'Enter your birth details', text: 'Date, time and place of birth.' },
          { name: 'Read the verdict', text: 'Present only when all seven classical planets lie strictly on one side of the Rahu–Ketu axis.' },
          { name: 'Note the type and direction', text: 'The type comes from Rahu’s house from the Lagna; the direction from which half holds the planets.' },
          { name: 'Read the guidance calmly', text: 'See what the pattern traditionally means and the free-first practices.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is Kaal Sarp dosh?">
        <p>Rahu and Ketu, the two lunar nodes, always sit exactly opposite each other, splitting the chart into two halves. Kaal Sarp dosh — the “serpent of time” — is the pattern in which all seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus and Saturn) crowd into just one of those halves, hemmed in by the nodes.</p>
        <p>The traditional reading is “effort first, reward later”: progress can feel slow or hard-won before it opens up, and many people with the pattern describe intense focus and late-blooming success. It speaks about delay and concentration, not danger.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock checks Kaal Sarp" white>
        <p>Your chart is computed from your birth details with the Lahiri ayanamsa, with Rahu and Ketu on the mean lunar nodes. The tool then measures every planet’s exact longitude against the nodal axis. Kaal Sarp is reported only when it is <strong>full by degree</strong>: all seven planets strictly inside one half. Near-misses — six of seven, or seven only when counted by whole signs — are not called Kaal Sarp; at most they get a soft note. This strict rule is deliberate, because loose “partial Kaal Sarp” claims are a common source of needless worry.</p>
        <p>The type is named from Rahu’s whole-sign house counted from the Lagna, and the direction from which half holds the planets. The check is rigorously computed and cross-verified; on the test chart we compared with Drik Panchang the verdict was the same, and the full-pattern test chart has every planet inside the arc by degree.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="Two sample charts: one with Kaal Sarp, one without">
        <p>Both are illustrative births (not real people), computed by the same engine as the tool.</p>
        <SampleCard testId="kaalsarp-sample" title={`${KS.birth.date}, ${KS.birth.time}, ${KS.birth.place} — ${KS.present ? `${KS.type} Kaal Sarp (${KS.direction})` : 'no Kaal Sarp'}`}
          note="Computed by the BornClock engine (Lahiri ayanamsa, mean nodes, degree-based rule).">
          <SampleTable caption="Nodes and planet sides" head={['Point', 'Sign and degree', 'House']} rows={[
            ['Rahu', `${signEn(KS.rahu.sign)} ${KS.rahu.degree}`, ord(KS.rahu.house)],
            ['Ketu', `${signEn(KS.ketu.sign)} ${KS.ketu.degree}`, ord(KS.ketu.house)],
          ]} />
          <p className="text-sm text-foreground mt-2">Rahu → Ketu half: {KS.rahuToKetu.join(', ') || 'none'} · Ketu → Rahu half: {KS.ketuToRahu.join(', ') || 'none'}</p>
        </SampleCard>
        <p><strong>How to read it.</strong> With the Lagna in {signEn(KS.birth.lagna)}, Rahu falls in the {ord(KS.rahu.house)} house, which gives the name <em>{KS.type}</em>. {KS.ketuToRahu.length === 0 ? 'All seven planets sit in the half that runs from Rahu forward to Ketu' : 'All seven planets sit in the half that runs from Ketu forward to Rahu'}, with none on the other side — so the pattern is full by degree.</p>
        <SampleCard testId="kaalsarp-sample-none" title={`Sample chart A — ${A.present ? 'Kaal Sarp' : 'no Kaal Sarp'}`} note="Same engine, same rule.">
          <p className="text-sm text-foreground">Rahu {signEn(A.rahu.sign)} {A.rahu.degree}, Ketu {signEn(A.ketu.sign)} {A.ketu.degree}. Rahu → Ketu half: {A.rahuToKetu.join(', ')} · Ketu → Rahu half: {A.ketuToRahu.join(', ')}.</p>
        </SampleCard>
        <p>Here the planets are split {A.rahuToKetu.length} and {A.ketuToRahu.length} across the two halves, so there is no Kaal Sarp — the most common result by far.</p>
      </GuideSection>

      <GuideSection eyebrow="The 12 types" title="The 12 types of Kaal Sarp dosh" white>
        <SampleTable caption="Kaal Sarp type by Rahu’s house from the Lagna" head={['Rahu’s house', 'Type']} rows={typeRows} />
        <p>Each type is traditionally linked with the themes of the house Rahu occupies — the 10th with career, the 7th with partnership, and so on. Since the Lagna sets the houses, the type is only as reliable as the birth time.</p>
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Kaal Sarp terms in plain language">
        <TermList items={[
          ['Rahu', 'The Moon’s north node — ambition, appetite, the unfamiliar.'],
          ['Ketu', 'The Moon’s south node — detachment, intuition, the past.'],
          ['Nodal axis', 'The line joining Rahu and Ketu, always 180° apart.'],
          ['Full Kaal Sarp', 'All seven planets strictly inside one half, by degree.'],
          ['Partial Kaal Sarp', 'A near-pattern; not reported as Kaal Sarp here.'],
          ['Mean node', 'The averaged position of the nodes, the common Indian default.'],
          ['Ascending / Descending', 'Whether the planets lie in the Ketu→Rahu or the Rahu→Ketu half.'],
          ['Shanti', 'A pacifying prayer or ritual — always optional.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="What helps" title="Free-first Kaal Sarp remedies" white>
        <p>Because the classical reading is delay, not denial, the central remedy is persistence: keep going through slow patches and measure progress over years, not weeks. Traditional free practices include chanting “Om Namah Shivaya” or the Maha Mrityunjaya mantra, visiting a Shiva temple on Mondays, and a light, optional fast on Nag Panchami. Helping people society overlooks, and caring for or feeding animals, are common seva practices for Rahu and Ketu.</p>
        <p>Temple shantis at Trimbakeshwar or Srikalahasti are optional choices made by families who wish to do them — nobody should be pushed into paying large sums urgently. Gomed and Cat’s Eye are not general Kaal Sarp remedies. Sourced details: <Link to="/remedies/kaal-sarp-dosha/" className="underline">Kaal Sarp remedies</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Kaal Sarp myths">
        <Bullets items={[
          ['“Kaal Sarp ruins your life.”', 'The traditional reading is effort before reward. Many people with the full pattern lead successful, fulfilling lives.'],
          ['“Almost everyone has partial Kaal Sarp.”', 'Near-patterns are common precisely because they are loosely defined. They are not the full pattern.'],
          ['“It is an ancient Parashari dosha.”', 'It does not appear in the oldest classical texts; it is a later tradition.'],
          ['“Only an expensive puja can remove it.”', 'Free prayer, patience and service are the first-line practices in the tradition itself.'],
        ]} />
        <p>See the full picture: your <Link to="/kundali/" className="underline">free Kundli</Link>, your <Link to="/dasha-calculator/" className="underline">Rahu and Ketu Dasha dates</Link>, and the year ahead in <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link>.</p>
      </GuideSection>

      <GuideFAQ items={[...baseFaq, ...KAALSARP_EXTRA_FAQ]} title="Kaal Sarp dosh FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'manglik', 'dasha', 'sadeSati', 'remedies', 'glossary'])} />
    </Guide>
  );
}
