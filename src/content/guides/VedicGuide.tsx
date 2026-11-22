/**
 * B14 — extra explanatory sections for the /vedic-astrology hub (above its FAQ).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleTable, RelatedLinks } from '@/components/guide/Guide';
import { related } from './shared';

/** Extra hub Q&As — appended to the page's own FAQ list (one FAQPage). */
export const VEDIC_EXTRA_FAQ: Array<[string, string]> = [
  ['What is the difference between Vedic and Western astrology?', 'Vedic astrology (Jyotish) measures the signs against the fixed stars — the sidereal zodiac — and leans on the Moon, the 27 Nakshatras and Dasha periods. Western astrology measures signs against the seasons — the tropical zodiac — and leans on the Sun sign. Today the two zodiacs are about 24° apart.'],
  ['Where should a beginner start?', 'Generate your free Kundli first. It gives your Lagna, Moon sign and Nakshatra, which every other tool — rashifal, Sade Sati, Dasha, matching — builds on.'],
  ['Which ayanamsa does BornClock use?', 'Lahiri (Chitrapaksha), the standard adopted in India and the default in most Indian astrology software.'],
];

export function VedicGuide() {
  return (
    <Guide id="vedic-astrology">
      <GuideSection eyebrow="In plain language" title="What Vedic astrology actually looks at">
        <p>Vedic astrology — Jyotish, “the science of light” — reads a birth chart cast in the sidereal zodiac, the one tied to the stars rather than the seasons. It pays special attention to the Moon: the Moon sign (Rashi) and the Moon’s lunar mansion (Nakshatra) shape everything from your daily rashifal to Kundli matching. Its signature tool is timing: the Vimshottari Dasha system divides life into planetary periods, and transits (gochar) are read against them.</p>
        <p>A chart is only as good as its arithmetic, which is why BornClock’s charts are rigorously computed and cross-verified against the Swiss Ephemeris before any interpretation is offered — and why interpretations are written as tendencies and windows, never certainties.</p>
      </GuideSection>

      <GuideSection eyebrow="At a glance" title="Vedic vs Western astrology" white>
        <SampleTable caption="Vedic and Western astrology compared" head={['', 'Vedic (Jyotish)', 'Western']} rows={[
          ['Zodiac', 'Sidereal — fixed to the stars', 'Tropical — fixed to the seasons'],
          ['Main personal sign', 'Moon sign (Rashi) and Lagna', 'Sun sign'],
          ['Extra layer', '27 Nakshatras and their padas', 'Aspects between planets'],
          ['Timing', 'Dasha periods + transits', 'Transits and progressions'],
          ['Planets used', 'Seven visible planets + Rahu and Ketu', 'Includes Uranus, Neptune, Pluto'],
          ['Matching', 'Ashtakoota (36 gunas) / Porutham', 'Synastry'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Start here" title="A five-step path through your chart">
        <Bullets items={[
          ['Make your Kundli', <>your <Link to="/kundali/" className="underline">free Janam Kundli</Link> gives the Lagna, Rashi, Nakshatra and planets.</>],
          ['Know your birth star', <>read your Nakshatra’s meaning among <Link to="/nakshatra/" className="underline">the 27 Nakshatras</Link>.</>],
          ['See your timeline', <>open the <Link to="/dasha-calculator/" className="underline">Dasha calculator</Link> for your Mahadasha and Antardasha dates.</>],
          ['Check the classical patterns calmly', <><Link to="/manglik/" className="underline">Manglik</Link>, <Link to="/kaal-sarp-dosha/" className="underline">Kaal Sarp</Link> and <Link to="/sade-sati/" className="underline">Sade Sati</Link> — each with its cancellations.</>],
          ['Look at the year', <>read <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link>, <Link to="/horoscope-2027/" className="underline">Horoscope 2027</Link> or <Link to="/hi/rashifal-2027/" className="underline" lang="hi">राशिफल 2027</Link> for your Moon sign.</>],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Vocabulary" title="Twelve words that unlock Jyotish" white>
        <TermList items={[
          ['Jyotish', 'The Sanskrit name for Vedic astrology.'],
          ['Graha', 'A “planet” — nine in all, including Rahu and Ketu.'],
          ['Rashi', 'A 30° sign; also short for your Moon sign.'],
          ['Bhava', 'A house — one of twelve life areas.'],
          ['Nakshatra', 'A 13°20′ lunar mansion; there are 27.'],
          ['Lagna', 'The rising sign that anchors the houses.'],
          ['Dasha', 'A planetary period in your life’s timeline.'],
          ['Gochar', 'A transit — today’s sky read against your chart.'],
          ['Yoga', 'A named combination of planets, such as Gaja Kesari.'],
          ['Dosha', 'A classical pattern to be read with its cancellations.'],
          ['Muhurat', 'An auspicious moment chosen for a new beginning.'],
          ['Panchang', 'The five-part Hindu almanac: tithi, vara, nakshatra, yoga, karana.'],
        ]} />
        <p>Every term, with Hindi names: <Link to="/glossary/" className="underline">astrology glossary</Link>.</p>
      </GuideSection>

      <RelatedLinks title="Popular Vedic tools" links={related(['kundali', 'match', 'lalKitab', 'rashifal', 'panchang', 'moonSign', 'remedies'])} />
    </Guide>
  );
}
