/**
 * Year muhurat lists — /muhurat/:type/:year (batch 9b).
 * Marriage, Griha Pravesh, vehicle purchase, Mundan and Naamkaran for 2026 and 2027.
 *
 * The lists are precomputed at build (scripts/gen-muhurat-years.mts → src/data/muhuratYears)
 * from the same Panchang engine as the daily Panchang and festival calendar; the New Delhi
 * list is in the file (prerendered), and the city picker recomputes the sunrise-to-sunrise
 * days in the browser for any other place (src/lib/vedic/muhuratYearDays.ts).
 * Criteria and their sources: src/lib/vedic/muhuratYear.ts (OCCASION_RULES).
 */
import { useEffect, useMemo, useState } from 'react';
import { ScrollTable } from '@/components/ScrollTable';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { CityPicker } from '@/components/CityPicker';
import type { SavedCity } from '@/services/savedProfile';
import { PANCHANG_CITIES, sunriseSunset } from '@/lib/vedic/panchangDay';
import { resolveForPlace } from '@/lib/timezone/clientBirth';
import { windowsForPlace, clock, type MuhuratWindow, type YearMuhuratData } from '@/lib/vedic/muhuratYearDays';
import { MUHURAT_YEAR_META, MUHURAT_YEAR_SLUGS, MUHURAT_YEAR_YEARS } from '@/lib/muhuratYearMeta.js';
import { muhuratYearFaqs, type SeasonLabel } from '@/lib/vedic/muhuratYearContent';

type FileData = YearMuhuratData & { seasons: SeasonLabel[]; delhi: MuhuratWindow[] };
const FILES = import.meta.glob<FileData>('../data/muhuratYears/*.json', { import: 'default' });

const NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'];
const tithiName = (i: number) => (i === 29 ? 'Amavasya' : i === 14 ? 'Purnima' : `${i < 15 ? 'Shukla' : 'Krishna'} ${TITHI[i % 15]}`);
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const GMONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const niceDate = (iso: string, withYear = false) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });

interface Place { name: string; lat: number; lon: number; builtIn: boolean }
const DELHI: Place = { name: 'New Delhi', lat: 28.6139, lon: 77.2090, builtIn: true };

function todayIst(): string { return new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10); }

