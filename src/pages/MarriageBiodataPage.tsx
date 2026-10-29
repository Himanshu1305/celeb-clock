/**
 * /marriage-biodata-maker — marriage biodata maker (Batch 10): a form in the browser → a
 * printable A4 PDF through the Kundali-PDF print path (src/lib/pdf/biodataPdfHtml.ts +
 * printHtmlViaIframe). Three templates, English / Hindi labels, optional photo, and the
 * horoscope section can be filled from a birth chart computed in the browser
 * (src/lib/vedic/biodataHoroscope.ts). Nothing is sent to or stored on a server.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { CityPicker } from '@/components/CityPicker';
import { TermTip } from '@/components/vedic/TermTip';
import { ToolFaq, ToolSources } from '@/components/tools/ToolFaq';
import type { SavedCity } from '@/services/savedProfile';
import { resolveForPlace } from '@/lib/timezone/clientBirth';
import { printHtmlViaIframe } from '@/lib/pdf/printHtml';
import {
  buildBiodataHtml, BIODATA_LABELS, BIODATA_SECTIONS,
  type BiodataData, type BiodataLang, type BiodataTemplate,
} from '@/lib/pdf/biodataPdfHtml';

export const BIODATA_PATH = '/marriage-biodata-maker';
export const BIODATA_META = {
  title: 'Marriage Biodata Maker — Printable PDF, Hindi/English | BornClock',
  description: 'Make a marriage biodata in minutes: personal, family, education and horoscope details (rashi, nakshatra, Manglik from your birth chart), three clean templates, Hindi or English, saved as an A4 PDF.',
};

type Key = Exclude<keyof BiodataData, 'photo'>;
const LONG: Key[] = ['hobbies', 'siblings', 'expectations', 'address'];
const PLACEHOLDER: Partial<Record<Key, string>> = {
  height: "e.g. 5' 6\"", maritalStatus: 'e.g. Never married', diet: 'e.g. Vegetarian', education: 'e.g. B.Tech, IIT Delhi',
  income: 'optional', siblings: 'e.g. 1 elder brother (married)', familyType: 'e.g. Nuclear / Joint', gotra: 'e.g. Kashyap', expectations: 'A few lines about yourself and the partner you hope for',
};

const TEMPLATES: Array<{ id: BiodataTemplate; label: string }> = [
  { id: 'classic', label: 'Classic (maroon border)' },
  { id: 'modern', label: 'Modern (clean)' },
  { id: 'traditional', label: 'Traditional (saffron)' },
];

const FAQ = [
  { q: 'Is my biodata stored anywhere?', a: 'No. Everything you type, and any photo you add, stays in this browser tab. The PDF is made on your device with your browser’s print dialog (“Save as PDF”). We do not send it to our servers or keep a copy — when you close the tab, it is gone, so save the PDF. The one exception: if you press “Search more places” for the birth place, only that place name is looked up online (OpenStreetMap) and it is not stored.' },
  { q: 'What should a marriage biodata include?', a: 'The usual sections are personal details (name, date, time and place of birth, height, education, work), family details (parents, siblings, native place), horoscope details (rashi, nakshatra, gotra, Manglik status) and contact details. Leave any field blank to keep it off the page.' },
  { q: 'How are rashi, nakshatra and Manglik filled in?', a: 'Enter the birth date, exact time and place and press “Fill from birth chart”. The browser computes the chart with the same sidereal (Lahiri) engine as our Kundali: rashi is the Moon’s sign, nakshatra is the Moon’s star with its pada, and Manglik follows our stated rule — Mars in the 1st, 4th, 7th, 8th or 12th house from the Lagna or the Moon. You can edit any value.' },
  { q: 'Why do I type the gotra myself?', a: 'Gotra is a family lineage passed down in the family, not something calculated from the stars, so only your family can fill it in.' },
  { q: 'How do I save it as a PDF on my phone?', a: 'Press “Download PDF”. Your phone’s print screen opens — choose “Save as PDF” (Android) or use Share → Save to Files (iPhone). The page is A4.' },
];

/** Downscale a picked photo to ≤ 600px JPEG so the printed page stays light. */
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const ctx = c.getContext('2d');
        if (!ctx) { resolve(String(fr.result)); return; }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('not an image'));
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

