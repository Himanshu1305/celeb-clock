// Sends the GST tax invoice as an .html attachment via Resend.
// Web APIs only (Cloudflare Workers). Mirrors the Resend direct-fetch pattern in
// api/_email.ts. No `env` param — reads process.env like the rest of the API.

const FROM_EMAIL = 'BornClock <hello@bornclock.com>';

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
  const body = `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E6D8B8;border-radius:12px;padding:28px">
      <div style="font-weight:800;color:#103A5C;font-size:20px;margin-bottom:2px">BornClock</div>
      <div style="font-size:11px;color:#B8862F;font-weight:600;margin-bottom:16px">A product of USD Vision AI LLP</div>
      <p style="font-size:14px;color:#0C1A2B;margin:0 0 12px">Thank you for your purchase. Your GST tax invoice <strong>${safeNo}</strong> is attached as an HTML file — open it in any browser and print or save it as a PDF.</p>
      <p style="font-size:13px;color:#5A6A7A;margin:0">Questions? Reply to this email or write to <a href="mailto:hello@bornclock.com" style="color:#103A5C">hello@bornclock.com</a>.</p>
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
        attachments: [{ filename: `${safeNo}.html`, content: base64Utf8(html) }],
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
