/**
 * /hi/kundli-milan — कुंडली मिलान हिंदी में (Batch 9b).
 * Same calculation as /kundali-match: it calls the SAME /api/kundali-match endpoint
 * (Ashtakoota engine verified against AstroSage, Manglik by the AstroSage convention —
 * Lagna AND Moon, houses 1/4/7/8/12). Only the labels and explanations are Hindi.
 * The boy/girl choice is explicit: the first box is always the boy (groom = A).
 */
import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { AutoTranslatedNotice } from '@/components/AutoTranslatedNotice';
import { CityPicker } from '@/components/CityPicker';
import { GunaMilanResultView } from '@/components/vedic/GunaMilanResultView';
import { birthQuery } from '@/lib/timezone/clientBirth';
import { type SavedCity, sanitizeName, NAME_MAX } from '@/services/savedProfile';
import type { GunaMilanResult } from '@/lib/vedic/matchmaking';
import type { ManglikAssessment } from '@/lib/vedic/manglik';
import { NAKSHATRA_HINDI } from '@/data/vedicTermsHindi';
import { RASHI_HI_LIST } from '@/lib/vedic/nameMatching';

const SITE = 'https://bornclock.com';
export const HINDI_MILAN_META = {
  title: 'कुंडली मिलान हिंदी में — 36 गुण मिलान व मांगलिक | BornClock',
  description: 'कुंडली मिलान हिंदी में: जन्म तिथि, समय और स्थान से 36 गुणों का अष्टकूट मिलान — वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट, नाड़ी — मांगलिक जाँच और सरल उपाय।',
  h1: 'कुंडली मिलान (गुण मिलान)',
};

export const HINDI_MILAN_FAQ = [
  { question: 'कुंडली मिलान में कितने गुण मिलने चाहिए?', answer: 'अष्टकूट मिलान 36 गुणों का होता है। परंपरा में 18 गुण न्यूनतम माने जाते हैं, 24 या अधिक अच्छे और 28 या अधिक उत्तम। साथ में नाड़ी, भकूट और मांगलिक दोष व उनके परिहार भी देखे जाते हैं।' },
  { question: 'यह कुंडली मिलान कैसे गणना करता है?', answer: 'दोनों की जन्म तिथि, समय और स्थान से चंद्रमा का नक्षत्र और राशि (लाहिड़ी अयनांश) निकाली जाती है, फिर आठों कूट गिने जाते हैं। जहाँ अलग-अलग सॉफ़्टवेयर में नियम अलग हैं, वहाँ BornClock AstroSage की पद्धति अपनाता है; हमारे अक्टूबर 2026 के परीक्षण में 7 में से 7 जोड़ों का कुल AstroSage से मेल खाया।' },
  { question: 'मांगलिक दोष कैसे देखा जाता है?', answer: 'मंगल को लग्न से और चंद्र से, दोनों जगह से देखा जाता है — भाव 1, 4, 7, 8 या 12 में हो तो मांगलिक गिना जाता है (दूसरा भाव नहीं गिना जाता)। दोनों जगह से हो तो उच्च, एक से हो तो निम्न। दोनों साथी मांगलिक हों तो दोष परस्पर निरस्त माना जाता है।' },
  { question: 'लड़का और लड़की का क्रम क्यों ज़रूरी है?', answer: 'वर्ण, वश्य और गण जैसे कूट लड़के से लड़की की ओर पढ़े जाते हैं, इसलिए क्रम बदलने से स्कोर बदल सकता है। इसलिए पहले खाने में लड़के का और दूसरे में लड़की का विवरण डालें।' },
  { question: 'जन्म समय पता न हो तो क्या करें?', answer: 'तब नाम से कुंडली मिलान एक अनुमान दे सकता है, पर वह सटीक नहीं होता। सटीक मिलान के लिए जन्म समय ज़रूरी है।' },
];

interface MatchPerson { rashi: string; nakshatra: string; pada: number; lagna: string }
interface ManglikMatch { status: 'clear' | 'mutual' | 'cancelled' | 'one-sided'; a?: ManglikAssessment; b?: ManglikAssessment }
interface MatchResponse { gunaMilan: GunaMilanResult; manglik?: ManglikMatch | null; people: { a: MatchPerson; b: MatchPerson }; warnings?: { samePerson?: boolean; minor?: boolean } }

