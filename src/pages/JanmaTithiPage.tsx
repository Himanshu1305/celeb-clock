/**
 * /janma-tithi-calculator — Hindu (lunar) birthday: birth tithi + lunar month (amanta and
 * purnimanta, labelled) and the Gregorian dates of the tithi birthday for the next 10
 * years (Batch 10). Engine + stated rules: src/lib/vedic/janmaTithi.ts. Runs in the
 * browser; nothing is stored.
 */
import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { CityPicker } from '@/components/CityPicker';
import { TermTip } from '@/components/vedic/TermTip';
import { ToolFaq, ToolSources } from '@/components/tools/ToolFaq';
import type { SavedCity } from '@/services/savedProfile';
import { resolveForPlace, zoneForPlace } from '@/lib/timezone/clientBirth';
import type { JanmaTithiResult, Place, TithiBirthday } from '@/lib/vedic/janmaTithi';

export const JANMA_TITHI_PATH = '/janma-tithi-calculator';
export const JANMA_TITHI_META = {
  title: 'Janma Tithi Calculator — Hindu Birthday by Tithi | BornClock',
  description: 'Find your Janma Tithi (birth tithi) and lunar month — amanta and purnimanta — and the dates of your Hindu tithi birthday for the next 10 years, with Adhik Maas and kshaya tithi handled.',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
}
const shortDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`; };

/** "Kartika Shukla Ekadashi" (Purnima/Amavasya without the paksha). */
function lunarDay(month: string, r: JanmaTithiResult): string {
  const t = r.tithi;
  return t.name === 'Purnima' || t.name === 'Amavasya' ? `${month} ${t.name}` : `${month} ${t.paksha} ${t.name}`;
}

function noteFor(b: TithiBirthday): string | null {
  const parts: string[] = [];
  if (b.rule === 'vriddhi' && b.secondDate) parts.push(`Your tithi is running at sunrise on two days this year; we list the first. ${shortDate(b.secondDate)} also begins in it.`);
  if (b.rule === 'kshaya') parts.push('Kshaya year: your tithi starts after sunrise and ends before the next sunrise, so it names no day. Listed on the day it falls (the day before it would have been named).');
  if (b.adhikDate) parts.push(`Adhik Maas year: the tithi also falls on ${shortDate(b.adhikDate)} in ${b.adhikMonth}. The birthday is kept in the regular month.`);
  return parts.length ? parts.join(' ') : null;
}

const FAQ = [
  { q: 'What is a Janma Tithi?', a: 'Your Janma Tithi is the tithi (lunar day) running when you were born, together with your birth lunar month — for example Kartika Shukla Ekadashi. A tithi is each 12° that the Moon moves ahead of the Sun, so there are 30 tithis in a lunar month. Your Hindu birthday is that same tithi in that same lunar month every year.' },
  { q: 'Why does my tithi birthday fall on a different date every year?', a: 'The lunar year is about 354 days, 11 days shorter than the solar year, and an extra lunar month (Adhik Maas) is added roughly every three years to catch up. So the tithi birthday moves earlier by about 11 days most years and then jumps later by about 19 days after an Adhik Maas.' },
  { q: 'Which day is my tithi birthday when the tithi spans two days?', a: 'A day takes the tithi running at sunrise. If your tithi is running at sunrise on two days (vriddhi), we list the first day and show the second. If it starts after one sunrise and ends before the next (kshaya), it names no day, so we list the day in which it falls — the day whose sunrise tithi is the one just before yours.' },
  { q: 'What happens to my tithi birthday in an Adhik Maas year?', a: 'In an Adhik (extra) month year your tithi occurs twice — in the Adhik month and in the regular (nija) month of the same name. We list the regular month, because Adhik Maas is traditionally set aside from auspicious celebrations, and show the Adhik date as a note for families who mark both. If you were born in an Adhik month, your birthday is kept in the regular month of that name.' },
  { q: 'Amanta or purnimanta — which month name is mine?', a: 'Both describe the same day. Amanta months (much of South and West India) run new moon to new moon; purnimanta months (North India) run full moon to full moon. In Shukla paksha the names match; in Krishna paksha the purnimanta name is one month ahead. Use the one your family calendar uses.' },
  { q: 'Do I need my birth time?', a: 'It helps. The tithi changes at a different clock time every day, so with the birth time we use the tithi running at your birth moment. Without it, we use the tithi running at sunrise on your birth date at your birthplace — the tithi that names that day — and tell you so.' },
];

export default function JanmaTithiPage() {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [noTime, setNoTime] = useState(false);
  const [city, setCity] = useState<SavedCity | null>(null);
  const [celebrate, setCelebrate] = useState<SavedCity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JanmaTithiResult | null>(null);
  const [placeLabel, setPlaceLabel] = useState('');

  const validDob = /^\d{4}-\d{2}-\d{2}$/.test(dob) && dob >= '1900-01-01' && dob <= '2100-12-31';
  const validTime = noTime || /^\d{2}:\d{2}$/.test(time);
  const canGo = validDob && validTime && !!city && !busy;

  const run = () => {
    if (!canGo || !city) return;
    setBusy(true); setError(null);
    setTimeout(async () => {
      try {
        const { computeJanmaTithi, localDateOf } = await import('@/lib/vedic/janmaTithi');
        const birthPlace: Place = { lat: city.lat, lon: city.lon, timezone: zoneForPlace(city), name: city.name };
        const cel: Place = celebrate ? { lat: celebrate.lat, lon: celebrate.lon, timezone: zoneForPlace(celebrate), name: celebrate.name } : birthPlace;
        const utc = noTime ? null : Date.parse(resolveForPlace(dob, time, city).utcISO);
        const from = localDateOf(Date.now(), cel.timezone);
        setResult(computeJanmaTithi({ dob, birthUtcMs: utc, birthPlace, celebratePlace: cel, from, count: 10 }));
        setPlaceLabel(cel.name ?? '');
      } catch (e) {
        console.error(e);
        setError('Sorry — that date could not be calculated. Please check the date and place.');
      } finally { setBusy(false); }
    }, 20);
  };

  const next = result?.birthdays[0];

  return (
    <ToolLayout
      theme="vedic"
      testId="janma-tithi-page"
      seo={<SEO title={JANMA_TITHI_META.title} description={JANMA_TITHI_META.description}
        keywords="janma tithi calculator, hindu birthday calculator, tithi birthday, birthday as per hindu calendar, janmadin tithi"
        canonicalUrl={JANMA_TITHI_PATH} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }, { label: 'Panchang', to: '/panchang/' }], current: 'Janma Tithi' }}
      footer={{ tagline: 'Your birthday by the Hindu lunar calendar.', nav: [{ label: 'Panchang', to: '/panchang/' }, { label: 'Festivals', to: '/festivals/' }, { label: 'Kundali', to: '/kundali/' }], note: 'Computed with sidereal (Lahiri) Sun and Moon positions and real local sunrise — the same engine as our Panchang.' }}
      eyebrow="Hindu birthday · Janma Tithi"
      h1="Janma Tithi Calculator — Your Hindu Birthday"
      lead={<>Your birthday by the Hindu calendar is the same <TermTip id="tithi">tithi</TermTip> in the same lunar month each year. Enter your birth details to see your birth tithi and the dates of your tithi birthday for the next 10 years.</>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6 space-y-3" data-testid="jt-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-muted-foreground mb-1">Date of birth</span>
                <input data-testid="jt-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <label className="text-sm">
                <span className="block text-muted-foreground mb-1">Birth time</span>
                <input data-testid="jt-time" type="time" value={time} disabled={noTime} onChange={e => setTime(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground disabled:opacity-50" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input data-testid="jt-notime" type="checkbox" checked={noTime} onChange={e => setNoTime(e.target.checked)} className="h-4 w-4" />
              I don’t know my birth time (use the tithi at sunrise on my birth date)
            </label>
            <div className="relative text-sm">
              <span className="block text-muted-foreground mb-1">Birth place</span>
              <CityPicker testid="jt-city" value={city} onPick={setCity} dob={dob} time={noTime ? '12:00' : time} placeholder="e.g. Jaipur" />
            </div>
            <div className="relative text-sm">
              <span className="block text-muted-foreground mb-1">Where you will celebrate <span className="text-xs">(optional — sunrise there decides the day; default: birth place)</span></span>
              <CityPicker testid="jt-celebrate" mode="place" value={celebrate} onPick={setCelebrate} placeholder="e.g. Bengaluru" ariaLabel="Celebration city" />
            </div>
            <button data-testid="jt-go" onClick={run} disabled={!canGo} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
              {busy ? 'Calculating…' : 'Find my Janma Tithi'}
            </button>
            <p className="text-xs text-muted-foreground">Calculated in your browser. Your birth details are not stored.</p>
          </div>

          {error && <p className="text-sm text-destructive mb-6">{error}</p>}

          {result && next && (
            <div data-testid="jt-result" className="mb-8">
              <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20 mb-4" data-testid="jt-answer">
                <div className="text-xs text-muted-foreground mb-1">Your Janma Tithi</div>
                <div className="text-2xl font-bold text-primary mb-2" data-testid="jt-tithi">{lunarDay(result.purnimantaMonth, result)}</div>
                <p className="text-foreground">
                  Your next tithi birthday is <strong data-testid="jt-next">{longDate(next.date)}</strong>{placeLabel ? <> (sunrise in {placeLabel})</> : null}.
                  {' '}It is traditionally marked with a prayer, a temple visit or giving to someone in need — you can keep it alongside your English-calendar birthday.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm" data-testid="jt-months">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground"><TermTip id="purnimanta">Purnimanta</TermTip> (North India)</div>
                  <div className="font-semibold text-foreground" data-testid="jt-purnimanta">{lunarDay(result.purnimantaMonth, result)}</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground"><TermTip id="amanta">Amanta</TermTip> (South &amp; West India)</div>
                  <div className="font-semibold text-foreground" data-testid="jt-amanta">{lunarDay(result.amantaMonth, result)}</div>
                </div>
              </div>

              <ul className="text-sm text-muted-foreground space-y-1 mb-4" data-testid="jt-why">
                <li><strong className="text-foreground">Tithi:</strong> {result.tithi.name} of the {result.tithi.paksha === 'Shukla' ? 'bright (Shukla, waxing)' : 'dark (Krishna, waning)'} <TermTip id="paksha">paksha</TermTip> — tithi {result.tithi.index + 1} of 30.</li>
                <li>
                  <strong className="text-foreground">Taken at:</strong>{' '}
                  {result.basis === 'birth-moment' ? 'your birth moment.' : 'sunrise on your birth date at your birthplace (no birth time given).'}
                  {result.basis === 'birth-moment' && result.sunriseTithi.index !== result.tithi.index
                    ? ` At sunrise that day the tithi was still ${result.sunriseTithi.name} (${result.sunriseTithi.paksha}); it changed before you were born.`
                    : ''}
                </li>
                {result.bornInAdhik && (
                  <li data-testid="jt-born-adhik"><strong className="text-foreground">Born in <TermTip id="adhikMaas">Adhik Maas</TermTip>:</strong> you were born in {result.birthMonth}. Adhik months come only every two to three years, so your birthday is kept in the regular {result.amantaMonth} month.</li>
                )}
              </ul>

              <h2 className="text-lg font-bold text-foreground mb-2">Your tithi birthday for the next 10 years</h2>
              <p className="text-xs text-muted-foreground mb-2 sm:hidden">Scroll the table sideways to see every column →</p>
              <div className="overflow-x-auto rounded-lg border border-border mb-2" data-testid="jt-table">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-muted/50 text-left">
                    <tr><th className="p-2">Date</th><th className="p-2">Lunar date (purnimanta / amanta)</th><th className="p-2">Note</th></tr>
                  </thead>
                  <tbody>
                    {result.birthdays.map(b => (
                      <tr key={b.date} className="border-t border-border align-top" data-testid="jt-row">
                        <td className="p-2 whitespace-nowrap font-medium text-foreground">{longDate(b.date)}</td>
                        <td className="p-2 text-muted-foreground">{lunarDay(b.purnimantaMonth, result)}{b.purnimantaMonth !== b.amantaMonth ? ` / ${lunarDay(b.amantaMonth, result)}` : ''}</td>
                        <td className="p-2 text-xs text-muted-foreground">{noteFor(b) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Dates follow sunrise {placeLabel ? `in ${placeLabel}` : 'at the place you chose'}; in a city far away the day can differ by one. Words: <TermTip id="janmaTithi">Janma Tithi</TermTip> · <TermTip id="kshayaTithi">kshaya / vriddhi</TermTip> · <TermTip id="adhikMaas">Adhik Maas</TermTip>.
              </p>
            </div>
          )}

          <section className="mb-8 text-sm text-muted-foreground space-y-2" data-testid="jt-rules">
            <h2 className="text-lg font-bold text-foreground">How the date is chosen</h2>
            <p><strong className="text-foreground">The day:</strong> each year we take your lunar month (by the classical rule that a lunar month is named after the Sankranti, the Sun’s change of sign, inside it) and find the day on which your tithi is running at sunrise where you celebrate — the same sunrise rule the Panchang uses to name a day.</p>
            <p><strong className="text-foreground">Tithi on two days (vriddhi):</strong> the first day is listed and the second is shown. <strong className="text-foreground">Skipped tithi (kshaya):</strong> the day in which it falls is listed.</p>
            <p><strong className="text-foreground">Adhik Maas:</strong> the birthday is kept in the regular (nija) month; the extra-month date is shown as a note.</p>
            <p>Want the full day’s Panchang for that date? See the <Link to="/panchang/" className="underline">Panchang</Link>, or the <Link to="/festivals/" className="underline">festival calendar</Link> for the year.</p>
          </section>

          <ToolFaq items={FAQ} title="Questions about the Hindu birthday" testId="jt-faq" />

          <ToolSources testId="jt-sources" items={[
            { label: 'Sun and Moon: sidereal (Lahiri) positions from the BornClock engine', note: 'the same engine as our Panchang and festival dates, which are tested against Drik Panchang' },
            { label: 'Kshaya rule — pranamdaily.in, Janma Tithi', href: 'https://pranamdaily.in/en/janma-tithi/', note: '“gives the day of the tithi just before it, so you always receive one settled date”' },
            { label: 'Adhik Maas — Drik Panchang', href: 'https://www.drikpanchang.com/calendars/hindu/months/purushottam/hindu-calendar-adhik-maas.html', note: 'months without a Sankranti are Adhik; auspicious works are avoided in them' },
          ]} />
        </div>
      </section>
    </ToolLayout>
  );
}
