/**
 * Marriage biodata — printable A4 HTML (Batch 10, /marriage-biodata-maker).
 *
 * Built and printed entirely in the visitor's browser through the same off-screen-iframe
 * print path as the Kundali PDF (printHtmlViaIframe in ./printHtml.ts → the browser's
 * "Save as PDF"). Nothing is sent to or stored on a server.
 *
 * Print rules reused from the Kundali PDF (./kundaliPdfHtml.ts): @page A4 with the margin
 * as padding, system fonts only (web fonts corrupted glyphs in printed PDFs) — with the
 * Devanagari system fonts listed for the Hindi labels — and no colour-emoji symbols.
 *
 * Three templates: 'classic' (maroon double border, centred headings), 'modern' (clean
 * single-column, accent rule), 'traditional' (saffron border with corner marks, optional
 * invocation line). Labels in English or Hindi. Empty fields are left out, never printed
 * as blanks.
 */

export type BiodataTemplate = 'classic' | 'modern' | 'traditional';
export type BiodataLang = 'en' | 'hi';

export interface BiodataData {
  // Personal
  fullName?: string;
  dob?: string;           // YYYY-MM-DD
  birthTime?: string;     // HH:MM
  birthPlace?: string;
  height?: string;
  maritalStatus?: string;
  religion?: string;
  motherTongue?: string;
  diet?: string;
  hobbies?: string;
  // Education & career
  education?: string;
  occupation?: string;
  employer?: string;
  income?: string;
  workLocation?: string;
  // Family
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: string;
  familyType?: string;
  nativePlace?: string;
  // Horoscope
  rashi?: string;
  nakshatra?: string;
  lagna?: string;
  gotra?: string;
  manglik?: string;
  // Expectations & contact
  expectations?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  /** Data URL of a photo chosen on the device (never uploaded). */
  photo?: string | null;
}

export interface BiodataOptions {
  template: BiodataTemplate;
  lang: BiodataLang;
  /** Optional invocation line at the top, e.g. "|| Shri Ganeshaya Namah ||". */
  invocation?: string;
  /** Small "made with" footer line. */
  footer?: boolean;
}

type FieldKey = Exclude<keyof BiodataData, 'photo'>;

export const BIODATA_LABELS: Record<BiodataLang, Record<FieldKey | 'title' | 'personal' | 'career' | 'family' | 'horoscope' | 'contact' | 'about', string>> = {
  en: {
    title: 'Marriage Biodata', personal: 'Personal details', career: 'Education & career', family: 'Family details', horoscope: 'Horoscope details', contact: 'Contact', about: 'About & expectations',
    fullName: 'Name', dob: 'Date of birth', birthTime: 'Time of birth', birthPlace: 'Place of birth', height: 'Height', maritalStatus: 'Marital status',
    religion: 'Religion / community', motherTongue: 'Mother tongue', diet: 'Diet', hobbies: 'Hobbies & interests',
    education: 'Education', occupation: 'Occupation', employer: 'Employer / business', income: 'Annual income', workLocation: 'Work location',
    fatherName: 'Father', fatherOccupation: 'Father’s occupation', motherName: 'Mother', motherOccupation: 'Mother’s occupation', siblings: 'Siblings', familyType: 'Family type', nativePlace: 'Native place',
    rashi: 'Rashi (Moon sign)', nakshatra: 'Nakshatra', lagna: 'Lagna (Ascendant)', gotra: 'Gotra', manglik: 'Manglik',
    expectations: 'Partner expectations', contactPerson: 'Contact person', phone: 'Phone', email: 'Email', address: 'Address',
  },
  hi: {
    title: 'विवाह परिचय (बायोडाटा)', personal: 'व्यक्तिगत जानकारी', career: 'शिक्षा व व्यवसाय', family: 'पारिवारिक जानकारी', horoscope: 'कुंडली विवरण', contact: 'संपर्क', about: 'परिचय व अपेक्षाएँ',
    fullName: 'नाम', dob: 'जन्म तिथि', birthTime: 'जन्म समय', birthPlace: 'जन्म स्थान', height: 'कद', maritalStatus: 'वैवाहिक स्थिति',
    religion: 'धर्म / समुदाय', motherTongue: 'मातृभाषा', diet: 'आहार', hobbies: 'रुचियाँ',
    education: 'शिक्षा', occupation: 'व्यवसाय', employer: 'संस्थान / व्यापार', income: 'वार्षिक आय', workLocation: 'कार्य स्थान',
    fatherName: 'पिता', fatherOccupation: 'पिता का व्यवसाय', motherName: 'माता', motherOccupation: 'माता का व्यवसाय', siblings: 'भाई-बहन', familyType: 'परिवार का प्रकार', nativePlace: 'पैतृक स्थान',
    rashi: 'राशि', nakshatra: 'नक्षत्र', lagna: 'लग्न', gotra: 'गोत्र', manglik: 'मांगलिक',
    expectations: 'जीवनसाथी से अपेक्षाएँ', contactPerson: 'संपर्क व्यक्ति', phone: 'फ़ोन', email: 'ईमेल', address: 'पता',
  },
};