// Engine sign names (vedicEngine.ts RASHI_NAMES) → index, for the Hindi rashi label.
const ENGINE_RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const rashiHi = (r: string) => { const i = ENGINE_RASHI.indexOf(r); return i >= 0 ? RASHI_HI_LIST[i] : r; };

/** Classical cancellation reasons (manglik.ts strings) in Hindi. */
export function cancellationHi(c: string): string {
  if (c.startsWith('Mars is in its own sign')) return 'मंगल अपनी ही राशि में है';
  if (c.startsWith('Mars is exalted')) return 'मंगल उच्च का है (मकर)';
  if (c === 'Jupiter aspects Mars') return 'गुरु की दृष्टि मंगल पर है';
  if (c === 'Venus aspects Mars') return 'शुक्र की दृष्टि मंगल पर है';
  return c;
}
const levelHi = (l: string) => (l === 'High' ? 'उच्च' : l === 'Low' ? 'निम्न' : 'नहीं');

/** One person's two Manglik checks, shown separately (founder decision). */
export function manglikLineHi(who: string, m: ManglikAssessment): string {
  const c = (from: string, h: number, p: boolean) => `${from} से मंगल ${h}वें भाव में (${p ? 'गिना जाता है' : 'नहीं गिना जाता'})`;
  return `${who}: ${m.hasDosha ? `मांगलिक (${levelHi(m.level)})` : 'मांगलिक नहीं'} — ${c('लग्न', m.fromLagna.house, m.fromLagna.present)}; ${c('चंद्र', m.fromMoon.house, m.fromMoon.present)}${m.cancelled ? `; शास्त्रीय परिहार: ${m.cancellations.map(cancellationHi).join('; ')}` : ''}।`;
}
export const MANGLIK_STATUS_HI: Record<ManglikMatch['status'], string> = {
  clear: 'किसी भी कुंडली में मांगलिक दोष नहीं है, इसलिए इस मिलान में यह कोई विषय नहीं है।',
  mutual: 'दोनों साथी मांगलिक हैं। परंपरा में दोनों के मांगलिक होने पर दोष परस्पर निरस्त माना जाता है — यह चिंता की बात नहीं।',
  cancelled: 'एक साथी मांगलिक है, पर शास्त्रीय परिहार लागू होता है, इसलिए इसे इस मिलान में चिंता का विषय नहीं माना जाता।',
  'one-sided': 'केवल एक साथी मांगलिक है और कोई शास्त्रीय परिहार लागू नहीं होता। परंपरा इसे ध्यान देने योग्य मानती है — शांति से, बाधा के रूप में नहीं। नीचे सरल उपाय दिए हैं।',
};
const MANGLIK_CONVENTION_HI = 'पद्धति: मंगल को लग्न और चंद्र, दोनों से देखा जाता है — भाव 1, 4, 7, 8 और 12 (दूसरा भाव नहीं गिना जाता)। दोनों से हो तो उच्च, एक से हो तो निम्न।';

function PersonForm({ who, name, setName, dob, setDob, time, setTime, city, setCity, today, reset }: {
  who: 'boy' | 'girl'; name: string; setName: (s: string) => void; dob: string; setDob: (s: string) => void;
  time: string; setTime: (s: string) => void; city: SavedCity | null; setCity: (c: SavedCity) => void; today: string; reset: () => void;
}) {
  const title = who === 'boy' ? 'लड़के का विवरण (वर)' : 'लड़की का विवरण (कन्या)';
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="font-semibold text-foreground">{title}</div>
      <input data-testid={`hkm-name-${who}`} type="text" value={name} maxLength={NAME_MAX} onChange={e => { setName(e.target.value); reset(); }}
             placeholder="नाम (वैकल्पिक)" aria-label={`${title} — नाम`} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
      <label className="block text-xs text-muted-foreground">जन्म तिथि
        <input data-testid={`hkm-dob-${who}`} type="date" value={dob} max={today} onChange={e => { setDob(e.target.value); reset(); }}
               className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
      </label>
      <label className="block text-xs text-muted-foreground">जन्म समय
        <input data-testid={`hkm-time-${who}`} type="time" value={time} onChange={e => { setTime(e.target.value); reset(); }}
               className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
      </label>
      <CityPicker testid={`hkm-city-${who}`} value={city} dob={dob} time={time} placeholder="जन्म स्थान (जैसे दिल्ली)" ariaLabel={`${title} — जन्म स्थान`} onPick={c => { setCity(c); reset(); }} />
    </div>
  );
}

