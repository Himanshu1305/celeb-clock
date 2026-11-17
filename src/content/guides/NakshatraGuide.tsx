/**
 * B14 — the guide below the /nakshatra index. The worked example uses an engine Moon
 * position from src/data/guideSamples.json; the arithmetic is shown from that number.
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { NAK_ORDER, nakLord, DASHA_LORDS } from '@/lib/vedic/nakshatraAttributes';
import { related, signEn } from './shared';

const C = S.dasha.chart;
const SPAN = 360 / 27;
const lon = C.moonLongitude;
const idx = Math.floor(lon / SPAN);
const into = lon - idx * SPAN;
const pada = Math.floor(into / (SPAN / 4)) + 1;
const deg = (x: number) => { const d = Math.floor(x); let m = Math.round((x - d) * 60); let dd = d; if (m === 60) { dd += 1; m = 0; } return `${dd}°${String(m).padStart(2, '0')}′`; };

export const NAKSHATRA_EXTRA_FAQ: FaqItem[] = [
  { question: 'How do I find my Nakshatra by date of birth?', answer: 'Enter your birth date, time and place in the free Kundli or the moon sign calculator. The Moon’s sidereal degree at birth, divided into 27 equal parts of 13°20′, gives your Nakshatra; the quarter within it gives the pada.' },
  { question: 'Can I find my Nakshatra without a birth time?', answer: 'Often not with certainty. The Moon moves through a Nakshatra in about a day, so on most dates two Nakshatras are possible. A date-only tool shows both; your birth time decides.' },
  { question: 'What is a Nakshatra pada?', answer: 'Each Nakshatra is split into four padas (quarters) of 3°20′. There are 108 padas in all, each with a traditional syllable used for naming and a Navamsa sign.' },
  { question: 'Who rules my Nakshatra?', answer: 'Each Nakshatra has a planetary lord from the Vimshottari Dasha order — Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn and Mercury — repeating three times around the zodiac. Your birth Nakshatra’s lord opens your Dasha sequence.' },
  { question: 'Is my Nakshatra the same as my Rashi?', answer: 'No. The Rashi is the Moon’s sign (12 divisions); the Nakshatra is the Moon’s lunar mansion (27 divisions). Each sign holds two and a quarter Nakshatras.' },
  { question: 'Are some Nakshatras unlucky?', answer: 'No Nakshatra is bad. A few junction (gandanta) stars such as Mula and Ashlesha traditionally call for a simple shanti prayer, and that is all.' },
];

export function NakshatraGuide({ baseFaq }: { baseFaq: FaqItem[] }) {
  const lordRows = DASHA_LORDS.map((lord, i) => [lord, [0, 9, 18].map(o => NAK_ORDER[i + o]).join(' · ')]);
  return (
    <Guide id="nakshatra">
      <GuideHowTo
        name="How to find your Nakshatra (birth star)"
        description="Find your birth Nakshatra and pada from your birth details."
        steps={[
          { name: 'Get your Moon’s sidereal degree', text: 'Generate your free Kundli with birth date, time and place.' },
          { name: 'Divide the zodiac into 27', text: 'Each Nakshatra spans 13°20′, starting from 0° Aries (Ashwini).' },
          { name: 'Find the quarter', text: 'Each Nakshatra has four padas of 3°20′; the Moon’s position inside it gives your pada.' },
          { name: 'Read its attributes', text: 'Open your Nakshatra’s page for its lord, deity, Gana, Yoni, Nadi and name syllables.' },
        ]}
      />

      <GuideSection eyebrow="Nakshatra finder" title="How your birth Nakshatra is found">
        <p>The zodiac’s 360° is divided into 27 equal Nakshatras of 13°20′ each, starting from Ashwini at the beginning of Aries (Mesha). Your birth Nakshatra — your janma nakshatra or birth star — is simply the one the Moon was in at the moment you were born, measured in the sidereal zodiac with the Lahiri ayanamsa. Each Nakshatra is then split into four padas of 3°20′, giving 108 padas in all.</p>
        <p>Because the Moon covers a whole Nakshatra in roughly a day, the birth time matters: many dates contain two Nakshatras. The quickest way to find yours is the <Link to="/kundali/" className="underline">free Kundli</Link>, which shows the Nakshatra and pada from your exact birth details; the <Link to="/moon-sign/" className="underline">moon sign calculator</Link> works from the date alone and tells you when two are possible.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="Finding a Nakshatra step by step" white>
        <SampleCard testId="nakshatra-sample" title={`Illustrative birth: ${C.birth.date}, ${C.birth.time}, ${C.birth.place}`} note="Moon position computed by the BornClock engine (Lahiri ayanamsa); the steps show the arithmetic.">
          <SampleTable caption="Nakshatra arithmetic" head={['Step', 'Value']} rows={[
            ['Moon’s sidereal position', `${signEn(C.rashi)} ${C.moonDegree} = ${deg(lon)} from 0° Aries`],
            ['÷ 13°20′ per Nakshatra', `${(lon / SPAN).toFixed(2)} → Nakshatra no. ${idx + 1}`],
            ['Nakshatra', `${NAK_ORDER[idx]} (lord ${nakLord(idx)})`],
            ['Distance into it', `${deg(into)} → pada ${pada} (each pada 3°20′)`],
          ]} />
        </SampleCard>
        <p>The engine’s own result for this chart is {C.nakshatra.name}, pada {C.nakshatra.pada}, ruled by {C.nakshatra.lord} — the same as the hand calculation. Because {C.nakshatra.lord} rules this birth star, this person’s Vimshottari Dasha begins with a {C.nakshatra.lord} period.</p>
      </GuideSection>

      <GuideSection eyebrow="Ruling planets" title="The nine Nakshatra lords">
        <p>The lords repeat in the Vimshottari order three times around the zodiac, so each planet rules three Nakshatras, nine apart:</p>
        <SampleTable caption="Nakshatras by ruling planet" head={['Lord', 'Nakshatras']} rows={lordRows} />
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="What each Nakshatra attribute means" white>
        <TermList items={[
          ['Lord (swami)', 'The ruling planet — sets the Dasha sequence for anyone born in it.'],
          ['Deity (devata)', 'The presiding deity, read as the Nakshatra’s spirit.'],
          ['Symbol', 'A traditional image that sums up its nature.'],
          ['Gana', 'Deva, Manushya or Rakshasa temperament — used in matching.'],
          ['Yoni', 'An animal symbol for instinct — used in matching.'],
          ['Nadi', 'Adi, Madhya or Antya group — the heaviest matching koota.'],
          ['Pada', 'A quarter of 3°20′; each has a naming syllable.'],
          ['Gandanta', 'The junctions between water and fire signs — Ashlesha–Magha, Jyeshtha–Mula, Revati–Ashwini.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Uses" title="Where your Nakshatra is used">
        <Bullets items={[
          ['Naming', <>the pada syllable gives the traditional first sound of a name — see <Link to="/baby-names/" className="underline">baby names by Nakshatra</Link>.</>],
          ['Kundli matching', <>Tara, Yoni, Gana and Nadi all come from the two birth stars — <Link to="/kundali-match/" className="underline">Kundli matching</Link>.</>],
          ['Dasha timing', <>the lord of your Nakshatra starts your Vimshottari sequence — <Link to="/dasha-calculator/" className="underline">Dasha calculator</Link>.</>],
          ['Daily timing', <>today’s Nakshatra and Tarabala appear in the <Link to="/panchang/" className="underline">Panchang</Link>.</>],
          ['The year ahead', <>yearly readings by Moon sign in <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link>.</>],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Nakshatra myths" white>
        <Bullets items={[
          ['“Some birth stars are unlucky.”', 'Every Nakshatra has gifts. Junction stars only call for a simple, traditional shanti.'],
          ['“Nakshatra and Rashi are the same.”', 'The Rashi is the 30° sign; the Nakshatra is a 13°20′ mansion within it.'],
          ['“You can know your Nakshatra from the date alone.”', 'Often two are possible on one date; the birth time settles it.'],
        ]} />
      </GuideSection>

      <GuideFAQ items={[...baseFaq, ...NAKSHATRA_EXTRA_FAQ]} title="Nakshatra FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'moonSign', 'match', 'dasha', 'child', 'panchang'])} />
    </Guide>
  );
}
