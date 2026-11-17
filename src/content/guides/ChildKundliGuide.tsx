/**
 * B14 — the guide below the /child-kundli tool. Sample text and numbers come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, fmtDate, ord, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn } from './shared';

const CH = S.child;
const K = CH.summary;
const moon = K.planets.find(p => p.name === 'Moon')!;

export const CHILD_FAQ: FaqItem[] = [
  { question: 'What is a Child Kundli (Bal Kundli)?', answer: 'It is your child’s ordinary birth chart, read gently for parents: temperament, how they may like to learn, natural talents, supportive periods through childhood and the traditional name-starting sound.' },
  { question: 'Is the Child Kundli free?', answer: 'Yes. The reading on this page is free.' },
  { question: 'What details do I need?', answer: 'Your child’s date of birth, the birth time from the hospital record, and the place of birth. The time matters most for the Lagna and the houses.' },
  { question: 'Can a Kundli tell me my child’s future career?', answer: 'No chart decides that. The reading points to tendencies — what may come easily — so you can offer a wide range of experiences and let your child’s own enthusiasm lead.' },
  { question: 'How do I choose a name from the Nakshatra?', answer: 'Each Nakshatra has four padas, and each pada has a traditional syllable. The tool shows the syllable for your child’s birth pada; the baby-names tool lists names that start with it. Following the custom is entirely optional.' },
  { question: 'My child was born in Mool (Mula) Nakshatra — should I worry?', answer: 'No. Mula is one of the gandanta (junction) stars for which tradition suggests a simple shanti prayer, usually done once in the first weeks or on a later auspicious day. It says nothing about your child’s health or nature, and the reading explains it calmly.' },
  { question: 'Does the Child Kundli give health predictions?', answer: 'No. The wellbeing section is general, gentle guidance only — sleep, food, play and warmth — and it always points you to your paediatrician for anything about your child’s health.' },
  { question: 'Should my child wear a gemstone?', answer: 'A chart reading is not a reason to put a gemstone on a child. Free, simple practices — routine, outdoor play, stories and prayer if your family wishes — are what the tradition and common sense both favour.' },
  { question: 'What are the favourable periods?', answer: 'They are Dasha periods up to age 18 that are classically supportive for growth and learning. They are gentle tailwinds, never fixed events.' },
];

export function ChildKundliGuide() {
  const meta = GUIDE_META['/child-kundli'];
  return (
    <Guide id="child-kundli">
      <GuideWebApp name="Child Kundli (Bal Kundli)" description={meta.description} path="/child-kundli" />
      <GuideHowTo
        name="How to make your child’s Kundli"
        description="Generate a gentle, parent-facing Bal Kundli from your child’s birth details."
        steps={[
          { name: 'Enter your child’s date of birth', text: 'As on the birth certificate.' },
          { name: 'Add the birth time and place', text: 'The hospital record’s time and the town or city of birth.' },
          { name: 'Read the sections', text: 'Temperament, learning, talents, favourable periods, name sound and wellbeing guidance.' },
          { name: 'Find names for the syllable', text: 'Use the name-starting sound with the baby-names tool if you wish.' },
        ]}
      />

      <GuideSection eyebrow="For parents" title="What a Child (Bal) Kundli tells you — and what it doesn’t">
        <p>A Bal Kundli is simply your child’s birth chart, read with a parent’s questions in mind. Instead of marriage or career timing, it looks at the things you notice every day: how your child tends to feel and react, how they might like to learn, where natural interests may lie, and which periods of childhood are classically supportive. It also gives the traditional first syllable for a name, used in many families’ naamkaran.</p>
        <p>What it does not do is decide anything. Children change fast and every child surprises their parents. The reading offers gentle hints to understand your child better — never labels, never limits, and never anything about health beyond everyday care.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock reads a child’s chart" white>
        <p>The chart is computed with the same engine as the full Kundli: exact birth moment, birthplace time zone, Lahiri ayanamsa, whole-sign houses. The reading then draws on specific, classical pointers. Temperament comes from the Moon and the Gana (Deva, Manushya or Rakshasa nature) of the birth Nakshatra. Learning looks at planets touching the 4th house (foundation) and 5th house (intelligence). Talents look at the 5th house and the chart’s prominent planets. Favourable periods come from the Vimshottari Dasha between birth and age 18, and the name syllable from the birth pada.</p>
        <p>Positions are rigorously computed and cross-verified against the Swiss Ephemeris (details on <Link to="/accuracy/" className="underline">How we check accuracy</Link>). The words are deliberately gentle: tendencies, not verdicts.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="A sample Bal Kundli">
        <p>For an illustrative birth (not a real child) — {K.birth.date}, {K.birth.time}, {K.birth.place} — the engine gives:</p>
        <SampleCard testId="child-sample" title="Key points of the sample child chart" note="Computed by the BornClock engine; the section text below is exactly what the tool produces for this chart.">
          <SampleTable caption="Sample child chart" head={['Point', 'Result']} rows={[
            ['Lagna', `${signEn(K.lagna.sign)} ${K.lagna.degree}`],
            ['Moon sign', `${signEn(K.rashi)} (Moon in the ${ord(moon.house)} house)`],
            ['Birth star', `${K.nakshatra.name}, pada ${K.nakshatra.pada} — ${CH.gana} Gana`],
            ['Name-starting sound', CH.nameLetters.join(', ') || '—'],
            ['Running Dasha', K.currentDasha ? `${K.currentDasha.mahadasha} Mahadasha (to ${fmtDate(K.currentDasha.mahadashaEnd)})` : '—'],
          ]} />
          <div className="space-y-2" style={{ marginTop: 12 }}>
            {CH.sections.map(s => (
              <div key={s.title} className="rounded-lg border border-border p-3">
                <div className="font-semibold text-foreground text-sm">{s.title}</div>
                <p className="text-sm text-foreground mt-1">{s.body}</p>
              </div>
            ))}
          </div>
        </SampleCard>
        <p><strong>How to read it.</strong> The temperament note comes straight from the {K.nakshatra.name} birth star and its {CH.gana} Gana; treat it as a hint to compare with what you already see at home. The learning note follows the planet in the learning houses — here the Moon sits in the {ord(moon.house)} house, the house of foundation and comfort. The name syllable is the one for pada {K.nakshatra.pada} of {K.nakshatra.name}.</p>
      </GuideSection>

      <GuideSection eyebrow="Using it well" title="How to use a Bal Kundli as a parent" white>
        <Bullets items={[
          ['Treat it as a conversation starter', 'compare each note with your own observations; keep what fits, set aside what doesn’t.'],
          ['Offer variety', 'if a talent note points to, say, music or sport, offer it alongside other activities rather than instead of them.'],
          ['Never use it as a label', 'a “strong-willed” or “sensitive” note describes a starting point, not who your child must be.'],
          ['Keep health with your doctor', 'the wellbeing section is everyday care only; your paediatrician is the right source for everything else.'],
          ['Revisit as they grow', 'the Dasha periods change slowly; looking again at milestones can be a nice family ritual.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Child Kundli terms explained">
        <TermList items={[
          ['Bal Kundli', 'A child’s birth chart, read for parents.'],
          ['Janma Nakshatra', 'The birth star — the Nakshatra holding the Moon at birth.'],
          ['Gana', 'Deva (gentle), Manushya (balanced) or Rakshasa (intense) nature of the birth star.'],
          ['Pada and akshara', 'The quarter of the Nakshatra and its traditional name syllable.'],
          ['Naamkaran', 'The naming ceremony, traditionally on the 11th or 12th day.'],
          ['Gandanta / Mool', 'Junction stars (such as Mula and Ashlesha) for which a simple shanti is customary.'],
          ['4th and 5th houses', 'Foundation and early learning; intelligence and creativity.'],
          ['Dasha', 'The planetary period running through childhood.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Myths about children’s horoscopes" white>
        <Bullets items={[
          ['“The chart fixes a child’s career.”', 'At most it hints at aptitudes; interests, teaching and opportunity shape the rest.'],
          ['“A Mool Nakshatra birth is bad for the family.”', 'The tradition offers a simple shanti and moves on; there is no reason for worry or blame.'],
          ['“Children need gemstones or costly pujas.”', 'Love, routine and play are the remedies that matter; prayer is a family choice, and free.'],
        ]} />
        <p>Choosing a name? See <Link to="/baby-names/" className="underline">baby names by Nakshatra</Link> or browse the <Link to="/nakshatra/" className="underline">27 Nakshatras</Link>. For the whole family’s year ahead, read <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link>.</p>
      </GuideSection>

      <GuideFAQ items={CHILD_FAQ} title="Child Kundli FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'nakshatra', 'moonSign', 'dasha', 'panchang'])} />
    </Guide>
  );
}
