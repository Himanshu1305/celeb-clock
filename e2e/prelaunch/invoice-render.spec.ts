/**
 * Suite I — invoice-render.spec.ts  (founder inventory 65-72)
 * NO payments, NO invoice-counter mutation. Imports generateInvoiceHTML directly
 * and asserts on the rendered HTML for three tax modes. (73 proven in Studio.)
 */
import { test, expect } from '@playwright/test';
import { generateInvoiceHTML, type InvoiceRecord } from '../../src/lib/invoice-generator';

const REGD_ADDRESS = 'A206, Aparna Sarovar Zenith';   // must appear ONCE (footer only)
const GSTIN = '36AAJFU0315K1Z5';
const LLPIN = 'ACR-6615';

const base = {
  invoice_date: '2026-07-30',
  order_id: 'order_TEST', payment_id: 'pay_TEST',
  buyer_name: 'Test Buyer', buyer_email: 'buyer@example.com',
  buyer_gstin: null,
  line_items: [{ desc: 'BornClock Birthday Blueprint', qty: 1, gross: 199 }],
};

const cgst: InvoiceRecord = {
  ...base, invoice_no: 'BC/26-27/1001',
  buyer_country: 'India', buyer_state: 'Telangana', buyer_state_code: '36',
  place_of_supply: 'Telangana (36)',
  tax_mode: 'CGST_SGST', currency: 'INR', fx_rate: null,
  gross_amount: 199, taxable_value: 168.64, cgst: 15.18, sgst: 15.18, igst: 0,
};

const igst: InvoiceRecord = {
  ...base, invoice_no: 'BC/26-27/1002', payment_id: 'pay_TEST_IGST',
  buyer_country: 'India', buyer_state: 'Karnataka', buyer_state_code: '29',
  place_of_supply: 'Karnataka (29)',
  tax_mode: 'IGST', currency: 'INR', fx_rate: null,
  gross_amount: 199, taxable_value: 168.64, cgst: 0, sgst: 0, igst: 30.36,
};

const exp: InvoiceRecord = {
  ...base, invoice_no: 'BX/26-27/1001', payment_id: 'pay_TEST_EXPORT',
  buyer_country: 'United States', buyer_state: null, buyer_state_code: null,
  place_of_supply: 'United States',
  tax_mode: 'EXPORT', currency: 'USD', fx_rate: 83,
  gross_amount: 6.99, taxable_value: 6.99, cgst: 0, sgst: 0, igst: 0,
  line_items: [{ desc: 'BornClock Birthday Blueprint', qty: 1, gross: 6.99 }],
};

function occurrences(hay: string, needle: string): number {
  return hay.split(needle).length - 1;
}

test('supplier block: GSTIN + LLPIN + limited-liability, address only in footer (once)', () => {
  const html = generateInvoiceHTML(cgst);
  expect(html).toContain(GSTIN);
  expect(html).toContain(LLPIN);
  expect(html).toContain('Registered with limited liability');
  // The registered address appears exactly once — in the footer, not the supplier block.
  expect(occurrences(html, REGD_ADDRESS)).toBe(1);
  expect(html).toContain('Registered office:');
});

test('CGST invoice: 168.64 / 15.18 / 15.18 → ₹199.00, invoice_no BC/26-27/1001', () => {
  const html = generateInvoiceHTML(cgst);
  expect(html).toContain('168.64');
  expect(occurrences(html, '15.18')).toBeGreaterThanOrEqual(2);   // CGST + SGST
  expect(html).toContain('₹199.00');
  expect(html).toContain('BC/26-27/1001');
  expect(html).toContain('CGST');
  expect(html).toContain('SGST');
});

test('IGST invoice: 30.36 IGST, no CGST/SGST rows', () => {
  const html = generateInvoiceHTML(igst);
  expect(html).toContain('30.36');
  expect(html).toContain('IGST');
  expect(html).not.toContain('CGST @ 9%');
  expect(html).toContain('₹199.00');
});

test('EXPORT invoice: zero tax + LUT ARN, USD, BX/26-27/1001', () => {
  const html = generateInvoiceHTML(exp);
  expect(html).toContain('AD360726011878N');   // LUT ARN
  expect(html).toContain('BX/26-27/1001');
  expect(html).toContain('$6.99');
  expect(html.toLowerCase()).toContain('export');
  // No positive tax figures.
  expect(html).not.toContain('30.36');
  expect(html).not.toContain('15.18');
});

test('amount in words matches the gross', () => {
  expect(generateInvoiceHTML(cgst)).toContain('One Hundred Ninety Nine');
  expect(generateInvoiceHTML(exp)).toMatch(/Six.*Ninety Nine|US Dollars Six/);
});
