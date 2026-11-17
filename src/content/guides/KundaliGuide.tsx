/**
 * B14 — the explanatory guide below the /kundali tool. Sample numbers come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, fmtDate, ord, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { COUNTS, TESTED_MONTH } from '@/lib/accuracy/evidence';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn } from './shared';

const K = S.kundali;
const moon = K.planets.find(p => p.name === 'Moon')!;
const sun = K.planets.find(p => p.name === 'Sun')!;
const retro = K.planets.filter(p => p.retrograde && p.name !== 'Rahu' && p.name !== 'Ketu').map(p => p.name);

export const KUNDALI_FAQ: FaqItem[] = [
  { question: 'Is this Kundli really free?', answer: 'Yes. The full Janam Kundli on this page — chart, planet table, Nakshatra, Dasha timeline, doshas and the written reading — is free, and the PDF download is free too.' },
  { question: 'What details do I need to make my Kundli?', answer: 'Your date of birth, your birth time and your place of birth. The place gives the latitude, longitude and the time zone that was in force on that date, which together fix the exact moment and the rising sign.' },
  { question: 'Is Kundli the same as Kundali or Janam Kundli?', answer: 'Yes. Kundli, Kundali, Janam Kundli, Janampatri and birth chart all mean the same thing: a map of where the Sun, Moon, planets, Rahu and Ketu were at the moment you were born, seen from your birthplace.' },
  { question: 'What if I do not know my exact birth time?', answer: 'Your Moon sign, Nakshatra and Dasha usually stay the same across a few minutes, but the Lagna (rising sign) and the houses can change. Use the best time you have; the page tells you when a planet or the Lagna sits close to a boundary, so you know which parts are sensitive to the time.' },
  { question: 'Which ayanamsa does BornClock use?', answer: 'The Lahiri (Chitrapaksha) ayanamsa — the standard adopted by the Indian Calendar Reform Committee and the default in most Indian astrology software. It converts the tropical positions astronomers use into the sidereal positions Vedic astrology reads.' },
  { question: 'How accurate is this Kundli?', answer: `Positions are rigorously computed and cross-verified. In our tests (${TESTED_MONTH}), the Lagna and all nine planet positions for ${COUNTS.kundaliBirths} test births — ${COUNTS.kundaliPositions} positions in all — were within 1 arc-minute of the Swiss Ephemeris, and every Nakshatra, pada and current Dasha matched.` },
  { question: 'Why is my Vedic Rashi different from my zodiac sign?', answer: 'Your everyday zodiac sign is usually your Western Sun sign, measured in the tropical zodiac. Your Vedic Rashi is the sidereal sign of the Moon. They are different planets in different zodiacs, so they often differ.' },
  { question: 'North Indian or South Indian chart — which should I use?', answer: 'Both show exactly the same positions; only the drawing differs. The North Indian chart keeps the houses fixed and moves the signs, the South Indian chart keeps the signs fixed and moves the houses. Use the one your family or astrologer is used to — the toggle switches instantly.' },
  { question: 'Can a Kundli predict exact events?', answer: 'No honest Kundli can. It shows tendencies, strengths and periods — for example which Dasha is running — and the tradition reads these as windows of opportunity or effort, never as fixed dates or certain outcomes.' },
];

export function KundaliGuide() {
  const meta = GUIDE_META['/kundali'];
  return (
    <Guide id="kundali">
      <GuideWebApp name="Free Kundli (Janam Kundali) Generator" description={meta.description} path="/kundali" />
      <GuideHowTo
        name="How to make your Janam Kundli online"
        description="Generate a free Vedic birth chart (Kundli) from your birth date, time and place."
        steps={[
          { name: 'Enter your date of birth', text: 'Type the date exactly as on your birth record.' },
          { name: 'Enter your birth time', text: 'Use the time from your birth certificate or hospital record; the closer to the minute, the more reliable the Lagna.' },
          { name: 'Choose your birthplace', text: 'Pick the town or city of birth so the latitude, longitude and historical time zone are applied.' },
          { name: 'Generate the Kundli', text: 'Press “Generate my Kundli” to compute the chart, planet table, Nakshatra and Dasha.' },
          { name: 'Read the key points first', text: 'Start with the Lagna, the Moon sign (Rashi), the birth Nakshatra and the running Mahadasha, then explore the houses and doshas.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is a Kundli (Kundali)?">
        <p>A Kundli — also spelt Kundali, and called Janam Kundli or Janampatri — is a snapshot of the sky at the moment you were born, drawn from the exact place you were born. It records which of the twelve signs each of the nine grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu) occupied, and which sign was rising on the eastern horizon. That rising sign, the Lagna, becomes your first house, and the other eleven houses follow in order.</p>
        <p>Everything else in Vedic astrology is read from this one chart: your Moon sign and birth star, the timing of your planetary periods (Dasha), Kundli matching for marriage, and checks such as Manglik or Sade Sati. That is why getting the chart itself right matters more than any interpretation layered on top.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock computes your Janam Kundli" white>
        <p>First, your local birth time is converted to Universal Time using the time zone that applied at your birthplace on that date — including old zones and summer time, which many calculators get wrong for births before the 1950s or outside India. Next, the true positions of the Sun, Moon and planets are calculated astronomically for that instant, and Rahu and Ketu are placed on the Moon’s mean nodes.</p>
        <p>These positions are then shifted from the tropical zodiac into the sidereal zodiac with the <strong>Lahiri (Chitrapaksha) ayanamsa</strong>, the standard used across Indian astrology. The Lagna comes from your birthplace’s latitude and longitude and the local sidereal time, and houses are counted whole-sign from the Lagna, the classical Parashari way. Finally the Moon’s exact degree gives your Nakshatra and pada, and the Vimshottari Dasha is worked out from how far the Moon had travelled through that Nakshatra.</p>
        <p>The result is rigorously computed and cross-verified: in our tests ({TESTED_MONTH}) all {COUNTS.kundaliPositions} Lagna and planet positions across {COUNTS.kundaliBirths} test births were within 1 arc-minute of the Swiss Ephemeris, the astronomical library professional astrology software is built on. The full method is on <Link to="/accuracy/" className="underline">How we check accuracy</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="A sample Kundli, read step by step">
        <p>Here is a real chart produced by the same engine as the tool above, for an illustrative birth (not a real person): {K.birth.date}, {K.birth.time} in {K.birth.place}.</p>
        <SampleCard testId="kundali-sample" title={`${K.birth.label}: ${K.birth.date}, ${K.birth.time}, ${K.birth.place}`}
          note={`Computed by the BornClock engine (Lahiri ayanamsa ${K.ayanamsa} for this date). Current Dasha shown as of ${S.refLabel}.`}>
          <SampleTable caption="Key points of the sample chart" head={['Point', 'Result']} rows={[
            ['Lagna (Ascendant)', `${signEn(K.lagna.sign)} ${K.lagna.degree}`],
            ['Moon sign (Rashi)', `${signEn(K.rashi)} ${K.moonDegree}`],
            ['Birth Nakshatra', `${K.nakshatra.name}, pada ${K.nakshatra.pada} (ruled by ${K.nakshatra.lord})`],
            ['Running Dasha', K.currentDasha ? `${K.currentDasha.mahadasha} Mahadasha / ${K.currentDasha.antardasha} Antardasha (to ${fmtDate(K.currentDasha.antardashaEnd)})` : '—'],
          ]} />
          <div style={{ marginTop: 12 }}>
            <SampleTable caption="Planet positions in the sample chart" head={['Graha', 'Sign', 'House', 'Degree', 'Nakshatra']} rows={K.planets.map(p => [
              `${p.name}${p.retrograde ? ' (R)' : ''}`, signEn(p.sign), p.house, p.degree, `${p.nakshatra} ${p.pada}`,
            ])} />
          </div>
        </SampleCard>
        <p><strong>How to read it.</strong> The Lagna is {signEn(K.lagna.sign)}, so {K.lagna.sign} is the 1st house and every other house is counted from it. The Moon is in {signEn(moon.sign)}, which makes {moon.sign} this person’s Rashi — the sign used for their rashifal and for Kundli matching — and it sits in the {ord(moon.house)} house from the Lagna. The Sun is in {signEn(sun.sign)} in the {ord(sun.house)} house; note that this sidereal Sun sign is not the same as a Western “star sign”.</p>
        <p>The Moon’s degree places it in {K.nakshatra.name} Nakshatra, pada {K.nakshatra.pada}. {K.nakshatra.name} is ruled by {K.nakshatra.lord}, so the person’s Vimshottari Dasha sequence began with a {K.nakshatra.lord} period. {retro.length > 0 ? `The “(R)” after ${retro.join(', ')} means the planet appeared to move backwards (retrograde) at birth — a normal astronomical effect that the tradition reads as an inward, revisiting quality, not a fault.` : ''} Rahu and Ketu are always shown retrograde because the lunar nodes move backwards through the zodiac.</p>
      </GuideSection>

      <GuideSection eyebrow="Reading guide" title="How to read your own Kundli in six steps" white>
        <Bullets items={[
          ['Start with the Lagna', 'it is the lens of the whole chart: your body, temperament and how you meet the world. Its sign and its ruling planet colour everything else.'],
          ['Find your Moon sign and Nakshatra', 'the Moon describes the mind and emotions. Your Rashi is used for daily rashifal, Sade Sati and matching; your Nakshatra refines it into one of 27 birth stars.'],
          ['Look at the houses', 'each of the 12 houses is an area of life — self, wealth, siblings, home, children, health and service, partnership, change, fortune, career, gains and letting go. A planet in a house brings its nature to that area.'],
          ['Check where each planet’s sign sits', 'a planet in its own or exalted sign is considered comfortable and strong; in a debilitated sign it needs more conscious effort.'],
          ['Note your running Dasha', 'the Mahadasha lord shows which planet’s themes are “switched on” for these years; the Antardasha fine-tunes it. The timeline below the chart gives exact dates.'],
          ['Read doshas calmly', 'Manglik, Kaal Sarp or Sade Sati are classical patterns to understand, each with built-in cancellations. They are not verdicts, and nothing in a chart is a reason for fear.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Every Kundli term, explained simply">
        <TermList items={[
          ['Lagna (Ascendant)', 'The zodiac sign rising in the east at your birth moment. It changes roughly every two hours, which is why birth time matters.'],
          ['Rashi (Moon sign)', 'The sidereal sign the Moon was in. In India, “my rashi” almost always means this.'],
          ['Nakshatra', 'One of 27 lunar mansions of 13°20′ each. Your birth Nakshatra is the one holding the Moon.'],
          ['Pada', 'A quarter of a Nakshatra (3°20′). The 108 padas give the traditional first syllable of a name.'],
          ['Bhava (house)', 'One of 12 life areas, counted from the Lagna. BornClock uses whole-sign houses.'],
          ['Graha', 'The nine “planets” of Vedic astrology: the seven visible bodies plus Rahu and Ketu.'],
          ['Rahu and Ketu', 'The two points where the Moon’s path crosses the Sun’s — always exactly opposite each other.'],
          ['Retrograde (R)', 'A planet that appears to move backwards from Earth. It is still in the sign shown.'],
          ['Ayanamsa', 'The gap between the tropical and sidereal zodiacs — about 24° today. BornClock uses Lahiri.'],
          ['Dasha', 'A planetary period. Vimshottari Dasha is a 120-year cycle of nine periods.'],
          ['Navamsa (D9)', 'The ninth divisional chart, read for marriage and inner strength. It is very birth-time sensitive.'],
          ['North vs South chart', 'Two ways of drawing the same chart: fixed houses (North) or fixed signs (South).'],
        ]} />
        <p>Need more? The <Link to="/glossary/" className="underline">astrology glossary</Link> explains every term used on BornClock, with Hindi names.</p>
      </GuideSection>

      <GuideSection eyebrow="Accuracy" title="Why your birth time and place matter" white>
        <p>The Moon moves about 13° a day, so your Moon sign and Nakshatra rarely change over a few minutes — but the Lagna moves through all twelve signs in about a day, so an error of even 10–15 minutes can shift it when it lies near the edge of a sign. Houses, the Navamsa and every house-based check (including Manglik from the Lagna) move with it.</p>
        <p>The place matters just as much: it sets the latitude for the rising sign and the time zone for converting your clock time. When a sensitive point lies close to a boundary, the tool says so beside the result, so you know what to double-check rather than trusting a number blindly.</p>
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Common Kundli myths">
        <Bullets items={[
          ['“Your Kundli decides your fate.”', 'The tradition itself treats a chart as tendencies and timing, shaped by effort and choices. A good reading points to strengths and seasons; it never hands down a sentence.'],
          ['“A dosha means bad luck.”', 'Doshas are classical patterns with classical cancellations. Many are common — Manglik, for example, appears in a large share of charts — and they are read alongside the rest of the chart, not on their own.'],
          ['“Free Kundlis are rough estimates.”', 'Accuracy depends on the calculation and the birth data, not the price. This one is checked position by position against the Swiss Ephemeris.'],
          ['“Rashi is the same as my star sign.”', 'Your Western star sign is the tropical Sun sign; your Rashi is the sidereal Moon sign. They are different measurements.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Conventions" title="How this compares with other Kundli software" white>
        <p>BornClock uses the conventions popular Indian sites such as Drik Panchang and AstroSage use by default — the Lahiri (Chitrapaksha) ayanamsa and the Vimshottari Dasha — and draws the main chart sign by sign, like their traditional Rashi (Lagna) chart. Rahu and Ketu are the mean lunar nodes and Dasha years are 365.25 days. With the same birth data, the signs, Nakshatra, pada and Dasha lords should therefore normally agree; small differences in degrees or in Dasha start dates can come from a different node setting (true vs mean) or year length, which some programs let you change.</p>
        <p>Next steps from your chart: check <Link to="/manglik/" className="underline">Manglik dosh</Link>, see whether <Link to="/sade-sati/" className="underline">Sade Sati</Link> is running, explore your <Link to="/dasha-calculator/" className="underline">Mahadasha timeline</Link>, or read the year ahead in <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link>.</p>
      </GuideSection>

      <GuideFAQ items={KUNDALI_FAQ} title="Kundli FAQ" />
      <RelatedLinks title="Related tools" links={related(['match', 'dasha', 'manglik', 'sadeSati', 'kaalSarp', 'nakshatra', 'moonSign', 'child'])} />
    </Guide>
  );
}
