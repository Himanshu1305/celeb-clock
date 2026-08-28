// Source-invariant guards for the August 2026 payments-audit fixes.
// These read the actual source so a future edit that reintroduces a bug fails CI,
// even though the Workers handlers themselves need a live DB to run end to end.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf8');
const verifyPayment = read('api/verify-payment.ts');
const webhook = read('api/razorpay-webhook.ts');
const useAuth = read('src/hooks/useAuth.ts');
const email = read('api/_email.ts');
const sendEmail = read('api/send-email.ts');
const emailService = read('src/services/EmailService.ts');
const admin = read('src/pages/Admin.tsx');
const pdf = read('api/_pdf.ts');

describe('2.2 premium grant keys on user_id (not the random id PK)', () => {
  it('positive: verify-payment subscription grant keys on user_id', () => {
    expect(verifyPayment).toMatch(/\.eq\('user_id',\s*user_id\)/);
  });
  it('negative: verify-payment never grants keyed on the random id PK', () => {
    // The bug was `.eq('id', user_id)` — it matched zero rows because profiles.id
    // is a random synthetic PK (id != user_id for every live row).
    expect(verifyPayment).not.toMatch(/\.eq\('id',\s*user_id\)/);
  });
  it('positive: webhook activated/charged grant keys on user_id', () => {
    expect(webhook).toMatch(/\.eq\('user_id',\s*userId\)/);
  });
  it('negative: webhook never grants keyed on id == userId', () => {
    expect(webhook).not.toMatch(/\.eq\('id',\s*userId\)/);
  });
  it('edge: webhook still updates by the real row PK where it first selected by subscription_id', () => {
    // The cancelled/expired/halted handlers legitimately select by subscription_id,
    // then update `.eq('id', profile.id)` using that row's real PK. Must NOT be
    // "corrected" — that would be wrong.
    expect(webhook).toMatch(/\.eq\('id',\s*profile\.id\)/);
  });
  it('consistency: the grant column matches the read column (both user_id)', () => {
    // useAuth reads premium keyed on user_id; the grant must use the same column.
    expect(useAuth).toMatch(/\.eq\('user_id',\s*session\.user\.id\)/);
  });
});

describe('2.3 webhook returns 5xx when it cannot record the event (idempotency not in place)', () => {
  it('positive: a non-23505 insert failure returns 500 so Razorpay retries', () => {
    // Between the 23505 (duplicate → 200) branch and the switch, a failed record
    // must return 500, not fall through and process an unguarded event.
    const between = webhook.slice(webhook.indexOf("insertErr.code === '23505'"), webhook.indexOf('switch (eventType)'));
    expect(between).toMatch(/return json\([^)]*,\s*500\)/);
  });
  it('negative: the old "Proceed anyway" fall-through is gone', () => {
    expect(webhook).not.toMatch(/Proceed anyway/);
  });
});

describe('2.4 dead payment-email templates removed; live one relabelled', () => {
  it('negative: dead template functions are gone', () => {
    expect(email).not.toMatch(/function paymentConfirmationEmail/);
    expect(email).not.toMatch(/function paymentReceiptEmail/);
  });
  it('negative: dead router types are gone from VALID_TYPES', () => {
    expect(sendEmail).not.toMatch(/payment_confirmation/);
    expect(sendEmail).not.toMatch(/payment_receipt/);
  });
  it('negative: dead router cases are gone from _email.ts', () => {
    expect(email).not.toMatch(/case 'payment_confirmation'/);
    expect(email).not.toMatch(/case 'payment_receipt'/);
  });
  it('negative: EmailService no longer exposes sendPaymentConfirmation', () => {
    expect(emailService).not.toMatch(/sendPaymentConfirmation/);
  });
  it('positive: a real post-payment email type still exists (premium_activated)', () => {
    expect(sendEmail).toMatch(/premium_activated/);
    expect(email).toMatch(/case 'premium_activated'/);
  });
  it('positive/negative: Admin lists premium_activated, not the dead payment_confirmation', () => {
    expect(admin).toMatch(/premium_activated/);
    expect(admin).not.toMatch(/payment_confirmation/);
  });
});

describe('2.5 PDF fallback raises an ops alert on genuine render outages only', () => {
  it('positive: imports sendOpsAlert and defines a throttled outage alerter', () => {
    expect(pdf).toMatch(/import\s*\{\s*sendOpsAlert\s*\}\s*from\s*'\.\/_ops\.js'/);
    expect(pdf).toMatch(/function alertPdfOutage/);
    expect(pdf).toMatch(/pdfOutageAlerted/); // once-per-isolate throttle
  });
  it('positive: alert fires on HTTP error, non-PDF body, and exception/timeout', () => {
    expect(pdf).toMatch(/alertPdfOutage\(`HTTP \$\{resp\.status\}`/);
    expect(pdf).toMatch(/alertPdfOutage\(`non-PDF body/);
    expect(pdf).toMatch(/alertPdfOutage\(reason, label\)/);
  });
  it('negative: alert does NOT fire on the expected missing-creds path', () => {
    // The missing-token early return must stay a plain warn+return (no alert),
    // else preview/local envs (no BROWSER_RENDERING_TOKEN) would spam ops.
    const credsBlock = pdf.slice(pdf.indexOf('if (!token || !accountId)'), pdf.indexOf('const url ='));
    expect(credsBlock).not.toMatch(/alertPdfOutage/);
  });
});
