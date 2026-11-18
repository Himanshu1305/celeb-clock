/**
 * B14 — the guide below the English /kundli-milan-by-name tool. The sample comes from
 * src/data/guideSamples.json (readName + matchByName — the tool’s own functions).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { RASHI_EN } from '@/lib/vedic/nameMatching';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related } from './shared';

const N = S.nameMatch;

export const NAME_EXTRA_FAQ: FaqItem[] = [
  { question: 'Should I type the name in English or Hindi?', answer: 'Either works, but Devanagari is more precise. In English spelling, letters like t, d and n can stand for two different Hindi letters that belong to different nakshatras; in Hindi the first akshara is unambiguous.' },
  { question: 'Which name should I use — the official name or the pet name?', answer: 'Traditionally the name chosen at the naming ceremony from the birth syllable (the naam nakshatra name) is used. If no such name exists, families use the name the person is commonly known by — but the result is then only a rough guide.' },
  { question: 'Can I find my rashi from my name?', answer: 'You can find the “naam rashi” — the sign linked to your name’s first syllable. Your real Moon sign (janma rashi) needs your birth date and time; the two agree only if your name was chosen from your birth star.' },
  { question: 'What if the score is low?', answer: 'Treat it as a prompt to do a proper match with birth details, not as a verdict. Name matching cannot see the real Moon positions, Manglik dosha or the cancellations that birth-detail matching checks.' },
];

export function NameMatchGuide({ baseFaq }: { baseFaq: FaqItem[] }) {
  const meta = GUIDE_META['/kundli-milan-by-name'];
  const b = N.boy.candidates[0], g = N.girl.candidates[0];
  return (
    <Guide id="name-match">
      <GuideWebApp name="Kundli Milan by Name" description={meta.description} path="/kundli-milan-by-name" />
      <GuideHowTo
        name="How to do kundli milan by name"
        description="Get an approximate 36-guna score from the boy’s and the girl’s names."
        steps={[
          { name: 'Type the boy’s name', text: 'In English or Hindi; Hindi (Devanagari) is the most precise.' },
          { name: 'Type the girl’s name', text: 'The tool reads the first syllable of each name.' },
          { name: 'Pick the right sound if asked', text: 'If a spelling has more than one reading, choose the one your family uses.' },
          { name: 'Read the score — then confirm', text: 'Use the 36-guna result as a first look, then match with birth details for accuracy.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is kundli milan by name?">
        <p>Kundli milan by name — naam se kundli milan — is the traditional shortcut used when one or both birth times are unknown. In the Hindu naming custom, a child’s name was meant to start with the syllable of the Moon’s nakshatra pada at birth. Read backwards, a name’s first syllable therefore points to a nakshatra and a Moon sign, and the usual 36-point guna milan can be scored from those two stars.</p>
        <p>It is quick and needs nothing but two names, which is why families often use it for a first look. Its weakness is the same as its strength: it trusts the name, not the sky.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How the name is turned into a nakshatra" white>
        <p>The tool uses the traditional table of 108 syllables — four for each of the 27 nakshatras, one per pada — as published by Drik Panchang and cross-checked with other references. It reads the first akshara of each name (from Devanagari directly, or from an English spelling with every plausible reading), finds the matching pada, and from it the nakshatra and Moon sign. Where Drik Panchang groups letters together, the same grouping is used: a name starting with ब is read with the व syllables, and श with both its own and the स readings.</p>
        <p>The score itself comes from exactly the same Ashtakoota engine as birth-detail matching — the one whose totals matched AstroSage for every couple in our tests — so the only approximation is the step from name to star.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title={`A sample: ${N.boy.name} and ${N.girl.name}`}>
        {b && g && N.result && (
          <SampleCard testId="name-match-sample" title={`${N.boy.name} (boy) × ${N.girl.name} (girl) — ${N.result.total} of ${N.result.max}, ${N.result.compatibility}`}
            note="Computed with the tool’s own name reader and matching engine.">
            <SampleTable caption="Name to star" head={['Name', 'First syllable', 'Nakshatra (pada)', 'Moon sign']} rows={[
              [N.boy.name, `${b.syllable} (${b.syllableHi})`, `${b.nakshatra} (${b.pada})`, RASHI_EN[b.rashiIndex]],
              [N.girl.name, `${g.syllable} (${g.syllableHi})`, `${g.nakshatra} (${g.pada})`, RASHI_EN[g.rashiIndex]],
            ]} />
            <div style={{ marginTop: 12 }}>
              <SampleTable caption="Koota scores from the names" head={['Koota', 'Score', 'Max']} rows={[...N.result.kootas.map(k => [k.label, k.score, k.max]), [<strong key="t">Total</strong>, <strong key="s">{N.result.total}</strong>, N.result.max]]} />
            </div>
          </SampleCard>
        )}
        {b && g && N.result && (
          <p><strong>How to read it.</strong> “{N.boy.name}” starts with {b.syllable} ({b.syllableHi}), the syllable of {b.nakshatra} pada {b.pada}, so the name points to a {RASHI_EN[b.rashiIndex]} Moon. “{N.girl.name}” starts with {g.syllable} ({g.syllableHi}) — {g.nakshatra} pada {g.pada}, a {RASHI_EN[g.rashiIndex]} Moon. Scored like any birth-detail match, the pair gets {N.result.total} of {N.result.max}. If either person’s real Moon was elsewhere — quite likely for modern names — the real score could be very different.</p>
        )}
      </GuideSection>

      <GuideSection eyebrow="Accuracy" title="How accurate is matching by name?" white>
        <Bullets items={[
          ['It is only as good as the name', 'most modern names are chosen for meaning or sound, not from the birth star, so the star they point to is often not the real one.'],
          ['Spelling can change the star', 'English spellings such as “Ta”, “Da” or “Na” can mean two different Hindi letters; the tool shows every reading and lets you choose.'],
          ['Some checks are impossible', 'Manglik dosha, the real Nadi and Bhakoot cancellations and marriage-timing windows all need birth details.'],
          ['Best use', 'a quick first look, or when birth times are genuinely unknown — followed by a full match when details are available.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Name-matching terms in plain language">
        <TermList items={[
          ['Naam akshara', 'The first syllable of a name.'],
          ['Pada', 'A quarter of a nakshatra; each has one traditional syllable.'],
          ['Naam nakshatra', 'The nakshatra a name’s syllable points to.'],
          ['Naam rashi', 'The Moon sign linked to that syllable — not necessarily your birth Moon sign.'],
          ['Janma rashi', 'Your real Moon sign at birth, from the birth chart.'],
          ['Guna milan', 'The 36-point Ashtakoota score, the same as birth-detail matching.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Name-matching myths" white>
        <Bullets items={[
          ['“Name matching is as reliable as birth details.”', 'It cannot be — it reads a name, not where the Moon actually was.'],
          ['“A low name score means a bad match.”', 'It may simply mean the names were not chosen from the birth stars. Check with birth details.'],
          ['“Any spelling gives the same answer.”', 'Spelling decides the first syllable; writing the name in Hindi removes most doubt.'],
        ]} />
        <p>Have birth details? Use <Link to="/kundali-match/" className="underline">Kundli matching with birth details</Link> or the Hindi <Link to="/hi/kundli-milan/" className="underline" lang="hi">कुंडली मिलान</Link>. Choosing a baby name from the birth star? See <Link to="/baby-names/" className="underline">baby names by nakshatra</Link>. For the year ahead: <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link>.</p>
      </GuideSection>

      <GuideFAQ items={[...baseFaq, ...NAME_EXTRA_FAQ]} title="Kundli milan by name FAQ" />
      <RelatedLinks title="Related tools" links={related(['match', 'hiMatch', 'kundali', 'nakshatra', 'moonSign'])} />
    </Guide>
  );
}
