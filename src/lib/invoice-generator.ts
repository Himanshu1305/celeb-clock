// GST tax-invoice HTML generator.
// Runs in BOTH the browser (Profile download → print-to-PDF) and the Cloudflare
// Workers runtime (verify-payment → email attachment). Web APIs only — no Node
// built-ins. Self-contained single HTML file, system fonts only, inline logo.
//
// IMPORTANT: this renders values already stored on the invoices row at issue
// time. It never re-computes tax — the DB row is the immutable source of truth.
import { BORNCLOCK_LOGO_B64 } from './invoice-logo';

export interface InvoiceLineItem {
  desc: string;
  note?: string;
  qty: number;
  gross: number;
}

export interface InvoiceRecord {
  invoice_no: string;
  invoice_date: string;            // 'YYYY-MM-DD'
  order_id: string;
  payment_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_gstin: string | null;
  buyer_country: string;
  buyer_state: string | null;
  buyer_state_code: string | null;
  place_of_supply: string;
  tax_mode: 'CGST_SGST' | 'IGST' | 'EXPORT';
  currency: 'INR' | 'USD';
  fx_rate: number | null;
  // Provenance for the export FX rate: the date the rate was captured and where
  // it came from. Optional so already-issued rows (and non-export invoices)
  // render unchanged when the columns are absent/null.
  fx_rate_date?: string | null;   // 'YYYY-MM-DD'
  fx_rate_source?: string | null;
  gross_amount: number | string;
  taxable_value: number | string;
  cgst: number | string;
  sgst: number | string;
  igst: number | string;
  line_items: InvoiceLineItem[];
}

// ── Supplier constants (hardcoded — never from env) ──────────────────────────
const SUPPLIER = {
  legalName: 'USD Vision AI LLP',
  product: 'BornClock',
  address: 'A206, Aparna Sarovar Zenith',
  address2: 'Kanchi Gachibowli Road, Nallagandla, Hyderabad, Telangana 500046',
  gstin: '36AAJFU0315K1Z5',
  llpin: 'ACR-6615',
  state: 'Telangana',
  stateCode: '36',
  email: 'hello@bornclock.com',
  site: 'bornclock.com',
  lutArn: 'AD360726011878N',
  lutDate: '27/07/2026',
  sacCode: '998439',
  sacLabel: 'Other on-line contents n.e.c.',
};

const n = (v: number | string): number => (typeof v === 'string' ? parseFloat(v) : v) || 0;

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function fmtMoney(amount: number, currency: 'INR' | 'USD'): string {
  const sym = currency === 'INR' ? '₹' : '$';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return sym + amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  // 'YYYY-MM-DD' → 'DD MMM YYYY'
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (!y || !m || !d) return iso;
  return `${d} ${months[parseInt(m, 10) - 1] ?? m} ${y}`;
}

// ── Amount in words (Indian numbering: crore/lakh/thousand) ──────────────────
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(num: number): string {
  if (num < 20) return ONES[num];
  const t = Math.floor(num / 10), o = num % 10;
  return TENS[t] + (o ? ' ' + ONES[o] : '');
}

function threeDigits(num: number): string {
  const h = Math.floor(num / 100), rest = num % 100;
  let out = '';
  if (h) out += ONES[h] + ' Hundred';
  if (rest) out += (out ? ' ' : '') + twoDigits(rest);
  return out;
}

function integerToWords(num: number): string {
  if (num === 0) return 'Zero';
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  const rest = num;
  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + ' Crore');
  if (lakh) parts.push(twoDigits(lakh) + ' Lakh');
  if (thousand) parts.push(twoDigits(thousand) + ' Thousand');
  if (rest) parts.push(threeDigits(rest));
  return parts.join(' ');
}

function amountInWords(amount: number, currency: 'INR' | 'USD'): string {
  const whole = Math.floor(amount);
  const frac = Math.round((amount - whole) * 100);
  const major = currency === 'INR' ? 'Rupees' : 'US Dollars';
  const minor = currency === 'INR' ? 'Paise' : 'Cents';
  let words = major + ' ' + integerToWords(whole);
  if (frac > 0) words += ' and ' + twoDigits(frac) + ' ' + minor;
  return words + ' Only';
}

