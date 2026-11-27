/**
 * B20 — the computed muhurat sections for the Holi / Holika Dahan and Diwali / Dhanteras 2027
 * pages (English and Hindi). Every value comes from src/lib/year2027/muhurat2027.ts; the
 * conventions and the reference checks are documented there.
 */
import { Link } from '@/components/seo/CanonicalLink';
import { HOLIKA_2027, DIWALI_2027, hm, istDate, icsEvent, type Win } from '@/lib/year2027/muhurat2027Data';
import { dayLabel } from '@/lib/year2027/festivalData';
import type { Lang } from '@/lib/year2027/text';
import { H2, Card, KV } from './parts';

export type MuhuratKind = 'holi' | 'diwali';
export const muhuratKindFor = (slug: string): MuhuratKind | null =>
  slug === 'holi' || slug === 'holika-dahan' ? 'holi' : slug === 'diwali' || slug === 'dhanteras' ? 'diwali' : null;

const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
/** "18:21, 21 Mar" */
const st = (ms: number, lang: Lang) => { const d = istDate(ms); return `${hm(ms)}, ${Number(d.slice(8))} ${(lang === 'en' ? MON_EN : MON_HI)[Number(d.slice(5, 7)) - 1]}`; };
const span = (w: Win | null, lang: Lang, none: string) => (w ? `${hm(w[0])} – ${hm(w[1])}${istDate(w[1]) !== istDate(w[0]) ? (lang === 'en' ? ' (next day)' : ' (अगले दिन)') : ''}` : none);
const dur = (w: Win, lang: Lang) => { const m = Math.round((w[1] - w[0]) / 60_000); const h = Math.floor(m / 60); return lang === 'en' ? `${h ? `${h} h ` : ''}${m % 60} min` : `${h ? `${h} घंटे ` : ''}${m % 60} मिनट`; };
const icsHref = (ics: string) => `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

function Table({ head, rows, testId }: { head: string[]; rows: Array<{ key: string; cells: string[] }>; testId: string }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full text-sm border-collapse min-w-[30rem]" data-testid={testId}>
        <thead><tr>{head.map(h => <th key={h} scope="col" className="text-left font-semibold text-brand-ink border-b border-brand-line py-2 pr-3">{h}</th>)}</tr></thead>
        <tbody>{rows.map(r => <tr key={r.key} data-row={r.key}>{r.cells.map((c, i) => <td key={i} className={`py-2 pr-3 border-b border-brand-line/60 ${i === 0 ? 'font-semibold text-brand-ink' : 'text-brand-ink-soft'}`}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/** Computed questions added to the page FAQ (and its FAQ schema). */
export function muhuratFaq(kind: MuhuratKind, lang: Lang): Array<{ question: string; answer: string }> {
  const en = lang === 'en';
  if (kind === 'holi') {
    const h = HOLIKA_2027, d = h.cities[0];
    const few = h.cities.filter(c => ['mumbai', 'kolkata', 'chennai', 'bengaluru'].includes(c.city.id)).map(c => `${en ? c.city.en : c.city.hi} ${span(c.muhurat, lang, '—')}`).join(en ? '; ' : '; ');
    return en ? [
      { question: 'What is the Holika Dahan muhurat in 2027?', answer: `${span(d.muhurat, 'en', '—')} on ${dayLabel(h.dahanDate, 'en')} in New Delhi, during Pradosh kaal while Purnima lasts. Bhadra runs past midnight this year, so the tradition allows the Pradosh muhurat (never Bhadra Mukha); families who prefer to wait for Bhadra to end can light the fire at ${span(d.alternative, 'en', '—')} before sunrise on 22 March.` },
      { question: 'When is Bhadra on Holika Dahan 2027?', answer: `Bhadra is the first half of Purnima: ${st(h.bhadra[0], 'en')} to ${st(h.bhadra[1], 'en')}. Bhadra Punchha is ${span(h.punchha, 'en', '—')} and Bhadra Mukha ${span(h.mukha, 'en', '—')} (night of 21–22 March). The bonfire is never lit in Bhadra Mukha.` },
      { question: 'What is the Holika Dahan time in other cities?', answer: `${few} — each city’s own sunset decides its Pradosh kaal. The full table for 10 cities is on this page.` },
    ] : [
      { question: '2027 में होलिका दहन का मुहूर्त क्या है?', answer: `नई दिल्ली में ${dayLabel(h.dahanDate, 'hi')} को ${span(d.muhurat, 'hi', '—')}, प्रदोष काल में जब पूर्णिमा रहे। इस वर्ष भद्रा मध्यरात्रि के बाद तक है, इसलिए परंपरा प्रदोष मुहूर्त की अनुमति देती है (भद्रा मुख में कभी नहीं); जो भद्रा समाप्त होने की प्रतीक्षा करना चाहें, वे 22 मार्च को सूर्योदय से पहले ${span(d.alternative, 'hi', '—')} में दहन कर सकते हैं।` },
      { question: 'होलिका दहन 2027 पर भद्रा कब है?', answer: `भद्रा पूर्णिमा का पहला आधा भाग है: ${st(h.bhadra[0], 'hi')} से ${st(h.bhadra[1], 'hi')} तक। भद्रा पुच्छ ${span(h.punchha, 'hi', '—')} और भद्रा मुख ${span(h.mukha, 'hi', '—')} (21–22 मार्च की रात)। भद्रा मुख में होलिका दहन कभी नहीं किया जाता।` },
      { question: 'दूसरे शहरों में होलिका दहन का समय क्या है?', answer: `${few} — हर शहर का अपना सूर्यास्त उसका प्रदोष काल तय करता है। 10 शहरों की पूरी तालिका इसी पेज पर है।` },
    ];
  }
  const w = DIWALI_2027, d = w.cities[0], dh = w.dhanteras;
  const short = w.cities.filter(c => !c.lakshmi || c.lakshmi[1] - c.lakshmi[0] < 10 * 60_000).map(c => (en ? c.city.en : c.city.hi));
  return en ? [
    { question: 'What is the Lakshmi Puja muhurat on Diwali 2027?', answer: `${span(d.lakshmi, 'en', '—')} on ${dayLabel(w.days[2].dateISO, 'en')} in New Delhi — where Pradosh kaal (${span(d.pradosh, 'en', '—')}), the fixed Vrishabha lagna (${span(d.vrishabha, 'en', '—')}) and Amavasya (until ${st(w.amavasya[1], 'en')}) overlap.` },
    { question: 'Why is the Lakshmi Puja muhurat short in 2027?', answer: `Amavasya ends at ${hm(w.amavasya[1])} on 29 October, soon after Vrishabha lagna rises. ${short.length ? `In ${short.join(', ')} Vrishabha rises after, or only minutes before, Amavasya ends, so the puja is usually done in Pradosh kaal while Amavasya lasts — the city table shows both windows.` : ''}` },
    { question: 'Is there a midnight (Mahanishita) Lakshmi Puja muhurat in 2027?', answer: `No — Amavasya ends at ${hm(w.amavasya[1])}, before the midnight Nishita kaal (${span(d.nishita, 'en', '—')} in New Delhi) and Simha lagna (${span(d.simha, 'en', '—')}).` },
    { question: 'What is the Dhanteras 2027 puja muhurat?', answer: `${span(dh.muhurat, 'en', '—')} on ${dayLabel(dh.dateISO, 'en')} in New Delhi (Pradosh ${span(dh.pradosh, 'en', '—')} with Vrishabha lagna ${span(dh.vrishabha, 'en', '—')}). Trayodashi lasts from ${st(dh.trayodashi[0], 'en')} to ${st(dh.trayodashi[1], 'en')}; purchases are traditionally made on this Trayodashi day.` },
  ] : [
    { question: 'दिवाली 2027 पर लक्ष्मी पूजा का मुहूर्त क्या है?', answer: `नई दिल्ली में ${dayLabel(w.days[2].dateISO, 'hi')} को ${span(d.lakshmi, 'hi', '—')} — जहाँ प्रदोष काल (${span(d.pradosh, 'hi', '—')}), स्थिर वृषभ लग्न (${span(d.vrishabha, 'hi', '—')}) और अमावस्या (${st(w.amavasya[1], 'hi')} तक) तीनों साथ हों।` },
    { question: '2027 में लक्ष्मी पूजा का मुहूर्त छोटा क्यों है?', answer: `29 अक्टूबर को अमावस्या ${hm(w.amavasya[1])} पर समाप्त हो रही है, वृषभ लग्न शुरू होने के कुछ ही देर बाद। ${short.length ? `${short.join(', ')} में वृषभ लग्न अमावस्या समाप्त होने के बाद या केवल कुछ मिनट पहले शुरू होता है, इसलिए वहाँ पूजा प्रायः प्रदोष काल में अमावस्या रहते की जाती है — शहरों की तालिका में दोनों समय दिए हैं।` : ''}` },
    { question: 'क्या 2027 में महानिशीथ (मध्यरात्रि) लक्ष्मी पूजा मुहूर्त है?', answer: `नहीं — अमावस्या ${hm(w.amavasya[1])} पर समाप्त हो जाती है, मध्यरात्रि के निशीथ काल (नई दिल्ली में ${span(d.nishita, 'hi', '—')}) और सिंह लग्न (${span(d.simha, 'hi', '—')}) से पहले।` },
    { question: 'धनतेरस 2027 का पूजा मुहूर्त क्या है?', answer: `नई दिल्ली में ${dayLabel(dh.dateISO, 'hi')} को ${span(dh.muhurat, 'hi', '—')} (प्रदोष ${span(dh.pradosh, 'hi', '—')}, वृषभ लग्न ${span(dh.vrishabha, 'hi', '—')})। त्रयोदशी ${st(dh.trayodashi[0], 'hi')} से ${st(dh.trayodashi[1], 'hi')} तक है; ख़रीदारी परंपरा से इसी त्रयोदशी के दिन की जाती है।` },
  ];
}

export function HoliDiwaliMuhurat({ kind, lang, slug }: { kind: MuhuratKind; lang: Lang; slug: string }) {
  const en = lang === 'en';
  const none = en ? 'none' : 'नहीं';
  const cityHead = en ? 'City' : 'शहर';
  const pageUrl = `https://bornclock.com${en ? '' : '/hi'}/festivals/2027/${slug}/`;
  const source = en ? 'Computed for each city from its own sunset and the real Sun and Moon (Lahiri). Checked against Drik Panchang and AstroSage 2027 pages.' : 'हर शहर के अपने सूर्यास्त और सूर्य-चंद्रमा की वास्तविक स्थिति (लाहिड़ी) से गणना। Drik Panchang और AstroSage के 2027 पेजों से मिलान किया गया।';

  if (kind === 'holi') {
    const h = HOLIKA_2027, d = h.cities[0];
    const ics = d.muhurat ? icsEvent({ uid: 'holika-dahan-2027-new-delhi', title: en ? 'Holika Dahan muhurat (New Delhi)' : 'होलिका दहन मुहूर्त (नई दिल्ली)', start: d.muhurat[0], end: d.muhurat[1], description: en ? 'Holika Dahan 2027 — Pradosh kaal while Purnima lasts. Times from BornClock.' : 'होलिका दहन 2027 — प्रदोष काल, पूर्णिमा में। समय BornClock से।', url: pageUrl }) : null;
    return (
      <div data-testid="muhurat-holi">
        <H2 id="muhurat">{en ? 'Holika Dahan 2027 muhurat and Bhadra' : 'होलिका दहन 2027 मुहूर्त और भद्रा'}</H2>
        <Card className="border-brand-gold/50 bg-brand-gold/10" testId="muhurat-holi-main">
          <div className="text-sm text-brand-gold-text font-semibold">{en ? `Holika Dahan muhurat — ${dayLabel(h.dahanDate, 'en')}, New Delhi` : `होलिका दहन मुहूर्त — ${dayLabel(h.dahanDate, 'hi')}, नई दिल्ली`}</div>
          <div className="text-2xl font-black text-brand-ink !mt-1" data-testid="muhurat-holi-time">{span(d.muhurat, lang, none)}</div>
          {d.muhurat && <p className="text-sm text-brand-ink-soft !mt-1">{en ? `Duration ${dur(d.muhurat, 'en')} · Pradosh kaal while Purnima lasts` : `अवधि ${dur(d.muhurat, 'hi')} · प्रदोष काल, पूर्णिमा रहते`}</p>}
          {ics && <a href={icsHref(ics)} download="holika-dahan-2027.ics" data-testid="muhurat-ics" className="inline-block !mt-3 text-sm font-semibold underline">{en ? 'Add to calendar (.ics)' : 'कैलेंडर में जोड़ें (.ics)'}</a>}
        </Card>
        <Card testId="muhurat-holi-bhadra" className="!mt-3">
          <KV rows={[
            { label: en ? 'Purnima tithi' : 'पूर्णिमा तिथि', value: `${st(h.purnima[0], lang)} → ${st(h.purnima[1], lang)}` },
            { label: en ? 'Bhadra (first half of Purnima)' : 'भद्रा (पूर्णिमा का पहला आधा भाग)', value: `${st(h.bhadra[0], lang)} → ${st(h.bhadra[1], lang)}` },
            { label: en ? 'Bhadra Punchha (tail)' : 'भद्रा पुच्छ', value: `${st(h.punchha[0], lang)} → ${hm(h.punchha[1])}` },
            { label: en ? 'Bhadra Mukha (mouth — avoid)' : 'भद्रा मुख (वर्जित)', value: `${st(h.mukha[0], lang)} → ${hm(h.mukha[1])}` },
            { label: en ? 'Alternative — after Bhadra, before sunrise' : 'विकल्प — भद्रा के बाद, सूर्योदय से पहले', value: span(d.alternative, lang, none) },
            { label: en ? 'Rangwali Holi (colours)' : 'रंगवाली होली (धुलंडी)', value: dayLabel(h.holiDate, lang) },
          ]} />
          <p className="text-sm text-brand-ink-soft !mt-3">{en
            ? 'The rule: Holika Dahan is done in Pradosh kaal (the evening after sunset) while Purnima lasts and Bhadra is over. If Bhadra covers Pradosh but ends before midnight, wait for it to end. If Bhadra runs past midnight — as in 2027 — the bonfire may be lit in Bhadra Punchha if it falls in Pradosh, otherwise in Pradosh itself, but never in Bhadra Mukha.'
            : 'नियम: होलिका दहन प्रदोष काल (सूर्यास्त के बाद की शाम) में, पूर्णिमा रहते और भद्रा समाप्त होने पर किया जाता है। यदि भद्रा प्रदोष में हो पर मध्यरात्रि से पहले समाप्त हो, तो उसके समाप्त होने की प्रतीक्षा करें। यदि भद्रा मध्यरात्रि के बाद तक रहे — जैसे 2027 में — तो प्रदोष में भद्रा पुच्छ हो तो उसमें, अन्यथा प्रदोष में ही दहन किया जा सकता है, पर भद्रा मुख में कभी नहीं।'}</p>
        </Card>

        <H2 id="cities">{en ? 'Holika Dahan 2027 muhurat in 10 cities' : '10 शहरों में होलिका दहन 2027 मुहूर्त'}</H2>
        <Table testId="muhurat-holi-cities"
          head={en ? [cityHead, 'Muhurat (21 Mar)', 'Alternative (22 Mar, before sunrise)'] : [cityHead, 'मुहूर्त (21 मार्च)', 'विकल्प (22 मार्च, सूर्योदय से पहले)']}
          rows={h.cities.map(c => ({ key: c.city.id, cells: [en ? c.city.en : c.city.hi, span(c.muhurat, lang, none), span(c.alternative, lang, none)] }))} />
        <p className="text-xs text-brand-muted !mt-2">{source} <Link to="/accuracy/" className="underline">{en ? 'How we check →' : 'हम कैसे जाँचते हैं →'}</Link></p>
      </div>
    );
  }

  const w = DIWALI_2027, d = w.cities[0], dh = w.dhanteras;
  const main = slug === 'dhanteras' ? dh.muhurat : d.lakshmi;
  const ics = main ? icsEvent({
    uid: `${slug}-2027-new-delhi`,
    title: slug === 'dhanteras' ? (en ? 'Dhanteras puja muhurat (New Delhi)' : 'धनतेरस पूजा मुहूर्त (नई दिल्ली)') : (en ? 'Lakshmi Puja muhurat (New Delhi)' : 'लक्ष्मी पूजा मुहूर्त (नई दिल्ली)'),
    start: main[0], end: main[1],
    description: en ? 'Pradosh kaal with the fixed Vrishabha lagna. Times from BornClock.' : 'प्रदोष काल और स्थिर वृषभ लग्न। समय BornClock से।', url: pageUrl,
  }) : null;
  return (
    <div data-testid="muhurat-diwali">
      <H2 id="muhurat">{slug === 'dhanteras' ? (en ? 'Dhanteras 2027 puja muhurat' : 'धनतेरस 2027 पूजा मुहूर्त') : (en ? 'Lakshmi Puja muhurat 2027' : 'लक्ष्मी पूजा मुहूर्त 2027')}</H2>
      <Card className="border-brand-gold/50 bg-brand-gold/10" testId="muhurat-diwali-main">
        <div className="text-sm text-brand-gold-text font-semibold">{slug === 'dhanteras'
          ? (en ? `Dhanteras puja — ${dayLabel(dh.dateISO, 'en')}, New Delhi` : `धनतेरस पूजा — ${dayLabel(dh.dateISO, 'hi')}, नई दिल्ली`)
          : (en ? `Lakshmi Puja — ${dayLabel(w.days[2].dateISO, 'en')}, New Delhi` : `लक्ष्मी पूजा — ${dayLabel(w.days[2].dateISO, 'hi')}, नई दिल्ली`)}</div>
        <div className="text-2xl font-black text-brand-ink !mt-1" data-testid="muhurat-diwali-time">{span(main, lang, none)}</div>
        {main && <p className="text-sm text-brand-ink-soft !mt-1">{en ? `Duration ${dur(main, 'en')} · Pradosh kaal + fixed Vrishabha lagna` : `अवधि ${dur(main, 'hi')} · प्रदोष काल + स्थिर वृषभ लग्न`}</p>}
        {ics && <a href={icsHref(ics)} download={`${slug}-2027.ics`} data-testid="muhurat-ics" className="inline-block !mt-3 text-sm font-semibold underline">{en ? 'Add to calendar (.ics)' : 'कैलेंडर में जोड़ें (.ics)'}</a>}
      </Card>
      <Card testId="muhurat-diwali-parts" className="!mt-3">
        <KV rows={slug === 'dhanteras' ? [
          { label: en ? 'Trayodashi tithi' : 'त्रयोदशी तिथि', value: `${st(dh.trayodashi[0], lang)} → ${st(dh.trayodashi[1], lang)}` },
          { label: en ? 'Pradosh kaal' : 'प्रदोष काल', value: span(dh.pradosh, lang, none) },
          { label: en ? 'Vrishabha lagna' : 'वृषभ लग्न', value: span(dh.vrishabha, lang, none) },
        ] : [
          { label: en ? 'Amavasya tithi' : 'अमावस्या तिथि', value: `${st(w.amavasya[0], lang)} → ${st(w.amavasya[1], lang)}` },
          { label: en ? 'Pradosh kaal' : 'प्रदोष काल', value: span(d.pradosh, lang, none) },
          { label: en ? 'Vrishabha lagna (fixed sign)' : 'वृषभ लग्न (स्थिर)', value: span(d.vrishabha, lang, none) },
          { label: en ? 'Nishita kaal (midnight)' : 'निशीथ काल (मध्यरात्रि)', value: span(d.nishita, lang, none) },
          { label: en ? 'Simha lagna' : 'सिंह लग्न', value: span(d.simha, lang, none) },
          { label: en ? 'Mahanishita Lakshmi Puja muhurat' : 'महानिशीथ लक्ष्मी पूजा मुहूर्त', value: span(d.mahanishita, lang, en ? `none — Amavasya ends at ${hm(w.amavasya[1])}` : `नहीं — अमावस्या ${hm(w.amavasya[1])} पर समाप्त`) },
        ]} />
        <p className="text-sm text-brand-ink-soft !mt-3">{en
          ? 'Lakshmi is worshipped in Pradosh kaal, and best when a fixed (sthir) sign — Vrishabha — is rising, so that the blessing “stays”. The muhurat is where Pradosh, Vrishabha lagna and the tithi overlap.'
          : 'लक्ष्मी पूजा प्रदोष काल में की जाती है, और सबसे शुभ तब मानी जाती है जब स्थिर लग्न — वृषभ — उदित हो, ताकि लक्ष्मी "स्थिर" रहें। मुहूर्त वह समय है जहाँ प्रदोष, वृषभ लग्न और तिथि तीनों मिलें।'}</p>
      </Card>

      {slug === 'diwali' && (<>
        <H2 id="five-days">{en ? 'The five days of Diwali 2027' : 'दिवाली 2027 के पाँच दिन'}</H2>
        <Table testId="muhurat-diwali-days"
          head={en ? ['Day', 'Date', 'Tithi (begins → ends)'] : ['दिन', 'तारीख़', 'तिथि (आरंभ → समाप्त)']}
          rows={w.days.map(x => ({ key: x.slug, cells: [en ? x.en : x.hi, dayLabel(x.dateISO, lang), `${st(x.tithi[0], lang)} → ${st(x.tithi[1], lang)}`] }))} />
      </>)}

      <H2 id="cities">{slug === 'dhanteras' ? (en ? 'Dhanteras 2027 puja muhurat in 10 cities' : '10 शहरों में धनतेरस 2027 पूजा मुहूर्त') : (en ? 'Lakshmi Puja 2027 muhurat in 10 cities' : '10 शहरों में लक्ष्मी पूजा 2027 मुहूर्त')}</H2>
      {slug === 'dhanteras'
        ? <Table testId="muhurat-diwali-cities" head={en ? [cityHead, 'Puja muhurat (27 Oct)'] : [cityHead, 'पूजा मुहूर्त (27 अक्टूबर)']}
            rows={dh.cities.map(c => ({ key: c.city.id, cells: [en ? c.city.en : c.city.hi, span(c.muhurat, lang, none)] }))} />
        : <Table testId="muhurat-diwali-cities"
            head={en ? [cityHead, 'Pradosh + Vrishabha', 'Pradosh while Amavasya lasts'] : [cityHead, 'प्रदोष + वृषभ', 'प्रदोष, अमावस्या रहते']}
            rows={w.cities.map(c => ({ key: c.city.id, cells: [en ? c.city.en : c.city.hi, span(c.lakshmi, lang, en ? 'none this year' : 'इस वर्ष नहीं'), span(c.pradosh[0] < w.amavasya[1] ? [c.pradosh[0], Math.min(c.pradosh[1], w.amavasya[1])] : null, lang, none)] }))} />}
      <p className="text-xs text-brand-muted !mt-2">{source} <Link to="/accuracy/" className="underline">{en ? 'How we check →' : 'हम कैसे जाँचते हैं →'}</Link></p>
    </div>
  );
}
