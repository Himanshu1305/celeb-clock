// Sends the GST tax invoice via Resend. Attaches a REAL PDF (rendered by the
// Cloudflare Browser Rendering path in ./_pdf) when available, and falls back to
// the HTML attachment on any rendering failure — the email always sends.
// Web APIs only (Cloudflare Workers). Mirrors the Resend direct-fetch pattern in
// api/_email.ts. No `env` param — reads process.env like the rest of the API.
import { renderPdfFromHtml, bytesToBase64 } from './_pdf.js';

const FROM_EMAIL = 'BornClock <hello@bornclock.com>';
const LOGO_URL = 'https://bornclock.com/bornclock-logo.png';

// UTF-8-safe base64. btoa() alone throws on ₹/—/… (non-Latin1) — the invoice HTML
// contains them — so encode to UTF-8 bytes first, then base64 in chunks.
function base64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

// Shared attachment builder — renders a real PDF (Cloudflare Browser Rendering) and
// falls back to the HTML attachment on ANY rendering failure. The attachLine copy
// always matches the file actually attached. Reused by BOTH sends below so the
// attachment logic is defined once.
async function buildInvoiceAttachment(invoiceNo: string, html: string): Promise<{
  attachment: { filename: string; content: string };
  attachLine: string;
}> {
  const safeNo = invoiceNo.replace(/\//g, '-');
  const pdf = await renderPdfFromHtml(html, invoiceNo);
  const attachment = pdf
    ? { filename: `${safeNo}.pdf`, content: bytesToBase64(pdf) }
    : { filename: `${safeNo}.html`, content: base64Utf8(html) };
  const attachLine = pdf
    ? `Your GST tax invoice <strong>${safeNo}</strong> is attached as a PDF — open it in any PDF viewer.`
    : `Your GST tax invoice <strong>${safeNo}</strong> is attached as an HTML file — open it in any browser and print or save it as a PDF.`;
  return { attachment, attachLine };
}

async function resendSend(payload: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.error('[invoice-email] RESEND_API_KEY not configured'); return; }
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, ...payload }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      console.error('[invoice-email] Resend error:', err);
    }
  } catch (e) {
    console.error('[invoice-email] send error:', e);
  }
}

// Renewal-sweep invoice email (api/invoice-sweep.ts) — UNCHANGED behaviour.
export async function sendInvoiceEmail(to: string, invoiceNo: string, html: string): Promise<void> {
  if (!to) { console.error('[invoice-email] no recipient'); return; }
  const { attachment, attachLine } = await buildInvoiceAttachment(invoiceNo, html);
  const body = `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto">
      <div style="text-align:center;padding-bottom:20px">
        <img src="${LOGO_URL}" alt="BornClock" height="44" width="165" style="height:44px;width:165px;display:inline-block;border:0" border="0" />
      </div>
      <div style="background:#fff;border:1px solid #E6D8B8;border-radius:12px;padding:28px">
        <div style="font-size:11px;color:#B8862F;font-weight:600;margin-bottom:16px">A product of USD Vision AI LLP</div>
        <p style="font-size:14px;color:#0C1A2B;margin:0 0 12px">Thank you for your purchase. ${attachLine}</p>
        <p style="font-size:13px;color:#5A6A7A;margin:0">Questions? Reply to this email or write to <a href="mailto:hello@bornclock.com" style="color:#103A5C">hello@bornclock.com</a>.</p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;font-style:italic;margin:18px 0 0">Know your time. Live it well.</p>
    </div></body></html>`;
  await resendSend({ to: [to], subject: `Your BornClock invoice – ${invoiceNo}`, html: body, attachments: [attachment] });
}

// ONE merged purchase email (BATCH-6 Phase 2): confirmation/receipt + the GST invoice
// attached, for both one-time reports and first subscription payments. If the invoice
// couldn't be issued (invoiceNo/invoiceHtml absent), the customer STILL receives a
// confirmation — without an attachment. Reuses buildInvoiceAttachment, never duplicates it.
// Pure subject decision (exported for tests — no send, so it can never email anyone):
// product-appropriate, references the invoice when one was issued, falls back to a
// confirmation-only subject when invoicing failed (the failure-isolation branch).
export function purchaseEmailSubject(product: string, invoiceNo?: string): string {
  const isReport = product === 'birthday_report';
  return invoiceNo
    ? (isReport
        ? `Payment confirmed — your BornClock invoice ${invoiceNo}`
        : `Welcome to Premium — your BornClock invoice ${invoiceNo}`)
    : (isReport ? 'Payment confirmed — your BornClock Birthday Blueprint' : 'Welcome to BornClock Premium');
}

