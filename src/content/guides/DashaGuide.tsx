/**
 * B14 — the guide below the /dasha-calculator tool. Sample numbers come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, fmtDate, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { COUNTS, TESTED_MONTH } from '@/lib/accuracy/evidence';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn } from './shared';

const D = S.dasha;
const C = D.chart;
/** Classical Vimshottari order and years (BPHS). */
const VIMSHOTTARI: Array<[string, number]> = [['Ketu', 7], ['Venus', 20], ['Sun', 6], ['Moon', 10], ['Mars', 7], ['Rahu', 18], ['Jupiter', 16], ['Saturn', 19], ['Mercury', 17]];

const THEMES: Array<[string, string]> = [
  ['Sun', 'authority, recognition, father figures and confidence.'],
  ['Moon', 'home, emotions, mother, public life and nourishment.'],
  ['Mars', 'energy, courage, property, competition and getting things started.'],
  ['Rahu', 'ambition, the new and unfamiliar, foreign links and fast change.'],
  ['Jupiter', 'learning, guidance, children, wisdom and growth.'],
  ['Saturn', 'hard work, structure, responsibility and lasting results.'],
  ['Mercury', 'study, trade, communication, writing and skills.'],
  ['Ketu', 'reflection, research, letting go and spiritual interest.'],
  ['Venus', 'relationships, comfort, art, beauty and enjoyment.'],
];

export const DASHA_EXTRA_FAQ: FaqItem[] = [
  { question: 'How is the first Mahadasha decided?', answer: 'By your birth Nakshatra. Each of the 27 Nakshatras is ruled by one of the nine Dasha lords, and your life’s sequence starts with the lord of the Nakshatra the Moon was in at birth.' },
  { question: 'What is the Dasha balance at birth?', answer: 'The part of the first Mahadasha still left when you were born. It is proportional to how much of the birth Nakshatra the Moon still had to travel — so a Moon early in its Nakshatra gives a long first period, and a Moon near the end a short one.' },
  { question: 'How long is each Antardasha?', answer: 'Mahadasha years × Antardasha lord’s years ÷ 120. For example, Jupiter’s Antardasha inside a Saturn Mahadasha lasts 19 × 16 ÷ 120 ≈ 2.5 years.' },
  { question: 'Is Rahu or Saturn Mahadasha always difficult?', answer: 'No. How any Dasha feels depends on where that planet sits in your chart, which houses it rules and its strength. Saturn and Rahu periods are often the ones in which people build careers or break new ground.' },
  { question: 'Why do my Dasha dates differ slightly from another site?', answer: 'Small differences come from the year length used (BornClock uses 365.25 days), the ayanamsa, or the exact Moon degree. A difference of a few days at Antardasha level is normal; Mahadasha lords should match.' },
  { question: 'What is Dasha sandhi?', answer: 'The junction between two Mahadashas — the months around the change, when the old period’s themes wind down and the new one’s begin. Tradition treats it as a time for steady, unhurried decisions.' },
];

