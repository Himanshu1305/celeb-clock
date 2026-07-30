// PDF fixture proof (gate #4). Renders the REAL generateInvoiceHTML output to PDF
// via headless Chromium — the same engine Cloudflare Browser Rendering uses — for
// all three GST modes, so we can confirm bytes + layout + the ₹ glyph before the
// founder's Browser Rendering token exists. Run: ./node_modules/.bin/tsx scripts/pdf-fixture-proof.ts
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { generateInvoiceHTML, type InvoiceRecord } from '../src/lib/invoice-generator';

const base = {
  invoice_date: '2026-07-30',
  buyer_gstin: null,
  line_items: [{ desc: 'BornClock — Birthday Blueprint Report', note: 'Digital report, one-time purchase. Delivered electronically.', qty: 1, gross: 199 }],
};

const fixtures: Record<string, InvoiceRecord> = {
  CGST_SGST: {
    ...base, invoice_no: 'BC/26-27/1001', order_id: 'order_TEST_CGST', payment_id: 'pay_TEST_CGST',
    buyer_name: 'Himanshu Dixit', buyer_email: 'buyer@example.com',
    buyer_country: 'India', buyer_state: 'Telangana', buyer_state_code: '36', place_of_supply: 'Telangana (36)',
    tax_mode: 'CGST_SGST', currency: 'INR', fx_rate: null,
    gross_amount: 199, taxable_value: 168.64, cgst: 15.18, sgst: 15.18, igst: 0,
  } as InvoiceRecord,
  IGST: {
    ...base, invoice_no: 'BC/26-27/1002', order_id: 'order_TEST_IGST', payment_id: 'pay_TEST_IGST',
    buyer_name: 'Ananya Rao', buyer_email: 'buyer2@example.com',
    buyer_country: 'India', buyer_state: 'Karnataka', buyer_state_code: '29', place_of_supply: 'Karnataka (29)',
    tax_mode: 'IGST', currency: 'INR', fx_rate: null,
    gross_amount: 199, taxable_value: 168.64, cgst: 0, sgst: 0, igst: 30.36,
  } as InvoiceRecord,
  EXPORT: {
    ...base,
    line_items: [{ desc: 'BornClock — Birthday Blueprint Report', note: 'Digital report, one-time purchase. Delivered electronically.', qty: 1, gross: 6.99 }],
    invoice_no: 'BX/26-27/1001', order_id: 'order_TEST_EXP', payment_id: 'pay_TEST_EXP',
    buyer_name: 'John Carter', buyer_email: 'buyer3@example.com',
    buyer_country: 'United States', buyer_state: null, buyer_state_code: null, place_of_supply: 'United States',
    tax_mode: 'EXPORT', currency: 'USD', fx_rate: 87.20,
    gross_amount: 6.99, taxable_value: 6.99, cgst: 0, sgst: 0, igst: 0,
  } as InvoiceRecord,
};

async function main() {
  mkdirSync('scripts/output/pdf-proof', { recursive: true });
  const browser = await chromium.launch();
  const results: Array<{ mode: string; bytes: number; validPdf: boolean; rupeeInHtml: boolean }> = [];
  for (const [mode, inv] of Object.entries(fixtures)) {
    const html = generateInvoiceHTML(inv);
    const rupeeInHtml = html.includes('₹');
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    // A4, print background on, margins 0 — the HTML's own @page/padding governs.
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    await page.close();
    const validPdf = pdf.subarray(0, 5).toString('latin1') === '%PDF-';
    const out = `scripts/output/pdf-proof/inv-${mode}.pdf`;
    writeFileSync(out, pdf);
    results.push({ mode, bytes: pdf.length, validPdf, rupeeInHtml });
    console.log(`${mode.padEnd(10)} → ${out}  ${pdf.length} bytes  validPDF=${validPdf}  ₹inHTML=${rupeeInHtml}`);
  }
  await browser.close();
  console.log('\nJSON:', JSON.stringify(results));
}
main().catch(e => { console.error(e); process.exit(1); });
