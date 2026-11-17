/**
 * B14 — the guide below the /sade-sati tool. Sample numbers come from
 * src/data/guideSamples.json (engine output, re-checked by a test).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, fmtDate, type FaqItem } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { COUNTS, TESTED_MONTH } from '@/lib/accuracy/evidence';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn } from './shared';

const SS = S.sadeSati;
const PHASE = ['', 'Rising (12th)', 'Peak (1st)', 'Setting (2nd)'];
const statusText = (r: (typeof SS.allSigns)[number]) =>
  r.kind === 'sadeSati' ? `Sade Sati — ${PHASE[r.phase ?? 0]}`
    : r.kind === 'dhaiya' ? `Dhaiya — ${r.type === 'kantaka' ? 'Kantaka (4th)' : 'Ashtama (8th)'}`
      : r.kind === 'sadeSatiPaused' ? 'Sade Sati (retrograde pause)'
        : r.kind === 'dhaiyaPaused' ? 'Dhaiya (retrograde pause)' : 'Neither';
const inSS = SS.allSigns.filter(r => r.kind === 'sadeSati').map(r => r.sign);

export const SADESATI_FAQ: FaqItem[] = [
  { question: 'What is Shani Sade Sati?', answer: 'Sade Sati (“seven and a half”) is the roughly 7½-year period when Saturn (Shani) moves through the sign before your Moon sign, your Moon sign itself, and the sign after it — about 2½ years in each.' },
  { question: 'How do I know if Sade Sati is running for me?', answer: 'Enter your birth details above. The calculator finds your Moon sign from your chart and compares it with Saturn’s real position today, then shows the phase and the start and end dates of your current or next cycle.' },
  { question: 'How often does Sade Sati come?', answer: 'About once every 30 years, because Saturn takes roughly 29½ years to go round the zodiac. Most people meet it two or three times in a lifetime.' },
  { question: 'Which phase of Sade Sati is the hardest?', answer: 'Tradition often names the middle (peak) phase, when Saturn passes over the Moon sign itself, as the most demanding. In practice it depends on your whole chart — Saturn’s strength, your Lagna and your running Dasha — so the same phase feels very different for different people.' },
  { question: 'Is Sade Sati always bad?', answer: 'No. It is a season of slower, steadier work — responsibility, structure and patience. Many people look back on it as the time they built something lasting. It is especially mild when Saturn is well placed or is a yogakaraka for your Lagna (Taurus and Libra Lagna).' },
  { question: 'What is Dhaiya (small Panoti)?', answer: 'Dhaiya is Saturn’s 2½-year stay in the 4th sign (Kantaka Shani) or the 8th sign (Ashtama Shani) from your Moon. The calculator checks it along with Sade Sati.' },
  { question: 'Why do my dates differ from another website?', answer: 'Saturn sometimes turns retrograde and slips back into the previous sign for a few months. BornClock keeps those months inside one cycle as a “pause” rather than ending and restarting it, and uses the real ingress moments. A site that uses a fixed table or a different ayanamsa can show different dates.' },
  { question: 'Do I need my birth time for Sade Sati?', answer: 'Usually only the date matters, because Sade Sati depends on the Moon sign. But if the Moon changed sign on your birth day, the time decides which sign — and so which Sade Sati dates — apply to you.' },
  { question: 'What are simple remedies for Sade Sati?', answer: 'Free practices come first: keep steady routines and finish what you start, recite Hanuman Chalisa or a Shani mantra on Saturdays, and serve elders, workers or people in need. Blue Sapphire is not a general Sade Sati remedy and should never be worn without a full-chart check.' },
];

export function SadeSatiGuide() {
  const meta = GUIDE_META['/sade-sati'];
  return (
    <Guide id="sade-sati">
      <GuideWebApp name="Sade Sati Calculator" description={meta.description} path="/sade-sati" />
      <GuideHowTo
        name="How to check your Sade Sati dates"
        description="Find whether Shani’s Sade Sati or Dhaiya is active for your Moon sign, and its real start and end dates."
        steps={[
          { name: 'Enter your birth details', text: 'Date, time and place of birth, so your Moon sign is exact.' },
          { name: 'Check the status', text: 'See whether Sade Sati or Dhaiya is active today and which phase is running.' },
          { name: 'Read the cycle dates', text: 'Note the start and end of the current or next cycle, including any retrograde pauses.' },
          { name: 'Use the Moon-sign table', text: 'Without a birth time, look up your Moon sign’s dates in the 1950–2060 table.' },
        ]}
      />

      <GuideSection eyebrow="The basics" title="What is Sade Sati, in plain language?">
        <p>Saturn — Shani — is the slowest of the visible planets, spending about two and a half years in each sign. Sade Sati is the stretch when Saturn crosses three signs in a row around your Moon sign: the sign just before it, the Moon sign itself, and the sign just after it. Three signs at roughly 2½ years each make the famous “seven and a half” years.</p>
        <p>Because it is measured from the Moon — the planet of the mind in Vedic astrology — the tradition reads Sade Sati as a period that asks for emotional steadiness, patience and honest effort. It is a timing indicator, not a sentence, and everyone experiences it two or three times in a lifetime.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock finds your Sade Sati dates" white>
        <p>Your Moon sign comes from your full birth chart, calculated with the Lahiri ayanamsa. The calculator then tracks Saturn’s real sidereal position across the decades, refining every moment Saturn enters or leaves a sign to within about an hour. A cycle runs from Saturn’s first entry into the 12th sign from your Moon to its final exit from the 2nd; if a retrograde loop takes Saturn briefly back out, that is shown as a pause inside the same cycle.</p>
        <p>The dates are rigorously computed and cross-verified. In our tests ({TESTED_MONTH}) the Sade Sati status matched Swiss Ephemeris Saturn positions for all {COUNTS.kundaliBirths} test births, and Saturn’s sign-change moments agreed with Drik Panchang’s transit pages to within about 10 minutes. See <Link to="/accuracy/" className="underline">How we check accuracy</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="A sample Sade Sati result">
        <p>For an illustrative birth (not a real person) with the Moon in {signEn(SS.moonSign)}, the engine gives these cycles. On {S.refLabel} Saturn is in {signEn(SS.saturnSign)}.</p>
        <SampleCard testId="sadesati-sample" title={`Moon sign ${signEn(SS.moonSign)} — status on ${S.refLabel}: ${SS.active ? `Sade Sati, ${SS.phase}` : SS.dhaiya ? `Dhaiya (${SS.dhaiya})` : 'not active'}`}
          note="Computed by the BornClock engine from Saturn’s real transit (Lahiri ayanamsa). Dates are UTC days.">
          <SampleTable caption="Sade Sati cycles for the sample Moon sign" head={['Cycle', 'Starts', 'Ends', 'Retrograde pauses']} rows={[
            ...(SS.previousCycle ? [['Previous', fmtDate(SS.previousCycle.start), fmtDate(SS.previousCycle.end), SS.previousCycle.pauses]] : []),
            ...(SS.currentCycle ? [['Current', fmtDate(SS.currentCycle.start), fmtDate(SS.currentCycle.end), SS.currentCycle.pauses]] : []),
            ...(SS.nextCycle ? [['Next', fmtDate(SS.nextCycle.start), fmtDate(SS.nextCycle.end), SS.nextCycle.pauses]] : []),
          ]} />
        </SampleCard>
        <p><strong>How to read it.</strong> The current cycle started when Saturn first entered the sign before {SS.moonSign} and ends when it finally leaves the sign after it. The “pauses” are the short retrograde spells when Saturn stepped back out of the three signs; the cycle is not over during a pause, it simply resumes. Notice that cycles come roughly 30 years apart — the next one for this Moon sign is decades away.</p>
        <SampleCard testId="sadesati-all-signs" title={`Where every Moon sign stands on ${S.refLabel}`} note="Saturn in one sign puts three Moon signs in Sade Sati and two in Dhaiya at the same time.">
          <SampleTable caption="Sade Sati and Dhaiya status for all 12 Moon signs" head={['Moon sign', 'Status']} rows={SS.allSigns.map(r => [signEn(r.sign), statusText(r)])} />
        </SampleCard>
        <p>So on that date the Moon signs in Sade Sati are {inSS.map(signEn).join(', ')}. Find your own sign’s full list of dates from 1950 to 2060 on the per-sign pages, for example <Link to="/sade-sati/meen/" className="underline">Sade Sati for Meena (Pisces) Moon</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Phases" title="The three phases of Sade Sati" white>
        <Bullets items={[
          ['Rising phase — Saturn in the 12th from the Moon', 'traditionally linked with expenses, travel, sleep and letting go of what no longer fits. A good time to simplify and plan.'],
          ['Peak phase — Saturn over the Moon sign', 'the most personal stretch: responsibilities feel heavier and results come slowly, so routine and self-care matter most.'],
          ['Setting phase — Saturn in the 2nd from the Moon', 'attention turns to family, speech and savings. Many people consolidate what they built in the earlier phases.'],
        ]} />
        <p>These are tendencies the tradition associates with each phase, not events that must happen. Your Dasha, your Lagna and Saturn’s strength in your own chart decide how strongly any of them is felt.</p>
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Sade Sati terms explained">
        <TermList items={[
          ['Shani', 'Saturn — the planet of time, discipline, effort and fairness.'],
          ['Sade Sati', '“Seven and a half” — Saturn in the 12th, 1st and 2nd signs from your Moon.'],
          ['Dhaiya / small Panoti', 'Saturn’s 2½ years in the 4th (Kantaka) or 8th (Ashtama) sign from your Moon.'],
          ['Moon sign (Rashi)', 'The sidereal sign of the Moon at birth — the reference point for Sade Sati.'],
          ['Gochar', 'Transit: where a planet is today, read against your birth chart.'],
          ['Retrograde pause', 'A few months when Saturn backs out of the three signs before returning.'],
          ['Yogakaraka', 'A planet that is especially helpful for a Lagna — Saturn is one for Taurus and Libra Lagna.'],
          ['Ingress', 'The moment a planet enters a new sign.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="What helps" title="Free-first remedies, without fear" white>
        <p>The remedy that best matches Saturn is Saturn’s own discipline: keep a steady routine, finish what you start, be patient with slow results, and look after your sleep and health with your doctor’s advice. Traditional free practices include reciting Hanuman Chalisa, the Shani mantra or the Dasharatha Shani stotra on Saturdays, and seva — helping elders, workers or anyone in need. A small daan of sesame, black urad or mustard oil on a Saturday is a common optional practice.</p>
        <p>What not to do: buy an expensive stone or ritual out of fear. Blue Sapphire (Neelam) is not a general Sade Sati remedy; it is considered only when your full chart favours Saturn, after an astrologer’s check. Full, sourced list: <Link to="/remedies/sade-sati/" className="underline">Sade Sati remedies</Link> · <Link to="/remedies/shani-dhaiya/" className="underline">Dhaiya remedies</Link>.</p>
      </GuideSection>

      <GuideSection eyebrow="Myths" title="Sade Sati myths">
        <Bullets items={[
          ['“Sade Sati ruins everything for 7½ years.”', 'It is a season of effort, not a ban on good things. Promotions, marriages and new ventures happen during Sade Sati all the time.'],
          ['“Everyone born in the same year has the same Sade Sati.”', 'It depends on the Moon sign, which changes every two to three days — not on the birth year.'],
          ['“You must wear Neelam to survive it.”', 'No classical rule says so, and a stone that does not suit the chart is the one thing traditional astrologers warn against.'],
          ['“Dates are fixed in a table.”', 'Real Saturn ingresses vary with retrograde motion; this calculator uses them directly.'],
        ]} />
        <p>Want the wider picture for the year? Read <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link> or <Link to="/hi/rashifal-2027/" className="underline" lang="hi">राशिफल 2027</Link>, which also show Saturn’s transit for every Moon sign.</p>
      </GuideSection>

      <GuideFAQ items={SADESATI_FAQ} title="Sade Sati FAQ" />
      <RelatedLinks title="Related tools" links={related(['kundali', 'dasha', 'moonSign', 'rashifal', 'hiRashifal', 'remedies'])} />
    </Guide>
  );
}