// Whether the single email carries the invoice attachment (only when it was issued).
export function purchaseEmailHasAttachment(invoiceNo?: string, invoiceHtml?: string): boolean {
  return !!(invoiceNo && invoiceHtml);
}

export async function sendPurchaseEmail(opts: {
  to: string;
  name: string;
  product: string;              // 'birthday_report' | 'subscription'
  amountFormatted: string;
  date: string;
  reportLink?: string;
  invoiceNo?: string;
  invoiceHtml?: string;
}): Promise<void> {
  const { to, name, product, amountFormatted, date, reportLink, invoiceNo, invoiceHtml } = opts;
  if (!to) { console.error('[purchase-email] no recipient'); return; }

  const isReport = product === 'birthday_report';
  const productLabel = isReport ? 'Birthday Blueprint report' : 'BornClock Premium';

  // Attachment is best-effort: present only when the invoice was issued.
  let attachments: { filename: string; content: string }[] | undefined;
  let attachLine: string;
  if (purchaseEmailHasAttachment(invoiceNo, invoiceHtml)) {
    const built = await buildInvoiceAttachment(invoiceNo!, invoiceHtml!);
    attachments = [built.attachment];
    attachLine = built.attachLine;
  } else {
    attachLine = 'Your GST tax invoice will follow by email shortly.';
  }

  const subject = purchaseEmailSubject(product, invoiceNo);

  const intro = isReport
    ? (reportLink
        ? `Your Birthday Blueprint is ready — open it any time at <a href="${reportLink}" style="color:#103A5C">${reportLink}</a>. The link stays live for 12 months.`
        : 'Your Birthday Blueprint is ready in your account.')
    : 'Welcome to BornClock Premium — your subscription is active, including the Longevity Coach and every premium feature.';

  const body = `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto">
      <div style="text-align:center;padding-bottom:20px">
        <img src="${LOGO_URL}" alt="BornClock" height="44" width="165" style="height:44px;width:165px;display:inline-block;border:0" border="0" />
      </div>
      <div style="background:#fff;border:1px solid #E6D8B8;border-radius:12px;padding:28px">
        <div style="display:inline-block;font-size:12px;color:#1a7f37;font-weight:700;background:#e7f6ec;border-radius:999px;padding:4px 12px;margin-bottom:16px">Payment confirmed ✓</div>
        <p style="font-size:15px;color:#0C1A2B;margin:0 0 12px">Hi ${name}, thank you for your purchase.</p>
        <p style="font-size:14px;color:#0C1A2B;margin:0 0 14px">${intro}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#0C1A2B;margin:0 0 14px">
          <tr><td style="padding:4px 0;color:#5A6A7A">Product</td><td style="padding:4px 0;text-align:right;font-weight:600">${productLabel}</td></tr>
          <tr><td style="padding:4px 0;color:#5A6A7A">Amount</td><td style="padding:4px 0;text-align:right;font-weight:600">${amountFormatted}</td></tr>
          <tr><td style="padding:4px 0;color:#5A6A7A">Date</td><td style="padding:4px 0;text-align:right;font-weight:600">${date}</td></tr>
        </table>
        <p style="font-size:14px;color:#0C1A2B;margin:0 0 12px">${attachLine}</p>
        <p style="font-size:13px;color:#5A6A7A;margin:0">Questions? Reply to this email or write to <a href="mailto:hello@bornclock.com" style="color:#103A5C">hello@bornclock.com</a>.</p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;font-style:italic;margin:18px 0 0">Know your time. Live it well.</p>
    </div></body></html>`;

  await resendSend({ to: [to], subject, html: body, ...(attachments ? { attachments } : {}) });
}