export function DashaGuide({ baseFaq }: { baseFaq: FaqItem[] }) {
  const meta = GUIDE_META['/dasha-calculator'];
  return (
    <Guide id="dasha">
      <GuideWebApp name="Vimshottari Dasha Calculator" description={meta.description} path="/dasha-calculator" />
      <GuideHowTo
        name="How to find your Mahadasha and Antardasha"
        description="Calculate your Vimshottari Dasha timeline with real dates from your birth details."
        steps={[
          { name: 'Enter your birth details', text: 'Date, time and place of birth — the time refines the Moon’s exact degree.' },
          { name: 'See the running period', text: 'The current Mahadasha and Antardasha are shown with their start and end dates.' },
          { name: 'Open the timeline', text: 'Expand each Mahadasha to see its nine Antardashas and the deeper levels.' },
          { name: 'Read the themes', text: 'Relate each period’s lord to where that planet sits in your Kundli.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is a Dasha, and what does a Dasha calculator show?">
        <p>A Dasha is a planetary period — a chapter of life in which one planet’s themes are emphasised. The most widely used system, Vimshottari Dasha, divides a 120-year cycle between the nine grahas in a fixed order. The big chapters are Mahadashas; each is split into nine Antardashas (sub-periods), and those split again into Pratyantardashas and finer levels.</p>
        <p>A Dasha calculator turns your birth details into that timeline with real dates, so you can see which chapter you are in, when it began, and what comes next. It is the main timing tool of Vedic astrology, used alongside transits such as Sade Sati.</p>
        <SampleTable caption="Vimshottari Mahadasha order and length" head={['Mahadasha', 'Years']} rows={[...VIMSHOTTARI.map(([p, y]) => [p, y]), [<strong key="t">Total</strong>, <strong key="n">{VIMSHOTTARI.reduce((s, [, y]) => s + y, 0)}</strong>]]} />
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock calculates your Dasha" white>
        <p>Everything starts from the Moon. Your chart is computed from your birth date, time and place with the Lahiri ayanamsa, and the Moon’s exact degree gives your birth Nakshatra. That Nakshatra’s lord opens your sequence, and the balance of its period is set by how far the Moon still had to travel through the Nakshatra. From there the periods follow the classical order, with each Antardasha in proportion to its lord’s years and a 365.25-day year throughout.</p>
        <p>The timeline is rigorously computed and cross-verified: in our tests ({TESTED_MONTH}) the current Mahadasha and Antardasha matched for all {COUNTS.kundaliBirths} test births, with Antardasha start dates within about {COUNTS.dashaMaxHours} hours of the reference. More on <Link to="/accuracy/" className="underline">how we check accuracy</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="A sample Dasha timeline">
        <p>For an illustrative birth (not a real person) — {C.birth.date}, {C.birth.time}, {C.birth.place} — the engine places the Moon in {signEn(C.rashi)} at {C.moonDegree}, in {C.nakshatra.name} Nakshatra (pada {C.nakshatra.pada}), which is ruled by {C.nakshatra.lord}. So life begins in a {D.startLord} Mahadasha with a balance of {D.balanceYearsAtBirth} years at birth.</p>
        <SampleCard testId="dasha-sample" title="Mahadashas from birth" note={`Computed by the BornClock engine (Lahiri ayanamsa, 365.25-day years). The first period began before birth; only its remaining balance is lived.`}>
          <SampleTable caption="Sample Mahadasha timeline" head={['Mahadasha', 'From', 'To']} rows={D.mahadashas.map(m => [m.lord, fmtDate(m.start), fmtDate(m.end)])} />
        </SampleCard>
        {C.currentDasha && (
          <SampleCard testId="dasha-sample-ad" title={`Antardashas inside the ${C.currentDasha.mahadasha} Mahadasha`} note={`On ${S.refLabel} the running period is ${C.currentDasha.mahadasha}–${C.currentDasha.antardasha}.`}>
            <SampleTable caption="Antardashas of the current Mahadasha" head={['Antardasha', 'From', 'To']} rows={D.currentAntardashas.map(a => [a.lord === C.currentDasha!.antardasha ? <strong key={a.lord}>{a.lord} (running)</strong> : a.lord, fmtDate(a.start), fmtDate(a.end)])} />
          </SampleCard>
        )}
        <p><strong>How to read it.</strong> Each Mahadasha is a long chapter; its first Antardasha always shares its lord, and the rest follow the same nine-planet order. {C.currentDasha && <>On {S.refLabel} this person is in {C.currentDasha.mahadasha} Mahadasha and {C.currentDasha.antardasha} Antardasha (to {fmtDate(C.currentDasha.antardashaEnd)}): the {C.currentDasha.mahadasha} themes set the backdrop, while {C.currentDasha.antardasha} colours these particular months.</>} To make it personal, look at where each lord sits in the Kundli — the houses it occupies and rules show which areas of life the period touches.</p>
      </GuideSection>

      <GuideSection eyebrow="Themes" title="What each Mahadasha traditionally emphasises" white>
        <Bullets items={THEMES.map(([p, t]) => [`${p} Mahadasha`, t])} />
        <p>These are the natural meanings of each planet. In your chart they are modified by the planet’s sign, house and strength — the same Dasha can be gentle for one person and demanding for another.</p>
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Dasha terms in plain language">
        <TermList items={[
          ['Mahadasha', 'The main planetary period — 6 to 20 years depending on the planet.'],
          ['Antardasha (Bhukti)', 'A sub-period inside a Mahadasha — months to a few years.'],
          ['Pratyantardasha', 'The third level — weeks to months.'],
          ['Sookshma and Prana', 'Finer levels of days and hours; very birth-time sensitive.'],
          ['Dasha balance', 'What remains of the first Mahadasha at birth.'],
          ['Dasha lord', 'The planet whose period it is.'],
          ['Dasha sandhi', 'The junction between two Mahadashas.'],
          ['Yogini Dasha', 'A second, 36-year timing system shown on the full Kundli page.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="What helps" title="Making the most of a demanding period" white>
        <p>The tradition’s first advice in any period is to work with its planet’s nature: discipline in Saturn, study and communication in Mercury, generosity and learning in Jupiter, calm and routine in Rahu, reflection in Ketu. Free practices — the planet’s mantra on its weekday, and seva that matches its themes — come first. Gemstones are not a default fix for a Dasha and are considered only after a full-chart check. Planet-by-planet practices: <Link to="/remedies/shani-saturn/" className="underline">Saturn</Link> · <Link to="/remedies/rahu/" className="underline">Rahu</Link> · <Link to="/remedies/ketu/" className="underline">Ketu</Link> · <Link to="/remedies/" className="underline">all remedies</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Dasha myths">
        <Bullets items={[
          ['“A Dasha tells you the exact date something will happen.”', 'It shows periods when certain themes are active; events depend on many factors, so dates are always windows.'],
          ['“Saturn and Rahu Dashas are bad, Jupiter and Venus are good.”', 'Placement decides. A well-placed Saturn can give the most productive years of a life.'],
          ['“People born the same year share a Dasha.”', 'The Moon changes Nakshatra roughly every day, so even siblings born a day apart can start in different periods.'],
        ]} />
        <p>Combine your Dasha with the year’s transits in <Link to="/horoscope-2027/" className="underline">Horoscope 2027</Link> and <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link>, or see everything together on your <Link to="/kundali/" className="underline">full Kundli</Link>.</p>
      </GuideSection>

      <GuideFAQ items={[...baseFaq, ...DASHA_EXTRA_FAQ]} title="Dasha calculator FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'sadeSati', 'nakshatra', 'moonSign', 'kaalSarp', 'remedies'])} />
    </Guide>
  );
}
