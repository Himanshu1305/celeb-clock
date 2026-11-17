/**
 * B14 — the guide below the /rashifal index. The transit snapshot comes from
 * src/data/guideSamples.json (engine output); tones come from the rashifal engine's
 * own gochar table (gocharTone), so nothing is hand-typed.
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, ord, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { gocharTone } from '@/lib/vedic/rashifal';
import { related, signEn } from './shared';

const G = S.gochar;
const TONE: Record<string, string> = { favourable: 'supportive', challenging: 'handle with care', mixed: 'mixed' };

export const RASHIFAL_EXTRA_FAQ: FaqItem[] = [
  { question: 'What is the difference between rashifal and horoscope?', answer: 'They describe the same idea — a reading of how current planetary movements touch your life. “Rashifal” is the Indian (Vedic) form read from the Moon sign in the sidereal zodiac; most English “horoscopes” are Western readings from the Sun sign.' },
  { question: 'How is a rashifal calculated?', answer: 'For each planet, its real sidereal sign today is counted as a house from your Moon sign. Classical gochar rules say in which houses each planet is supportive or needs care, and the reading combines these, giving more weight to slow planets like Saturn and Jupiter.' },
  { question: 'Why does the weekly or yearly rashifal look different from the daily one?', answer: 'Each period features different planets. The daily reading follows the fast Moon as well as the others; the yearly reading focuses on the slow movers — Jupiter, Saturn, Rahu and Ketu — whose transits shape the whole year.' },
  { question: 'Is a rashifal personal to me?', answer: 'It is shared by everyone with your Moon sign, so it is a general guide. For a personal view, combine it with your own Kundli and running Dasha, which can strengthen or soften any transit.' },
  { question: 'What is Chandrashtama?', answer: 'The days when the transiting Moon is in the 8th sign from your Moon sign — about two to two and a half days each month. Tradition advises keeping important new starts for other days; it is a timing note, not a warning.' },
  { question: 'Where can I read the 2027 rashifal?', answer: 'The yearly reading for all 12 Moon signs is on the Rashifal 2027 page (English) and the राशिफल 2027 page (Hindi).' },
];

export function RashifalGuide({ baseFaq }: { baseFaq: FaqItem[] }) {
  const rows = G.byMoonSign.map(r => [
    signEn(r.sign),
    `${ord(r.jupiterHouse)} — ${TONE[gocharTone('Jupiter', r.jupiterHouse)]}`,
    `${ord(r.saturnHouse)} — ${TONE[gocharTone('Saturn', r.saturnHouse)]}`,
  ]);
  const jupGood = G.byMoonSign.filter(r => gocharTone('Jupiter', r.jupiterHouse) === 'favourable').map(r => r.sign);
  return (
    <Guide id="rashifal">
      <GuideHowTo
        name="How to read your rashifal"
        description="Pick your Vedic Moon sign and read the computed daily, weekly, monthly or yearly rashifal."
        steps={[
          { name: 'Know your Moon sign', text: 'Use your Rashi (sidereal Moon sign) — find it with the free Kundli or moon sign calculator.' },
          { name: 'Pick your sign and period', text: 'Choose today, tomorrow, week, month or year.' },
          { name: 'Read the tone and grade', text: 'Each area is marked supportive, mixed or handle-with-care, and strong, moderate or mild.' },
          { name: 'Use the practical tip', text: 'Every reading ends with what to do with the day or period.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is a rashifal?">
        <p>A rashifal is the Indian horoscope: a reading of how today’s planetary positions — gochar, or transits — touch the different areas of your life, counted from your Moon sign (Rashi). The Moon is used because Vedic astrology treats it as the mind, the part of you that feels the weather of each day.</p>
        <p>The twelve Rashis are Mesha, Vrishabha, Mithuna, Karka, Simha, Kanya, Tula, Vrischika, Dhanu, Makara, Kumbha and Meena. Your Rashi is the sidereal sign of your Moon — not your Western star sign, which is the tropical Sun sign and often a different sign altogether.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock computes every rashifal" white>
        <p>Nothing here is a pre-written paragraph. For each day, the engine finds the real sidereal position of all nine grahas (Lahiri ayanamsa) and counts each one as a house from your Moon sign: house = (planet’s sign − Moon sign) + 1. Classical gochar rules then say where each planet is supportive and where it calls for care — for example, Saturn is traditionally supportive in the 3rd, 6th and 11th from the Moon, and Jupiter in the 2nd, 5th, 7th, 9th and 11th.</p>
        <p>Slow planets (Saturn, Jupiter, Rahu, Ketu) carry more weight than fast ones, so readings are graded strong, moderate or mild. Daily pages are recomputed for every India date; weekly, monthly and yearly pages track the planets across the whole period, including sign changes. Positions are rigorously computed and cross-verified against the Swiss Ephemeris and Drik Panchang’s transit times — see <Link to="/accuracy/" className="underline">How we check accuracy</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title={`Sample: the slow planets on ${S.refLabel}`}>
        <p>On {S.refLabel}, Jupiter is in {signEn(G.signs.Jupiter)}, Saturn in {signEn(G.signs.Saturn)} and Rahu in {signEn(G.signs.Rahu)}. Here is how the same sky reads from each Moon sign — the backbone of every yearly rashifal.</p>
        <SampleCard testId="rashifal-sample" title={`Jupiter and Saturn counted from each Moon sign — ${S.refLabel}`} note="Positions computed by the BornClock engine (Lahiri ayanamsa); tones from the classical gochar table the rashifal uses.">
          <SampleTable caption="Jupiter and Saturn transit house by Moon sign" head={['Moon sign', 'Jupiter (house — tone)', 'Saturn (house — tone)']} rows={rows} />
        </SampleCard>
        <p><strong>How to read it.</strong> The same planet lands in a different house for each Moon sign, which is why two Rashis can have very different years. On this date Jupiter is classically supportive for {jupGood.map(s => signEn(s)).join(', ')}. Saturn in the 12th, 1st or 2nd from the Moon is Sade Sati; in the 4th or 8th it is Dhaiya — the rows marked “handle with care” for Saturn include these. A full reading layers the faster planets on top for each day and week.</p>
      </GuideSection>

      <GuideSection eyebrow="Reading guide" title="Getting the most from your rashifal" white>
        <Bullets items={[
          ['Use the right sign', <>your Rashi is your Moon sign. Not sure? Find it with the <Link to="/moon-sign/" className="underline">moon sign calculator</Link> or your <Link to="/kundali/" className="underline">free Kundli</Link>.</>],
          ['Match the period to the decision', 'today and tomorrow for timing small things; week and month for planning; year for the big picture.'],
          ['Read the grade, not just the tone', 'a “mild” caution is a light note; a “strong” supportive transit from Jupiter is worth using.'],
          ['Look at your Dasha too', <>a supportive transit during a supportive <Link to="/dasha-calculator/" className="underline">Dasha</Link> is stronger than either alone.</>],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Rashifal terms explained">
        <TermList items={[
          ['Gochar', 'Transit — where the planets are now, read from your Moon sign.'],
          ['Rashi', 'Your Moon sign, the reference point for every rashifal.'],
          ['Chandrabala', 'Whether today’s Moon is in a supportive house from your Moon.'],
          ['Tarabala', 'Whether today’s Nakshatra suits your birth star.'],
          ['Chandrashtama', 'The Moon in the 8th from your Moon — keep big starts for other days.'],
          ['Sade Sati / Dhaiya', 'Saturn in the 12th/1st/2nd, or the 4th/8th, from your Moon.'],
          ['Rahu Kaal', 'A daily slot traditionally avoided for new beginnings.'],
          ['Choghadiya', 'Eight day and eight night slots graded for auspiciousness.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Rashifal myths" white>
        <Bullets items={[
          ['“A rashifal is the same text for everyone, every year.”', 'This one is computed from the actual sky for each date and each Moon sign.'],
          ['“A difficult day means something bad will happen.”', 'It suggests where to be patient or careful; it never predicts a specific event.'],
          ['“Sun-sign and Moon-sign horoscopes are interchangeable.”', 'They use different planets and different zodiacs, so they rarely agree.'],
        ]} />
        <p>Read the year ahead: <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link> · <Link to="/horoscope-2027/" className="underline">Horoscope 2027</Link> · <Link to="/hi/rashifal-2027/" className="underline" lang="hi">राशिफल 2027</Link>.</p>
      </GuideSection>

      <GuideFAQ items={[...baseFaq, ...RASHIFAL_EXTRA_FAQ]} title="Rashifal FAQ" />
      <RelatedLinks title="Related tools" links={related(['hiRashifal', 'moonSign', 'kundali', 'sadeSati', 'panchang', 'dasha'])} />
    </Guide>
  );
}