// ── Renderer ─────────────────────────────────────────────────────────────────
export function generateInvoiceHTML(inv: InvoiceRecord): string {
  const gross = n(inv.gross_amount);
  const taxable = n(inv.taxable_value);
  const cgst = n(inv.cgst), sgst = n(inv.sgst), igst = n(inv.igst);
  const cur = inv.currency;
  const isExport = inv.tax_mode === 'EXPORT';
  const isSplit = inv.tax_mode === 'CGST_SGST';
  const items = Array.isArray(inv.line_items) ? inv.line_items : [];

  // tax columns per mode
  let taxHead = '';
  if (isSplit) taxHead = '<th class="r">CGST 9%</th><th class="r">SGST 9%</th>';
  else if (inv.tax_mode === 'IGST') taxHead = '<th class="r">IGST 18%</th>';
  else taxHead = '<th class="r">Tax</th>';

  const rows = items.map((it, i) => {
    const g = n(it.gross);
    const itemTaxable = isExport ? g : Math.round((g / 1.18) * 100) / 100;
    let taxCells = '';
    if (isSplit) {
      const c = Math.round(itemTaxable * 0.09 * 100) / 100;
      taxCells = `<td class="r">${fmtMoney(c, cur)}</td><td class="r">${fmtMoney(c, cur)}</td>`;
    } else if (inv.tax_mode === 'IGST') {
      taxCells = `<td class="r">${fmtMoney(Math.round((g - itemTaxable) * 100) / 100, cur)}</td>`;
    } else {
      taxCells = `<td class="r">${cur === 'INR' ? '₹' : '$'}0.00</td>`;
    }
    return `<tr>
      <td>${i + 1}</td>
      <td><div class="desc">${esc(it.desc)}</div>${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}</td>
      <td class="c">${esc(SUPPLIER.sacCode)}</td>
      <td class="c">${esc(it.qty)}</td>
      <td class="r">${fmtMoney(itemTaxable, cur)}</td>
      <td class="r">${fmtMoney(itemTaxable, cur)}</td>
      ${taxCells}
    </tr>`;
  }).join('');

  // totals rows
  let totalTaxRows = '';
  if (isSplit) {
    totalTaxRows = `<tr><td>CGST @ 9%</td><td class="r">${fmtMoney(cgst, cur)}</td></tr>
      <tr><td>SGST @ 9%</td><td class="r">${fmtMoney(sgst, cur)}</td></tr>`;
  } else if (inv.tax_mode === 'IGST') {
    totalTaxRows = `<tr><td>IGST @ 18%</td><td class="r">${fmtMoney(igst, cur)}</td></tr>`;
  } else {
    totalTaxRows = `<tr><td>Tax (zero-rated export)</td><td class="r">${cur === 'INR' ? '₹' : '$'}0.00</td></tr>`;
  }

  const billedToTax = inv.buyer_gstin
    ? `GSTIN: ${esc(inv.buyer_gstin)}`
    : 'GSTIN: Unregistered';

  const billedLocation = isExport
    ? esc(inv.buyer_country)
    : `${esc(inv.buyer_state ?? '')}${inv.buyer_state_code ? ` (${esc(inv.buyer_state_code)})` : ''}`;

  const declarations = isExport
    ? `<div class="lut">
         <strong>Export under LUT.</strong> Supply meant for export under Letter of Undertaking without
         payment of Integrated Tax. LUT ARN: ${esc(SUPPLIER.lutArn)} &middot; dated ${esc(SUPPLIER.lutDate)} &middot; FY 2026–27.<br/>
         Zero-rated supply under Section 16 of the IGST Act, 2017.
       </div>`
    : `<div class="decl">
         Tax payable on reverse charge basis: No. Prices inclusive of GST.<br/>
         Place of supply determined from the State declared by the recipient at checkout.
       </div>`;

  // Export FX row states the rate AND its provenance (date captured + source),
  // so the invoice never presents a fixed/stale rate as if it were live.
  const fxProvenance = isExport && inv.fx_rate
    ? [inv.fx_rate_date ? `as of ${esc(fmtDate(String(inv.fx_rate_date)))}` : '',
       inv.fx_rate_source ? esc(inv.fx_rate_source) : ''].filter(Boolean).join(' · ')
    : '';
  const fxRow = isExport && inv.fx_rate
    ? `<tr><td class="k">FX rate</td><td>1 USD = ₹${n(inv.fx_rate).toFixed(2)}${fxProvenance ? `<br/><span style="font-size:9px;color:var(--muted)">${fxProvenance}</span>` : ''}</td></tr>`
    : '';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Tax Invoice ${esc(inv.invoice_no)}</title>
<style>
  :root{ --ink:#0C1A2B; --navy:#103A5C; --gold:#B8862F; --muted:#5A6A7A; --rule:#D8DEE5; }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ background:#fff; color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    font-size:12px; line-height:1.5; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .sheet{ width:210mm; min-height:297mm; margin:0 auto; padding:16mm 14mm; }
  .r{ text-align:right; } .c{ text-align:center; } .k{ color:var(--muted); }
  /* header */
  .head{ display:flex; justify-content:space-between; align-items:flex-start;
    border-bottom:2px solid var(--navy); padding-bottom:14px; margin-bottom:18px; }
  .brand{ display:flex; align-items:center; gap:12px; }
  .brand img{ height:44px; width:auto; }
  .wordmark{ font-size:26px; font-weight:800; color:var(--navy); letter-spacing:-.01em; line-height:1; }
  .subbrand{ font-size:10px; color:var(--gold); font-weight:600; margin-top:3px; }
  .invtitle{ text-align:right; }
  .invtitle h1{ font-size:19px; font-weight:800; color:var(--navy); letter-spacing:.04em; }
  .invtitle .no{ font-size:13px; font-weight:700; margin-top:4px; }
  .invtitle .dt{ font-size:11px; color:var(--muted); margin-top:2px; }
  /* parties */
  .parties{ display:flex; gap:14px; margin-bottom:18px; }
  .party{ flex:1; border:1px solid var(--rule); border-radius:6px; padding:11px 12px; }
  .party h3{ font-size:9px; text-transform:uppercase; letter-spacing:.12em; color:var(--gold); margin-bottom:6px; }
  .party .nm{ font-weight:700; font-size:12.5px; }
  .party div{ margin-top:2px; }
  .party .sm{ font-size:11px; color:var(--muted); }
  .party .it{ font-style:italic; font-size:10px; color:var(--muted); margin-top:4px; }
  .party table{ width:100%; border-collapse:collapse; }
  .party table td{ padding:1px 0; vertical-align:top; font-size:11px; }
  .party table td.k{ white-space:nowrap; padding-right:8px; }
  /* line items */
  table.items{ width:100%; border-collapse:collapse; margin-bottom:16px; }
  table.items th{ background:var(--navy); color:#fff; font-size:10px; font-weight:600;
    text-transform:uppercase; letter-spacing:.04em; padding:8px 7px; text-align:left; }
  table.items td{ padding:8px 7px; border-bottom:1px solid var(--rule); vertical-align:top; }
  table.items .desc{ font-weight:600; }
  table.items .note{ font-size:10px; color:var(--muted); margin-top:2px; }
  /* totals + words */
  .foot{ display:flex; gap:14px; margin-bottom:16px; }
  .words{ flex:1; border-left:3px solid var(--gold); background:#FBF6EA; border-radius:0 6px 6px 0;
    padding:11px 14px; }
  .words .lbl{ font-size:9px; text-transform:uppercase; letter-spacing:.12em; color:var(--gold); margin-bottom:4px; }
  .words .val{ font-weight:600; font-size:12px; }
  .totals{ width:44%; }
  .totals table{ width:100%; border-collapse:collapse; }
  .totals td{ padding:5px 8px; }
  .totals tr.grand td{ border-top:2px solid var(--navy); font-weight:800; font-size:14px; color:var(--navy); padding-top:8px; }
  /* declarations + signature */
  .decl,.lut{ font-size:11px; color:var(--muted); border:1px solid var(--rule); border-radius:6px;
    padding:10px 12px; margin-bottom:14px; }
  .lut{ border-left:3px solid var(--gold); color:var(--ink); background:#FBF6EA; }
  .sign{ text-align:right; margin-top:26px; margin-bottom:20px; }
  .sign .for{ font-weight:700; }
  .sign .el{ font-size:10px; color:var(--muted); margin-top:26px; }
  .pagefoot{ border-top:1px solid var(--rule); padding-top:8px; font-size:8.5px; color:var(--muted); line-height:1.6; }
  @page{ size:A4; margin:0; }
</style></head>
<body><div class="sheet">

  <div class="head">
    <div class="brand">
      <img src="${BORNCLOCK_LOGO_B64}" alt="BornClock"/>
      <div>
        <div class="wordmark">BornClock</div>
        <div class="subbrand">A product of ${esc(SUPPLIER.legalName)}</div>
      </div>
    </div>
    <div class="invtitle">
      <h1>TAX INVOICE</h1>
      <div class="no">${esc(inv.invoice_no)}</div>
      <div class="dt">${esc(fmtDate(inv.invoice_date))}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Supplier</h3>
      <div class="nm">${esc(SUPPLIER.legalName)}</div>
      <div>GSTIN: ${esc(SUPPLIER.gstin)}</div>
      <div>LLPIN: ${esc(SUPPLIER.llpin)}</div>
      <div>State: ${esc(SUPPLIER.state)} (${esc(SUPPLIER.stateCode)})</div>
      <div class="it">Registered with limited liability</div>
    </div>
    <div class="party">
      <h3>Billed to</h3>
      <div class="nm">${esc(inv.buyer_name)}</div>
      <div class="sm">${esc(inv.buyer_email)}</div>
      <div>${billedLocation}</div>
      <div>${billedToTax}</div>
      <div class="sm">Place of supply: ${esc(inv.place_of_supply)}</div>
    </div>
    <div class="party">
      <h3>Invoice details</h3>
      <table>
        <tr><td class="k">Invoice no</td><td>${esc(inv.invoice_no)}</td></tr>
        <tr><td class="k">Date</td><td>${esc(fmtDate(inv.invoice_date))}</td></tr>
        <tr><td class="k">Order ID</td><td>${esc(inv.order_id)}</td></tr>
        <tr><td class="k">Payment ID</td><td>${esc(inv.payment_id)}</td></tr>
        <tr><td class="k">Payment mode</td><td>Razorpay</td></tr>
        ${fxRow}
      </table>
    </div>
  </div>

  <table class="items">
    <thead><tr>
      <th style="width:26px">#</th><th>Description</th><th style="width:66px">SAC</th>
      <th class="c" style="width:34px">Qty</th><th class="r">Unit value</th><th class="r">Taxable value</th>${taxHead}
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="foot">
    <div class="words">
      <div class="lbl">Amount in words</div>
      <div class="val">${esc(amountInWords(gross, cur))}</div>
      <div class="sm" style="font-size:10px;color:var(--muted);margin-top:6px">SAC ${esc(SUPPLIER.sacCode)} &mdash; ${esc(SUPPLIER.sacLabel)}</div>
    </div>
    <div class="totals">
      <table>
        <tr><td>Taxable value</td><td class="r">${fmtMoney(taxable, cur)}</td></tr>
        ${totalTaxRows}
        <tr class="grand"><td>Total ${cur}</td><td class="r">${fmtMoney(gross, cur)}</td></tr>
      </table>
    </div>
  </div>

  ${declarations}

  <div class="sign">
    <div class="for">For ${esc(SUPPLIER.legalName)}</div>
    <div class="el">Issued electronically &middot; no signature required</div>
  </div>

  <div class="pagefoot">
    <div>Registered office: ${esc(SUPPLIER.address)}, ${esc(SUPPLIER.address2)}</div>
    <div>${esc(SUPPLIER.legalName)} &middot; LLPIN ${esc(SUPPLIER.llpin)} &middot; GSTIN ${esc(SUPPLIER.gstin)} &middot; ${esc(SUPPLIER.site)} &middot; ${esc(inv.invoice_no)}</div>
  </div>

</div></body></html>`;
}
