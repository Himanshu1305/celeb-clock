// Behavioural tests for the GST invoice HTML generator — focuses on the audit
// 2.6 FX-provenance change and on the footing invariant that every invoice
// must satisfy (taxable + cgst + sgst + igst == gross).
import { describe, it, expect } from 'vitest';
import { generateInvoiceHTML, type InvoiceRecord } from '../invoice-generator';

const base: InvoiceRecord = {
  invoice_no: 'BX/26-27/1001',
  invoice_date: '2026-08-28',
  order_id: 'order_TEST',
  payment_id: 'pay_TEST',
  buyer_name: 'Jane Doe',
  buyer_email: 'jane@example.com',
  buyer_gstin: null,
  buyer_country: 'United States',
  buyer_state: null,
  buyer_state_code: null,
  place_of_supply: 'United States',
  tax_mode: 'EXPORT',
  currency: 'USD',
  fx_rate: 87.2,
  gross_amount: 6.99,
  taxable_value: 6.99,
  cgst: 0, sgst: 0, igst: 0,
  line_items: [{ desc: 'BornClock — Birthday Blueprint Report', qty: 1, gross: 6.99 }],
};

describe('2.6 export FX provenance', () => {
  it('positive: renders the rate WITH its source and captured date', () => {
    const html = generateInvoiceHTML({
      ...base,
      fx_rate_date: '2026-08-28',
      fx_rate_source: 'Fixed fallback rate (₹87.20; no live FX feed yet)',
    });
    expect(html).toContain('1 USD = ₹87.20');
    expect(html).toContain('Fixed fallback rate');
    expect(html).toContain('as of 28 Aug 2026'); // fmtDate() of the source date
  });

  it('back-compat edge: an old row without provenance still renders the rate, no crash', () => {
    const html = generateInvoiceHTML(base); // no fx_rate_date / fx_rate_source
    expect(html).toContain('1 USD = ₹87.20');
    expect(html).not.toContain('as of');
    expect(html).not.toContain('undefined');
  });

  it('negative: a domestic invoice has no FX row at all', () => {
    const html = generateInvoiceHTML({
      ...base,
      invoice_no: 'BC/26-27/1001',
      tax_mode: 'CGST_SGST', currency: 'INR', fx_rate: null,
      buyer_country: 'India', buyer_state: 'Telangana', buyer_state_code: '36',
      place_of_supply: 'Telangana (36)',
      gross_amount: 199, taxable_value: 168.64, cgst: 15.18, sgst: 15.18, igst: 0,
      fx_rate_date: null, fx_rate_source: null,
      line_items: [{ desc: 'Report', qty: 1, gross: 199 }],
    });
    expect(html).not.toContain('FX rate');
    expect(html).not.toContain('1 USD');
  });
});

describe('footing invariant renders correctly', () => {
  it('CGST_SGST: taxable + cgst + sgst == gross', () => {
    const inv: InvoiceRecord = {
      ...base,
      invoice_no: 'BC/26-27/1001', tax_mode: 'CGST_SGST', currency: 'INR', fx_rate: null,
      buyer_country: 'India', buyer_state: 'Telangana', buyer_state_code: '36',
      place_of_supply: 'Telangana (36)',
      gross_amount: 299, taxable_value: 253.39, cgst: 22.81, sgst: 22.80, igst: 0,
      line_items: [{ desc: 'Monthly', qty: 1, gross: 299 }],
    };
    const foots = Math.round((inv.taxable_value as number + (inv.cgst as number) + (inv.sgst as number)) * 100) / 100;
    expect(foots).toBe(inv.gross_amount);
    const html = generateInvoiceHTML(inv);
    expect(html).toContain('₹299.00');   // grand total
    expect(html).toContain('CGST @ 9%');
    expect(html).toContain('SGST @ 9%');
  });

  it('EXPORT: zero-rated, taxable == gross, shows the LUT declaration', () => {
    const html = generateInvoiceHTML(base);
    expect(base.taxable_value).toBe(base.gross_amount);
    expect(html).toContain('Export under LUT');
    expect(html).toContain('$6.99');
  });
});
