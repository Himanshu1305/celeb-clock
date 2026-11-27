/**
 * /prashna — Prashna (horary) by the KP method (B21). Engine + stated rules: src/lib/vedic/prashna.ts.
 * Runs in the browser; the question text never leaves the page.
 */
import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { CityPicker } from '@/components/CityPicker';
import { TermTip } from '@/components/vedic/TermTip';
import { ToolFaq, ToolSources } from '@/components/tools/ToolFaq';
import type { SavedCity } from '@/services/savedProfile';
import { resolveForPlace } from '@/lib/timezone/clientBirth';
import { PRASHNA_TOPICS, type PrashnaTopic, type PrashnaResult } from '@/lib/vedic/prashna';

export const PRASHNA_PATH = '/prashna';
export const PRASHNA_META = {
  title: 'Prashna Kundli — Free KP Horary Answer (1–249) | BornClock',
  description: 'Ask one question — marriage, job, money, going abroad or an exam — and get a KP Prashna (horary) answer from a number 1–249 or the moment you ask. No birth time needed; every step shown.',
};

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const deg = (lon: number) => { const s = Math.floor(lon / 30), d = lon - s * 30; const D = Math.floor(d), M = Math.floor((d - D) * 60), S = Math.round(((d - D) * 60 - M) * 60); return `${SIGNS[s]} ${D}°${String(M).padStart(2, '0')}′${String(S === 60 ? 59 : S).padStart(2, '0')}″`; };

const FAQ = [
  { q: 'What is Prashna (horary) astrology?', a: 'Prashna answers one specific question from a chart drawn for the moment the question is asked, instead of from your birth chart. That is why it works without a birth time — the question itself has a “birth” moment.' },
  { q: 'Why choose a number from 1 to 249?', a: 'In the KP (Krishnamurti Paddhati) method the zodiac is divided into 249 parts — the 27 nakshatras, each cut into 9 sub-parts by the Vimshottari proportions, plus six parts split by a sign boundary. You pick a number while concentrating on the question; that number fixes the rising point (Ascendant) of the Prashna chart. It removes any doubt about the exact minute of the question.' },
  { q: 'How is the answer decided?', a: 'Each question has a main house: the 7th for marriage, the 10th for a job, the 11th for gains, the 12th for going abroad, the 4th for education. The planet ruling the “sub” of that house’s starting point is the deciding planet. If it connects (through the star it sits in, and the houses it sits in and owns) to the supportive houses and not to the blocking ones, the chart leans yes; to both, the matter is possible with delay or effort; to neither, it is not indicated for now.' },
  { q: 'Can I ask the same question again?', a: 'Tradition says ask once, sincerely, and ask again only when the situation has really changed. Asking repeatedly until you get the answer you want is traditionally not read.' },
  { q: 'Is a Prashna answer certain?', a: 'No. It is a traditional, carefully computed reading — a way of seeing which way a matter leans — not a guarantee. Use it alongside your own judgement and practical steps; for important decisions, talk to the people involved.' },
  { q: 'Do I need my birth details?', a: 'No. Only the place where you are when you ask (for the houses) and, if you like, a number from 1 to 249.' },
];

