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

export async function sendInvoiceEmail(to: string, invoiceNo: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.error('[invoice-email] RESEND_API_KEY not configured'); return; }
  if (!to) { console.error('[invoice-email] no recipient'); return; }

  const safeNo = invoiceNo.replace(/\//g, '-');

  // Render a real PDF. NON-FATAL: null → attach the HTML exactly as before. The
  // email body copy branches on which attachment was actually used, so the text is
  // always truthful for the file the customer receives.
  const pdf = await renderPdfFromHtml(html, invoiceNo);
  const attachment = pdf
    ? { filename: `${safeNo}.pdf`, content: bytesToBase64(pdf) }
    : { filename: `${safeNo}.html`, content: base64Utf8(html) };
  const attachLine = pdf
    ? `Your GST tax invoice <strong>${safeNo}</strong> is attached as a PDF — open it in any PDF viewer.`
    : `Your GST tax invoice <strong>${safeNo}</strong> is attached as an HTML file — open it in any browser and print or save it as a PDF.`;

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

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: `Your BornClock invoice – ${invoiceNo}`,
        html: body,
        attachments: [attachment],
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      console.error('[invoice-email] Resend error:', err);
    }
  } catch (e) {
    console.error('[invoice-email] send error:', e);
  }
}
