import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { KundaliChart } from '@/components/KundaliChart';
import { geocodeCity, type GeoResult } from '@/services/geocoding';
import { fetchKundali, buildInterpretation, hasProkeralaKey, type KundaliData } from '@/services/kundaliService';
import { reportPrice, resolveCurrency } from '@/lib/pricing';

export default function KundaliPage() {
  const price = reportPrice(resolveCurrency());
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [options, setOptions] = useState<GeoResult[]>([]);
  const [city, setCity] = useState<GeoResult | null>(null);
  const [data, setData] = useState<KundaliData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const validDob = /^\d{4}-\d{2}-\d{2}$/.test(dob);
  const validTime = /^\d{2}:\d{2}$/.test(time);
  const canGenerate = validDob && validTime && !!city;

  const onCity = async (v: string) => {
    setCityQuery(v); setCity(null); setData(null);
    if (v.trim().length >= 3) { try { setOptions(await geocodeCity(v)); } catch { setOptions([]); } }
    else setOptions([]);
  };
  const pickCity = (c: GeoResult) => { setCity(c); setCityQuery(c.name); setOptions([]); };

  const generate = async () => {
    if (!canGenerate || !city) return;
    setLoading(true); setFailed(false);
    try {
      setData(await fetchKundali(dob, time, { lat: city.lat, lon: city.lon, tz: city.utcOffset }));
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
        <p className="text-muted-foreground mb-6">
          Your Vedic birth chart with planetary positions, Lagna, Nakshatra and Dasha — accurate sidereal (Lahiri) astronomy. Full report {price}.
        </p>

        {!hasProkeralaKey() && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            Complete Kundali requires ProKerala API key (free at prokerala.com/developers). Your core chart below is computed with the Swiss Ephemeris.
          </p>
        )}

        <div className="bg-card/60 border border-border rounded-xl p-5 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="kundali-dob">Date of birth</label>
              <input id="kundali-dob" data-testid="kundali-dob" type="date" value={dob}
                     onChange={e => { setDob(e.target.value); setData(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="kundali-time">Birth time</label>
              <input id="kundali-time" data-testid="kundali-time" type="time" value={time}
                     onChange={e => { setTime(e.target.value); setData(null); }}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div className="relative">
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="kundali-city">Birth city</label>
              <input id="kundali-city" data-testid="kundali-city" type="text" value={cityQuery}
                     onChange={e => onCity(e.target.value)} placeholder="e.g. Delhi"
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
              {options.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
                  {options.map((o, i) => (
                    <li key={`${o.name}-${i}`}>
                      <button type="button" onClick={() => pickCity(o)} className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-gray-900">
                        {o.name}{o.state ? `, ${o.state}` : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button data-testid="kundali-generate-btn" onClick={generate} disabled={!canGenerate || loading}
                  className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Generating…' : 'Generate my Kundali →'}
          </button>
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
              <h2 className="font-semibold mb-2">Your chart, interpreted</h2>
              {buildInterpretation(data)}
            </div>

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