export default function PrashnaPage() {
  const [topic, setTopic] = useState<PrashnaTopic>('marriage');
  const [useNumber, setUseNumber] = useState(true);
  const [num, setNum] = useState('');
  const [question, setQuestion] = useState('');
  const [city, setCity] = useState<SavedCity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<{ r: PrashnaResult; answer: string; when: string } | null>(null);

  const n = Number(num);
  const validNum = !useNumber || (Number.isInteger(n) && n >= 1 && n <= 249);
  const canGo = !!city && validNum && !busy;

  const run = () => {
    if (!canGo || !city) return;
    setBusy(true); setError(null);
    setTimeout(async () => {
      try {
        const { judgePrashna, prashnaAnswer } = await import('@/lib/vedic/prashna');
        const now = new Date();
        const pad = (x: number) => String(x).padStart(2, '0');
        const tz = resolveForPlace(`${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`, `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`, city).utcOffsetHours;
        const r = judgePrashna({ topic, number: useNumber ? n : null, moment: now, lat: city.lat, lon: city.lon, tzHours: tz });
        setRes({ r, answer: prashnaAnswer(r), when: now.toLocaleString() });
      } catch (e) {
        console.error(e);
        setError('Sorry — this place is too far north or south for that number today. Try the “moment of the question” option.');
      } finally { setBusy(false); }
    }, 20);
  };

  return (
    <ToolLayout
      theme="vedic"
      testId="prashna-page"
      seo={<SEO title={PRASHNA_META.title} description={PRASHNA_META.description}
        keywords="prashna kundli, prashna kundali, horary astrology, kp horary, kp prashna number 1 to 249, prashna jyotish, ask a question astrology"
        canonicalUrl={PRASHNA_PATH} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }], current: 'Prashna' }}
      footer={{ tagline: 'One question, one honest reading.', nav: [{ label: 'Kundli', to: '/kundali/' }, { label: 'Kundli Matching', to: '/kundali-match/' }, { label: 'Muhurat', to: '/muhurat/' }], note: 'KP method: Placidus houses, Krishnamurti ayanamsa, sub-lord theory — the same tables as the KP section of our Kundli.' }}
      eyebrow="Prashna · KP horary"
      h1="Prashna Kundli — Ask One Question, Get a KP Answer"
      lead={<>A <TermTip id="prashna">Prashna</TermTip> chart is drawn for the moment you ask, so it needs no birth time. Think of one clear question, pick a number from 1 to 249, and see which way the chart leans — with every step shown.</>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6 space-y-3" data-testid="pr-form">
            <label className="block text-sm">
              <span className="block text-muted-foreground mb-1">What is your question about?</span>
              <select data-testid="pr-topic" value={topic} onChange={e => setTopic(e.target.value as PrashnaTopic)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground">
                {(Object.keys(PRASHNA_TOPICS) as PrashnaTopic[]).map(k => <option key={k} value={k}>{PRASHNA_TOPICS[k].label}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="block text-muted-foreground mb-1">Your question, in your own words <span className="text-xs">(optional — stays on this page)</span></span>
              <input data-testid="pr-question" type="text" maxLength={200} value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. Will my marriage be fixed this year?" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
            </label>
            <fieldset className="text-sm space-y-2">
              <legend className="text-muted-foreground mb-1">How should the chart be drawn?</legend>
              <label className="flex items-center gap-2"><input data-testid="pr-method-number" type="radio" checked={useNumber} onChange={() => setUseNumber(true)} /> With a number from 1 to 249 (KP method)</label>
              {useNumber && (
                <input data-testid="pr-number" type="number" inputMode="numeric" min={1} max={249} value={num} onChange={e => setNum(e.target.value)} placeholder="Think of your question, then type the first number that comes to mind (1–249)" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              )}
              <label className="flex items-center gap-2"><input data-testid="pr-method-moment" type="radio" checked={!useNumber} onChange={() => setUseNumber(false)} /> With the exact moment I ask</label>
            </fieldset>
            <div className="relative text-sm">
              <span className="block text-muted-foreground mb-1">Where are you now?</span>
              <CityPicker testid="pr-city" mode="place" value={city} onPick={setCity} placeholder="e.g. Pune" ariaLabel="Current city" />
            </div>
            {useNumber && num !== '' && !validNum && <p className="text-xs text-destructive" data-testid="pr-number-error">Please type a whole number from 1 to 249.</p>}
            <button data-testid="pr-go" onClick={run} disabled={!canGo} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
              {busy ? 'Drawing the chart…' : 'Get my Prashna answer'}
            </button>
            <p className="text-xs text-muted-foreground">Calculated in your browser. Nothing you type is sent or stored.</p>
          </div>

          {error && <p className="text-sm text-destructive mb-6" data-testid="pr-error">{error}</p>}

          {res && (
            <div data-testid="pr-result" data-verdict={res.r.verdict} className="mb-8">
              <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20 mb-4" data-testid="pr-answer">
                {question && <div className="text-xs text-muted-foreground mb-1">“{question}”</div>}
                <div className="text-2xl font-bold text-primary mb-2">{res.r.verdict === 'yes' ? 'Leans yes' : res.r.verdict === 'mixed' ? 'Possible — with delay or effort' : 'Not indicated for now'}</div>
                <p className="text-foreground">{res.answer}</p>
                <p className="text-xs text-muted-foreground mt-2">A traditional reading of which way the matter leans — not a certainty. Asked {res.when}{res.r.number ? `, number ${res.r.number}` : ''}.</p>
              </div>

              <h2 className="text-lg font-bold text-foreground mb-2">How the answer was reached</h2>
              <ol className="text-sm text-muted-foreground space-y-1 mb-4 list-decimal pl-5" data-testid="pr-steps">
                <li><strong className="text-foreground">Rising point (Ascendant):</strong> {deg(res.r.ascendant)} {res.r.number ? `— fixed by your number ${res.r.number} (the start of the ${res.r.number}th of the 249 KP parts).` : '— the Ascendant at the moment you asked.'}</li>
                <li><strong className="text-foreground">Main house for this question:</strong> the {PRASHNA_TOPICS[res.r.topic].cusp}th. Its starting point is {deg(res.r.cusps[PRASHNA_TOPICS[res.r.topic].cusp - 1].longitude)}, in the sub of <strong className="text-foreground">{res.r.cuspSubLord}</strong> — the deciding planet.</li>
                <li><strong className="text-foreground">{res.r.cuspSubLord} connects to houses</strong> {res.r.signified.join(', ') || '—'} (through the star it sits in, and the houses it sits in and owns).</li>
                <li><strong className="text-foreground">Supportive houses</strong> {PRASHNA_TOPICS[res.r.topic].yes.join(', ')} → found {res.r.yesHit.join(', ') || 'none'}; <strong className="text-foreground">blocking houses</strong> {PRASHNA_TOPICS[res.r.topic].no.join(', ')} → found {res.r.noHit.join(', ') || 'none'}.</li>
                <li><strong className="text-foreground">Ruling planets now</strong> (the traditional confirmation): day {res.r.rulingPlanets.dayLord}, Moon’s sign {res.r.rulingPlanets.moonSignLord}, Moon’s star {res.r.rulingPlanets.moonStarLord}, Ascendant’s sign {res.r.rulingPlanets.lagnaSignLord}, Ascendant’s star {res.r.rulingPlanets.lagnaStarLord}.{[res.r.rulingPlanets.dayLord, res.r.rulingPlanets.moonSignLord, res.r.rulingPlanets.moonStarLord, res.r.rulingPlanets.lagnaSignLord, res.r.rulingPlanets.lagnaStarLord].includes(res.r.cuspSubLord) ? ` ${res.r.cuspSubLord} is among them — a classic sign the reading is reliable.` : ''}</li>
              </ol>

              <details className="mb-4" data-testid="pr-tables">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">Full Prashna chart: house starting points and planets (KP)</summary>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead className="bg-muted/50 text-left"><tr><th className="p-2">House</th><th className="p-2">Starts at</th><th className="p-2">Star lord</th><th className="p-2">Sub lord</th></tr></thead>
                    <tbody>{res.r.cusps.map(c => <tr key={c.house} className="border-t border-border"><td className="p-2">{c.house}</td><td className="p-2">{deg(c.longitude)}</td><td className="p-2">{c.star}</td><td className="p-2">{c.sub}</td></tr>)}</tbody>
                  </table>
                  <table className="w-full text-sm min-w-[480px] mt-3">
                    <thead className="bg-muted/50 text-left"><tr><th className="p-2">Planet</th><th className="p-2">Position</th><th className="p-2">House</th><th className="p-2">Star · Sub</th><th className="p-2">Connects to houses</th></tr></thead>
                    <tbody>{res.r.planets.map(p => <tr key={p.name} className="border-t border-border"><td className="p-2">{p.name}</td><td className="p-2">{deg(p.longitude)}</td><td className="p-2">{p.house}</td><td className="p-2">{p.star} · {p.sub}</td><td className="p-2">{p.signifies.join(', ')}</td></tr>)}</tbody>
                  </table>
                </div>
              </details>
            </div>
          )}

          <section className="mb-8 text-sm text-muted-foreground space-y-2" data-testid="pr-method">
            <h2 className="text-lg font-bold text-foreground">The method, in plain words</h2>
            <p><strong className="text-foreground">Why it works without a birth time:</strong> the question has its own moment and place, so the chart is drawn for that — or, in the KP method, for the rising point fixed by your number.</p>
            <p><strong className="text-foreground">Which houses matter:</strong> marriage — supportive 2, 7, 11, blocking 1, 6, 10; job — 2, 6, 10, 11 vs 1, 5, 9; gains — 2, 6, 11 vs 5, 8, 12; abroad — 3, 9, 12 vs 2, 4, 11; studies — 4, 9, 11 vs 3, 8, 12.</p>
            <p>Want the bigger picture from your own birth chart? See your free <Link to="/kundali/" className="underline">Kundli</Link> (its KP section uses the same tables) or, for marriage, <Link to="/kundali-match/" className="underline">Kundli matching</Link>.</p>
          </section>

          <ToolFaq items={FAQ} title="Questions about Prashna" testId="pr-faq" />

          <ToolSources testId="pr-sources" items={[
            { label: 'KP sub-lord theory and the 249 horary numbers — K.S. Krishnamurti, KP Reader VI (Horary Astrology)', note: 'house groups per question as taught in KP' },
            { label: 'Planet positions and Placidus houses — the BornClock engine', note: 'checked against the Swiss Ephemeris; see our accuracy page', href: '/accuracy/' },
            { label: 'Krishnamurti ayanamsa — Swiss Ephemeris SE_SIDM_KRISHNAMURTI', note: '348.67″ less than Lahiri, constant' },
          ]} />
        </div>
      </section>
    </ToolLayout>
  );
}