function Preview({ html }: { html: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / 794));
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="w-full overflow-hidden rounded-lg border border-border bg-white" style={{ height: 1123 * scale }} data-testid="bd-preview">
      <iframe title="Biodata preview" srcDoc={html} sandbox="" style={{ width: 794, height: 1123, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }} />
    </div>
  );
}

export default function MarriageBiodataPage() {
  const [data, setData] = useState<BiodataData>({});
  const [lang, setLang] = useState<BiodataLang>('en');
  const [template, setTemplate] = useState<BiodataTemplate>('classic');
  const [invocation, setInvocation] = useState('');
  const [footer, setFooter] = useState(true);
  const [city, setCity] = useState<SavedCity | null>(null);
  const [horoMsg, setHoroMsg] = useState<string | null>(null);
  const L = BIODATA_LABELS[lang];

  const set = (k: keyof BiodataData, v: string | null) => setData(d => ({ ...d, [k]: v }));
  const html = useMemo(() => buildBiodataHtml(data, { template, lang, invocation, footer }), [data, template, lang, invocation, footer]);

  const fillHoroscope = async () => {
    if (!data.dob || !/^\d{2}:\d{2}$/.test(data.birthTime ?? '') || !city) {
      setHoroMsg('Enter the date of birth, the exact birth time and pick the birth place first.');
      return;
    }
    try {
      const { biodataHoroscope } = await import('@/lib/vedic/biodataHoroscope');
      const utc = new Date(resolveForPlace(data.dob, data.birthTime!, city).utcISO);
      const h = biodataHoroscope(utc, city.lat, city.lon, lang);
      setData(d => ({ ...d, rashi: h.rashi, nakshatra: h.nakshatra, lagna: h.lagna, manglik: h.manglik, birthPlace: d.birthPlace || city.name }));
      setHoroMsg('Filled from the birth chart (sidereal, Lahiri). You can edit any value.');
    } catch (e) {
      console.error(e);
      setHoroMsg('Sorry — the chart could not be computed for these details.');
    }
  };

  const field = (k: Key) => (
    <label key={k} className={`text-sm ${LONG.includes(k) ? 'sm:col-span-2' : ''}`}>
      <span className="block text-muted-foreground mb-1">{L[k]}</span>
      {k === 'dob' ? (
        <input data-testid={`bd-${k}`} type="date" value={data.dob ?? ''} onChange={e => set(k, e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
      ) : k === 'birthTime' ? (
        <input data-testid={`bd-${k}`} type="time" value={data.birthTime ?? ''} onChange={e => set(k, e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
      ) : LONG.includes(k) ? (
        <textarea data-testid={`bd-${k}`} rows={2} value={(data[k] as string) ?? ''} placeholder={PLACEHOLDER[k]} onChange={e => set(k, e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
      ) : (
        <input data-testid={`bd-${k}`} value={(data[k] as string) ?? ''} placeholder={PLACEHOLDER[k]} onChange={e => set(k, e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
      )}
    </label>
  );

  return (
    <ToolLayout
      theme="vedic"
      testId="biodata-page"
      seo={<SEO title={BIODATA_META.title} description={BIODATA_META.description}
        keywords="marriage biodata maker, biodata for marriage, marriage biodata format, biodata in hindi, biodata pdf"
        canonicalUrl={BIODATA_PATH} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Kundali matching', to: '/kundali-match' }], current: 'Marriage biodata' }}
      footer={{ tagline: 'Marriage biodata, made on your device.', nav: [{ label: 'Kundali', to: '/kundali' }, { label: 'Kundali matching', to: '/kundali-match' }, { label: 'Manglik check', to: '/manglik' }], note: 'Nothing you type is stored on our servers.' }}
      eyebrow="Marriage biodata maker"
      h1="Marriage Biodata Maker"
      lead="Fill in the details, pick a template and save a clean A4 PDF. Rashi, nakshatra and Manglik can be filled from your birth chart. Everything stays on your device — nothing is stored on our servers."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <p className="text-sm rounded-lg border border-border bg-muted/40 px-4 py-3 mb-6" data-testid="bd-privacy">
            <strong>Private by design:</strong> your details and photo stay in this browser tab. The PDF is created on your device; we do not upload, save or see it. Close the tab and it is gone — so download your PDF. (Only if you press “Search more places” is the birth-place name looked up online, without being stored.)
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6 min-w-0" data-testid="bd-form">
              <div className="rounded-xl border border-border p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <label>
                  <span className="block text-muted-foreground mb-1">Labels</span>
                  <select data-testid="bd-lang" value={lang} onChange={e => setLang(e.target.value as BiodataLang)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground">
                    <option value="en">English</option><option value="hi">हिंदी (Hindi)</option>
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <span className="block text-muted-foreground mb-1">Template</span>
                  <select data-testid="bd-template" value={template} onChange={e => setTemplate(e.target.value as BiodataTemplate)} className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground">
                    {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </label>
                <label className="sm:col-span-3">
                  <span className="block text-muted-foreground mb-1">Line at the top (optional)</span>
                  <input data-testid="bd-invocation" value={invocation} onChange={e => setInvocation(e.target.value)} placeholder="e.g. || Shri Ganeshaya Namah ||" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
                </label>
              </div>

              {BIODATA_SECTIONS.map(sec => (
                <fieldset key={sec.id} className="rounded-xl border border-border p-4" data-testid={`bd-sec-${sec.id}`}>
                  <legend className="px-1 font-semibold text-foreground">{L[sec.id]}</legend>
                  {sec.id === 'horoscope' && (
                    <div className="mb-3 text-sm space-y-2">
                      <p className="text-muted-foreground">Fill <TermTip id="rashi">rashi</TermTip>, <TermTip id="nakshatra">nakshatra</TermTip>, <TermTip id="lagna">lagna</TermTip> and <TermTip id="manglik">Manglik</TermTip> from the birth chart (needs date, exact time and place). <TermTip id="gotra">Gotra</TermTip> is typed in by you.</p>
                      <div className="relative">
                        <CityPicker testid="bd-city" value={city} onPick={setCity} dob={data.dob} time={data.birthTime} placeholder="Birth place (e.g. Indore)" />
                      </div>
                      <button data-testid="bd-fill-horo" type="button" onClick={fillHoroscope} className="rounded-lg border border-primary text-primary px-4 py-2 font-semibold">Fill from birth chart</button>
                      {horoMsg && <p className="text-xs text-muted-foreground" data-testid="bd-horo-msg">{horoMsg}</p>}
                    </div>
                  )}
                  {sec.id === 'personal' && (
                    <label className="text-sm block mb-3">
                      <span className="block text-muted-foreground mb-1">Photo (optional — stays on your device)</span>
                      <input data-testid="bd-photo" type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) { try { set('photo', await readPhoto(f)); } catch { /* ignore non-images */ } } }} className="text-sm max-w-full" />
                      {data.photo && <button type="button" className="ml-2 text-xs underline" onClick={() => set('photo', null)}>Remove photo</button>}
                    </label>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{sec.fields.map(field)}</div>
                </fieldset>
              ))}

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={footer} onChange={e => setFooter(e.target.checked)} className="h-4 w-4" data-testid="bd-footer" />
                Add a small “made with” line at the bottom
              </label>
            </div>

            <div className="min-w-0 lg:sticky lg:top-4 self-start space-y-3">
              <h2 className="font-semibold text-foreground">Preview</h2>
              <Preview html={html} />
              <button data-testid="bd-print" onClick={() => printHtmlViaIframe(html)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold">Download PDF</button>
              <p className="text-xs text-muted-foreground">Opens your browser’s print screen — choose “Save as PDF”. Empty fields are left off the page.</p>
            </div>
          </div>

          <div className="mt-10 max-w-3xl">
            <ToolFaq items={FAQ} title="Questions about the biodata maker" testId="bd-faq" />
            <ToolSources testId="bd-sources" items={[
              { label: 'Rashi, nakshatra, lagna: the BornClock sidereal (Lahiri) engine', note: 'the same calculation as /kundali, tested against Swiss Ephemeris reference charts' },
              { label: 'Manglik: Mars from Lagna and Moon in houses 1, 4, 7, 8, 12', note: 'the one rule used across BornClock (see /manglik), matched to AstroSage’s Manglik column' },
              { label: 'PDF: made by your browser’s print dialog', note: 'no server, no upload' },
            ]} />
            <p className="text-sm text-muted-foreground mb-8">Next step: <Link to="/kundali-match" className="underline">match two Kundalis (Guna Milan)</Link> · <Link to="/kundali" className="underline">make a full Kundali</Link>.</p>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
