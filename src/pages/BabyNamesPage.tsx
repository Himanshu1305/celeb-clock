import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { NAKSHATRA_PADA_AKSHARAS, NAKSHATRA_LIST } from '@/data/nakshatraAksharas';
import { namesForPada, type Gender } from '@/data/babyNamesByAkshara';
import { NAKSHATRA_HINDI } from '@/data/vedicTermsHindi';
import { PageFAQ } from '@/components/PageFAQ';
import { CityPicker } from '@/components/CityPicker';
import { birthQuery } from '@/lib/timezone/clientBirth';
import type { SavedCity } from '@/services/savedProfile';

const GENDER_STYLE: Record<Gender, string> = {
  boy: 'bg-sky-100 text-sky-700',
  girl: 'bg-rose-100 text-rose-700',
  unisex: 'bg-violet-100 text-violet-700',
};
const nakSlug = (n: string) => n.toLowerCase().replace(/\s+/g, '-');

export default function BabyNamesPage() {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [city, setCity] = useState<SavedCity | null>(null);
  const [nakshatra, setNakshatra] = useState('');
  // N5: the pada decides the ONE naming syllable. 0 = not known yet.
  const [pada, setPada] = useState(0);
  const [computing, setComputing] = useState(false);
  const [failed, setFailed] = useState(false);

  const padaRow = nakshatra ? (NAKSHATRA_PADA_AKSHARAS[nakshatra] || []) : [];
  // When the pada is known, show only that pada's syllable and names.
  const shownPadas = pada >= 1 && pada <= 4 ? [pada] : [1, 2, 3, 4];

  const computeFromBirth = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !/^\d{2}:\d{2}$/.test(time) || !city) return;
    setComputing(true); setFailed(false);
    try {
      // fix-timezone-accuracy: this was hard-coded to Delhi/IST for every baby, so a birth
      // abroad got the wrong Moon. Now the real birthplace + its zone for that date.
      const params = new URLSearchParams(birthQuery(dob, time, city));
      const res = await fetch(`/api/vedic-profile?${params.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (data?.nakshatra?.nakshatra) {
        setNakshatra(data.nakshatra.nakshatra);
        const p = Number(data.nakshatra.pada);
        setPada(Number.isInteger(p) && p >= 1 && p <= 4 ? p : 0);
      }
      else throw new Error('no nakshatra');
    } catch { setFailed(true); }
    finally { setComputing(false); }
  };

  return (
    <ToolLayout
      theme="neutral"
      testId="baby-names-page"
      seo={(
        <SEO
          title="Baby Names by Nakshatra — Birth Star Name Syllables | BornClock"
          description="Find auspicious baby-name starting syllables (aksharas) by Nakshatra (birth star), the traditional Vedic way. Enter the birth details or pick the Nakshatra directly."
          canonicalUrl="/baby-names"
          ogType="website"
        />
      )}
      breadcrumb={{ current: 'Baby Names' }}
      h1="Baby Names by Nakshatra"
      lead={<>In the Vedic tradition, a baby's name begins with an auspicious syllable (akshara) determined by the Moon's Nakshatra at birth.</>}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="rounded-xl border border-border p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-dob">Baby's date of birth</label>
              <input id="baby-dob" data-testid="baby-dob-input" type="date" value={dob}
                     onChange={e => setDob(e.target.value)}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-time">Birth time (for accuracy)</label>
              <input id="baby-time" data-testid="baby-time-input" type="time" value={time}
                     onChange={e => setTime(e.target.value)}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-city">Birth city</label>
            <CityPicker id="baby-city" testid="baby-city-input" value={city} onPick={setCity} dob={dob} time={time} />
          </div>
          <button data-testid="baby-compute-btn" onClick={computeFromBirth}
                  disabled={computing || !city || !/^\d{4}-\d{2}-\d{2}$/.test(dob) || !/^\d{2}:\d{2}$/.test(time)}
                  className="w-full py-2.5 rounded-lg bg-[#0E2238] text-white font-semibold hover:bg-[#0E2238] disabled:opacity-50">
            {computing ? 'Finding Nakshatra…' : 'Find Nakshatra from birth details →'}
          </button>
          {failed && <p className="text-xs text-muted-foreground">Couldn't compute the Nakshatra automatically — pick it below instead.</p>}

          <div>
            <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-nakshatra">Or pick the Nakshatra</label>
            <select id="baby-nakshatra" data-testid="baby-nakshatra-select" value={nakshatra}
                    onChange={e => { setNakshatra(e.target.value); setPada(0); }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value="">Select Nakshatra…</option>
              {NAKSHATRA_LIST.map(n => <option key={n} value={n}>{n} {NAKSHATRA_HINDI[n] || ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1" htmlFor="baby-pada">Pada (quarter) — needs the exact birth time</label>
            <select id="baby-pada" data-testid="baby-pada-select" value={pada}
                    onChange={e => setPada(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value={0}>Not sure — show all four</option>
              {[1, 2, 3, 4].map(p => <option key={p} value={p}>Pada {p}</option>)}
            </select>
          </div>
        </div>

        {nakshatra && (
          <div data-testid="baby-aksharas" className="rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-1">
              {nakshatra} {NAKSHATRA_HINDI[nakshatra] || ''} — auspicious starting sounds
            </h2>
            {pada >= 1 && pada <= 4 && padaRow[pada - 1] ? (
              <p className="text-sm text-muted-foreground mb-3" data-testid="baby-pada-syllable">
                Born in pada {pada} of {nakshatra}, the traditional starting syllable is{' '}
                <strong className="text-foreground">“{padaRow[pada - 1].en}” <span lang="hi">({padaRow[pada - 1].hi})</span></strong>.
                Only this one syllable applies — the other three belong to the other padas.{' '}
                <Link to={`/nakshatra/${nakSlug(nakshatra)}`} className="underline">About {nakshatra} →</Link>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">
                Each of this star's four padas (quarters) has its own starting syllable, and only ONE applies to a baby — the one for the pada the Moon was in at birth. Enter the exact birth time above (or pick the pada) to narrow it to one.{' '}
                <Link to={`/nakshatra/${nakSlug(nakshatra)}`} className="underline">About {nakshatra} →</Link>
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-5">
              {padaRow.map((a, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-lg border font-semibold ${pada === i + 1 ? 'bg-primary/10 border-primary text-foreground' : pada ? 'bg-muted border-border text-muted-foreground' : 'bg-muted border-border text-foreground'}`}>Pada {i + 1}: {a.en} <span lang="hi">({a.hi})</span></span>
              ))}
            </div>

            <div className="space-y-4">
              {shownPadas.map(p => {
                const a = padaRow[p - 1];
                if (!a) return null;
                const names = namesForPada(nakshatra, p);
                return (
                  <div key={p} data-testid="baby-akshara-group">
                    <h3 className="text-sm font-semibold text-foreground mb-1">Pada {p} — names starting with “{a.en}” <span lang="hi">({a.hi})</span></h3>
                    {names.length === 0 ? (
                      <p className="text-xs text-muted-foreground">We’re still curating names for this sound — any name beginning with “{a.en}” ({a.hi}) is traditionally suitable.</p>
                    ) : (
                      <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                        {names.map(n => (
                          <li key={n.name} className="text-sm flex items-baseline gap-2">
                            <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${GENDER_STYLE[n.gender]}`}>{n.gender}</span>
                            <span><strong className="text-foreground">{n.name}</strong> <span lang="hi" className="text-muted-foreground">{n.hi}</span> <span className="text-muted-foreground">— {n.meaning}</span>{' '}<a href={n.source} data-testid="bn-source" className="text-[10px] text-muted-foreground underline" rel="noopener noreferrer" target="_blank">Source</a></span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">A short, checked list: every meaning comes from a published name reference or Sanskrit/Hindi dictionary (see the “Source” link next to each name). It is a starting point, not a complete register. Names are matched by their first Devanagari syllable (consonant and vowel).</p>
          </div>
        )}

        {nakshatra && (
          <div className="mt-8">
            <PageFAQ items={[
              { question: 'How does Nakshatra decide a baby’s name?', answer: 'Vedic tradition (Namakaran) assigns each of a Nakshatra’s four padas a starting syllable (akshara). The baby’s name ideally begins with the syllable of the pada the Moon occupied at birth — so an exact birth time pins the pada, while the Nakshatra alone gives four possible syllables.' },
              { question: 'Do I have to use these syllables?', answer: 'It is a tradition, not a rule. Many families follow it for the first (naming-ceremony) name and choose a everyday name freely. The meanings here are offered to help you choose thoughtfully.' },
              { question: 'How do I find my baby’s exact Nakshatra and pada?', answer: 'Enter the birth date and time above, or generate a free Kundli — it computes the Moon’s Nakshatra and pada precisely from the birth details.' },
            ]} />
          </div>
        )}

        <div className="mt-10" data-testid="baby-nakshatra-links">
          <h2 className="font-semibold text-foreground mb-2">Baby names for each Nakshatra</h2>
          <div className="flex flex-wrap gap-2">
            {NAKSHATRA_LIST.map(n => (
              <Link key={n} to={`/baby-names/nakshatra/${nakSlug(n)}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{n}</Link>
            ))}
          </div>
        </div>

        <div className="mt-10 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-3">Want your baby's full Vedic birth chart?</p>
          <Link to="/kundali/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">
            Generate the Kundali →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
