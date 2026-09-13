import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { KundaliChart } from '@/components/KundaliChart';
import { KundaliTabs } from '@/components/KundaliTabs';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { ChartEventNotice } from '@/components/ChartEventNotice';
import { ReadingHistory } from '@/components/ReadingHistory';
import { recordReading } from '@/services/readingHistory';
import { mergeProfile } from '@/services/savedProfile';
import { fetchKundali, buildInterpretationBlocks, type KundaliData } from '@/services/kundaliService';
import { fetchReading, type ReadingPayload } from '@/services/readingService';
import { VedicReading } from '@/components/reading/VedicReading';
import { reportPrice, resolveCurrency } from '@/lib/pricing';

export default function KundaliPage() {
  const price = reportPrice(resolveCurrency(undefined));
  const { profile, save, loaded, isFull } = useSavedProfile();
  const [usingDifferent, setUsingDifferent] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const [data, setData] = useState<KundaliData | null>(null);
  const [displayName, setDisplayName] = useState('');   // Part P: optional name for headings only
  const [historyKey, setHistoryKey] = useState(0);      // Part P: bump to refresh reading history
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reading, setReading] = useState<ReadingPayload | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingFailed, setReadingFailed] = useState(false);

  // Progressive profile (Part J): a FULL saved profile is reused outright; a PARTIAL
  // one (e.g. just a date) pre-fills what's known and prompts only for the missing pieces.
  const usingSaved = isFull && !usingDifferent;
  const hasPartial = !!profile && !isFull && !usingDifferent;
  const initial = (usingSaved || hasPartial) ? { dob: profile!.dob, time: profile!.time, city: profile!.city, name: profile!.name } : undefined;

  const generate = async (details: BirthDetails) => {
    setLoading(true); setFailed(false); setReading(null); setReadingFailed(false);
    setDisplayName(details.name ?? ''); // display/identification only — never sent to any calculation
    const loc = { lat: details.city.lat, lon: details.city.lon, tz: details.city.tz };
    try {
      const k = await fetchKundali(details.dob, details.time, loc);
      setData(k);
      // Explicit opt-in only: persist just when the user ticked the box (or when
      // regenerating their already-saved profile after an edit).
      // Consent-respecting: full re-save refreshes an existing full profile; a partial
      // profile is only EXTENDED to full when the user explicitly ticks "save" (shown
      // via showSaveOption below) — never silently expanded.
      const hasSavedProfile = saveChecked || usingSaved;
      if (hasSavedProfile) {
        save({ dob: details.dob, time: details.time, city: details.city, name: details.name });
      }
      // Part P.3: record a device-local reading-history snapshot — ONLY for a saved
      // profile (same consent as saving birth data). Reuses already-computed facts.
      recordReading({
        dob: details.dob, rashi: k.rashi ?? '—', lagna: k.lagna.sign,
        nakshatra: k.nakshatra?.nakshatra ?? '—',
        dasha: k.dasha ? `${k.dasha.mahadasha} / ${k.dasha.antardasha}` : '—',
      }, hasSavedProfile);
      setHistoryKey(x => x + 1);
      setReadingLoading(true);
      try { setReading(await fetchReading(details.dob, details.time, loc)); }
      catch { setReadingFailed(true); }
      finally { setReadingLoading(false); }
    } catch { setFailed(true); }
    finally { setLoading(false); }
  };

  const shareText = data
    ? `My Kundali: ${data.lagna.sign} Lagna, ${data.rashi} Rashi, ${data.nakshatra.nakshatra} Nakshatra. Get yours at https://bornclock.com/kundali`
    : '';
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText).replace(/'/g, '%27')}`;

  return (
    <div data-testid="kundali-page" className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Free Kundali (Janam Kundali) — Birth Chart & Dasha | BornClock"
        description="Generate your free Vedic Kundali (Janam Kundali) — North Indian birth chart, planetary positions, Lagna, Nakshatra and Vimshottari Dasha, computed with the Swiss Ephemeris."
        canonicalUrl="/kundali"
        ogType="website"
      />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Free Kundali (Janam Kundali)
        </h1>
        <p className="text-muted-foreground mb-4">
          Your Vedic birth chart with planetary positions, Lagna, Nakshatra and Dasha — accurate sidereal (Lahiri) astronomy. Full report {price}.
        </p>

        <KundaliTabs active="kundali" />

        {/* Chart-event notifications (Part P): only for a user with a full saved profile.
            The notice itself renders only when they've opted in AND something is due. */}
        {loaded && isFull && (
          <div className="mb-4 space-y-3">
            <ChartEventNotice profile={profile} />
            <label data-testid="kundali-notify-optin" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={!!profile?.notifyOptIn}
                     onChange={e => save(mergeProfile(profile, { notifyOptIn: e.target.checked }))}
                     className="h-4 w-4 rounded border-border" />
              🔔 Notify me in-app about upcoming events in my chart (Dasha changes, Sade Sati, favourable windows)
            </label>
          </div>
        )}

        {/* Saved-profile banner: shown only once the user has explicitly saved. */}
        {loaded && usingSaved && (
          <div data-testid="saved-profile-banner" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm">
            <span className="text-indigo-900">
              ★ Using your saved birth details — <strong>{profile!.dob}</strong>, {profile!.time}, {profile!.city.name}
            </span>
            <button data-testid="use-different-details" type="button"
                    onClick={() => { setUsingDifferent(true); setSaveChecked(false); setData(null); }}
                    className="text-indigo-700 underline hover:text-indigo-900">
              Use different details
            </button>
          </div>
        )}

        {/* Progressive: only a date is saved so far — pre-fill it and ask only for the rest. */}
        {loaded && hasPartial && (
          <div data-testid="partial-profile-banner" className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            ★ We’ve filled in your saved birth date (<strong>{profile!.dob}</strong>) — just add your birth time and place below to see your full Kundali.
          </div>
        )}

        <div className="mb-8">
          <BirthDetailsForm
            key={usingSaved ? 'saved' : 'new'}
            testIdPrefix="kundali"
            initial={initial}
            submitLabel="Generate my Kundali →"
            loading={loading}
            onSubmit={generate}
            showSaveOption={!usingSaved}
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
          />
        </div>

        {failed && (
          <p className="text-sm text-muted-foreground mb-6">
            Kundali service is temporarily unavailable. Please try again shortly.
          </p>
        )}

        {data && (
          <div className="space-y-6">
            <KundaliChart lagnaSignIndex={data.lagna.signIndex} planets={data.planets} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div data-testid="kundali-lagna" className="rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Lagna</span>
                <div className="font-semibold text-foreground">{data.lagna.sign}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Rashi</span>
                <div className="font-semibold text-foreground">{data.rashi} {data.rashi_devanagari}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Nakshatra</span>
                <div className="font-semibold text-foreground">{data.nakshatra.nakshatra} · {data.nakshatra.pada}</div>
              </div>
              {data.dasha && (
                <div data-testid="kundali-dasha" className="rounded-lg border border-border p-3">
                  <span className="text-muted-foreground">Dasha</span>
                  <div className="font-semibold text-foreground">{data.dasha.mahadasha}/{data.dasha.antardasha}</div>
                </div>
              )}
            </div>

            <table data-testid="planet-table" className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr><th className="text-left px-3 py-2">Planet</th><th className="text-left px-3 py-2">Sign</th><th className="text-left px-3 py-2">House</th><th className="text-left px-3 py-2">Degrees</th></tr>
              </thead>
              <tbody>
                {data.planets.map(p => (
                  <tr key={p.name} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">{p.name}{p.retrograde ? ' (R)' : ''}</td>
                    <td className="px-3 py-2 text-foreground">{p.sign}</td>
                    <td className="px-3 py-2 text-foreground">{p.house}</td>
                    <td className="px-3 py-2 text-foreground">{(p.longitude % 30).toFixed(1)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div data-testid="kundali-interpretation" className="rounded-lg border border-border p-4 text-sm text-foreground leading-relaxed">
              <h2 data-testid="kundali-interp-heading" className="font-semibold mb-3">
                {displayName ? `${displayName}’s chart, interpreted` : 'Your chart, interpreted'}
              </h2>
              <div className="space-y-3">
                {buildInterpretationBlocks(data).map((b, i) => (
                  <div key={i} data-testid="kundali-interp-block">
                    <div className="font-semibold text-foreground">{b.title}</div>
                    <p className="text-muted-foreground">{b.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Your personal reading</h2>
              <p className="text-sm text-muted-foreground mb-4">
                A plain-language reading of your chart, organised by life area. Traditional guidance — offered
                thoughtfully, never as certainty.
              </p>
              {readingLoading && (
                <p data-testid="reading-loading" className="text-sm text-muted-foreground">Preparing your reading…</p>
              )}
              {readingFailed && !readingLoading && (
                <p data-testid="reading-failed" className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Your written reading couldn’t be loaded just now, but your full chart above is ready. Please try
                  again in a little while for the narrated version.
                </p>
              )}
              {reading && <VedicReading payload={reading} />}
            </div>

            {/* Reading history (Part P.3): device-local continuity, shown only for a
                saved profile (same consent as saving birth data). */}
            {loaded && !!profile && <ReadingHistory dob={profile.dob} refreshKey={historyKey} />}

            <div className="flex flex-wrap gap-3">
              <a data-testid="kundali-whatsapp-share" href={whatsappHref} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 bg-green-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-green-700">
                Share on WhatsApp
              </a>
              <Link to="/birthday-report/gift" className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-indigo-700">
                Gift a Kundali ({price}) →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-3">Want the full {price} Vedic report with remedies and predictions?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/birthday-report" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">
              Get the complete report →
            </Link>
            <Link to="/birthday-report/gift" className="inline-flex items-center gap-2 border border-primary text-primary rounded-lg px-6 py-3 font-semibold">
              Gift a Kundali ({price}) →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
