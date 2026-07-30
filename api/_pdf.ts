// api/_pdf.ts — HTML → PDF via the Cloudflare Browser Rendering REST /pdf endpoint.
//
// No Worker binding and no wrangler.toml change — just an authenticated fetch. The
// account free plan includes a daily Browser Rendering allowance (see the report);
// invoice volume is a handful/day, well within any tier.
//
// renderPdfFromHtml returns the PDF bytes, or null on ANY failure (missing secrets,
// non-2xx, timeout, empty/non-PDF body). Callers MUST treat null as "fall back to
// the HTML attachment" — invoice delivery is a legal obligation and must never
// depend on a rendering service being up. Every failure logs '[invoice-pdf] fallback'
// with the reason.

const PDF_TIMEOUT_MS = 10_000;

export async function renderPdfFromHtml(html: string, label = 'invoice'): Promise<Uint8Array | null> {
  const token = process.env.BROWSER_RENDERING_TOKEN;
  const accountId = process.env.CF_ACCOUNT_ID;
  if (!token || !accountId) {
    console.warn(`[invoice-pdf] fallback: BROWSER_RENDERING_TOKEN/CF_ACCOUNT_ID not set (${label})`);
    return null;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        // PDF options are nested under `pdfOptions` (per the Browser Rendering REST
        // schema). A4, print backgrounds on, zero margins — the invoice HTML's own
        // @page{size:A4;margin:0} + .sheet padding govern the layout, and it sets
        // print-color-adjust:exact so the navy/gold backgrounds render.
        pdfOptions: {
          format: 'a4',
          printBackground: true,
          margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        },
      }),
      signal: AbortSignal.timeout(PDF_TIMEOUT_MS),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      console.error(`[invoice-pdf] fallback: Browser Rendering HTTP ${resp.status} (${label}) ${detail.slice(0, 200)}`);
      return null;
    }

    const buf = new Uint8Array(await resp.arrayBuffer());
    // A valid PDF begins with the "%PDF-" magic. Empty or JSON-error bodies fall back.
    const isPdf = buf.length > 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 && buf[4] === 0x2d;
    if (!isPdf) {
      console.error(`[invoice-pdf] fallback: response not a PDF (${label}, ${buf.length} bytes)`);
      return null;
    }
    return buf;
  } catch (e: any) {
    const reason = e?.name === 'TimeoutError' ? `timeout >${PDF_TIMEOUT_MS}ms` : (e?.message ?? String(e));
    console.error(`[invoice-pdf] fallback: ${reason} (${label})`);
    return null;
  }
}

// Base64 for BINARY bytes (PDF). btoa needs a binary string; large inputs overflow
// String.fromCharCode(...arr), so encode in chunks. (Distinct from _invoice-email's
// base64Utf8, which first UTF-8-encodes a string.)
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
