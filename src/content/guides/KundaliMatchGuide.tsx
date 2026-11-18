/**
 * B14 — the guide below the /kundali-match tool. Sample numbers come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, ord, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { COUNTS, TESTED_MONTH } from '@/lib/accuracy/evidence';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn, signIdx } from './shared';

const M = S.match;
const fromGroom = ((signIdx(M.bride.rashi) - signIdx(M.groom.rashi) + 12) % 12) + 1;
const fromBride = ((signIdx(M.groom.rashi) - signIdx(M.bride.rashi) + 12) % 12) + 1;
const low = M.kootas.filter(k => k.score < k.max / 2).map(k => k.label);
const full = M.kootas.filter(k => k.score === k.max).map(k => k.label);

const KOOTAS: Array<[string, number, string]> = [
  ['Varna', 1, 'The four Moon-sign groups (by element) — read as a shared outlook and sense of values.'],
  ['Vashya', 2, 'Which Moon-sign family (human, four-legged, water, wild, insect) each belongs to — mutual influence and attraction.'],
  ['Tara', 3, 'Counting from one birth star to the other in groups of nine — the general auspiciousness of the pairing.'],
  ['Yoni', 4, 'Each Nakshatra has an animal symbol; friendly, neutral or opposed animals show instinctive and physical rapport.'],
  ['Graha Maitri', 5, 'Whether the two Moon-sign lords are friends, neutral or enemies — mental wavelength and friendship.'],
  ['Gana', 6, 'Deva, Manushya or Rakshasa temperament of each birth star — everyday nature and how disagreements play out.'],
  ['Bhakoot', 7, 'How far apart the two Moon signs are — emotional and financial rhythm as a household.'],
  ['Nadi', 8, 'Adi, Madhya or Antya group of each birth star — traditionally linked to constitution and family continuity.'],
];

export const MATCH_FAQ: FaqItem[] = [
  { question: 'How many gunas should match for marriage?', answer: 'Traditionally 18 of 36 is the minimum. BornClock labels 18–23.5 as Acceptable, 24–27.5 as Good and 28 or more as Excellent. The score is one input — the doshas, their cancellations and the two full charts matter as much as the number.' },
  { question: 'Is kundli matching the same as kundli milan and guna milan?', answer: 'Yes. Kundli matching, kundali milan, guna milan and Ashtakoota milan all name the same 36-point system that compares the two Moon signs and birth stars.' },
  { question: 'Why do you need birth time for kundli matching?', answer: 'Every koota comes from each person’s Moon Nakshatra and Moon sign. The Moon moves about 13° a day, so on many dates the Nakshatra changes during the day — without the time, the wrong star (and a different score) is possible. The Manglik check also needs the time for the Lagna.' },
  { question: 'Does it matter who is entered as the boy and the girl?', answer: 'Yes. Varna, Vashya and Gana are read from the groom to the bride in the AstroSage convention BornClock follows, so swapping the two can change the total by a point or two.' },
  { question: 'What is Nadi dosha and is it serious?', answer: 'Nadi dosha means both birth stars fall in the same Nadi group, so the Nadi koota scores 0 of 8. It is cancelled in many cases — same Nakshatra but different padas, same Moon sign but different Nakshatras, or friendly Moon-sign lords — and the result tells you whether a cancellation applies. It is a note about the pairing, not a judgement on either person.' },
  { question: 'What is Bhakoot dosha?', answer: 'Bhakoot dosha appears when the two Moon signs are 2/12, 5/9 or 6/8 from each other, giving 0 of 7 in Bhakoot. It is very common and is read as an area — emotional and financial rhythm — for the couple to tend with care.' },
  { question: 'Is a low score a reason not to marry?', answer: 'No chart score decides a marriage. Many families treat a low score as a prompt to look deeper — at cancellations, the full charts and, above all, the two people. Honest conversations about values, money and family plans tell you far more than any number.' },
  { question: 'Can a Manglik marry a non-Manglik?', answer: 'Yes. The tool checks both charts for Manglik dosha and shows whether it is mutual (both Manglik, which is traditionally balanced) or whether classical cancellations apply. Many happy marriages have one Manglik partner.' },
  { question: 'Do your scores match AstroSage?', answer: `Where software differs, BornClock follows the AstroSage convention, and in our tests (${TESTED_MONTH}) the total matched AstroSage for all ${COUNTS.couples} test couples.` },
  { question: 'What are the marriage-timing windows?', answer: 'After matching, the tool lists periods when both charts’ Dasha patterns are traditionally favourable for partnership. They are windows to consider, never a fixed wedding date or a prediction.' },
];

export function KundaliMatchGuide() {
  const meta = GUIDE_META['/kundali-match'];
  return (
    <Guide id="kundali-match">
      <GuideWebApp name="Kundli Matching (Guna Milan) Calculator" description={meta.description} path="/kundali-match" />
      <GuideHowTo
        name="How to match two Kundlis online"
        description="Check 36-guna Ashtakoota compatibility from two people’s birth details."
        steps={[
          { name: 'Enter the boy’s birth details', text: 'Date, time and place of birth for the groom (Person A).' },
          { name: 'Enter the girl’s birth details', text: 'Date, time and place of birth for the bride (Person B).' },
          { name: 'Run the match', text: 'The tool computes both Moon signs and birth stars, then scores all eight kootas.' },
          { name: 'Read the total and each koota', text: 'Look at the 36-point total, then at Nadi and Bhakoot, the two heaviest kootas.' },
          { name: 'Check doshas and cancellations', text: 'See Nadi, Bhakoot and Gana dosha with their classical cancellations, and the Manglik check for both charts.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is Kundli matching?">
        <p>Kundli matching — also called kundali milan or guna milan — is the traditional way Indian families compare two birth charts before marriage. The North Indian method, Ashtakoota, looks at eight aspects (kootas) of compatibility and awards up to 36 points, or gunas. In South India the related Dasha Porutham system checks ten agreements instead; this tool shows both.</p>
        <p>All eight kootas are worked out from just two things per person: the sign the Moon was in at birth (Rashi) and the birth star (Nakshatra). That is why the Moon, not the Sun, is the heart of matching — and why accurate birth details matter so much.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock calculates guna milan" white>
        <p>For each person, the exact Moon position is calculated from the birth date, time and place and converted to the sidereal zodiac with the Lahiri ayanamsa. That gives each Moon sign, Nakshatra and pada. The eight kootas are then scored by the classical rules. Where published software disagrees — the direction of Varna and Gana, how Sagittarius and Capricorn split for Vashya, half points — BornClock follows the AstroSage convention, so results line up with what most families in India already use.</p>
        <p>Matching is rigorously computed and cross-verified: in our tests ({TESTED_MONTH}) the 36-point total matched AstroSage for all {COUNTS.couples} test couples, and the Manglik level matched for all {COUNTS.manglikCharts} test charts. Besides the score, the tool checks Nadi, Bhakoot and Gana dosha with their cancellations, Manglik dosha in both charts, and lists favourable windows for marriage as ranges of time.</p>
      </GuideSection>

      <GuideSection eyebrow="The 36 gunas" title="The eight kootas and their points">
        <SampleTable caption="The eight kootas of Ashtakoota matching" head={['Koota', 'Max', 'What it looks at']} rows={KOOTAS.map(([k, m, d]) => [k, m, d])} />
        <p>The points rise from 1 to 8 in order, so the last kootas — Bhakoot and Nadi, worth 15 of the 36 points between them — carry the most weight. A pair can score well overall yet still have a 0 in one of these, which is why the tool always shows the breakdown, not just the total.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="A sample match, koota by koota" white>
        <p>This sample uses two illustrative births (not real people), computed by the same engine as the tool.</p>
        <SampleCard testId="kmatch-sample"
          title={`Groom: ${M.groom.date}, ${M.groom.time}, ${M.groom.place} · Bride: ${M.bride.date}, ${M.bride.time}, ${M.bride.place}`}
          note="Computed by the BornClock matching engine (Lahiri ayanamsa, AstroSage conventions).">
          <SampleTable caption="The two Moon positions" head={['', 'Moon sign', 'Nakshatra', 'Gana', 'Nadi', 'Manglik']} rows={[
            ['Groom', signEn(M.groom.rashi), `${M.groom.nakshatra} ${M.groom.pada}`, M.groom.gana, M.groom.nadi, M.groom.manglik],
            ['Bride', signEn(M.bride.rashi), `${M.bride.nakshatra} ${M.bride.pada}`, M.bride.gana, M.bride.nadi, M.bride.manglik],
          ]} />
          <div style={{ marginTop: 12 }}>
            <SampleTable caption="Koota scores" head={['Koota', 'Score', 'Max']} rows={[...M.kootas.map(k => [k.label, k.score, k.max]), [<strong key="t">Total</strong>, <strong key="s">{M.total}</strong>, M.max]]} />
          </div>
        </SampleCard>
        <p><strong>How to read it.</strong> The total is {M.total} of {M.max}, which the tool labels <em>{M.compatibility}</em>. {full.length > 0 && <>Full marks came in {full.join(', ')}. </>}{low.length > 0 && <>The softer spots are {low.join(', ')}. </>}The bride’s Moon sign is the {ord(fromGroom)} from the groom’s and the groom’s is the {ord(fromBride)} from the bride’s{M.doshas.find(d => d.name === 'Bhakoot Dosha')?.present ? ', a pairing that gives 0 in Bhakoot — so Bhakoot dosha is flagged, as an area of household rhythm to look after rather than a verdict' : ''}. {M.groom.nadi !== M.bride.nadi ? `Their Nadis differ (${M.groom.nadi} and ${M.bride.nadi}), so Nadi scores the full 8 and there is no Nadi dosha.` : 'Both share a Nadi, so Nadi dosha is checked for cancellations.'}</p>
        <p>On Manglik, the groom’s chart shows <em>{M.groom.manglik}</em> and the bride’s <em>{M.bride.manglik}</em>. When only one chart is Manglik, the tool checks whether a classical cancellation applies before saying anything — and even then frames it as something to weigh calmly.</p>
      </GuideSection>

      <GuideSection eyebrow="Score bands" title="What your guna milan score means">
        <Bullets items={[
          ['28 to 36 — Excellent', 'strong natural agreement on most kootas.'],
          ['24 to 27.5 — Good', 'a well-supported match; check any single zero in Nadi or Bhakoot.'],
          ['18 to 23.5 — Acceptable', 'meets the traditional minimum; the breakdown shows where to put conscious effort.'],
          ['Below 18 — Challenging', 'the tradition advises a closer look at cancellations and both full charts. It describes the Moon pairing, not the worth of either person.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Matching terms in plain language" white>
        <TermList items={[
          ['Guna', 'A point. The eight kootas together are worth 36 gunas.'],
          ['Ashtakoota', '“Eight parts” — the North Indian matching system.'],
          ['Porutham', 'The South Indian system of ten agreements, shown alongside.'],
          ['Nadi dosha', 'Same Nadi for both birth stars (0 of 8), often cancelled.'],
          ['Bhakoot dosha', 'Moon signs 2/12, 5/9 or 6/8 apart (0 of 7).'],
          ['Gana dosha', 'A Rakshasa birth star paired with a Deva or Manushya one, unless cancelled.'],
          ['Parihara', 'A classical cancellation — the tradition’s own built-in balance.'],
          ['Manglik', 'Mars in the 1st, 4th, 7th, 8th or 12th from the Lagna or Moon.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="If a dosha shows up" title="Free-first, no-fear remedies">
        <p>Start with what costs nothing. For Nadi or Bhakoot dosha, families commonly recite the Maha Mrityunjaya mantra or “Om Namah Shivaya”, visit a Shiva temple together, or do anna daan (feeding people in need) as a couple. Just as useful: talk openly about money, family expectations and lifestyle — exactly the areas these kootas describe. A formal puja is optional and usually suggested only when a dosha is uncancelled. Be wary of anyone who says an expensive ritual is urgent. Details and sources: <Link to="/remedies/nadi-dosha/" className="underline">Nadi dosha remedies</Link> · <Link to="/remedies/bhakoot-dosha/" className="underline">Bhakoot dosha remedies</Link> · <Link to="/remedies/manglik-dosha/" className="underline">Manglik remedies</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Kundli matching myths" white>
        <Bullets items={[
          ['“36 out of 36 guarantees a happy marriage.”', 'A perfect score is rare and still only describes two Moon positions. Respect, communication and shared values are not in any koota.'],
          ['“Below 18 means the marriage will fail.”', 'The tradition itself asks you to check cancellations and the full charts first; many families proceed after doing so.'],
          ['“Nadi dosha can never be cancelled.”', 'Classical rules list clear exceptions, and the tool tells you when one applies.'],
          ['“Name matching is as good as birth details.”', 'Matching by name is only an approximation — see the note on the name-matching page.'],
        ]} />
        <p>No birth time? Try <Link to="/kundli-milan-by-name/" className="underline">kundli milan by name</Link> for a rough first look. Prefer Hindi? Use <Link to="/hi/kundli-milan/" className="underline" lang="hi">कुंडली मिलान</Link>. Planning the year? See <Link to="/horoscope-2027/" className="underline">Horoscope 2027</Link>.</p>
      </GuideSection>

      <GuideFAQ items={MATCH_FAQ} title="Kundli matching FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'nameMatch', 'hiMatch', 'manglik', 'nakshatra', 'dasha', 'remedies'])} />
    </Guide>
  );
}
