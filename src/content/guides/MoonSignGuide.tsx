/**
 * B14 — the guide below the /moon-sign tool. Sample results come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, fmtDate, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { COUNTS } from '@/lib/accuracy/evidence';
import { related, signEn } from './shared';

const MS = S.moonSign;

export const MOONSIGN_EXTRA_FAQ: FaqItem[] = [
  { question: 'Can I find my moon sign without a birth time?', answer: 'Usually, yes. The Moon spends about two and a half days in each sign, so on most dates it stays in one sign all day. On a day when it changes sign, the calculator shows both possibilities and your birth time decides.' },
  { question: 'Why is my Vedic moon sign different from my Western moon sign?', answer: 'Vedic astrology measures signs against the stars (sidereal zodiac), Western astrology against the seasons (tropical zodiac). Today the two are about 24° apart, so the Vedic Moon is often one sign earlier than the Western one.' },
  { question: 'Is Rashi the same as moon sign?', answer: 'Yes. In Indian astrology “Rashi” or “Chandra Rashi” means the sign the Moon occupied at birth. It is the sign used for daily rashifal, Sade Sati and Kundli matching.' },
  { question: 'What is the difference between moon sign and Lagna?', answer: 'The moon sign is where the Moon was. The Lagna (ascendant) is the sign rising on the eastern horizon at birth; it changes about every two hours, so it always needs an exact birth time and place.' },
  { question: 'Which moon sign should I use for my horoscope?', answer: 'For Vedic rashifal, use your sidereal moon sign (Rashi). For Western horoscopes, people usually read their Sun sign.' },
];

export function MoonSignGuide({ faq }: { faq: FaqItem[] }) {
  const T = MS.timed;
  return (
    <Guide id="moon-sign">
      <GuideHowTo
        name="How to find your moon sign by date of birth"
        description="Find your Vedic moon sign (Rashi) and Nakshatra from your birth date."
        steps={[
          { name: 'Enter your date of birth', text: 'Day, month and year.' },
          { name: 'Find your sign', text: 'The calculator checks the Moon from the start to the end of that day (Indian Standard Time).' },
          { name: 'Check for a sign change', text: 'If two signs are shown, the Moon changed sign that day; your birth time decides.' },
          { name: 'Confirm with your Kundli', text: 'For the exact sign, Nakshatra and pada, generate your free Kundli with birth time and place.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="Three signs in every chart: Sun, Moon and Lagna">
        <p>Every birth chart has three “personal” signs. The <strong>Sun sign</strong> is where the Sun was — it changes about once a month and is what most Western horoscopes use. The <strong>moon sign</strong> is where the Moon was — it changes every two to three days and, in Indian astrology, is your Rashi. The <strong>Lagna</strong> is the sign rising in the east at your birth moment — it changes about every two hours.</p>
        <p>Vedic astrology leans on the Moon because it describes the mind: how you feel, react and settle. That is why your rashifal, your Sade Sati dates and Kundli matching all start from your moon sign rather than your Sun sign.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How this moon sign calculator works" white>
        <p>The calculator computes the Moon’s real sidereal position — the same Lahiri-ayanamsa engine as the full Kundli — at the very start and the very end of your birth date in Indian Standard Time. The Moon only moves forward, about 12° to 15° a day, so every sign between those two positions is possible. If it is one sign all day, that is your moon sign with certainty. If the Moon crossed into the next sign during the day, both are shown, and your birth time decides which one is yours.</p>
        <p>It is rigorously computed and cross-verified: for {COUNTS.celebrities.toLocaleString('en-IN')} people with a known birth date, the date-only result gave the same sign (or the same two signs on change days) as the Swiss Ephemeris. See <Link to="/accuracy/" className="underline">How we check accuracy</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked examples" title="Sample results: a clear day, a change day and a timed birth">
        <SampleCard testId="moonsign-sample" title="Moon sign from a date only (IST)" note="Computed by the BornClock engine (Lahiri ayanamsa), checking the Moon from 00:00 to 23:59 IST.">
          <SampleTable caption="Date-only moon sign examples" head={['Date', 'Moon sign(s) that day', 'Nakshatra(s)', 'Result']} rows={[MS.certainDay, MS.changeDay].filter(Boolean).map(d => [
            fmtDate(d!.date), d!.rashis.map(signEn).join(' → '), d!.nakshatras.join(' → '), d!.certain ? 'One sign all day — certain' : 'Sign changed — birth time decides',
          ])} />
        </SampleCard>
        <p>On {fmtDate(MS.certainDay?.date)} the Moon stayed in {MS.certainDay?.rashis.map(signEn).join('')} all day, so anyone born that day has that Rashi, even without a birth time{(MS.certainDay?.nakshatras.length ?? 0) > 1 ? ' — though the Nakshatra still changed during the day' : ''}. On {fmtDate(MS.changeDay?.date)} the Moon moved from {MS.changeDay?.rashis.map(signEn).join(' into ')}, so a birth time is needed to know which applies.</p>
        <SampleCard testId="moonsign-sample-timed" title={`With a birth time: ${T.date}, ${T.time}, ${T.place}`} note="Full chart computed by the BornClock engine for an illustrative birth (not a real person).">
          <SampleTable caption="Timed moon sign example" head={['Point', 'Result']} rows={[
            ['Moon sign (Rashi)', `${signEn(T.rashi)} ${T.moonDegree}`],
            ['Nakshatra', `${T.nakshatra.name}, pada ${T.nakshatra.pada}`],
            ['Sidereal Sun sign', signEn(T.sunSign)],
            ['Lagna', `${signEn(T.lagna.sign)} ${T.lagna.degree}`],
          ]} />
        </SampleCard>
        <p>This sample shows why the three signs differ: the Moon is in {T.rashi}, the Sun in {T.sunSign} and the Lagna in {T.lagna.sign}. Asked “what is your rashi?”, this person would answer {T.rashi}.</p>
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Moon sign terms in plain language" white>
        <TermList items={[
          ['Rashi / Chandra Rashi', 'The sidereal sign of the Moon at birth.'],
          ['Nakshatra', 'The Moon’s finer position: one of 27 segments of 13°20′.'],
          ['Sidereal zodiac', 'Signs fixed to the stars — used in Vedic astrology.'],
          ['Tropical zodiac', 'Signs fixed to the seasons — used in Western astrology.'],
          ['Ayanamsa', 'The gap between the two zodiacs, about 24° today (Lahiri).'],
          ['Chandrabala', 'How supportive today’s Moon is for your Rashi — used in daily timing.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Use it" title="What you can do with your moon sign">
        <Bullets items={[
          ['Read your rashifal', <>daily, weekly and yearly readings are by moon sign — see <Link to="/rashifal/" className="underline">Rashifal</Link> or <Link to="/hi/rashifal/" className="underline" lang="hi">आज का राशिफल</Link>.</>],
          ['Check Sade Sati', <>Saturn’s 7½-year transit is measured from the Moon — <Link to="/sade-sati/" className="underline">Sade Sati calculator</Link>.</>],
          ['Plan the year', <>see what 2027 holds for your Rashi in <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link> and <Link to="/horoscope-2027/" className="underline">Horoscope 2027</Link>.</>],
          ['Prepare for matching', <>Kundli matching compares two moon signs and birth stars — <Link to="/kundali-match/" className="underline">Kundli matching</Link>.</>],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Moon sign myths" white>
        <Bullets items={[
          ['“My moon sign is my star sign.”', 'Your everyday star sign is usually the Western Sun sign — a different planet in a different zodiac.'],
          ['“Everyone born on the same date has the same moon sign.”', 'Mostly, but on change days the birth time splits them — and the year matters too.'],
          ['“The moon sign alone tells you everything.”', 'It describes the emotional nature; the full Kundli adds the Lagna, houses and Dasha.'],
        ]} />
      </GuideSection>

      <GuideFAQ items={faq} title="Moon sign FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'nakshatra', 'rashiDob', 'rashifal', 'sadeSati', 'match'])} />
    </Guide>
  );
}