export default function HindiKundliMilanPage() {
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const [nameB, setNameB] = useState(''); const [dobB, setDobB] = useState(''); const [timeB, setTimeB] = useState(''); const [cityB, setCityB] = useState<SavedCity | null>(null);
  const [nameG, setNameG] = useState(''); const [dobG, setDobG] = useState(''); const [timeG, setTimeG] = useState(''); const [cityG, setCityG] = useState<SavedCity | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reset = () => setResult(null);

  const ok = (dob: string, time: string, city: SavedCity | null) => /^\d{4}-\d{2}-\d{2}$/.test(dob) && dob <= today && /^\d{2}:\d{2}$/.test(time) && !!city;
  const canCalc = ok(dobB, timeB, cityB) && ok(dobG, timeG, cityG);
  const dispB = sanitizeName(nameB) || 'लड़का';
  const dispG = sanitizeName(nameG) || 'लड़की';

  const calculate = async () => {
    if (!canCalc || !cityB || !cityG) return;
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ ...birthQuery(dobB, timeB, cityB, 'A'), ...birthQuery(dobG, timeG, cityG, 'B'), groom: 'A' });
      const res = await fetch(`/api/kundali-match?${params.toString()}`);
      if (res.status === 400) { setError('कृपया जन्म विवरण जाँचें — तिथि, समय या स्थान सही नहीं लग रहा।'); return; }
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.gunaMilan) throw new Error('unavailable');
      setResult(data as MatchResponse);
    } catch { setError('मिलान सेवा अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर कोशिश करें।'); }
    finally { setLoading(false); }
  };

  const person = (p: MatchPerson) => `${rashiHi(p.rashi)} राशि, ${NAKSHATRA_HINDI[p.nakshatra] || p.nakshatra} नक्षत्र (चरण ${p.pada})`;

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="hi-kundli-milan-page"
      seo={<SEO title={HINDI_MILAN_META.title} description={HINDI_MILAN_META.description} canonicalUrl="/hi/kundli-milan" ogType="website"
                hreflang={[{ lang: 'en', url: `${SITE}/kundali-match/` }, { lang: 'hi', url: `${SITE}/hi/kundli-milan/` }]} />}
      breadcrumb={{ trail: [{ label: 'राशिफल', to: '/hi/rashifal/' }], current: 'कुंडली मिलान', edition: 'अष्टकूट · 36 गुण मिलान' }}
      footer={{
        tagline: 'पारंपरिक 36 गुण (अष्टकूट) कुंडली मिलान — हर कूट गणना के साथ।',
        nav: [{ label: 'नाम से कुंडली मिलान', to: '/hi/naam-se-kundli-milan/' }, { label: 'राशिफल', to: '/hi/rashifal/' }, { label: 'पंचांग', to: '/hi/panchang/' }, { label: 'उपाय', to: '/hi/upay/' }, { label: 'English', to: '/kundali-match/' }],
      }}
    >
      <FAQSchema items={HINDI_MILAN_FAQ} />
      <section className="section" lang="hi">
        <div className="section-head">
          <div><span className="eyebrow">गुण मिलान</span><h1>{HINDI_MILAN_META.h1}</h1></div>
          <p data-testid="hkm-answer">लड़के और लड़की की जन्म तिथि, जन्म समय और जन्म स्थान डालें — 36 में से कितने गुण मिलते हैं, आठों कूट, नाड़ी-भकूट दोष, मांगलिक जाँच और सरल उपाय, सब हिंदी में। 18 या अधिक गुण पारंपरिक रूप से स्वीकार्य माने जाते हैं।</p>
        </div>
        <AutoTranslatedNotice lang="hi" />
        <p className="text-sm text-muted-foreground" style={{ marginBottom: 12 }}>
          वही गणना जो हमारे अंग्रेज़ी <Link to="/kundali-match/" className="textlink" lang="en">Kundali Matching</Link> पेज पर है; अक्टूबर 2026 के हमारे परीक्षण में 7 में से 7 जोड़ों का कुल AstroSage से मेल खाया (<Link to="/accuracy/" className="textlink">हम सटीकता कैसे जाँचते हैं</Link>)।
          जन्म समय नहीं पता? <Link to="/hi/naam-se-kundli-milan/" className="textlink">नाम से कुंडली मिलान</Link> (अनुमान) देखें।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <PersonForm who="boy" name={nameB} setName={setNameB} dob={dobB} setDob={setDobB} time={timeB} setTime={setTimeB} city={cityB} setCity={setCityB} today={today} reset={reset} />
          <PersonForm who="girl" name={nameG} setName={setNameG} dob={dobG} setDob={setDobG} time={timeG} setTime={setTimeG} city={cityG} setCity={setCityG} today={today} reset={reset} />
        </div>
        <p className="text-xs text-muted-foreground mb-3">मिलान लड़के से लड़की की ओर पढ़ा जाता है, इसलिए क्रम मायने रखता है। <TermTip id="matchDirection" lang="hi" iconOnly /></p>
        <button data-testid="hkm-calculate-btn" onClick={calculate} disabled={!canCalc || loading} className="btn" style={{ width: '100%' }}>
          {loading ? 'मिलान हो रहा है…' : 'कुंडली मिलाएँ →'}
        </button>
        {error && <p data-testid="hkm-error" className="subtle" style={{ marginTop: 12 }}>{error}</p>}
      </section>

      <section className="section white" lang="hi">
        {result && (
          <div data-testid="hkm-result" className="space-y-4">
            {result.warnings?.samePerson && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">⚠️ दोनों के जन्म विवरण एक जैसे हैं — कृपया जाँच लें।</p>}
            {result.warnings?.minor && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">⚠️ एक व्यक्ति की आयु 18 वर्ष से कम है। यह मिलान केवल जानकारी के लिए है।</p>}
            <p data-testid="hkm-people" className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{dispB}</span> (वर): {person(result.people.a)}
              <br /><span className="font-medium text-foreground">{dispG}</span> (कन्या): {person(result.people.b)}
            </p>
            <GunaMilanResultView result={result.gunaMilan} lang="hi" manglikStatus={result.manglik?.status} testid="hkm" />
            {result.manglik && (
              <div data-testid="hkm-manglik" className={`rounded-xl border p-4 text-sm ${result.manglik.status === 'one-sided' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                <div className="font-semibold mb-1">{result.manglik.status === 'one-sided' ? '⚠️' : '✓'} <TermTip id="manglik" lang="hi">मांगलिक</TermTip> जाँच</div>
                <p>{MANGLIK_STATUS_HI[result.manglik.status]}</p>
                {result.manglik.a && result.manglik.b && (
                  <ul data-testid="hkm-manglik-checks" className="mt-2 list-disc pl-5 space-y-0.5 text-xs">
                    <li>{manglikLineHi(dispB, result.manglik.a)}</li>
                    <li>{manglikLineHi(dispG, result.manglik.b)}</li>
                  </ul>
                )}
                <p className="mt-1 text-xs opacity-80">{MANGLIK_CONVENTION_HI}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              विवाह के अनुकूल समय की अवधि और दक्षिण भारतीय 10-पोरुथम के लिए <Link to="/kundali-match/" className="textlink" lang="en">English Kundali Matching</Link> पेज देखें।
            </p>
          </div>
        )}

        <div data-testid="hkm-faq" className="space-y-2" style={{ marginTop: 24 }}>
          <h2 className="text-lg font-bold text-foreground">सामान्य प्रश्न</h2>
          {HINDI_MILAN_FAQ.map(f => (
            <details key={f.question} className="rounded-lg border border-border p-3 text-sm">
              <summary className="cursor-pointer font-medium text-foreground">{f.question}</summary>
              <p className="mt-2 text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </PajPage>
  );
}