export default function MuhuratYearPage() {
  const { type: slug = '', year: yearParam = '' } = useParams<{ type: string; year: string }>();
  const year = Number(yearParam);
  const kind = (MUHURAT_YEAR_SLUGS as Record<string, string>)[slug];
  const meta = MUHURAT_YEAR_META[slug];
  const valid = !!kind && !!meta && MUHURAT_YEAR_YEARS.includes(year);

  const [file, setFile] = useState<FileData | null>(null);
  const [place, setPlace] = useState<Place>(DELHI);
  const [picked, setPicked] = useState<SavedCity | null>(null);
  const [placeWindows, setPlaceWindows] = useState<MuhuratWindow[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!valid) return;
    let live = true;
    setFile(null);
    const load = FILES[`../data/muhuratYears/${kind}-${year}.json`];
    if (load) load().then(f => { if (live) setFile(f); });
    return () => { live = false; };
  }, [valid, kind, year]);

  // Recompute the sunrise-to-sunrise days for any place other than New Delhi.
  useEffect(() => {
    if (!file || (place.builtIn && place.name === DELHI.name)) { setPlaceWindows(null); return; }
    setBusy(true);
    const t = setTimeout(() => {
      const tzOf = (iso: string) => {
        if (place.builtIn) return 5.5;
        try { return resolveForPlace(iso, '12:00', { lat: place.lat, lon: place.lon }).utcOffsetHours; } catch { return 0; }
      };
      const sun = (iso: string) => {
        const r = sunriseSunset(new Date(iso + 'T12:00:00Z'), place.lat, place.lon, tzOf(iso));
        return { rise: r.rise.getTime(), set: r.set.getTime(), nextRise: r.nextRise.getTime() };
      };
      setPlaceWindows(windowsForPlace(file, sun, tzOf));
      setBusy(false);
    }, 20);
    return () => clearTimeout(t);
  }, [file, place]);

  const windows = placeWindows ?? file?.delhi ?? [];
  const tzFor = (iso: string) => {
    if (place.builtIn) return 5.5;
    try { return resolveForPlace(iso, '12:00', { lat: place.lat, lon: place.lon }).utcOffsetHours; } catch { return 0; }
  };

  const today = todayIst();
  const byMonth = useMemo(() => {
    const m: MuhuratWindow[][] = Array.from({ length: 12 }, () => []);
    for (const w of windows) m[Number(w.date.slice(5, 7)) - 1].push(w);
    return m;
  }, [windows]);
  const dayCount = (list: MuhuratWindow[]) => new Set(list.map(w => w.date)).size;

  if (!valid) return <Navigate to="/muhurat" replace />;

  const totalDays = dayCount(windows);
  const upcoming = windows.filter(w => w.date >= today);
  const isPartlyPast = year === Number(today.slice(0, 4));
  const allPast = year < Number(today.slice(0, 4));
  const pastMonths = isPartlyPast ? byMonth.map((l, i) => ({ i, l })).filter(x => `${year}-${String(x.i + 1).padStart(2, '0')}` < today.slice(0, 7)) : [];
  const currentMonths = byMonth.map((l, i) => ({ i, l })).filter(x => allPast ? false : !isPartlyPast || `${year}-${String(x.i + 1).padStart(2, '0')}` >= today.slice(0, 7));
  const nextYear = MUHURAT_YEAR_YEARS.includes(year + 1) ? year + 1 : null;
  const otherSlugs = Object.keys(MUHURAT_YEAR_SLUGS).filter(s => s !== slug);
  const faqs = muhuratYearFaqs(slug, year, file?.seasons ?? []);

  const table = (list: MuhuratWindow[], testid: string) => (
    <ScrollTable label="Muhurat dates and times">
      <table className="w-full text-sm border-collapse" data-testid={testid}>
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            <th className="py-1.5 pr-3 font-medium">Date</th>
            <th className="py-1.5 pr-3 font-medium">Day</th>
            <th className="py-1.5 pr-3 font-medium">Time window</th>
            <th className="py-1.5 pr-3 font-medium">Nakshatra</th>
            <th className="py-1.5 font-medium">Tithi</th>
          </tr>
        </thead>
        <tbody>
          {list.map((w, i) => {
            const tz = tzFor(w.date);
            const s = clock(w.start, w.date, tz), e = clock(w.end, w.date, tz);
            return (
              <tr key={i} className="border-b border-border/60 align-top" data-testid="muhurat-year-row">
                <td className="py-1.5 pr-3 whitespace-nowrap font-medium text-foreground">{niceDate(w.date)}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{WEEKDAY[w.weekday]}</td>
                <td className="py-1.5 pr-3 whitespace-nowrap tabular-nums text-foreground">
                  {s.hhmm}{s.nextDay ? ' (next day)' : ''} – {e.hhmm}{e.nextDay ? ' (next day)' : ''}
                </td>
                <td className="py-1.5 pr-3 text-foreground">{w.nakshatras.map(n => NAK[n]).join(', ')}</td>
                <td className="py-1.5 text-foreground">{w.tithis.map(tithiName).join(', ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollTable>
  );

  const monthBlock = ({ i, l }: { i: number; l: MuhuratWindow[] }) => (
    <div key={i} className="mb-6" data-testid="muhurat-year-month">
      <h3 className="font-semibold text-foreground mb-2 border-b border-border pb-1">
        {GMONTHS[i]} {year} <span className="text-sm font-normal text-muted-foreground">· {dayCount(l) === 0 ? 'no dates' : `${dayCount(l)} ${dayCount(l) === 1 ? 'day' : 'days'}`}</span>
      </h3>
      {l.length > 0 ? table(l, `muhurat-year-table-${i + 1}`) : <p className="text-sm text-muted-foreground">No {meta.short.toLowerCase()} muhurat this month{seasonNoteFor(file?.seasons ?? [], year, i)}.</p>}
    </div>
  );

  return (
    <ToolLayout
      theme="vedic"
      testId="muhurat-year"
      seo={<SEO title={meta.title(year)} description={meta.description(year)} canonicalUrl={`/muhurat/${slug}/${year}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Muhurat', to: '/muhurat' }], current: `${meta.short} ${year}` }}
      footer={{ tagline: 'Muhurat dates computed from the Panchang.', nav: [{ label: 'Muhurat Finder', to: '/muhurat' }, { label: `Festivals ${year}`, to: `/festivals/${year}` }, { label: 'Daily Panchang', to: '/panchang' }, { label: 'Kundali Matching', to: '/kundali-match' }], note: 'Panchang-based dates for guidance; for an important ceremony, a family priest or astrologer also checks the Lagna and your own chart.' }}
      eyebrow="Panchang · muhurat"
      h1={meta.h1(year)}
      lead={file
        ? <span data-testid="muhurat-year-lead">{totalDays} auspicious {meta.name} {totalDays === 1 ? 'day' : 'days'} in {year} for {place.name}{isPartlyPast ? ` — ${dayCount(upcoming)} still ahead from ${niceDate(today, true)}` : ''}.</span>
        : `Auspicious ${meta.name} dates in ${year}, month by month.`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">

          {(isPartlyPast || allPast) && nextYear && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 mb-6 text-sm" data-testid="muhurat-year-next">
              <strong className="text-foreground">Planning ahead?</strong>{' '}
              <span className="text-muted-foreground">Most of {year} has passed — the full year of dates for {nextYear} is ready.</span>{' '}
              <Link to={`/muhurat/${slug}/${nextYear}`} className="text-primary font-semibold underline">{meta.short} muhurat {nextYear} →</Link>
            </div>
          )}

          {/* City — times are for the place's own sunrise-to-sunrise day. */}
          <div className="rounded-xl border border-border bg-background/60 p-4 mb-6 space-y-3" data-testid="muhurat-year-city">
            <p className="text-sm text-muted-foreground">Times below are for <strong className="text-foreground">{place.name}</strong>{place.builtIn ? ' (IST)' : ' (local time)'}. Muhurat times change from city to city because each Hindu day runs from local sunrise to the next sunrise — choose your city to recompute.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-muted-foreground">City</span>
                <select
                  data-testid="muhurat-year-city-select"
                  aria-label="Choose a city"
                  value={place.builtIn ? place.name : ''}
                  onChange={e => {
                    const c = PANCHANG_CITIES.find(x => x.name === e.target.value);
                    if (e.target.value === DELHI.name) { setPlace(DELHI); setPicked(null); }
                    else if (c) { setPlace({ name: c.name, lat: c.lat, lon: c.lon, builtIn: true }); setPicked(null); }
                  }}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {!place.builtIn && <option value="">{place.name}</option>}
                  <option value={DELHI.name}>New Delhi</option>
                  {[...PANCHANG_CITIES].filter(c => c.slug !== 'delhi').sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.slug} value={c.name}>{c.name}, {c.state}</option>)}
                </select>
              </label>
              <div className="block text-sm">
                <span className="text-muted-foreground">Or search any place</span>
                <div className="mt-1">
                  <CityPicker testid="muhurat-year-place-search" mode="place" value={picked} placeholder="Type a town or city (e.g. Sagar)" ariaLabel="Search any place"
                    onPick={c => { setPicked(c); if (c) setPlace({ name: c.name, lat: c.lat, lon: c.lon, builtIn: false }); }} />
                </div>
              </div>
            </div>
            {busy && <p className="text-sm text-muted-foreground" role="status">Working out the dates for {place.name}…</p>}
          </div>

          {!file && <p className="text-sm text-muted-foreground" role="status">Loading the {year} dates…</p>}

          {file && (
            <>
              <h2 className="font-semibold text-foreground mb-3 text-lg">{meta.short} muhurat dates {year}, month by month</h2>
              {allPast && <p className="text-sm text-muted-foreground mb-4">All of these dates are now in the past.</p>}
              {currentMonths.map(monthBlock)}

              {(pastMonths.length > 0 || allPast) && (
                <details className="rounded-xl border border-border p-4 mb-8" data-testid="muhurat-year-past">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    Earlier in {year} (past dates): {(allPast ? byMonth.map((l, i) => ({ i, l })) : pastMonths).map(x => `${GMONTHS[x.i].slice(0, 3)} ${dayCount(x.l)}`).join(' · ')}
                  </summary>
                  <div className="mt-4">{(allPast ? byMonth.map((l, i) => ({ i, l })) : pastMonths).map(monthBlock)}</div>
                </details>
              )}

              {/* Why some months are empty — the seasonal bars, with their dates. */}
              {file.seasons.length > 0 && (
                <div className="rounded-xl border border-border p-4 mb-8 text-sm" data-testid="muhurat-year-seasons">
                  <h2 className="font-semibold text-foreground mb-2">Why some months have no dates</h2>
                  <ul className="space-y-1.5">
                    {file.seasons.filter(s => s.to >= `${year}-01-01` && s.from <= `${year}-12-31`).map((s, i) => (
                      <li key={i} className="text-muted-foreground">
                        <strong className="text-foreground">{niceDate(s.from, true)} – {niceDate(s.to, true)}:</strong> {s.label}
                        {s.kind === 'kharmas' && <> (<TermTip id="kharmas">Kharmas</TermTip>)</>}
                        {s.kind === 'chaturmas' && <> (<TermTip id="chaturmas">Chaturmas</TermTip>)</>}
                        {s.kind === 'asta' && <> (<TermTip id="taraAsta">Asta</TermTip>)</>}
                        {s.kind === 'adhik' && <> (<TermTip id="adhikMaas">Adhik Maas</TermTip>)</>}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">Dates are for India (IST). A period that touches part of a day rules that whole sunrise-to-sunrise day out.</p>
                </div>
              )}
            </>
          )}

          <Criteria slug={slug} />

          <PageFAQ items={faqs} />

          <div className="rounded-xl border border-border p-4 mb-8 text-sm" data-testid="muhurat-year-links">
            <h2 className="font-semibold text-foreground mb-2">More muhurat dates</h2>
            <ul className="flex flex-wrap gap-2">
              {MUHURAT_YEAR_YEARS.filter(y => y !== year).map(y => (
                <li key={y}><Link to={`/muhurat/${slug}/${y}`} className="inline-block px-3 py-1.5 rounded-lg border border-border hover:bg-primary/5 text-foreground">{meta.short} {y}</Link></li>
              ))}
              {otherSlugs.map(s => (
                <li key={s}><Link to={`/muhurat/${s}/${year}`} className="inline-block px-3 py-1.5 rounded-lg border border-border hover:bg-primary/5 text-foreground">{MUHURAT_YEAR_META[s].short} {year}</Link></li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Need a date for something else, or a custom range? Use the Muhurat Finder, or see the festivals of {year}.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Muhurat Finder →</Link>
              <Link to={`/festivals/${year}`} className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">Festivals {year} →</Link>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}

/** Short reason for an empty month, from the seasonal bars that cover most of it. */
function seasonNoteFor(seasons: SeasonLabel[], year: number, monthIdx: number): string {
  const mid = `${year}-${String(monthIdx + 1).padStart(2, '0')}-15`;
  const hit = seasons.filter(s => s.from <= mid && s.to >= mid);
  if (hit.length === 0) return '';
  const words = hit.map(s => s.kind === 'kharmas' ? 'Kharmas' : s.kind === 'chaturmas' ? 'Chaturmas' : s.kind === 'adhik' ? 'the Adhik (leap) month' : s.kind === 'asta' ? (s.label.startsWith('Shukra') ? 'Shukra Asta' : 'Guru Asta') : s.kind === 'lunar' ? s.label.replace(' lunar month', ' month') : s.label);
  return ` — ${[...new Set(words)].join(', ')}`;
}

/** Plain-language criteria per occasion (what the list checks). */
function Criteria({ slug }: { slug: string }) {
  const box = (children: React.ReactNode) => (
    <div className="rounded-xl border border-border p-4 mb-8 text-sm text-muted-foreground space-y-2" data-testid="muhurat-year-criteria">
      <h2 className="font-semibold text-foreground">How these dates are chosen</h2>
      {children}
      <p>Everything is computed from the real sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) positions of the Sun and Moon — the same engine as our daily <Link to="/panchang" className="underline">Panchang</Link> — for each place’s own sunrise-to-sunrise day. Windows shorter than 5 minutes are dropped. <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link></p>
    </div>
  );
  const common = <>This is the <em>Panchang Shuddhi</em> step: the day’s <TermTip id="tithi">Tithi</TermTip>, <TermTip id="panchangNakshatra">Nakshatra</TermTip>, <TermTip id="panchangYoga">Yoga</TermTip>, <TermTip id="karana">Karana</TermTip> and weekday must all be suitable at the same time.</>;
  switch (slug) {
    case 'marriage': return box(<>
      <p>{common} The time window is the stretch of the day when all of them qualify.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-foreground">Nakshatra:</strong> one of the 11 wedding stars — Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula, Uttara Ashadha, Uttara Bhadrapada and Revati — leaving out the <TermTip id="gandanta">Gandanta</TermTip> quarters (the first quarter of Magha and Mula, the last quarter of Revati).</li>
        <li><strong className="text-foreground">Yoga and Karana:</strong> not during the harsh Yogas (Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti), not in <TermTip id="bhadra">Bhadra (Vishti)</TermTip> and not in the four fixed Karanas.</li>
        <li><strong className="text-foreground">Season:</strong> no weddings in <TermTip id="kharmas">Kharmas</TermTip> (Sun in Dhanu or Meena), while the Sun is in Kanya, in <TermTip id="chaturmas">Chaturmas</TermTip>, in an <TermTip id="adhikMaas">Adhik (leap) month</TermTip>, or while Jupiter or Venus is <TermTip id="taraAsta">Asta</TermTip> (with three days either side). A day that is only partly inside such a period is left out.</li>
      </ul>
      <p>These are the rules Drik Panchang applies in its Panchang-only marriage list; our tests compare the 2026 New Delhi dates with it. The final wedding time (the Lagna) is set by your priest, and the couple’s charts are matched separately — see <Link to="/kundali-match" className="underline">Kundali Matching</Link>.</p>
    </>);
    case 'griha-pravesh': return box(<>
      <p>{common}</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-foreground">Nakshatra:</strong> the steady and gentle stars — Rohini, Mrigashira, Uttara Phalguni, Chitra, Anuradha, Uttara Ashadha, Uttara Bhadrapada and Revati.</li>
        <li><strong className="text-foreground">Tithi:</strong> Shukla Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Trayodashi and Krishna Pratipada, Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi. Not on Tuesday or Sunday.</li>
        <li><strong className="text-foreground">Month:</strong> the lunar months Magha, Phalguna, Vaishakha, Jyeshtha, Kartika and Margashirsha; never in <TermTip id="chaturmas">Chaturmas</TermTip>, an <TermTip id="adhikMaas">Adhik (leap) month</TermTip>, or while Jupiter or Venus is <TermTip id="taraAsta">Asta</TermTip> (with three days either side).</li>
      </ul>
      <p>For a first entry into a newly built home (Apoorva Griha Pravesh) this is the usual basis; the Vastu puja time within the window is fixed by your priest.</p>
    </>);
    case 'vehicle-purchase': return box(<>
      <p>{common} For buying a vehicle the Yoga and Karana are not restricted.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-foreground">Nakshatra:</strong> Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Shravana, Dhanishtha, Shatabhisha and Revati.</li>
        <li><strong className="text-foreground">Tithi:</strong> Tritiya, Panchami, Shashthi, Ashtami, Dashami, Ekadashi, Trayodashi, Purnima and Krishna Pratipada.</li>
        <li><strong className="text-foreground">Weekday:</strong> not on Tuesday or Saturday. Not in an <TermTip id="adhikMaas">Adhik (leap) month</TermTip>, and a window that only opens late at night (after the first fifth of the night) is left out.</li>
      </ul>
      <p>These are the rules behind Drik Panchang’s vehicle-purchase list; our tests compare the 2026 New Delhi dates with it.</p>
    </>);
    case 'mundan': return box(<>
      <p>{common} Mundan is done in daylight, so only the sunrise-to-sunset part of each day is listed.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-foreground">Sun’s month:</strong> only while the Sun is in Makara, Kumbha, Mesha, Vrishabha or Mithuna (roughly mid-January to mid-July, skipping Meena).</li>
        <li><strong className="text-foreground">Nakshatra:</strong> Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Jyeshtha, Shravana, Dhanishtha, Shatabhisha and Revati.</li>
        <li><strong className="text-foreground">Tithi and weekday:</strong> Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi or Trayodashi, on a Monday, Wednesday, Thursday or Friday. Not in <TermTip id="bhadra">Bhadra</TermTip>, the harsh Yogas, <TermTip id="gandanta">Gandanta</TermTip>, a Sankranti or eclipse day, an <TermTip id="adhikMaas">Adhik month</TermTip>, or while Jupiter or Venus is <TermTip id="taraAsta">Asta</TermTip>.</li>
      </ul>
      <p>These follow the Mundan (Chudakarana) rules Drik Panchang describes. Families also go by the child’s age (Drik Panchang notes the 3rd, 5th or 7th year for boys and even years for girls) and their own custom; the priest checks the child’s Moon and star (Chandra and Tara bala) and the Lagna on the day.</p>
    </>);
    case 'naamkaran': return box(<>
      <p>{common} Naamkaran is preferably done in the first half of the day, so only the windows from sunrise to midday are listed.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-foreground">Nakshatra:</strong> the fixed, movable, gentle and short stars — Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Uttara Phalguni, Hasta, Chitra, Swati, Anuradha, Uttara Ashadha, Shravana, Dhanishtha, Shatabhisha, Uttara Bhadrapada and Revati.</li>
        <li><strong className="text-foreground">Tithi and weekday:</strong> Pratipada, Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Dwadashi or Trayodashi of either paksha, on a Monday, Wednesday, Thursday or Friday. Not in <TermTip id="bhadra">Bhadra</TermTip>, the harsh Yogas, <TermTip id="gandanta">Gandanta</TermTip>, or on a Sankranti or eclipse day.</li>
      </ul>
      <p>Traditionally the naming is done on the 11th or 12th day after birth, and then no separate muhurat is needed; these dates are for a naming held later. Asta of Jupiter or Venus and Chaturmas are not considered for Naamkaran (Drik Panchang’s Namakarana rules).</p>
    </>);
    default: return null;
  }
}