export const BIODATA_SECTIONS: Array<{ id: 'personal' | 'career' | 'family' | 'horoscope' | 'about' | 'contact'; fields: FieldKey[] }> = [
  { id: 'personal', fields: ['fullName', 'dob', 'birthTime', 'birthPlace', 'height', 'maritalStatus', 'religion', 'motherTongue', 'diet', 'hobbies'] },
  { id: 'career', fields: ['education', 'occupation', 'employer', 'income', 'workLocation'] },
  { id: 'family', fields: ['fatherName', 'fatherOccupation', 'motherName', 'motherOccupation', 'siblings', 'familyType', 'nativePlace'] },
  { id: 'horoscope', fields: ['rashi', 'nakshatra', 'lagna', 'gotra', 'manglik'] },
  { id: 'about', fields: ['expectations'] },
  { id: 'contact', fields: ['contactPerson', 'phone', 'email', 'address'] },
];

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Display value of a field (dates and times formatted; blanks → null). */
export function biodataValue(key: FieldKey, data: BiodataData, lang: BiodataLang): string | null {
  const raw = (data[key] ?? '').toString().trim();
  if (!raw) return null;
  if (key === 'dob') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (m) return `${Number(m[3])} ${(lang === 'hi' ? MONTHS_HI : MONTHS_EN)[Number(m[2]) - 1]} ${m[1]}`;
  }
  if (key === 'birthTime') {
    const m = /^(\d{2}):(\d{2})$/.exec(raw);
    if (m) { const h = Number(m[1]); return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`; }
  }
  return raw;
}

const SAFE_PHOTO = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const THEME: Record<BiodataTemplate, { accent: string; soft: string; border: string; head: string }> = {
  classic: { accent: '#7a1f2b', soft: '#fbf3f3', border: 'double 4px #7a1f2b', head: 'center' },
  modern: { accent: '#1f4e79', soft: '#f3f7fb', border: 'none', head: 'left' },
  traditional: { accent: '#b45309', soft: '#fff8ec', border: 'solid 2px #d97706', head: 'center' },
};

export function buildBiodataHtml(data: BiodataData, opts: BiodataOptions): string {
  const L = BIODATA_LABELS[opts.lang];
  const t = THEME[opts.template];
  const name = (data.fullName ?? '').trim();
  const photo = data.photo && SAFE_PHOTO.test(data.photo) ? data.photo : null;

  const sections = BIODATA_SECTIONS.map(sec => {
    const rows = sec.fields
      .filter(k => !(sec.id === 'personal' && k === 'fullName'))
      .map(k => [k, biodataValue(k, data, opts.lang)] as const)
      .filter(([, v]) => v);
    if (!rows.length) return '';
    const body = sec.id === 'about'
      ? `<p class="para">${esc(rows[0][1]!)}</p>`
      : `<table class="kv">${rows.map(([k, v]) => `<tr><th>${esc(L[k])}</th><td>${esc(v!)}</td></tr>`).join('')}</table>`;
    return `<section class="sec" data-sec="${sec.id}"><h2>${esc(L[sec.id])}</h2>${body}</section>`;
  }).join('');

  const invocation = (opts.invocation ?? '').trim();
  const corners = opts.template === 'traditional' ? '<div class="c tl"></div><div class="c tr"></div><div class="c bl"></div><div class="c br"></div>' : '';

  return `<!doctype html><html lang="${opts.lang}"><head><meta charset="utf-8"><title>${esc(name ? `${name} — ${L.title}` : L.title)}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans Devanagari", "Kohinoor Devanagari", "Mangal", "Nirmala UI", sans-serif;
         color: #1f2328; font-size: 12px; line-height: 1.45; font-variant-ligatures: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 210mm; min-height: 297mm; padding: 12mm; }
  .frame { position: relative; border: ${t.border}; padding: ${t.border === 'none' ? '0' : '8mm'}; min-height: 273mm; }
  .c { position: absolute; width: 10mm; height: 10mm; border-color: ${t.accent}; border-style: solid; }
  .tl { top: 2mm; left: 2mm; border-width: 2px 0 0 2px; } .tr { top: 2mm; right: 2mm; border-width: 2px 2px 0 0; }
  .bl { bottom: 2mm; left: 2mm; border-width: 0 0 2px 2px; } .br { bottom: 2mm; right: 2mm; border-width: 0 2px 2px 0; }
  .inv { text-align: center; color: ${t.accent}; font-weight: 600; letter-spacing: .5px; margin-bottom: 3mm; }
  header { display: flex; gap: 6mm; align-items: center; justify-content: ${t.head === 'center' && !photo ? 'center' : 'space-between'};
           ${opts.template === 'modern' ? `border-bottom: 3px solid ${t.accent}; padding-bottom: 4mm;` : ''} margin-bottom: 5mm; }
  header .t { text-align: ${t.head === 'center' && !photo ? 'center' : 'left'}; }
  header .k { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${t.accent}; }
  header h1 { margin: 1mm 0 0; font-size: 24px; color: ${t.accent}; }
  header img { width: 38mm; height: 46mm; object-fit: cover; border: 2px solid ${t.accent}; border-radius: 2mm; }
  .sec { margin-bottom: 4mm; break-inside: avoid; page-break-inside: avoid; }
  .sec h2 { font-size: 13px; margin: 0 0 1.5mm; padding: 1mm 2.5mm; color: ${t.accent}; background: ${t.soft}; border-left: 3px solid ${t.accent}; }
  .kv { width: 100%; border-collapse: collapse; }
  .kv th { width: 38%; text-align: left; font-weight: 600; color: #444; padding: 1mm 2.5mm; vertical-align: top; }
  .kv td { padding: 1mm 2.5mm; vertical-align: top; }
  .kv tr + tr th, .kv tr + tr td { border-top: 1px solid #eee; }
  .para { margin: 0; padding: 1mm 2.5mm; white-space: pre-wrap; }
  .foot { margin-top: 6mm; text-align: center; color: #888; font-size: 9px; }
</style></head><body><div class="page"><div class="frame">${corners}
  ${invocation ? `<div class="inv">${esc(invocation)}</div>` : ''}
  <header><div class="t"><div class="k">${esc(L.title)}</div>${name ? `<h1>${esc(name)}</h1>` : ''}</div>${photo ? `<img src="${photo}" alt="">` : ''}</header>
  ${sections}
  ${opts.footer ? '<div class="foot">Made with the biodata maker at bornclock.com/marriage-biodata-maker — created on this device, not stored online.</div>' : ''}
</div></div></body></html>`;
}
